// API Conversations — Liste des conversations actives de l'utilisateur
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        isBlocked: false,
      },
      include: {
        user1: {
          select: { id: true, prenom: true, photoUrl: true, lastActiveAt: true },
        },
        user2: {
          select: { id: true, prenom: true, photoUrl: true, lastActiveAt: true },
        },
        messages: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            isRead: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: userId },
                isDeleted: false,
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    })

    const result = conversations.map((conv) => {
      const interlocuteur = conv.user1Id === userId ? conv.user2 : conv.user1
      const dernierMessage = conv.messages[0] || null

      return {
        id: conv.id,
        matchId: conv.matchId,
        etape: conv.etape,
        isFlagged: conv.isFlagged,
        lastMessageAt: conv.lastMessageAt,
        messageCount: conv.messageCount,
        nonLus: conv._count.messages,
        interlocuteur: {
          id: interlocuteur.id,
          prenom: interlocuteur.prenom,
          photoUrl: interlocuteur.photoUrl,
          lastActiveAt: interlocuteur.lastActiveAt,
        },
        dernierMessage: dernierMessage
          ? {
              content: dernierMessage.content,
              senderId: dernierMessage.senderId,
              createdAt: dernierMessage.createdAt,
              isRead: dernierMessage.isRead,
              isMine: dernierMessage.senderId === userId,
            }
          : null,
      }
    })

    return NextResponse.json({ conversations: result })
  } catch (error) {
    console.error('Erreur récupération conversations:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
