'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, MessageCircle, AlertTriangle, TrendingUp,
  CheckCircle2, Ban, Eye, Flag, RefreshCw, Shield,
  Heart, DollarSign, Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Stats {
  totalUsers:        number
  nouveauxAujourdhui: number
  totalMatchs:       number
  chatsouverts:      number
  signalementsEnCours: number
  revenuMois:        number
  usersBannis:       number
  questionnaireCompletes: number
}

interface Signalement {
  id:            string
  conversationId: string
  flagType:       string
  flagDetails:    string
  flaggedAt:      string
  user1:          { prenom: string }
  user2:          { prenom: string }
}

interface UserRecent {
  id:       string
  prenom:   string
  genre:    string
  ville:    string
  plan:     string
  createdAt: string
  isVerified: boolean
  questionnaireCompleted: boolean
}

export default function AdminPage() {
  const [stats,       setStats]       = useState<Stats | null>(null)
  const [signalements, setSignalements] = useState<Signalement[]>([])
  const [usersRecents, setUsersRecents] = useState<UserRecent[]>([])
  const [loading,     setLoading]     = useState(true)
  const [onglet,      setOnglet]      = useState<'overview' | 'signalements' | 'users'>('overview')

  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = async () => {
    try {
      const [statsRes, sigRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/signalements'),
        fetch('/api/admin/users?limite=20'),
      ])

      if (statsRes.ok)   setStats(await statsRes.json())
      if (sigRes.ok)     setSignalements((await sigRes.json()).signalements || [])
      if (usersRes.ok)   setUsersRecents((await usersRes.json()).users || [])
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
      if (res.ok) {
        toast.success(`Action "${action}" effectuée`)
        chargerDonnees()
      }
    } catch {
      toast.error('Erreur')
    }
  }

  const traiterSignalement = async (convId: string, action: 'dismiss' | 'warn' | 'block') => {
    try {
      const res = await fetch(`/api/admin/signalements/${convId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        toast.success('Signalement traité')
        chargerDonnees()
      }
    } catch {
      toast.error('Erreur')
    }
  }

  const KPICard = ({ titre, valeur, icon: Icon, couleur, sousTitre }: {
    titre: string; valeur: number | string
    icon: React.ElementType; couleur: string; sousTitre?: string
  }) => (
    <div className="card-dark">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-300 text-sm">{titre}</p>
          <p className={`text-3xl font-bold mt-1 ${couleur}`}>{valeur}</p>
          {sousTitre && <p className="text-dark-400 text-xs mt-1">{sousTitre}</p>}
        </div>
        <div className={`p-2.5 rounded-lg bg-opacity-10 ${couleur.replace('text-', 'bg-').replace('-400', '-500/10')}`}>
          <Icon size={20} className={couleur} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            <Shield size={24} className="text-gold-500" />
            Dashboard Admin
          </h1>
          <p className="text-dark-400 text-sm mt-1">Mariés au Second Regard — Supervision</p>
        </div>
        <button
          onClick={chargerDonnees}
          className="btn-outline-gold flex items-center gap-2 py-2 px-4 text-sm"
        >
          <RefreshCw size={15} />
          Actualiser
        </button>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPICard titre="Membres total"    valeur={stats.totalUsers}        icon={Users}         couleur="text-gold-400" sousTitre={`+${stats.nouveauxAujourdhui} aujourd'hui`} />
          <KPICard titre="Matchs ouverts"   valeur={stats.chatsouverts}      icon={Heart}         couleur="text-green-400" />
          <KPICard titre="Signalements"     valeur={stats.signalementsEnCours} icon={AlertTriangle} couleur="text-red-400" sousTitre="À traiter" />
          <KPICard titre="Revenu ce mois"   valeur={`${stats.revenuMois} €`} icon={DollarSign}    couleur="text-gold-400" />
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 mb-6 bg-dark-800 p-1 rounded-xl w-fit">
        {(['overview', 'signalements', 'users'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setOnglet(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              onglet === tab
                ? 'bg-gold-500 text-black'
                : 'text-dark-300 hover:text-white'
            }`}
          >
            {tab === 'overview' ? 'Vue d\'ensemble' :
             tab === 'signalements' ? `Signalements (${signalements.length})` :
             'Utilisateurs'}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {onglet === 'signalements' && (
        <div className="space-y-3">
          {signalements.length === 0 ? (
            <div className="card-dark text-center py-10">
              <CheckCircle2 size={28} className="text-green-400 mx-auto mb-2" />
              <p className="text-dark-300">Aucun signalement en attente</p>
            </div>
          ) : signalements.map((sig) => (
            <motion.div
              key={sig.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-dark border-red-500/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg flex-shrink-0">
                    <Flag size={16} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {sig.user1.prenom} ↔ {sig.user2.prenom}
                    </p>
                    <p className="text-dark-300 text-xs mt-0.5">
                      Type: <span className="text-red-400">{sig.flagType}</span>
                      {' · '}{sig.flagDetails}
                    </p>
                    <p className="text-dark-500 text-xs mt-1">
                      {new Date(sig.flaggedAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => traiterSignalement(sig.conversationId, 'dismiss')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-dark-600 text-dark-300 hover:text-white transition-colors"
                  >
                    Ignorer
                  </button>
                  <button
                    onClick={() => traiterSignalement(sig.conversationId, 'warn')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                  >
                    Avertir
                  </button>
                  <button
                    onClick={() => traiterSignalement(sig.conversationId, 'block')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Bloquer
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {onglet === 'users' && (
        <div className="card-dark overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left text-dark-300 py-3 pr-4 font-medium">Membre</th>
                <th className="text-left text-dark-300 py-3 pr-4 font-medium">Genre</th>
                <th className="text-left text-dark-300 py-3 pr-4 font-medium">Plan</th>
                <th className="text-left text-dark-300 py-3 pr-4 font-medium">Statut</th>
                <th className="text-left text-dark-300 py-3 pr-4 font-medium">Inscription</th>
                <th className="text-left text-dark-300 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {usersRecents.map((user) => (
                <tr key={user.id} className="hover:bg-dark-700/50 transition-colors">
                  <td className="py-3 pr-4">
                    <div>
                      <p className="text-white font-medium">{user.prenom}</p>
                      <p className="text-dark-400 text-xs">{user.ville || '—'}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-dark-300">{user.genre === 'HOMME' ? '♂' : '♀'} {user.genre}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge-gold text-xs ${user.plan !== 'GRATUIT' ? 'bg-gold-500/20' : ''}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      {user.isVerified ? (
                        <CheckCircle2 size={13} className="text-green-400" />
                      ) : (
                        <AlertTriangle size={13} className="text-yellow-400" />
                      )}
                      <span className={`text-xs ${user.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                        {user.isVerified ? 'Vérifié' : 'Non vérifié'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-dark-400 text-xs">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1.5">
                      {!user.isVerified && (
                        <button
                          onClick={() => actionUser(user.id, 'verify')}
                          className="p-1.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                          title="Vérifier"
                        >
                          <CheckCircle2 size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => actionUser(user.id, 'suspend')}
                        className="p-1.5 rounded bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                        title="Suspendre"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => actionUser(user.id, 'ban')}
                        className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Bannir"
                      >
                        <Ban size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {onglet === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats rapides */}
          <div className="card-dark">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={17} className="text-gold-500" />
              Activité plateforme
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Questionnaires complétés', val: stats.questionnaireCompletes, total: stats.totalUsers },
                { label: 'Matchs actifs',           val: stats.chatsouverts,           total: stats.totalMatchs },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-300">{item.label}</span>
                    <span className="text-gold-400">{item.val} / {item.total}</span>
                  </div>
                  <div className="h-1.5 bg-dark-600 rounded-full">
                    <div
                      className="h-full bg-gold-500 rounded-full"
                      style={{ width: item.total > 0 ? `${(item.val / item.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signalements récents */}
          <div className="card-dark">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={17} className="text-red-400" />
              Signalements récents
            </h3>
            {signalements.slice(0, 3).length === 0 ? (
              <p className="text-dark-400 text-sm text-center py-4">Aucun signalement 🎉</p>
            ) : (
              <div className="space-y-2">
                {signalements.slice(0, 3).map((sig) => (
                  <div key={sig.id} className="flex items-center gap-3 p-2.5 bg-dark-700 rounded-lg">
                    <span className="text-xs text-red-400 font-medium">{sig.flagType}</span>
                    <span className="text-xs text-dark-300 flex-1 truncate">{sig.flagDetails}</span>
                    <button
                      onClick={() => setOnglet('signalements')}
                      className="text-xs text-gold-400 hover:underline"
                    >
                      Voir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
