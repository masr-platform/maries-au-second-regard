export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/prisma'

const PAYPLUG_API = 'https://api.payplug.com/v1/payments'

// ─── Packs de crédits ─────────────────────────────────────────────────────────
const PACKS: Record<string, {
  amount:       number
  montantLabel: string
  profiles:     number
  label:        string
}> = {
  PACK_3: { amount: 990, montantLabel: '9,90 €', profiles: 3, label: '3 profils supplémentaires' },
}

// ─── POST — Acheter un pack de crédits ────────────────────────────────────────
export async function POST(req: NextRequest) {

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let pack: string
  try {
    const body = await req.json()
    pack = body?.pack ?? ''
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  if (!pack || !(pack in PACKS)) {
    return NextResponse.json({ error: `Pack invalide: "${pack}"` }, { status: 400 })
  }

  const secretKey = process.env.PAYPLUG_SECRET_KEY ?? ''
  if (!secretKey) {
    console.error('[PAYPLUG PACK] ❌ PAYPLUG_SECRET_KEY manquante!')
    return NextResponse.json({ error: 'Configuration paiement manquante' }, { status: 500 })
  }

  const packData = PACKS[pack]
  const userId   = session.user.id
  const appUrl   = process.env.NEXTAUTH_URL ?? 'https://mariesausecondregard.com'

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { email: true, prenom: true, ville: true },
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
      amount:   packData.amount,
      currency: 'EUR',
      billing:  billingBase,
      shipping: { ...billingBase, delivery_type: 'DIGITAL_GOODS' },
      return_url:       `${appUrl}/tableau-de-bord?credits=ok`,
      failure_url:      `${appUrl}/abonnement?paiement=echec`,
      notification_url: `${appUrl}/api/payplug/pack/webhook`,
      metadata: { userId, pack, type: 'PACK' },
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
      console.error('[PAYPLUG PACK] ❌ Erreur API:', data)
      return NextResponse.json(
        { error: 'Erreur PayPlug', detail: data?.message ?? JSON.stringify(data) },
        { status: 500 }
      )
    }

    const paymentUrl = (data.hosted_payment as { payment_url?: string })?.payment_url ?? ''
    console.log(`[PAYPLUG PACK] ✅ Paiement pack créé: ${data.id} | URL: ${paymentUrl}`)

    return NextResponse.json({ url: paymentUrl })

  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error('[PAYPLUG PACK] ❌ Erreur:', e?.message, err)
    return NextResponse.json(
      { error: 'Erreur paiement', detail: e?.message ?? String(err) },
      { status: 500 }
    )
  }
}
