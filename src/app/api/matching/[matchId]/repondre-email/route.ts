export const dynamic = 'force-dynamic'

// ══════════════════════════════════════════════════════════════════
// GET /api/matching/[matchId]/repondre-email?reponse=ACCEPTE|REJETE
// One-click depuis l'email de demande de chat.
// Effectue la réponse et redirige vers le tableau de bord.
// ══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const { searchParams } = new URL(req.url)
  const reponse = searchParams.get('reponse') as 'ACCEPTE' | 'REJETE' | null

  // Si pas connecté → rediriger vers connexion
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    const redirectUrl = `/connexion?redirect=/api/matching/${params.matchId}/repondre-email?reponse=${reponse}`
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  const userId = session.user.id

  if (!reponse || !['ACCEPTE', 'REJETE'].includes(reponse)) {
    return NextResponse.redirect(new URL('/tableau-de-bord?error=action_invalide', req.url))
  }

  try {
    const match = await prisma.match.findUnique({ where: { id: params.matchId } })

    if (!match) {
      return NextResponse.redirect(new URL('/tableau-de-bord?error=match_introuvable', req.url))
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      return NextResponse.redirect(new URL('/tableau-de-bord?error=non_autorise', req.url))
    }

    // Réutiliser la logique de repondre via fetch interne
    const isUser1 = match.user1Id === userId
    const autreReponse = isUser1 ? match.user2Reponse : match.user1Reponse

    if (autreReponse !== 'EN_ATTENTE' && reponse !== 'ACCEPTE') {
      // Déjà traité
      return NextResponse.redirect(new URL('/tableau-de-bord?info=deja_traitee', req.url))
    }

    const updatedMatch = await prisma.match.update({
      where: { id: params.matchId },
      data: {
        ...(isUser1
          ? { user1Reponse: reponse, user1ReponduAt: new Date() }
          : { user2Reponse: reponse, user2ReponduAt: new Date() }),
      },
    })

    const autreReponseApres = isUser1 ? updatedMatch.user2Reponse : updatedMatch.user1Reponse
    const autreUserId = isUser1 ? match.user2Id : match.user1Id

    if (reponse === 'ACCEPTE' && autreReponseApres === 'ACCEPTE') {
      // Match mutuel — ouvrir le chat
      await prisma.$transaction([
        prisma.match.update({
          where: { id: params.matchId },
          data:  { status: 'CHAT_OUVERT', chatOuvertAt: new Date() },
        }),
        prisma.conversation.upsert({
          where:  { matchId: params.matchId },
          create: { matchId: params.matchId, user1Id: match.user1Id, user2Id: match.user2Id, etape: 'PRESENTATION' },
          update: {},
        }),
        prisma.notification.createMany({
          data: [
            {
              userId: match.user1Id, type: 'MATCH_ACCEPTE',
              titre: '🎉 Intérêt mutuel ! Le chat est ouvert.',
              contenu: 'Vous pouvez maintenant échanger dans le chat encadré.',
              data: JSON.stringify({ matchId: params.matchId }),
            },
            {
              userId: match.user2Id, type: 'MATCH_ACCEPTE',
              titre: '🎉 Intérêt mutuel ! Le chat est ouvert.',
              contenu: 'Vous pouvez maintenant échanger dans le chat encadré.',
              data: JSON.stringify({ matchId: params.matchId }),
            },
          ],
        }),
      ])

      return NextResponse.redirect(new URL(`/messages?matchId=${params.matchId}&chat=ouvert`, req.url))
    }

    if (reponse === 'REJETE') {
      await prisma.match.update({ where: { id: params.matchId }, data: { status: 'REJETE' } })
      return NextResponse.redirect(new URL('/tableau-de-bord?declined=1', req.url))
    }

    return NextResponse.redirect(new URL('/tableau-de-bord?accepted=1', req.url))

  } catch {
    return NextResponse.redirect(new URL('/tableau-de-bord?error=serveur', req.url))
  }
}
