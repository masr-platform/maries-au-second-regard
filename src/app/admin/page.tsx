'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users, MessageCircle, AlertTriangle, TrendingUp,
  CheckCircle2, Ban, Eye, Flag, RefreshCw, Shield,
  Heart, DollarSign, Activity, Crown, Zap, Sparkles,
  UserCheck, Clock, ChevronRight, BarChart3, Video,
  CalendarDays, ExternalLink, Search, ChevronLeft,
  X, BookOpen, Home, Briefcase, MapPin, Phone, Mail,
  Camera, Star, Tag, CreditCard, Calendar, ArrowRight,
  MessageSquare, Repeat2,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Stats {
  totalUsers:             number
  nouveauxAujourdhui:     number
  totalMatchs:            number
  chatsouverts:           number
  signalementsEnCours:    number
  revenuMois:             number
  revenuMensuelReel:      number
  usersBannis:            number
  questionnaireCompletes: number
  subscriptionsActives:   number
  subscriptionsMois:      Array<{
    id: string; plan: string; status: string; createdAt: string
    currentPeriodEnd: string; cancelAtPeriodEnd: boolean
    user: { id: string; prenom: string; email: string }
  }>
  repartitionPlans:       Record<string, number>
}

interface SessionAdmin {
  id:           string
  scheduledAt:  string
  dureeMinutes: number
  status:       string
  peutRejoindre: boolean
  dailyRoomUrl: string | null
  imam: { nom: string; prenom: string; type: string }
  user1: { id: string; prenom: string; photoUrl?: string | null }
  user2: { id: string; prenom: string; photoUrl?: string | null }
}

interface SessionStats {
  total:      number
  planifiees: number
  enCours:    number
  terminees:  number
  annulees:   number
  aujourdhui: number
}

interface Signalement {
  id:             string
  conversationId: string
  flagType:       string
  flagDetails:    string
  flaggedAt:      string
  user1:          { prenom: string }
  user2:          { prenom: string }
}

interface UserRecent {
  id:                     string
  prenom:                 string
  genre:                  string
  ville:                  string
  plan:                   string
  createdAt:              string
  isVerified:             boolean
  questionnaireCompleted: boolean
}

/* ── KPI card ─────────────────────────────────────────── */
function KPICard({ titre, valeur, icon: Icon, gradient, sousTitre, glow, onClick }: {
  titre: string
  valeur: number | string
  icon: React.ElementType
  gradient: string
  sousTitre?: string
  glow?: string
  onClick?: () => void
}) {
  return (
    <div
      className={`relative overflow-hidden bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 shadow-lg transition-all ${glow ?? ''} ${onClick ? 'cursor-pointer hover:border-white/20 hover:shadow-xl hover:scale-[1.02]' : ''}`}
      style={{ animation: 'fadeInUp 0.35s ease both' }}
      onClick={onClick}
    >
      {/* gradient orb background */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-white/50 text-xs font-medium uppercase tracking-wide">{titre}</p>
          <p className="text-3xl font-bold text-white mt-1">{valeur}</p>
          {sousTitre && <p className="text-white/40 text-xs mt-1">{sousTitre}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      {onClick && (
        <div className="absolute bottom-3 right-3 opacity-30 hover:opacity-60 transition-opacity">
          <ChevronRight size={13} className="text-white" />
        </div>
      )}
    </div>
  )
}

/* ── KPI drill-down panel ─────────────────────────────── */
type KPIPanelType = 'membres' | 'matchs' | 'mouqabalas' | 'signalements' | 'revenu'

function KPIPanel({
  type, onClose, stats, users, sessions, signalements, sessionStats,
  onOpenProfil,
}: {
  type: KPIPanelType
  onClose: () => void
  stats: Stats | null
  users: UserRecent[]
  sessions: SessionAdmin[]
  signalements: Signalement[]
  sessionStats: SessionStats | null
  onOpenProfil: (id: string) => void
}) {
  const config: Record<KPIPanelType, { titre: string; gradient: string }> = {
    membres:       { titre: 'Membres inscrits',      gradient: 'from-violet-500 to-purple-600' },
    matchs:        { titre: 'Matchs actifs',          gradient: 'from-pink-500 to-rose-500' },
    mouqabalas:    { titre: 'Sessions mouqabala',     gradient: 'from-emerald-500 to-teal-500' },
    signalements:  { titre: 'Signalements en cours',  gradient: 'from-red-500 to-orange-500' },
    revenu:        { titre: 'Revenus & abonnements',  gradient: 'from-amber-400 to-yellow-500' },
  }
  const { titre, gradient } = config[type]

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div
        className="fixed top-0 right-0 bottom-0 z-50 overflow-y-auto"
        style={{ width: 'min(560px, 100vw)', background: '#0a0817', borderLeft: '1px solid rgba(255,255,255,0.08)', animation: 'slideInRight 0.22s ease' }}
      >
        <style>{`@keyframes slideInRight { from { transform: translateX(50px); opacity:0 } to { transform: translateX(0); opacity:1 } }`}</style>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{ background: '#0a0817', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${gradient}`} />
            <p className="text-white font-bold text-sm">{titre}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-all">
            <X size={15} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        <div className="p-5 space-y-3">

          {/* ── MEMBRES ── */}
          {type === 'membres' && (
            <>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Total',     val: stats?.totalUsers ?? 0,             color: '#a78bfa' },
                  { label: "Auj.",      val: stats?.nouveauxAujourdhui ?? 0,     color: '#34d399' },
                  { label: 'Bannis',    val: stats?.usersBannis ?? 0,            color: '#f87171' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-xl font-bold" style={{ color: s.color }}>{s.val}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
              {users.length === 0 ? (
                <p className="text-center text-sm py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucun membre</p>
              ) : (
                <div className="space-y-1.5">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { onClose(); onOpenProfil(u.id) }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/5"
                      style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: u.genre === 'HOMME' ? 'rgba(59,130,246,0.2)' : 'rgba(217,70,239,0.2)', color: u.genre === 'HOMME' ? '#93c5fd' : '#e879f9' }}>
                        {u.prenom[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold">{u.prenom}</p>
                        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {u.ville || '—'} · {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <PlanBadge plan={u.plan} />
                        {u.isVerified
                          ? <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>✓</span>
                          : <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>⏳</span>
                        }
                      </div>
                      <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── MATCHS ACTIFS ── */}
          {type === 'matchs' && (
            <>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Chats ouverts', val: stats?.chatsouverts ?? 0,  color: '#f472b6' },
                  { label: 'Total matchs',  val: stats?.totalMatchs ?? 0,   color: '#c084fc' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
              {sessions.filter(s => s.status === 'EN_COURS' || s.status === 'PLANIFIE').length === 0 ? (
                <p className="text-center text-sm py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucun match actif</p>
              ) : (
                <div className="space-y-1.5">
                  {sessions.filter(s => s.status === 'EN_COURS' || s.status === 'PLANIFIE').map((s) => {
                    const debut = new Date(s.scheduledAt)
                    const dateStr = debut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                    const heureD  = debut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    return (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <button onClick={() => { onClose(); onOpenProfil(s.user1.id) }}
                          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                          <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-[11px] font-bold text-violet-300">{s.user1.prenom[0]}</div>
                          <span className="text-xs font-medium text-white/70">{s.user1.prenom}</span>
                        </button>
                        <span className="text-white/20 text-xs">×</span>
                        <button onClick={() => { onClose(); onOpenProfil(s.user2.id) }}
                          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                          <div className="w-7 h-7 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-[11px] font-bold text-fuchsia-300">{s.user2.prenom[0]}</div>
                          <span className="text-xs font-medium text-white/70">{s.user2.prenom}</span>
                        </button>
                        <div className="ml-auto text-right">
                          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{dateStr} {heureD}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${s.status === 'EN_COURS' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-blue-500/15 text-blue-300'}`}>
                            {s.status === 'EN_COURS' ? 'En cours' : 'Planifié'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* ── MOUQABALAS ── */}
          {type === 'mouqabalas' && (
            <>
              {sessionStats && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'Total',      val: sessionStats.total,      color: '#94a3b8' },
                    { label: "Auj.",       val: sessionStats.aujourdhui, color: '#a78bfa' },
                    { label: 'Planifiées', val: sessionStats.planifiees, color: '#60a5fa' },
                    { label: 'Terminées', val: sessionStats.terminees,  color: '#fbbf24' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="text-lg font-bold" style={{ color: s.color }}>{s.val}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
              {sessions.length === 0 ? (
                <p className="text-center text-sm py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucune session</p>
              ) : (
                <div className="space-y-1.5">
                  {sessions.slice(0, 30).map((s) => {
                    const debut   = new Date(s.scheduledAt)
                    const dateStr = debut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })
                    const heureD  = debut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    const statusCls = {
                      PLANIFIE: 'bg-blue-500/15 text-blue-300',
                      EN_COURS: 'bg-emerald-500/15 text-emerald-300',
                      TERMINE:  'bg-white/8 text-white/35',
                      ANNULE:   'bg-red-500/15 text-red-300',
                    }[s.status] ?? 'bg-white/8 text-white/35'
                    const statusLabel = { PLANIFIE: 'Planif.', EN_COURS: 'En cours', TERMINE: 'Terminée', ANNULE: 'Annulée' }[s.status] ?? s.status

                    return (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="text-center w-16 shrink-0">
                          <p className="text-white text-xs font-semibold">{heureD}</p>
                          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{dateStr}</p>
                        </div>
                        <button onClick={() => { onClose(); onOpenProfil(s.user1.id) }} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                          <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-300">{s.user1.prenom[0]}</div>
                          <span className="text-xs text-white/60">{s.user1.prenom}</span>
                        </button>
                        <span className="text-white/20 text-[10px]">×</span>
                        <button onClick={() => { onClose(); onOpenProfil(s.user2.id) }} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                          <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-[10px] font-bold text-fuchsia-300">{s.user2.prenom[0]}</div>
                          <span className="text-xs text-white/60">{s.user2.prenom}</span>
                        </button>
                        <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusCls}`}>{statusLabel}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* ── SIGNALEMENTS ── */}
          {type === 'signalements' && (
            <>
              <div className="mb-3 p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <AlertTriangle size={14} style={{ color: '#f87171' }} />
                <p className="text-sm font-semibold" style={{ color: '#f87171' }}>{signalements.length} signalement{signalements.length > 1 ? 's' : ''} en attente</p>
              </div>
              {signalements.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={28} className="mx-auto mb-2" style={{ color: '#34d399' }} />
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Aucun signalement 🎉</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {signalements.map((sig) => (
                    <div key={sig.id} className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}>
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>{sig.flagType}</span>
                        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{sig.user1.prenom} ↔ {sig.user2.prenom}</p>
                      </div>
                      <p className="text-[11px] mb-2 line-clamp-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{sig.flagDetails}</p>
                      <p className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        <Clock size={9} /> {new Date(sig.flaggedAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── REVENU ── */}
          {type === 'revenu' && stats && (
            <>
              {/* MRR principal */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#fbbf24' }}>{stats.revenuMensuelReel?.toFixed(2) ?? '—'} €</p>
                  <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>MRR (récurrent réel)</p>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#34d399' }}>{stats.revenuMois?.toFixed(2) ?? '—'} €</p>
                  <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Nouveaux ce mois</p>
                </div>
              </div>

              {/* Abonnements actifs + répartition plans */}
              <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Abonnés actifs</span>
                  <span className="text-sm font-bold" style={{ color: '#fbbf24' }}>{stats.subscriptionsActives ?? 0}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'STANDARD', label: 'Essentiel', color: '#fbbf24', prix: '19,90€' },
                    { key: 'PREMIUM',  label: 'Premium',   color: '#c084fc', prix: '29,90€' },
                    { key: 'ULTRA',    label: 'Élite',     color: '#22d3ee', prix: '49,90€' },
                  ].map(p => (
                    <div key={p.key} className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-base font-bold" style={{ color: p.color }}>
                        {(stats.repartitionPlans?.[p.key] ?? 0) + (p.key === 'STANDARD' ? (stats.repartitionPlans?.['BASIQUE'] ?? 0) : 0)}
                      </p>
                      <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{p.label}</p>
                      <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{p.prix}/mois</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Liste nouveaux abonnés ce mois */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Nouveaux abonnés ce mois ({stats.subscriptionsMois?.length ?? 0})
                </p>
                {(!stats.subscriptionsMois || stats.subscriptionsMois.length === 0) ? (
                  <div className="text-center py-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Aucun nouvel abonné ce mois</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {stats.subscriptionsMois.map((sub) => {
                      const planColor: Record<string, string> = {
                        STANDARD: '#fbbf24', BASIQUE: '#fbbf24', PREMIUM: '#c084fc', ULTRA: '#22d3ee',
                      }
                      const statusCls = sub.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : 'bg-red-500/10 text-red-300'
                      return (
                        <div key={sub.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px] font-bold text-amber-300 shrink-0">
                            {sub.user.prenom[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{sub.user.prenom}</p>
                            <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub.user.email}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] font-bold" style={{ color: planColor[sub.plan] ?? '#fff' }}>{sub.plan}</p>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${statusCls}`}>{sub.status}</span>
                          </div>
                          <div className="text-right shrink-0 pl-1" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
                            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{new Date(sub.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                            {sub.cancelAtPeriodEnd && <p className="text-[9px] text-red-400">↩ annulation</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}

/* ── Plan badge ───────────────────────────────────────── */
function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    GRATUIT:  { label: 'Gratuit',   bg: 'bg-slate-700/60',     text: 'text-slate-300' },
    STANDARD: { label: 'Essentiel', bg: 'bg-amber-500/20',     text: 'text-amber-300' },
    BASIQUE:  { label: 'Essentiel', bg: 'bg-amber-500/20',     text: 'text-amber-300' },
    PREMIUM:  { label: 'Premium',   bg: 'bg-purple-500/20',    text: 'text-purple-300' },
    ULTRA:    { label: 'Élite',     bg: 'bg-cyan-500/20',      text: 'text-cyan-300' },
  }
  const b = map[plan] ?? map.GRATUIT
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${b.bg} ${b.text}`}>
      {b.label}
    </span>
  )
}

// ─── Types profil détaillé ────────────────────────────────────────
interface UserDetail extends UserRecent {
  email:          string
  age:            number | null
  dateNaissance:  string | null
  pays:           string
  origine:        string | null
  phone:          string | null
  photos:         string[]
  photoUrl:       string | null
  photoApproved:  boolean
  role:           string
  isBanned:       boolean
  isSuspended:    boolean
  banReason:      string | null
  profileCompleted: boolean
  lastActiveAt:   string
  waliEnabled:    boolean
  waliEmail:      string | null
  waliNom:        string | null
  stats: {
    matchCount:        number
    convCount:         number
    sessionCount:      number
    signalementCount:  number
  }
  subscriptions: Array<{
    id: string; plan: string; status: string; profilesParSemaine: number
    stripeSubscriptionId: string; stripePriceId: string
    currentPeriodStart: string; currentPeriodEnd: string
    cancelAtPeriodEnd: boolean; cancelledAt: string | null; createdAt: string
  }>
  matchs: Array<{
    id: string; scoreGlobal: number; status: string
    user1Reponse: string; user2Reponse: string; createdAt: string
    user1: { id: string; prenom: string; genre: string }
    user2: { id: string; prenom: string; genre: string }
  }>
  conversations: Array<{
    id: string; etape: string; messageCount: number
    isFlagged: boolean; isBlocked: boolean
    createdAt: string; updatedAt: string
    user1: { id: string; prenom: string }
    user2: { id: string; prenom: string }
  }>
  sessions: Array<{
    id: string; scheduledAt: string; dureeMinutes: number; status: string; createdAt: string
    imam: { prenom: string; nom: string }
    user1: { id: string; prenom: string }
    user2: { id: string; prenom: string }
  }>
  questionnaireReponse: {
    niveauPratique:         string | null
    ecoleJurisprudentielle: string | null
    foiCentraleDecisions:   boolean | null
    objectifMariage:        string | null
    souhaitEnfants:         boolean | null
    nombreEnfantsSouhaite:  number | null
    modeVieSouhaite:        string | null
    villeSouhaitee:         string | null
    mobilitePossible:       boolean | null
    visionPolygamie:        string | null
    visionComplementarite:  string | null
    gestionConflits:        string | null
    niveauExtraversion:     number | null
    langageAmour:           string | null
    independanceCouple:     number | null
    fumeur:                 boolean | null
    consommeAlcool:         boolean | null
    activitePhysique:       string | null
    cercleSocial:           string | null
    niveauEtudes:           string | null
    profession:             string | null
    situationFinanciere:    string | null
    ambitionsPro:           string | null
    taille:                 number | null
    portVoile:              boolean | null
    portBarbe:              boolean | null
    accepteEnfantsPrevious: boolean | null
    accepteDivorce:         boolean | null
    accepteConverti:        boolean | null
    partenaireIdeal5Mots:   string | null
    peurMariage:            string | null
    sourceBonheur:          string | null
    valeurIslamiqueVoulue:  string | null
    visionFoyer:            string | null
    messageConjoint:        string | null
    completedAt:            string | null
  } | null
}

// ─── Drawer profil complet ────────────────────────────────────────
function DrawerProfil({
  user,
  onClose,
  onAction,
}: {
  user: UserDetail
  onClose: () => void
  onAction: (id: string, action: 'verify' | 'suspend' | 'ban' | 'unban') => void
}) {
  const [photo, setPhoto] = useState(user.photoUrl || '')
  const q = user.questionnaireReponse

  const row = (label: string, value: string | number | null | boolean | undefined) => {
    if (value === null || value === undefined || value === '') return null
    const txt = typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : String(value)
    return (
      <div className="flex gap-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="text-xs w-44 shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
        <span className="text-xs text-white font-medium">{txt}</span>
      </div>
    )
  }

  const section = (title: string, icon: React.ElementType, children: React.ReactNode) => {
    const Icon = icon
    return (
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon size={13} style={{ color: '#a78bfa' }} />
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{title}</p>
        </div>
        {children}
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
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 overflow-y-auto"
        style={{
          width: 'min(680px, 100vw)',
          background: '#0a0817',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          animation: 'slideInRight 0.25s ease',
        }}
      >
        <style>{`@keyframes slideInRight { from { transform: translateX(60px); opacity:0 } to { transform: translateX(0); opacity:1 } }`}</style>

        {/* ── En-tête drawer ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: '#0a0817', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-white font-semibold text-sm">Profil de {user.prenom}</p>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-all">
            <X size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        <div className="p-6 space-y-1">

          {/* ── Hero ── */}
          <div className="flex items-start gap-4 mb-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Avatar / photos */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden"
                style={{ border: '2px solid rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.1)' }}>
                {photo ? (
                  <img src={photo} alt={user.prenom} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold"
                    style={{ color: '#a78bfa' }}>
                    {user.prenom[0]}
                  </div>
                )}
              </div>
              {/* Miniatures photos supplémentaires */}
              {user.photos.length > 1 && (
                <div className="flex gap-1 mt-2">
                  {user.photos.slice(0, 3).map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setPhoto(p)}
                      className="w-6 h-6 rounded overflow-hidden"
                      style={{ border: photo === p ? '1.5px solid #a78bfa' : '1.5px solid rgba(255,255,255,0.1)' }}
                    >
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {!user.photoApproved && user.photoUrl && (
                <span className="mt-1 block text-[10px] text-amber-400 text-center">Photo non approuvée</span>
              )}
            </div>

            {/* Identité rapide */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-white font-bold text-lg">{user.prenom}</p>
                {user.age && <span className="text-white/50 text-sm">{user.age} ans</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  user.genre === 'HOMME'
                    ? 'bg-blue-500/15 text-blue-300'
                    : 'bg-fuchsia-500/15 text-fuchsia-300'
                }`}>{user.genre === 'HOMME' ? '♂ Homme' : '♀ Femme'}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {user.ville && <span className="flex items-center gap-1"><MapPin size={10} />{user.ville}{user.pays !== 'France' ? `, ${user.pays}` : ''}</span>}
                {user.email && <span className="flex items-center gap-1"><Mail size={10} />{user.email}</span>}
                {user.phone && <span className="flex items-center gap-1"><Phone size={10} />{user.phone}</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <PlanBadge plan={user.plan} />
                {user.isVerified
                  ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-semibold">✓ Vérifié</span>
                  : <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20 font-semibold">⏳ Non vérifié</span>
                }
                {user.isBanned && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/20 font-semibold">🚫 Banni</span>}
                {user.isSuspended && !user.isBanned && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/20 font-semibold">⚠ Suspendu</span>}
                {user.questionnaireCompleted && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20 font-semibold">✓ Questionnaire</span>}
              </div>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[
              { label: 'Matchs',         val: user.stats.matchCount,       color: '#f472b6' },
              { label: 'Conversations',  val: user.stats.convCount,        color: '#34d399' },
              { label: 'Sessions',       val: user.stats.sessionCount,     color: '#60a5fa' },
              { label: 'Signalements',   val: user.stats.signalementCount, color: '#f87171' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-lg font-bold" style={{ color: s.color }}>{s.val}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-wrap gap-2 mb-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {!user.isVerified && (
              <button onClick={() => { onAction(user.id, 'verify'); onClose() }}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-semibold transition-all"
                style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                <UserCheck size={12} /> Vérifier le compte
              </button>
            )}
            {user.isBanned ? (
              <button onClick={() => { onAction(user.id, 'unban'); onClose() }}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-semibold transition-all"
                style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
                <CheckCircle2 size={12} /> Débannir
              </button>
            ) : (
              <>
                <button onClick={() => { onAction(user.id, 'suspend'); onClose() }}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-semibold transition-all"
                  style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <Eye size={12} /> Suspendre
                </button>
                <button onClick={() => { onAction(user.id, 'ban'); onClose() }}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-semibold transition-all"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Ban size={12} /> Bannir
                </button>
              </>
            )}
            {user.banReason && (
              <p className="text-xs w-full mt-1" style={{ color: 'rgba(239,68,68,0.7)' }}>
                Raison du bannissement : {user.banReason}
              </p>
            )}
          </div>

          {/* ── Identité ── */}
          {section('Identité & compte', Users, (
            <div>
              {row('Email',             user.email)}
              {row('Téléphone',         user.phone)}
              {row('Âge',               user.age ? `${user.age} ans` : null)}
              {row('Date de naissance', user.dateNaissance ? new Date(user.dateNaissance as unknown as string).toLocaleDateString('fr-FR') : null)}
              {row('Ville',             user.ville)}
              {row('Pays',              user.pays)}
              {row('Origine',           user.origine)}
              {row('Rôle',              user.role)}
              {row('Inscrit le',        new Date(user.createdAt).toLocaleString('fr-FR'))}
              {row('Dernière activité', user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString('fr-FR') : null)}
              {row('Profil complété',   user.profileCompleted)}
              {user.waliEnabled && row('Wali',  `${user.waliNom || ''} (${user.waliEmail || ''})`)}
            </div>
          ))}

          {/* ── Abonnements & Paiements ── */}
          {section('Abonnements & Paiements', CreditCard, (
            <div>
              {(!user.subscriptions || user.subscriptions.length === 0) ? (
                <div className="flex items-center gap-2 py-3 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <CreditCard size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucun abonnement payant</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {user.subscriptions.map((sub) => {
                    const statusMap: Record<string, { label: string; color: string; bg: string }> = {
                      ACTIVE:    { label: 'Actif',     color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
                      CANCELLED: { label: 'Annulé',    color: '#f87171', bg: 'rgba(239,68,68,0.1)'   },
                      PAST_DUE:  { label: 'En retard', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
                      TRIALING:  { label: 'Essai',     color: '#60a5fa', bg: 'rgba(96,165,250,0.1)'  },
                    }
                    const st = statusMap[sub.status] ?? { label: sub.status, color: '#94a3b8', bg: 'rgba(255,255,255,0.05)' }
                    const planColor: Record<string, string> = {
                      STANDARD: '#fbbf24', BASIQUE: '#fbbf24', PREMIUM: '#c084fc', ULTRA: '#22d3ee', GRATUIT: '#94a3b8',
                    }
                    const planPrix: Record<string, string> = {
                      STANDARD: '19,90€', BASIQUE: '19,90€', PREMIUM: '29,90€', ULTRA: '49,90€',
                    }
                    return (
                      <div key={sub.id} className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold" style={{ color: planColor[sub.plan] ?? '#fff' }}>{sub.plan}</span>
                            <span className="text-xs font-semibold" style={{ color: planPrix[sub.plan] ? planColor[sub.plan] : '#fff' }}>{planPrix[sub.plan] ?? ''}/mois</span>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <div>
                            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Souscrit le</p>
                            <p className="text-[11px] text-white font-medium">{new Date(sub.createdAt).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div>
                            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Renouvellement</p>
                            <p className="text-[11px] font-medium" style={{ color: sub.cancelAtPeriodEnd ? '#f87171' : '#34d399' }}>
                              {new Date(sub.currentPeriodEnd).toLocaleDateString('fr-FR')}
                              {sub.cancelAtPeriodEnd && ' (annulé)'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Profils/semaine</p>
                            <p className="text-[11px] text-white font-medium">{sub.profilesParSemaine}</p>
                          </div>
                          {sub.cancelledAt && (
                            <div>
                              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Annulé le</p>
                              <p className="text-[11px] text-red-300 font-medium">{new Date(sub.cancelledAt).toLocaleDateString('fr-FR')}</p>
                            </div>
                          )}
                        </div>
                        <div className="pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.2)' }}>
                            Stripe: {sub.stripeSubscriptionId}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          {/* ── Matchs ── */}
          {section('Matchs IA', Heart, (
            <div>
              {(!user.matchs || user.matchs.length === 0) ? (
                <div className="flex items-center gap-2 py-3 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Heart size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucun match</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {user.matchs.map((m) => {
                    const partenaire = m.user1.id === user.id ? m.user2 : m.user1
                    const maReponse  = m.user1.id === user.id ? m.user1Reponse : m.user2Reponse
                    const statusMatchColor: Record<string, string> = {
                      PROPOSE:      '#60a5fa', ACCEPTE_USER1: '#a78bfa', ACCEPTE_USER2: '#a78bfa',
                      CHAT_OUVERT:  '#34d399', REFUSE:        '#f87171', EXPIRE:        '#94a3b8',
                    }
                    const reponseCls: Record<string, string> = {
                      EN_ATTENTE: 'text-yellow-400', ACCEPTE: 'text-emerald-400', REFUSE: 'text-red-400',
                    }
                    return (
                      <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                          style={{ background: partenaire.genre === 'HOMME' ? 'rgba(59,130,246,0.2)' : 'rgba(217,70,239,0.2)', color: partenaire.genre === 'HOMME' ? '#93c5fd' : '#e879f9' }}>
                          {partenaire.prenom[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white">{partenaire.prenom}</p>
                          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Score: <span style={{ color: '#f472b6' }}>{Math.round(m.scoreGlobal)}%</span>
                            {' · '}Réponse: <span className={reponseCls[maReponse] ?? 'text-white/50'}>{maReponse === 'EN_ATTENTE' ? '⏳' : maReponse === 'ACCEPTE' ? '✓' : '✗'}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: statusMatchColor[m.status] ?? '#fff' }}>
                            {m.status.replace(/_/g, ' ')}
                          </span>
                          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{new Date(m.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          {/* ── Conversations ── */}
          {section('Conversations', MessageSquare, (
            <div>
              {(!user.conversations || user.conversations.length === 0) ? (
                <div className="flex items-center gap-2 py-3 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <MessageSquare size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucune conversation</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {user.conversations.map((c) => {
                    const partenaire = c.user1.id === user.id ? c.user2 : c.user1
                    return (
                      <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: c.isFlagged ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${c.isFlagged ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] font-bold text-emerald-300 shrink-0">
                          {partenaire.prenom[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-white">{partenaire.prenom}</p>
                            {c.isFlagged && <span className="text-[10px] text-red-400">⚑ Signalé</span>}
                            {c.isBlocked && <span className="text-[10px] text-red-400">🚫 Bloqué</span>}
                          </div>
                          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {c.messageCount} messages · Étape: {c.etape.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <p className="text-[10px] shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>{new Date(c.updatedAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          {/* ── Sessions mouqabala ── */}
          {section('Sessions Mouqabala', Video, (
            <div>
              {(!user.sessions || user.sessions.length === 0) ? (
                <div className="flex items-center gap-2 py-3 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Video size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucune session</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {user.sessions.map((s) => {
                    const partenaire = s.user1.id === user.id ? s.user2 : s.user1
                    const sessionStatusMap: Record<string, { label: string; color: string }> = {
                      PLANIFIE: { label: 'Planifiée',  color: '#60a5fa' },
                      EN_COURS: { label: 'En cours',   color: '#34d399' },
                      TERMINE:  { label: 'Terminée',   color: '#94a3b8' },
                      ANNULE:   { label: 'Annulée',    color: '#f87171' },
                    }
                    const ss = sessionStatusMap[s.status] ?? { label: s.status, color: '#94a3b8' }
                    return (
                      <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="text-center w-14 shrink-0">
                          <p className="text-[11px] font-semibold text-white">{new Date(s.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{new Date(s.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-white truncate">avec {partenaire.prenom}</p>
                          </div>
                          <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Imam: {s.imam.prenom} {s.imam.nom} · {s.dureeMinutes} min
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.06)', color: ss.color }}>{ss.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          {/* ── Questionnaire ── */}
          {q && section('Questionnaire', BookOpen, (
            <div>
              <p className="text-[10px] mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Complété le {q.completedAt ? new Date(q.completedAt).toLocaleDateString('fr-FR') : '—'}
              </p>

              <p className="text-[10px] font-bold uppercase tracking-wider mb-2 mt-1" style={{ color: 'rgba(167,139,250,0.6)' }}>Foi & Pratique</p>
              {row('Niveau de pratique',     q.niveauPratique ? (pratiqueLabel[q.niveauPratique] ?? q.niveauPratique) : null)}
              {row('École juridique',        q.ecoleJurisprudentielle)}
              {row('Foi centrale décisions', q.foiCentraleDecisions)}

              <p className="text-[10px] font-bold uppercase tracking-wider mb-2 mt-4" style={{ color: 'rgba(167,139,250,0.6)' }}>Projet Conjugal</p>
              {row('Objectif mariage',       q.objectifMariage ? (objectifLabel[q.objectifMariage] ?? q.objectifMariage) : null)}
              {row('Souhaite des enfants',   q.souhaitEnfants)}
              {row('Nombre enfants',         q.nombreEnfantsSouhaite)}
              {row('Mode de vie souhaité',   q.modeVieSouhaite)}
              {row('Ville souhaitée',        q.villeSouhaitee)}
              {row('Mobilité possible',      q.mobilitePossible)}
              {row('Vision polygamie',       q.visionPolygamie)}
              {row('Vision complémentarité', q.visionComplementarite)}

              <p className="text-[10px] font-bold uppercase tracking-wider mb-2 mt-4" style={{ color: 'rgba(167,139,250,0.6)' }}>Personnalité & Communication</p>
              {row('Gestion des conflits',   q.gestionConflits)}
              {row("Extraversion (1–10)",    q.niveauExtraversion)}
              {row("Langage de l'amour",     q.langageAmour)}
              {row("Indépendance (1–5)",     q.independanceCouple)}

              <p className="text-[10px] font-bold uppercase tracking-wider mb-2 mt-4" style={{ color: 'rgba(167,139,250,0.6)' }}>Style de Vie</p>
              {row('Fumeur',                 q.fumeur)}
              {row('Consomme alcool',        q.consommeAlcool)}
              {row('Activité physique',      q.activitePhysique)}
              {row('Cercle social',          q.cercleSocial)}

              <p className="text-[10px] font-bold uppercase tracking-wider mb-2 mt-4" style={{ color: 'rgba(167,139,250,0.6)' }}>Formation & Carrière</p>
              {row("Niveau d'études",        q.niveauEtudes)}
              {row('Profession',             q.profession)}
              {row('Situation financière',   q.situationFinanciere)}
              {row('Ambitions pro',          q.ambitionsPro)}

              <p className="text-[10px] font-bold uppercase tracking-wider mb-2 mt-4" style={{ color: 'rgba(167,139,250,0.6)' }}>Apparence</p>
              {row('Taille',                 q.taille ? `${q.taille} cm` : null)}
              {row('Port du voile',          q.portVoile)}
              {row('Port de la barbe',       q.portBarbe)}
              {row('Accepte enfants ex',     q.accepteEnfantsPrevious)}
              {row('Accepte divorcé(e)',     q.accepteDivorce)}
              {row('Accepte converti(e)',    q.accepteConverti)}

              <p className="text-[10px] font-bold uppercase tracking-wider mb-2 mt-4" style={{ color: 'rgba(167,139,250,0.6)' }}>Questions Profondes</p>
              {row('Partenaire idéal',       q.partenaireIdeal5Mots)}
              {row('Peur du mariage',        q.peurMariage)}
              {row('Source de bonheur',      q.sourceBonheur)}
              {row('Valeur islamique',       q.valeurIslamiqueVoulue)}
              {row('Vision du foyer',        q.visionFoyer)}
              {row('Message au conjoint',    q.messageConjoint)}
            </div>
          ))}

          {!q && (
            <div className="text-center py-6 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <BookOpen size={20} className="mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.2)' }} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Questionnaire non complété</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function AdminPage() {
  const [stats,          setStats]          = useState<Stats | null>(null)
  const [signalements,   setSignalements]   = useState<Signalement[]>([])
  const [usersRecents,   setUsersRecents]   = useState<UserRecent[]>([])
  const [sessions,       setSessions]       = useState<SessionAdmin[]>([])
  const [sessionStats,   setSessionStats]   = useState<SessionStats | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [onglet,         setOnglet]         = useState<'overview' | 'signalements' | 'users' | 'sessions'>('overview')
  const [kpiPanel,       setKpiPanel]       = useState<KPIPanelType | null>(null)
  // Users tab state
  const [userSearch,     setUserSearch]     = useState('')
  const [userFilter,     setUserFilter]     = useState('all')
  const [userOffset,     setUserOffset]     = useState(0)
  const [userTotal,      setUserTotal]      = useState(0)
  const [usersLoading,   setUsersLoading]   = useState(false)
  const USER_PAGE = 20
  // Drawer profil
  const [drawerUser,     setDrawerUser]     = useState<UserDetail | null>(null)
  const [drawerLoading,  setDrawerLoading]  = useState(false)

  useEffect(() => { chargerDonnees() }, [])
  useEffect(() => { if (onglet === 'users') chargerUsers() }, [onglet]) // eslint-disable-line react-hooks/exhaustive-deps

  const chargerDonnees = async () => {
    try {
      const [statsRes, sigRes, usersRes, sessionsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/signalements'),
        fetch('/api/admin/users?limite=20'),
        fetch('/api/admin/sessions?limite=50'),
      ])
      if (statsRes.ok)    setStats(await statsRes.json())
      if (sigRes.ok)      setSignalements((await sigRes.json()).signalements || [])
      if (usersRes.ok)    setUsersRecents((await usersRes.json()).users || [])
      if (sessionsRes.ok) {
        const data = await sessionsRes.json()
        setSessions(data.sessions || [])
        setSessionStats(data.stats || null)
      }
    } catch {
      toast.error('Erreur chargement des données admin')
    } finally {
      setLoading(false)
    }
  }

  const chargerUsers = async (search = userSearch, filter = userFilter, offset = userOffset) => {
    setUsersLoading(true)
    try {
      const params = new URLSearchParams({ limite: String(USER_PAGE), offset: String(offset), filter })
      if (search) params.set('q', search)
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsersRecents(data.users || [])
        setUserTotal(data.total || 0)
      }
    } catch { toast.error('Erreur chargement utilisateurs') }
    finally { setUsersLoading(false) }
  }

  const ouvrirProfil = async (userId: string) => {
    setDrawerLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setDrawerUser(data.user)
      } else {
        toast.error('Impossible de charger le profil')
      }
    } catch { toast.error('Erreur réseau') }
    finally { setDrawerLoading(false) }
  }

  const actionUser = async (userId: string, action: 'verify' | 'suspend' | 'ban' | 'unban') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) { toast.success(`Action "${action}" effectuée`); chargerDonnees(); chargerUsers() }
    } catch { toast.error('Erreur') }
  }

  const traiterSignalement = async (convId: string, action: 'dismiss' | 'warn' | 'block') => {
    try {
      const res = await fetch(`/api/admin/signalements/${convId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) { toast.success('Signalement traité'); chargerDonnees() }
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="min-h-screen bg-[#060412] p-5 md:p-8">

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
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
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
              <Shield size={20} className="text-white" />
            </div>
            Dashboard Admin
          </h1>
          <p className="text-white/40 text-sm mt-1 ml-1">Mariés au Second Regard — Supervision</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Switch vers le dashboard Superviseur */}
          <Link
            href="/admin/codes-promo"
            className="flex items-center gap-2 text-sm font-semibold text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 px-4 py-2 rounded-xl transition-all"
          >
            <Tag size={14} />
            Codes Promo
          </Link>
          <Link
            href="/admin/superviseur"
            className="flex items-center gap-2 text-sm font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-xl transition-all"
          >
            <Video size={14} />
            Vue Superviseur
          </Link>
          <button
            onClick={chargerDonnees}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-white/8 hover:bg-white/12 border border-white/10 px-4 py-2 rounded-xl transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── KPIs ────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <KPICard
            titre="Membres total"
            valeur={stats.totalUsers}
            icon={Users}
            gradient="from-violet-500 to-purple-600"
            sousTitre={`+${stats.nouveauxAujourdhui} aujourd'hui`}
            glow="shadow-violet-500/10"
            onClick={() => setKpiPanel('membres')}
          />
          <KPICard
            titre="Matchs actifs"
            valeur={stats.chatsouverts}
            icon={Heart}
            gradient="from-pink-500 to-rose-500"
            sousTitre={`/ ${stats.totalMatchs} total`}
            glow="shadow-pink-500/10"
            onClick={() => setKpiPanel('matchs')}
          />
          <KPICard
            titre="Mouqabalas"
            valeur={sessionStats?.total ?? 0}
            icon={Video}
            gradient="from-emerald-500 to-teal-500"
            sousTitre={`${sessionStats?.aujourdhui ?? 0} aujourd'hui`}
            glow="shadow-emerald-500/10"
            onClick={() => setKpiPanel('mouqabalas')}
          />
          <KPICard
            titre="Signalements"
            valeur={stats.signalementsEnCours}
            icon={AlertTriangle}
            gradient="from-red-500 to-orange-500"
            sousTitre="À traiter"
            glow="shadow-red-500/10"
            onClick={() => setKpiPanel('signalements')}
          />
          <KPICard
            titre="Revenu ce mois"
            valeur={`${stats.revenuMois} €`}
            icon={DollarSign}
            gradient="from-amber-400 to-yellow-500"
            sousTitre={`${stats.usersBannis} bannis`}
            glow="shadow-amber-500/10"
            onClick={() => setKpiPanel('revenu')}
          />
        </div>
      )}

      {/* ── KPI Panel drill-down ─────────────────────────────── */}
      {kpiPanel && (
        <KPIPanel
          type={kpiPanel}
          onClose={() => setKpiPanel(null)}
          stats={stats}
          users={usersRecents}
          sessions={sessions}
          signalements={signalements}
          sessionStats={sessionStats}
          onOpenProfil={(id) => {
            setKpiPanel(null)
            setOnglet('users')
            ouvrirProfil(id)
          }}
        />
      )}

      {/* ── Onglets ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1 mb-6 bg-white/5 border border-white/8 p-1.5 rounded-2xl w-fit">
        {([
          { id: 'overview',     label: "Vue d'ensemble",                          icon: BarChart3,    color: 'text-violet-400' },
          { id: 'sessions',     label: `Mouqabalas (${sessionStats?.total ?? 0})`, icon: Video,        color: 'text-emerald-400' },
          { id: 'signalements', label: `Signalements (${signalements.length})`,    icon: Flag,         color: 'text-red-400' },
          { id: 'users',        label: 'Utilisateurs',                             icon: Users,        color: 'text-blue-400' },
        ] as const).map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setOnglet(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                onglet === tab.id
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/20'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} className={onglet === tab.id ? 'text-white' : tab.color} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Sessions / Mouqabalas ───────────────────────────── */}
      {onglet === 'sessions' && (
        <div>
          {/* Stats row */}
          {sessionStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {[
                { label: 'Total',       val: sessionStats.total,      gradient: 'from-slate-500 to-slate-600',    text: 'text-slate-300' },
                { label: "Aujourd'hui", val: sessionStats.aujourdhui, gradient: 'from-violet-500 to-purple-600',  text: 'text-violet-300' },
                { label: 'Planifiées',  val: sessionStats.planifiees, gradient: 'from-blue-500 to-indigo-500',    text: 'text-blue-300' },
                { label: 'En cours',    val: sessionStats.enCours,    gradient: 'from-emerald-500 to-teal-500',   text: 'text-emerald-300' },
                { label: 'Terminées',   val: sessionStats.terminees,  gradient: 'from-amber-400 to-yellow-500',   text: 'text-amber-300' },
              ].map((s) => (
                <div key={s.label} className="bg-[#0d0a1f] border border-white/8 rounded-xl p-4 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${s.gradient}`} />
                  <div>
                    <p className={`text-2xl font-bold ${s.text}`}>{s.val}</p>
                    <p className="text-white/40 text-xs">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Live alert */}
          {sessions.some(s => s.peutRejoindre) && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-300 font-semibold text-sm">
                  {sessions.filter(s => s.peutRejoindre).length} mouqabala(s) en cours ou rejoignable maintenant
                </span>
              </div>
              <Link href="/admin/mouqabalas" className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 flex items-center gap-1.5 border border-emerald-500/40 px-3 py-1.5 rounded-lg transition-colors">
                Ouvrir le calendrier <ExternalLink size={11} />
              </Link>
            </div>
          )}

          {/* Sessions list */}
          <div className="bg-[#0d0a1f] border border-white/8 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/8 flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Video size={15} className="text-emerald-400" />
                Prochaines mouqabalas
              </h3>
              <Link href="/admin/mouqabalas" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-0.5 transition-colors">
                Calendrier complet <ChevronRight size={11} />
              </Link>
            </div>
            {sessions.filter(s => s.status !== 'ANNULE').length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CalendarDays size={22} className="text-emerald-400" />
                </div>
                <p className="text-white/50 text-sm">Aucune mouqabala planifiée</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {sessions.filter(s => s.status !== 'ANNULE').slice(0, 15).map((s, i) => {
                  const debut   = new Date(s.scheduledAt)
                  const fin     = new Date(debut.getTime() + s.dureeMinutes * 60_000)
                  const heureD  = debut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  const heureF  = fin.toLocaleTimeString('fr-FR',   { hour: '2-digit', minute: '2-digit' })
                  const dateStr = debut.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
                  const imamNom = `${s.imam.type === 'IMAM' ? 'Imam' : 'Dr.'} ${s.imam.prenom} ${s.imam.nom}`

                  const statusBadge = {
                    PLANIFIE: { label: 'Planifiée', cls: 'bg-blue-500/15 text-blue-300 border border-blue-500/20' },
                    EN_COURS: { label: 'En cours',  cls: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' },
                    TERMINE:  { label: 'Terminée',  cls: 'bg-white/8 text-white/40 border border-white/10' },
                    ANNULE:   { label: 'Annulée',   cls: 'bg-red-500/15 text-red-300 border border-red-500/20' },
                  }[s.status] ?? { label: s.status, cls: 'bg-white/8 text-white/40' }

                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors"
                      style={{ animation: `fadeInLeft 0.25s ease ${i * 0.04}s both` }}
                    >
                      {/* Date/heure */}
                      <div className="w-28 shrink-0">
                        <p className="text-white/70 text-xs font-semibold capitalize">{dateStr}</p>
                        <p className="text-white/40 text-[11px]">{heureD} – {heureF}</p>
                      </div>

                      {/* Participants */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-[11px] font-bold text-violet-300">
                            {s.user1.prenom[0]}
                          </div>
                          <span className="text-white/70 text-xs font-medium">{s.user1.prenom}</span>
                        </div>
                        <span className="text-white/20 text-xs">×</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-[11px] font-bold text-fuchsia-300">
                            {s.user2.prenom[0]}
                          </div>
                          <span className="text-white/70 text-xs font-medium">{s.user2.prenom}</span>
                        </div>
                      </div>

                      {/* Superviseur */}
                      <p className="text-white/30 text-xs hidden md:block w-40 truncate shrink-0">{imamNom}</p>

                      {/* Badge statut */}
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusBadge.cls}`}>
                        {statusBadge.label}
                      </span>

                      {/* Rejoindre */}
                      {s.peutRejoindre && s.dailyRoomUrl ? (
                        <a
                          href={s.dailyRoomUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 shrink-0"
                        >
                          <Video size={11} />
                          Rejoindre
                        </a>
                      ) : (
                        <div className="w-24 shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* CTA calendrier complet */}
          <div className="mt-4 text-center">
            <Link
              href="/admin/mouqabalas"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 px-6 py-3 rounded-xl transition-all"
            >
              <CalendarDays size={16} />
              Voir le calendrier complet des mouqabalas
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Signalements ────────────────────────────────────── */}
      {onglet === 'signalements' && (
        <div className="space-y-3">
          {signalements.length === 0 ? (
            <div className="bg-[#0d0a1f] border border-emerald-500/20 rounded-2xl text-center py-12">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} className="text-emerald-400" />
              </div>
              <p className="text-white font-semibold">Aucun signalement en attente</p>
              <p className="text-white/40 text-sm mt-1">Tout est sous contrôle 🎉</p>
            </div>
          ) : signalements.map((sig, i) => (
            <div
              key={sig.id}
              className="bg-[#0d0a1f] border border-red-500/20 rounded-2xl p-5"
              style={{ animation: `fadeInLeft 0.3s ease ${i * 0.05}s both` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg shadow-red-500/20 flex-shrink-0">
                    <Flag size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {sig.user1.prenom} ↔ {sig.user2.prenom}
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">
                      Type : <span className="text-red-400 font-medium">{sig.flagType}</span>
                      {' · '}{sig.flagDetails}
                    </p>
                    <p className="text-white/30 text-xs mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(sig.flaggedAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => traiterSignalement(sig.conversationId, 'dismiss')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/8 text-white/60 hover:text-white border border-white/10 transition-all"
                  >
                    Ignorer
                  </button>
                  <button
                    onClick={() => traiterSignalement(sig.conversationId, 'warn')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-all"
                  >
                    Avertir
                  </button>
                  <button
                    onClick={() => traiterSignalement(sig.conversationId, 'block')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-all"
                  >
                    Bloquer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Utilisateurs ────────────────────────────────────── */}
      {onglet === 'users' && (
        <div>
          {/* Drawer profil */}
          {drawerUser && (
            <DrawerProfil
              user={drawerUser}
              onClose={() => setDrawerUser(null)}
              onAction={actionUser}
            />
          )}
          {drawerLoading && (
            <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Search + filtres */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1 min-w-[220px] relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Rechercher par prénom ou email…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (setUserOffset(0), chargerUsers(userSearch, userFilter, 0))}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { id: 'all',        label: 'Tous' },
                { id: 'unverified', label: 'Non vérifiés' },
                { id: 'banned',     label: 'Bannis' },
                { id: 'premium',    label: 'Premium' },
              ].map(f => (
                <button key={f.id}
                  onClick={() => { setUserFilter(f.id); setUserOffset(0); chargerUsers(userSearch, f.id, 0) }}
                  className="text-xs px-3 py-2 rounded-xl font-medium transition-all"
                  style={userFilter === f.id
                    ? { background: 'linear-gradient(90deg,#7c3aed,#a855f7)', color: 'white' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {f.label}
                </button>
              ))}
              <button
                onClick={() => chargerUsers(userSearch, userFilter, userOffset)}
                className="text-xs px-3 py-2 rounded-xl font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <RefreshCw size={12} className={usersLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#0d0a1f', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Users size={14} className="text-violet-400" />
                Membres
              </h3>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {userTotal > 0 ? `${userOffset + 1}–${Math.min(userOffset + USER_PAGE, userTotal)} sur ${userTotal}` : `${usersRecents.length} membres`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Membre', 'Genre', 'Plan', 'Questionnaire', 'Statut', 'Inscription', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr><td colSpan={7} className="py-12 text-center">
                      <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </td></tr>
                  ) : usersRecents.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Aucun membre trouvé
                    </td></tr>
                  ) : usersRecents.map((user) => {
                    const isHomme = user.genre === 'HOMME'
                    return (
                      <tr
                        key={user.id}
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                        onClick={() => ouvrirProfil(user.id)}
                      >
                        {/* Membre */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                              style={{ background: isHomme ? 'rgba(59,130,246,0.2)' : 'rgba(217,70,239,0.2)', color: isHomme ? '#93c5fd' : '#e879f9' }}>
                              {user.prenom[0]}
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">{user.prenom}</p>
                              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{user.ville || '—'}</p>
                            </div>
                          </div>
                        </td>
                        {/* Genre */}
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={isHomme
                              ? { background: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' }
                              : { background: 'rgba(217,70,239,0.12)', color: '#e879f9', border: '1px solid rgba(217,70,239,0.2)' }
                            }>{isHomme ? '♂ H' : '♀ F'}</span>
                        </td>
                        {/* Plan */}
                        <td className="py-3 px-4"><PlanBadge plan={user.plan} /></td>
                        {/* Questionnaire */}
                        <td className="py-3 px-4">
                          {user.questionnaireCompleted
                            ? <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>✓ Complété</span>
                            : <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>— En cours</span>
                          }
                        </td>
                        {/* Statut */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {user.isVerified
                              ? <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>✓ Vérifié</span>
                              : <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>⏳ Attente</span>
                            }
                          </div>
                        </td>
                        {/* Inscription */}
                        <td className="py-3 px-4 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        {/* Actions rapides */}
                        <td className="py-3 px-4">
                          <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                            {!user.isVerified && (
                              <button onClick={() => actionUser(user.id, 'verify')} title="Vérifier"
                                className="p-1.5 rounded-lg transition-all"
                                style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                                <UserCheck size={12} />
                              </button>
                            )}
                            <button onClick={() => actionUser(user.id, 'suspend')} title="Suspendre"
                              className="p-1.5 rounded-lg transition-all"
                              style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
                              <Eye size={12} />
                            </button>
                            <button onClick={() => actionUser(user.id, 'ban')} title="Bannir"
                              className="p-1.5 rounded-lg transition-all"
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                              <Ban size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {userTotal > USER_PAGE && (
              <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <button
                  disabled={userOffset === 0}
                  onClick={() => { const o = Math.max(0, userOffset - USER_PAGE); setUserOffset(o); chargerUsers(userSearch, userFilter, o) }}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all disabled:opacity-30"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <ChevronLeft size={13} /> Précédent
                </button>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Page {Math.floor(userOffset / USER_PAGE) + 1} / {Math.ceil(userTotal / USER_PAGE)}
                </span>
                <button
                  disabled={userOffset + USER_PAGE >= userTotal}
                  onClick={() => { const o = userOffset + USER_PAGE; setUserOffset(o); chargerUsers(userSearch, userFilter, o) }}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all disabled:opacity-30"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Suivant <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Overview ────────────────────────────────────────── */}
      {onglet === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Activité */}
          <div className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5">
            <h3 className="font-semibold text-white text-sm mb-5 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <Activity size={13} className="text-white" />
              </div>
              Activité plateforme
            </h3>
            <div className="space-y-5">
              {[
                {
                  label: 'Questionnaires complétés',
                  val: stats.questionnaireCompletes,
                  total: stats.totalUsers,
                  gradient: 'from-violet-500 to-purple-500',
                  color: 'text-violet-400',
                },
                {
                  label: 'Matchs actifs',
                  val: stats.chatsouverts,
                  total: stats.totalMatchs,
                  gradient: 'from-pink-500 to-rose-500',
                  color: 'text-pink-400',
                },
              ].map((item) => {
                const pct = item.total > 0 ? Math.round((item.val / item.total) * 100) : 0
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">{item.label}</span>
                      <span className={`font-semibold ${item.color}`}>{item.val} / {item.total}</span>
                    </div>
                    <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                        style={{ width: `${pct}%`, transition: 'width 0.8s ease' }}
                      />
                    </div>
                    <p className="text-xs text-white/30 mt-1 text-right">{pct}%</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Signalements récents */}
          <div className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
                  <AlertTriangle size={13} className="text-white" />
                </div>
                Signalements récents
              </h3>
              {signalements.length > 0 && (
                <button
                  onClick={() => setOnglet('signalements')}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-0.5 transition-colors"
                >
                  Voir tout <ChevronRight size={11} />
                </button>
              )}
            </div>
            {signalements.slice(0, 3).length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                </div>
                <p className="text-white/50 text-sm">Aucun signalement 🎉</p>
              </div>
            ) : (
              <div className="space-y-2">
                {signalements.slice(0, 3).map((sig) => (
                  <div key={sig.id} className="flex items-center gap-3 p-3 bg-white/4 border border-white/6 rounded-xl">
                    <span className="text-xs text-red-400 font-semibold shrink-0 bg-red-500/15 px-2 py-0.5 rounded-full">
                      {sig.flagType}
                    </span>
                    <span className="text-xs text-white/50 flex-1 truncate">{sig.flagDetails}</span>
                    <button
                      onClick={() => setOnglet('signalements')}
                      className="text-xs text-violet-400 hover:underline shrink-0"
                    >
                      Voir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prochaines mouqabalas — widget overview */}
          <div className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                  <Video size={13} className="text-white" />
                </div>
                Mouqabalas à venir
              </h3>
              <Link href="/admin/mouqabalas" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition-colors">
                Calendrier <ChevronRight size={11} />
              </Link>
            </div>
            {sessions.filter(s => s.status === 'PLANIFIE' || s.status === 'EN_COURS').length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CalendarDays size={18} className="text-emerald-400" />
                </div>
                <p className="text-white/50 text-sm">Aucune mouqabala planifiée</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.filter(s => s.status === 'PLANIFIE' || s.status === 'EN_COURS').slice(0, 4).map((s) => {
                  const debut  = new Date(s.scheduledAt)
                  const heureD = debut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  const dateS  = debut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-3 bg-white/4 border border-white/6 rounded-xl">
                      <div className="text-center w-14 shrink-0">
                        <p className="text-white text-sm font-bold">{heureD}</p>
                        <p className="text-white/40 text-[10px] capitalize">{dateS}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-xs font-semibold truncate">
                          {s.user1.prenom} × {s.user2.prenom}
                        </p>
                        <p className="text-white/30 text-[10px] truncate">
                          {s.imam.type === 'IMAM' ? 'Imam' : 'Dr.'} {s.imam.prenom} {s.imam.nom}
                        </p>
                      </div>
                      {s.peutRejoindre && s.dailyRoomUrl ? (
                        <a
                          href={s.dailyRoomUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors shrink-0"
                        >
                          Rejoindre
                        </a>
                      ) : (
                        <span className="text-[10px] text-white/20 shrink-0">{s.dureeMinutes} min</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Stats rapides - 2ème ligne */}
          <div className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                <Sparkles size={13} className="text-white" />
              </div>
              Répartition abonnements
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Élite',     pct: 8,  gradient: 'from-cyan-400 to-blue-500',   color: 'text-cyan-400' },
                { label: 'Premium',   pct: 22, gradient: 'from-purple-500 to-fuchsia-500', color: 'text-purple-400' },
                { label: 'Essentiel', pct: 35, gradient: 'from-amber-400 to-yellow-500', color: 'text-amber-400' },
                { label: 'Gratuit',   pct: 35, gradient: 'from-slate-500 to-slate-600',  color: 'text-slate-400' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`font-medium ${item.color}`}>{item.label}</span>
                    <span className="text-white/40">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Membres bannis / récents */}
          <div className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                <TrendingUp size={13} className="text-white" />
              </div>
              Chiffres clés
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nouveaux / jour',   val: stats.nouveauxAujourdhui, icon: Zap,     gradient: 'from-emerald-500 to-teal-500' },
                { label: 'Bannis total',       val: stats.usersBannis,        icon: Ban,     gradient: 'from-red-500 to-rose-600' },
                { label: 'Total matchs',       val: stats.totalMatchs,        icon: Heart,   gradient: 'from-pink-500 to-rose-500' },
                { label: 'Questionnaires',     val: stats.questionnaireCompletes, icon: Crown, gradient: 'from-violet-500 to-purple-600' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="bg-white/4 border border-white/6 rounded-xl p-3 flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} shadow-sm`}>
                      <Icon size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg leading-tight">{item.val}</p>
                      <p className="text-white/40 text-[10px]">{item.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
