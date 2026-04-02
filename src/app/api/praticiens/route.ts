export const dynamic = 'force-dynamic'

// ══════════════════════════════════════════════════════════════════
// GET /api/praticiens
// Retourne la liste des praticiens actifs et vérifiés.
// Filtre optionnel : ?type=IMAM | PSYCHOLOGUE
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

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // IMAM | PSYCHOLOGUE | null (tous)

  try {
    const praticiens = await prisma.praticien.findMany({
      where: {
        isVerified: true,
        isActive:   true,
        ...(type ? { type: type as 'IMAM' | 'PSYCHOLOGUE' } : {}),
      },
      select: {
        id:              true,
        type:            true,
        nom:             true,
        prenom:          true,
        bio:             true,
        photo:           true,
        specialites:     true,
        languesParlees:  true,
        tarifImam:       true,
        tarifIndividuel: true,
        tarifCouple:     true,
        noteAverage:     true,
        nombreSessions:  true,
        disponibilites:  true,
        fuseau:          true,
      },
      orderBy: [
        { noteAverage:    'desc' },
        { nombreSessions: 'desc' },
      ],
    })

    // Déserialiser les disponibilités JSON
    const enrichis = praticiens.map(p => ({
      ...p,
      disponibilites: p.disponibilites ? JSON.parse(p.disponibilites) : {},
      tarif: p.type === 'IMAM' ? (p.tarifImam ?? 0) : (p.tarifCouple ?? p.tarifIndividuel ?? 0),
    }))

    return NextResponse.json({ praticiens: enrichis })
  } catch (error) {
    console.error('Erreur récupération praticiens:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
