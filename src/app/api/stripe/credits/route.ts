// ─────────────────────────────────────────────────────────────────────
// POST /api/stripe/credits — Achats one-time de profils supplémentaires
// Upsells : 1 profil (7€) / 3 profils (18€) / 5 profils (29€)
// ─────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// ─── Packs disponibles ───────────────────────────────────────────────
const PACKS = {
  PACK_1: {
    priceId:  process.env.STRIPE_PRICE_PACK1!,  // 7€ — 1 profil
    profils:  1,
    montant:  '7,00 €',
    label:    '1 profil supplémentaire',
  },
  PACK_3: {
    priceId:  process.env.STRIPE_PRICE_PACK3!,  // 18€ — 3 profils
    profils:  3,
    montant:  '18,00 €',
    label:    '3 profils supplémentaires',
  },
  PACK_5: {
    priceId:  process.env.STRIPE_PRICE_PACK5!,  // 29€ — 5 profils
    profils:  5,
    montant:  '29,00 €',
    label:    '5 profils supplémentaires',
  },
} as const

type PackKey = keyof typeof PACKS

// ─── POST — Créer la session Checkout one-time ───────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { pack } = await req.json() as { pack: PackKey }

    if (!PACKS[pack]) {
      return NextResponse.json({ error: 'Pack invalide' }, { status: 400 })
    }

    const packData = PACKS[pack]

    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { stripeCustomerId: true, email: true, prenom: true },
    })

    // Créer ou récupérer le customer Stripe
    let customerId = user?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email:    user!.email,
        name:     user!.prenom,
        metadata: { userId: session.user.id },
      })
      customerId = customer.id

      await prisma.user.update({
        where: { id: session.user.id },
        data:  { stripeCustomerId: customerId },
      })
    }

    // Session Checkout en mode payment (one-time)
    const checkoutSession = await stripe.checkout.sessions.create({
      customer:  customerId,
      mode:      'payment',
      line_items: [{ price: packData.priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/tableau-de-bord?credits=succes&pack=${pack}`,
      cancel_url:  `${process.env.NEXTAUTH_URL}/abonnement?credits=annule`,
      metadata: {
        userId:  session.user.id,
        pack,
        profils: packData.profils.toString(),
      },
      locale: 'fr',
    })

    return NextResponse.json({ url: checkoutSession.url })

  } catch (error) {
    console.error('Erreur Stripe credits:', error)
    return NextResponse.json({ error: 'Erreur Stripe' }, { status: 500 })
  }
}

// ─── PUT — Webhook pour créditer les profils après paiement ──────────
// Note : ce webhook est déclenché par /api/stripe (PUT) qui redirige
// les événements checkout.session.completed en mode payment ici.
// Alternative : gérer directement dans le webhook principal via mode check.
//
// Appel depuis /api/stripe/route.ts PUT → session.mode === 'payment'
// → appelle cette fonction via import si nécessaire.
//
// Pour simplicité, le webhook principal (/api/stripe PUT) gère tout :
// il vérifie session.mode, et si 'payment', lit session.metadata.pack
// et appelle addProfilCredits. On exporte la fonction ici :
// ─────────────────────────────────────────────────────────────────────

export async function addProfilCredits(userId: string, pack: PackKey) {
  const packData = PACKS[pack]
  if (!packData) return

  // Incrémenter les profils disponibles cette semaine
  await prisma.user.update({
    where: { id: userId },
    data:  { profilesParSemaine: { increment: packData.profils } },
  })

  // Notification in-app
  await prisma.notification.create({
    data: {
      userId,
      type:    'ABONNEMENT',
      titre:   `${packData.profils} profil(s) ajouté(s) !`,
      contenu: `Votre pack de ${packData.profils} profil(s) supplémentaire(s) a été activé. Bonne recherche !`,
    },
  })
}
