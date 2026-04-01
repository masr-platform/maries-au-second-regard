'use client'

import { useSession } from 'next-auth/react'
import { useRouter }  from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Link           from 'next/link'
import {
  Camera, X, Upload, CheckCircle, Shield, Eye, EyeOff,
  ArrowRight, Lock, ImagePlus, AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

const MAX_PHOTOS = 3

interface PhotoItem {
  url:       string
  uploading: boolean
  error:     string | null
}

export default function PhotosPage() {
  const { data: session, status, update } = useSession()
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [photos,   setPhotos]   = useState<PhotoItem[]>([])
  const [skipping, setSkipping] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/connexion')
  }, [status, router])

  // ── Upload d'une photo ──────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const remaining = MAX_PHOTOS - photos.filter(p => !p.error && p.url).length
    const toUpload  = files.slice(0, remaining)

    for (const file of toUpload) {
      const tempId = `uploading-${Date.now()}-${Math.random()}`

      // Ajouter un placeholder "en cours"
      setPhotos(prev => [...prev, { url: tempId, uploading: true, error: null }])

      const formData = new FormData()
      formData.append('photo', file)

      try {
        const res  = await fetch('/api/upload/photo', { method: 'POST', body: formData })
        const data = await res.json()

        if (!res.ok) {
          setPhotos(prev =>
            prev.map(p => p.url === tempId ? { ...p, uploading: false, error: data.error } : p)
          )
          toast.error(data.error || 'Erreur upload')
        } else {
          setPhotos(prev =>
            prev.map(p => p.url === tempId ? { url: data.url, uploading: false, error: null } : p)
          )
          toast.success('Photo ajoutée !')
        }
      } catch {
        setPhotos(prev =>
          prev.map(p => p.url === tempId ? { ...p, uploading: false, error: 'Erreur réseau' } : p)
        )
        toast.error('Erreur réseau')
      }
    }

    // Reset input pour permettre re-sélection du même fichier
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Supprimer une photo ─────────────────────────────────────────
  const removePhoto = async (url: string) => {
    try {
      await fetch('/api/upload/photo', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url }),
      })
      setPhotos(prev => prev.filter(p => p.url !== url))
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  // ── Continuer vers le questionnaire ────────────────────────────
  const handleContinue = async () => {
    const validPhotos = photos.filter(p => !p.uploading && !p.error && p.url)
    if (validPhotos.length === 0) {
      toast.error('Ajoutez au moins 1 photo pour continuer')
      return
    }
    await update()  // refresh session
    router.push('/questionnaire')
  }

  // ── Passer (sans photo) ─────────────────────────────────────────
  const handleSkip = () => {
    setSkipping(true)
    router.push('/questionnaire')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const validPhotos   = photos.filter(p => !p.uploading && !p.error && p.url)
  const canAddMore    = validPhotos.length < MAX_PHOTOS
  const hasMinimum    = validPhotos.length >= 1
  const uploadingAny  = photos.some(p => p.uploading)

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-12">
      {/* Fond décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl" style={{ background: 'rgba(212,175,55,0.04)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full blur-3xl" style={{ background: 'rgba(212,175,55,0.04)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full border border-gold-500 flex items-center justify-center">
              <span className="text-gold-500 text-xs font-serif font-bold">M</span>
            </div>
            <span className="font-serif text-white text-sm tracking-wide">MASR</span>
          </Link>

          {/* Étape */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center">
                <CheckCircle size={13} className="text-black" />
              </div>
              <span className="text-xs text-dark-400">Profil</span>
            </div>
            <div className="w-8 h-px bg-gold-500/40" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center">
                <span className="text-black text-xs font-bold">2</span>
              </div>
              <span className="text-xs text-white font-medium">Photos</span>
            </div>
            <div className="w-8 h-px bg-dark-600" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center">
                <span className="text-dark-400 text-xs">3</span>
              </div>
              <span className="text-xs text-dark-400">Questionnaire</span>
            </div>
          </div>

          <h1 className="text-2xl font-serif font-bold text-white">Ajoutez vos photos</h1>
          <p className="text-dark-300 text-sm mt-2">
            1 photo minimum — jusqu&apos;à 3 photos
          </p>
        </div>

        <div className="space-y-5">

          {/* Message confidentialité — élément clé de conversion */}
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}
          >
            <Lock size={15} style={{ color: '#D4AF37', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: '#D4AF37' }}>
                Vos photos restent privées
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(212,175,55,0.7)' }}>
                Ces photos <strong>ne seront pas visibles publiquement</strong> sur votre profil.
                Elles seront uniquement accessibles à un autre utilisateur{' '}
                <strong>en cas de compatibilité confirmée</strong> avec lui.
              </p>
            </div>
          </div>

          {/* Zone d'upload */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {/* Photos uploadées */}
              {photos.map((photo, i) => (
                <div
                  key={photo.url}
                  className="relative aspect-square rounded-xl overflow-hidden"
                  style={{ border: '1.5px solid rgba(255,255,255,0.1)', background: '#111' }}
                >
                  {photo.uploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-dark-800">
                      <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : photo.error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 p-2">
                      <AlertCircle size={18} className="text-red-400 mb-1" />
                      <p className="text-red-400 text-[10px] text-center leading-tight">{photo.error}</p>
                    </div>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {i === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1">
                          <p className="text-[9px] text-center text-white/70">Principale</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Bouton suppression */}
                  {!photo.uploading && (
                    <button
                      onClick={() => photo.error ? setPhotos(p => p.filter(x => x.url !== photo.url)) : removePhoto(photo.url)}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500/80 transition-colors"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  )}
                </div>
              ))}

              {/* Slots vides */}
              {Array.from({ length: MAX_PHOTOS - photos.length }).map((_, i) => (
                <button
                  key={`empty-${i}`}
                  onClick={() => canAddMore && fileRef.current?.click()}
                  disabled={!canAddMore || uploadingAny}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 disabled:opacity-40"
                  style={{
                    border: '1.5px dashed rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <ImagePlus size={20} style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {i === 0 && photos.length === 0 ? 'Ajouter' : '+'}
                  </span>
                </button>
              ))}
            </div>

            {/* Bouton principal d'upload */}
            {canAddMore && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAny}
                className="w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  border: '1.5px dashed rgba(212,175,55,0.35)',
                  background: 'rgba(212,175,55,0.04)',
                  color: 'rgba(212,175,55,0.8)',
                }}
              >
                <Upload size={15} />
                {uploadingAny ? 'Upload en cours...' : `Choisir ${photos.length === 0 ? 'une photo' : 'une autre photo'}`}
              </button>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            <p className="text-[11px] text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
              JPEG, PNG ou WebP — 5 Mo maximum par photo
            </p>
          </div>

          {/* Conseils */}
          <div
            className="rounded-xl p-3.5 space-y-1.5"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <p className="text-xs font-medium text-white mb-2">Conseils pour une bonne photo :</p>
            {[
              'Photo récente et claire de votre visage',
              'Bonne luminosité, fond neutre de préférence',
              'Évitez les lunettes de soleil et les filtres excessifs',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <CheckCircle size={11} style={{ color: '#D4AF37', marginTop: 1, flexShrink: 0 }} />
                {tip}
              </div>
            ))}
          </div>

          {/* CTA principal */}
          <button
            onClick={handleContinue}
            disabled={!hasMinimum || uploadingAny}
            className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={hasMinimum
              ? { background: 'linear-gradient(90deg, #D4AF37, #f0d060)', color: '#000' }
              : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }
            }
          >
            {uploadingAny ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                Continuer vers le questionnaire
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Lien passer */}
          <div className="text-center">
            <button
              onClick={handleSkip}
              disabled={skipping}
              className="text-xs transition-colors"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              Passer cette étape — ajouter mes photos plus tard
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
