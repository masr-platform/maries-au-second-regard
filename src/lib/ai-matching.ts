// ══════════════════════════════════════════════════════════════════
// MOTEUR IA DE MATCHING — Cœur de la plateforme
// Calcule les scores de compatibilité entre deux profils
// Architecture : vectorisation OpenAI + scoring multi-dimensionnel
// ══════════════════════════════════════════════════════════════════

import OpenAI from 'openai'
import { prisma } from './prisma'
import { cacheGet, cacheSet, cacheDel, CACHE_TTL } from './redis'
import type { QuestionnaireReponse, User } from '@prisma/client'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ─── Poids des dimensions (total = 100%) ──────────────────────────
const DIMENSION_WEIGHTS = {
  foi:            0.25,  // 25%
  personnalite:   0.20,  // 20%
  projetVie:      0.20,  // 20%
  communication:  0.15,  // 15%
  styleVie:       0.10,  // 10%
  carriere:       0.05,  //  5%
  physique:       0.05,  //  5%
}

// Seuil minimum pour être proposé
export const SCORE_MINIMUM = 60
// Seuil "forte compatibilité"
export const SCORE_FORTE_COMPATIBILITE = 75

// ─── Types ────────────────────────────────────────────────────────
export interface DimensionScores {
  foi:           number
  personnalite:  number
  projetVie:     number
  communication: number
  styleVie:      number
  carriere:      number
  physique:      number
}

export interface ExplicationCompatibilite {
  explication:      string     // 2-3 phrases en langage humain
  pointsForts:      string[]   // 3 points forts (ex: "Foi commune", "Projet de vie partagé")
  pointsAttention:  string[]   // 0-2 points d'attention (ex: "Villes différentes")
}

export interface MatchResult {
  scoreGlobal:      number
  dimensions:       DimensionScores
  forteCompatibilite: boolean
  filtresBloquants: string[]
  recommande:       boolean
  explication?:     ExplicationCompatibilite
}

// ─── 1. Générer l'embedding d'un profil ───────────────────────────
export async function genererEmbedding(reponses: QuestionnaireReponse): Promise<number[]> {
  const texte = construireTexteEmbedding(reponses)

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texte,
  })

  return response.data[0].embedding
}

function construireTexteEmbedding(r: QuestionnaireReponse): string {
  // Construction du texte représentatif du profil pour l'embedding
  const parties = [
    r.niveauPratique       ? `Pratique islamique: ${r.niveauPratique}` : '',
    r.ecoleJurisprudentielle ? `École: ${r.ecoleJurisprudentielle}` : '',
    r.visionComplementarite ? `Vision du couple: ${r.visionComplementarite}` : '',
    r.objectifMariage      ? `Objectif: ${r.objectifMariage}` : '',
    r.modeVieSouhaite      ? `Mode de vie souhaité: ${r.modeVieSouhaite}` : '',
    r.gestionConflits      ? `Gestion des conflits: ${r.gestionConflits}` : '',
    r.langageAmour         ? `Langage de l'amour: ${r.langageAmour}` : '',
    r.loisirs              ? `Loisirs: ${r.loisirs}` : '',
    r.ambitionsPro         ? `Ambitions: ${r.ambitionsPro}` : '',
    r.partenaireIdeal5Mots ? `Partenaire idéal: ${r.partenaireIdeal5Mots}` : '',
    r.peurMariage          ? `Peur du mariage: ${r.peurMariage}` : '',
    r.sourceBonheur        ? `Source de bonheur: ${r.sourceBonheur}` : '',
    r.valeurIslamiqueVoulue ? `Valeur islamique souhaitée: ${r.valeurIslamiqueVoulue}` : '',
    r.visionFoyer          ? `Vision du foyer: ${r.visionFoyer}` : '',
    r.messageConjoint      ? `Message au conjoint: ${r.messageConjoint}` : '',
  ].filter(Boolean)

  return parties.join('. ')
}

// ─── 2. Score de similitude vectorielle (cosine) ──────────────────
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0
}

// ─── 3. Scoring par dimension ─────────────────────────────────────
function scorerFoi(r1: QuestionnaireReponse, r2: QuestionnaireReponse): number {
  let score = 50 // base
  const poids = { pratique: 40, ecole: 20, foi_centrale: 20, tolerance: 20 }

  // Niveau de pratique
  const niveaux = { debutant: 1, pratiquant: 2, tres_pratiquant: 3, savant: 4 }
  const n1 = niveaux[r1.niveauPratique as keyof typeof niveaux] ?? 2
  const n2 = niveaux[r2.niveauPratique as keyof typeof niveaux] ?? 2
  const diffPratique = Math.abs(n1 - n2)
  const scorePratique = Math.max(0, 100 - diffPratique * 25)

  // École juridique
  const memeEcole = r1.ecoleJurisprudentielle === r2.ecoleJurisprudentielle
  const scoreEcole = memeEcole ? 100 : 60

  // Foi centrale dans les décisions
  const scoreFoiCentrale = r1.foiCentraleDecisions === r2.foiCentraleDecisions ? 100 : 40

  // Tolérance différence de pratique
  const scoreTolerance = (r1.acceptePratiqueDiff || r2.acceptePratiqueDiff) ? 80 : 50

  return (
    scorePratique   * (poids.pratique     / 100) +
    scoreEcole      * (poids.ecole        / 100) +
    scoreFoiCentrale * (poids.foi_centrale / 100) +
    scoreTolerance  * (poids.tolerance    / 100)
  )
}

function scorerPersonnalite(r1: QuestionnaireReponse, r2: QuestionnaireReponse): number {
  let score = 50

  // Extraversion (complémentarité optimale : pas identique, pas trop différent)
  if (r1.niveauExtraversion && r2.niveauExtraversion) {
    const diff = Math.abs(r1.niveauExtraversion - r2.niveauExtraversion)
    score = diff <= 2 ? 90 : diff <= 4 ? 70 : diff <= 6 ? 50 : 30
  }

  // Langage de l'amour (même langage = fort match)
  if (r1.langageAmour && r2.langageAmour) {
    const bonus = r1.langageAmour === r2.langageAmour ? 15 : 0
    score = Math.min(100, score + bonus)
  }

  // Indépendance dans le couple (complémentarité)
  if (r1.independanceCouple && r2.independanceCouple) {
    const diff = Math.abs(r1.independanceCouple - r2.independanceCouple)
    const scorInd = diff <= 1 ? 90 : diff <= 2 ? 70 : 50
    score = (score + scorInd) / 2
  }

  return Math.max(0, Math.min(100, score))
}

function scorerProjetVie(r1: QuestionnaireReponse, r2: QuestionnaireReponse): number {
  let score = 70 // base positive

  // Objectif mariage (critique)
  if (r1.objectifMariage && r2.objectifMariage) {
    if (r1.objectifMariage === r2.objectifMariage) score += 15
    else if (
      (r1.objectifMariage === 'mariage_uniquement' && r2.objectifMariage === 'mariage_apres') ||
      (r2.objectifMariage === 'mariage_uniquement' && r1.objectifMariage === 'mariage_apres')
    ) score += 5
    else score -= 20
  }

  // Enfants
  if (r1.souhaitEnfants !== null && r2.souhaitEnfants !== null) {
    if (r1.souhaitEnfants === r2.souhaitEnfants) score += 10
    else score -= 15
  }

  // Nombre d'enfants souhaité (si renseigné)
  if (r1.nombreEnfantsSouhaite && r2.nombreEnfantsSouhaite) {
    const diff = Math.abs(r1.nombreEnfantsSouhaite - r2.nombreEnfantsSouhaite)
    if (diff === 0) score += 5
    else if (diff > 2) score -= 5
  }

  // Mode de vie souhaité
  if (r1.modeVieSouhaite && r2.modeVieSouhaite) {
    if (r1.modeVieSouhaite === r2.modeVieSouhaite) score += 10
    else if (r1.modeVieSouhaite === 'flexible' || r2.modeVieSouhaite === 'flexible') score += 5
  }

  // Mobilité géographique
  if (r1.mobilitePossible !== null && r2.mobilitePossible !== null) {
    if (r1.mobilitePossible === r2.mobilitePossible) score += 5
    else if (r1.mobilitePossible || r2.mobilitePossible) score += 2
    else score -= 10
  }

  return Math.max(0, Math.min(100, score))
}

function scorerCommunication(r1: QuestionnaireReponse, r2: QuestionnaireReponse): number {
  let score = 65

  // Gestion des conflits (complémentarité idéale : discussion + médiation)
  if (r1.gestionConflits && r2.gestionConflits) {
    const bons = ['discussion', 'mediation']
    const r1Bon = bons.includes(r1.gestionConflits)
    const r2Bon = bons.includes(r2.gestionConflits)

    if (r1Bon && r2Bon) score += 20
    else if (r1Bon || r2Bon) score += 5
    else if (r1.gestionConflits === 'evitement' && r2.gestionConflits === 'evitement') score -= 15
  }

  // Indépendance & autorité (cohérence de valeurs)
  if (r1.independanceCouple && r2.independanceCouple) {
    const diff = Math.abs(r1.independanceCouple - r2.independanceCouple)
    if (diff <= 1) score += 10
    else if (diff >= 3) score -= 10
  }

  return Math.max(0, Math.min(100, score))
}

function scorerStyleVie(r1: QuestionnaireReponse, r2: QuestionnaireReponse): number {
  let score = 70

  // Points bloquants
  if (r1.fumeur !== r2.fumeur) score -= 20
  if (r1.consommeAlcool !== r2.consommeAlcool) score -= 25

  // Activité physique (tolérance)
  if (r1.activitePhysique && r2.activitePhysique) {
    if (r1.activitePhysique === r2.activitePhysique) score += 10
    else if (
      r1.activitePhysique === 'aucune' && r2.activitePhysique === 'reguliere' ||
      r2.activitePhysique === 'aucune' && r1.activitePhysique === 'reguliere'
    ) score -= 5
  }

  // Cercle social
  if (r1.cercleSocial && r2.cercleSocial) {
    if (r1.cercleSocial === r2.cercleSocial || r1.cercleSocial === 'les_deux' || r2.cercleSocial === 'les_deux') {
      score += 10
    }
  }

  // Importance du voyage
  if (r1.importanceVoyage && r2.importanceVoyage) {
    const diff = Math.abs(r1.importanceVoyage - r2.importanceVoyage)
    if (diff <= 1) score += 5
    else if (diff >= 3) score -= 5
  }

  return Math.max(0, Math.min(100, score))
}

function scorerCarriere(r1: QuestionnaireReponse, r2: QuestionnaireReponse): number {
  let score = 70

  if (r1.ambitionsPro && r2.ambitionsPro) {
    if (r1.ambitionsPro === r2.ambitionsPro) score += 15
    else if (
      (r1.ambitionsPro === 'entrepreneuriat' && r2.ambitionsPro === 'croissance') ||
      (r2.ambitionsPro === 'entrepreneuriat' && r1.ambitionsPro === 'croissance')
    ) score += 8
  }

  return Math.max(0, Math.min(100, score))
}

function scorerPhysique(r1: QuestionnaireReponse, r2: QuestionnaireReponse): number {
  let score = 75 // Majorité positive — c'est un facteur mineur

  // On vérifie les critères déclaratifs (ex: veut quelqu'un qui porte le voile)
  // Les critères sont non-bloquants mais influencent le score

  if (r1.portVoile !== undefined && r2.portVoile !== undefined) {
    // Cohérence entre les attentes (simplifiée)
    score += 10
  }

  return Math.max(0, Math.min(100, score))
}

// ─── 4. Filtres bloquants absolus ─────────────────────────────────
function verifierFiltresBloquants(
  r1: QuestionnaireReponse,
  r2: QuestionnaireReponse,
  u1: User,
  u2: User
): string[] {
  const blocages: string[] = []

  // Même genre → jamais
  if (u1.genre === u2.genre) blocages.push('MEME_GENRE')

  // Fumeur si l'autre ne tolère pas
  if (r1.fumeur && r2.intolerances?.includes('fumeur')) blocages.push('FUMEUR_NON_TOLERE')
  if (r2.fumeur && r1.intolerances?.includes('fumeur')) blocages.push('FUMEUR_NON_TOLERE')

  // Alcool si l'autre ne tolère pas
  if (r1.consommeAlcool && r2.intolerances?.includes('alcool')) blocages.push('ALCOOL_NON_TOLERE')
  if (r2.consommeAlcool && r1.intolerances?.includes('alcool')) blocages.push('ALCOOL_NON_TOLERE')

  // Enfants issus d'une précédente union
  if (u1.questionnaireCompleted && !r2.accepteEnfantsPrevious) {
    // Vérification simplifiée — à enrichir avec un champ 'aEnfants' sur le profil
  }

  // Divorcé
  if (!r2.accepteDivorce && r1.objectifMariage === 'engagement_progressif') {
    // Tolérance sur ce point
  }

  return blocages
}

// ─── 5. Explication IA en langage humain ──────────────────────────
export async function genererExplicationCompatibilite(
  r1: QuestionnaireReponse,
  r2: QuestionnaireReponse,
  dimensions: DimensionScores
): Promise<ExplicationCompatibilite> {
  const cacheKey = `explication:${[r1.userId, r2.userId].sort().join(':')}`
  const cached = await cacheGet<ExplicationCompatibilite>(cacheKey)
  if (cached) return cached

  // Construire le contexte pour GPT
  const pratique1 = r1.niveauPratique?.replace('_', ' ') || 'non renseigné'
  const pratique2 = r2.niveauPratique?.replace('_', ' ') || 'non renseigné'
  const projet1   = r1.objectifMariage?.replace(/_/g, ' ') || 'non renseigné'
  const projet2   = r2.objectifMariage?.replace(/_/g, ' ') || 'non renseigné'

  const dimTriees = Object.entries(dimensions)
    .sort(([, a], [, b]) => b - a)
    .map(([k, v]) => {
      const labels: Record<string, string> = {
        foi: 'Foi & pratique religieuse',
        personnalite: 'Personnalité & caractère',
        projetVie: 'Projet de vie & famille',
        communication: 'Communication & gestion des conflits',
        styleVie: 'Style de vie',
        carriere: 'Carrière & ambitions',
        physique: 'Critères physiques',
      }
      return `${labels[k] || k}: ${Math.round(v)}/100`
    })

  const prompt = `Tu es un conseiller en compatibilité conjugale islamique. Analyse cette compatibilité entre deux profils et génère une explication bienveillante en français.

Scores par dimension:
${dimTriees.join('\n')}

Profil A: pratique="${pratique1}", objectif="${projet1}", foyer="${r1.visionFoyer?.slice(0, 100) || ''}", partenaire idéal="${r1.partenaireIdeal5Mots || ''}"
Profil B: pratique="${pratique2}", objectif="${projet2}", foyer="${r2.visionFoyer?.slice(0, 100) || ''}", partenaire idéal="${r2.partenaireIdeal5Mots || ''}"

Génère UNIQUEMENT un JSON valide sans markdown:
{
  "explication": "2-3 phrases max, chaleureuses et concrètes, qui expliquent POURQUOI ces profils sont compatibles (jamais 'Profil A' ou 'Profil B', parler de 'vous')",
  "pointsForts": ["max 3 points forts très courts (2-4 mots chacun)"],
  "pointsAttention": ["0-2 points d'attention très courts si score <65 sur une dimension importante, sinon tableau vide"]
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    })

    const raw = response.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(raw) as ExplicationCompatibilite

    const result: ExplicationCompatibilite = {
      explication:     parsed.explication     || 'Votre compatibilité repose sur des valeurs partagées et une vision commune du mariage.',
      pointsForts:     Array.isArray(parsed.pointsForts)    ? parsed.pointsForts.slice(0, 3)    : [],
      pointsAttention: Array.isArray(parsed.pointsAttention) ? parsed.pointsAttention.slice(0, 2) : [],
    }

    // Cache 24h — l'explication ne change pas
    await cacheSet(cacheKey, result, 86400)
    return result
  } catch {
    return {
      explication:     'Votre compatibilité repose sur des valeurs partagées et une vision commune du mariage islamique.',
      pointsForts:     ['Valeurs communes', 'Vision du foyer', 'Foi partagée'],
      pointsAttention: [],
    }
  }
}

// ─── 6. CALCUL PRINCIPAL DU SCORE ─────────────────────────────────
export async function calculerCompatibilite(
  userId1: string,
  userId2: string
): Promise<MatchResult | null> {
  // Vérifier le cache d'abord
  const cacheKey = `match:${[userId1, userId2].sort().join(':')}`
  const cached = await cacheGet<MatchResult>(cacheKey)
  if (cached) return cached

  try {
    // Charger les profils
    const [user1, user2] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId1 },
        include: { questionnaireReponse: true },
      }),
      prisma.user.findUnique({
        where: { id: userId2 },
        include: { questionnaireReponse: true },
      }),
    ])

    if (!user1?.questionnaireReponse || !user2?.questionnaireReponse) {
      return null
    }

    const r1 = user1.questionnaireReponse
    const r2 = user2.questionnaireReponse

    // Vérifier les filtres bloquants
    const filtresBloquants = verifierFiltresBloquants(r1, r2, user1, user2)
    if (filtresBloquants.includes('MEME_GENRE')) {
      return { scoreGlobal: 0, dimensions: {} as DimensionScores, forteCompatibilite: false, filtresBloquants, recommande: false }
    }

    // Calculer les scores par dimension
    const dimensions: DimensionScores = {
      foi:           scorerFoi(r1, r2),
      personnalite:  scorerPersonnalite(r1, r2),
      projetVie:     scorerProjetVie(r1, r2),
      communication: scorerCommunication(r1, r2),
      styleVie:      scorerStyleVie(r1, r2),
      carriere:      scorerCarriere(r1, r2),
      physique:      scorerPhysique(r1, r2),
    }

    // Score vectoriel (si les embeddings sont disponibles)
    let bonusVectoriel = 0
    if (r1.embeddingVector && r2.embeddingVector) {
      try {
        const vec1 = JSON.parse(r1.embeddingVector) as number[]
        const vec2 = JSON.parse(r2.embeddingVector) as number[]
        const similarity = cosineSimilarity(vec1, vec2)
        // Convertir la similitude cosine (0-1) en bonus (0-10 points)
        bonusVectoriel = Math.round(similarity * 10)
      } catch {}
    }

    // Score global pondéré
    const scoreGlobal = Math.min(100, Math.round(
      dimensions.foi           * DIMENSION_WEIGHTS.foi +
      dimensions.personnalite  * DIMENSION_WEIGHTS.personnalite +
      dimensions.projetVie     * DIMENSION_WEIGHTS.projetVie +
      dimensions.communication * DIMENSION_WEIGHTS.communication +
      dimensions.styleVie      * DIMENSION_WEIGHTS.styleVie +
      dimensions.carriere      * DIMENSION_WEIGHTS.carriere +
      dimensions.physique      * DIMENSION_WEIGHTS.physique +
      bonusVectoriel
    ))

    const result: MatchResult = {
      scoreGlobal,
      dimensions,
      forteCompatibilite: scoreGlobal >= SCORE_FORTE_COMPATIBILITE,
      filtresBloquants,
      recommande: scoreGlobal >= SCORE_MINIMUM && filtresBloquants.length === 0,
    }

    // Mettre en cache 2h
    await cacheSet(cacheKey, result, CACHE_TTL.MATCH_SCORES)

    return result
  } catch (error) {
    console.error('Erreur calcul compatibilité:', error)
    return null
  }
}

// ─── 7. Trouver les meilleurs matchs pour un utilisateur ──────────
export async function trouverMeilleursMatchs(
  userId: string,
  nombre: number = 3
): Promise<Array<{ userId: string; score: MatchResult }>> {
  const cacheKey = `suggestions:${userId}`
  const cached = await cacheGet<Array<{ userId: string; score: MatchResult }>>(cacheKey)
  if (cached) return cached

  try {
    // Récupérer l'utilisateur et son genre
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { genre: true, questionnaireCompleted: true },
    })

    if (!user?.questionnaireCompleted) return []

    // Genre opposé
    const genreOppose = user.genre === 'HOMME' ? 'FEMME' : 'HOMME'

    // Trouver les candidats potentiels
    const candidats = await prisma.user.findMany({
      where: {
        genre: genreOppose,
        questionnaireCompleted: true,
        // isVerified: true, // désactivé — tous les profils actifs sont analysés
        isBanned: false,
        isSuspended: false,
        // Exclure l'utilisateur lui-même et ses matchs existants
        NOT: { id: userId },
        matchesAsUser1: { none: { user2Id: userId } },
        matchesAsUser2: { none: { user1Id: userId } },
      },
      select: { id: true },
      take: 100,
    })

    // Calculer les scores pour chaque candidat
    const scores = await Promise.all(
      candidats.map(async (c: { id: string }) => {
        const score = await calculerCompatibilite(userId, c.id)
        return { userId: c.id, score }
      })
    )

    // Filtrer et trier par score décroissant
    const eligibles = scores
      .filter((s): s is { userId: string; score: MatchResult } =>
        s.score !== null && s.score.recommande
      )
      .sort((a, b) => b.score.scoreGlobal - a.score.scoreGlobal)
      .slice(0, nombre)

    await cacheSet(cacheKey, eligibles, CACHE_TTL.SUGGESTIONS)

    return eligibles
  } catch (error) {
    console.error('Erreur recherche matchs:', error)
    return []
  }
}

// ─── 8. Invalider le cache d'un utilisateur ───────────────────────
export async function invaliderCacheUser(userId: string): Promise<void> {
  await Promise.all([
    cacheDel(`suggestions:${userId}`),
    cacheDel(`profile:${userId}`),
  ])
}
// openai key configured Fri Mar 27 19:16:25 CET 2026
