export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma }                    from '@/lib/prisma'

// ─── POST — Webhook PayPlug (packs crédits) ───────────────────────────────────
export async function POST(req: NextRequest) {

  let payment: Record<string, unknown>
  try {
    const text = await req.text()
    payment = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Body invalide' }, { status: 400 })
  }

  console.log(`[PAYPLUG PACK WEBHOOK] Reçu: id=${payment.id} is_paid=${payment.is_paid}`)

  const metadata = (payment.metadata as Record<string, string>) ?? {}
  const userId   = metadata.userId
  const pack     = metadata.pack
  const type     = metadata.type

  if (!userId || type !== 'PACK') {
    return NextResponse.json({ received: true })
  }

  if (payment.is_paid === true) {
    try {
      const creditsToAdd = pack === 'PACK_3' ? 3 : 0
      if (creditsToAdd > 0) {
        await prisma.user.update({
          where: { id: userId },
          data:  { profilesParSemaine: { increment: creditsToAdd } },
        })
      }

      await prisma.notification.create({
        data: {
          userId,
          type:    'ABONNEMENT',
          titre:   'Pack crédits activé !',
          contenu: `Vos ${creditsToAdd} profils supplémentaires ont bien été ajoutés.`,
        },
      })

      console.log(`[PAYPLUG PACK WEBHOOK] ✅ Pack activé pour userId=${userId}`)
    } catch (err) {
      console.error('[PAYPLUG PACK WEBHOOK] Erreur:', err)
    }
  }

  return NextResponse.json({ received: true })
}
