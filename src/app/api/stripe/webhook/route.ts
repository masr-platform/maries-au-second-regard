import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import { addProfilCredits } from '@/lib/credits'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Aligné avec la page /abonnement :
//   BASIQUE  = 1 profil/semaine
//   PREMIUM  = 7 profils/semaine (1/jour)
//   ULTRA    = 21 profils/semaine (3/jour)
const PLANS = {
  BASIQUE: { profilesParSemaine: 1,  montant: '19,90 €' },
  PREMIUM: { profilesParSemaine: 7,  montant: '29,90 €' },
  ULTRA:   { profilesParSemaine: 21, montant: '49,90 €' },
} as const

type PlanKey = keyof typeof PLANS

// ─── POST — Webhook Stripe ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature invalide:', err)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  try {
    switch (event.type) {

      // ── Paiement complété ──────────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Achat one-time (crédits profils)
        if (session.mode === 'payment') {
          const { userId, pack } = session.metadata as { userId: string; pack: string }
          if (userId && pack) {
            await addProfilCredits(userId, pack as Parameters<typeof addProfilCredits>[1])
          }
          break
        }

        if (session.mode !== 'subscription') break

        const { userId, plan } = session.metadata as { userId: string; plan: PlanKey }
        if (!userId || !plan || !PLANS[plan]) break

        const planData    = PLANS[plan]
        const nextBilling = new Date(Date.now() + 30 * 24 * 3600 * 1000)

        // Mettre à jour l'utilisateur
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            profilesParSemaine:   planData.profilesParSemaine,
            stripeSubscriptionId: session.subscription as string,
          },
        })

        // Créer l'entrée subscription
        await prisma.subscription.create({
          data: {
            userId,
            plan,
            profilesParSemaine:   planData.profilesParSemaine,
            stripeSubscriptionId: session.subscription as string,
            stripePriceId:        session.metadata?.priceId ?? '',
            status:               'ACTIVE',
            currentPeriodStart:   new Date(),
            currentPeriodEnd:     nextBilling,
          },
        })

        // Notification in-app
        await prisma.notification.create({
          data: {
            userId,
            type:    'ABONNEMENT',
            titre:   `Abonnement ${plan} activé !`,
            contenu: `Votre abonnement est actif. Bienvenue dans Mariés au Second Regard.`,
          },
        })

        // Emails de confirmation
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
        break
      }

      // ── Paiement échoué ────────────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice    = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const userRecord = await prisma.user.findFirst({
          where:  { stripeCustomerId: customerId },
          select: { id: true, email: true, prenom: true },
        })
        if (!userRecord) break

        await prisma.subscription.updateMany({
          where: { userId: userRecord.id, status: 'ACTIVE' },
          data:  { status: 'PAST_DUE' },
        })

        await prisma.notification.create({
          data: {
            userId:  userRecord.id,
            type:    'ABONNEMENT',
            titre:   'Paiement échoué',
            contenu: 'Votre renouvellement a échoué. Mettez à jour votre moyen de paiement pour conserver votre accès.',
          },
        })

        await emailService.sendPaymentFailed({
          email: userRecord.email, prenom: userRecord.prenom,
        })
        break
      }

      // ── Abonnement résilié (depuis Stripe ou par l'utilisateur) ───────────
      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        const endDate = new Date(sub.current_period_end * 1000)
          .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan:                 'GRATUIT',
            profilesParSemaine:   0,
            stripeSubscriptionId: null,
          },
        })

        await prisma.subscription.updateMany({
          where: { userId, status: { in: ['ACTIVE', 'PAST_DUE'] } },
          data:  { status: 'CANCELLED', cancelledAt: new Date() },
        })

        await prisma.notification.create({
          data: {
            userId,
            type:    'ABONNEMENT',
            titre:   'Abonnement résilié',
            contenu: `Votre abonnement prend fin le ${endDate}. Vous pouvez vous réabonner à tout moment.`,
          },
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
        break
      }

      // ── Renouvellement / mise à jour abonnement ────────────────────────────
      case 'customer.subscription.updated': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        if (sub.status === 'active') {
          const plan = sub.metadata?.plan as PlanKey
          if (!plan || !PLANS[plan]) break

          const nextBilling = new Date(sub.current_period_end * 1000)

          // Remettre ACTIVE si PAST_DUE (paiement régularisé)
          await prisma.subscription.updateMany({
            where: { userId, status: { in: ['PAST_DUE', 'ACTIVE'] } },
            data:  {
              status:           'ACTIVE',
              currentPeriodEnd: nextBilling,
            },
          })

          await prisma.user.update({
            where: { id: userId },
            data:  { plan, profilesParSemaine: PLANS[plan].profilesParSemaine },
          })

          const nextStr = nextBilling.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
          const user    = await prisma.user.findUnique({
            where:  { id: userId },
            select: { email: true, prenom: true },
          })
          if (user) {
            await emailService.sendSubscriptionRenewed({
              email: user.email, prenom: user.prenom,
              plan, montant: PLANS[plan].montant, nextBilling: nextStr,
            })
          }
        }

        // Abonnement passé en statut d'attente de résiliation
        if (sub.status === 'canceled' || sub.cancel_at_period_end) {
          await prisma.subscription.updateMany({
            where: { userId, status: 'ACTIVE' },
            data:  { status: 'CANCELLED', cancelledAt: new Date() },
          })
        }
        break
      }

      // Événements ignorés (non critiques)
      default:
        break
    }
  } catch (err) {
    console.error(`Erreur traitement webhook ${event.type}:`, err)
    // Retourner 200 quand même pour éviter les retry Stripe en boucle
    return NextResponse.json({ received: true, warning: 'Erreur traitement interne' })
  }

  return NextResponse.json({ received: true })
}
