export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/prisma'

const PAYPLUG_API = 'https://api.payplug.com/v1/payments'

// ─── Plans ────────────────────────────────────────────────────────────────────
const PLANS: Record<string, {
  amount:             number   // en centimes
  montantLabel:       string
  profilesParSemaine: number
  nom:                string
}> = {
  BASIQUE: { amount: 1990, montantLabel: '19,90 €', profilesParSemaine: 1,  nom: 'Essentiel' },
  PREMIUM: { amount: 2990, montantLabel: '29,90 €', profilesParSemaine: 7,  nom: 'Premium'   },
  ULTRA:   { amount: 4990, montantLabel: '49,90 €', profilesParSemaine: 21, nom: 'Élite'     },
}

// ─── POST — Créer un paiement PayPlug ────────────────────────────────────────
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

  const secretKey = process.env.PAYPLUG_SECRET_KEY ?? ''
  if (!secretKey) {
    console.error('[PAYPLUG] ❌ PAYPLUG_SECRET_KEY manquante — paiements impossibles!')
    return NextResponse.json({ error: 'Configuration paiement manquante' }, { status: 500 })
  }

  const planData = PLANS[plan]
  const userId   = session.user.id
  const appUrl   = process.env.NEXTAUTH_URL ?? 'https://mariesausecondregard.com'

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { email: true, prenom: true, ville: true, pays: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  try {
    const billingBase = {
      email:      user.email,
      first_name: user.prenom || 'Membre',
      last_name:  'MASR',
      address1:   '1 rue de la Paix',
      city:       user.ville || 'Paris',
      postcode:   '75001',
      country:    'FR',
    }

    const payload = {
      amount:   planData.amount,
      currency: 'EUR',
      billing:  billingBase,
      shipping: {
        ...billingBase,
        delivery_type: 'DIGITAL_GOODS',
      },
      return_url:       `${appUrl}/profil?paiement=succes&plan=${plan}`,
      failure_url:      `${appUrl}/abonnement?paiement=echec`,
      notification_url: `${appUrl}/api/payplug/webhook`,
      save_card: true,
      metadata: { userId, plan },
    }

    const response = await fetch(PAYPLUG_API, {
      method:  'POST',
      headers: {
        'Authorization':   `Bearer ${secretKey}`,
        'Content-Type':    'application/json',
        'PayPlug-Version': '2019-08-06',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[PAYPLUG] ❌ Erreur API:', data)
      return NextResponse.json(
        { error: 'Erreur PayPlug', detail: data?.message ?? JSON.stringify(data) },
        { status: 500 }
      )
    }

    const paymentUrl = (data.hosted_payment as { payment_url?: string })?.payment_url ?? ''
    console.log(`[PAYPLUG] ✅ Paiement créé: ${data.id} | URL: ${paymentUrl}`)

    return NextResponse.json({ url: paymentUrl })

  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error('[PAYPLUG] ❌ Erreur création paiement:', e?.message, err)
    return NextResponse.json(
      { error: 'Erreur paiement', detail: e?.message ?? String(err) },
      { status: 500 }
    )
  }
}
