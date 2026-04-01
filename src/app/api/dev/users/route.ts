export const dynamic = 'force-dynamic'

// ⚠️ ROUTE DE DEV UNIQUEMENT — protégée par DEV_SECRET
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

const DEV_SECRET = process.env.DEV_SECRET

function auth(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  return DEV_SECRET && secret === DEV_SECRET
}

// GET ?secret=... → liste tous les comptes (sans les hashes)
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await prisma.user.findMany({
    select: {
      id: true, prenom: true, email: true, genre: true,
      plan: true, isBanned: true, isSuspended: true,
      isVerified: true, questionnaireCompleted: true, createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ users })
}

// POST ?secret=... { email, newPassword } → reset le mot de passe
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, newPassword } = await req.json()
  if (!email || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'email et newPassword (min 6 chars) requis' }, { status: 400 })
  }

  const passwordHash = await hash(newPassword, 12)
  const user = await prisma.user.update({
    where: { email: email.toLowerCase().trim() },
    data:  { passwordHash },
    select: { id: true, email: true, prenom: true },
  })

  return NextResponse.json({ success: true, user })
}
