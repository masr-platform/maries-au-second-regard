export const dynamic = 'force-dynamic'

// ══════════════════════════════════════════════════════════════════
// POST /api/sessions/[sessionId]/confirmer
// User B accepte ou décline une invitation mouqabala.
// Body : { action: 'ACCEPTER' | 'DECLINER' }
// ══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const userId    = session.user.id
  const { action } = await req.json() as { action: 'ACCEPTER' | 'DECLINER' }

  if (!['ACCEPTER', 'DECLINER'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  }

  try {
    const imamSession = await prisma.imamSession.findUnique({
      where: { id: params.sessionId },
      include: {
        imam:  true,
        user1: { select: { id: true, prenom: true, email: true } },
        user2: { select: { id: true, prenom: true, email: true } },
      },
    })

    if (!imamSession) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    // Seul user2 peut confirmer (user1 est l'initiateur)
    if (imamSession.user2Id !== userId) {
      return NextResponse.json({ error: 'Vous n\'êtes pas invité(e) à cette session' }, { status: 403 })
    }

    if (imamSession.status !== 'PLANIFIE') {
      return NextResponse.json({ error: 'Cette session n\'est plus en attente de confirmation' }, { status: 409 })
    }

    if (action === 'ACCEPTER') {
      // Confirmer la session
      await prisma.imamSession.update({
        where: { id: params.sessionId },
        data:  { status: 'PLANIFIE' }, // reste PLANIFIE mais les deux ont confirmé
      })

      // Notifier user1
      await prisma.notification.create({
        data: {
          userId:  imamSession.user1Id,
          type:    'SESSION_RAPPEL',
          titre:   `✅ ${imamSession.user2!.prenom} a accepté la mouqabala`,
          contenu: `${imamSession.user2!.prenom} a confirmé sa présence. La mouqabala est confirmée.`,
          data:    JSON.stringify({ sessionId: params.sessionId, action: 'MOUQUABALA_CONFIRMEE' }),
        },
      })

      // Email à user1
      emailService.sendMouquabalaAccepted({
        email:       imamSession.user1.email,
        prenom:      imamSession.user1.prenom,
        matchPrenom: imamSession.user2!.prenom,
      }).catch(err => console.error('[email] sendMouquabalaAccepted:', err))

      return NextResponse.json({ success: true, status: 'CONFIRME', message: 'Mouqabala confirmée !' })

    } else {
      // Annuler la session
      await prisma.imamSession.update({
        where: { id: params.sessionId },
        data:  { status: 'ANNULE' },
      })

      // Notifier user1
      await prisma.notification.create({
        data: {
          userId:  imamSession.user1Id,
          type:    'SESSION_RAPPEL',
          titre:   `❌ ${imamSession.user2!.prenom} a décliné la mouqabala`,
          contenu: `${imamSession.user2!.prenom} n'est pas disponible pour cette session. Vous pouvez en planifier une nouvelle.`,
          data:    JSON.stringify({ sessionId: params.sessionId, action: 'MOUQUABALA_DECLINEE' }),
        },
      })

      return NextResponse.json({ success: true, status: 'ANNULE', message: 'Session déclinée.' })
    }

  } catch (error) {
    console.error('Erreur confirmation session:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
