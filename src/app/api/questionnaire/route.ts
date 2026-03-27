import { NextRequest, NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { genererEmbedding, invaliderCacheUser } from '@/lib/ai-matching'

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

    // Générer l'embedding IA en arrière-plan (waitUntil garde la fonction vivante sur Vercel)
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
        } catch (err) {
          console.error('Erreur génération embedding:', err)
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
