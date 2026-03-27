import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const PLANS = {
  STANDARD: {
    priceId:           process.env.STRIPE_PRICE_STANDARD!,
    profilesParSemaine: 2,
  },
  PREMIUM: {
    priceId:           process.env.STRIPE_PRICE_PREMIUM!,
    profilesParSemaine: 3,
  },
}

// POST — Créer une session de paiement Stripe
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { plan } = await req.json() as { plan: 'STANDARD' | 'PREMIUM' }

    if (!PLANS[plan]) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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

    // Créer la session Checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      customer:     customerId,
      mode:         'subscription',
      line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
      success_url:  `${process.env.NEXTAUTH_URL}/tableau-de-bord?paiement=succes`,
      cancel_url:   `${process.env.NEXTAUTH_URL}/abonnement?paiement=annule`,
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
    console.error('Erreur Stripe:', error)
    return NextResponse.json({ error: 'Erreur Stripe' }, { status: 500 })
  }
}

// POST /api/stripe/webhook — Webhook Stripe
export async function PUT(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const { userId, plan } = session.metadata as { userId: string; plan: 'STANDARD' | 'PREMIUM' }

      if (userId && plan && PLANS[plan]) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan:               plan,
            profilesParSemaine: PLANS[plan].profilesParSemaine,
            stripeSubscriptionId: session.subscription as string,
          },
        })

        await prisma.subscription.create({
          data: {
            userId,
            plan,
            profilesParSemaine:  PLANS[plan].profilesParSemaine,
            stripeSubscriptionId: session.subscription as string,
            stripePriceId:       PLANS[plan].priceId,
            status:              'ACTIVE',
            currentPeriodStart:  new Date(),
            currentPeriodEnd:    new Date(Date.now() + 30 * 24 * 3600 * 1000),
          },
        })

        await prisma.notification.create({
          data: {
            userId,
            type:    'ABONNEMENT',
            titre:   `Abonnement ${plan} activé !`,
            contenu: `Votre abonnement ${plan} est actif. Vous recevez maintenant ${PLANS[plan].profilesParSemaine} profils/semaine.`,
          },
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub    = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan:               'GRATUIT',
            profilesParSemaine: 1,
            stripeSubscriptionId: null,
          },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
