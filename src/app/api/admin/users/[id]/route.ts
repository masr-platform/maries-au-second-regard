import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!['ADMIN', 'SUPER_ADMIN', 'MODERATEUR'].includes(session?.user?.role || '')) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { action } = await req.json() as { action: 'verify' | 'suspend' | 'ban' | 'unban' }
  const userId = params.id

  try {
    switch (action) {
      case 'verify':
        await prisma.user.update({
          where: { id: userId },
          data:  { isVerified: true },
        })
        break

      case 'suspend':
        await prisma.user.update({
          where: { id: userId },
          data:  { isSuspended: true },
        })
        break

      case 'ban':
        await prisma.user.update({
          where: { id: userId },
          data:  { isBanned: true, isSuspended: true },
        })
        // Notifier l'utilisateur
        await prisma.notification.create({
          data: {
            userId,
            type:    'SYSTEME',
            titre:   'Compte suspendu',
            contenu: 'Votre compte a été suspendu suite à une violation des CGU. Contactez le support pour plus d\'informations.',
          },
        }).catch(() => {})
        break

      case 'unban':
        await prisma.user.update({
          where: { id: userId },
          data:  { isBanned: false, isSuspended: false },
        })
        break

      default:
        return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }

    return NextResponse.json({ success: true, action, userId })
  } catch (error) {
    console.error('Erreur action admin user:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
