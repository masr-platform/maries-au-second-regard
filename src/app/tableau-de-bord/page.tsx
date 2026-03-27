'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart, MessageCircle, Bell, User, Settings, LogOut,
  Sparkles, ChevronRight, Clock, Star, TrendingUp,
  CheckCircle2, BookOpen, Home, Briefcase, Activity,
  MapPin, ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────
interface Explication {
  explication:     string
  pointsForts:     string[]
  pointsAttention: string[]
}

interface Resultat {
  matchId:           string
  scoreGlobal:       number
  forteCompatibilite: boolean
  status:            string
  maReponse:         string
  autreReponse:      string
  proposedAt:        string
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
  const color  = score >= 75 ? '#D4A853' : score >= 60 ? '#C8963A' : '#7a6020'

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a2a2a" strokeWidth={7} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-lg font-bold text-white leading-none">{score}</span>
        <span className="text-[9px] text-dark-400 leading-none mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

// ─── Barre de dimension ───────────────────────────────────────────
function BarreDimension({
  label,
  icon: Icon,
  score,
}: {
  label: string
  icon: React.ElementType
  score: number
}) {
  const fill = score >= 80 ? 'bg-gold-500' : score >= 60 ? 'bg-gold-500/60' : 'bg-dark-500'
  return (
    <div className="flex items-center gap-2">
      <Icon size={12} className="text-dark-500 flex-shrink-0" />
      <span className="text-[11px] text-dark-300 w-24 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className={`h-full rounded-full ${fill}`}
        />
      </div>
      <span className="text-[11px] text-gold-400 w-7 text-right font-semibold">{Math.round(score)}</span>
    </div>
  )
}

// ─── Carte de compatibilité ───────────────────────────────────────
function CarteCompatibilite({
  r,
  onRepondre,
}: {
  r: Resultat
  onRepondre: (id: string, rep: 'ACCEPTE' | 'REJETE') => void
}) {
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

  return (
    <article className="bg-dark-800 border border-dark-700 hover:border-gold-500/30 rounded-2xl overflow-hidden transition-colors duration-300">

      {/* Bandeau forte compatibilité */}
      {r.forteCompatibilite && (
        <div className="bg-gold-500 text-black text-[10px] font-bold py-1 text-center flex items-center justify-center gap-1">
          <Star size={9} className="fill-current" /> Forte compatibilité détectée
        </div>
      )}

      {/* Header : avatar + info + jauge */}
      <div className="flex items-start gap-3 p-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-dark-700 border border-dark-600 flex-shrink-0">
          {r.profil.photoUrl ? (
            <Image src={r.profil.photoUrl} alt={r.profil.prenom} width={56} height={56} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={22} className="text-dark-500" />
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-white font-semibold text-sm">{r.profil.prenom}</span>
            {r.profil.age && <span className="text-dark-400 text-xs">{r.profil.age} ans</span>}
          </div>
          {r.profil.ville && (
            <div className="flex items-center gap-1 text-dark-400 text-[10px] mb-1.5">
              <MapPin size={9} />{r.profil.ville}
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {r.profil.infos?.niveauPratique && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
                {pratiqueLbl[r.profil.infos.niveauPratique] ?? r.profil.infos.niveauPratique}
              </span>
            )}
            {r.profil.infos?.objectifMariage && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-dark-700 text-dark-300 border border-dark-600">
                {objectifLbl[r.profil.infos.objectifMariage] ?? r.profil.infos.objectifMariage}
              </span>
            )}
          </div>
        </div>

        {/* Score */}
        <JaugeCirculaire score={r.scoreGlobal} size={78} />
      </div>

      {/* Barres de dimensions */}
      <div className="px-4 pb-3 space-y-1.5">
        {DIMS.map(({ key, label, icon }) => (
          <BarreDimension key={key} label={label} icon={icon} score={r.dimensions[key as keyof typeof r.dimensions]} />
        ))}
      </div>

      {/* Explication IA (dépliable) */}
      <div className="border-t border-dark-700 mx-4" />
      <div className="px-4 py-2.5">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 text-[11px] text-gold-400 hover:text-gold-300 w-full transition-colors"
        >
          <Sparkles size={11} />
          <span className="font-medium">Pourquoi vous êtes compatibles</span>
          <span className="ml-auto">{open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="expl"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-2.5 pb-1">
                {/* Texte explicatif */}
                <p className="text-dark-200 text-[11px] leading-relaxed mb-2.5">
                  {r.explication.explication}
                </p>

                {/* Points forts */}
                {r.explication.pointsForts.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[9px] text-dark-500 uppercase tracking-wider mb-1">Points forts</p>
                    <div className="flex flex-wrap gap-1">
                      {r.explication.pointsForts.map((p, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gold-500/12 text-gold-400 border border-gold-500/20">
                          <span className="w-1 h-1 rounded-full bg-gold-500" />{p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Points d'attention */}
                {r.explication.pointsAttention.length > 0 && (
                  <div>
                    <p className="text-[9px] text-dark-500 uppercase tracking-wider mb-1">À explorer ensemble</p>
                    <div className="flex flex-wrap gap-1">
                      {r.explication.pointsAttention.map((p, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-dark-700 text-dark-300 border border-dark-600">
                          <AlertCircle size={8} className="text-dark-400" />{p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 pt-2 border-t border-dark-700">
        {r.maReponse === 'EN_ATTENTE' ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onRepondre(r.matchId, 'REJETE')}
              className="py-2 px-3 rounded-xl border border-dark-600 text-dark-300 hover:border-red-500/40 hover:text-red-400 transition-all text-xs font-medium"
            >
              Décliner
            </button>
            <button
              onClick={() => onRepondre(r.matchId, 'ACCEPTE')}
              className="btn-gold py-2 text-xs rounded-xl font-semibold flex items-center justify-center gap-1"
            >
              Accepter <ChevronRight size={12} />
            </button>
          </div>
        ) : r.maReponse === 'ACCEPTE' && r.status === 'CHAT_OUVERT' ? (
          <Link
            href={`/messages?matchId=${r.matchId}`}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all"
          >
            <MessageCircle size={13} /> Ouvrir la conversation
          </Link>
        ) : r.maReponse === 'ACCEPTE' ? (
          <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs bg-gold-500/8 text-gold-400 border border-gold-500/20">
            <Clock size={13} /> En attente de réponse
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs bg-dark-700 text-dark-500">
            <CheckCircle2 size={13} /> Décliné
          </div>
        )}
      </div>
    </article>
  )
}

// ─── Page principale ─────────────────────────────────────────────
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
    } catch {
      toast.error('Erreur chargement')
    } finally {
      setLoading(false)
    }
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
    finally { setCalculant(false) }
  }

  const repondre = async (matchId: string, rep: 'ACCEPTE' | 'REJETE') => {
    try {
      const res = await fetch(`/api/matching/${matchId}/repondre`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reponse: rep }),
      })
      if (res.ok) {
        toast.success(rep === 'ACCEPTE' ? "Accepté ! On vérifie si l'intérêt est mutuel…" : 'Décliné.')
        charger()
      }
    } catch { toast.error('Erreur') }
  }

  const planLbl: Record<string, string> = {
    GRATUIT: '1 profil / semaine', STANDARD: '2 profils / semaine', PREMIUM: '3 profils / semaine',
  }

  const enAttente       = resultats.filter(r => r.maReponse === 'EN_ATTENTE').length
  const conversations   = resultats.filter(r => r.status === 'CHAT_OUVERT').length
  const topScore        = resultats[0]?.scoreGlobal ?? null

  return (
    <div className="min-h-screen bg-dark-900">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-dark-800 border-r border-dark-700 hidden md:flex flex-col">
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-gold-500 flex items-center justify-center">
              <span className="text-gold-500 font-serif font-bold">M</span>
            </div>
            <div>
              <p className="text-white font-serif text-sm font-semibold">MASR</p>
              <p className="text-dark-400 text-xs">{planLbl[session?.user?.plan as string] ?? '—'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/tableau-de-bord', icon: Heart,         label: 'Mes compatibilités', active: true },
            { href: '/messages',        icon: MessageCircle, label: 'Messages' },
            { href: '/notifications',   icon: Bell,          label: 'Notifications' },
            { href: '/profil',          icon: User,          label: 'Mon profil' },
            { href: '/abonnement',      icon: TrendingUp,    label: 'Abonnement' },
            { href: '/parametres',      icon: Settings,      label: 'Paramètres' },
          ].map(({ href, icon: Icon, label, active }) => (
            <Link
              key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'text-dark-300 hover:text-white hover:bg-dark-700'
              }`}
            >
              <Icon size={16} />{label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
              <span className="text-gold-500 text-sm font-semibold">{session?.user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{session?.user?.name}</p>
              <p className="text-dark-400 text-xs truncate">{session?.user?.email}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2 text-dark-400 hover:text-white text-sm w-full transition-colors">
            <LogOut size={14} />Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu */}
      <main className="md:ml-64 p-5 md:p-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-2xl font-serif font-bold text-white">Salaam, {session?.user?.name} 👋</h1>
            <p className="text-dark-300 text-sm mt-1">
              {loading ? 'Chargement…'
                : resultats.length > 0 ? `${resultats.length} profil${resultats.length > 1 ? 's' : ''} analysé${resultats.length > 1 ? 's' : ''} par notre IA`
                : 'Lancez votre premier matching'}
            </p>
          </div>
          <button
            onClick={lancerMatching} disabled={calculant}
            className="btn-gold flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold"
          >
            {calculant
              ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : <Sparkles size={14} />}
            {calculant ? 'Analyse…' : 'Trouver des profils'}
          </button>
        </div>

        {/* Statistiques */}
        {!loading && resultats.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-7">
            {[
              { label: 'En attente',            val: enAttente,                     color: 'text-white' },
              { label: 'Conversations actives', val: conversations,                  color: 'text-green-400' },
              { label: 'Meilleur score',        val: topScore !== null ? `${topScore}%` : '—', color: 'text-gold-400' },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{val}</p>
                <p className="text-dark-400 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Grille */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2].map(i => (
              <div key={i} className="bg-dark-800 rounded-2xl border border-dark-700 p-4 space-y-3 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl bg-dark-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-dark-700 rounded w-3/4" />
                    <div className="h-2.5 bg-dark-700 rounded w-1/2" />
                  </div>
                  <div className="w-20 h-20 rounded-full bg-dark-700" />
                </div>
                {[1,2,3,4,5].map(j => <div key={j} className="h-1.5 bg-dark-700 rounded" />)}
              </div>
            ))}
          </div>
        ) : resultats.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-5">
              <Heart size={26} className="text-gold-500" />
            </div>
            <h2 className="text-xl font-serif font-bold text-white mb-2">Notre IA est prête</h2>
            <p className="text-dark-300 text-sm max-w-sm mx-auto mb-7 leading-relaxed">
              Notre algorithme analyse la foi, le projet de vie, la communication et plus
              encore pour vous proposer des profils vraiment compatibles — avec une explication claire.
            </p>
            <button onClick={lancerMatching} disabled={calculant} className="btn-gold inline-flex items-center gap-2 py-3 px-7 rounded-xl font-semibold">
              <Sparkles size={15} />
              {calculant ? 'Analyse en cours…' : 'Lancer le matching IA'}
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {resultats.map((r, i) => (
              <motion.div key={r.matchId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <CarteCompatibilite r={r} onRepondre={repondre} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Upgrade */}
        {session?.user?.plan === 'GRATUIT' && resultats.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-8 p-5 bg-dark-800 border border-gold-500/25 rounded-2xl flex items-center gap-4">
            <div className="p-2.5 bg-gold-500/10 rounded-xl flex-shrink-0">
              <Sparkles size={20} className="text-gold-500" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Recevez plus de profils compatibles</p>
              <p className="text-dark-300 text-xs mt-0.5">Standard : 2 profils / semaine — Premium : 3 profils + accès prioritaire</p>
            </div>
            <Link href="/abonnement" className="btn-gold py-2 px-4 text-sm flex-shrink-0 flex items-center gap-1 rounded-xl font-semibold">
              Voir les offres <ChevronRight size={14} />
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  )
}
