'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart, MessageCircle, Bell, User, Settings, LogOut,
  Sparkles, ChevronRight, CheckCircle2, Clock, Star,
  AlertCircle, TrendingUp
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'

interface Proposition {
  matchId:    string
  scoreGlobal: number
  forteCompatibilite: boolean
  status:     string
  maReponse:  string
  proposedAt: string
  profil: {
    id:       string
    prenom:   string
    ville:    string | null
    photoUrl: string | null
    infos: {
      niveauPratique:  string
      objectifMariage: string
      niveauEtudes:    string
    } | null
  }
  dimensions: {
    foi:           number
    personnalite:  number
    projetVie:     number
    communication: number
    styleVie:      number
  }
}

export default function TableauDeBordPage() {
  const { data: session } = useSession()
  const [propositions, setPropositions] = useState<Proposition[]>([])
  const [loading,      setLoading]      = useState(true)
  const [calculant,    setCalculant]    = useState(false)

  useEffect(() => {
    chargerPropositions()
  }, [])

  const chargerPropositions = async () => {
    try {
      const res  = await fetch('/api/matching')
      const json = await res.json()
      if (res.ok) setPropositions(json.propositions || [])
    } catch {
      toast.error('Erreur chargement des propositions')
    } finally {
      setLoading(false)
    }
  }

  const demanderMatchs = async () => {
    setCalculant(true)
    try {
      const res  = await fetch('/api/matching', { method: 'POST' })
      const json = await res.json()

      if (res.ok) {
        toast.success(json.message)
        chargerPropositions()
      } else {
        toast.error(json.message || json.error)
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setCalculant(false)
    }
  }

  const repondreProposition = async (matchId: string, reponse: 'ACCEPTE' | 'REJETE') => {
    try {
      const res = await fetch(`/api/matching/${matchId}/repondre`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reponse }),
      })

      if (res.ok) {
        const msg = reponse === 'ACCEPTE'
          ? 'Proposition acceptée ! Nous vérifions si l\'intérêt est mutuel...'
          : 'Proposition déclinée. Notre IA cherche un nouveau profil compatible.'
        toast.success(msg)
        chargerPropositions()
      }
    } catch {
      toast.error('Erreur')
    }
  }

  const planLabel = { GRATUIT: '1 profil/semaine', STANDARD: '2 profils/semaine', PREMIUM: '3 profils/semaine' }

  return (
    <div className="min-h-screen bg-dark-900">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-dark-800 border-r border-dark-700 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-gold-500 flex items-center justify-center">
              <span className="text-gold-500 font-serif font-bold">M</span>
            </div>
            <div>
              <p className="text-white font-serif text-sm font-semibold">MASR</p>
              <p className="text-dark-400 text-xs">{planLabel[session?.user?.plan as keyof typeof planLabel] || '—'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/tableau-de-bord', icon: Heart,          label: 'Mes matchs' },
            { href: '/messages',        icon: MessageCircle,  label: 'Messages' },
            { href: '/notifications',   icon: Bell,           label: 'Notifications' },
            { href: '/profil',          icon: User,           label: 'Mon profil' },
            { href: '/abonnement',      icon: TrendingUp,     label: 'Abonnement' },
            { href: '/parametres',      icon: Settings,       label: 'Paramètres' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700 transition-all text-sm"
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

      {/* ── Contenu principal ──────────────────────────────────── */}
      <main className="md:ml-64 p-6 md:p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-white">
              Salaam, {session?.user?.name} 👋
            </h1>
            <p className="text-dark-300 text-sm mt-1">
              {propositions.length > 0
                ? `${propositions.length} proposition(s) en attente`
                : 'Découvrez vos profils compatibles'}
            </p>
          </div>
          <button
            onClick={demanderMatchs}
            disabled={calculant}
            className="btn-gold flex items-center gap-2 py-2.5 px-5"
          >
            {calculant ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {calculant ? 'Analyse en cours...' : 'Trouver des profils'}
          </button>
        </div>

        {/* Propositions */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-dark">
                <div className="skeleton h-48 rounded-lg mb-4" />
                <div className="skeleton h-4 w-3/4 mb-2" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : propositions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
              <Heart size={28} className="text-gold-500" />
            </div>
            <h2 className="text-xl font-serif font-bold text-white mb-2">
              Votre premier matching arrive bientôt
            </h2>
            <p className="text-dark-300 text-sm max-w-sm mx-auto mb-6">
              Notre IA analyse votre profil et recherche les meilleures compatibilités parmi nos membres.
              Cliquez sur &ldquo;Trouver des profils&rdquo; pour lancer le matching.
            </p>
            <button onClick={demanderMatchs} disabled={calculant} className="btn-gold">
              {calculant ? 'Recherche en cours...' : 'Lancer le matching IA'}
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {propositions.map((prop, i) => (
              <motion.div
                key={prop.matchId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-dark border-dark-600 hover:border-gold-500/40 transition-all duration-300"
              >
                {/* Photo */}
                <div className="relative rounded-lg overflow-hidden mb-4 aspect-[4/3] bg-dark-700">
                  {prop.profil.photoUrl ? (
                    <Image
                      src={prop.profil.photoUrl}
                      alt={prop.profil.prenom}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <User size={40} className="text-dark-500" />
                    </div>
                  )}

                  {/* Score badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                      prop.forteCompatibilite
                        ? 'bg-gold-500 text-black'
                        : 'bg-dark-700/90 text-gold-400 border border-gold-500/50'
                    }`}>
                      {Math.round(prop.scoreGlobal)}%
                    </div>
                  </div>

                  {prop.forteCompatibilite && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/70 text-gold-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Star size={10} className="fill-current" />
                        Forte compatibilité
                      </span>
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-white">{prop.profil.prenom}</h3>
                    {prop.profil.ville && (
                      <span className="text-dark-400 text-xs">{prop.profil.ville}</span>
                    )}
                  </div>

                  {prop.profil.infos && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {prop.profil.infos.niveauPratique && (
                        <span className="badge-gold text-xs">
                          {prop.profil.infos.niveauPratique.replace('_', ' ')}
                        </span>
                      )}
                      {prop.profil.infos.niveauEtudes && (
                        <span className="badge-gold text-xs">
                          {prop.profil.infos.niveauEtudes.replace('_', '+')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Barres de dimensions */}
                  <div className="space-y-1.5">
                    {Object.entries(prop.dimensions).slice(0, 3).map(([dim, score]) => (
                      <div key={dim} className="flex items-center gap-2">
                        <span className="text-xs text-dark-400 w-24 capitalize">
                          {dim === 'projetVie' ? 'Projet de vie' : dim}
                        </span>
                        <div className="flex-1 h-1 bg-dark-600 rounded-full">
                          <div
                            className="h-full bg-gold-500 rounded-full"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-xs text-gold-400 w-7 text-right">{Math.round(score)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {prop.maReponse === 'EN_ATTENTE' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => repondreProposition(prop.matchId, 'REJETE')}
                      className="py-2.5 px-3 rounded-lg border border-dark-500 text-dark-300 hover:border-red-500/50 hover:text-red-400 transition-all text-sm"
                    >
                      Décliner
                    </button>
                    <button
                      onClick={() => repondreProposition(prop.matchId, 'ACCEPTE')}
                      className="btn-gold py-2.5 text-sm"
                    >
                      Accepter
                    </button>
                  </div>
                ) : prop.maReponse === 'ACCEPTE' ? (
                  <div className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm ${
                    prop.status === 'CHAT_OUVERT'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                      : 'bg-gold-500/10 text-gold-400 border border-gold-500/30'
                  }`}>
                    {prop.status === 'CHAT_OUVERT' ? (
                      <>
                        <MessageCircle size={15} />
                        <Link href={`/messages?matchId=${prop.matchId}`}>Ouvrir le chat</Link>
                      </>
                    ) : (
                      <>
                        <Clock size={15} />
                        En attente de réponse
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm bg-dark-700 text-dark-400">
                    <CheckCircle2 size={15} />
                    Décliné
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Bandeau upgrade si plan gratuit */}
        {session?.user?.plan === 'GRATUIT' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-5 bg-dark-800 border border-gold-500/30 rounded-xl flex items-center gap-4"
          >
            <div className="p-2.5 bg-gold-500/10 rounded-lg flex-shrink-0">
              <Sparkles size={20} className="text-gold-500" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Passez en Standard ou Premium</p>
              <p className="text-dark-300 text-xs mt-0.5">
                Recevez jusqu&apos;à 3 profils compatibles par semaine au lieu de 1
              </p>
            </div>
            <Link href="/abonnement" className="btn-gold py-2 px-4 text-sm flex-shrink-0 flex items-center gap-1">
              Voir les offres
              <ChevronRight size={15} />
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  )
}
