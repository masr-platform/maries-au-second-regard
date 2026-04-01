export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { genererEmbedding, invaliderCacheUser, trouverMeilleursMatchs } from '@/lib/ai-matching'

// ══════════════════════════════════════════════════════════════════
// SCHÉMA ZOD — Validation complète des 50+ champs du questionnaire
// Tous les champs sont optionnels pour permettre la sauvegarde
// progressive, SAUF les 7 champs obligatoires pour le matching IA.
// ══════════════════════════════════════════════════════════════════

const QuestionnaireSchema = z.object({

  // ── Section 1 : Identité & Foi ─────────────────────────────────
  niveauPratique: z.enum(['debutant', 'pratiquant', 'tres_pratiquant', 'savant']).optional(),
  ecoleJurisprudentielle: z.enum(['maliki', 'hanafi', 'chafii', 'hanbali', 'autre']).optional(),
  foiCentraleDecisions: z.boolean().optional(),
  acceptePratiqueDiff:  z.boolean().optional(),
  descriptionFoi:       z.string().max(2000).optional(),

  // ── Section 2 : Projet Conjugal ────────────────────────────────
  objectifMariage: z.enum(['mariage_uniquement', 'mariage_apres', 'engagement_progressif']).optional(),
  souhaitEnfants:  z.boolean().optional(),
  nombreEnfantsSouhaite: z.number().int().min(0).max(20).optional(),
  delaiEnfants:    z.string().max(100).optional(),
  modeVieSouhaite: z.enum(['homme_foyer', 'double_carriere', 'flexible']).optional(),
  villeSouhaitee:  z.string().max(100).optional(),
  mobilitePossible: z.boolean().optional(),
  proximiteFamily:  z.number().int().min(1).max(5).optional(),
  visionPolygamie:  z.string().max(500).optional(),
  visionComplementarite: z.string().max(2000).optional(),

  // ── Section 3 : Personnalité & Communication ───────────────────
  gestionConflits:    z.enum(['evitement', 'discussion', 'mediation', 'autre']).optional(),
  niveauExtraversion: z.number().int().min(1).max(10).optional(),
  langageAmour: z.enum(['paroles', 'service', 'cadeaux', 'temps', 'contact_physique']).optional(),
  independanceCouple: z.number().int().min(1).max(5).optional(),
  rapportAutorite:    z.string().max(1000).optional(),
  intolerances:       z.string().max(2000).optional(),
  forcesPersonnelles: z.string().max(2000).optional(),

  // ── Section 4 : Style de Vie ───────────────────────────────────
  fumeur:           z.boolean().optional(),
  consommeAlcool:   z.boolean().optional(),
  activitePhysique: z.enum(['reguliere', 'occasionnelle', 'aucune']).optional(),
  regimeAlimentaire: z.enum(['halal_strict', 'halal_convenable', 'vegetarien']).optional(),
  loisirs:          z.string().max(2000).optional(),
  cercleSocial:     z.enum(['mixte', 'non_mixte', 'les_deux']).optional(),
  rapportReseaux:   z.enum(['actif', 'discret', 'aucun']).optional(),
  importanceVoyage: z.number().int().min(1).max(5).optional(),

  // ── Section 5 : Formation & Carrière ──────────────────────────
  niveauEtudes:          z.string().max(100).optional(),
  profession:            z.string().max(200).optional(),
  situationFinanciere:   z.enum(['precaire', 'stable', 'confortable', 'aisee']).optional(),
  ambitionsPro:          z.enum(['stabilite', 'croissance', 'entrepreneuriat']).optional(),
  visionFinancesCouple:  z.string().max(2000).optional(),

  // ── Section 6 : Apparence & Critères ──────────────────────────
  taille:                z.number().int().min(100).max(250).optional(),
  silhouette:            z.string().max(100).optional(),
  couleurYeux:           z.string().max(50).optional(),
  couleurCheveux:        z.string().max(50).optional(),
  portVoile:             z.boolean().optional(),
  portBarbe:             z.boolean().optional(),
  criteresPhysiques:     z.string().max(2000).optional(),
  accepteEnfantsPrevious: z.boolean().optional(),
  accepteDivorce:        z.boolean().optional(),
  accepteConverti:       z.boolean().optional(),

  // ── Section 7 : Questions Profondes ───────────────────────────
  partenaireIdeal5Mots:  z.string().max(500).optional(),
  peurMariage:           z.string().max(2000).optional(),
  sourceBonheur:         z.string().max(2000).optional(),
  valeurIslamiqueVoulue: z.string().max(2000).optional(),
  descriptionEntourage:  z.string().max(2000).optional(),
  visionFoyer:           z.string().max(2000).optional(),
  messageConjoint:       z.string().max(2000).optional(),
})

// Champs OBLIGATOIRES pour que le matching IA soit possible
const CHAMPS_REQUIS_MATCHING = [
  'niveauPratique',
  'objectifMariage',
  'souhaitEnfants',
  'gestionConflits',
  'modeVieSouhaite',
  'situationFinanciere',
  'langageAmour',
] as const

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // ── Validation Zod ─────────────────────────────────────────────
    const parsed = QuestionnaireSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        error: 'Données invalides',
        details: parsed.error.flatten().fieldErrors,
      }, { status: 422 })
    }

    const data   = parsed.data
    const userId = session.user.id

    // Vérifier si c'est une soumission finale (tous les champs requis présents)
    const estComplet = CHAMPS_REQUIS_MATCHING.every((champ) => data[champ] !== undefined)

    // Sauvegarder les réponses
    const reponse = await prisma.questionnaireReponse.upsert({
      where:  { userId },
      update: {
        ...data,
        ...(estComplet ? { completedAt: new Date() } : {}),
        updatedAt: new Date(),
      },
      create: {
        userId,
        ...data,
        ...(estComplet ? { completedAt: new Date() } : {}),
      },
    })

    // Marquer le questionnaire comme complété uniquement si tous les champs requis sont présents
    if (estComplet) {
      await prisma.user.update({
        where: { id: userId },
        data:  { questionnaireCompleted: true },
      })

      // Générer l'embedding + déclencher le matching IA en arrière-plan
      waitUntil(
        (async () => {
          try {
            const embedding = await genererEmbedding(reponse)
            await prisma.questionnaireReponse.update({
              where: { userId },
              data: {
                embeddingVector:    JSON.stringify(embedding),
                embeddingUpdatedAt: new Date(),
              },
            })
            await invaliderCacheUser(userId)
            console.log(`Embedding généré pour userId=${userId} (${embedding.length} dims)`)

            const user = await prisma.user.findUnique({
              where:  { id: userId },
              select: { genre: true, profilesParSemaine: true },
            })
            if (!user) return

            const meilleurs = await trouverMeilleursMatchs(userId, user.profilesParSemaine ?? 1)
            if (meilleurs.length === 0) {
              console.log(`Aucun match trouvé pour userId=${userId}`)
              return
            }

            await Promise.all(
              meilleurs.map(async ({ userId: candidatId, score }) => {
                const [u1, u2] = [userId, candidatId].sort()
                return prisma.match.upsert({
                  where:  { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
                  create: {
                    user1Id: u1, user2Id: u2,
                    scoreGlobal:         score.scoreGlobal,
                    scoresFoi:           score.dimensions.foi,
                    scoresPersonalite:   score.dimensions.personnalite,
                    scoresProjetVie:     score.dimensions.projetVie,
                    scoresCommunication: score.dimensions.communication,
                    scoresStyleVie:      score.dimensions.styleVie,
                    scoresCarriere:      score.dimensions.carriere,
                    scoresPhysique:      score.dimensions.physique,
                    dimensionDetails:    JSON.stringify(score.dimensions),
                    status:              'PROPOSE',
                  },
                  update: {},
                })
              })
            )

            await Promise.all(
              meilleurs.map(async ({ userId: candidatId, score }) =>
                prisma.notification.createMany({
                  data: [
                    {
                      userId,
                      type:    'NOUVEAU_MATCH',
                      titre:   'Un profil compatible a été trouvé !',
                      contenu: `Notre IA a identifié un profil compatible à ${score.scoreGlobal}%.`,
                      data:    JSON.stringify({ score: score.scoreGlobal }),
                    },
                    {
                      userId:  candidatId,
                      type:    'NOUVEAU_MATCH',
                      titre:   'Un profil compatible vous attend !',
                      contenu: `Notre IA a identifié un profil compatible à ${score.scoreGlobal}%.`,
                      data:    JSON.stringify({ score: score.scoreGlobal }),
                    },
                  ],
                })
              )
            )

            console.log(`${meilleurs.length} match(s) créé(s) pour userId=${userId}`)
          } catch (err) {
            console.error('Erreur post-questionnaire async:', err)
          }
        })()
      )
    }

    return NextResponse.json({
      success:    true,
      complet:    estComplet,
      message:    estComplet
        ? 'Questionnaire complété. Notre IA analyse votre profil.'
        : 'Réponses sauvegardées.',
    })

  } catch (error) {
    console.error('Erreur sauvegarde questionnaire:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
