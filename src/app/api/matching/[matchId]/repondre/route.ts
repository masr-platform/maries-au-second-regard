export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { reponse } = await req.json() as { reponse: 'ACCEPTE' | 'REJETE' }
  const userId = session.user.id

  try {
    const match = await prisma.match.findUnique({
      where: { id: params.matchId },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match non trouvé' }, { status: 404 })
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const isUser1 = match.user1Id === userId
    const autreUserId = isUser1 ? match.user2Id : match.user1Id

    // Mettre à jour la réponse
    const updatedMatch = await prisma.match.update({
      where: { id: params.matchId },
      data: {
        ...(isUser1
          ? { user1Reponse: reponse, user1ReponduAt: new Date() }
          : { user2Reponse: reponse, user2ReponduAt: new Date() }
        ),
      },
    })

    // Vérifier si les deux ont accepté
    const autreReponse = isUser1 ? updatedMatch.user2Reponse : updatedMatch.user1Reponse

    if (reponse === 'ACCEPTE' && autreReponse === 'ACCEPTE') {
      // MATCH MUTUEL — Ouvrir le chat
      await prisma.$transaction([
        prisma.match.update({
          where: { id: params.matchId },
          data: { status: 'CHAT_OUVERT', chatOuvertAt: new Date() },
        }),
        prisma.conversation.create({
          data: {
            matchId:  params.matchId,
            user1Id:  match.user1Id,
            user2Id:  match.user2Id,
            etape:    'PRESENTATION',
          },
        }),
        prisma.notification.createMany({
          data: [
            {
              userId: match.user1Id,
              type:   'MATCH_ACCEPTE',
              titre:  '🎉 Intérêt mutuel ! Le chat est ouvert.',
              contenu: 'Votre intérêt est partagé ! Vous pouvez maintenant échanger dans notre chat encadré.',
              data:    JSON.stringify({ matchId: params.matchId }),
            },
            {
              userId: match.user2Id,
              type:   'MATCH_ACCEPTE',
              titre:  '🎉 Intérêt mutuel ! Le chat est ouvert.',
              contenu: 'Votre intérêt est partagé ! Vous pouvez maintenant échanger dans notre chat encadré.',
              data:    JSON.stringify({ matchId: params.matchId }),
            },
          ],
        }),
      ])

      return NextResponse.json({
        success: true,
        status:  'CHAT_OUVERT',
        message: 'Intérêt mutuel ! Le chat est maintenant ouvert.',
      })
    }

    if (reponse === 'REJETE') {
      await prisma.match.update({
        where: { id: params.matchId },
        data:  { status: 'REJETE' },
      })

      // Notifier l'IA de chercher un nouveau profil pour les deux (sans révéler le refus)
      setImmediate(async () => {
        // L'autre utilisateur reçoit une nouvelle proposition dans le cycle suivant
        // Sans notification de refus pour préserver la dignité
      })
    }

    return NextResponse.json({ success: true, status: reponse })

  } catch (error) {
    console.error('Erreur réponse match:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
