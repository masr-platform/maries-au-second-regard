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
    const debutMois = new Date()
    debutMois.setDate(1)
    debutMois.setHours(0, 0, 0, 0)

    const debutJour = new Date()
    debutJour.setHours(0, 0, 0, 0)

    const prixPlan: Record<string, number> = {
      STANDARD: 19.90, BASIQUE: 19.90, PREMIUM: 29.90, ULTRA: 49.90,
    }

    const [
      totalUsers,
      nouveauxAujourdhui,
      totalMatchs,
      chatsOuverts,
      signalementsEnCours,
      questionnaireCompletes,
      usersBannis,
      subscriptionsActives,
      toutesSubscriptionsActives,
      subscriptionsMois,
      abonnementsParPlan,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: debutJour } } }),
      prisma.match.count(),
      prisma.match.count({ where: { status: 'CHAT_OUVERT' } }),
      prisma.conversation.count({ where: { isFlagged: true, isBlocked: false } }),
      prisma.user.count({ where: { questionnaireCompleted: true } }),
      prisma.user.count({ where: { isBanned: true } }),
      // Abonnements actifs ce mois
      prisma.subscription.count({ where: { status: 'ACTIVE', createdAt: { gte: debutMois } } }),
      // Tous les abonnements actifs (pour revenu récurrent)
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        select: { plan: true },
      }),
      // Abonnements créés ce mois avec détails
      prisma.subscription.findMany({
        where: { createdAt: { gte: debutMois } },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true, plan: true, status: true,
          createdAt: true, currentPeriodEnd: true, cancelAtPeriodEnd: true,
          user: { select: { id: true, prenom: true, email: true } },
        },
      }),
      // Comptage par plan
      prisma.subscription.groupBy({
        by: ['plan'],
        where: { status: 'ACTIVE' },
        _count: { plan: true },
      }),
    ])

    // Revenu mensuel récurrent réel
    const revenuMensuelReel = toutesSubscriptionsActives.reduce((sum, s) => {
      return sum + (prixPlan[s.plan] ?? 0)
    }, 0)

    // Revenu ce mois-ci (nouvelles souscriptions)
    const revenuMois = subscriptionsMois
      .filter(s => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + (prixPlan[s.plan] ?? 0), 0)

    // Répartition par plan
    const repartitionPlans = abonnementsParPlan.reduce((acc, g) => {
      acc[g.plan] = g._count.plan
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      totalUsers,
      nouveauxAujourdhui,
      totalMatchs,
      chatsouverts: chatsOuverts,
      signalementsEnCours,
      questionnaireCompletes,
      usersBannis,
      revenuMois: Math.round(revenuMois * 100) / 100,
      revenuMensuelReel: Math.round(revenuMensuelReel * 100) / 100,
      subscriptionsActives: toutesSubscriptionsActives.length,
      subscriptionsMois,
      repartitionPlans,
    })
  } catch (error) {
    console.error('Erreur stats admin:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
