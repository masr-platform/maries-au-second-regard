export const dynamic = 'force-dynamic'

// ══════════════════════════════════════════════════════════════════
// PATCH /api/conversations/[convId]/charte
// L'utilisateur accepte la charte avant d'entrer dans le chat.
// Déclenche le compteur 72H si les DEUX ont accepté.
// ══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { convId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const conv = await prisma.conversation.findUnique({
      where: { id: params.convId },
      select: {
        id: true,
        user1Id: true,
        user2Id: true,
        charteAccepteeUser1: true,
        charteAccepteeUser2: true,
        expiresAt: true,
      },
    })

    if (!conv) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
    }

    if (conv.user1Id !== userId && conv.user2Id !== userId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const isUser1 = conv.user1Id === userId
    const now = new Date()

    // Marquer la charte comme acceptée pour cet utilisateur
    const updateData: Record<string, unknown> = isUser1
      ? { charteAccepteeUser1: true, charteAccepteeUser1At: now }
      : { charteAccepteeUser2: true, charteAccepteeUser2At: now }

    // Si l'autre a déjà accepté → démarrer le compteur 72H maintenant
    const autreAAccepte = isUser1 ? conv.charteAccepteeUser2 : conv.charteAccepteeUser1
    if (autreAAccepte && !conv.expiresAt) {
      // 72H = 72 * 60 * 60 * 1000 ms
      updateData.expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000)
    }

    const updated = await prisma.conversation.update({
      where: { id: params.convId },
      data: updateData as Parameters<typeof prisma.conversation.update>[0]['data'],
      select: {
        charteAccepteeUser1: true,
        charteAccepteeUser2: true,
        expiresAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      charteAcceptee: true,
      expiresAt: updated.expiresAt,
      lesDeuxOntAccepte: updated.charteAccepteeUser1 && updated.charteAccepteeUser2,
    })

  } catch (error) {
    console.error('Erreur acceptation charte:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
