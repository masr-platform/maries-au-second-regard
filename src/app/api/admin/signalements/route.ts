export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!['ADMIN', 'SUPER_ADMIN', 'MODERATEUR'].includes(session?.user?.role || '')) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const signalements = await prisma.conversation.findMany({
      where: { isFlagged: true, isBlocked: false },
      include: {
        user1: { select: { prenom: true } },
        user2: { select: { prenom: true } },
        messages: {
          where: { isFlagged: true },
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            content: true,
            flagType: true,
            flagDetails: true,
            createdAt: true,
            sender: { select: { prenom: true } },
          },
        },
      },
      orderBy: { flaggedAt: 'desc' },
      take: 50,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = signalements.map((conv: any) => ({
      id:             conv.id,
      conversationId: conv.id,
      flagType:       conv.messages[0]?.flagType || 'AUTRE',
      flagDetails:    conv.flagReason || conv.messages[0]?.flagDetails || '',
      flaggedAt:      conv.flaggedAt?.toISOString(),
      user1:          { prenom: conv.user1.prenom },
      user2:          { prenom: conv.user2.prenom },
      messagesSignales: conv.messages,
    }))

    return NextResponse.json({ signalements: formatted })
  } catch (error) {
    console.error('Erreur signalements:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
