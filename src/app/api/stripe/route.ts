import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import { addProfilCredits } from '@/app/api/stripe/credits/route'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// ─── Définition des plans ────────────────────────────────────────────
const PLANS = {
  BASIQUE: {
    priceId:            process.env.STRIPE_PRICE_BASIQUE!,
    profilesParSemaine: 1,
    montant:            '19,00 €',
  },
  PREMIUM: {
    priceId:            process.env.STRIPE_PRICE_PREMIUM!,
    profilesParSemaine: 2,
    montant:            '39,00 €',
  },
  ULTRA: {
    priceId:            process.env.STRIPE_PRICE_ULTRA!,
    profilesParSemaine: 3,
    montant:            '69,00 €',
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

// ─── PUT — Webhook Stripe ────────────────────────────────────────────
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

    // ── Paiement complété (abonnement ou one-time) ──────────────────
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      // One-time (upsell crédits)
      if (session.mode === 'payment') {
        const { userId, pack } = session.metadata as { userId: string; pack: string }
        if (userId && pack) {
          await addProfilCredits(userId, pack as Parameters<typeof addProfilCredits>[1])
        }
        break
      }

      if (session.mode !== 'subscription') break

      const { userId, plan } = session.metadata as { userId: string; plan: PlanKey }

      if (userId && plan && PLANS[plan]) {
        const planData    = PLANS[plan]
        const nextBilling = new Date(Date.now() + 30 * 24 * 3600 * 1000)

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            profilesParSemaine:   planData.profilesParSemaine,
            stripeSubscriptionId: session.subscription as string,
          },
        })

        await prisma.subscription.create({
          data: {
            userId,
            plan,
            profilesParSemaine:   planData.profilesParSemaine,
            stripeSubscriptionId: session.subscription as string,
            stripePriceId:        planData.priceId,
            status:               'ACTIVE',
            currentPeriodStart:   new Date(),
            currentPeriodEnd:     nextBilling,
          },
        })

        await prisma.notification.create({
          data: {
            userId,
            type:    'ABONNEMENT',
            titre:   `Abonnement ${plan} activé !`,
            contenu: `Votre abonnement ${plan} est actif. Vous recevez ${planData.profilesParSemaine} profil(s)/semaine.`,
          },
        })

        const user = await prisma.user.findUnique({
          where:  { id: userId },
          select: { email: true, prenom: true },
        })

        if (user) {
          const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
          const nextStr = nextBilling.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

          await Promise.all([
            emailService.sendSubscriptionConfirm({
              email: user.email, prenom: user.prenom,
              plan, montant: planData.montant, nextBilling: nextStr,
            }),
            emailService.sendPaymentConfirm({
              email: user.email, prenom: user.prenom,
              montant: planData.montant, plan, date: dateStr,
            }),
          ])
        }
      }
      break
    }

    // ── Paiement échoué ─────────────────────────────────────────────
    case 'invoice.payment_failed': {
      const invoice    = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      const userRecord = await prisma.user.findFirst({
        where:  { stripeCustomerId: customerId },
        select: { id: true, email: true, prenom: true },
      })

      if (userRecord) {
        await prisma.subscription.updateMany({
          where: { userId: userRecord.id, status: 'ACTIVE' },
          data:  { status: 'PAST_DUE' },
        })
        await emailService.sendPaymentFailed({
          email: userRecord.email, prenom: userRecord.prenom,
        })
      }
      break
    }

    // ── Abonnement résilié ──────────────────────────────────────────
    case 'customer.subscription.deleted': {
      const sub    = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId

      if (userId) {
        const endDate = new Date(sub.current_period_end * 1000)
          .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan:                 'GRATUIT',
            profilesParSemaine:   1,
            stripeSubscriptionId: null,
          },
        })

        await prisma.subscription.updateMany({
          where: { userId, status: { in: ['ACTIVE', 'PAST_DUE'] } },
          data:  { status: 'CANCELLED', cancelledAt: new Date() },
        })

        const user = await prisma.user.findUnique({
          where:  { id: userId },
          select: { email: true, prenom: true },
        })
        if (user) {
          await emailService.sendSubscriptionCancelled({
            email: user.email, prenom: user.prenom, endDate,
          })
        }
      }
      break
    }

    // ── Renouvellement automatique ──────────────────────────────────
    case 'customer.subscription.updated': {
      const sub    = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId

      if (userId && sub.status === 'active') {
        const plan = sub.metadata?.plan as PlanKey

        if (plan && PLANS[plan]) {
          const nextBilling = new Date(sub.current_period_end * 1000)
            .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

          // Remettre à ACTIVE si PAST_DUE (paiement régularisé)
          await prisma.subscription.updateMany({
            where: { userId, status: 'PAST_DUE' },
            data:  { status: 'ACTIVE' },
          })

          const user = await prisma.user.findUnique({
            where:  { id: userId },
            select: { email: true, prenom: true },
          })

          if (user) {
            await emailService.sendSubscriptionRenewed({
              email: user.email, prenom: user.prenom,
              plan, montant: PLANS[plan].montant, nextBilling,
            })
          }
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
