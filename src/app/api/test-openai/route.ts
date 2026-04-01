export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  const key = process.env.OPENAI_API_KEY
  if (!key) return NextResponse.json({ error: 'OPENAI_API_KEY manquante' }, { status: 500 })

  try {
    const openai = new OpenAI({ apiKey: key })
    const res = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'test masr platform',
    })
    return NextResponse.json({
      ok: true,
      dims: res.data[0].embedding.length,
      model: res.model,
      keyPrefix: key.substring(0, 12) + '...',
    })
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err.message,
      type: err.type,
      code: err.code,
      status: err.status,
    }, { status: 500 })
  }
}
