'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, Heart, BookOpen, Home, MessageCircle, Video, User, Briefcase,
  Activity, Star, ChevronLeft, Shield, Clock,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Questionnaire {
  niveauPratique: string | null
  ecoleJurisprudentielle: string | null
  objectifMariage: string | null
  souhaitEnfants: boolean | null
  nombreEnfantsSouhaite: number | null
  modeVieSouhaite: string | null
  villeSouhaitee: string | null
  mobilitePossible: boolean | null
  gestionConflits: string | null
  langageAmour: string | null
  niveauExtraversion: number | null
  activitePhysique: string | null
  niveauEtudes: string | null
  profession: string | null
  ambitionsPro: string | null
  situationFinanciere: string | null
  portVoile: boolean | null
  portBarbe: boolean | null
  taille: number | null
  partenaireIdeal5Mots: string | null
  visionFoyer: string | null
  messageConjoint: string | null
  sourceBonheur: string | null
}

interface ProfileData {
  profil: {
    id: string
    prenom: string
    age: number
    ville: string | null
    pays: string | null
    origine: string | null
    photos: string[]
    photoUrl: string | null
    questionnaire: Questionnaire
  }
  match: {
    id: string
    scoreGlobal: number
    forteCompatibilite: boolean
    status: string
    conversationId: string | null
    dimensions: {
      foi: number
      personnalite: number
      projetVie: number
      communication: number
      styleVie: number
      carriere: number
      physique: number
    }
    explication: {
      explication: string
      pointsForts: string[]
      pointsAttention: string[]
    }
  }
}

// Label mappings
const pratiqueLabel: Record<string, string> = {
  debutant: 'Débutant(e)',
  pratiquant: 'Pratiquant(e)',
  tres_pratiquant: 'Très pratiquant(e)',
  savant: 'Savant(e)',
}

const objectifLabel: Record<string, string> = {
  mariage_uniquement: 'Mariage direct',
  mariage_apres: 'Après connaissance',
  engagement_progressif: 'Engagement progressif',
}

const conflitsLabel: Record<string, string> = {
  discussion: 'Discussion ouverte',
  mediation: 'Médiation',
  evitement: 'Évitement',
  autre: 'Autre',
}

const langageLabel: Record<string, string> = {
  paroles: 'Paroles valorisantes',
  service: 'Actes de service',
  cadeaux: 'Cadeaux',
  temps: 'Temps de qualité',
  contact_physique: 'Contact physique',
}

const activiteLabel: Record<string, string> = {
  reguliere: 'Régulière',
  occasionnelle: 'Occasionnelle',
  aucune: 'Aucune',
}

const ambiLabel: Record<string, string> = {
  stabilite: 'Stabilité',
  croissance: 'Croissance',
  entrepreneuriat: 'Entrepreneuriat',
}

const modesVieLabel: Record<string, string> = {
  homme_foyer: 'Homme à la maison',
  double_carriere: 'Double carrière',
  flexible: 'Flexible',
}

// ─── Loading Skeleton ──────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: 'rgb(15, 23, 42)' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div
            className="w-8 h-8 rounded-full animate-pulse"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* Hero */}
        <div
          className="w-full h-96 rounded-lg mb-6 animate-pulse"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        />

        {/* Content sections */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="mb-8 p-4 rounded-lg animate-pulse"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div className="h-6 w-32 rounded mb-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="space-y-2">
              <div className="h-4 w-full rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="h-4 w-3/4 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Photo Gallery ─────────────────────────────────────────────
function PhotoGallery({ photos, photoUrl, prenom }: { photos: string[]; photoUrl: string | null; prenom: string }) {
  const [selectedPhoto, setSelectedPhoto] = useState(photoUrl || photos[0] || null)

  if (!selectedPhoto && !photoUrl) {
    // Avatar with initial
    const initial = prenom.charAt(0).toUpperCase()
    return (
      <div
        className="w-full h-80 rounded-lg flex items-center justify-center text-4xl font-bold"
        style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(168,100,168,0.1))' }}
      >
        {initial}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main photo */}
      {selectedPhoto && (
        <div className="relative w-full h-80 rounded-lg overflow-hidden bg-dark-800">
          <Image
            src={selectedPhoto}
            alt={prenom}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPhoto(photo)}
              className="relative w-16 h-16 rounded flex-shrink-0 overflow-hidden border-2 transition-colors"
              style={{
                borderColor: selectedPhoto === photo ? '#D4AF37' : 'rgba(255,255,255,0.1)',
              }}
            >
              <Image
                src={photo}
                alt={`Photo ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Dimension Bar ─────────────────────────────────────────────
function BarreDimension({ label, icon: Icon, score }: { label: string; icon: React.ElementType; score: number }) {
  const color = score >= 80 ? '#D4AF37' : score >= 60 ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.15)'
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
      <span className="text-sm w-28 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-1s"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-sm w-8 text-right font-semibold" style={{ color: '#D4AF37' }}>
        {Math.round(score)}
      </span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function MatchProfilePage({ params }: { params: { matchId: string } }) {
  const router = useRouter()
  const session = useSession()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [compatibilityOpen, setCompatibilityOpen] = useState(false)

  useEffect(() => {
    if (session.status !== 'authenticated') {
      router.push('/connexion')
      return
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/match/${params.matchId}/profil`)

        if (res.status === 403) {
          setError('Profil non accessible — match non mutuellement accepté')
          setLoading(false)
          return
        }

        if (!res.ok) {
          throw new Error(`Erreur ${res.status}`)
        }

        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session.status, params.matchId, router])

  if (session.status === 'loading' || loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'rgb(15, 23, 42)' }}>
        <div
          className="text-center p-6 rounded-lg max-w-md"
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {error}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }} className="mb-4">
            Vous devez mutuellement accepter ce match pour voir le profil complet.
          </p>
          <Link
            href="/tableau-de-bord"
            className="inline-block px-4 py-2 rounded transition-colors"
            style={{ background: '#D4AF37', color: 'rgb(15, 23, 42)' }}
          >
            Retour au tableau
          </Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { profil, match: matchData } = data

  return (
    <div className="min-h-screen pb-12" style={{ background: 'rgb(15, 23, 42)' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/tableau-de-bord"
            className="flex items-center gap-2 transition-colors"
            style={{ color: '#D4AF37' }}
          >
            <ChevronLeft size={20} />
            <span>Retour</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative mb-8">
          <PhotoGallery photos={profil.photos} photoUrl={profil.photoUrl} prenom={profil.prenom} />

          {/* Overlay info */}
          <div
            className="absolute bottom-0 left-0 right-0 p-4 rounded-b-lg"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            }}
          >
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'white' }}>
                  {profil.prenom}, {profil.age}
                </h1>
                {profil.ville && (
                  <p className="flex items-center gap-1 text-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    <MapPin size={14} />
                    {profil.ville}, {profil.pays}
                  </p>
                )}
              </div>

              {/* Score badge */}
              <div
                className="text-center px-3 py-2 rounded-lg"
                style={{ background: '#D4AF37', color: 'rgb(15, 23, 42)' }}
              >
                <div className="text-sm font-bold">{Math.round(matchData.scoreGlobal)}%</div>
                <div className="text-xs">compatible</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profil Rapide */}
        <div className="mb-8 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'white' }}>
            À propos
          </h2>
          <div className="flex flex-wrap gap-2">
            {profil.questionnaire.niveauPratique && (
              <span
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
              >
                {pratiqueLabel[profil.questionnaire.niveauPratique] || profil.questionnaire.niveauPratique}
              </span>
            )}
            {profil.questionnaire.objectifMariage && (
              <span
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
              >
                {objectifLabel[profil.questionnaire.objectifMariage] || profil.questionnaire.objectifMariage}
              </span>
            )}
            {profil.questionnaire.villeSouhaitee && (
              <span
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
              >
                {profil.questionnaire.villeSouhaitee}
              </span>
            )}
            {profil.questionnaire.situationFinanciere && (
              <span
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
              >
                {profil.questionnaire.situationFinanciere}
              </span>
            )}
            {profil.questionnaire.profession && (
              <span
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
              >
                {profil.questionnaire.profession}
              </span>
            )}
          </div>
        </div>

        {/* Compatibility Section */}
        <div className="mb-8 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <button
            onClick={() => setCompatibilityOpen(!compatibilityOpen)}
            className="w-full flex items-center justify-between"
          >
            <h2 className="text-lg font-semibold" style={{ color: 'white' }}>
              Compatibilité
            </h2>
            <span style={{ color: '#D4AF37' }}>{compatibilityOpen ? '−' : '+'}</span>
          </button>

          {compatibilityOpen && (
            <div className="mt-4 space-y-3">
              {/* Dimension bars */}
              <BarreDimension label="Foi" icon={BookOpen} score={matchData.dimensions.foi} />
              <BarreDimension label="Personnalité" icon={User} score={matchData.dimensions.personnalite} />
              <BarreDimension label="Projet de vie" icon={Home} score={matchData.dimensions.projetVie} />
              <BarreDimension label="Communication" icon={MessageCircle} score={matchData.dimensions.communication} />
              <BarreDimension label="Style de vie" icon={Activity} score={matchData.dimensions.styleVie} />
              <BarreDimension label="Carrière" icon={Briefcase} score={matchData.dimensions.carriere} />
              <BarreDimension label="Physique" icon={Heart} score={matchData.dimensions.physique} />

              {/* Explanation */}
              {matchData.explication.explication && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {matchData.explication.explication}
                  </p>
                </div>
              )}

              {/* Points forts */}
              {matchData.explication.pointsForts.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-2" style={{ color: '#D4AF37' }}>
                    Points forts
                  </p>
                  <div className="space-y-1">
                    {matchData.explication.pointsForts.map((point, i) => (
                      <div key={i} className="text-sm flex items-start gap-2">
                        <Star size={12} style={{ color: '#D4AF37', marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Points attention */}
              {matchData.explication.pointsAttention.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-2" style={{ color: 'rgba(255,200,100,0.8)' }}>
                    Points à discuter
                  </p>
                  <div className="space-y-1">
                    {matchData.explication.pointsAttention.map((point, i) => (
                      <div key={i} className="text-sm flex items-start gap-2">
                        <Clock size={12} style={{ color: 'rgba(255,200,100,0.8)', marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Qui suis-je Section */}
        <div className="mb-8 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'white' }}>
            Qui suis-je ?
          </h2>

          <div className="space-y-4">
            {profil.questionnaire.visionFoyer && (
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  VISION DU FOYER
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>{profil.questionnaire.visionFoyer}</p>
              </div>
            )}

            {profil.questionnaire.partenaireIdeal5Mots && (
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  PARTENAIRE IDÉAL EN 5 MOTS
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>{profil.questionnaire.partenaireIdeal5Mots}</p>
              </div>
            )}

            {profil.questionnaire.sourceBonheur && (
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  SOURCE DE BONHEUR
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>{profil.questionnaire.sourceBonheur}</p>
              </div>
            )}

            {profil.questionnaire.messageConjoint && (
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  MESSAGE AU CONJOINT
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>{profil.questionnaire.messageConjoint}</p>
              </div>
            )}

            {profil.questionnaire.gestionConflits && (
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  GESTION DES CONFLITS
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {conflitsLabel[profil.questionnaire.gestionConflits] || profil.questionnaire.gestionConflits}
                </p>
              </div>
            )}

            {profil.questionnaire.langageAmour && (
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  LANGAGE DE L'AMOUR
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {langageLabel[profil.questionnaire.langageAmour] || profil.questionnaire.langageAmour}
                </p>
              </div>
            )}

            {profil.questionnaire.activitePhysique && (
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  ACTIVITÉ PHYSIQUE
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {activiteLabel[profil.questionnaire.activitePhysique] || profil.questionnaire.activitePhysique}
                </p>
              </div>
            )}

            {profil.questionnaire.modeVieSouhaite && (
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  MODE DE VIE SOUHAITÉ
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {modesVieLabel[profil.questionnaire.modeVieSouhaite] || profil.questionnaire.modeVieSouhaite}
                </p>
              </div>
            )}

            {profil.questionnaire.ambitionsPro && (
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  AMBITIONS PROFESSIONNELLES
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {ambiLabel[profil.questionnaire.ambitionsPro] || profil.questionnaire.ambitionsPro}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 sticky bottom-6">
          {matchData.conversationId && (
            <Link
              href={`/messages/${matchData.conversationId}`}
              className="block w-full py-3 rounded-lg font-semibold text-center transition-all"
              style={{ background: '#D4AF37', color: 'rgb(15, 23, 42)' }}
            >
              <MessageCircle className="inline mr-2" size={18} />
              Ouvrir la conversation
            </Link>
          )}

          <Link
            href={`/mouqabala/reserver/${matchData.id}`}
            className="block w-full py-3 rounded-lg font-semibold text-center transition-all border"
            style={{
              background: 'rgba(212,175,55,0.1)',
              borderColor: '#D4AF37',
              color: '#D4AF37',
            }}
          >
            <Video className="inline mr-2" size={18} />
            Planifier une mouqabala
          </Link>
        </div>
      </div>
    </div>
  )
}
