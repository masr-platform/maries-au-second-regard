export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — Récupérer son propre profil
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id:                     true,
      prenom:                 true,
      email:                  true,
      genre:                  true,
      ville:                  true,
      pays:                   true,
      plan:                   true,
      photoUrl:               true,
      photos:                 true,
      photoPublique:          true,
      questionnaireCompleted: true,
      profileCompleted:       true,
      isVerified:             true,
      waliEnabled:            true,
      waliEmail:              true,
      waliNom:                true,
      phone:                  true,
      createdAt:              true,
      lastActiveAt:           true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  return NextResponse.json({ profil: user })
}

// PATCH — Mettre à jour son profil
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { prenom, ville, waliEnabled, photoPublique } = body

    const data: {
      prenom?: string
      ville?: string | null
      waliEnabled?: boolean
      photoPublique?: boolean
    } = {}

    if (prenom && typeof prenom === 'string' && prenom.trim().length >= 2) {
      data.prenom = prenom.trim()
    }
    if (typeof ville === 'string') {
      data.ville = ville.trim() || null
    }
    if (typeof waliEnabled === 'boolean') {
      data.waliEnabled = waliEnabled
    }
    if (typeof photoPublique === 'boolean') {
      data.photoPublique = photoPublique
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Aucune donnée valide' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, prenom: true, ville: true, waliEnabled: true, photoPublique: true },
    })

    return NextResponse.json({ success: true, user })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
