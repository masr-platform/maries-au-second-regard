import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/prisma'
import { compare, hash }             from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'Le nouveau mot de passe doit faire au moins 8 caractères' }, { status: 400 })
    }

    // Récupérer le hash actuel
    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { id: true, password: true },
    })
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

    // Vérifier le mot de passe actuel
    if (!user.password) {
      return NextResponse.json({ error: 'Compte sans mot de passe (connexion sociale)' }, { status: 400 })
    }
    const valid = await compare(currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 })
    }

    // Mettre à jour
    const hashed = await hash(newPassword, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data:  { password: hashed },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
