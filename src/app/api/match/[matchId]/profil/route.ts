export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const userId = session.user.id
  const { matchId } = params

  try {
    // Récupérer le match avec les utilisateurs et la conversation
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        user1: {
          select: {
            id: true,
            prenom: true,
            ville: true,
            pays: true,
            origine: true,
            photos: true,
            photoUrl: true,
            dateNaissance: true,
            questionnaireReponse: true,
          },
        },
        user2: {
          select: {
            id: true,
            prenom: true,
            ville: true,
            pays: true,
            origine: true,
            photos: true,
            photoUrl: true,
            dateNaissance: true,
            questionnaireReponse: true,
          },
        },
        conversation: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur fait partie du match
    if (match.user1Id !== userId && match.user2Id !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Vérifier le statut du match
    const allowedStatuses = ['ACCEPTE_MUTUEL', 'CHAT_OUVERT', 'IMAM_SESSION']
    if (!allowedStatuses.includes(match.status)) {
      return NextResponse.json(
        { error: 'Profil non accessible — match non mutuellement accepté' },
        { status: 403 }
      )
    }

    // Déterminer l'autre utilisateur (celui dont on affiche le profil)
    const otherUser = match.user1Id === userId ? match.user2 : match.user1
    const questionnaireReponse = otherUser.questionnaireReponse

    // Calculer l'âge
    const age = Math.floor(
      (Date.now() - new Date(otherUser.dateNaissance).getTime()) /
      (365.25 * 24 * 3600 * 1000)
    )

    // Parser les détails de dimension si disponible
    let explication = {
      explication: '',
      pointsForts: [] as string[],
      pointsAttention: [] as string[],
    }

    if (match.dimensionDetails) {
      try {
        const details = JSON.parse(match.dimensionDetails)
        if (details.explication) {
          explication = details.explication
        }
      } catch (e) {
        // Ignorer les erreurs de parsing JSON
      }
    }

    // Construire la réponse
    const response = {
      profil: {
        id: otherUser.id,
        prenom: otherUser.prenom,
        age,
        ville: otherUser.ville,
        pays: otherUser.pays,
        origine: otherUser.origine,
        photos: otherUser.photos,
        photoUrl: otherUser.photoUrl,
        questionnaire: {
          niveauPratique: questionnaireReponse?.niveauPratique,
          ecoleJurisprudentielle: questionnaireReponse?.ecoleJurisprudentielle,
          objectifMariage: questionnaireReponse?.objectifMariage,
          souhaitEnfants: questionnaireReponse?.souhaitEnfants,
          nombreEnfantsSouhaite: questionnaireReponse?.nombreEnfantsSouhaite,
          modeVieSouhaite: questionnaireReponse?.modeVieSouhaite,
          villeSouhaitee: questionnaireReponse?.villeSouhaitee,
          mobilitePossible: questionnaireReponse?.mobilitePossible,
          gestionConflits: questionnaireReponse?.gestionConflits,
          langageAmour: questionnaireReponse?.langageAmour,
          niveauExtraversion: questionnaireReponse?.niveauExtraversion,
          activitePhysique: questionnaireReponse?.activitePhysique,
          niveauEtudes: questionnaireReponse?.niveauEtudes,
          profession: questionnaireReponse?.profession,
          ambitionsPro: questionnaireReponse?.ambitionsPro,
          situationFinanciere: questionnaireReponse?.situationFinanciere,
          portVoile: questionnaireReponse?.portVoile,
          portBarbe: questionnaireReponse?.portBarbe,
          taille: questionnaireReponse?.taille,
          partenaireIdeal5Mots: questionnaireReponse?.partenaireIdeal5Mots,
          visionFoyer: questionnaireReponse?.visionFoyer,
          messageConjoint: questionnaireReponse?.messageConjoint,
          sourceBonheur: questionnaireReponse?.sourceBonheur,
        },
      },
      match: {
        id: match.id,
        scoreGlobal: match.scoreGlobal,
        forteCompatibilite: match.scoreGlobal >= 75,
        status: match.status,
        conversationId: match.conversation?.id,
        dimensions: {
          foi: match.scoresFoi,
          personnalite: match.scoresPersonalite,
          projetVie: match.scoresProjetVie,
          communication: match.scoresCommunication,
          styleVie: match.scoresStyleVie,
          carriere: match.scoresCarriere,
          physique: match.scoresPhysique,
        },
        explication,
      },
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur récupération profil:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
