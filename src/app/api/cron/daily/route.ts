// ================================================================
// MASR — Cron quotidien (exécuté à 09h00 Europe/Paris via Vercel)
// Déclenche : relance questionnaire, relance inactivité, digest hebdo
// Sécurisé par CRON_SECRET
// ================================================================

export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

// ─── Vérification du secret Vercel Cron ──────────────────────────
function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret) return false // secret manquant = accès refusé même en dev
  return auth === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const maintenant = new Date()
  const results = { questionnaire: 0, inactivite: 0, digest: 0, erreurs: 0 }

  // ─── 1. Relance questionnaire non complété ────────────────────
  // Ciblage : inscrit il y a 24h à 72h, questionnaire non complété, pas banni
  try {
    const hier = new Date(maintenant.getTime() - 24 * 3600 * 1000)
    const ilY3jours = new Date(maintenant.getTime() - 72 * 3600 * 1000)

    const usersIncomplets = await prisma.user.findMany({
      where: {
        questionnaireCompleted: false,
        isBanned: false,
        isSuspended: false,
        createdAt: { gte: ilY3jours, lte: hier },
      },
      select: { id: true, email: true, prenom: true, createdAt: true },
      take: 100, // limite par batch
    })

    for (const user of usersIncomplets) {
      try {
        await emailService.sendQuestionnaireReminder({
          email:  user.email,
          prenom: user.prenom,
          heuresEcoules: Math.round((maintenant.getTime() - user.createdAt.getTime()) / 3600000),
        })
        results.questionnaire++
      } catch { results.erreurs++ }
    }
  } catch (err) {
    console.error('[cron/daily] Erreur relance questionnaire:', err)
    results.erreurs++
  }

  // ─── 2. Relance inactivité (7 jours sans connexion) ──────────
  // Ciblage : questionnaire complété, inactif depuis 7j, pas déjà relancé récemment
  try {
    const il7j = new Date(maintenant.getTime() - 7 * 24 * 3600 * 1000)
    const il14j = new Date(maintenant.getTime() - 14 * 24 * 3600 * 1000)

    const usersInactifs = await prisma.user.findMany({
      where: {
        questionnaireCompleted: true,
        isBanned: false,
        isSuspended: false,
        lastActiveAt: { lte: il7j, gte: il14j }, // inactif entre 7 et 14 jours
      },
      select: { id: true, email: true, prenom: true, lastActiveAt: true },
      take: 50,
    })

    for (const user of usersInactifs) {
      try {
        const joursInactif = Math.round(
          (maintenant.getTime() - (user.lastActiveAt?.getTime() ?? 0)) / (24 * 3600 * 1000)
        )
        await emailService.sendInactivity({ email: user.email, prenom: user.prenom, joursInactif })
        results.inactivite++
      } catch { results.erreurs++ }
    }
  } catch (err) {
    console.error('[cron/daily] Erreur relance inactivité:', err)
    results.erreurs++
  }

  // ─── 3. Digest hebdomadaire (seulement le lundi) ──────────────
  try {
    const estLundi = maintenant.getDay() === 1 // 0=dim, 1=lun...

    if (estLundi) {
      const il7j = new Date(maintenant.getTime() - 7 * 24 * 3600 * 1000)

      const usersActifs = await prisma.user.findMany({
        where: {
          questionnaireCompleted: true,
          isBanned: false,
          isSuspended: false,
          lastActiveAt: { gte: il7j },
        },
        select: { id: true, email: true, prenom: true },
        take: 200,
      })

      for (const user of usersActifs) {
        try {
          // Récupère les stats personnelles de la semaine
          const [nouveauxMatches, messages] = await Promise.all([
            prisma.match.count({
              where: {
                OR: [{ user1Id: user.id }, { user2Id: user.id }],
                createdAt: { gte: il7j },
              },
            }),
            prisma.message.count({
              where: {
                conversation: { OR: [{ user1Id: user.id }, { user2Id: user.id }] },
                createdAt: { gte: il7j },
                senderId: { not: user.id },
              },
            }),
          ])

          if (nouveauxMatches > 0 || messages > 0) {
            await emailService.sendWeeklyDigest({
              email: user.email,
              prenom: user.prenom,
              nouveauxMatches,
              messages,
              vues: 0, // TODO: tracker les vues
            })
            results.digest++
          }
        } catch { results.erreurs++ }
      }
    }
  } catch (err) {
    console.error('[cron/daily] Erreur digest hebdo:', err)
    results.erreurs++
  }

  console.log('[cron/daily] Résultats:', results)

  return NextResponse.json({
    ok: true,
    executedAt: maintenant.toISOString(),
    ...results,
  })
}
