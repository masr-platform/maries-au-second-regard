export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma }                    from '@/lib/prisma'
import { emailService }              from '@/lib/email'

// ─── Plans ────────────────────────────────────────────────────────────────────
const PLANS: Record<string, {
  profilesParSemaine: number
  montantLabel:       string
}> = {
  BASIQUE: { profilesParSemaine: 1,  montantLabel: '19,90 €' },
  PREMIUM: { profilesParSemaine: 7,  montantLabel: '29,90 €' },
  ULTRA:   { profilesParSemaine: 21, montantLabel: '49,90 €' },
}

type PlanKey = keyof typeof PLANS

// ─── POST — Webhook PayPlug ───────────────────────────────────────────────────
// PayPlug envoie l'objet Payment complet en JSON dans le body
export async function POST(req: NextRequest) {

  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return NextResponse.json({ error: 'Body invalide' }, { status: 400 })
  }

  let payment: Record<string, unknown>
  try {
    payment = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const paymentId = payment.id as string
  console.log(`[PAYPLUG WEBHOOK] Reçu: id=${paymentId} is_paid=${payment.is_paid}`)

  const metadata = (payment.metadata as Record<string, string>) ?? {}
  const userId   = metadata.userId
  const plan     = metadata.plan as PlanKey

  if (!userId || !plan || !PLANS[plan]) {
    console.error('[PAYPLUG WEBHOOK] Métadonnées manquantes ou plan invalide', { userId, plan })
    return NextResponse.json({ received: true })
  }

  const planData = PLANS[plan]

  // ── Paiement réussi ───────────────────────────────────────────────────────
  if (payment.is_paid === true) {
    const nextBilling = new Date(Date.now() + 30 * 24 * 3600 * 1000)
    const dbPlan      = plan === 'BASIQUE' ? 'STANDARD' : plan

    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan:                dbPlan as 'STANDARD' | 'PREMIUM' | 'ULTRA',
          profilesParSemaine:  planData.profilesParSemaine,
          mollieSubscriptionId: paymentId,
        },
      })

      await prisma.subscription.create({
        data: {
          userId,
          plan:                dbPlan as 'STANDARD' | 'PREMIUM' | 'ULTRA',
          profilesParSemaine:  planData.profilesParSemaine,
          mollieSubscriptionId: paymentId,
          molliePlanKey:       plan,
          status:              'ACTIVE',
          currentPeriodStart:  new Date(),
          currentPeriodEnd:    nextBilling,
        },
      })

      await prisma.notification.create({
        data: {
          userId,
          type:    'ABONNEMENT',
          titre:   `Abonnement ${plan} activé !`,
          contenu: `Votre abonnement est actif. Bienvenue dans Mariés au Second Regard.`,
        },
      })

      const user = await prisma.user.findUnique({
        where:  { id: userId },
        select: { email: true, prenom: true },
      })

      if (user) {
        const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        const nextStr = nextBilling.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
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

      console.log(`[PAYPLUG WEBHOOK] ✅ Abonnement ${plan} activé pour userId=${userId}`)

    } catch (err) {
      console.error('[PAYPLUG WEBHOOK] Erreur activation abonnement:', err)
    }
  }

  // ── Paiement échoué ───────────────────────────────────────────────────────
  if (payment.is_paid === false && payment.failure) {
    try {
      await prisma.subscription.updateMany({
        where: { userId, status: 'ACTIVE' },
        data:  { status: 'PAST_DUE' },
      })

      await prisma.notification.create({
        data: {
          userId,
          type:    'ABONNEMENT',
          titre:   'Paiement échoué',
          contenu: 'Votre paiement a échoué. Vérifiez votre moyen de paiement.',
        },
      })

      const user = await prisma.user.findUnique({
        where:  { id: userId },
        select: { email: true, prenom: true },
      })
      if (user) {
        await emailService.sendPaymentFailed({ email: user.email, prenom: user.prenom }).catch(console.error)
      }

      console.log(`[PAYPLUG WEBHOOK] ❌ Paiement échoué userId=${userId}`)
    } catch (err) {
      console.error('[PAYPLUG WEBHOOK] Erreur traitement paiement échoué:', err)
    }
  }

  return NextResponse.json({ received: true })
}
