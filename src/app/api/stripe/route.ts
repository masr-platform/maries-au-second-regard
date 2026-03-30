import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// ─── Définition des plans ────────────────────────────────────────────
const PLANS = {
  BASIQUE: {
    priceId:            process.env.STRIPE_PRICE_BASIQUE!,
    profilesParSemaine: 1,
    montant:            '19,90 €',
  },
  PREMIUM: {
    priceId:            process.env.STRIPE_PRICE_PREMIUM!,
    profilesParSemaine: 2,
    montant:            '29,90 €',
  },
  ULTRA: {
    priceId:            process.env.STRIPE_PRICE_ULTRA!,
    profilesParSemaine: 3,
    montant:            '49,90 €',
  },
} as const

type PlanKey = keyof typeof PLANS

// ─── POST — Créer une session Checkout abonnement ────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { plan } = await req.json() as { plan: PlanKey }

    if (!PLANS[plan]) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { stripeCustomerId: true, email: true, prenom: true },
    })

    // Créer ou récupérer le customer Stripe
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
    }

    // Créer la session Checkout abonnement
    const checkoutSession = await stripe.checkout.sessions.create({
      customer:  customerId,
      mode:      'subscription',
      line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
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

    return NextResponse.json({ url: checkoutSession.url })

  } catch (error) {
    console.error('Erreur Stripe checkout:', error)
    return NextResponse.json({ error: 'Erreur Stripe' }, { status: 500 })
  }
}

// Webhook Stripe → voir /api/stripe/webhook/route.ts
