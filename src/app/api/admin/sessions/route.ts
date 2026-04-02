export const dynamic = 'force-dynamic'

// ══════════════════════════════════════════════════════════════════
// GET /api/admin/sessions
// Retourne toutes les sessions mouqabala pour le dashboard admin.
// Filtres : ?status=PLANIFIE&from=2025-01-01&to=2025-12-31
// ══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Vérifier le rôle admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès réservé aux admins' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status  = searchParams.get('status')
  const from    = searchParams.get('from')
  const to      = searchParams.get('to')
  const limite  = parseInt(searchParams.get('limite') ?? '100')

  try {
    const sessions = await prisma.imamSession.findMany({
      where: {
        ...(status ? { status: status as 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE' } : {}),
        ...(from || to ? {
          scheduledAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to   ? { lte: new Date(to)   } : {}),
          },
        } : {}),
      },
      include: {
        imam: {
          select: { nom: true, prenom: true, type: true, photo: true },
        },
        user1: { select: { id: true, prenom: true, ville: true, photoUrl: true } },
        user2: { select: { id: true, prenom: true, ville: true, photoUrl: true } },
        match: { select: { id: true, scoreGlobal: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: limite,
    })

    // Enrichir avec flag "rejoignable" (10 min avant → fin de session)
    const now = Date.now()
    const enrichies = sessions.map(s => {
      const start = new Date(s.scheduledAt).getTime()
      const end   = start + s.dureeMinutes * 60_000
      const peutRejoindre = now >= start - 10 * 60_000 && now <= end
      return { ...s, peutRejoindre }
    })

    // Stats rapides
    const stats = {
      total:          sessions.length,
      planifiees:     sessions.filter(s => s.status === 'PLANIFIE').length,
      enCours:        sessions.filter(s => s.status === 'EN_COURS').length,
      terminees:      sessions.filter(s => s.status === 'TERMINE').length,
      annulees:       sessions.filter(s => s.status === 'ANNULE').length,
      aujourdhui:     sessions.filter(s => {
        const d = new Date(s.scheduledAt)
        const t = new Date()
        return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
      }).length,
    }

    return NextResponse.json({ sessions: enrichies, stats })
  } catch (error) {
    console.error('Erreur admin sessions:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
