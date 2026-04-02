export const dynamic = 'force-dynamic'

// ══════════════════════════════════════════════════════════════════
// GET /api/sessions/[sessionId]/confirmer-email?action=ACCEPTER|DECLINER
// One-click depuis l'email d'invitation mouqabala.
// Redirige vers la page sessions avec un message toast.
// ══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') as 'ACCEPTER' | 'DECLINER' | null

  // Si pas connecté → rediriger vers connexion avec redirect post-login
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    const redirectUrl = `/connexion?redirect=/api/sessions/${params.sessionId}/confirmer-email?action=${action}`
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  const userId = session.user.id

  if (!action || !['ACCEPTER', 'DECLINER'].includes(action)) {
    return NextResponse.redirect(new URL('/sessions?error=action_invalide', req.url))
  }

  try {
    const imamSession = await prisma.imamSession.findUnique({
      where: { id: params.sessionId },
      include: {
        user1: { select: { id: true, prenom: true, email: true } },
        user2: { select: { id: true, prenom: true, email: true } },
      },
    })

    if (!imamSession || imamSession.user2Id !== userId) {
      return NextResponse.redirect(new URL('/sessions?error=non_autorise', req.url))
    }

    if (imamSession.status !== 'PLANIFIE') {
      return NextResponse.redirect(new URL('/sessions?info=deja_traitee', req.url))
    }

    if (action === 'ACCEPTER') {
      await prisma.notification.create({
        data: {
          userId:  imamSession.user1Id,
          type:    'SESSION_RAPPEL',
          titre:   `✅ ${imamSession.user2!.prenom} a accepté la mouqabala`,
          contenu: `${imamSession.user2!.prenom} a confirmé sa présence depuis l'email d'invitation.`,
          data:    JSON.stringify({ sessionId: params.sessionId, action: 'MOUQUABALA_CONFIRMEE' }),
        },
      })

      emailService.sendMouquabalaAccepted({
        email:       imamSession.user1.email,
        prenom:      imamSession.user1.prenom,
        matchPrenom: imamSession.user2!.prenom,
      }).catch(() => {})

      return NextResponse.redirect(new URL(`/sessions/${params.sessionId}?confirmed=1`, req.url))

    } else {
      await prisma.imamSession.update({
        where: { id: params.sessionId },
        data:  { status: 'ANNULE' },
      })

      await prisma.notification.create({
        data: {
          userId:  imamSession.user1Id,
          type:    'SESSION_RAPPEL',
          titre:   `❌ ${imamSession.user2!.prenom} a décliné la mouqabala`,
          contenu: `${imamSession.user2!.prenom} n'est pas disponible. Vous pouvez en planifier une nouvelle.`,
          data:    JSON.stringify({ sessionId: params.sessionId, action: 'MOUQUABALA_DECLINEE' }),
        },
      })

      return NextResponse.redirect(new URL('/sessions?declined=1', req.url))
    }

  } catch {
    return NextResponse.redirect(new URL('/sessions?error=serveur', req.url))
  }
}
