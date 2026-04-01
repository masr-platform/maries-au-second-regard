export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!['ADMIN', 'SUPER_ADMIN', 'MODERATEUR'].includes(session?.user?.role || '')) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const limite  = Math.min(parseInt(searchParams.get('limite') || '20'), 100)
  const offset  = parseInt(searchParams.get('offset') || '0')
  const search  = searchParams.get('q') || ''
  const filter  = searchParams.get('filter') || 'all'

  try {
    const where: Record<string, unknown> = {
      ...(search ? {
        OR: [
          { prenom: { contains: search, mode: 'insensitive' } },
          { email:  { contains: search, mode: 'insensitive' } },
        ]
      } : {}),
      ...(filter === 'unverified' ? { isVerified: false }      : {}),
      ...(filter === 'banned'     ? { isBanned: true }         : {}),
      ...(filter === 'premium'    ? { plan: { not: 'GRATUIT' } } : {}),
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, prenom: true, genre: true, ville: true,
          plan: true, createdAt: true, isVerified: true,
          isBanned: true, isSuspended: true, questionnaireCompleted: true,
          lastActiveAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limite,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({ users, total, limite, offset })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
