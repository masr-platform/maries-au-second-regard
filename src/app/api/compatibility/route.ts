// ══════════════════════════════════════════════════════════════════
// API Compatibility — Score + Explication IA en langage humain
// GET /api/compatibility → renvoie les matchs avec explications
// POST /api/compatibility → force le recalcul + génère explication
// ══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  genererExplicationCompatibilite,
  genererEmbedding,
  type ExplicationCompatibilite,
} from '@/lib/ai-matching'

// ─── GET /api/compatibility ────────────────────────────────────────
// Retourne les matchs existants avec scores détaillés + explication IA
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    // Charger les matchs actifs avec les profils des deux utilisateurs
    const matchs = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: { not: 'FERME' },
      },
      include: {
        user1: {
          select: {
            id: true, prenom: true, ville: true, photoUrl: true, dateNaissance: true,
            questionnaireReponse: true,
          },
        },
        user2: {
          select: {
            id: true, prenom: true, ville: true, photoUrl: true, dateNaissance: true,
            questionnaireReponse: true,
          },
        },
      },
      orderBy: { scoreGlobal: 'desc' },
    })

    // Pour chaque match, générer l'explication si absente
    const resultats = await Promise.all(
      matchs.map(async (match: {
        id: string; user1Id: string; user2Id: string;
        scoreGlobal: number; scoresFoi: number; scoresPersonalite: number;
        scoresProjetVie: number; scoresCommunication: number; scoresStyleVie: number;
        scoresCarriere: number; scoresPhysique: number; dimensionDetails: string | null;
        status: string; user1Reponse: string; user2Reponse: string; proposedAt: Date;
        user1: { id: string; prenom: string; ville: string | null; photoUrl: string | null; dateNaissance: Date; questionnaireReponse: unknown };
        user2: { id: string; prenom: string; ville: string | null; photoUrl: string | null; dateNaissance: Date; questionnaireReponse: unknown };
      }) => {
        const autreUser = match.user1Id === userId ? match.user2 : match.user1
        const maReponse = match.user1Id === userId ? match.user1Reponse : match.user2Reponse
        const autreReponse = match.user1Id === userId ? match.user2Reponse : match.user1Reponse

        // Dimensions
        const dimensions = {
          foi:           match.scoresFoi,
          personnalite:  match.scoresPersonalite,
          projetVie:     match.scoresProjetVie,
          communication: match.scoresCommunication,
          styleVie:      match.scoresStyleVie,
          carriere:      match.scoresCarriere,
          physique:      match.scoresPhysique,
        }

        // Lire l'explication depuis dimensionDetails si déjà générée
        let explication: ExplicationCompatibilite | null = null
        if (match.dimensionDetails) {
          try {
            const details = JSON.parse(match.dimensionDetails)
            if (details.explication) explication = details.explication
          } catch {}
        }

        // Générer l'explication si absente et que les deux profils ont un questionnaire
        if (!explication && match.user1.questionnaireReponse && match.user2.questionnaireReponse) {
          explication = await genererExplicationCompatibilite(
            match.user1.questionnaireReponse,
            match.user2.questionnaireReponse,
            dimensions
          )

          // Sauvegarder dans dimensionDetails pour ne pas régénérer
          const detailsExistants = match.dimensionDetails
            ? JSON.parse(match.dimensionDetails)
            : {}

          await prisma.match.update({
            where: { id: match.id },
            data: {
              dimensionDetails: JSON.stringify({
                ...detailsExistants,
                explication,
              }),
            },
          })
        }

        // Âge de l'interlocuteur
        const age = autreUser.dateNaissance
          ? Math.floor((Date.now() - new Date(autreUser.dateNaissance).getTime()) / (365.25 * 24 * 3600 * 1000))
          : null

        return {
          matchId:   match.id,
          scoreGlobal: Math.round(match.scoreGlobal),
          forteCompatibilite: match.scoreGlobal >= 75,
          status:    match.status,
          maReponse,
          autreReponse,
          proposedAt: match.proposedAt,

          profil: {
            id:       autreUser.id,
            prenom:   autreUser.prenom,
            age,
            ville:    autreUser.ville,
            photoUrl: autreUser.photoUrl,
            infos: autreUser.questionnaireReponse ? {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              niveauPratique:  (autreUser.questionnaireReponse as any).niveauPratique ?? null,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              objectifMariage: (autreUser.questionnaireReponse as any).objectifMariage ?? null,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              niveauEtudes:    (autreUser.questionnaireReponse as any).niveauEtudes ?? null,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              profession:      (autreUser.questionnaireReponse as any).profession ?? null,
            } : null,
          },

          dimensions,
          explication: explication ?? {
            explication: 'Votre compatibilité repose sur des valeurs partagées.',
            pointsForts: [],
            pointsAttention: [],
          },
        }
      })
    )

    return NextResponse.json({ resultats, total: resultats.length })

  } catch (error) {
    console.error('Erreur /api/compatibility GET:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── POST /api/compatibility ───────────────────────────────────────
// Génère l'embedding du profil utilisateur + recalcule les matchs
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const reponses = await prisma.questionnaireReponse.findUnique({
      where: { userId },
    })

    if (!reponses) {
      return NextResponse.json({ error: 'Questionnaire non complété' }, { status: 403 })
    }

    // Générer/mettre à jour l'embedding
    const embedding = await genererEmbedding(reponses)
    await prisma.questionnaireReponse.update({
      where: { userId },
      data: {
        embeddingVector: JSON.stringify(embedding),
        embeddingUpdatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Profil vectorisé. Le matching IA utilisera maintenant vos réponses complètes.',
    })

  } catch (error) {
    console.error('Erreur /api/compatibility POST:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
