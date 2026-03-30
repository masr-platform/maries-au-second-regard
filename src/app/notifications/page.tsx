'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Bell, Heart, MessageCircle, User, Settings, LogOut,
  TrendingUp, Sparkles, CheckCircle2, Check,
  Star, Shield, Calendar,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface Notification {
  id:        string
  type:      string
  titre:     string
  contenu:   string
  isRead:    boolean
  createdAt: string
}

const planLabel: Record<string, string> = {
  GRATUIT: '1 profil/semaine',
  STANDARD: '1 profil/semaine',
  BASIQUE: '3 profils/mois',
  PREMIUM: '10 profils/mois',
  ULTRA: 'Profils illimités',
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  NOUVEAU_MATCH:    { icon: Sparkles,     color: 'text-gold-400',   bg: 'bg-gold-500/10' },
  MATCH_ACCEPTE:    { icon: Heart,        color: 'text-green-400',  bg: 'bg-green-500/10' },
  MATCH_REJETE:     { icon: Heart,        color: 'text-dark-400',   bg: 'bg-dark-700' },
  NOUVEAU_MESSAGE:  { icon: MessageCircle,color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  SESSION_RAPPEL:   { icon: Calendar,     color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ETAPE_DEBLOQUEE:  { icon: Star,         color: 'text-gold-400',   bg: 'bg-gold-500/10' },
  WALI_INVITE:      { icon: Shield,       color: 'text-teal-400',   bg: 'bg-teal-500/10' },
  ABONNEMENT:       { icon: TrendingUp,   color: 'text-gold-400',   bg: 'bg-gold-500/10' },
  SYSTEME:          { icon: Bell,         color: 'text-dark-400',   bg: 'bg-dark-700' },
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/connexion')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') charger()
  }, [status])

  const charger = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const marquerToutesLues = async () => {
    setMarkingAll(true)
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      setNotifications(n => n.map(notif => ({ ...notif, isRead: true })))
      toast.success('Toutes les notifications marquées comme lues')
    } catch {
      toast.error('Erreur')
    } finally {
      setMarkingAll(false)
    }
  }

  const marquerLue = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    })
    setNotifications(n => n.map(notif => notif.id === id ? { ...notif, isRead: true } : notif))
  }

  const nonLues = notifications.filter(n => !n.isRead).length

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
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
            { href: '/tableau-de-bord', icon: Heart, label: 'Mes matchs' },
            { href: '/messages', icon: MessageCircle, label: 'Messages' },
            { href: '/notifications', icon: Bell, label: 'Notifications', active: true },
            { href: '/profil', icon: User, label: 'Mon profil' },
            { href: '/abonnement', icon: TrendingUp, label: 'Abonnement' },
            { href: '/parametres', icon: Settings, label: 'Paramètres' },
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
                {item.active && nonLues > 0 && (
                  <span className="ml-auto text-[10px] bg-gold-500 text-black rounded-full px-1.5 py-0.5 font-bold">
                    {nonLues}
                  </span>
                )}
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

      {/* ── Contenu ─────────────────────────────────────────────── */}
      <main className="md:ml-64 p-6 md:p-8 max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-white">Notifications</h1>
            <p className="text-dark-300 text-sm mt-1">
              {nonLues > 0 ? `${nonLues} non lue${nonLues > 1 ? 's' : ''}` : 'Tout est à jour'}
            </p>
          </div>
          {nonLues > 0 && (
            <button
              onClick={marquerToutesLues}
              disabled={markingAll}
              className="flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 border border-gold-500/30 px-3 py-2 rounded-lg hover:bg-gold-500/5 transition-all disabled:opacity-50"
            >
              <Check size={14} />
              Tout marquer lu
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
              <Bell size={28} className="text-gold-500" />
            </div>
            <h2 className="text-xl font-serif font-bold text-white mb-2">Aucune notification</h2>
            <p className="text-dark-300 text-sm max-w-sm mx-auto">
              Vous recevrez ici vos matchs, messages et mises à jour de votre compte.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {notifications.map((notif, i) => {
                const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.SYSTEME
                const Icon = cfg.icon
                const timeAgo = formatDistanceToNow(new Date(notif.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })

                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => !notif.isRead && marquerLue(notif.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                      notif.isRead
                        ? 'bg-dark-800 border-dark-700 opacity-60 hover:opacity-80'
                        : 'bg-dark-800 border-gold-500/20 hover:border-gold-500/40'
                    }`}
                  >
                    {/* Icône */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon size={18} className={cfg.color} />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium leading-tight ${notif.isRead ? 'text-dark-300' : 'text-white'}`}>
                          {notif.titre}
                        </p>
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-gold-400 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${notif.isRead ? 'text-dark-500' : 'text-dark-400'}`}>
                        {notif.contenu}
                      </p>
                      <p className="text-[10px] text-dark-600 mt-1.5">{timeAgo}</p>
                    </div>

                    {/* Check si lue */}
                    {notif.isRead && (
                      <CheckCircle2 size={14} className="text-dark-600 flex-shrink-0 mt-1" />
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* ── Mobile bottom nav ────────────────────────────────── */}
        <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 flex md:hidden z-50">
          {[
            { href: '/tableau-de-bord', icon: Heart, label: 'Matchs' },
            { href: '/messages', icon: MessageCircle, label: 'Messages' },
            { href: '/notifications', icon: Bell, label: 'Notifs', active: true },
            { href: '/profil', icon: User, label: 'Profil' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center py-3 gap-1 text-[10px] relative ${
                  item.active ? 'text-gold-400' : 'text-dark-400'
                }`}
              >
                <Icon size={20} />
                {item.label}
                {item.active && nonLues > 0 && (
                  <div className="absolute top-2 left-1/2 translate-x-2 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center">
                    <span className="text-black text-[8px] font-bold">{nonLues > 9 ? '9+' : nonLues}</span>
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
        <div className="pb-20 md:pb-0" />
      </main>
    </div>
  )
}
