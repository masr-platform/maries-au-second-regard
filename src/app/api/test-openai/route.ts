// ⚠️ Route de diagnostic désactivée en production
// Ne jamais exposer de clés API ou appeler OpenAI sans authentification admin

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'Route désactivée' },
    { status: 404 }
  )
}
