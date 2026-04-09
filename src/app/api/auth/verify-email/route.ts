// ================================================================
// MASR — GET /api/auth/verify-email?token=TOKEN
// Valide le token de vérification email, marque l'email comme vérifié
// Redirige vers /connexion?verified=1 en cas de succès
// ================================================================

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.mariesausecondregard.com'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token || token.length < 10) {
    return NextResponse.redirect(`${BASE_URL}/connexion?error=token-invalide`)
  }

  try {
    // Chercher l'utilisateur avec ce token valide (non expiré)
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken:   token,
        emailVerifyExpires: { gt: new Date() },
        isVerified:         false, // déjà vérifié → on gère en dessous
      },
      select: { id: true, email: true, isVerified: true },
    })

    if (!user) {
      // Peut-être déjà vérifié → vérifier sans la condition isVerified
      const alreadyVerified = await prisma.user.findFirst({
        where: { emailVerifyToken: token },
        select: { isVerified: true },
      })

      if (alreadyVerified?.isVerified) {
        // Déjà vérifié → rediriger quand même vers connexion
        return NextResponse.redirect(`${BASE_URL}/connexion?verified=1`)
      }

      return NextResponse.redirect(`${BASE_URL}/connexion?error=lien-expire`)
    }

    // Marquer l'email comme vérifié, invalider le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified:         true,
        emailVerifyToken:   null,
        emailVerifyExpires: null,
      },
    })

    console.log('[verify-email] Email vérifié pour:', user.email)

    return NextResponse.redirect(`${BASE_URL}/connexion?verified=1`)

  } catch (err) {
    console.error('[verify-email] Erreur:', err)
    return NextResponse.redirect(`${BASE_URL}/connexion?error=erreur-serveur`)
  }
}
