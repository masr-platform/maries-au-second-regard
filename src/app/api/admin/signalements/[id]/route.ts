export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!['ADMIN', 'SUPER_ADMIN', 'MODERATEUR'].includes(session?.user?.role || '')) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { action } = await req.json() as { action: 'dismiss' | 'warn' | 'block' }
  const convId = params.id

  try {
    const conv = await prisma.conversation.findUnique({
      where:   { id: convId },
      include: { user1: true, user2: true },
    })

    if (!conv) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
    }

    switch (action) {
      case 'dismiss':
        // Ignorer — retirer le flag
        await prisma.conversation.update({
          where: { id: convId },
          data:  { isFlagged: false, flagReason: null },
        })
        break

      case 'warn':
        // Avertir les deux utilisateurs
        await prisma.conversation.update({
          where: { id: convId },
          data:  { isFlagged: false },
        })
        await Promise.all([
          prisma.notification.create({
            data: {
              userId:  conv.user1Id,
              type:    'SYSTEME',
              titre:   '⚠️ Avertissement',
              contenu: 'Un comportement suspect a été détecté dans vos échanges. Tout partage de coordonnées est strictement interdit (CGU art. 5) sous peine de bannissement.',
            },
          }),
          prisma.notification.create({
            data: {
              userId:  conv.user2Id,
              type:    'SYSTEME',
              titre:   '⚠️ Avertissement',
              contenu: 'Un comportement suspect a été détecté dans vos échanges. Tout partage de coordonnées est strictement interdit (CGU art. 5) sous peine de bannissement.',
            },
          }),
        ])
        break

      case 'block':
        // Bloquer la conversation + bannir les deux
        await prisma.conversation.update({
          where: { id: convId },
          data:  { isBlocked: true, isFlagged: false },
        })
        await Promise.all([
          prisma.user.update({
            where: { id: conv.user1Id },
            data:  { isBanned: true, isSuspended: true },
          }),
          prisma.user.update({
            where: { id: conv.user2Id },
            data:  { isBanned: true, isSuspended: true },
          }),
          prisma.notification.create({
            data: {
              userId:  conv.user1Id,
              type:    'SYSTEME',
              titre:   '🚫 Compte banni',
              contenu: 'Votre compte a été banni suite à une violation grave des CGU (échange de coordonnées). Clause pénale applicable (article 1231-5 Code civil).',
            },
          }),
          prisma.notification.create({
            data: {
              userId:  conv.user2Id,
              type:    'SYSTEME',
              titre:   '🚫 Compte banni',
              contenu: 'Votre compte a été banni suite à une violation grave des CGU (échange de coordonnées). Clause pénale applicable (article 1231-5 Code civil).',
            },
          }),
        ])
        break

      default:
        return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }

    return NextResponse.json({ success: true, action, convId })
  } catch (error) {
    console.error('Erreur action signalement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
