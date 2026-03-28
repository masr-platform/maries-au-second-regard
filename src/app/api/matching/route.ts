// API Matching — Proposer des profils compatibles
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { trouverMeilleursMatchs } from '@/lib/ai-matching'

// GET — Obtenir les propositions de la semaine
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    // Vérifier que le questionnaire est complété
    if (!session.user.questionnaireCompleted) {
      return NextResponse.json({
        error: 'Questionnaire incomplet',
        redirect: '/questionnaire',
      }, { status: 403 })
    }

    // Récupérer les matchs existants proposés cette semaine
    const debutSemaine = new Date()
    debutSemaine.setDate(debutSemaine.getDate() - 7)

    const matchsExistants = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        proposedAt: { gte: debutSemaine },
        status: { not: 'FERME' },
      },
      include: {
        user1: {
          select: {
            id: true, prenom: true, ville: true, photoUrl: true,
            questionnaireReponse: {
              select: {
                niveauPratique: true,
                objectifMariage: true,
                niveauEtudes: true,
                activitePhysique: true,
              },
            },
          },
        },
        user2: {
          select: {
            id: true, prenom: true, ville: true, photoUrl: true,
            questionnaireReponse: {
              select: {
                niveauPratique: true,
                objectifMariage: true,
                niveauEtudes: true,
                activitePhysique: true,
              },
            },
          },
        },
      },
    })

    // Formater pour l'affichage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propositions = matchsExistants.map((match: any) => {
      const autreUser = match.user1Id === userId ? match.user2 : match.user1
      const maReponse = match.user1Id === userId ? match.user1Reponse : match.user2Reponse

      return {
        matchId:       match.id,
        scoreGlobal:   match.scoreGlobal,
        forteCompatibilite: match.scoreGlobal >= 75,
        status:        match.status,
        maReponse,
        proposedAt:    match.proposedAt,
        profil: {
          id:            autreUser.id,
          prenom:        autreUser.prenom,
          ville:         autreUser.ville,
          photoUrl:      autreUser.photoUrl,
          infos:         autreUser.questionnaireReponse,
        },
        dimensions: {
          foi:           match.scoresFoi,
          personnalite:  match.scoresPersonalite,
          projetVie:     match.scoresProjetVie,
          communication: match.scoresCommunication,
          styleVie:      match.scoresStyleVie,
        },
      }
    })

    return NextResponse.json({ propositions })

  } catch (error) {
    console.error('Erreur récupération matchs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST — Déclencher le calcul de nouveaux matchs
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profilesParSemaine: true,
        questionnaireCompleted: true,
        dernierePropositionAt: true,
        propositionsEnCours: true,
      },
    })

    if (!user?.questionnaireCompleted) {
      return NextResponse.json({ error: 'Questionnaire non complété' }, { status: 403 })
    }

    // Vérifier le quota hebdomadaire
    const debutSemaine = new Date()
    debutSemaine.setDate(debutSemaine.getDate() - 7)

    const propositionsCetteSemaine = await prisma.match.count({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        proposedAt: { gte: debutSemaine },
      },
    })

    if (propositionsCetteSemaine >= user.profilesParSemaine) {
      return NextResponse.json({
        error: 'Quota hebdomadaire atteint',
        message: `Vous avez reçu vos ${user.profilesParSemaine} proposition(s) de la semaine. Revenez lundi prochain.`,
        prochaineLundi: getProchaineLundi(),
      }, { status: 429 })
    }

    // Trouver les meilleurs matchs
    const nombre = user.profilesParSemaine - propositionsCetteSemaine
    const meilleurs = await trouverMeilleursMatchs(userId, nombre)

    if (meilleurs.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Aucun profil compatible trouvé pour le moment. Notre équipe travaille à agrandir la communauté. Nous vous notifierons dès qu\'un profil correspondant s\'inscrit.',
      })
    }

    // Créer les matchs en base
    const matchesCrees = await Promise.all(
      meilleurs.map(async ({ userId: candidatId, score }) => {
        const [user1Id, user2Id] = [userId, candidatId].sort()
        return prisma.match.upsert({
          where: { user1Id_user2Id: { user1Id, user2Id } },
          create: {
            user1Id,
            user2Id,
            scoreGlobal:         score.scoreGlobal,
            scoresFoi:           score.dimensions.foi,
            scoresPersonalite:   score.dimensions.personnalite,
            scoresProjetVie:     score.dimensions.projetVie,
            scoresCommunication: score.dimensions.communication,
            scoresStyleVie:      score.dimensions.styleVie,
            scoresCarriere:      score.dimensions.carriere,
            scoresPhysique:      score.dimensions.physique,
            dimensionDetails:    JSON.stringify(score.dimensions),
            status:              'PROPOSE',
          },
          update: {},
        })
      })
    )

    // Notifier les utilisateurs
    await Promise.all(
      matchesCrees.map((match) => {
        const autreUserId = match.user1Id === userId ? match.user2Id : match.user1Id
        return prisma.notification.createMany({
          data: [
            {
              userId,
              type: 'NOUVEAU_MATCH',
              titre: 'Un profil compatible vous a été proposé !',
              contenu: `Notre IA a identifié un profil compatible à ${Math.round(match.scoreGlobal)}%. Découvrez-le maintenant.`,
              data: JSON.stringify({ matchId: match.id, score: match.scoreGlobal }),
            },
            {
              userId: autreUserId,
              type: 'NOUVEAU_MATCH',
              titre: 'Un profil compatible vous a été proposé !',
              contenu: `Notre IA a identifié un profil compatible à ${Math.round(match.scoreGlobal)}%. Découvrez-le maintenant.`,
              data: JSON.stringify({ matchId: match.id, score: match.scoreGlobal }),
            },
          ],
        })
      })
    )

    return NextResponse.json({
      success: true,
      nombrePropositions: matchesCrees.length,
      message: `${matchesCrees.length} profil(s) compatible(s) identifié(s).`,
    })

  } catch (error) {
    console.error('Erreur calcul matchs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/matching/[matchId]/repondre
// Accepter ou refuser un profil proposé

function getProchaineLundi(): string {
  const d = new Date()
  const jour = d.getDay()
  const joursRestants = (8 - jour) % 7 || 7
  d.setDate(d.getDate() + joursRestants)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}
