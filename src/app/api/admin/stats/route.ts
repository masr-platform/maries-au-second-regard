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
    const debutMois = new Date()
    debutMois.setDate(1)
    debutMois.setHours(0, 0, 0, 0)

    const debutJour = new Date()
    debutJour.setHours(0, 0, 0, 0)

    const [
      totalUsers,
      nouveauxAujourdhui,
      totalMatchs,
      chatsOuverts,
      signalementsEnCours,
      questionnaireCompletes,
      usersBannis,
      subscriptionsActives,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: debutJour } } }),
      prisma.match.count(),
      prisma.match.count({ where: { status: 'CHAT_OUVERT' } }),
      prisma.conversation.count({ where: { isFlagged: true, isBlocked: false } }),
      prisma.user.count({ where: { questionnaireCompleted: true } }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.subscription.count({ where: { status: 'ACTIVE', createdAt: { gte: debutMois } } }),
    ])

    // Revenu estimé (nombre d'abonnements × prix moyen)
    const revenuMois = subscriptionsActives * 22 // estimation moyenne Standard+Premium

    return NextResponse.json({
      totalUsers,
      nouveauxAujourdhui,
      totalMatchs,
      chatsouverts: chatsOuverts,
      signalementsEnCours,
      questionnaireCompletes,
      usersBannis,
      revenuMois,
    })
  } catch (error) {
    console.error('Erreur stats admin:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
