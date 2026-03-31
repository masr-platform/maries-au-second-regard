// ══════════════════════════════════════════════════════════════════
// SUPERVISION IA DES CONVERSATIONS
// Détection automatique des tentatives de fuite hors plateforme
// Signalement des contenus inappropriés
// ══════════════════════════════════════════════════════════════════

import OpenAI from 'openai'
import { prisma } from './prisma'
// FlagType généré par `prisma generate` — défini ici pour le type-check local
type FlagType = 'SNAP' | 'TELEPHONE' | 'RESEAU_SOCIAL' | 'INAPPROPRIE' | 'HARCELEMENT' | 'AUTRE'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ─── Patterns de détection (regex + mots-clés) ────────────────────
const PATTERNS_FUITE = {
  SNAP: [
    /snap(chat)?/i,
    /mon snap/i,
    /sur snap/i,
    /[@]?[a-z0-9._-]+\.(snap|sc)/i,
  ],
  TELEPHONE: [
    /(\+33|0033|06|07)\s*[\d\s\-\.]{8,}/,
    /numéro de téléphone/i,
    /whatsapp/i,
    /telegram/i,
    /appelle-?moi/i,
    /mon numéro/i,
  ],
  RESEAU_SOCIAL: [
    /instagram/i,
    /facebook/i,
    /tiktok/i,
    /twitter/i,
    /linkedin/i,
    /mon insta/i,
    /\bIG\b/i,
    /@[a-zA-Z0-9._]{3,}/,  // @ suivi d'un nom (probablement un handle)
  ],
  INAPPROPRIE: [
    /haram/i,  // mots flagrants (à enrichir selon modération)
  ],
}

// ─── Types ────────────────────────────────────────────────────────
interface AnalyseMessage {
  isFlagged:   boolean
  flagType:    FlagType | null
  flagScore:   number  // 0-1
  flagDetails: string | null
}

// ─── 1. Analyse rapide par regex ─────────────────────────────────
export function analyseRapide(contenu: string): AnalyseMessage {
  const texte = contenu.toLowerCase()

  for (const [type, patterns] of Object.entries(PATTERNS_FUITE)) {
    for (const pattern of patterns) {
      if (pattern.test(texte)) {
        return {
          isFlagged:   true,
          flagType:    type as FlagType,
          flagScore:   0.9,
          flagDetails: `Détection automatique : tentative de partage ${type.toLowerCase()}`
        }
      }
    }
  }

  return { isFlagged: false, flagType: null, flagScore: 0, flagDetails: null }
}

// ─── 2. Analyse approfondie par IA (pour cas ambigus) ─────────────
export async function analyseIA(contenu: string): Promise<AnalyseMessage> {
  if (contenu.length < 10) {
    return { isFlagged: false, flagType: null, flagScore: 0, flagDetails: null }
  }

  try {
    const prompt = `Tu es un système de modération pour une plateforme de rencontre islamique sérieuse.
Analyse ce message et détermine s'il contient :
1. Un numéro de téléphone ou invitation à appeler/WhatsApp/Telegram
2. Un identifiant Snapchat ou invitation à aller sur Snap
3. Un compte Instagram, Facebook, TikTok ou autre réseau social
4. Un contenu inapproprié ou irrespectueux selon les valeurs islamiques

Message : "${contenu}"

Réponds en JSON : { "flagged": boolean, "type": "SNAP|TELEPHONE|RESEAU_SOCIAL|INAPPROPRIE|null", "score": 0.0-1.0, "raison": "..." }`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 150,
      temperature: 0,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

    return {
      isFlagged:   result.flagged ?? false,
      flagType:    result.type !== 'null' ? result.type as FlagType : null,
      flagScore:   result.score ?? 0,
      flagDetails: result.raison ?? null,
    }
  } catch {
    // En cas d'erreur IA, utiliser uniquement la détection regex
    return analyseRapide(contenu)
  }
}

// ─── 3. Pipeline de supervision complet ───────────────────────────
export async function superviserMessage(
  messageId: string,
  conversationId: string,
  contenu: string
): Promise<void> {
  // Analyse rapide d'abord
  const analyseRapideResult = analyseRapide(contenu)

  if (analyseRapideResult.isFlagged) {
    // Signalement immédiat
    await signalerMessage(messageId, conversationId, analyseRapideResult)
    return
  }

  // Si le message est plus long et potentiellement ambigu, analyse IA approfondie
  if (contenu.length > 20) {
    const analyseIAResult = await analyseIA(contenu)
    if (analyseIAResult.isFlagged && analyseIAResult.flagScore > 0.7) {
      await signalerMessage(messageId, conversationId, analyseIAResult)
    }
  }
}

// ─── 4. Signaler un message ────────────────────────────────────────
async function signalerMessage(
  messageId: string,
  conversationId: string,
  analyse: AnalyseMessage
): Promise<void> {
  try {
    await prisma.$transaction([
      // Marquer le message
      prisma.message.update({
        where: { id: messageId },
        data: {
          isFlagged:   true,
          flagType:    analyse.flagType,
          flagScore:   analyse.flagScore,
          flagDetails: analyse.flagDetails,
        },
      }),
      // Marquer la conversation
      prisma.conversation.update({
        where: { id: conversationId },
        data: {
          isFlagged:  true,
          flagReason: analyse.flagDetails,
          flaggedAt:  new Date(),
        },
      }),
    ])

    console.log(`[SUPERVISION] Message ${messageId} signalé: ${analyse.flagType}`)

    // Notifier tous les admins et modérateurs via la table Notification
    const admins = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN', 'MODERATEUR'] }, isBanned: false, isSuspended: false },
      select: { id: true },
    })

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId:  admin.id,
          type:    'MESSAGE_SIGNALE' as const,
          titre:   `⚠️ Message signalé — ${analyse.flagType ?? 'AUTRE'}`,
          contenu: `Un message (conv: ${conversationId}) a été automatiquement signalé. Score: ${(analyse.flagScore * 100).toFixed(0)}%. Raison: ${analyse.flagDetails ?? '—'}`,
          data:    JSON.stringify({ messageId, conversationId, flagType: analyse.flagType, flagScore: analyse.flagScore }),
        })),
        skipDuplicates: true,
      })
    }
  } catch (error) {
    console.error('Erreur signalement message:', error)
  }
}

// ─── 5. Vérification de progression d'étapes ──────────────────────
export async function verifierProgressionEtape(
  conversationId: string
): Promise<void> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { etape: true, messageCount: true, createdAt: true },
  })

  if (!conversation) return

  const jourDepuisCreation = Math.floor(
    (Date.now() - conversation.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  let nouvelleEtape = conversation.etape

  // Règles de progression
  if (conversation.etape === 'PRESENTATION' && jourDepuisCreation >= 3 && conversation.messageCount >= 10) {
    nouvelleEtape = 'CONNAISSANCE'
  } else if (conversation.etape === 'CONNAISSANCE' && jourDepuisCreation >= 10) {
    nouvelleEtape = 'FAMILLE'
  } else if (conversation.etape === 'FAMILLE' && jourDepuisCreation >= 21) {
    nouvelleEtape = 'VISIO'
  }

  if (nouvelleEtape !== conversation.etape) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { etape: nouvelleEtape, etapeChangedAt: new Date() },
    })

    // Notifier les deux utilisateurs de la progression
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { user1Id: true, user2Id: true },
    })

    if (conv) {
      await prisma.notification.createMany({
        data: [
          {
            userId: conv.user1Id,
            type: 'ETAPE_DEBLOQUEE',
            titre: `Nouvelle étape débloquée !`,
            contenu: `Votre conversation a atteint l'étape "${nouvelleEtape.toLowerCase()}". De nouvelles options sont disponibles.`,
          },
          {
            userId: conv.user2Id,
            type: 'ETAPE_DEBLOQUEE',
            titre: `Nouvelle étape débloquée !`,
            contenu: `Votre conversation a atteint l'étape "${nouvelleEtape.toLowerCase()}". De nouvelles options sont disponibles.`,
          },
        ],
      })
    }
  }
}
