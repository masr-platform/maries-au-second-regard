'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart, MessageCircle, Bell, User, Settings, LogOut,
  Sparkles, ChevronRight, Clock, Star, TrendingUp,
  CheckCircle2, BookOpen, Home, Briefcase, Activity,
  MapPin, ChevronDown, ChevronUp, AlertCircle, Crown,
  Zap, Trophy, Users, Video,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────
interface Explication {
  explication:     string
  pointsForts:     string[]
  pointsAttention: string[]
}

interface Resultat {
  matchId:            string
  scoreGlobal:        number
  forteCompatibilite: boolean
  status:             string
  maReponse:          string
  autreReponse:       string
  proposedAt:         string
  profil: {
    id:       string
    prenom:   string
    age:      number | null
    ville:    string | null
    photoUrl: string | null
    infos: {
      niveauPratique:  string | null
      objectifMariage: string | null
      niveauEtudes:    string | null
      profession:      string | null
    } | null
  }
  dimensions: {
    foi:           number
    personnalite:  number
    projetVie:     number
    communication: number
    styleVie:      number
    carriere:      number
    physique:      number
  }
  explication: Explication
}

// ─── Jauge circulaire SVG ─────────────────────────────────────────
function JaugeCirculaire({ score, size = 80 }: { score: number; size?: number }) {
  const r      = (size - 12) / 2
  const circ   = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color  = score >= 75 ? '#D4AF37' : score >= 60 ? '#C8963A' : '#7a6020'

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-lg font-bold text-white leading-none">{score}</span>
        <span className="text-[9px] leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>/ 100</span>
      </div>
    </div>
  )
}

// ─── Barre de dimension (CSS animation) ──────────────────────────
function BarreDimension({ label, icon: Icon, score }: { label: string; icon: React.ElementType; score: number }) {
  const color = score >= 80 ? '#D4AF37' : score >= 60 ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.15)'
  return (
    <div className="flex items-center gap-2">
      <Icon size={11} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
      <span className="text-[11px] w-24 truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, background: color, transition: 'width 1s ease' }}
        />
      </div>
      <span className="text-[11px] w-7 text-right font-semibold" style={{ color: '#D4AF37' }}>{Math.round(score)}</span>
    </div>
  )
}

// ─── Carte de compatibilité ───────────────────────────────────────
function CarteCompatibilite({ r, onRepondre }: { r: Resultat; onRepondre: (id: string, rep: 'ACCEPTE' | 'REJETE') => void }) {
  const [open, setOpen] = useState(false)

  const DIMS = [
    { key: 'foi',           label: 'Foi & pratique',  icon: BookOpen },
    { key: 'projetVie',     label: 'Projet de vie',   icon: Home },
    { key: 'communication', label: 'Communication',   icon: MessageCircle },
    { key: 'personnalite',  label: 'Personnalité',    icon: Heart },
    { key: 'styleVie',      label: 'Style de vie',    icon: Activity },
    { key: 'carriere',      label: 'Carrière',        icon: Briefcase },
  ] as const

  const pratiqueLbl: Record<string, string> = {
    debutant: 'Débutant(e)', pratiquant: 'Pratiquant(e)',
    tres_pratiquant: 'Très pratiquant(e)', savant: 'Savant(e)',
  }
  const objectifLbl: Record<string, string> = {
    mariage_uniquement: 'Mariage direct',
    mariage_apres: 'Après connaissance',
    engagement_progressif: 'Engagement progressif',
  }

  const isForte   = r.forteCompatibilite
  const isChat    = r.status === 'CHAT_OUVERT'
  const isVisio   = r.status === 'VISIO_PLANIFIEE' || r.status === 'IMAM_SESSION'

  return (
    <article
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: isForte
          ? 'linear-gradient(135deg, #1c1610 0%, #211a08 100%)'
          : 'linear-gradient(135deg, #111318 0%, #14171e 100%)',
        border: `1.5px solid ${isForte ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: isForte
          ? '0 0 24px rgba(212,175,55,0.08), 0 4px 20px rgba(0,0,0,0.4)'
          : '0 4px 16px rgba(0,0,0,0.3)',
      }}
    >
      {/* Bandeau forte compatibilité */}
      {isForte && (
        <div className="py-1.5 text-center text-[10px] font-bold flex items-center justify-center gap-1.5"
          style={{ background: 'linear-gradient(90deg, #D4AF37, #f0d060)', color: '#000' }}>
          <Star size={9} className="fill-current" /> Forte compatibilité détectée
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0"
          style={{ border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
          {r.profil.photoUrl ? (
            <Image src={r.profil.photoUrl} alt={r.profil.prenom} width={64} height={64} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={24} style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-white font-bold text-base">{r.profil.prenom}</span>
            {r.profil.age && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{r.profil.age} ans</span>}
          </div>
          {r.profil.ville && (
            <div className="flex items-center gap-1 mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <MapPin size={9} /><span className="text-[10px]">{r.profil.ville}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {r.profil.infos?.niveauPratique && (
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                {pratiqueLbl[r.profil.infos.niveauPratique] ?? r.profil.infos.niveauPratique}
              </span>
            )}
            {r.profil.infos?.objectifMariage && (
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {objectifLbl[r.profil.infos.objectifMariage] ?? r.profil.infos.objectifMariage}
              </span>
            )}
          </div>
        </div>

        {/* Score */}
        <JaugeCirculaire score={r.scoreGlobal} size={76} />
      </div>

      {/* Barres */}
      <div className="px-4 pb-3 space-y-2">
        {DIMS.map(({ key, label, icon }) => (
          <BarreDimension key={key} label={label} icon={icon} score={r.dimensions[key as keyof typeof r.dimensions]} />
        ))}
      </div>

      {/* Accordéon explication IA */}
      <div className="mx-4 mb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
      <div className="px-4 py-2.5">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 w-full transition-colors duration-200"
          style={{ color: open ? '#D4AF37' : 'rgba(212,175,55,0.65)' }}
        >
          <Sparkles size={11} />
          <span className="text-[11px] font-medium flex-1 text-left">Pourquoi vous êtes compatibles</span>
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: open ? '400px' : '0px', opacity: open ? 1 : 0 }}
        >
          <div className="pt-2.5 pb-1">
            <p className="text-[11px] leading-relaxed mb-2.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {r.explication.explication}
            </p>
            {r.explication.pointsForts.length > 0 && (
              <div className="mb-2">
                <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Points forts</p>
                <div className="flex flex-wrap gap-1">
                  {r.explication.pointsForts.map((p, i) => (
                    <span key={i} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                      <span className="w-1 h-1 rounded-full" style={{ background: '#D4AF37' }} />{p}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {r.explication.pointsAttention.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>À explorer ensemble</p>
                <div className="flex flex-wrap gap-1">
                  {r.explication.pointsAttention.map((p, i) => (
                    <span key={i} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <AlertCircle size={8} style={{ color: 'rgba(255,255,255,0.3)' }} />{p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {r.maReponse === 'EN_ATTENTE' ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onRepondre(r.matchId, 'REJETE')}
              className="py-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', background: 'transparent' }}
            >
              Décliner
            </button>
            <button
              onClick={() => onRepondre(r.matchId, 'ACCEPTE')}
              className="py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all duration-200"
              style={{ background: 'linear-gradient(90deg, #D4AF37, #f0d060)', color: '#000' }}
            >
              Accepter <ChevronRight size={12} />
            </button>
          </div>
        ) : r.maReponse === 'ACCEPTE' && isVisio ? (
          <div className="flex flex-col gap-2">
            <Link
              href={`/messages?matchId=${r.matchId}`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
            >
              <MessageCircle size={13} /> Conversation
            </Link>
            <Link
              href={`/mouqabala/reserver/${r.matchId}`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.08))', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.35)' }}
            >
              <Video size={13} /> Planifier la mouqabala
            </Link>
          </div>
        ) : r.maReponse === 'ACCEPTE' && isChat ? (
          <div className="flex flex-col gap-2">
            <Link
              href={`/messages?matchId=${r.matchId}`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
            >
              <MessageCircle size={13} /> Ouvrir la conversation
            </Link>
            <Link
              href={`/mouqabala/reserver/${r.matchId}`}
              className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all duration-200"
              style={{ background: 'rgba(212,175,55,0.05)', color: 'rgba(212,175,55,0.6)', border: '1px solid rgba(212,175,55,0.15)' }}
            >
              <Video size={12} /> Planifier une mouqabala
            </Link>
          </div>
        ) : r.maReponse === 'ACCEPTE' ? (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs"
            style={{ background: 'rgba(212,175,55,0.06)', color: 'rgba(212,175,55,0.6)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <Clock size={13} /> En attente de réponse
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs"
            style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.2)' }}>
            <CheckCircle2 size={13} /> Décliné
          </div>
        )}
      </div>
    </article>
  )
}

// ─── Page principale ──────────────────────────────────────────────
export default function TableauDeBordPage() {
  const { data: session } = useSession()
  const [resultats, setResultats] = useState<Resultat[]>([])
  const [loading,   setLoading]   = useState(true)
  const [calculant, setCalculant] = useState(false)

  const charger = useCallback(async () => {
    try {
      const res  = await fetch('/api/compatibility')
      const json = await res.json()
      if (res.ok) setResultats(json.resultats ?? [])
    } catch { toast.error('Erreur chargement') }
    finally  { setLoading(false) }
  }, [])

  useEffect(() => { charger() }, [charger])

  const lancerMatching = async () => {
    setCalculant(true)
    try {
      const res  = await fetch('/api/matching', { method: 'POST' })
      const json = await res.json()
      if (res.ok) { toast.success(json.message || 'Matching terminé !'); charger() }
      else toast.error(json.message ?? json.error ?? 'Erreur')
    } catch { toast.error('Erreur réseau') }
    finally  { setCalculant(false) }
  }

  const repondre = async (matchId: string, rep: 'ACCEPTE' | 'REJETE') => {
    try {
      const res = await fetch(`/api/matching/${matchId}/repondre`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reponse: rep }),
      })
      if (res.ok) { toast.success(rep === 'ACCEPTE' ? "Accepté ! On vérifie si l'intérêt est mutuel…" : 'Décliné.'); charger() }
    } catch { toast.error('Erreur') }
  }

  const plan         = (session?.user?.plan as string) ?? 'GRATUIT'
  const enAttente    = resultats.filter(r => r.maReponse === 'EN_ATTENTE').length
  const conversations = resultats.filter(r => r.status === 'CHAT_OUVERT').length
  const topScore     = resultats[0]?.scoreGlobal ?? null
  const isPaid       = plan !== 'GRATUIT'

  const planLbl: Record<string, string> = {
    GRATUIT: 'Accès limité', STANDARD: 'Essentiel', BASIQUE: 'Essentiel',
    PREMIUM: 'Premium', ULTRA: 'Élite',
  }

  return (
    <div className="min-h-screen bg-dark-900">

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 hidden md:flex flex-col"
        style={{ background: 'rgba(10,10,14,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ border: '1.5px solid #D4AF37', background: 'rgba(212,175,55,0.1)' }}>
              <span className="text-gold-500 font-serif font-bold text-sm">M</span>
            </div>
            <div>
              <p className="text-white font-serif text-sm font-semibold">MASR</p>
              <p className="text-xs" style={{ color: isPaid ? '#D4AF37' : 'rgba(255,255,255,0.3)' }}>
                {planLbl[plan]}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-0.5">
          {[
            { href: '/tableau-de-bord', icon: Heart,         label: 'Mes compatibilités', active: true },
            { href: '/messages',        icon: MessageCircle, label: 'Messages',           badge: conversations > 0 ? conversations : null },
            { href: '/sessions',        icon: Video,         label: 'Mouqabalas' },
            { href: '/notifications',   icon: Bell,          label: 'Notifications' },
            { href: '/profil',          icon: User,          label: 'Mon profil' },
            { href: '/abonnement',      icon: TrendingUp,    label: 'Abonnement' },
            { href: '/parametres',      icon: Settings,      label: 'Paramètres' },
          ].map(({ href, icon: Icon, label, active, badge }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
              style={active
                ? { background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }
                : { color: 'rgba(255,255,255,0.4)', border: '1px solid transparent' }
              }
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: '#22c55e', color: '#fff', minWidth: 18, textAlign: 'center' }}>
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <span className="text-gold-500 font-semibold text-sm">{session?.user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{session?.user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{session?.user?.email}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 text-sm w-full transition-colors duration-200"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            <LogOut size={14} />Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu ───────────────────────────────────────────────── */}
      <main className="md:ml-64 p-5 md:p-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-white">
              Salaam, {session?.user?.name} 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {loading ? 'Chargement…'
                : resultats.length > 0
                ? `${resultats.length} profil${resultats.length > 1 ? 's' : ''} analysé${resultats.length > 1 ? 's' : ''} par notre IA`
                : 'Lancez votre premier matching'}
            </p>
          </div>
          <button
            onClick={lancerMatching} disabled={calculant}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-60"
            style={{ background: 'linear-gradient(90deg, #D4AF37, #f0d060)', color: '#000' }}
          >
            {calculant
              ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : <Sparkles size={14} />}
            {calculant ? 'Analyse…' : 'Trouver des profils'}
          </button>
        </div>

        {/* Stats */}
        {!loading && resultats.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'En attente',   val: enAttente,                           icon: Clock,   color: '#fff',     bg: 'rgba(255,255,255,0.05)' },
              { label: 'Conversations', val: conversations,                       icon: MessageCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
              { label: 'Meilleur score', val: topScore !== null ? `${topScore}%` : '—', icon: Trophy, color: '#D4AF37', bg: 'rgba(212,175,55,0.08)' },
            ].map(({ label, val, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-2xl p-4 text-center"
                style={{ background: bg, border: `1px solid ${color}20` }}>
                <Icon size={16} className="mx-auto mb-1.5" style={{ color }} />
                <p className="text-xl font-bold" style={{ color }}>{val}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* États */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl p-4 space-y-3 animate-pulse"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded w-3/4" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-2.5 rounded w-1/2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                  <div className="w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
                {[1,2,3,4,5].map(j => <div key={j} className="h-1.5 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />)}
              </div>
            ))}
          </div>
        ) : !isPaid ? (
          /* ── PAYWALL ── */
          <div className="text-center py-20 px-6">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.2)' }}>
                <Sparkles size={36} style={{ color: '#D4AF37' }} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-3">
                Votre profil est prêt — vos matchs aussi.
              </h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Notre IA a analysé votre questionnaire. Pour découvrir vos profils compatibles,
                choisissez un abonnement.{' '}
                <span className="text-white font-semibold">Inscription et questionnaire gratuits.</span>
              </p>
              <Link href="/abonnement"
                className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl transition-all duration-200"
                style={{ background: 'linear-gradient(90deg, #D4AF37, #f0d060)', color: '#000' }}>
                <Crown size={18} />
                Voir les abonnements
                <ChevronRight size={18} />
              </Link>
              <div className="mt-6 flex items-center justify-center gap-6 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={12} style={{ color: '#22c55e' }} />Sans engagement</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={12} style={{ color: '#22c55e' }} />Annulable à tout moment</span>
              </div>
            </div>
          </div>
        ) : resultats.length === 0 ? (
          /* ── ÉTAT VIDE ── */
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <Heart size={28} style={{ color: '#D4AF37' }} />
            </div>
            <h2 className="text-xl font-serif font-bold text-white mb-2">Notre IA est prête</h2>
            <p className="text-sm max-w-sm mx-auto mb-7 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Notre algorithme analyse la foi, le projet de vie, la communication et plus encore
              pour vous proposer des profils vraiment compatibles — avec une explication claire.
            </p>
            <button onClick={lancerMatching} disabled={calculant}
              className="inline-flex items-center gap-2 py-3 px-7 rounded-xl font-bold transition-all duration-200 disabled:opacity-60"
              style={{ background: 'linear-gradient(90deg, #D4AF37, #f0d060)', color: '#000' }}>
              <Sparkles size={15} />
              {calculant ? 'Analyse en cours…' : 'Lancer le matching IA'}
            </button>
          </div>
        ) : (
          /* ── GRILLE PROFILS ── */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {resultats.map(r => (
              <CarteCompatibilite key={r.matchId} r={r} onRepondre={repondre} />
            ))}
          </div>
        )}

        {/* Upgrade banner (plan gratuit avec résultats) */}
        {!isPaid && resultats.length > 0 && (
          <div className="mt-8 p-5 rounded-2xl flex items-center gap-4"
            style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div className="p-2.5 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(212,175,55,0.1)' }}>
              <Zap size={20} style={{ color: '#D4AF37' }} />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Recevez plus de profils compatibles</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Essentiel : 1 profil / semaine — Premium : 1 profil / jour — Élite : 3 profils / jour
              </p>
            </div>
            <Link href="/abonnement"
              className="py-2 px-4 text-sm flex-shrink-0 flex items-center gap-1 rounded-xl font-bold transition-all duration-200"
              style={{ background: 'linear-gradient(90deg, #D4AF37, #f0d060)', color: '#000' }}>
              Voir les offres <ChevronRight size={14} />
            </Link>
          </div>
        )}

        {/* Padding mobile nav */}
        <div className="pb-20 md:pb-0" />
      </main>

      {/* Mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex md:hidden z-50"
        style={{ background: 'rgba(10,10,14,0.97)', borderTop: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
        {[
          { href: '/tableau-de-bord', icon: Heart,         label: 'Matchs',    active: true },
          { href: '/messages',        icon: MessageCircle, label: 'Messages' },
          { href: '/notifications',   icon: Bell,          label: 'Notifs' },
          { href: '/profil',          icon: User,          label: 'Profil' },
        ].map(({ href, icon: Icon, label, active }) => (
          <Link key={href} href={href}
            className="flex-1 flex flex-col items-center py-3 gap-1 text-[10px] transition-colors duration-200"
            style={{ color: active ? '#D4AF37' : 'rgba(255,255,255,0.3)' }}>
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
