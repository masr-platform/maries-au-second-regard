'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Video, VideoOff, Mic, MicOff, Phone, Shield,
  Clock, Users, ChevronLeft, AlertCircle, Loader2,
} from 'lucide-react'
import { format, addMinutes } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface SessionData {
  token:        string
  roomUrl:      string
  roomName:     string
  scheduledAt:  string
  dureeMinutes: number
}

type PageState = 'loading' | 'lobby' | 'call' | 'ended' | 'error'

export default function SessionVideoPage() {
  const { data: authSession, status } = useSession()
  const router     = useRouter()
  const params     = useParams()
  const sessionId  = params.sessionId as string

  const [pageState, setPageState]   = useState<PageState>('loading')
  const [sessionData, setData]      = useState<SessionData | null>(null)
  const [errorMsg, setErrorMsg]     = useState('')
  const [timeLeft, setTimeLeft]     = useState<string>('')
  const iframeRef                   = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/connexion')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') loadToken()
  }, [status])

  const loadToken = async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/token`)
      if (!res.ok) {
        const err = await res.json()
        setErrorMsg(err.error || 'Impossible de rejoindre cette session')
        setPageState('error')
        return
      }
      const data = await res.json()
      setData(data)
      setPageState('lobby')
    } catch {
      setErrorMsg('Erreur réseau — vérifiez votre connexion')
      setPageState('error')
    }
  }

  // Compte à rebours
  useEffect(() => {
    if (!sessionData) return
    const end = addMinutes(new Date(sessionData.scheduledAt), sessionData.dureeMinutes)

    const tick = () => {
      const diff = end.getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Terminée')
        if (pageState === 'call') setPageState('ended')
        return
      }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setTimeLeft(
        h > 0
          ? `${h}h ${String(m).padStart(2, '0')}min`
          : `${m}:${String(s).padStart(2, '0')}`
      )
    }

    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [sessionData, pageState])

  const rejoindre = () => {
    if (!sessionData) return
    setPageState('call')
  }

  const quitter = () => {
    setPageState('ended')
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (status === 'loading' || pageState === 'loading') {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 size={32} className="text-gold-500 animate-spin" />
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-6">
        <div className="text-center max-w-sm" style={{ animation: 'fadeInUp 0.35s ease both' }}>
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-serif font-bold text-white mb-2">Session inaccessible</h2>
          <p className="text-dark-300 text-sm mb-6">{errorMsg}</p>
          <Link href="/sessions"
            className="inline-flex items-center gap-2 text-gold-400 border border-gold-500/30 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gold-500/5 transition-all">
            <ChevronLeft size={15} />
            Retour aux sessions
          </Link>
        </div>
        <style jsx global>{`
          @keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        `}</style>
      </div>
    )
  }

  // ── Ended ────────────────────────────────────────────────────────
  if (pageState === 'ended') {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-6">
        <div className="text-center max-w-sm" style={{ animation: 'fadeInUp 0.35s ease both' }}>
          <div className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">🤲</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">Session terminée</h2>
          <p className="text-dark-300 text-sm mb-2">
            Qu'Allah facilite votre chemin vers le mariage.
          </p>
          <p className="text-dark-500 text-xs mb-8">
            Un compte-rendu sera envoyé par l'imam sous 24h si applicable.
          </p>
          <Link href="/sessions"
            className="inline-flex items-center gap-2 bg-gold-500/10 text-gold-400 border border-gold-500/30 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gold-500/15 transition-all">
            <ChevronLeft size={15} />
            Retour aux sessions
          </Link>
        </div>
        <style jsx global>{`
          @keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        `}</style>
      </div>
    )
  }

  // ── Call ─────────────────────────────────────────────────────────
  if (pageState === 'call' && sessionData) {
    const callUrl = `${sessionData.roomUrl}?t=${sessionData.token}`

    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        {/* Barre supérieure */}
        <div className="flex items-center justify-between px-4 py-3 bg-dark-900/80 backdrop-blur-sm border-b border-dark-700 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full border border-gold-500 flex items-center justify-center">
              <span className="text-gold-500 text-xs font-bold">M</span>
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Mouqabala encadrée</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-[10px]">En cours</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {timeLeft && (
              <div className="flex items-center gap-1.5 text-dark-400 text-xs">
                <Clock size={12} />
                <span>{timeLeft}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-dark-500 text-xs">
              <Shield size={12} className="text-gold-500" />
              <span className="text-gold-500">Supervisée</span>
            </div>
          </div>
        </div>

        {/* Daily.co iframe */}
        <div className="flex-1 relative">
          <iframe
            ref={iframeRef}
            src={callUrl}
            allow="camera; microphone; fullscreen; speaker; display-capture"
            className="w-full h-full border-0"
            title="Mouqabala virtuelle MASR"
          />
        </div>

        {/* Bouton quitter */}
        <div className="flex items-center justify-center py-4 bg-dark-900/80 backdrop-blur-sm border-t border-dark-700 flex-shrink-0">
          <button
            onClick={quitter}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full text-sm font-bold transition-all shadow-lg shadow-red-500/30"
          >
            <Phone size={16} className="rotate-[135deg]" />
            Quitter la session
          </button>
        </div>
      </div>
    )
  }

  // ── Lobby — salle d'attente avant d'entrer ────────────────────────
  if (!sessionData) return null

  const sessionDate = new Date(sessionData.scheduledAt)
  const sessionEnd  = addMinutes(sessionDate, sessionData.dureeMinutes)
  const isReady     = new Date() >= new Date(sessionDate.getTime() - 5 * 60_000)

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center px-6 py-16">

      {/* Back */}
      <div className="absolute top-6 left-6">
        <Link href="/sessions" className="flex items-center gap-2 text-dark-400 hover:text-white text-sm transition-colors">
          <ChevronLeft size={16} />
          Mes sessions
        </Link>
      </div>

      <div className="w-full max-w-lg" style={{ animation: 'fadeInUp 0.4s ease both' }}>

        {/* Card principale */}
        <div className="bg-dark-800 border border-dark-700 rounded-3xl p-8 text-center mb-6">

          {/* Icône */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-600 to-gold-800 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gold-500/20">
            <Video size={32} className="text-white" />
          </div>

          <h1 className="text-2xl font-serif font-bold text-white mb-1">Mouqabala virtuelle</h1>
          <p className="text-dark-400 text-sm mb-6">Encadrée par un imam ou psychologue clinicien</p>

          {/* Infos */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-dark-700 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-dark-400 text-xs mb-1">
                <Clock size={12} />
                Heure prévue
              </div>
              <p className="text-white font-semibold text-sm">
                {format(sessionDate, "HH'h'mm", { locale: fr })}
              </p>
              <p className="text-dark-500 text-xs">
                {format(sessionDate, 'dd MMM yyyy', { locale: fr })}
              </p>
            </div>
            <div className="bg-dark-700 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-dark-400 text-xs mb-1">
                <Clock size={12} />
                Durée
              </div>
              <p className="text-white font-semibold text-sm">{sessionData.dureeMinutes} minutes</p>
              <p className="text-dark-500 text-xs">Fin à {format(sessionEnd, "HH'h'mm", { locale: fr })}</p>
            </div>
          </div>

          {/* Compte à rebours */}
          {timeLeft && timeLeft !== 'Terminée' && (
            <div className="bg-dark-700 rounded-2xl px-5 py-3 mb-6 text-center">
              <p className="text-dark-400 text-xs mb-1">Temps restant</p>
              <p className="text-gold-400 font-mono text-2xl font-bold">{timeLeft}</p>
            </div>
          )}

          {/* Rappels */}
          <div className="space-y-2 mb-8 text-left">
            {[
              { icon: Shield,    text: "Session confidentielle et sécurisée" },
              { icon: Users,     text: "Maximum 3 participants (vous, votre match, l'imam)" },
              { icon: VideoOff,  text: "Vidéo recommandée, audio obligatoire" },
              { icon: MicOff,    text: "Mettez votre micro en sourdine en attendant les autres" },
            ].map((r, i) => {
              const Icon = r.icon
              return (
                <div key={i} className="flex items-center gap-3 text-xs text-dark-400">
                  <Icon size={14} className="text-gold-500 flex-shrink-0" />
                  <span>{r.text}</span>
                </div>
              )
            })}
          </div>

          {/* CTA */}
          {isReady ? (
            <button
              onClick={rejoindre}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-black font-bold py-4 rounded-2xl text-base transition-all shadow-xl shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-[1.02]"
            >
              <Video size={20} />
              Rejoindre la session
            </button>
          ) : (
            <div className="w-full text-center py-4">
              <p className="text-dark-400 text-sm mb-1">La session ouvrira 5 min avant l'heure</p>
              <p className="text-dark-600 text-xs">
                {format(new Date(sessionDate.getTime() - 5 * 60_000), "à HH'h'mm", { locale: fr })}
              </p>
            </div>
          )}
        </div>

        {/* Badge confiance */}
        <div className="flex items-center justify-center gap-2 text-xs text-dark-500">
          <Shield size={12} className="text-gold-500" />
          <span>Cadre islamique · Aucune donnée personnelle partagée · Supervisé</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}
