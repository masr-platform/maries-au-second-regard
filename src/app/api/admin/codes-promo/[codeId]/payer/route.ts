// ================================================================
// MASR — POST /api/admin/codes-promo/[codeId]/payer
// Marque toutes les commissions en attente d'un code comme payées
// ================================================================

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: { codeId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role as string)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { count } = await prisma.utilisationCode.updateMany({
    where: { codeId: params.codeId, paye: false },
    data:  { paye: true },
  })

  return NextResponse.json({ ok: true, marqueesPayees: count })
}
