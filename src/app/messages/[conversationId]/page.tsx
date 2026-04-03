'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import {
  ArrowLeft, Send, User, ShieldCheck, AlertTriangle,
  Clock, CheckCheck, Check, Lock, Info, Video, AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format, differenceInSeconds } from 'date-fns'
import { fr } from 'date-fns/locale'
import { getSupabaseClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────
interface MessageSender {
  id: string
  prenom: string
  photoUrl: string | null
}

interface Message {
  id: string
  content: string
  type: string
  senderId: string
  sender: MessageSender
  createdAt: string
  isRead: boolean
  isFlagged: boolean
}

interface ConversationInfo {
  id: string
  matchId: string
  etape: string
  isFlagged: boolean
  user1Id: string
  user2Id: string
  messageCount: number
  // Charte 72H
  charteAccepteeUser1: boolean
  charteAccepteeUser2: boolean
  expiresAt: string | null
  isExpired: boolean
  interlocuteur: {
    id: string
    prenom: string
    photoUrl: string | null
    lastActiveAt: string
  }
}

const ETAPE_LABELS: Record<string, string> = {
  PRESENTATION: 'Présentation',
  CONNAISSANCE: 'Connaissance',
  FAMILLE: 'Famille',
  VISIO: 'Visio',
}

const ETAPE_INFO: Record<string, string> = {
  PRESENTATION: 'Prenez le temps de vous présenter. Restez respectueux et sincère.',
  CONNAISSANCE: 'Vous pouvez approfondir la discussion. 10 messages + 3 jours pour atteindre cette étape.',
  FAMILLE: 'Il est maintenant possible d\'inviter un wali à superviser la conversation.',
  VISIO: 'Un appel vidéo supervisé peut être organisé à cette étape.',
}

// ─── Modal Charte 72H ─────────────────────────────────────────────────────────
function ModalCharte({ prenom, onAccepter, loading }: {
  prenom: string
  onAccepter: () => void
  loading: boolean
}) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
        style={{ background: '#0f0f14', border: '1px solid rgba(212,175,55,0.25)' }}>

        {/* Icône */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <ShieldCheck size={26} style={{ color: '#D4AF37' }} />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">Avant d'entrer dans la conversation</h2>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Vous allez échanger avec <span className="text-white font-medium">{prenom}</span>
            </p>
          </div>
        </div>

        {/* Règles */}
        <div className="rounded-xl p-4 space-y-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#D4AF37' }}>
            Charte de conduite — à respecter obligatoirement
          </p>
          {[
            ['⏳', 'Ce chat est limité à 72 heures. Un décompte sera visible pendant toute la durée.'],
            ['📵', 'Il est strictement interdit de partager : numéro de téléphone, email, réseaux sociaux, ou tout autre moyen de contact externe.'],
            ['🚫', 'Aucune photo personnelle, profil ou lien externe ne doit être échangé dans ce chat.'],
            ['⚠️', 'Tout manquement à ces règles entraîne un bannissement immédiat et définitif de la plateforme.'],
            ['🔒', 'Tous les messages sont supervisés par notre équipe de modération.'],
          ].map(([icon, texte], i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{texte}</p>
            </div>
          ))}
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            onClick={() => setChecked(!checked)}
            className="w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-all cursor-pointer"
            style={{
              background: checked ? '#D4AF37' : 'transparent',
              border: checked ? 'none' : '1.5px solid rgba(255,255,255,0.3)',
            }}
          >
            {checked && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4L4 7.5L10 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Je comprends et j'accepte ces règles. Je m'engage à ne partager aucun moyen de contact
            personnel, sous peine d'être banni(e) définitivement de la plateforme.
          </p>
        </label>

        {/* Bouton */}
        <button
          onClick={onAccepter}
          disabled={!checked || loading}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: checked && !loading ? 'linear-gradient(135deg, #D4AF37, #f0d060)' : 'rgba(255,255,255,0.06)',
            color: checked && !loading ? '#000' : 'rgba(255,255,255,0.25)',
            cursor: !checked || loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Vérification…' : 'J\'ai lu et j\'accepte — Entrer dans le chat'}
        </button>
      </div>
    </div>
  )
}

// ─── Décompte 72H ─────────────────────────────────────────────────────────────
function Countdown({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, differenceInSeconds(new Date(expiresAt), new Date()))
  )

  useEffect(() => {
    if (secondsLeft <= 0) { onExpire(); return }
    const interval = setInterval(() => {
      const left = Math.max(0, differenceInSeconds(new Date(expiresAt), new Date()))
      setSecondsLeft(left)
      if (left === 0) { onExpire(); clearInterval(interval) }
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  const h = Math.floor(secondsLeft / 3600)
  const m = Math.floor((secondsLeft % 3600) / 60)
  const s = secondsLeft % 60

  const isUrgent = secondsLeft < 3600 // < 1h

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{
        background: isUrgent ? 'rgba(239,68,68,0.12)' : 'rgba(212,175,55,0.1)',
        border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.3)' : 'rgba(212,175,55,0.25)'}`,
      }}>
      <Clock size={11} style={{ color: isUrgent ? '#f87171' : '#D4AF37' }} />
      <span className="text-[11px] font-mono font-semibold"
        style={{ color: isUrgent ? '#f87171' : '#D4AF37' }}>
        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>
    </div>
  )
}

// ─── CTA Mouqabala post-expiration ────────────────────────────────────────────
function BandeauMouqabala({ matchId, prenom }: { matchId: string; prenom: string }) {
  return (
    <div className="flex-shrink-0 px-4 py-4 flex flex-col items-center gap-3 text-center"
      style={{ background: 'rgba(212,175,55,0.06)', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
        <Video size={18} style={{ color: '#D4AF37' }} />
      </div>
      <div>
        <p className="text-white font-semibold text-sm">La conversation de 72h est terminée</p>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Si vous souhaitez approfondir votre échange, vous pouvez demander une mouqabala supervisée.
        </p>
      </div>
      <Link
        href={`/mouqabala/reserver/${matchId}`}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{
          background: 'linear-gradient(135deg, #D4AF37, #f0d060)',
          color: '#000',
        }}
      >
        Demander une mouqabala avec {prenom}
      </Link>
    </div>
  )
}

// ─── Composant Message ────────────────────────────────────────────────────────
function BulleMessage({
  message,
  isMine,
  showAvatar,
}: {
  message: Message
  isMine: boolean
  showAvatar: boolean
}) {
  return (
    <div
      className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ animation: 'msgFadeIn 0.2s ease both' }}
    >
      {/* Avatar interlocuteur */}
      {!isMine && (
        <div
          className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 self-end"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {showAvatar ? (
            message.sender.photoUrl ? (
              <Image
                src={message.sender.photoUrl}
                alt={message.sender.prenom}
                width={28}
                height={28}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={14} className="text-dark-400" />
              </div>
            )
          ) : (
            <div className="w-full h-full" />
          )}
        </div>
      )}

      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[72%]`}>
        {/* Bulle */}
        <div
          className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={
            message.isFlagged
              ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }
              : isMine
              ? { background: 'linear-gradient(135deg, #D4AF37, #f0d060)', color: '#000', borderBottomRightRadius: 4 }
              : { background: 'rgba(255,255,255,0.07)', color: '#fff', borderBottomLeftRadius: 4 }
          }
        >
          {message.isFlagged && (
            <div className="flex items-center gap-1 mb-1 text-[10px]" style={{ color: '#f87171' }}>
              <AlertTriangle size={10} />
              Message signalé par la supervision
            </div>
          )}
          {message.content}
        </div>

        {/* Heure + statut lu */}
        <div className="flex items-center gap-1 mt-0.5 px-1">
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {isMine && (
            message.isRead
              ? <CheckCheck size={12} style={{ color: '#D4AF37' }} />
              : <Check size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { data: session } = useSession()
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [conv, setConv] = useState<ConversationInfo | null>(null)
  const [texte, setTexte] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [showEtapeInfo, setShowEtapeInfo] = useState(false)
  // Charte 72H
  const [showCharte, setShowCharte] = useState(false)
  const [charteLoading, setCharteLoading] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabaseClient>['channel']> | null>(null)

  const userId = session?.user?.id

  // ─── Charger les messages ──────────────────────────────────────────────────
  const chargerMessages = useCallback(async (cursorParam?: string) => {
    try {
      const params = new URLSearchParams({ conversationId, limite: '30' })
      if (cursorParam) params.set('cursor', cursorParam)

      const res = await fetch(`/api/messages?${params}`)
      if (!res.ok) {
        if (res.status === 404 || res.status === 403) {
          router.replace('/messages')
          return
        }
        throw new Error('Erreur réseau')
      }

      const data = await res.json()

      if (!conv) {
        const convRes = await fetch('/api/conversations')
        const convData = await convRes.json()
        const found = convData.conversations?.find((c: ConversationInfo) => c.id === conversationId)
        if (found) {
          setConv(found)
          // Vérifier si la charte a déjà été acceptée par cet utilisateur
          const isUser1 = found.user1Id === userId
          const maCharteAcceptee = isUser1 ? found.charteAccepteeUser1 : found.charteAccepteeUser2
          if (!maCharteAcceptee) setShowCharte(true)
          // Vérifier si la conversation est expirée
          if (found.isExpired || (found.expiresAt && new Date(found.expiresAt) < new Date())) {
            setIsExpired(true)
          }
        }
      }

      if (cursorParam) {
        setMessages(prev => [...(data.messages as Message[]), ...prev])
      } else {
        setMessages(data.messages as Message[])
      }

      setHasMore(data.hasMore)
      setCursor(data.nextCursor)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [conversationId, conv, router])

  // ─── Supabase Realtime ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return

    chargerMessages()

    const supabase = getSupabaseClient()

    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
        },
        async (payload) => {
          const newMsg = payload.new as {
            id: string
            content: string
            type: string
            senderId: string
            conversationId: string
            createdAt: string
            isRead: boolean
            isFlagged: boolean
          }

          if (newMsg.conversationId !== conversationId) return
          if (newMsg.senderId === userId) return

          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [
              ...prev,
              {
                ...newMsg,
                sender: {
                  id: newMsg.senderId,
                  prenom: conv?.interlocuteur.prenom || '?',
                  photoUrl: conv?.interlocuteur.photoUrl || null,
                },
              },
            ]
          })
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, userId])

  // ─── Scroll auto ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading])

  // ─── Accepter la charte ────────────────────────────────────────────────────
  const accepterCharte = async () => {
    setCharteLoading(true)
    try {
      const res = await fetch(`/api/conversations/${conversationId}/charte`, { method: 'PATCH' })
      if (res.ok) {
        const data = await res.json()
        setShowCharte(false)
        // Mettre à jour conv local avec les nouvelles infos
        setConv(prev => prev ? {
          ...prev,
          charteAccepteeUser1: prev.user1Id === userId ? true : prev.charteAccepteeUser1,
          charteAccepteeUser2: prev.user2Id === userId ? true : prev.charteAccepteeUser2,
          expiresAt: data.expiresAt ?? prev.expiresAt,
        } : prev)
      } else {
        toast.error('Erreur lors de la validation')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setCharteLoading(false)
    }
  }

  // ─── Envoyer un message ────────────────────────────────────────────────────
  const envoyer = async () => {
    const contenu = texte.trim()
    if (!contenu || envoi || !userId || isExpired) return

    setTexte('')
    setEnvoi(true)

    const msgTemp: Message = {
      id: `temp-${Date.now()}`,
      content: contenu,
      type: 'TEXTE',
      senderId: userId,
      sender: {
        id: userId,
        prenom: session?.user?.name || 'Moi',
        photoUrl: null,
      },
      createdAt: new Date().toISOString(),
      isRead: false,
      isFlagged: false,
    }
    setMessages(prev => [...prev, msgTemp])

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, contenu }),
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages(prev => prev.filter(m => m.id !== msgTemp.id))
        setTexte(contenu)
        toast.error(err.error || 'Erreur lors de l\'envoi')
        return
      }

      const { message: msgServeur } = await res.json()

      setMessages(prev =>
        prev.map(m => (m.id === msgTemp.id ? msgServeur : m))
      )
    } catch {
      setMessages(prev => prev.filter(m => m.id !== msgTemp.id))
      setTexte(contenu)
      toast.error('Erreur réseau')
    } finally {
      setEnvoi(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      envoyer()
    }
  }

  // ─── Grouper par date ──────────────────────────────────────────────────────
  const groupes = messages.reduce<{ date: string; msgs: Message[] }[]>((acc, msg) => {
    const dateStr = format(new Date(msg.createdAt), 'EEEE d MMMM', { locale: fr })
    const last = acc[acc.length - 1]
    if (!last || last.date !== dateStr) {
      acc.push({ date: dateStr, msgs: [msg] })
    } else {
      last.msgs.push(msg)
    }
    return acc
  }, [])

  if (loading) {
    return (
      <div className="h-screen bg-dark-900 flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: '2px solid rgba(212,175,55,0.2)', borderTopColor: '#D4AF37' }}
        />
      </div>
    )
  }

  const interlocuteur = conv?.interlocuteur

  return (
    <div className="h-screen bg-dark-900 flex flex-col">

      {/* ── Modal charte 72H ──────────────────────────────────────── */}
      {showCharte && conv && (
        <ModalCharte
          prenom={conv.interlocuteur.prenom}
          onAccepter={accepterCharte}
          loading={charteLoading}
        />
      )}

      {/* ── Header ────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(10,10,14,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
      >
        <Link
          href="/messages"
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <ArrowLeft size={18} />
        </Link>

        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {interlocuteur?.photoUrl ? (
            <Image
              src={interlocuteur.photoUrl}
              alt={interlocuteur.prenom || ''}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={18} className="text-dark-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-semibold text-sm truncate">
              {interlocuteur?.prenom || '…'}
            </h2>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ color: '#D4AF37', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              {ETAPE_LABELS[conv?.etape || ''] || conv?.etape}
            </span>
          </div>
          {interlocuteur?.lastActiveAt && (
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Actif {formatDistanceToNow(new Date(interlocuteur.lastActiveAt), { addSuffix: true, locale: fr })}
            </p>
          )}
        </div>

        {/* Countdown 72H ou statut expiré */}
        {isExpired ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertCircle size={11} style={{ color: '#f87171' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#f87171' }}>Expiré</span>
          </div>
        ) : conv?.expiresAt ? (
          <Countdown
            expiresAt={conv.expiresAt}
            onExpire={() => setIsExpired(true)}
          />
        ) : null}

        {/* Bouton info étape */}
        <button
          onClick={() => setShowEtapeInfo(!showEtapeInfo)}
          className="p-2 rounded-lg transition-all"
          style={{
            color: showEtapeInfo ? '#D4AF37' : 'rgba(255,255,255,0.3)',
            background: showEtapeInfo ? 'rgba(212,175,55,0.1)' : 'transparent',
          }}
        >
          <Info size={16} />
        </button>
      </div>

      {/* ── Bandeau info étape — CSS maxHeight transition ─────────── */}
      <div
        className="flex-shrink-0 overflow-hidden transition-all duration-300"
        style={{
          maxHeight: showEtapeInfo ? '120px' : '0px',
          opacity: showEtapeInfo ? 1 : 0,
        }}
      >
        <div
          className="px-4 py-3 flex items-start gap-2"
          style={{ background: 'rgba(212,175,55,0.06)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}
        >
          <Lock size={13} style={{ color: '#D4AF37', marginTop: 2, flexShrink: 0 }} />
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {ETAPE_INFO[conv?.etape || ''] || ''}
          </p>
        </div>
      </div>

      {/* ── Bandeau conversation signalée ─────────────────────────── */}
      {conv?.isFlagged && (
        <div
          className="flex-shrink-0 px-4 py-2 flex items-center gap-2"
          style={{ background: 'rgba(239,68,68,0.12)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertTriangle size={13} style={{ color: '#f87171' }} />
          <p className="text-xs" style={{ color: '#fca5a5' }}>
            Cette conversation est sous surveillance suite à un contenu signalé. Restez respectueux.
          </p>
        </div>
      )}

      {/* ── Zone messages ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">

        {/* Charger plus */}
        {hasMore && (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => chargerMessages(cursor || undefined)}
              className="text-xs border px-4 py-1.5 rounded-full transition-colors"
              style={{
                color: 'rgba(255,255,255,0.4)',
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            >
              Charger les messages précédents
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ background: 'rgba(212,175,55,0.1)' }}
            >
              <ShieldCheck size={20} style={{ color: '#D4AF37' }} />
            </div>
            <p className="text-white font-medium text-sm mb-1">Conversation ouverte</p>
            <p className="text-xs max-w-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Commencez par vous présenter. Restez sincère, respectueux et dans le cadre de votre démarche de mariage.
            </p>
          </div>
        ) : (
          groupes.map((groupe) => (
            <div key={groupe.date}>
              {/* Séparateur de date */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <span className="text-[11px] capitalize" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {groupe.date}
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              </div>

              {/* Messages */}
              <div className="space-y-1">
                {groupe.msgs.map((msg, idx) => {
                  const isMine = msg.senderId === userId
                  const nextMsg = groupe.msgs[idx + 1]
                  const showAvatar = !nextMsg || nextMsg.senderId !== msg.senderId
                  return (
                    <BulleMessage
                      key={msg.id}
                      message={msg}
                      isMine={isMine}
                      showAvatar={showAvatar}
                    />
                  )
                })}
              </div>
            </div>
          ))
        )}

        <div ref={endRef} />
      </div>

      {/* ── CTA Mouqabala si expiré ───────────────────────────────── */}
      {isExpired && conv && (
        <BandeauMouqabala matchId={conv.matchId} prenom={conv.interlocuteur.prenom} />
      )}

      {/* ── Zone saisie (bloquée si expiré) ──────────────────────── */}
      {!isExpired && (
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{ background: 'rgba(10,10,14,0.95)', borderTop: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
      >
        {/* Compteur étape PRESENTATION */}
        {conv?.etape === 'PRESENTATION' && conv.messageCount < 10 && (
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Étape présentation : {conv.messageCount}/10 messages · 3 jours min pour progresser
            </span>
          </div>
        )}

        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Votre message…"
            rows={1}
            className="flex-1 rounded-xl px-4 py-2.5 text-white text-sm resize-none outline-none transition-all max-h-32 overflow-y-auto"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              minHeight: '44px',
              color: '#fff',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
          <button
            onClick={envoyer}
            disabled={!texte.trim() || envoi}
            className="w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: texte.trim() && !envoi
                ? 'linear-gradient(135deg, #D4AF37, #f0d060)'
                : 'rgba(255,255,255,0.06)',
              cursor: !texte.trim() || envoi ? 'not-allowed' : 'pointer',
            }}
          >
            {envoi ? (
              <div
                className="w-4 h-4 rounded-full animate-spin"
                style={{ border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000' }}
              />
            ) : (
              <Send size={17} style={{ color: texte.trim() ? '#000' : 'rgba(255,255,255,0.2)' }} />
            )}
          </button>
        </div>

        {/* Rappel supervision */}
        <p className="text-[10px] mt-2 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
          🔒 Messages supervisés · Ne partagez pas vos coordonnées personnelles
        </p>
      </div>
      )}

      <style jsx global>{`
        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
