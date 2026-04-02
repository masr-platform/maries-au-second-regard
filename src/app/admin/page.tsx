'use client'

import { useEffect, useState } from 'react'
import {
  Users, MessageCircle, AlertTriangle, TrendingUp,
  CheckCircle2, Ban, Eye, Flag, RefreshCw, Shield,
  Heart, DollarSign, Activity, Crown, Zap, Sparkles,
  UserCheck, Clock, ChevronRight, BarChart3,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Stats {
  totalUsers:             number
  nouveauxAujourdhui:     number
  totalMatchs:            number
  chatsouverts:           number
  signalementsEnCours:    number
  revenuMois:             number
  usersBannis:            number
  questionnaireCompletes: number
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
function KPICard({ titre, valeur, icon: Icon, gradient, sousTitre, glow }: {
  titre: string
  valeur: number | string
  icon: React.ElementType
  gradient: string
  sousTitre?: string
  glow?: string
}) {
  return (
    <div
      className={`relative overflow-hidden bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 shadow-lg ${glow ?? ''}`}
      style={{ animation: 'fadeInUp 0.35s ease both' }}
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
    </div>
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

export default function AdminPage() {
  const [stats,        setStats]        = useState<Stats | null>(null)
  const [signalements, setSignalements] = useState<Signalement[]>([])
  const [usersRecents, setUsersRecents] = useState<UserRecent[]>([])
  const [loading,      setLoading]      = useState(true)
  const [onglet,       setOnglet]       = useState<'overview' | 'signalements' | 'users'>('overview')

  useEffect(() => { chargerDonnees() }, [])

  const chargerDonnees = async () => {
    try {
      const [statsRes, sigRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/signalements'),
        fetch('/api/admin/users?limite=20'),
      ])
      if (statsRes.ok)  setStats(await statsRes.json())
      if (sigRes.ok)    setSignalements((await sigRes.json()).signalements || [])
      if (usersRes.ok)  setUsersRecents((await usersRes.json()).users || [])
    } catch {
      toast.error('Erreur chargement des données admin')
    } finally {
      setLoading(false)
    }
  }

  const actionUser = async (userId: string, action: 'verify' | 'suspend' | 'ban') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) { toast.success(`Action "${action}" effectuée`); chargerDonnees() }
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
              <Shield size={20} className="text-white" />
            </div>
            Dashboard Admin
          </h1>
          <p className="text-white/40 text-sm mt-1 ml-1">Mariés au Second Regard — Supervision</p>
        </div>
        <button
          onClick={chargerDonnees}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-white/8 hover:bg-white/12 border border-white/10 px-4 py-2 rounded-xl transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* ── KPIs ────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPICard
            titre="Membres total"
            valeur={stats.totalUsers}
            icon={Users}
            gradient="from-violet-500 to-purple-600"
            sousTitre={`+${stats.nouveauxAujourdhui} aujourd'hui`}
            glow="shadow-violet-500/10"
          />
          <KPICard
            titre="Matchs actifs"
            valeur={stats.chatsouverts}
            icon={Heart}
            gradient="from-pink-500 to-rose-500"
            sousTitre={`/ ${stats.totalMatchs} total`}
            glow="shadow-pink-500/10"
          />
          <KPICard
            titre="Signalements"
            valeur={stats.signalementsEnCours}
            icon={AlertTriangle}
            gradient="from-red-500 to-orange-500"
            sousTitre="À traiter"
            glow="shadow-red-500/10"
          />
          <KPICard
            titre="Revenu ce mois"
            valeur={`${stats.revenuMois} €`}
            icon={DollarSign}
            gradient="from-amber-400 to-yellow-500"
            sousTitre={`${stats.usersBannis} bannis`}
            glow="shadow-amber-500/10"
          />
        </div>
      )}

      {/* ── Onglets ─────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 bg-white/5 border border-white/8 p-1.5 rounded-2xl w-fit">
        {([
          { id: 'overview',      label: 'Vue d\'ensemble', icon: BarChart3,     color: 'text-violet-400' },
          { id: 'signalements',  label: `Signalements (${signalements.length})`, icon: Flag, color: 'text-red-400' },
          { id: 'users',         label: 'Utilisateurs',   icon: Users,          color: 'text-blue-400' },
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
        <div className="bg-[#0d0a1f] border border-white/8 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/8 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Users size={15} className="text-violet-400" />
              Membres récents
            </h3>
            <span className="text-xs text-white/40">{usersRecents.length} membres</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="text-left text-white/40 py-3 px-4 font-medium text-xs uppercase tracking-wide">Membre</th>
                  <th className="text-left text-white/40 py-3 px-4 font-medium text-xs uppercase tracking-wide">Genre</th>
                  <th className="text-left text-white/40 py-3 px-4 font-medium text-xs uppercase tracking-wide">Plan</th>
                  <th className="text-left text-white/40 py-3 px-4 font-medium text-xs uppercase tracking-wide">Statut</th>
                  <th className="text-left text-white/40 py-3 px-4 font-medium text-xs uppercase tracking-wide">Inscription</th>
                  <th className="text-left text-white/40 py-3 px-4 font-medium text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {usersRecents.map((user) => {
                  const isHomme = user.genre === 'HOMME'
                  return (
                    <tr key={user.id} className="hover:bg-white/3 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            isHomme
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-fuchsia-500/20 text-fuchsia-300'
                          }`}>
                            {user.prenom[0]}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{user.prenom}</p>
                            <p className="text-white/30 text-xs">{user.ville || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          isHomme
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-400/20'
                            : 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-400/20'
                        }`}>
                          {isHomme ? '♂ Homme' : '♀ Femme'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <PlanBadge plan={user.plan} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {user.isVerified ? (
                            <>
                              <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 size={11} className="text-emerald-400" />
                              </div>
                              <span className="text-xs text-emerald-400 font-medium">Vérifié</span>
                            </>
                          ) : (
                            <>
                              <div className="w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center">
                                <AlertTriangle size={11} className="text-amber-400" />
                              </div>
                              <span className="text-xs text-amber-400 font-medium">En attente</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white/40 text-xs">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1.5">
                          {!user.isVerified && (
                            <button
                              onClick={() => actionUser(user.id, 'verify')}
                              title="Vérifier"
                              className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all"
                            >
                              <UserCheck size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => actionUser(user.id, 'suspend')}
                            title="Suspendre"
                            className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/30 border border-amber-500/20 transition-all"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => actionUser(user.id, 'ban')}
                            title="Bannir"
                            className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/30 border border-red-500/20 transition-all"
                          >
                            <Ban size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
