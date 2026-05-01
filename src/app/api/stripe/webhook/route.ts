export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

// Stripe remplacé par Mollie — webhook désactivé
export async function POST() {
  return NextResponse.json(
    { error: 'Stripe webhook désactivé. Utilisez /api/mollie/webhook.' },
    { status: 410 }
  )
}
