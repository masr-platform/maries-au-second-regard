// ================================================================
// MASR — POST /api/profil/vue
// Enregistre la consultation d'un profil pour les stats du digest
// Dédupliqué : 1 vue max par (viewer, viewed) par heure
// ================================================================

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let viewedId: string
  try {
    const body = await req.json()
    viewedId = body?.viewedId ?? ''
  } catch {
    return NextResponse.json({ error: 'Body invalide' }, { status: 400 })
  }

  if (!viewedId || viewedId === session.user.id) {
    return NextResponse.json({ ok: true }) // ignorer auto-vues
  }

  try {
    // Dédupliquation : pas plus d'une vue par heure pour le même couple
    const uneHeure = new Date(Date.now() - 3600 * 1000)
    const dejaVu = await prisma.profilVue.findFirst({
      where: {
        viewerId:  session.user.id,
        viewedId,
        createdAt: { gt: uneHeure },
      },
    })

    if (!dejaVu) {
      await prisma.profilVue.create({
        data: { viewerId: session.user.id, viewedId },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[profil/vue] Erreur:', err)
    // Ne pas faire planter la page pour une vue non enregistrée
    return NextResponse.json({ ok: true })
  }
}
