// API Inscription utilisateur
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/redis'
import { emailService } from '@/lib/email'
import { z } from 'zod'

const inscriptionSchema = z.object({
  prenom:         z.string().min(2).max(50),
  email:          z.string().email(),
  password:       z.string().min(8).max(100),
  genre:          z.enum(['HOMME', 'FEMME']),
  dateNaissance:  z.string().refine((d) => {
    const date = new Date(d)
    const age  = (Date.now() - date.getTime()) / (365.25 * 24 * 3600 * 1000)
    return age >= 18 && age <= 80
  }, 'Vous devez avoir entre 18 et 80 ans'),
  ville:          z.string().optional(),
  accepteCGU:     z.boolean().refine((v) => v, 'Vous devez accepter les CGU'),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'

  // Rate limiting : 5 inscriptions max par IP par heure
  const { allowed } = await checkRateLimit(`register:${ip}`, 5, 3600)
  if (!allowed) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans une heure.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const data = inscriptionSchema.parse(body)

    // Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 })
    }

    // Hash du mot de passe
    const passwordHash = await hash(data.password, 12)

    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        prenom:        data.prenom.trim(),
        email:         data.email.toLowerCase().trim(),
        passwordHash,
        genre:         data.genre,
        dateNaissance: new Date(data.dateNaissance),
        ville:         data.ville,
        plan:          'GRATUIT',
        profilesParSemaine: 1,
      },
      select: {
        id:     true,
        email:  true,
        prenom: true,
        genre:  true,
      },
    })

    // Envoyer l'email de bienvenue (non bloquant)
    setImmediate(() => {
      emailService.sendWelcome({ email: user.email, prenom: user.prenom })
        .catch((err) => console.error('Email bienvenue échoué:', err))
    })

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès. Bienvenue sur Mariés au Second Regard.',
      userId: user.id,
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Données invalides',
        details: error.errors,
      }, { status: 400 })
    }

    console.error('Erreur inscription:', error)
    return NextResponse.json({ error: 'Erreur serveur. Réessayez.' }, { status: 500 })
  }
}
