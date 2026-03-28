import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — Récupérer ses notifications
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const notifications = await prisma.notification.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take:    50,
  })

  const nonLues = notifications.filter((n: { isRead: boolean }) => !n.isRead).length

  return NextResponse.json({ notifications, nonLues })
}

// PATCH — Marquer comme lues
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { ids, all } = body as { ids?: string[]; all?: boolean }

    if (all) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data:  { isRead: true, readAt: new Date() },
      })
    } else if (ids && ids.length > 0) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, id: { in: ids } },
        data:  { isRead: true, readAt: new Date() },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
