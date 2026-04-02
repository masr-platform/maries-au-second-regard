'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Video, Bell, Heart, MessageCircle, User, Settings, LogOut,
  TrendingUp, Calendar, Clock, Shield, CheckCircle2, XCircle,
  PlayCircle, ChevronRight, Plus,
} from 'lucide-react'
import { format, isPast, isToday, isFuture } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface ImamSession {
  id:          string
  type:        string
  status:      string
  scheduledAt: string
  dureeMinutes: number
  montant:     number
  dailyRoomUrl: string | null
  imam: {
    nom:    string
    prenom: string
    user: { prenom: string; photoUrl: string | null }
  }
  user1: { prenom: string; photoUrl: string | null }
  user2: { prenom: string; photoUrl: string | null } | null
}

const planLabel: Record<string, string> = {
  GRATUIT:  '1 profil/semaine',
  STANDARD: '1 profil/semaine',
  BASIQUE:  '3 profils/mois',
  PREMIUM:  '10 profils/mois',
  ULTRA:    'Profils illimités',
}

const TYPE_LABEL: Record<string, string> = {
  MOUQUABALA:      'Mouqabala virtuelle',
  THERAPIE_COUPLE: 'Thérapie de couple',
  INDIVIDUEL:      'Session individuelle',
  SPIRITUEL:       'Accompagnement spirituel',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PLANIFIE: { label: 'Planifiée',  color: 'text-blue-400',  bg: 'bg-blue-500/10',  icon: Calendar },
  EN_COURS: { label: 'En cours',   color: 'text-green-400', bg: 'bg-green-500/10', icon: PlayCircle },
  TERMINE:  { label: 'Terminée',   color: 'text-dark-400',  bg: 'bg-dark-700',     icon: CheckCircle2 },
  ANNULE:   { label: 'Annulée',    color: 'text-red-400',   bg: 'bg-red-500/10',   icon: XCircle },
}

export default function SessionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions]     = useState<ImamSession[]>([])
  const [activeTab, setActiveTab]   = useState<'upcoming' | 'past'>('upcoming')
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/connexion')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') chargerSessions()
  }, [status])

  const chargerSessions = async () => {
    setLoading(true)
    try {
      const [planifie, termine, enCours] = await Promise.all([
        fetch('/api/sessions?statut=PLANIFIE').then(r => r.ok ? r.json() : { sessions: [] }),
        fetch('/api/sessions?statut=TERMINE').then(r => r.ok ? r.json() : { sessions: [] }),
        fetch('/api/sessions?statut=EN_COURS').then(r => r.ok ? r.json() : { sessions: [] }),
      ])
      const all = [
        ...(enCours.sessions  || []),
        ...(planifie.sessions || []),
        ...(termine.sessions  || []),
      ]
      setSessions(all)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const rejoindre = async (sessionId: string) => {
    router.push(`/sessions/${sessionId}`)
  }

  const upcoming = sessions.filter(s => s.status !== 'TERMINE' && s.status !== 'ANNULE')
  const past     = sessions.filter(s => s.status === 'TERMINE' || s.status === 'ANNULE')
  const displayed = activeTab === 'upcoming' ? upcoming : past

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-dark-800 border-r border-dark-700 flex-col hidden md:flex">
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-gold-500 flex items-center justify-center">
              <span className="text-gold-500 font-serif font-bold">M</span>
            </div>
            <div>
              <p className="text-white font-serif text-sm font-semibold">MASR</p>
              <p className="text-dark-400 text-xs">{planLabel[session?.user?.plan as string] || '—'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/tableau-de-bord', icon: Heart,         label: 'Mes matchs' },
            { href: '/messages',        icon: MessageCircle, label: 'Messages' },
            { href: '/sessions',        icon: Video,         label: 'Mouqabalas', active: true },
            { href: '/notifications',   icon: Bell,          label: 'Notifications' },
            { href: '/profil',          icon: User,          label: 'Mon profil' },
            { href: '/abonnement',      icon: TrendingUp,    label: 'Abonnement' },
            { href: '/parametres',      icon: Settings,      label: 'Paramètres' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                  item.active
                    ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-dark-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
              <span className="text-gold-500 text-sm font-semibold">
                {session?.user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{session?.user?.name}</p>
              <p className="text-dark-400 text-xs truncate">{session?.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 text-dark-400 hover:text-white text-sm w-full"
          >
            <LogOut size={15} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu ──────────────────────────────────────────────── */}
      <main className="md:ml-64 p-6 md:p-8 max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-white">Mouqabalas virtuelles</h1>
          <p className="text-dark-300 text-sm mt-1">
            Sessions encadrées par un imam ou un psychologue clinicien
          </p>
        </div>

        {/* Info box */}
        <div className="mb-8 p-5 rounded-2xl border border-gold-500/20 bg-gold-500/5 flex gap-4 items-start">
          <Shield size={22} className="text-gold-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-semibold mb-1">Cadre islamique garanti</p>
            <p className="text-dark-400 text-xs leading-relaxed">
              Chaque mouqabala est encadrée par un imam ou un psychologue clinicien musulman.
              Aucun échange de coordonnées personnelles. La session se ferme automatiquement à la fin du temps imparti.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-dark-800 p-1 rounded-xl w-fit">
          {([
            { key: 'upcoming', label: `À venir (${upcoming.length})` },
            { key: 'past',     label: `Passées (${past.length})` },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Session list */}
        {displayed.length === 0 ? (
          <div className="text-center py-20" style={{ animation: 'fadeInUp 0.35s ease both' }}>
            <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
              <Video size={28} className="text-gold-500" />
            </div>
            <h2 className="text-xl font-serif font-bold text-white mb-2">
              {activeTab === 'upcoming' ? 'Aucune session planifiée' : 'Aucune session passée'}
            </h2>
            <p className="text-dark-300 text-sm max-w-sm mx-auto mb-6">
              {activeTab === 'upcoming'
                ? 'Vos mouqabalas apparaîtront ici une fois planifiées avec votre match.'
                : 'Vos sessions terminées apparaîtront ici.'}
            </p>
            {activeTab === 'upcoming' && (
              <Link
                href="/tableau-de-bord"
                className="inline-flex items-center gap-2 text-gold-400 border border-gold-500/30 px-5 py-2.5 rounded-xl hover:bg-gold-500/5 transition-all text-sm font-medium"
              >
                <Heart size={15} />
                Voir mes matchs
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((s, i) => {
              const cfg      = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.PLANIFIE
              const StatusIcon = cfg.icon
              const date     = new Date(s.scheduledAt)
              const canJoin  = s.status === 'PLANIFIE' || s.status === 'EN_COURS'
              const isNow    = s.status === 'EN_COURS' || (isToday(date) && isFuture(date) && !isPast(new Date(date.getTime() + s.dureeMinutes * 60000)))

              return (
                <div
                  key={s.id}
                  style={{ animation: `fadeInUp 0.3s ease ${i * 0.05}s both` }}
                  className="bg-dark-800 border border-dark-700 hover:border-dark-600 rounded-2xl p-5 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Infos session */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">
                          {TYPE_LABEL[s.type] ?? s.type}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} font-medium`}>
                          <StatusIcon size={10} />
                          {cfg.label}
                        </span>
                        {isNow && s.status !== 'EN_COURS' && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Aujourd'hui
                          </span>
                        )}
                      </div>

                      {/* Date & durée */}
                      <div className="flex items-center gap-3 text-xs text-dark-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {format(date, "EEEE d MMMM 'à' HH'h'mm", { locale: fr })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {s.dureeMinutes} min
                        </span>
                      </div>

                      {/* Participants */}
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[s.user1, s.user2, { prenom: s.imam.user.prenom, photoUrl: s.imam.user.photoUrl }].filter(Boolean).map((p, pi) => (
                            <div
                              key={pi}
                              className="w-7 h-7 rounded-full bg-gold-500/20 border-2 border-dark-800 flex items-center justify-center"
                            >
                              {p!.photoUrl ? (
                                <img src={p!.photoUrl} alt={p!.prenom} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <span className="text-gold-500 text-[10px] font-bold">{p!.prenom[0]}</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-dark-500">
                          {[s.user1.prenom, s.user2?.prenom, `${s.imam.prenom} ${s.imam.nom} (imam)`].filter(Boolean).join(' · ')}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex-shrink-0">
                      {canJoin ? (
                        <button
                          onClick={() => rejoindre(s.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            isNow
                              ? 'bg-green-500 hover:bg-green-400 text-black'
                              : 'bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30'
                          }`}
                        >
                          <Video size={15} />
                          {isNow ? 'Rejoindre' : 'Accéder'}
                          <ChevronRight size={13} />
                        </button>
                      ) : (
                        <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon size={13} />
                          {cfg.label}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <style jsx global>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 flex md:hidden z-50">
          {[
            { href: '/tableau-de-bord', icon: Heart,         label: 'Matchs' },
            { href: '/messages',        icon: MessageCircle, label: 'Messages' },
            { href: '/sessions',        icon: Video,         label: 'Sessions', active: true },
            { href: '/profil',          icon: User,          label: 'Profil' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center py-3 gap-1 text-[10px] ${
                  item.active ? 'text-gold-400' : 'text-dark-400'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="pb-20 md:pb-0" />
      </main>
    </div>
  )
}
