'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  ArrowLeft, Send, User, ShieldCheck, AlertTriangle,
  Clock, CheckCheck, Check, Lock, Info,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
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
  etape: string
  isFlagged: boolean
  user1Id: string
  user2Id: string
  messageCount: number
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar interlocuteur */}
      {!isMine && (
        <div className="w-7 h-7 rounded-full bg-dark-600 overflow-hidden flex-shrink-0 self-end">
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
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            message.isFlagged
              ? 'bg-red-900/30 border border-red-500/40 text-red-300'
              : isMine
              ? 'bg-gold-500 text-black rounded-br-sm'
              : 'bg-dark-700 text-white rounded-bl-sm'
          }`}
        >
          {message.isFlagged && (
            <div className="flex items-center gap-1 mb-1 text-red-400 text-[10px]">
              <AlertTriangle size={10} />
              Message signalé par la supervision
            </div>
          )}
          {message.content}
        </div>

        {/* Heure + statut lu */}
        <div className="flex items-center gap-1 mt-0.5 px-1">
          <span className="text-dark-500 text-[10px]">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {isMine && (
            message.isRead
              ? <CheckCheck size={12} className="text-gold-500" />
              : <Check size={12} className="text-dark-500" />
          )}
        </div>
      </div>
    </motion.div>
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

      // Charger les infos de la conversation en parallèle
      if (!conv) {
        const convRes = await fetch('/api/conversations')
        const convData = await convRes.json()
        const found = convData.conversations?.find((c: ConversationInfo) => c.id === conversationId)
        if (found) setConv(found)
      }

      if (cursorParam) {
        // Pagination : ajouter en tête
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

  // ─── Supabase Realtime — écoute les nouveaux messages ─────────────────────
  useEffect(() => {
    if (!userId) return

    chargerMessages()

    const supabase = getSupabaseClient()

    // Souscrire aux INSERT sur la table Message pour cette conversation
    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `conversationId=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as {
            id: string
            content: string
            type: string
            senderId: string
            createdAt: string
            isRead: boolean
            isFlagged: boolean
          }

          // Ne pas dupliquer nos propres messages (déjà ajoutés à l'envoi)
          if (newMsg.senderId === userId) return

          // Récupérer les infos du sender si nécessaire
          setMessages(prev => {
            // Éviter les doublons
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

  // ─── Scroll auto vers le bas ───────────────────────────────────────────────
  useEffect(() => {
    if (!loading) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading])

  // ─── Envoyer un message ────────────────────────────────────────────────────
  const envoyer = async () => {
    const contenu = texte.trim()
    if (!contenu || envoi || !userId) return

    setTexte('')
    setEnvoi(true)

    // Optimistic update
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
        // Supprimer le message temp
        setMessages(prev => prev.filter(m => m.id !== msgTemp.id))
        setTexte(contenu)
        toast.error(err.error || 'Erreur lors de l\'envoi')
        return
      }

      const { message: msgServeur } = await res.json()

      // Remplacer le temp par le vrai message
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

  // ─── Touche Entrée pour envoyer (Shift+Entrée = nouvelle ligne) ───────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      envoyer()
    }
  }

  // ─── Regrouper les messages par date ──────────────────────────────────────
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
        <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
      </div>
    )
  }

  const interlocuteur = conv?.interlocuteur

  return (
    <div className="h-screen bg-dark-900 flex flex-col">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-dark-800 border-b border-dark-700 px-4 py-3 flex items-center gap-3">
        <Link href="/messages" className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-dark-300 hover:text-white">
          <ArrowLeft size={18} />
        </Link>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-dark-600 overflow-hidden flex-shrink-0">
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
            <span className="text-[10px] text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20 flex-shrink-0">
              {ETAPE_LABELS[conv?.etape || ''] || conv?.etape}
            </span>
          </div>
          {interlocuteur?.lastActiveAt && (
            <p className="text-dark-400 text-[11px]">
              Actif {formatDistanceToNow(new Date(interlocuteur.lastActiveAt), { addSuffix: true, locale: fr })}
            </p>
          )}
        </div>

        {/* Info étape */}
        <button
          onClick={() => setShowEtapeInfo(!showEtapeInfo)}
          className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-dark-400 hover:text-white"
        >
          <Info size={16} />
        </button>
      </div>

      {/* ── Bandeau info étape ────────────────────────────────────── */}
      <AnimatePresence>
        {showEtapeInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex-shrink-0"
          >
            <div className="bg-dark-800 border-b border-dark-700 px-4 py-3 flex items-start gap-2">
              <Lock size={13} className="text-gold-400 mt-0.5 flex-shrink-0" />
              <p className="text-dark-300 text-xs leading-relaxed">
                {ETAPE_INFO[conv?.etape || ''] || ''}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bandeau conversation signalée ─────────────────────────── */}
      {conv?.isFlagged && (
        <div className="flex-shrink-0 bg-red-900/30 border-b border-red-500/30 px-4 py-2 flex items-center gap-2">
          <AlertTriangle size={13} className="text-red-400" />
          <p className="text-red-300 text-xs">
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
              className="text-xs text-dark-400 hover:text-white border border-dark-600 hover:border-dark-500 px-4 py-1.5 rounded-full transition-colors"
            >
              Charger les messages précédents
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center mb-3">
              <ShieldCheck size={20} className="text-gold-500" />
            </div>
            <p className="text-white font-medium text-sm mb-1">Conversation ouverte</p>
            <p className="text-dark-400 text-xs max-w-xs">
              Commencez par vous présenter. Restez sincère, respectueux et dans le cadre de votre démarche de mariage.
            </p>
          </div>
        ) : (
          groupes.map((groupe) => (
            <div key={groupe.date}>
              {/* Séparateur de date */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-dark-700" />
                <span className="text-dark-500 text-[11px] capitalize">{groupe.date}</span>
                <div className="flex-1 h-px bg-dark-700" />
              </div>

              {/* Messages du groupe */}
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

      {/* ── Zone saisie ───────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-dark-800 border-t border-dark-700 px-4 py-3">
        {/* Compteur de messages étape PRESENTATION */}
        {conv?.etape === 'PRESENTATION' && conv.messageCount < 10 && (
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={11} className="text-dark-500" />
            <span className="text-[11px] text-dark-500">
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
            className="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-4 py-2.5 text-white text-sm placeholder-dark-400 resize-none outline-none focus:border-gold-500/50 transition-colors max-h-32 overflow-y-auto"
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={envoyer}
            disabled={!texte.trim() || envoi}
            className="w-11 h-11 flex-shrink-0 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-dark-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {envoi ? (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <Send size={17} className="text-black" />
            )}
          </button>
        </div>

        {/* Rappel supervision */}
        <p className="text-[10px] text-dark-600 mt-2 text-center">
          🔒 Messages supervisés · Ne partagez pas vos coordonnées personnelles
        </p>
      </div>
    </div>
  )
}
