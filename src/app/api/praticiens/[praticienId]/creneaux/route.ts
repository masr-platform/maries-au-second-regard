export const dynamic = 'force-dynamic'

// ══════════════════════════════════════════════════════════════════
// GET /api/praticiens/[praticienId]/creneaux?date=2025-03-15
// Retourne les créneaux disponibles pour un praticien un jour donné.
// Filtre les sessions déjà réservées (PLANIFIE + EN_COURS).
// ══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/prisma'

// Jours de la semaine en FR (getDay() : 0=dim, 1=lun, ...)
const JOURS: Record<number, string> = {
  0: 'dimanche',
  1: 'lundi',
  2: 'mardi',
  3: 'mercredi',
  4: 'jeudi',
  5: 'vendredi',
  6: 'samedi',
}

export async function GET(
  req: NextRequest,
  { params }: { params: { praticienId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get('date') // "2025-03-15"

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ error: 'Paramètre date requis (format: YYYY-MM-DD)' }, { status: 400 })
  }

  const praticienId = params.praticienId

  try {
    // ── 1. Récupérer le praticien et ses disponibilités ──────────
    const praticien = await prisma.praticien.findFirst({
      where: { id: praticienId, isVerified: true, isActive: true },
      select: { disponibilites: true, fuseau: true },
    })

    if (!praticien) {
      return NextResponse.json({ error: 'Praticien non trouvé' }, { status: 404 })
    }

    const disponibilites: Record<string, string[]> =
      praticien.disponibilites ? JSON.parse(praticien.disponibilites) : {}

    // ── 2. Identifier le jour de la semaine ──────────────────────
    const [year, month, day] = dateParam.split('-').map(Number)
    const dateObj = new Date(year, month - 1, day)
    const jourSemaine = JOURS[dateObj.getDay()]

    const creneauxJour: string[] = disponibilites[jourSemaine] ?? []

    if (creneauxJour.length === 0) {
      return NextResponse.json({ creneaux: [], message: 'Praticien non disponible ce jour' })
    }

    // ── 3. Récupérer les sessions déjà réservées ce jour ────────
    const debutJour = new Date(year, month - 1, day, 0, 0, 0)
    const finJour   = new Date(year, month - 1, day, 23, 59, 59)

    const sessionsExistantes = await prisma.imamSession.findMany({
      where: {
        imamId:      praticienId,
        scheduledAt: { gte: debutJour, lte: finJour },
        status:      { in: ['PLANIFIE', 'EN_COURS'] },
      },
      select: { scheduledAt: true, dureeMinutes: true },
    })

    // Heures déjà prises (format "HH:MM")
    const heuresPrises = new Set(
      sessionsExistantes.map(s => {
        const d = new Date(s.scheduledAt)
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      })
    )

    // ── 4. Filtrer — ne garder que les créneaux dans le futur et libres ──
    const maintenant = new Date()
    const bufferMinutes = 60 // Pas de réservation moins d'1h avant

    const creneauxLibres = creneauxJour.filter(heure => {
      if (heuresPrises.has(heure)) return false

      const [h, m] = heure.split(':').map(Number)
      const creneauDate = new Date(year, month - 1, day, h, m, 0)
      return creneauDate.getTime() > maintenant.getTime() + bufferMinutes * 60_000
    })

    // ── 5. Enrichir avec les infos de réservation ────────────────
    const creneauxEnrichis = creneauxLibres.map(heure => {
      const [h, m] = heure.split(':').map(Number)
      const dt = new Date(year, month - 1, day, h, m, 0)
      return {
        heure,
        iso:       dt.toISOString(),
        disponible: true,
      }
    })

    return NextResponse.json({
      creneaux: creneauxEnrichis,
      date:     dateParam,
      jour:     jourSemaine,
    })

  } catch (error) {
    console.error('Erreur créneaux:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
