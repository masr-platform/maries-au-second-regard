// ══════════════════════════════════════════════════════════════════
// GET /api/sessions/[sessionId]/token
// Génère un meeting token Daily.co personnalisé pour un participant.
// Le token est signé et à usage unique (expire avec la session).
// ══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createMeetingToken } from '@/lib/daily'

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const userId    = session.user.id
  const sessionId = params.sessionId

  try {
    const imamSession = await prisma.imamSession.findUnique({
      where: { id: sessionId },
      include: {
        imam:  { include: { user: { select: { id: true, prenom: true } } } },
        user1: { select: { id: true, prenom: true } },
        user2: { select: { id: true, prenom: true } },
      },
    })

    if (!imamSession) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est participant ou imam de cette session
    const isUser1     = imamSession.user1Id === userId
    const isUser2     = imamSession.user2Id === userId
    const isImamUser  = imamSession.imam.userId === userId

    if (!isUser1 && !isUser2 && !isImamUser) {
      return NextResponse.json({ error: 'Accès non autorisé à cette session' }, { status: 403 })
    }

    if (!imamSession.dailyRoomName) {
      return NextResponse.json({ error: 'Room vidéo non encore créée pour cette session' }, { status: 409 })
    }

    // Vérifier que la session n'est pas annulée ou terminée
    if (['ANNULE', 'TERMINE'].includes(imamSession.status)) {
      return NextResponse.json({ error: `Session ${imamSession.status.toLowerCase()}` }, { status: 410 })
    }

    // Déterminer le prénom du participant
    const prenom = isImamUser
      ? imamSession.imam.user.prenom
      : isUser1
        ? imamSession.user1.prenom
        : (imamSession.user2?.prenom ?? 'Participant')

    // L'expiration du token = fin de la session + 30 min de buffer
    const expiresAt = new Date(
      imamSession.scheduledAt.getTime() + imamSession.dureeMinutes * 60_000 + 30 * 60_000
    )

    const token = await createMeetingToken({
      roomName:  imamSession.dailyRoomName,
      userId,
      prenom,
      isHost:    isImamUser,  // Seul l'imam est host
      expiresAt,
    })

    return NextResponse.json({
      token,
      roomUrl:     imamSession.dailyRoomUrl,
      roomName:    imamSession.dailyRoomName,
      scheduledAt: imamSession.scheduledAt,
      dureeMinutes: imamSession.dureeMinutes,
    })

  } catch (error) {
    console.error('Erreur génération token Daily.co:', error)
    return NextResponse.json({ error: 'Impossible de générer le lien vidéo' }, { status: 500 })
  }
}
