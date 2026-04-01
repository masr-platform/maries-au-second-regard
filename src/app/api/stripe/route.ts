export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

// ─── Init Stripe ───────────────────────────────────────────────────────────────
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY ?? ''

// Log de vérification au démarrage du module (visible dans Vercel Functions logs)
if (!STRIPE_KEY) {
  console.error('[STRIPE] ❌ STRIPE_SECRET_KEY est UNDEFINED ou VIDE — paiements impossibles!')
} else {
  console.log(`[STRIPE] key starts with: ${STRIPE_KEY.substring(0, 7)}`)
  // Attendu : sk_live_ (production) ou sk_test_ (test)
}

const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2024-06-20',
})

// ─── Plans : price IDs depuis variables Vercel ────────────────────────────────
//   STRIPE_PRICE_BASIQUE  → Essentiel  19,90€/mois
//   STRIPE_PRICE_PREMIUM  → Premium    29,90€/mois
//   STRIPE_PRICE_ULTRA    → Élite      49,90€/mois
// ─────────────────────────────────────────────────────────────────────────────
const PLANS: Record<string, {
  envKey: string
  priceId: string
  profilesParSemaine: number
  montant: string
  nom: string
}> = {
  BASIQUE: {
    envKey:             'STRIPE_PRICE_BASIQUE',
    priceId:            process.env.STRIPE_PRICE_BASIQUE ?? '',
    profilesParSemaine: 1,
    montant:            '19,90 €',
    nom:                'Essentiel',
  },
  PREMIUM: {
    envKey:             'STRIPE_PRICE_PREMIUM',
    priceId:            process.env.STRIPE_PRICE_PREMIUM ?? '',
    profilesParSemaine: 7,
    montant:            '29,90 €',
    nom:                'Premium',
  },
  ULTRA: {
    envKey:             'STRIPE_PRICE_ULTRA',
    priceId:            process.env.STRIPE_PRICE_ULTRA ?? '',
    profilesParSemaine: 21,
    montant:            '49,90 €',
    nom:                'Élite',
  },
}

// ─── POST — Créer une session Checkout abonnement ─────────────────────────────
export async function POST(req: NextRequest) {

  // ── Auth ─────────────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // ── Parse body ───────────────────────────────────────────────────────────────
  let plan: string
  try {
    const body = await req.json()
    plan = body?.plan ?? ''
    console.log(`[STRIPE] >>> Requête reçue: plan="${plan}" userId="${session.user.id}"`)
  } catch (e) {
    console.error('[STRIPE] Impossible de parser le body JSON:', e)
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  // ── Validation plan ──────────────────────────────────────────────────────────
  if (!plan || !(plan in PLANS)) {
    console.error(`[STRIPE] Plan inconnu: "${plan}" — plans disponibles: ${Object.keys(PLANS).join(', ')}`)
    return NextResponse.json({ error: `Plan invalide: "${plan}"` }, { status: 400 })
  }

  const planData = PLANS[plan]
  const priceId  = planData.priceId
  const keyMode  = STRIPE_KEY.startsWith('sk_live') ? 'LIVE ✅' : STRIPE_KEY.startsWith('sk_test') ? 'TEST ⚠️' : 'INCONNUE ❌'

  // ── Log de debug complet ─────────────────────────────────────────────────────
  console.log('[STRIPE] ──────────────────────────────────────')
  console.log(`[STRIPE] Plan demandé    : ${plan} (${planData.nom})`)
  console.log(`[STRIPE] Variable env    : ${planData.envKey}`)
  console.log(`[STRIPE] Price ID        : ${priceId || '❌ VIDE/UNDEFINED'}`)
  console.log(`[STRIPE] Clé Stripe      : ${STRIPE_KEY.substring(0, 20)}... [mode: ${keyMode}]`)
  console.log(`[STRIPE] NEXTAUTH_URL    : ${process.env.NEXTAUTH_URL ?? '❌ UNDEFINED'}`)
  console.log('[STRIPE] ──────────────────────────────────────')

  // ── Validation price ID ──────────────────────────────────────────────────────
  if (!priceId) {
    const msg = `Variable manquante dans Vercel: ${planData.envKey}`
    console.error(`[STRIPE] ❌ ERREUR CONFIG: ${msg}`)
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // ── Customer Stripe ──────────────────────────────────────────────────────────
  let customerId: string
  try {
    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { stripeCustomerId: true, email: true, prenom: true },
    })

    if (user?.stripeCustomerId) {
      customerId = user.stripeCustomerId
      console.log(`[STRIPE] Customer existant: ${customerId}`)
    } else {
      console.log(`[STRIPE] Création nouveau customer pour: ${user?.email}`)
      const customer = await stripe.customers.create({
        email:    user!.email,
        name:     user!.prenom ?? undefined,
        metadata: { userId: session.user.id },
      })
      customerId = customer.id

      await prisma.user.update({
        where: { id: session.user.id },
        data:  { stripeCustomerId: customerId },
      })
      console.log(`[STRIPE] Customer créé: ${customerId}`)
    }
  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error('[STRIPE] ❌ Erreur création customer:', e?.message, err)
    return NextResponse.json(
      { error: 'Erreur création customer Stripe', detail: e?.message ?? String(err) },
      { status: 500 }
    )
  }

  // ── Création session Checkout ─────────────────────────────────────────────────
  try {
    console.log(`[STRIPE] Création checkout session: customer=${customerId} price=${priceId} mode=subscription`)

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

    console.log(`[STRIPE] ✅ Session créée: ${checkoutSession.id}`)
    console.log(`[STRIPE] ✅ URL checkout: ${checkoutSession.url}`)

    return NextResponse.json({ url: checkoutSession.url })

  } catch (err: unknown) {
    const e = err as { message?: string; type?: string; code?: string; statusCode?: number; raw?: unknown }
    console.error('[STRIPE] ❌ ERREUR création checkout session:')
    console.error('  message   :', e?.message)
    console.error('  type      :', e?.type)
    console.error('  code      :', e?.code)
    console.error('  statusCode:', e?.statusCode)
    console.error('  raw       :', JSON.stringify(e?.raw ?? err, null, 2))
    return NextResponse.json(
      {
        error:  'Erreur Stripe checkout',
        detail: e?.message ?? 'Erreur inconnue',
        type:   e?.type,
        code:   e?.code,
      },
      { status: 500 }
    )
  }
}

// Webhook Stripe → voir /api/stripe/webhook/route.ts
