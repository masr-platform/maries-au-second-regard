'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MessageCircle, Heart, Bell, User, Settings, LogOut,
  TrendingUp, ChevronRight, Clock, ShieldCheck, Lock,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Conversation {
  id: string
  matchId: string
  etape: string
  isFlagged: boolean
  lastMessageAt: string | null
  messageCount: number
  nonLus: number
  interlocuteur: {
    id: string
    prenom: string
    photoUrl: string | null
    lastActiveAt: string
  }
  dernierMessage: {
    content: string
    senderId: string
    createdAt: string
    isRead: boolean
    isMine: boolean
  } | null
}

const ETAPE_LABELS: Record<string, { label: string; color: string }> = {
  PRESENTATION: { label: 'Présentation', color: 'text-blue-400' },
  CONNAISSANCE:  { label: 'Connaissance',  color: 'text-purple-400' },
  FAMILLE:       { label: 'Famille',        color: 'text-gold-400' },
  VISIO:         { label: 'Visio',           color: 'text-green-400' },
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const matchId = searchParams.get('matchId')
    if (matchId) {
      fetch('/api/conversations')
        .then(r => r.json())
        .then(data => {
          const conv = (data.conversations || []).find(
            (c: Conversation) => c.matchId === matchId
          )
          if (conv) router.replace(`/messages/${conv.id}`)
          else setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      chargerConversations()
    }
  }, [searchParams])

  const chargerConversations = async () => {
    try {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      if (res.ok) setConversations(data.conversations || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const planLabel = {
    GRATUIT: '1 profil/semaine',
    STANDARD: '1 profil/semaine',
    BASIQUE: '3 profils/mois',
    PREMIUM: '10 profils/mois',
    ULTRA: 'Profils illimités',
  }

  return (
    <div className="min-h-screen bg-dark-900">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className="fixed left-0 top-0 bottom-0 w-64 flex-col hidden md:flex"
        style={{ background: 'rgba(10,10,14,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
      >
        <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-gold-500 flex items-center justify-center">
              <span className="text-gold-500 font-serif font-bold">M</span>
            </div>
            <div>
              <p className="text-white font-serif text-sm font-semibold">MASR</p>
              <p className="text-dark-400 text-xs">
                {planLabel[session?.user?.plan as keyof typeof planLabel] || '—'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/tableau-de-bord', icon: Heart, label: 'Mes matchs' },
            { href: '/messages', icon: MessageCircle, label: 'Messages', active: true },
            { href: '/notifications', icon: Bell, label: 'Notifications' },
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
                    : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)' }}>
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
            className="flex items-center gap-2 text-dark-400 hover:text-white text-sm w-full transition-colors"
          >
            <LogOut size={15} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu ─────────────────────────────────────────────── */}
      <main className="md:ml-64 p-6 md:p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-white">Messages</h1>
          <p className="text-dark-300 text-sm mt-1">
            Conversations sécurisées et supervisées
          </p>
        </div>

        {/* Bandeau sécurité */}
        <div
          className="flex items-center gap-2.5 p-3 rounded-xl mb-6 text-xs"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}
        >
          <ShieldCheck size={14} style={{ color: '#D4AF37', flexShrink: 0 }} />
          <span>
            Toutes les conversations sont supervisées par notre IA pour votre sécurité.
            Les échanges de contacts personnels sont détectés et signalés.
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="skeleton w-14 h-14 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-1/3 mb-2 rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div
            className="text-center py-20"
            style={{ animation: 'fadeInUp 0.4s ease both' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(212,175,55,0.1)' }}
            >
              <MessageCircle size={28} style={{ color: '#D4AF37' }} />
            </div>
            <h2 className="text-xl font-serif font-bold text-white mb-2">
              Aucune conversation active
            </h2>
            <p className="text-dark-300 text-sm max-w-sm mx-auto mb-6">
              Le chat s&apos;ouvre quand les deux personnes ont accepté la proposition.
              Acceptez un profil dans vos matchs pour commencer à échanger.
            </p>
            <Link
              href="/tableau-de-bord"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #D4AF37, #f0d060)', color: '#000' }}
            >
              Voir mes matchs
              <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv, i) => (
              <div
                key={conv.id}
                style={{ animation: `fadeInLeft 0.3s ease ${i * 0.05}s both` }}
              >
                <Link href={`/messages/${conv.id}`}>
                  <div
                    className="p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      background: conv.nonLus > 0
                        ? 'rgba(212,175,55,0.05)'
                        : 'rgba(255,255,255,0.03)',
                      border: conv.nonLus > 0
                        ? '1px solid rgba(212,175,55,0.25)'
                        : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          {conv.interlocuteur.photoUrl ? (
                            <Image
                              src={conv.interlocuteur.photoUrl}
                              alt={conv.interlocuteur.prenom}
                              width={56}
                              height={56}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User size={22} className="text-dark-400" />
                            </div>
                          )}
                        </div>
                        {conv.nonLus > 0 && (
                          <div
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #D4AF37, #f0d060)' }}
                          >
                            <span className="text-black text-[10px] font-bold">
                              {conv.nonLus > 9 ? '9+' : conv.nonLus}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold text-sm ${conv.nonLus > 0 ? 'text-white' : 'text-white/80'}`}>
                              {conv.interlocuteur.prenom}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full ${ETAPE_LABELS[conv.etape]?.color || 'text-dark-400'}`}
                              style={{ background: 'rgba(255,255,255,0.05)' }}
                            >
                              {ETAPE_LABELS[conv.etape]?.label || conv.etape}
                            </span>
                          </div>
                          {conv.lastMessageAt && (
                            <span className="text-[11px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                              {formatDistanceToNow(new Date(conv.lastMessageAt), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </span>
                          )}
                        </div>

                        {conv.dernierMessage ? (
                          <p className={`text-xs truncate ${
                            conv.nonLus > 0 ? 'text-white font-medium' : 'text-dark-400'
                          }`}>
                            {conv.dernierMessage.isMine ? 'Vous : ' : ''}
                            {conv.dernierMessage.content}
                          </p>
                        ) : (
                          <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            Commencez la conversation…
                          </p>
                        )}
                      </div>

                      {/* Flèche */}
                      <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Info étapes */}
        {conversations.length > 0 && (
          <div
            className="mt-8 p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Lock size={14} style={{ color: '#D4AF37' }} />
              <span className="text-sm text-white font-medium">Progression de la relation</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-[10px] text-center">
              {[
                { key: 'PRESENTATION', label: 'Présentation', desc: 'Premiers échanges' },
                { key: 'CONNAISSANCE', label: 'Connaissance', desc: 'Après 3 jours' },
                { key: 'FAMILLE', label: 'Famille', desc: 'Wali possible' },
                { key: 'VISIO', label: 'Visio', desc: 'Appel vidéo' },
              ].map((e) => {
                const active = conversations.some(c => c.etape === e.key)
                return (
                  <div key={e.key} className="flex flex-col items-center gap-1">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        background: active ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      <Clock size={10} style={{ color: active ? '#D4AF37' : 'rgba(255,255,255,0.2)' }} />
                    </div>
                    <span className="text-dark-300 font-medium">{e.label}</span>
                    <span style={{ color: 'rgba(255,255,255,0.25)' }}>{e.desc}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

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
    </div>
  )
}
