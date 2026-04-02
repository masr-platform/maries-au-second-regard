'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Video, Calendar, Clock, Users, Shield, ChevronLeft,
  ChevronRight, RefreshCw, ExternalLink, CheckCircle2,
  XCircle, PlayCircle, AlertCircle, LayoutGrid, List,
  ArrowLeft,
} from 'lucide-react'
import {
  format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isSameMonth, isToday, startOfDay,
  addMinutes, isPast, isFuture, differenceInMinutes,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────
interface AdminSession {
  id:           string
  type:         string
  status:       string
  scheduledAt:  string
  dureeMinutes: number
  montant:      number
  dailyRoomUrl: string | null
  peutRejoindre: boolean
  imam: { nom: string; prenom: string; type: string; photo: string | null }
  user1: { id: string; prenom: string; ville: string | null; photoUrl: string | null }
  user2: { id: string; prenom: string; ville: string | null; photoUrl: string | null } | null
  match: { id: string; scoreGlobal: number } | null
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  PLANIFIE: { label: 'Planifiée',  color: 'text-blue-400',   bg: 'bg-blue-500/10',  border: 'border-blue-500/30',   icon: Calendar },
  EN_COURS: { label: 'En cours',   color: 'text-green-400',  bg: 'bg-green-500/10', border: 'border-green-500/30',  icon: PlayCircle },
  TERMINE:  { label: 'Terminée',   color: 'text-slate-400',  bg: 'bg-slate-500/10', border: 'border-slate-500/30',  icon: CheckCircle2 },
  ANNULE:   { label: 'Annulée',    color: 'text-red-400',    bg: 'bg-red-500/10',   border: 'border-red-500/30',    icon: XCircle },
}

const TYPE_LABEL: Record<string, string> = {
  MOUQUABALA:      'Mouqabala',
  THERAPIE_COUPLE: 'Thérapie',
  INDIVIDUEL:      'Individuelle',
  SPIRITUEL:       'Spirituelle',
}

// ─── Carte session ────────────────────────────────────────────────
function CarteSession({ s, compact = false }: { s: AdminSession; compact?: boolean }) {
  const cfg  = STATUS_CFG[s.status] ?? STATUS_CFG.PLANIFIE
  const Icon = cfg.icon
  const date = new Date(s.scheduledAt)
  const fin  = addMinutes(date, s.dureeMinutes)
  const now  = new Date()

  // Lien dispo 10 min avant jusqu'à la fin
  const linkDispo = s.dailyRoomUrl &&
    now >= addMinutes(date, -10) &&
    now <= fin

  const minutesAvant = differenceInMinutes(date, now)
  const sessionEnCours = now >= date && now <= fin

  return (
    <div className={`bg-[#0d0a1f] border ${linkDispo ? 'border-green-500/40 shadow-lg shadow-green-500/10' : 'border-white/8'} rounded-2xl overflow-hidden transition-all ${compact ? 'p-3' : 'p-5'}`}>

      {/* Barre colorée statut */}
      <div className={`h-1 -mx-${compact ? '3' : '5'} -mt-${compact ? '3' : '5'} mb-${compact ? '3' : '4'} ${
        s.status === 'EN_COURS' || linkDispo ? 'bg-green-500' :
        s.status === 'PLANIFIE' ? 'bg-blue-500' :
        s.status === 'ANNULE'   ? 'bg-red-500'  : 'bg-slate-600'
      }`} style={{ marginLeft: compact ? '-12px' : '-20px', marginRight: compact ? '-12px' : '-20px', marginTop: compact ? '-12px' : '-20px', marginBottom: compact ? '12px' : '16px' }} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Participants */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex -space-x-1.5">
              {[s.user1, s.user2].filter(Boolean).map((u, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-purple-500/20 border-2 border-[#0d0a1f] flex items-center justify-center">
                  {u!.photoUrl
                    ? <img src={u!.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    : <span className="text-purple-300 text-[10px] font-bold">{u!.prenom[0]}</span>
                  }
                </div>
              ))}
            </div>
            <span className="text-white text-sm font-semibold">
              {s.user1.prenom}
              {s.user2 && ` × ${s.user2.prenom}`}
            </span>
            {s.match && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold">
                {Math.round(s.match.scoreGlobal)}%
              </span>
            )}
          </div>

          {/* Date + superviseur */}
          <div className="flex items-center gap-3 text-xs text-white/40 mb-2">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {format(date, "HH'h'mm", { locale: fr })} — {format(fin, "HH'h'mm", { locale: fr })}
            </span>
            <span className="flex items-center gap-1">
              <Shield size={11} className="text-purple-400" />
              {s.imam.type === 'IMAM' ? 'Imam' : 'Dr.'} {s.imam.prenom} {s.imam.nom}
            </span>
          </div>

          {/* Badges */}
          <div className="flex gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
              <Icon size={9} /> {cfg.label}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/8">
              {TYPE_LABEL[s.type] ?? s.type}
            </span>
            {minutesAvant > 0 && minutesAvant <= 60 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 font-semibold animate-pulse">
                Dans {minutesAvant < 60 ? `${minutesAvant} min` : '1h'}
              </span>
            )}
            {sessionEnCours && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25 font-semibold">
                ● En cours
              </span>
            )}
          </div>
        </div>

        {/* CTA rejoindre */}
        {s.dailyRoomUrl ? (
          linkDispo ? (
            <a
              href={s.dailyRoomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black text-xs font-bold transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
            >
              <Video size={13} />
              Rejoindre
              <ExternalLink size={10} />
            </a>
          ) : (
            <div className="flex-shrink-0 text-right">
              <p className="text-white/25 text-[10px] mb-0.5">Lien disponible</p>
              <p className="text-white/40 text-[10px]">{minutesAvant > 0 ? `dans ${minutesAvant < 60 ? `${minutesAvant} min` : format(date, "HH'h'mm")}` : 'session passée'}</p>
            </div>
          )
        ) : (
          <div className="flex-shrink-0 text-[10px] text-white/25 text-right">
            <AlertCircle size={14} className="mx-auto mb-0.5 text-amber-500/50" />
            Pas de lien vidéo
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════
export default function AdminMouqabalasPage() {
  const [sessions, setSessions]     = useState<AdminSession[]>([])
  const [stats, setStats]           = useState<Record<string, number>>({})
  const [mois, setMois]             = useState(new Date())
  const [jourSelectionne, setJour]  = useState<Date | null>(new Date())
  const [vue, setVue]               = useState<'calendrier' | 'liste'>('calendrier')
  const [loading, setLoading]       = useState(true)
  const [filtreStatut, setFiltre]   = useState<string>('tous')

  const charger = useCallback(async () => {
    setLoading(true)
    try {
      // Charger 3 mois de sessions
      const from = format(startOfMonth(addMonths(mois, -1)), 'yyyy-MM-dd')
      const to   = format(endOfMonth(addMonths(mois, 1)),   'yyyy-MM-dd')
      const res  = await fetch(`/api/admin/sessions?from=${from}&to=${to}&limite=500`)
      if (!res.ok) { toast.error('Erreur chargement'); return }
      const data = await res.json()
      setSessions(data.sessions ?? [])
      setStats(data.stats ?? {})
    } catch { toast.error('Erreur réseau') }
    finally { setLoading(false) }
  }, [mois])

  useEffect(() => { charger() }, [charger])

  // Rafraîchissement auto toutes les 60s (pour le flag "peutRejoindre")
  useEffect(() => {
    const iv = setInterval(charger, 60_000)
    return () => clearInterval(iv)
  }, [charger])

  // Sessions filtrées
  const sessionsFiltrees = sessions.filter(s =>
    filtreStatut === 'tous' || s.status === filtreStatut
  )

  // Sessions du jour sélectionné
  const sessionsDuJour = jourSelectionne
    ? sessions.filter(s => isSameDay(new Date(s.scheduledAt), jourSelectionne))
    : []

  // Sessions avec lien disponible maintenant
  const sessionsMaintenant = sessions.filter(s => s.peutRejoindre)

  // Jours du mois avec sessions
  const joursAvecSessions = new Map<string, AdminSession[]>()
  sessions.forEach(s => {
    const key = format(new Date(s.scheduledAt), 'yyyy-MM-dd')
    if (!joursAvecSessions.has(key)) joursAvecSessions.set(key, [])
    joursAvecSessions.get(key)!.push(s)
  })

  // Grille calendrier
  const debutMois  = startOfMonth(mois)
  const finMois    = endOfMonth(mois)
  const jours      = eachDayOfInterval({ start: debutMois, end: finMois })
  const premierJour = (getDay(debutMois) + 6) % 7 // 0 = lundi
  const vides      = Array(premierJour).fill(null)

  return (
    <div className="min-h-screen bg-[#060412] text-white p-5 md:p-8">

      <style jsx global>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Video size={20} className="text-white" />
              </div>
              Calendrier Mouqabalas
            </h1>
            <p className="text-white/40 text-sm mt-1 ml-1">
              Toutes les sessions · Liens vidéo actifs 10 min avant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Vue toggle */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
            <button onClick={() => setVue('calendrier')}
              className={`p-2 rounded-lg transition-all ${vue === 'calendrier' ? 'bg-violet-500/30 text-violet-300' : 'text-white/40 hover:text-white'}`}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setVue('liste')}
              className={`p-2 rounded-lg transition-all ${vue === 'liste' ? 'bg-violet-500/30 text-violet-300' : 'text-white/40 hover:text-white'}`}>
              <List size={15} />
            </button>
          </div>
          <button onClick={charger}
            className="flex items-center gap-2 text-sm text-white bg-white/8 hover:bg-white/12 border border-white/10 px-4 py-2 rounded-xl transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── Alerte sessions actives maintenant ─────────────────── */}
      {sessionsMaintenant.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-between gap-4"
          style={{ animation: 'fadeInUp 0.3s ease both' }}>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <div>
              <p className="text-green-400 font-bold text-sm">
                {sessionsMaintenant.length} session{sessionsMaintenant.length > 1 ? 's' : ''} disponible{sessionsMaintenant.length > 1 ? 's' : ''} maintenant
              </p>
              <p className="text-green-400/60 text-xs">Le lien de connexion est actif</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {sessionsMaintenant.slice(0, 3).map(s => (
              <a key={s.id} href={s.dailyRoomUrl!} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black text-xs font-bold transition-all">
                <Video size={12} />
                {s.user1.prenom} × {s.user2?.prenom}
                <ExternalLink size={10} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── KPIs rapides ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Total',       val: stats.total     ?? 0, color: 'text-white',        bg: 'bg-white/5',          filter: 'tous' },
          { label: "Aujourd'hui", val: stats.aujourdhui ?? 0, color: 'text-amber-400',   bg: 'bg-amber-500/10',     filter: 'tous' },
          { label: 'Planifiées',  val: stats.planifiees ?? 0, color: 'text-blue-400',    bg: 'bg-blue-500/10',      filter: 'PLANIFIE' },
          { label: 'En cours',    val: stats.enCours   ?? 0, color: 'text-green-400',    bg: 'bg-green-500/10',     filter: 'EN_COURS' },
          { label: 'Annulées',    val: stats.annulees  ?? 0, color: 'text-red-400',      bg: 'bg-red-500/10',       filter: 'ANNULE' },
        ].map((k, i) => (
          <button
            key={k.label}
            onClick={() => setFiltre(k.filter)}
            style={{ animation: `fadeInUp 0.3s ease ${i * 0.05}s both` }}
            className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
              filtreStatut === k.filter
                ? `${k.bg} border-current ${k.color} shadow-lg`
                : 'bg-[#0d0a1f] border-white/8 hover:border-white/15'
            }`}
          >
            <p className="text-white/40 text-xs font-medium">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.val}</p>
          </button>
        ))}
      </div>

      {vue === 'calendrier' ? (
        // ════════════════════════════════════════════════════════
        // VUE CALENDRIER — côte à côte : grille + détail du jour
        // ════════════════════════════════════════════════════════
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

          {/* Grille mensuelle */}
          <div className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5">
            {/* Nav mois */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setMois(m => addMonths(m, -1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-white/50 hover:text-white transition-colors">
                <ChevronLeft size={16} />
              </button>
              <h2 className="text-white font-semibold capitalize">
                {format(mois, 'MMMM yyyy', { locale: fr })}
              </h2>
              <button onClick={() => setMois(m => addMonths(m, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-white/50 hover:text-white transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Jours semaine */}
            <div className="grid grid-cols-7 mb-2">
              {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(j => (
                <div key={j} className="text-center text-[10px] text-white/30 font-semibold py-1">{j}</div>
              ))}
            </div>

            {/* Cases */}
            <div className="grid grid-cols-7 gap-1">
              {vides.map((_, i) => <div key={`v${i}`} />)}
              {jours.map(jour => {
                const key      = format(jour, 'yyyy-MM-dd')
                const sessJour = joursAvecSessions.get(key) ?? []
                const selected = jourSelectionne ? isSameDay(jour, jourSelectionne) : false
                const aujour   = isToday(jour)

                // Couleur dominante du jour
                const hasEnCours  = sessJour.some(s => s.status === 'EN_COURS' || s.peutRejoindre)
                const hasPlanifie = sessJour.some(s => s.status === 'PLANIFIE')

                return (
                  <button
                    key={key}
                    onClick={() => setJour(jour)}
                    className={`
                      relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all hover:scale-105
                      ${selected
                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30 scale-105'
                        : aujour
                          ? 'border border-amber-500/50 text-amber-300'
                          : 'hover:bg-white/5 text-white/60'
                      }
                    `}
                  >
                    <span className="font-semibold text-xs">{format(jour, 'd')}</span>
                    {sessJour.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {sessJour.slice(0, 3).map((_, di) => (
                          <div key={di} className={`w-1 h-1 rounded-full ${
                            hasEnCours  ? 'bg-green-400' :
                            hasPlanifie ? 'bg-blue-400'  : 'bg-slate-500'
                          }`} />
                        ))}
                        {sessJour.length > 3 && (
                          <span className="text-[8px] text-white/40">+{sessJour.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Légende */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-[10px] text-white/40">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400" />Planifiée</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-400" />En cours / Rejoignable</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-500" />Passée</span>
            </div>
          </div>

          {/* Panneau détail du jour */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold capitalize">
                {jourSelectionne
                  ? format(jourSelectionne, 'EEEE d MMMM', { locale: fr })
                  : 'Sélectionnez un jour'}
              </h3>
              <span className="text-white/40 text-xs">{sessionsDuJour.length} session{sessionsDuJour.length !== 1 ? 's' : ''}</span>
            </div>

            {sessionsDuJour.length === 0 ? (
              <div className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-8 text-center">
                <Calendar size={24} className="text-white/20 mx-auto mb-2" />
                <p className="text-white/30 text-sm">Aucune session ce jour</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {sessionsDuJour
                  .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                  .map(s => (
                    <CarteSession key={s.id} s={s} />
                  ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // ════════════════════════════════════════════════════════
        // VUE LISTE — toutes les sessions filtrées
        // ════════════════════════════════════════════════════════
        <div className="space-y-3">
          {sessionsFiltrees.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <Video size={32} className="mx-auto mb-3 opacity-40" />
              <p>Aucune session {filtreStatut !== 'tous' ? STATUS_CFG[filtreStatut]?.label.toLowerCase() : ''}</p>
            </div>
          ) : (
            sessionsFiltrees
              .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
              .map((s, i) => (
                <div key={s.id} style={{ animation: `fadeInUp 0.25s ease ${i * 0.03}s both` }}>
                  <div className="flex items-center gap-3 mb-1 px-1">
                    <span className="text-white/30 text-xs capitalize">
                      {format(new Date(s.scheduledAt), 'EEEE d MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <CarteSession s={s} />
                </div>
              ))
          )}
        </div>
      )}
    </div>
  )
}
