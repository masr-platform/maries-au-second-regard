export const dynamic = 'force-dynamic'

// ⚠️ ENDPOINT TEMPORAIRE — À SUPPRIMER APRÈS UTILISATION
// Permet d'activer manuellement un abonnement en cas de webhook manqué

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? 'masr-activate-2026'

// BASIQUE n'est pas encore dans l'enum DB → on mappe vers STANDARD (équivalent)
const PLAN_MAP: Record<string, string> = {
  BASIQUE: 'STANDARD',
  PREMIUM: 'PREMIUM',
  ULTRA:   'ULTRA',
}

const PLANS: Record<string, { profilesParSemaine: number }> = {
  BASIQUE: { profilesParSemaine: 1  },
  PREMIUM: { profilesParSemaine: 7  },
  ULTRA:   { profilesParSemaine: 21 },
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const email  = searchParams.get('email')
  const plan   = searchParams.get('plan') as string

  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  if (!email || !plan || !PLANS[plan]) {
    return NextResponse.json({ error: 'Params requis: email, plan (BASIQUE/PREMIUM/ULTRA)' }, { status: 400 })
  }

  try {
    const planData = PLANS[plan]

    // 1. Trouver l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: `Utilisateur introuvable: ${email}` }, { status: 404 })
    }

    // 2. Mettre à jour le plan — mapper BASIQUE→STANDARD si nécessaire
    const dbPlan = PLAN_MAP[plan] ?? plan
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan:               dbPlan as 'STANDARD' | 'PREMIUM' | 'ULTRA',
        profilesParSemaine: planData.profilesParSemaine,
      },
    })

    // 3. Annuler les anciennes subscriptions actives
    await prisma.subscription.updateMany({
      where:  { userId: user.id, status: 'ACTIVE' },
      data:   { status: 'CANCELLED', cancelledAt: new Date() },
    })

    // 4. Créer une nouvelle subscription active
    const now      = new Date()
    const nextMonth = new Date(now.getTime() + 30 * 24 * 3600 * 1000)
    const uniqueId  = `manual-${user.id}-${Date.now()}`

    await prisma.subscription.create({
      data: {
        userId:              user.id,
        plan:                dbPlan as 'STANDARD' | 'PREMIUM' | 'ULTRA',
        profilesParSemaine:  planData.profilesParSemaine,
        stripeSubscriptionId: uniqueId,
        stripePriceId:        '',
        status:               'ACTIVE',
        currentPeriodStart:   now,
        currentPeriodEnd:     nextMonth,
      },
    })

    // 5. Notification in-app
    await prisma.notification.create({
      data: {
        userId:  user.id,
        type:    'ABONNEMENT',
        titre:   `Abonnement ${plan} activé !`,
        contenu: `Votre abonnement est actif. Bienvenue dans Mariés au Second Regard.`,
      },
    })

    return NextResponse.json({
      success: true,
      message: `✅ Abonnement ${plan} activé pour ${email}`,
      plan,
      profilesParSemaine: planData.profilesParSemaine,
      periodEnd: nextMonth.toLocaleDateString('fr-FR'),
    })

  } catch (error: unknown) {
    const e = error as { message?: string }
    console.error('[ADMIN ACTIVATE]', e?.message, error)
    return NextResponse.json({ error: e?.message ?? 'Erreur inconnue' }, { status: 500 })
  }
}
