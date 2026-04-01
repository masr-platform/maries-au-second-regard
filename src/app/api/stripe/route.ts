export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// ─── Plans Stripe — price IDs via variables d'environnement Vercel ───────────
// Vercel > Settings > Environment Variables :
//   STRIPE_PRICE_BASIQUE  → price ID Stripe du plan Essentiel  (19,90€/mois)
//   STRIPE_PRICE_PREMIUM  → price ID Stripe du plan Premium    (29,90€/mois)
//   STRIPE_PRICE_ULTRA    → price ID Stripe du plan Élite      (49,90€/mois)
// ─────────────────────────────────────────────────────────────────────────────
const PLANS = {
  BASIQUE: {
    envKey:             'STRIPE_PRICE_BASIQUE',
    priceId:            process.env.STRIPE_PRICE_BASIQUE ?? '',
    profilesParSemaine: 1,   // 1 profil/semaine
    montant:            '19,90 €',
    nom:                'Essentiel',
  },
  PREMIUM: {
    envKey:             'STRIPE_PRICE_PREMIUM',
    priceId:            process.env.STRIPE_PRICE_PREMIUM ?? '',
    profilesParSemaine: 7,   // 1 profil/jour × 7 jours
    montant:            '29,90 €',
    nom:                'Premium',
  },
  ULTRA: {
    envKey:             'STRIPE_PRICE_ULTRA',
    priceId:            process.env.STRIPE_PRICE_ULTRA ?? '',
    profilesParSemaine: 21,  // 3 profils/jour × 7 jours
    montant:            '49,90 €',
    nom:                'Élite',
  },
} as const

type PlanKey = keyof typeof PLANS

// ─── POST — Créer une session Checkout abonnement ─────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json() as { plan?: PlanKey }
    const plan = body.plan

    // ── 1. Validation du plan ────────────────────────────────────────────────
    if (!plan || !(plan in PLANS)) {
      console.error(`[STRIPE] Plan inconnu reçu: "${plan}"`)
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    const planData = PLANS[plan]

    // ── 2. Validation du price ID — log complet pour debug ──────────────────
    const priceId = planData.priceId
    const keyPrefix = (process.env.STRIPE_SECRET_KEY ?? '').substring(0, 14)

    console.log(
      `[STRIPE CHECKOUT] plan=${plan} | priceId=${priceId || '⚠️ VIDE'} | ` +
      `envKey=${planData.envKey} | stripeKey=${keyPrefix}...`
    )

    if (!priceId) {
      const msg = `Variable d'environnement manquante: ${planData.envKey}`
      console.error(`[STRIPE] ERREUR CONFIG: ${msg}`)
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    // ── 3. Customer Stripe ───────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { stripeCustomerId: true, email: true, prenom: true },
    })

    let customerId = user?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email:    user!.email,
        name:     user!.prenom,
        metadata: { userId: session.user.id },
      })
      customerId = customer.id

      await prisma.user.update({
        where: { id: session.user.id },
        data:  { stripeCustomerId: customerId },
      })

      console.log(`[STRIPE] Nouveau customer créé: ${customerId} pour userId=${session.user.id}`)
    }

    // ── 4. Créer la session Checkout ─────────────────────────────────────────
    console.log(`[STRIPE] Création session checkout: customer=${customerId} priceId=${priceId}`)

    const checkoutSession = await stripe.checkout.sessions.create({
      customer:   customerId,
      mode:       'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/tableau-de-bord?paiement=succes`,
      cancel_url:  `${process.env.NEXTAUTH_URL}/abonnement?paiement=annule`,
      metadata: {
        userId: session.user.id,
        plan,
      },
      subscription_data: {
        metadata: { userId: session.user.id, plan },
      },
      billing_address_collection: 'required',
      locale: 'fr',
    })

    console.log(`[STRIPE] Session checkout créée: ${checkoutSession.id} → ${checkoutSession.url}`)

    return NextResponse.json({ url: checkoutSession.url })

  } catch (error: unknown) {
    const stripeError = error as { message?: string; type?: string; code?: string }
    console.error('[STRIPE] Erreur checkout:', {
      message: stripeError?.message,
      type:    stripeError?.type,
      code:    stripeError?.code,
    })
    return NextResponse.json(
      { error: 'Erreur Stripe', detail: stripeError?.message ?? 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

// Webhook Stripe → voir /api/stripe/webhook/route.ts
