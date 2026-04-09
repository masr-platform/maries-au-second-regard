export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ─── GET — Profil complet d'un utilisateur ───────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!['ADMIN', 'SUPER_ADMIN', 'MODERATEUR'].includes(session?.user?.role || '')) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true, prenom: true, email: true, genre: true,
        dateNaissance: true, ville: true, pays: true, origine: true,
        phone: true, photos: true, photoUrl: true, photoApproved: true,
        plan: true, role: true, isVerified: true, isBanned: true,
        isSuspended: true, banReason: true,
        questionnaireCompleted: true, profileCompleted: true,
        waliEnabled: true, waliEmail: true, waliNom: true,
        createdAt: true, lastActiveAt: true,
        questionnaireReponse: {
          select: {
            niveauPratique: true, ecoleJurisprudentielle: true, foiCentraleDecisions: true,
            objectifMariage: true, souhaitEnfants: true, nombreEnfantsSouhaite: true,
            modeVieSouhaite: true, villeSouhaitee: true, mobilitePossible: true,
            visionPolygamie: true, visionComplementarite: true,
            gestionConflits: true, niveauExtraversion: true, langageAmour: true,
            independanceCouple: true, intolerances: true,
            fumeur: true, consommeAlcool: true, activitePhysique: true, cercleSocial: true,
            niveauEtudes: true, profession: true, situationFinanciere: true, ambitionsPro: true,
            taille: true, portVoile: true, portBarbe: true,
            accepteEnfantsPrevious: true, accepteDivorce: true, accepteConverti: true,
            partenaireIdeal5Mots: true, peurMariage: true, sourceBonheur: true,
            valeurIslamiqueVoulue: true, visionFoyer: true, messageConjoint: true,
            completedAt: true,
          },
        },
      },
    })

    if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })

    const [
      matchCount, convCount, sessionCount, signalementCount,
      subscriptions, matchs, conversations, sessions,
    ] = await Promise.all([
      // Comptages
      prisma.match.count({ where: { OR: [{ user1Id: params.id }, { user2Id: params.id }] } }),
      prisma.conversation.count({ where: { OR: [{ user1Id: params.id }, { user2Id: params.id }] } }),
      prisma.imamSession.count({ where: { OR: [{ user1Id: params.id }, { user2Id: params.id }] } }),
      prisma.signalement.count({ where: { OR: [{ signaleurId: params.id }, { signaleId: params.id }] } }),

      // Abonnements Stripe
      prisma.subscription.findMany({
        where: { userId: params.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, plan: true, status: true,
          stripeSubscriptionId: true, stripePriceId: true,
          currentPeriodStart: true, currentPeriodEnd: true,
          cancelAtPeriodEnd: true, cancelledAt: true,
          createdAt: true, profilesParSemaine: true,
        },
      }),

      // Derniers matchs avec partenaire
      prisma.match.findMany({
        where: { OR: [{ user1Id: params.id }, { user2Id: params.id }] },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, scoreGlobal: true, status: true,
          user1Reponse: true, user2Reponse: true, createdAt: true,
          user1: { select: { id: true, prenom: true, genre: true } },
          user2: { select: { id: true, prenom: true, genre: true } },
        },
      }),

      // Dernières conversations
      prisma.conversation.findMany({
        where: { OR: [{ user1Id: params.id }, { user2Id: params.id }] },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: {
          id: true, etape: true, messageCount: true,
          isFlagged: true, isBlocked: true,
          createdAt: true, updatedAt: true,
          user1: { select: { id: true, prenom: true } },
          user2: { select: { id: true, prenom: true } },
        },
      }),

      // Dernières sessions mouqabala
      prisma.imamSession.findMany({
        where: { OR: [{ user1Id: params.id }, { user2Id: params.id }] },
        orderBy: { scheduledAt: 'desc' },
        take: 10,
        select: {
          id: true, scheduledAt: true, dureeMinutes: true,
          status: true, createdAt: true,
          imam: { select: { prenom: true, nom: true } },
          user1: { select: { id: true, prenom: true } },
          user2: { select: { id: true, prenom: true } },
        },
      }),
    ])

    const age = user.dateNaissance
      ? Math.floor((Date.now() - new Date(user.dateNaissance).getTime()) / (365.25 * 24 * 3600 * 1000))
      : null

    return NextResponse.json({
      user: {
        ...user, age,
        stats: { matchCount, convCount, sessionCount, signalementCount },
        subscriptions,
        matchs,
        conversations,
        sessions,
      },
    })
  } catch (error) {
    console.error('Erreur GET admin user:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── PATCH — Actions sur un utilisateur ─────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!['ADMIN', 'SUPER_ADMIN', 'MODERATEUR'].includes(session?.user?.role || '')) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { action } = await req.json() as { action: 'verify' | 'suspend' | 'ban' | 'unban' }
  const userId = params.id

  try {
    switch (action) {
      case 'verify':
        await prisma.user.update({
          where: { id: userId },
          data:  { isVerified: true },
        })
        break

      case 'suspend':
        await prisma.user.update({
          where: { id: userId },
          data:  { isSuspended: true },
        })
        break

      case 'ban':
        await prisma.user.update({
          where: { id: userId },
          data:  { isBanned: true, isSuspended: true },
        })
        // Notifier l'utilisateur
        await prisma.notification.create({
          data: {
            userId,
            type:    'SYSTEME',
            titre:   'Compte suspendu',
            contenu: 'Votre compte a été suspendu suite à une violation des CGU. Contactez le support pour plus d\'informations.',
          },
        }).catch(() => {})
        break

      case 'unban':
        await prisma.user.update({
          where: { id: userId },
          data:  { isBanned: false, isSuspended: false },
        })
        break

      default:
        return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }

    return NextResponse.json({ success: true, action, userId })
  } catch (error) {
    console.error('Erreur action admin user:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
