import { NextRequest, NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { genererEmbedding, invaliderCacheUser, trouverMeilleursMatchs } from '@/lib/ai-matching'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const data = await req.json()
    const userId = session.user.id

    // Sauvegarder les réponses
    const reponse = await prisma.questionnaireReponse.upsert({
      where:  { userId },
      update: {
        ...mapDataToSchema(data),
        completedAt: new Date(),
        updatedAt:   new Date(),
      },
      create: {
        userId,
        ...mapDataToSchema(data),
        completedAt: new Date(),
      },
    })

    // Marquer le questionnaire comme complété
    await prisma.user.update({
      where: { id: userId },
      data:  { questionnaireCompleted: true },
    })

    // Générer l'embedding + déclencher le matching IA en arrière-plan
    waitUntil(
      (async () => {
        try {
          // 1. Générer le vecteur d'embedding
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

          // 2. Calculer et créer les matchs automatiquement
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { genre: true, profilesParSemaine: true },
          })
          if (!user) return

          const meilleurs = await trouverMeilleursMatchs(userId, user.profilesParSemaine ?? 1)
          if (meilleurs.length === 0) {
            console.log(`Aucun match trouvé pour userId=${userId}`)
            return
          }

          // Créer les matchs en base
          await Promise.all(
            meilleurs.map(async ({ userId: candidatId, score }) => {
              const [u1, u2] = [userId, candidatId].sort()
              return prisma.match.upsert({
                where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
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

          // Notifier les deux utilisateurs
          await Promise.all(
            meilleurs.map(async ({ userId: candidatId, score }) => {
              return prisma.notification.createMany({
                data: [
                  {
                    userId,
                    type: 'NOUVEAU_MATCH',
                    titre: 'Un profil compatible a été trouvé !',
                    contenu: `Notre IA a identifié un profil compatible à ${score.scoreGlobal}%.`,
                    data: JSON.stringify({ score: score.scoreGlobal }),
                  },
                  {
                    userId: candidatId,
                    type: 'NOUVEAU_MATCH',
                    titre: 'Un profil compatible vous attend !',
                    contenu: `Notre IA a identifié un profil compatible à ${score.scoreGlobal}%.`,
                    data: JSON.stringify({ score: score.scoreGlobal }),
                  },
                ],
              })
            })
          )

          console.log(`${meilleurs.length} match(s) créé(s) pour userId=${userId}`)
        } catch (err) {
          console.error('Erreur post-questionnaire async:', err)
        }
      })()
    )

    return NextResponse.json({
      success: true,
      message: 'Questionnaire sauvegardé. Notre IA analyse votre profil.',
    })

  } catch (error) {
    console.error('Erreur sauvegarde questionnaire:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Mapping des données du formulaire vers le schéma Prisma
function mapDataToSchema(data: Record<string, unknown>) {
  return {
    niveauPratique:          data.niveauPratique as string,
    ecoleJurisprudentielle:  data.ecoleJurisprudentielle as string,
    foiCentraleDecisions:    data.foiCentraleDecisions as boolean,
    acceptePratiqueDiff:     data.acceptePratiqueDiff as boolean,
    descriptionFoi:          data.descriptionFoi as string,

    objectifMariage:         data.objectifMariage as string,
    souhaitEnfants:          data.souhaitEnfants as boolean,
    nombreEnfantsSouhaite:   data.nombreEnfantsSouhaite as number,
    modeVieSouhaite:         data.modeVieSouhaite as string,
    villeSouhaitee:          data.villeSouhaitee as string,
    mobilitePossible:        data.mobilitePossible as boolean,
    proximiteFamily:         data.proximiteFamily as number,
    visionComplementarite:   data.visionComplementarite as string,

    gestionConflits:         data.gestionConflits as string,
    niveauExtraversion:      data.niveauExtraversion as number,
    langageAmour:            data.langageAmour as string,
    independanceCouple:      data.independanceCouple as number,
    forcesPersonnelles:      data.forcesPersonnelles as string,
    intolerances:            data.intolerances as string,
    rapportAutorite:         data.rapportAutorite as string,
    peurMariage:             data.peurMariage as string,
    messageConjoint:         data.messageConjoint as string,

    fumeur:                  data.fumeur as boolean,
    consommeAlcool:          data.consommeAlcool as boolean,
    activitePhysique:        data.activitePhysique as string,
    loisirs:                 data.loisirs as string,
    cercleSocial:            data.cercleSocial as string,
    importanceVoyage:        data.importanceVoyage as number,
    sourceBonheur:           data.sourceBonheur as string,

    niveauEtudes:            data.niveauEtudes as string,
    situationFinanciere:     data.situationFinanciere as string,
    ambitionsPro:            data.ambitionsPro as string,
    visionFinancesCouple:    data.visionFinancesCouple as string,

    taille:                  data.taille as number,
    silhouette:              data.silhouette as string,
    accepteEnfantsPrevious:  data.accepteEnfantsPrevious as boolean,
    accepteDivorce:          data.accepteDivorce as boolean,
    accepteConverti:         data.accepteConverti as boolean,
    partenaireIdeal5Mots:    data.partenaireIdeal5Mots as string,
    visionFoyer:             data.visionFoyer as string,
    valeurIslamiqueVoulue:   data.valeurIslamiqueVoulue as string,
  }
}
