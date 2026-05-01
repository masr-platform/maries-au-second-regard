export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

// Stripe remplacé par Mollie — endpoint désactivé
export async function POST() {
  return NextResponse.json(
    { error: 'Stripe est désactivé. Utilisez /api/mollie à la place.' },
    { status: 410 }
  )
}
