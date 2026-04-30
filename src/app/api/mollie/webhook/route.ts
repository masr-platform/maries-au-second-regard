export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma }                    from '@/lib/prisma'
import { emailService }              from '@/lib/email'
import { createMollieClient }        from '@mollie/api-client'

const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY ?? '' })

const PLANS: Record<string, {
  profilesParSemaine: number
  montantLabel:       string
  intervalMollie:     string
}> = {
  BASIQUE: { profilesParSemaine: 1,  montantLabel: '19,90 €', intervalMollie: '1 month' },
  PREMIUM: { profilesParSemaine: 7,  montantLabel: '29,90 €', intervalMollie: '1 month' },
  ULTRA:   { profilesParSemaine: 21, montantLabel: '49,90 €', intervalMollie: '1 month' },
}

type PlanKey = keyof typeof PLANS

// ─── POST — Webhook Mollie ────────────────────────────────────────────────────
// Mollie envoie un POST avec un body form-urlencoded: id=tr_xxxx
export async function POST(req: NextRequest) {
  let paymentId: string

  try {
    const body = await req.text()
    const params = new URLSearchParams(body)
    paymentId = params.get('id') ?? ''
    if (!paymentId) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Body invalide' }, { status: 400 })
  }

  console.log(`[MOLLIE WEBHOOK] Reçu: id=${paymentId}`)

  // ── Récupérer le paiement depuis Mollie (vérification) ────────────────────
  let payment
  try {
    payment = await mollieClient.payments.get(paymentId)
  } catch (err) {
    console.error('[MOLLIE WEBHOOK] Impossible de récupérer le paiement:', err)
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 400 })
  }

  const metadata = typeof payment.metadata === 'string'
    ? JSON.parse(payment.metadata)
    : payment.metadata

  const userId = metadata?.userId as string
  const plan   = metadata?.plan   as PlanKey

  console.log(`[MOLLIE WEBHOOK] status=${payment.status} userId=${userId} plan=${plan}`)

  // ── Paiement initial réussi ───────────────────────────────────────────────
  if (payment.status === 'paid' && payment.sequenceType === 'first') {
    if (!userId || !plan || !PLANS[plan]) {
      console.error('[MOLLIE WEBHOOK] Métadonnées manquantes')
      return NextResponse.json({ received: true })
    }

    const planData    = PLANS[plan]
    const nextBilling = new Date(Date.now() + 30 * 24 * 3600 * 1000)
    const dbPlan      = plan === 'BASIQUE' ? 'STANDARD' : plan

    try {
      // Mettre à jour l'utilisateur
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan:                'STANDARD' === dbPlan ? 'STANDARD' : dbPlan as 'PREMIUM' | 'ULTRA',
          profilesParSemaine:  planData.profilesParSemaine,
          mollieSubscriptionId: payment.id,
        },
      })

      // Créer la subscription en DB
      await prisma.subscription.create({
        data: {
          userId,
          plan:                dbPlan as 'STANDARD' | 'PREMIUM' | 'ULTRA',
          profilesParSemaine:  planData.profilesParSemaine,
          mollieSubscriptionId: payment.id,
          molliePlanKey:       plan,
          status:              'ACTIVE',
          currentPeriodStart:  new Date(),
          currentPeriodEnd:    nextBilling,
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

      // ── Créer l'abonnement récurrent Mollie ────────────────────────────────
      const user = await prisma.user.findUnique({
        where:  { id: userId },
        select: { mollieCustomerId: true, email: true, prenom: true },
      })

      if (user?.mollieCustomerId) {
        try {
          const subscription = await mollieClient.customerSubscriptions.create(
            user.mollieCustomerId,
            {
              amount:      { currency: 'EUR', value: (payment.amount as { value: string }).value },
              interval:    planData.intervalMollie,
              description: `Abonnement ${plan} MASR — renouvellement`,
              webhookUrl:  `${process.env.NEXTAUTH_URL}/api/mollie/webhook`,
              metadata:    JSON.stringify({ userId, plan, type: 'renewal' }),
            }
          )
          await prisma.user.update({
            where: { id: userId },
            data:  { mollieSubscriptionId: subscription.id },
          })
          console.log(`[MOLLIE WEBHOOK] Abonnement récurrent créé: ${subscription.id}`)
        } catch (subErr) {
          console.error('[MOLLIE WEBHOOK] Erreur création subscription récurrente:', subErr)
          // Non bloquant — le paiement initial est déjà activé
        }
      }

      // Emails de confirmation
      if (user) {
        const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        const nextStr = nextBilling.toLocaleDateString('fr-FR',{ day: 'numeric', month: 'long', year: 'numeric' })
        await Promise.allSettled([
          emailService.sendSubscriptionConfirm({
            email: user.email, prenom: user.prenom,
            plan, montant: planData.montantLabel, nextBilling: nextStr,
          }),
          emailService.sendPaymentConfirm({
            email: user.email, prenom: user.prenom,
            montant: planData.montantLabel, plan, date: dateStr,
          }),
        ])
      }

      console.log(`[MOLLIE WEBHOOK] ✅ Abonnement ${plan} activé pour userId=${userId}`)

    } catch (err) {
      console.error('[MOLLIE WEBHOOK] Erreur activation abonnement:', err)
    }
  }

  // ── Renouvellement mensuel réussi ─────────────────────────────────────────
  if (payment.status === 'paid' && payment.sequenceType === 'recurring') {
    if (userId && plan) {
      const nextBilling = new Date(Date.now() + 30 * 24 * 3600 * 1000)
      await prisma.subscription.updateMany({
        where: { userId, status: 'ACTIVE' },
        data:  { currentPeriodEnd: nextBilling },
      }).catch(console.error)
      console.log(`[MOLLIE WEBHOOK] ✅ Renouvellement enregistré userId=${userId}`)
    }
  }

  // ── Paiement échoué ───────────────────────────────────────────────────────
  if (payment.status === 'failed' || payment.status === 'expired') {
    if (userId) {
      await prisma.subscription.updateMany({
        where: { userId, status: 'ACTIVE' },
        data:  { status: 'PAST_DUE' },
      }).catch(console.error)

      await prisma.notification.create({
        data: {
          userId,
          type:    'ABONNEMENT',
          titre:   'Paiement échoué',
          contenu: 'Votre renouvellement a échoué. Vérifiez votre moyen de paiement.',
        },
      }).catch(console.error)

      const user = await prisma.user.findUnique({
        where:  { id: userId },
        select: { email: true, prenom: true },
      })
      if (user) {
        await emailService.sendPaymentFailed({ email: user.email, prenom: user.prenom }).catch(console.error)
      }
      console.log(`[MOLLIE WEBHOOK] ❌ Paiement échoué userId=${userId}`)
    }
  }

  return NextResponse.json({ received: true })
}
