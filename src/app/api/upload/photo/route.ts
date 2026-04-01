import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { v2 as cloudinary }          from 'cloudinary'
import { prisma }                    from '@/lib/prisma'

// ── Cloudinary config ─────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
})

const MAX_FILE_SIZE  = 5 * 1024 * 1024  // 5 Mo
const ALLOWED_TYPES  = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_PHOTOS     = 3

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // ── Récupérer le user ─────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, photos: true },
    })
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

    if (user.photos.length >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PHOTOS} photos autorisées` },
        { status: 400 }
      )
    }

    // ── Lire le fichier ───────────────────────────────────────────
    const formData = await req.formData()
    const file     = formData.get('photo') as File | null

    if (!file) return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format non supporté. Utilisez JPEG, PNG ou WebP.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop lourd (5 Mo maximum)' },
        { status: 400 }
      )
    }

    // ── Convertir en buffer ───────────────────────────────────────
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ── Upload Cloudinary ─────────────────────────────────────────
    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder:         `masr/photos/${user.id}`,
            transformation: [
              { width: 800, height: 800, crop: 'limit', quality: 'auto:good' },
            ],
          },
          (err, result) => {
            if (err || !result) reject(err ?? new Error('Upload échoué'))
            else resolve(result as { secure_url: string; public_id: string })
          }
        ).end(buffer)
      }
    )

    // ── Mettre à jour la DB ───────────────────────────────────────
    const newPhotos = [...user.photos, uploadResult.secure_url]

    await prisma.user.update({
      where: { id: user.id },
      data:  {
        photos:   newPhotos,
        photoUrl: newPhotos[0],  // première photo = photo principale
      },
    })

    return NextResponse.json({
      success: true,
      url:     uploadResult.secure_url,
      photos:  newPhotos,
      count:   newPhotos.length,
    })

  } catch (err) {
    console.error('[UPLOAD PHOTO]', err)
    return NextResponse.json({ error: 'Erreur serveur lors de l\'upload' }, { status: 500 })
  }
}

// ── DELETE — supprimer une photo ──────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL manquante' }, { status: 400 })

    const user = await prisma.user.findUnique({
      where:  { email: session.user.email },
      select: { id: true, photos: true },
    })
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

    const newPhotos = user.photos.filter((p) => p !== url)

    await prisma.user.update({
      where: { id: user.id },
      data:  {
        photos:   newPhotos,
        photoUrl: newPhotos[0] ?? null,
      },
    })

    return NextResponse.json({ success: true, photos: newPhotos })
  } catch (err) {
    console.error('[DELETE PHOTO]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
