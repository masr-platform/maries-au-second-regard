// ================================================================
// MASR — POST /api/auth/reset-password
// Valide le token, met à jour le mot de passe, invalide le token
// ================================================================

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import { checkRateLimit } from '@/lib/redis'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  token:    z.string().min(1, 'Token manquant'),
  password: z.string().min(8, 'Mot de passe trop court (8 caractères min)').max(100),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'

  // Rate limiting : 10 tentatives max par IP par heure
  const { allowed } = await checkRateLimit(`reset-pwd:${ip}`, 10, 3600)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans une heure.' },
      { status: 429 }
    )
  }

  let token: string, password: string
  try {
    const body = await req.json()
    ;({ token, password } = schema.parse(body))
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || 'Données invalides.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  try {
    // Chercher l'utilisateur avec ce token valide (non expiré)
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken:   token,
        passwordResetExpires: { gt: new Date() }, // token non expiré
        isBanned:             false,
        isSuspended:          false,
      },
      select: { id: true, email: true, prenom: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Ce lien est invalide ou expiré. Refaites une demande de réinitialisation.' },
        { status: 400 }
      )
    }

    // Hash du nouveau mot de passe
    const passwordHash = await hash(password, 12)

    // Mise à jour : nouveau mot de passe + invalidation du token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken:   null,
        passwordResetExpires: null,
      },
    })

    // Email de confirmation
    await emailService.sendPasswordChanged({
      email:  user.email,
      prenom: user.prenom,
    }).catch((err) => console.error('[reset-password] Email confirmation échoué:', err))

    console.log('[reset-password] Mot de passe réinitialisé pour:', user.email)

    return NextResponse.json({
      ok: true,
      message: 'Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.',
    })

  } catch (err) {
    console.error('[reset-password] Erreur:', err)
    return NextResponse.json({ error: 'Erreur serveur. Réessayez.' }, { status: 500 })
  }
}
