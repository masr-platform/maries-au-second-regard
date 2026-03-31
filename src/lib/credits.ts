// ─── Crédits de profils supplémentaires ───────────────────────────────────────
// Utilisé quand un utilisateur achète un pack one-time depuis /abonnement
// (checkout.session.completed avec mode 'payment')

import { prisma } from './prisma'

// Packs disponibles — alignés avec la page /abonnement
const PACKS: Record<string, { profiles: number }> = {
  PACK_3:  { profiles: 3  },
  PACK_10: { profiles: 10 },
  PACK_20: { profiles: 20 },
}

/**
 * Ajoute des crédits de profils après un achat one-time.
 * Incrémente `profilesParSemaine` temporairement (crédit consommable).
 * Les crédits sont ajoutés au quota existant de l'utilisateur.
 */
export async function addProfilCredits(
  userId: string,
  pack: string
): Promise<void> {
  const packData = PACKS[pack]
  if (!packData) {
    console.error(`[Credits] Pack inconnu: ${pack}`)
    return
  }

  try {
    await prisma.$transaction([
      // Incrémenter le quota hebdomadaire de l'utilisateur
      prisma.user.update({
        where: { id: userId },
        data: {
          profilesParSemaine: { increment: packData.profiles },
        },
      }),
      // Créer une notification in-app
      prisma.notification.create({
        data: {
          userId,
          type:    'ABONNEMENT',
          titre:   `+${packData.profiles} profils ajoutés`,
          contenu: `Votre pack de ${packData.profiles} profils supplémentaires a été activé. Bonne rencontre !`,
          data:    JSON.stringify({ pack, profiles: packData.profiles }),
        },
      }),
    ])

    console.log(`[Credits] Pack ${pack} activé pour user ${userId}: +${packData.profiles} profils`)
  } catch (error) {
    console.error('[Credits] Erreur activation pack:', error)
    throw error
  }
}
