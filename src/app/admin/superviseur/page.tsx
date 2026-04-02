'use client'

// ══════════════════════════════════════════════════════════════
// /admin/superviseur — Dashboard Superviseur (rôle ADMIN)
// Centré sur les mouqabalas assignées au superviseur connecté :
//   • Séances du jour mises en avant
//   • Calendrier mensuel compact
//   • Prochaines sessions avec lien de connexion
//   • Historique des sessions passées
// ══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Video, CalendarDays, Clock, CheckCircle2, XCircle,
  RefreshCw, ChevronLeft, ChevronRight, Users, Loader2,
  Shield, ExternalLink, AlertCircle, Star, PlayCircle,
  X, MapPin, Mail, Phone, BookOpen, UserCheck, Ban, Eye,
} from 'lucide-react'
import toast from 'react-hot-toast'

/* ── Types ──────────────────────────────────────────────────── */
interface Session {
  id:           string
  scheduledAt:  string
  dureeMinutes: number
  status:       'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE'
  peutRejoindre: boolean
  dailyRoomUrl: string | null
  imam: { nom: string; prenom: string; type: string; photo?: string | null }
  user1: { id: string; prenom: string; ville?: string; photoUrl?: string | null }
  user2: { id: string; prenom: string; ville?: string; photoUrl?: string | null }
  match?: { scoreGlobal?: number | null } | null
}

/* ── Helpers ────────────────────────────────────────────────── */
const JOURS   = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MOIS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
}

function StatusBadge({ status }: { status: Session['status'] }) {
  const map = {
    PLANIFIE: { label: 'Planifiée',  cls: 'bg-blue-500/15 text-blue-300 border border-blue-500/20' },
    EN_COURS: { label: 'En cours',   cls: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' },
    TERMINE:  { label: 'Terminée',   cls: 'bg-white/8 text-white/40 border border-white/8' },
    ANNULE:   { label: 'Annulée',    cls: 'bg-red-500/15 text-red-300 border border-red-500/20' },
  }
  const b = map[status] ?? map.PLANIFIE
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${b.cls}`}>
      {b.label}
    </span>
  )
}

function Avatar({ prenom, color, onClick }: { prenom: string; color: string; onClick?: () => void }) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 hover:ring-2 hover:ring-white/30 transition-all ${color}`}
        title={`Voir le profil de ${prenom}`}
      >
        {prenom[0]}
      </button>
    )
  }
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
      {prenom[0]}
    </div>
  )
}

/* ── Mini drawer profil superviseur ────────────────────── */
interface UserSupDetail {
  id: string; prenom: string; email: string; genre: string
  ville: string; pays: string; origine?: string | null; phone?: string | null
  photos: string[]; photoUrl?: string | null; photoApproved?: boolean
  plan: string; role: string; isVerified: boolean; isBanned: boolean
  isSuspended: boolean; banReason?: string | null
  age: number | null; createdAt: string; lastActiveAt?: string | null
  questionnaireCompleted: boolean; profileCompleted?: boolean
  stats: { matchCount: number; convCount: number; sessionCount: number; signalementCount: number }
  questionnaireReponse?: {
    niveauPratique?: string | null; objectifMariage?: string | null
    souhaitEnfants?: boolean | null; modeVieSouhaite?: string | null
    niveauEtudes?: string | null; profession?: string | null
    portVoile?: boolean | null; portBarbe?: boolean | null; taille?: number | null
    partenaireIdeal5Mots?: string | null; visionFoyer?: string | null
    messageConjoint?: string | null
  } | null
}

function UserDrawerSup({
  user, onClose,
}: {
  user: UserSupDetail
  onClose: () => void
}) {
  const [photo, setPhoto] = useState(user.photoUrl || '')
  const q = user.questionnaireReponse

  const row = (label: string, value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined || value === '') return null
    const txt = typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : String(value)
    return (
      <div className="flex gap-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="text-xs w-40 shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
        <span className="text-xs text-white font-medium">{txt}</span>
      </div>
    )
  }

  const pratiqueLabel: Record<string, string> = {
    debutant: 'Débutant(e)', pratiquant: 'Pratiquant(e)',
    tres_pratiquant: 'Très pratiquant(e)', savant: 'Savant(e)',
  }
  const objectifLabel: Record<string, string> = {
    mariage_uniquement: 'Mariage direct', mariage_apres: 'Après connaissance',
    engagement_progressif: 'Engagement progressif',
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div
        className="fixed top-0 right-0 bottom-0 z-50 overflow-y-auto"
        style={{ width: 'min(560px, 100vw)', background: '#0a0817', borderLeft: '1px solid rgba(255,255,255,0.08)', animation: 'slideInRight 0.22s ease' }}
      >
        <style>{`@keyframes slideInRight { from { transform: translateX(50px); opacity:0 } to { transform: translateX(0); opacity:1 } }`}</style>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{ background: '#0a0817', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-white font-semibold text-sm">Profil de {user.prenom}</p>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-all">
            <X size={15} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Hero */}
          <div className="flex items-start gap-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden"
                style={{ border: '2px solid rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.1)' }}>
                {photo ? (
                  <img src={photo} alt={user.prenom} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ color: '#a78bfa' }}>
                    {user.prenom[0]}
                  </div>
                )}
              </div>
              {user.photos.length > 1 && (
                <div className="flex gap-1 mt-1.5">
                  {user.photos.slice(0, 3).map((p, i) => (
                    <button key={i} onClick={() => setPhoto(p)}
                      className="w-5 h-5 rounded overflow-hidden"
                      style={{ border: photo === p ? '1.5px solid #a78bfa' : '1.5px solid rgba(255,255,255,0.1)' }}>
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="text-white font-bold">{user.prenom}</p>
                {user.age && <span className="text-white/50 text-sm">{user.age} ans</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${user.genre === 'HOMME' ? 'bg-blue-500/15 text-blue-300' : 'bg-fuchsia-500/15 text-fuchsia-300'}`}>
                  {user.genre === 'HOMME' ? '♂ Homme' : '♀ Femme'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {user.ville && <span className="flex items-center gap-1"><MapPin size={9} />{user.ville}</span>}
                {user.email && <span className="flex items-center gap-1"><Mail size={9} />{user.email}</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.isVerified
                  ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-semibold">✓ Vérifié</span>
                  : <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20 font-semibold">⏳ Non vérifié</span>}
                {user.isBanned && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/20 font-semibold">🚫 Banni</span>}
                {user.questionnaireReponse && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20 font-semibold">✓ Questionnaire</span>}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Matchs',       val: user.stats.matchCount,       color: '#f472b6' },
              { label: 'Convs',        val: user.stats.convCount,        color: '#34d399' },
              { label: 'Sessions',     val: user.stats.sessionCount,     color: '#60a5fa' },
              { label: 'Signalements', val: user.stats.signalementCount, color: '#f87171' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-lg font-bold" style={{ color: s.color }}>{s.val}</p>
                <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Identité */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(167,139,250,0.6)' }}>Identité</p>
            {row('Email',             user.email)}
            {row('Téléphone',         user.phone)}
            {row('Pays',              user.pays)}
            {row('Origine',           user.origine)}
            {row('Inscrit le',        new Date(user.createdAt).toLocaleString('fr-FR'))}
            {user.lastActiveAt && row('Dernière activité', new Date(user.lastActiveAt).toLocaleString('fr-FR'))}
          </div>

          {/* Questionnaire résumé */}
          {q && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(167,139,250,0.6)' }}>Questionnaire</p>
              {row('Niveau de pratique', q.niveauPratique ? (pratiqueLabel[q.niveauPratique] ?? q.niveauPratique) : null)}
              {row('Objectif mariage',   q.objectifMariage ? (objectifLabel[q.objectifMariage] ?? q.objectifMariage) : null)}
              {row('Souhaite enfants',   q.souhaitEnfants)}
              {row('Mode de vie',        q.modeVieSouhaite)}
              {row('Études',             q.niveauEtudes)}
              {row('Profession',         q.profession)}
              {row('Taille',             q.taille ? `${q.taille} cm` : null)}
              {row('Port du voile',      q.portVoile)}
              {row('Port de la barbe',   q.portBarbe)}
              {q.partenaireIdeal5Mots && row('Partenaire idéal', q.partenaireIdeal5Mots)}
              {q.visionFoyer && row('Vision du foyer',    q.visionFoyer)}
              {q.messageConjoint && row('Message au conjoint', q.messageConjoint)}
            </div>
          )}
          {!q && (
            <div className="text-center py-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <BookOpen size={18} className="mx-auto mb-1.5" style={{ color: 'rgba(255,255,255,0.2)' }} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Questionnaire non complété</p>
            </div>
          )}

          <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Pour les actions (vérifier, bannir…) → Dashboard Admin
          </p>
        </div>
      </div>
    </>
  )
}

/* ── Mini calendrier ────────────────────────────────────────── */
function MiniCalendrier({
  sessions,
  moisOffset,
  setMoisOffset,
  selectedDate,
  setSelectedDate,
}: {
  sessions: Session[]
  moisOffset: number
  setMoisOffset: (n: number) => void
  selectedDate: Date | null
  setSelectedDate: (d: Date | null) => void
}) {
  const base    = new Date()
  const year    = new Date(base.getFullYear(), base.getMonth() + moisOffset, 1).getFullYear()
  const month   = new Date(base.getFullYear(), base.getMonth() + moisOffset, 1).getMonth()
  const premier = new Date(year, month, 1)
  const dernier = new Date(year, month + 1, 0)

  // jours de la grille (lundi = 0)
  const debutDecale = (premier.getDay() + 6) % 7
  const jours: (Date | null)[] = [
    ...Array(debutDecale).fill(null),
    ...Array.from({ length: dernier.getDate() }, (_, i) => new Date(year, month, i + 1)),
  ]

  const hasSession = (d: Date) =>
    sessions.some(s => isSameDay(new Date(s.scheduledAt), d) && s.status !== 'ANNULE')

  const hasLive = (d: Date) =>
    sessions.some(s => isSameDay(new Date(s.scheduledAt), d) && s.peutRejoindre)

  return (
    <div className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5">
      {/* Nav mois */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMoisOffset(moisOffset - 1)}
          className="p-1.5 rounded-lg hover:bg-white/8 text-white/50 hover:text-white transition-all"
        >
          <ChevronLeft size={15} />
        </button>
        <h3 className="text-white font-semibold text-sm">
          {MOIS_FR[month]} {year}
        </h3>
        <button
          onClick={() => setMoisOffset(moisOffset + 1)}
          className="p-1.5 rounded-lg hover:bg-white/8 text-white/50 hover:text-white transition-all"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Entêtes */}
      <div className="grid grid-cols-7 mb-1">
        {JOURS.map(j => (
          <div key={j} className="text-center text-[10px] font-semibold text-white/30 py-1">{j}</div>
        ))}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7 gap-0.5">
        {jours.map((d, i) => {
          if (!d) return <div key={i} />
          const today    = isSameDay(d, new Date())
          const selected = selectedDate ? isSameDay(d, selectedDate) : false
          const live     = hasLive(d)
          const has      = hasSession(d)

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(selected ? null : d)}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                selected
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                  : today
                    ? 'bg-white/10 text-white border border-white/20'
                    : has
                      ? 'hover:bg-white/6 text-white/80'
                      : 'text-white/25 hover:text-white/50'
              }`}
            >
              {d.getDate()}
              {has && !selected && (
                <div className={`absolute bottom-1 w-1 h-1 rounded-full ${live ? 'bg-emerald-400' : 'bg-blue-400'}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 mt-4 text-[10px] text-white/40">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />En cours</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" />Planifiée</span>
      </div>
    </div>
  )
}

/* ── Carte session ──────────────────────────────────────────── */
function CarteSession({ session: s, onClickUser }: { session: Session; onClickUser?: (id: string) => void }) {
  const debut  = new Date(s.scheduledAt)
  const fin    = new Date(debut.getTime() + s.dureeMinutes * 60_000)
  const heureD = debut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const heureF = fin.toLocaleTimeString('fr-FR',   { hour: '2-digit', minute: '2-digit' })
  const dateStr = debut.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  const now   = Date.now()
  const diffMs = debut.getTime() - now
  const diffMin = Math.round(diffMs / 60_000)

  const imamTitre = s.imam.type === 'IMAM' ? 'Imam' : 'Dr.'

  return (
    <div
      className={`bg-[#0d0a1f] border rounded-2xl p-5 transition-all ${
        s.peutRejoindre
          ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/10'
          : 'border-white/8'
      }`}
      style={{ animation: 'fadeInUp 0.3s ease both' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-white/50 text-xs capitalize mb-0.5">{dateStr}</p>
          <p className="text-white font-semibold text-sm flex items-center gap-2">
            <Clock size={13} className="text-emerald-400 shrink-0" />
            {heureD} – {heureF}
            <span className="text-white/30 text-xs font-normal">({s.dureeMinutes} min)</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {s.status === 'EN_COURS' && (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              En cours
            </span>
          )}
          {s.status === 'PLANIFIE' && diffMin > 0 && diffMin <= 60 && (
            <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/25 px-2.5 py-1 rounded-full">
              Dans {diffMin} min
            </span>
          )}
          <StatusBadge status={s.status} />
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Avatar prenom={s.user1.prenom} color="bg-violet-500/20 text-violet-300" onClick={onClickUser ? () => onClickUser(s.user1.id) : undefined} />
          <div>
            <button
              className={`text-white text-xs font-semibold ${onClickUser ? 'hover:text-violet-300 transition-colors' : ''}`}
              onClick={onClickUser ? () => onClickUser(s.user1.id) : undefined}
            >{s.user1.prenom}</button>
            {s.user1.ville && <p className="text-white/30 text-[10px]">{s.user1.ville}</p>}
          </div>
        </div>
        <span className="text-white/20">×</span>
        <div className="flex items-center gap-2">
          <Avatar prenom={s.user2.prenom} color="bg-fuchsia-500/20 text-fuchsia-300" onClick={onClickUser ? () => onClickUser(s.user2.id) : undefined} />
          <div>
            <button
              className={`text-white text-xs font-semibold ${onClickUser ? 'hover:text-fuchsia-300 transition-colors' : ''}`}
              onClick={onClickUser ? () => onClickUser(s.user2.id) : undefined}
            >{s.user2.prenom}</button>
            {s.user2.ville && <p className="text-white/30 text-[10px]">{s.user2.ville}</p>}
          </div>
        </div>
        {s.match?.scoreGlobal != null && (
          <div className="ml-auto flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1">
            <Star size={10} className="text-amber-400" />
            <span className="text-amber-300 font-bold text-xs">{s.match.scoreGlobal}%</span>
          </div>
        )}
      </div>

      {/* Superviseur */}
      <p className="text-white/30 text-[11px] mb-4">
        Supervisé par <span className="text-white/60 font-medium">{imamTitre} {s.imam.prenom} {s.imam.nom}</span>
      </p>

      {/* CTA */}
      {s.peutRejoindre && s.dailyRoomUrl ? (
        <a
          href={s.dailyRoomUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-opacity"
        >
          <PlayCircle size={16} />
          Rejoindre la mouqabala
          <ExternalLink size={12} />
        </a>
      ) : s.status === 'PLANIFIE' ? (
        <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/8 text-white/30 text-sm font-medium">
          <Clock size={14} />
          Lien disponible 10 min avant
        </div>
      ) : null}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════════ */
export default function SuperviseurPage() {
  const [sessions,      setSessions]      = useState<Session[]>([])
  const [loading,       setLoading]       = useState(true)
  const [moisOffset,    setMoisOffset]    = useState(0)
  const [selectedDate,  setSelectedDate]  = useState<Date | null>(null)
  const [onglet,        setOnglet]        = useState<'aujourdhui' | 'avenir' | 'historique'>('aujourdhui')
  const [supDrawerUser, setSupDrawerUser] = useState<UserSupDetail | null>(null)
  const [supDrawerLoad, setSupDrawerLoad] = useState(false)

  const ouvrirProfil = async (userId: string) => {
    setSupDrawerLoad(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setSupDrawerUser(data.user)
      } else {
        toast.error('Impossible de charger le profil')
      }
    } catch { toast.error('Erreur réseau') }
    finally { setSupDrawerLoad(false) }
  }

  const charger = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/sessions?limite=200')
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
      }
    } catch {
      toast.error('Erreur chargement des sessions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { charger() }, [charger])

  // Auto-refresh toutes les 60 secondes
  useEffect(() => {
    const timer = setInterval(charger, 60_000)
    return () => clearInterval(timer)
  }, [charger])

  const now = new Date()

  const sessionsDuJour   = sessions.filter(s => isSameDay(new Date(s.scheduledAt), now) && s.status !== 'ANNULE')
  const sessionsAvenir   = sessions.filter(s => {
    const d = new Date(s.scheduledAt)
    return d > now && !isSameDay(d, now) && s.status === 'PLANIFIE'
  })
  const sessionsPassees  = sessions.filter(s => s.status === 'TERMINE')
  const sessionsLive     = sessions.filter(s => s.peutRejoindre)

  const sessionsDate     = selectedDate
    ? sessions.filter(s => isSameDay(new Date(s.scheduledAt), selectedDate) && s.status !== 'ANNULE')
    : null

  const totalConfirmees  = sessions.filter(s => s.status !== 'ANNULE').length
  const tauxCompletion   = totalConfirmees > 0
    ? Math.round((sessionsPassees.length / totalConfirmees) * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#060412] p-5 md:p-8">

      {/* Drawer profil utilisateur */}
      {supDrawerUser && (
        <UserDrawerSup user={supDrawerUser} onClose={() => setSupDrawerUser(null)} />
      )}
      {supDrawerLoad && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
              <Shield size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">Dashboard Superviseur</h1>
          </div>
          <p className="text-white/40 text-sm ml-1">Mariés au Second Regard — Supervision des mouqabalas</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm font-semibold text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 px-4 py-2 rounded-xl transition-all"
          >
            <Shield size={14} /> Dashboard Admin
          </Link>
          <button
            onClick={charger}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-white/8 hover:bg-white/12 border border-white/10 px-4 py-2 rounded-xl transition-all"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── Live alert ──────────────────────────────────────── */}
      {sessionsLive.length > 0 && (
        <div
          className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex items-center justify-between"
          style={{ animation: 'fadeInUp 0.3s ease both' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-300 font-semibold text-sm">
              {sessionsLive.length} mouqabala{sessionsLive.length > 1 ? 's' : ''} en direct maintenant
            </span>
          </div>
          <button
            onClick={() => setOnglet('aujourdhui')}
            className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            Voir les sessions du jour
          </button>
        </div>
      )}

      {/* ── KPI row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            titre:    "Séances aujourd'hui",
            valeur:   sessionsDuJour.length,
            gradient: 'from-violet-500 to-purple-600',
            icon:     CalendarDays,
            sous:     sessionsLive.length > 0 ? `${sessionsLive.length} en direct` : 'Aucune en direct',
          },
          {
            titre:    'À venir',
            valeur:   sessionsAvenir.length,
            gradient: 'from-blue-500 to-indigo-500',
            icon:     Clock,
            sous:     'Sessions planifiées',
          },
          {
            titre:    'Terminées',
            valeur:   sessionsPassees.length,
            gradient: 'from-amber-400 to-yellow-500',
            icon:     CheckCircle2,
            sous:     `Taux completion ${tauxCompletion}%`,
          },
          {
            titre:    'Total sessions',
            valeur:   totalConfirmees,
            gradient: 'from-emerald-500 to-teal-500',
            icon:     Video,
            sous:     `${sessions.filter(s => s.status === 'ANNULE').length} annulées`,
          },
        ].map((k) => {
          const Icon = k.icon
          return (
            <div
              key={k.titre}
              className="relative overflow-hidden bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 shadow-lg"
              style={{ animation: 'fadeInUp 0.35s ease both' }}
            >
              <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${k.gradient} opacity-20 blur-2xl`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-white/50 text-xs font-medium uppercase tracking-wide">{k.titre}</p>
                  <p className="text-3xl font-bold text-white mt-1">{k.valeur}</p>
                  <p className="text-white/40 text-xs mt-1">{k.sous}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${k.gradient} shadow-lg`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-emerald-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Colonne gauche : calendrier + sélection jour ── */}
          <div className="space-y-4">
            <MiniCalendrier
              sessions={sessions}
              moisOffset={moisOffset}
              setMoisOffset={setMoisOffset}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />

            {/* Sessions du jour sélectionné */}
            {selectedDate && sessionsDate && (
              <div className="bg-[#0d0a1f] border border-emerald-500/20 rounded-2xl p-4">
                <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <CalendarDays size={14} className="text-emerald-400" />
                  {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h4>
                {sessionsDate.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-4">Aucune session ce jour</p>
                ) : (
                  <div className="space-y-2">
                    {sessionsDate.map(s => {
                      const debut  = new Date(s.scheduledAt)
                      const heureD = debut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      return (
                        <div key={s.id} className="flex items-center gap-3 p-3 bg-white/4 border border-white/6 rounded-xl">
                          <span className="text-white font-bold text-xs w-12 shrink-0">{heureD}</span>
                          <span className="text-white/70 text-xs flex-1 truncate">{s.user1.prenom} × {s.user2.prenom}</span>
                          <StatusBadge status={s.status} />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Légende statuts */}
            <div className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-4 space-y-2">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-3">Statuts</p>
              {[
                { label: 'Planifiée',  cls: 'bg-blue-500/15 text-blue-300',     dot: 'bg-blue-400' },
                { label: 'En cours',   cls: 'bg-emerald-500/15 text-emerald-300', dot: 'bg-emerald-400' },
                { label: 'Terminée',   cls: 'bg-white/8 text-white/40',          dot: 'bg-white/30' },
                { label: 'Annulée',    cls: 'bg-red-500/15 text-red-300',         dot: 'bg-red-400' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${b.dot}`} />
                  <span className="text-white/60 text-xs">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Colonne droite : onglets sessions ─────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Onglets */}
            <div className="flex gap-1 bg-white/5 border border-white/8 p-1.5 rounded-2xl w-fit">
              {([
                { id: 'aujourdhui', label: `Aujourd'hui (${sessionsDuJour.length})`, icon: CalendarDays, color: 'text-violet-400' },
                { id: 'avenir',     label: `À venir (${sessionsAvenir.length})`,     icon: Clock,        color: 'text-blue-400' },
                { id: 'historique', label: `Historique (${sessionsPassees.length})`, icon: CheckCircle2, color: 'text-amber-400' },
              ] as const).map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setOnglet(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      onglet === tab.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20'
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={13} className={onglet === tab.id ? 'text-white' : tab.color} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Aujourd'hui */}
            {onglet === 'aujourdhui' && (
              <div className="space-y-4">
                {sessionsDuJour.length === 0 ? (
                  <div className="bg-[#0d0a1f] border border-white/8 rounded-2xl text-center py-14">
                    <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CalendarDays size={26} className="text-emerald-400" />
                    </div>
                    <p className="text-white font-semibold text-base">Aucune mouqabala aujourd'hui</p>
                    <p className="text-white/40 text-sm mt-2">Profitez de cette journée pour préparer les prochaines sessions.</p>
                  </div>
                ) : (
                  sessionsDuJour.map(s => <CarteSession key={s.id} session={s} onClickUser={ouvrirProfil} />)
                )}
              </div>
            )}

            {/* À venir */}
            {onglet === 'avenir' && (
              <div className="space-y-3">
                {sessionsAvenir.length === 0 ? (
                  <div className="bg-[#0d0a1f] border border-white/8 rounded-2xl text-center py-14">
                    <div className="w-14 h-14 bg-blue-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Clock size={26} className="text-blue-400" />
                    </div>
                    <p className="text-white font-semibold text-base">Aucune session à venir</p>
                    <p className="text-white/40 text-sm mt-2">Les nouvelles mouqabalas confirmées apparaîtront ici.</p>
                  </div>
                ) : (
                  sessionsAvenir.map((s, i) => {
                    const debut  = new Date(s.scheduledAt)
                    const fin    = new Date(debut.getTime() + s.dureeMinutes * 60_000)
                    const heureD = debut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    const heureF = fin.toLocaleTimeString('fr-FR',   { hour: '2-digit', minute: '2-digit' })
                    const dateStr = debut.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
                    const imamTitre = s.imam.type === 'IMAM' ? 'Imam' : 'Dr.'

                    return (
                      <div
                        key={s.id}
                        className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-4 flex items-center gap-4 hover:border-white/14 transition-all"
                        style={{ animation: `fadeInLeft 0.25s ease ${i * 0.05}s both` }}
                      >
                        <div className="text-center w-20 shrink-0 bg-white/4 border border-white/6 rounded-xl p-2">
                          <p className="text-white font-bold text-sm">{heureD}</p>
                          <p className="text-white/30 text-[10px] capitalize">{dateStr}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar prenom={s.user1.prenom} color="bg-violet-500/20 text-violet-300" onClick={() => ouvrirProfil(s.user1.id)} />
                          <button onClick={() => ouvrirProfil(s.user1.id)} className="text-white/70 text-xs font-semibold hover:text-violet-300 transition-colors">{s.user1.prenom}</button>
                          <span className="text-white/20 text-xs">×</span>
                          <Avatar prenom={s.user2.prenom} color="bg-fuchsia-500/20 text-fuchsia-300" onClick={() => ouvrirProfil(s.user2.id)} />
                          <button onClick={() => ouvrirProfil(s.user2.id)} className="text-white/70 text-xs font-semibold hover:text-fuchsia-300 transition-colors">{s.user2.prenom}</button>
                        </div>
                        <div className="text-right shrink-0 hidden md:block">
                          <p className="text-white/40 text-[10px]">{imamTitre} {s.imam.prenom} {s.imam.nom}</p>
                          <p className="text-white/30 text-[10px]">{heureD} – {heureF}</p>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Historique */}
            {onglet === 'historique' && (
              <div className="space-y-3">
                {sessionsPassees.length === 0 ? (
                  <div className="bg-[#0d0a1f] border border-white/8 rounded-2xl text-center py-14">
                    <div className="w-14 h-14 bg-amber-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={26} className="text-amber-400" />
                    </div>
                    <p className="text-white font-semibold text-base">Aucune session terminée</p>
                    <p className="text-white/40 text-sm mt-2">L'historique des mouqabalas supervisées apparaîtra ici.</p>
                  </div>
                ) : (
                  sessionsPassees.map((s, i) => {
                    const debut   = new Date(s.scheduledAt)
                    const heureD  = debut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    const dateStr = debut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

                    return (
                      <div
                        key={s.id}
                        className="bg-[#0d0a1f] border border-white/6 rounded-2xl p-4 flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity"
                        style={{ animation: `fadeInLeft 0.25s ease ${i * 0.04}s both` }}
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={15} className="text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/70 text-sm font-semibold truncate">
                            <button onClick={() => ouvrirProfil(s.user1.id)} className="hover:text-violet-300 transition-colors">{s.user1.prenom}</button>
                            <span className="text-white/30 mx-1">×</span>
                            <button onClick={() => ouvrirProfil(s.user2.id)} className="hover:text-fuchsia-300 transition-colors">{s.user2.prenom}</button>
                          </p>
                          <p className="text-white/30 text-xs capitalize">{dateStr} · {heureD}</p>
                        </div>
                        {s.match?.scoreGlobal != null && (
                          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/15 rounded-lg px-2 py-1 shrink-0">
                            <Star size={10} className="text-amber-400" />
                            <span className="text-amber-300 font-bold text-xs">{s.match.scoreGlobal}%</span>
                          </div>
                        )}
                        <StatusBadge status={s.status} />
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
