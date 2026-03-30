'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  User, Heart, MessageCircle, Bell, Settings, LogOut,
  TrendingUp, CheckCircle2, Clock, Edit3, MapPin,
  Camera, Shield, BookOpen, Star,
} from 'lucide-react'
import toast from 'react-hot-toast'

const planLabel: Record<string, string> = {
  GRATUIT: '1 profil/semaine',
  STANDARD: '1 profil/semaine',
  BASIQUE: '3 profils/mois',
  PREMIUM: '2 profils/semaine',
  ULTRA: 'Profils illimités',
}

const planBadge: Record<string, { label: string; color: string; bg: string }> = {
  GRATUIT:  { label: 'Gratuit',  color: 'text-dark-400', bg: 'bg-dark-700' },
  STANDARD: { label: 'Essentiel',  color: 'text-gold-400', bg: 'bg-gold-500/10' },
  BASIQUE:  { label: 'Essentiel',  color: 'text-gold-400', bg: 'bg-gold-500/10' },
  PREMIUM:  { label: 'Premium',  color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ULTRA:    { label: 'Élite',    color: 'text-blue-400', bg: 'bg-blue-500/10' },
}

interface ProfilData {
  id: string
  prenom: string
  email: string
  genre: string
  ville: string | null
  pays: string
  plan: string
  photoUrl: string | null
  questionnaireCompleted: boolean
  profileCompleted: boolean
  isVerified: boolean
  createdAt: string
  waliEnabled: boolean
}

export default function ProfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profil, setProfil] = useState<ProfilData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({ prenom: '', ville: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/connexion')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') chargerProfil()
  }, [status])

  const chargerProfil = async () => {
    try {
      const res = await fetch('/api/profil')
      if (res.ok) {
        const data = await res.json()
        setProfil(data.profil)
        setEditData({ prenom: data.profil.prenom, ville: data.profil.ville || '' })
      }
    } catch {
      toast.error('Erreur lors du chargement du profil')
    } finally {
      setLoading(false)
    }
  }

  const sauvegarder = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (res.ok) {
        await chargerProfil()
        setEditMode(false)
        toast.success('Profil mis à jour !')
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const badge = planBadge[profil?.plan ?? 'GRATUIT'] ?? planBadge.GRATUIT
  const memberSince = profil?.createdAt
    ? new Date(profil.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : '—'

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
            { href: '/notifications', icon: Bell, label: 'Notifications' },
            { href: '/profil', icon: User, label: 'Mon profil', active: true },
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
            <h1 className="text-2xl font-serif font-bold text-white">Mon profil</h1>
            <p className="text-dark-300 text-sm mt-1">Membre depuis {memberSince}</p>
          </div>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 border border-gold-500/30 px-3 py-2 rounded-lg hover:bg-gold-500/5 transition-all"
            >
              <Edit3 size={14} />
              Modifier
            </button>
          )}
        </div>

        {/* ── Avatar + infos ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800 border border-dark-700 rounded-2xl p-6 mb-5"
        >
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-dark-700 border border-dark-600 flex items-center justify-center overflow-hidden">
                {profil?.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profil.photoUrl} alt={profil.prenom} className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-dark-400" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-dark-700 border border-dark-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-dark-600 transition-colors">
                <Camera size={13} className="text-dark-300" />
              </div>
            </div>

            {/* Infos */}
            <div className="flex-1">
              {editMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-dark-400 mb-1 block">Prénom</label>
                    <input
                      type="text"
                      value={editData.prenom}
                      onChange={(e) => setEditData(d => ({ ...d, prenom: e.target.value }))}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-dark-400 mb-1 block">Ville</label>
                    <input
                      type="text"
                      value={editData.ville}
                      onChange={(e) => setEditData(d => ({ ...d, ville: e.target.value }))}
                      placeholder="Paris, Lyon, Marseille..."
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:border-gold-500 focus:outline-none placeholder-dark-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={sauvegarder}
                      disabled={saving}
                      className="btn-gold text-sm px-4 py-2 disabled:opacity-50"
                    >
                      {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                    <button
                      onClick={() => { setEditMode(false); setEditData({ prenom: profil?.prenom || '', ville: profil?.ville || '' }) }}
                      className="text-sm text-dark-400 hover:text-white px-4 py-2 border border-dark-600 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-serif font-semibold text-white">{profil?.prenom}</h2>
                    {profil?.isVerified && (
                      <Shield size={15} className="text-gold-400" />
                    )}
                  </div>
                  <p className="text-dark-400 text-sm mb-2">{profil?.email}</p>
                  {profil?.ville && (
                    <div className="flex items-center gap-1 text-dark-400 text-xs mb-3">
                      <MapPin size={11} />
                      {profil.ville}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.bg} ${badge.color}`}>
                      Plan {badge.label}
                    </span>
                    <span className="text-xs text-dark-500">
                      {profil?.genre === 'HOMME' ? '♂ Homme' : '♀ Femme'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Statut du profil ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-800 border border-dark-700 rounded-2xl p-6 mb-5"
        >
          <h3 className="text-white font-semibold text-sm mb-4">Avancement du profil</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {profil?.questionnaireCompleted
                  ? <CheckCircle2 size={18} className="text-green-400" />
                  : <Clock size={18} className="text-dark-500" />
                }
                <span className="text-sm text-dark-200">Questionnaire de compatibilité</span>
              </div>
              {!profil?.questionnaireCompleted && (
                <Link href="/questionnaire" className="text-xs text-gold-400 hover:text-gold-300 font-medium">
                  Compléter →
                </Link>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {profil?.photoUrl
                  ? <CheckCircle2 size={18} className="text-green-400" />
                  : <Clock size={18} className="text-dark-500" />
                }
                <span className="text-sm text-dark-200">Photo de profil</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {profil?.isVerified
                  ? <CheckCircle2 size={18} className="text-green-400" />
                  : <Clock size={18} className="text-dark-500" />
                }
                <span className="text-sm text-dark-200">Profil vérifié par MASR</span>
              </div>
            </div>
          </div>

          {!profil?.questionnaireCompleted && (
            <div className="mt-4 p-3 bg-gold-500/5 border border-gold-500/20 rounded-lg">
              <p className="text-xs text-gold-400 flex items-center gap-2">
                <Star size={12} className="flex-shrink-0" />
                Complétez votre questionnaire pour recevoir vos premiers matchs !
              </p>
              <Link
                href="/questionnaire"
                className="btn-gold text-sm mt-3 inline-flex items-center gap-2 px-4 py-2"
              >
                <BookOpen size={14} />
                Démarrer le questionnaire
              </Link>
            </div>
          )}
        </motion.div>

        {/* ── Abonnement ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-800 border border-dark-700 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Mon abonnement</h3>
            <Link href="/abonnement" className="text-xs text-gold-400 hover:text-gold-300">
              Gérer →
            </Link>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl ${badge.bg} border border-${badge.color.replace('text-', '')}/20`}>
            <TrendingUp size={18} className={badge.color} />
            <div>
              <p className={`font-semibold text-sm ${badge.color}`}>Plan {badge.label}</p>
              <p className="text-dark-400 text-xs">{planLabel[profil?.plan ?? 'GRATUIT']}</p>
            </div>
          </div>

          {(profil?.plan === 'GRATUIT' || profil?.plan === 'BASIQUE' || profil?.plan === 'STANDARD') && (
            <div className="mt-3">
              <Link
                href="/abonnement"
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-black bg-gold-500 hover:bg-gold-400 rounded-lg transition-colors"
              >
                Passer Premium — 2× plus de matchs
              </Link>
            </div>
          )}
        </motion.div>

        {/* ── Mobile bottom nav ────────────────────────────────── */}
        <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 flex md:hidden z-50">
          {[
            { href: '/tableau-de-bord', icon: Heart, label: 'Matchs' },
            { href: '/messages', icon: MessageCircle, label: 'Messages' },
            { href: '/notifications', icon: Bell, label: 'Notifs' },
            { href: '/profil', icon: User, label: 'Profil', active: true },
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
