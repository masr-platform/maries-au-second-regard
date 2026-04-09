// ================================================================
// MASR — POST /api/auth/forgot-password
// Génère un token de réinitialisation, envoie l'email de reset
// Sécurisé : rate limiting, réponse identique email connu/inconnu
// ================================================================

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import { checkRateLimit } from '@/lib/redis'
import { randomBytes } from 'crypto'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Email invalide'),
})

// Réponse générique — ne pas révéler si l'email existe
const OK_RESPONSE = NextResponse.json({
  ok: true,
  message: 'Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.',
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'

  // Rate limiting : 5 demandes par IP par heure
  const { allowed } = await checkRateLimit(`forgot-pwd:${ip}`, 5, 3600)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans une heure.' },
      { status: 429 }
    )
  }

  let email: string
  try {
    const body = await req.json()
    ;({ email } = schema.parse(body))
    email = email.toLowerCase().trim()
  } catch {
    return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, prenom: true, email: true, isBanned: true },
    })

    // Pas de compte → on répond quand même OK (anti-énumération)
    if (!user || user.isBanned) return OK_RESPONSE

    // Génération du token — 32 octets = 64 chars hex
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // +1h

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken:   token,
        passwordResetExpires: expires,
      },
    })

    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.mariesausecondregard.com'
    const resetUrl = `${BASE_URL}/reset-password?token=${token}`

    await emailService.sendResetPassword({
      email: user.email,
      prenom: user.prenom,
      resetUrl,
    })

    console.log('[forgot-password] Token envoyé à:', user.email)
  } catch (err) {
    console.error('[forgot-password] Erreur:', err)
    // On ne révèle pas l'erreur au client
  }

  return OK_RESPONSE
}
