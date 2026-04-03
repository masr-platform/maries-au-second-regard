export const dynamic = 'force-dynamic'

// API Messages — Chat supervisé
import { NextRequest, NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { superviserMessage, verifierProgressionEtape, analyseRapide } from '@/lib/supervision-chat'
import { checkRateLimit } from '@/lib/redis'
import { emailService } from '@/lib/email'

// GET — Récupérer les messages d'une conversation
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const conversationId = searchParams.get('conversationId')
  const cursor         = searchParams.get('cursor')
  const limite         = Math.min(parseInt(searchParams.get('limite') || '30'), 50)

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId requis' }, { status: 400 })
  }

  try {
    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id },
          { waliId:  session.user.id },
        ],
        isBlocked: false,
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 })
    }

    // Récupérer les messages (pagination par cursor)
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      include: {
        sender: {
          select: { id: true, prenom: true, photoUrl: true },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limite + 1,
    })

    const hasMore = messages.length > limite
    if (hasMore) messages.pop()

    // Marquer comme lu
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    })

    // Vérifier expiration en temps réel
    const expired = conversation.isExpired ||
      (conversation.expiresAt != null && new Date() > new Date(conversation.expiresAt))

    if (expired && !conversation.isExpired) {
      // Lazy update sans bloquer la réponse
      prisma.conversation.update({
        where: { id: conversationId },
        data:  { isExpired: true, expiredAt: conversation.expiredAt ?? new Date() },
      }).catch(err => console.error('[conv] expiry lazy update GET:', err))
    }

    return NextResponse.json({
      messages: messages.reverse(),
      hasMore,
      nextCursor: hasMore && messages.length > 0
        ? messages[0].createdAt.toISOString()
        : null,
      etape:     conversation.etape,
      expiresAt: conversation.expiresAt,
      isExpired: expired,
      matchId:   conversation.matchId,
    })

  } catch (error) {
    console.error('Erreur récupération messages:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST — Envoyer un message
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const userId = session.user.id
  const ip = req.headers.get('x-forwarded-for') || userId

  // Rate limiting : 1 message par seconde max
  const { allowed } = await checkRateLimit(`msg:${userId}`, 60, 60)
  if (!allowed) {
    return NextResponse.json({ error: 'Trop de messages. Ralentissez.' }, { status: 429 })
  }

  try {
    const { conversationId, contenu, type = 'TEXTE' } = await req.json()

    if (!conversationId || !contenu?.trim()) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    if (contenu.length > 2000) {
      return NextResponse.json({ error: 'Message trop long (2000 caractères max)' }, { status: 400 })
    }

    // Vérifier l'appartenance à la conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
        isBlocked: false,
        isFlagged: false, // Conversation bloquée si flaggée
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation non accessible' }, { status: 403 })
    }

    // ── Vérifier que la conversation n'est pas expirée ────────────────
    if (conversation.isExpired) {
      return NextResponse.json({ error: 'Cette conversation a expiré. Vous pouvez demander une mouqabala.' }, { status: 403 })
    }
    if (conversation.expiresAt && new Date() > new Date(conversation.expiresAt)) {
      // Marquer comme expirée en DB (lazy update)
      prisma.conversation.update({
        where: { id: conversationId },
        data:  { isExpired: true, expiredAt: new Date() },
      }).catch(err => console.error('[conv] expiry lazy update:', err))
      return NextResponse.json({ error: 'Cette conversation a expiré. Vous pouvez demander une mouqabala.' }, { status: 403 })
    }

    // ── Détection coordonnées AVANT envoi ────────────────────────────
    const analysePreventive = analyseRapide(contenu.trim())
    if (analysePreventive.isFlagged) {
      // Signaler la tentative via le modèle Signalement (persiste en DB)
      await prisma.signalement.create({
        data: {
          signaleurId:   userId,
          signaleId:     userId, // auto-signalement : l'expéditeur est signalé
          type:          (analysePreventive.flagType as 'SNAP' | 'TELEPHONE' | 'RESEAU_SOCIAL' | 'INAPPROPRIE' | 'HARCELEMENT' | 'AUTRE') ?? 'AUTRE',
          description:   `Tentative de partage de coordonnées bloquée. Type: ${analysePreventive.flagType}. Contenu: ${contenu.slice(0, 200)}`,
          conversationId,
        },
      }).catch((err) => {
        // Ne jamais crasher l'API à cause du signalement
        console.error('[Signalement] Erreur création:', err)
      })
      return NextResponse.json({
        error: '🚫 Message bloqué — coordonnées personnelles interdites sur la plateforme (CGU art. 5). Violation = bannissement + pénalité 1 mois.',
        blocked: true,
      }, { status: 403 })
    }

        // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: contenu.trim(),
        type,
      },
      include: {
        sender: { select: { id: true, prenom: true, photoUrl: true } },
      },
    })

    // Mettre à jour la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        messageCount: { increment: 1 },
        lastMessageAt: new Date(),
      },
    })

    // Supervision IA + notification — asynchrone via waitUntil (Vercel-safe)
    const autreUserId = conversation.user1Id === userId
      ? conversation.user2Id
      : conversation.user1Id

    waitUntil(
      (async () => {
        try {
          await superviserMessage(message.id, conversationId, contenu)
          await verifierProgressionEtape(conversationId)

          // Notification en base
          await prisma.notification.create({
            data: {
              userId: autreUserId,
              type: 'NOUVEAU_MESSAGE',
              titre: 'Nouveau message',
              contenu: 'Vous avez reçu un nouveau message.',
              data: JSON.stringify({ conversationId }),
            },
          })

          // Email de notification si l'autre utilisateur est inactif (> 1h)
          const autreUser = await prisma.user.findUnique({
            where: { id: autreUserId },
            select: { email: true, prenom: true, lastActiveAt: true },
          })
          const inactiveThreshold = 60 * 60 * 1000 // 1 heure
          const isInactive = !autreUser?.lastActiveAt ||
            (Date.now() - new Date(autreUser.lastActiveAt).getTime()) > inactiveThreshold

          if (autreUser && isInactive) {
            await emailService.sendNewMessage({
              email: autreUser.email,
              prenom: autreUser.prenom,
              expediteur: message.sender.prenom,
              apercu: contenu,
            })
          }
        } catch (err) {
          console.error('Erreur post-message async:', err)
        }
      })()
    )

    return NextResponse.json({ message }, { status: 201 })

  } catch (error) {
    console.error('Erreur envoi message:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
