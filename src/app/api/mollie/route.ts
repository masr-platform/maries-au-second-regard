export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/prisma'
import { createMollieClient }        from '@mollie/api-client'

// ─── Init Mollie ──────────────────────────────────────────────────────────────
const MOLLIE_KEY = process.env.MOLLIE_API_KEY ?? ''
if (!MOLLIE_KEY) {
  console.error('[MOLLIE] ❌ MOLLIE_API_KEY manquante — paiements impossibles!')
}
const mollieClient = createMollieClient({ apiKey: MOLLIE_KEY })

// ─── Plans ────────────────────────────────────────────────────────────────────
const PLANS: Record<string, {
  montant:            string   // ex: "19.90"
  montantLabel:       string   // ex: "19,90 €"
  profilesParSemaine: number
  nom:                string
  intervalMollie:     string   // ex: "1 month"
}> = {
  BASIQUE: {
    montant:            '19.90',
    montantLabel:       '19,90 €',
    profilesParSemaine: 1,
    nom:                'Essentiel',
    intervalMollie:     '1 month',
  },
  PREMIUM: {
    montant:            '29.90',
    montantLabel:       '29,90 €',
    profilesParSemaine: 7,
    nom:                'Premium',
    intervalMollie:     '1 month',
  },
  ULTRA: {
    montant:            '49.90',
    montantLabel:       '49,90 €',
    profilesParSemaine: 21,
    nom:                'Élite',
    intervalMollie:     '1 month',
  },
}

// ─── POST — Créer un paiement Mollie initial ──────────────────────────────────
export async function POST(req: NextRequest) {

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let plan: string
  try {
    const body = await req.json()
    plan = body?.plan ?? ''
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: `Plan invalide: "${plan}"` }, { status: 400 })
  }

  const planData = PLANS[plan]
  const userId   = session.user.id
  const appUrl   = process.env.NEXTAUTH_URL ?? 'https://mariesausecondregard.com'

  try {
    // ── Récupérer ou créer le customer Mollie ─────────────────────────────────
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { mollieCustomerId: true, email: true, prenom: true },
    })

    let mollieCustomerId = user?.mollieCustomerId ?? null

    if (!mollieCustomerId) {
      const customer = await mollieClient.customers.create({
        name:  user!.prenom ?? 'Client MASR',
        email: user!.email,
        metadata: { userId },
      })
      mollieCustomerId = customer.id
      await prisma.user.update({
        where: { id: userId },
        data:  { mollieCustomerId },
      })
      console.log(`[MOLLIE] Customer créé: ${mollieCustomerId}`)
    }

    // ── Créer le premier paiement (séquence "first" pour mandate récurrent) ────
    const payment = await mollieClient.payments.create({
      amount:      { currency: 'EUR', value: planData.montant },
      description: `Abonnement ${planData.nom} — Mariés au Second Regard`,
      redirectUrl: `${appUrl}/profil?paiement=succes&plan=${plan}`,
      webhookUrl:  `${appUrl}/api/mollie/webhook`,
      sequenceType: 'first',
      customerId:   mollieCustomerId,
      metadata:     JSON.stringify({ userId, plan }),
    })

    const checkoutUrl = payment.getCheckoutUrl()
    console.log(`[MOLLIE] ✅ Paiement créé: ${payment.id} | URL: ${checkoutUrl}`)

    return NextResponse.json({ url: checkoutUrl })

  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error('[MOLLIE] ❌ Erreur création paiement:', e?.message, err)
    return NextResponse.json(
      { error: 'Erreur Mollie', detail: e?.message ?? String(err) },
      { status: 500 }
    )
  }
}
