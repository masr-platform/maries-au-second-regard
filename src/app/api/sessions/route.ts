export const dynamic = 'force-dynamic'

// ══════════════════════════════════════════════════════════════════
// API Sessions — Mouqabalas virtuelles & sessions imam/thérapie
// POST  /api/sessions  — Créer une session + room Daily.co
// GET   /api/sessions  — Lister ses sessions à venir
// ══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createDailyRoom } from '@/lib/daily'
import { emailService } from '@/lib/email'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// ─── GET — Sessions à venir de l'utilisateur ──────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const statut = searchParams.get('statut') || 'PLANIFIE'

  try {
    const sessions = await prisma.imamSession.findMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id },
        ],
        status: statut as 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE',
      },
      include: {
        imam: {
          include: {
            user: { select: { prenom: true, photoUrl: true } },
          },
        },
        user1: { select: { prenom: true, photoUrl: true } },
        user2: { select: { prenom: true, photoUrl: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 20,
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Erreur récupération sessions:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── POST — Créer une session + room Daily.co ─────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const {
      imamId,
      user2Id,       // Optionnel — présent pour les sessions de couple
      matchId,       // Optionnel — lien vers un match
      type,          // MOUQUABALA | THERAPIE_COUPLE | INDIVIDUEL | SPIRITUEL
      scheduledAt,
      dureeMinutes = 60,
      montant,
    } = await req.json()

    // Validations
    if (!imamId || !type || !scheduledAt || montant === undefined) {
      return NextResponse.json({ error: 'Champs requis manquants (imamId, type, scheduledAt, montant)' }, { status: 400 })
    }

    const typeValide = ['MOUQUABALA', 'THERAPIE_COUPLE', 'INDIVIDUEL', 'SPIRITUEL']
    if (!typeValide.includes(type)) {
      return NextResponse.json({ error: `Type invalide. Valeurs: ${typeValide.join(', ')}` }, { status: 400 })
    }

    const scheduledDate = new Date(scheduledAt)
    if (isNaN(scheduledDate.getTime()) || scheduledDate < new Date()) {
      return NextResponse.json({ error: 'scheduledAt invalide ou dans le passé' }, { status: 400 })
    }

    // Vérifier que l'imam existe et est actif
    const imam = await prisma.praticien.findFirst({
      where: { id: imamId, isVerified: true, isActive: true },
    })
    if (!imam) {
      return NextResponse.json({ error: 'Imam non trouvé ou inactif' }, { status: 404 })
    }

    // Vérifier que l'utilisateur a le droit de créer cette session selon son plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    })

    if (!user || user.plan === 'GRATUIT') {
      return NextResponse.json({
        error: 'Un abonnement est requis pour accéder aux Mouqabalas virtuelles',
      }, { status: 403 })
    }

    // Créer d'abord la session en DB (sans room pour l'instant)
    const newSession = await prisma.imamSession.create({
      data: {
        imamId,
        user1Id:     userId,
        user2Id:     user2Id ?? null,
        matchId:     matchId ?? null,
        type,
        scheduledAt: scheduledDate,
        dureeMinutes,
        montant,
        status:      'PLANIFIE',
      },
    })

    // Créer la room Daily.co (uniquement si DAILY_API_KEY est configuré)
    let dailyRoomUrl:  string | null = null
    let dailyRoomName: string | null = null

    if (process.env.DAILY_API_KEY) {
      try {
        const room = await createDailyRoom({
          sessionId:       newSession.id,
          scheduledAt:     scheduledDate,
          dureeMinutes,
          maxParticipants: type === 'MOUQUABALA' ? 3 : 4,
        })

        dailyRoomUrl  = room.url
        dailyRoomName = room.name

        // Mettre à jour la session avec le lien vidéo
        await prisma.imamSession.update({
          where: { id: newSession.id },
          data:  { dailyRoomUrl, dailyRoomName },
        })
      } catch (dailyError) {
        // Ne pas bloquer la création si Daily.co échoue — on retente lors du rappel
        console.error('[Daily.co] Erreur création room:', dailyError)
      }
    } else {
      console.warn('[Sessions] DAILY_API_KEY non configuré — room vidéo non créée')
    }

    // ── Notifications + emails aux participants ──────────────────
    const dateFormatee = format(scheduledDate, "EEEE d MMMM 'à' HH'h'mm", { locale: fr })
    const superviseurNom = `${imam.type === 'IMAM' ? 'Imam' : 'Dr.'} ${imam.prenom} ${imam.nom}`
    const notifData   = JSON.stringify({
      sessionId:   newSession.id,
      scheduledAt,
      type,
      action:      'DEMANDE_MOUQUABALA',
    })

    // Récupérer les prénoms/emails des deux utilisateurs
    const [user1Data, user2Data] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { prenom: true, email: true } }),
      user2Id
        ? prisma.user.findUnique({ where: { id: user2Id }, select: { prenom: true, email: true } })
        : Promise.resolve(null),
    ])

    // Notif à l'initiateur (user1 — confirmation de planification)
    await prisma.notification.create({
      data: {
        userId:  userId,
        type:    'SESSION_RAPPEL',
        titre:   '📅 Mouqabala planifiée',
        contenu: `Votre mouqabala avec ${superviseurNom} est planifiée ${dateFormatee}.`,
        data:    notifData,
      },
    })

    // Notif + email à user2 (invitation avec boutons Accepter/Décliner)
    if (user2Id && user2Data && user1Data) {
      await prisma.notification.create({
        data: {
          userId:  user2Id,
          type:    'SESSION_RAPPEL',
          titre:   `🤝 ${user1Data.prenom} vous invite à une mouqabala`,
          contenu: `${user1Data.prenom} a planifié une mouqabala ${dateFormatee} encadrée par ${superviseurNom}. Acceptez ou déclinez.`,
          data:    JSON.stringify({
            sessionId:   newSession.id,
            action:      'DEMANDE_MOUQUABALA',
            prenomAutre: user1Data.prenom,
            dateHeure:   dateFormatee,
          }),
        },
      })

      // Email d'invitation non bloquant
      emailService.sendMouquabalaRequest({
        email:        user2Data.email,
        prenom:       user2Data.prenom,
        matchPrenom:  user1Data.prenom,
        sessionId:    newSession.id,
        dateHeure:    dateFormatee,
        dureeMinutes,
        superviseur:  superviseurNom,
      }).catch(err => console.error('[email] sendMouquabalaRequest:', err))
    }

    return NextResponse.json({
      session: { ...newSession, dailyRoomUrl, dailyRoomName },
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur création session:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
