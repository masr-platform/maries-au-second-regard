// ================================================================
// MASR — /api/admin/codes-promo
// GET  : liste tous les codes promo + stats commissions
// POST : créer un nouveau code promo affilié
// ================================================================

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function isAdmin(role: string) {
  return ['ADMIN', 'SUPER_ADMIN'].includes(role)
}

// ─── GET — Liste des codes + stats ───────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !isAdmin(session.user.role as string)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const codes = await prisma.codePromo.findMany({
    include: {
      utilisations: {
        select: {
          id: true,
          montantHT: true,
          commissionDue: true,
          paye: true,
          createdAt: true,
          plan: true,
          user: { select: { prenom: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Calculer les totaux par code
  const result = codes.map(c => ({
    ...c,
    stats: {
      totalUtilisations: c.utilisations.length,
      chiffreAffaires:   c.utilisations.reduce((s, u) => s + u.montantHT, 0),
      commissionDue:     c.utilisations.filter(u => !u.paye).reduce((s, u) => s + u.commissionDue, 0),
      commissionPayee:   c.utilisations.filter(u => u.paye).reduce((s, u) => s + u.commissionDue, 0),
    },
  }))

  return NextResponse.json({ codes: result })
}

// ─── POST — Créer un code promo ───────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !isAdmin(session.user.role as string)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const body = await req.json()
  const { code, influenceurNom, influenceurContact, tauxCommission, tauxReduction, stripeCouponId } = body

  if (!code || !influenceurNom) {
    return NextResponse.json({ error: 'code et influenceurNom requis' }, { status: 400 })
  }

  // Vérifier unicité
  const existing = await prisma.codePromo.findUnique({ where: { code: code.toUpperCase() } })
  if (existing) {
    return NextResponse.json({ error: 'Ce code existe déjà' }, { status: 409 })
  }

  const codePromo = await prisma.codePromo.create({
    data: {
      code:              code.toUpperCase().trim(),
      influenceurNom,
      influenceurContact: influenceurContact ?? null,
      tauxCommission:    tauxCommission ?? 20,
      tauxReduction:     tauxReduction ?? 20,
      stripeCouponId:    stripeCouponId ?? null,
    },
  })

  return NextResponse.json({ codePromo }, { status: 201 })
}
