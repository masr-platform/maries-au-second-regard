'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Heart, MessageCircle, Bell, User, Settings, LogOut,
  TrendingUp, Shield, Lock, Eye, EyeOff, ChevronRight,
  ToggleLeft, ToggleRight, AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'

const planLabel: Record<string, string> = {
  GRATUIT:  '1 profil/semaine',
  STANDARD: '1 profil/semaine',
  BASIQUE:  '1 profil/semaine',
  PREMIUM:  '2 profils/semaine',
  ULTRA:    '3 profils/semaine',
}

export default function ParametresPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [waliEnabled, setWaliEnabled] = useState(false)
  const [photoPublique, setPhotoPublique] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', nouveau: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/connexion')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') chargerParametres()
  }, [status])

  const chargerParametres = async () => {
    try {
      const res = await fetch('/api/profil')
      if (res.ok) {
        const data = await res.json()
        setWaliEnabled(data.profil.waliEnabled ?? false)
        setPhotoPublique(data.profil.photoPublique ?? true)
      }
    } catch {
      // silencieux
    } finally {
      setLoading(false)
    }
  }

  const sauvegarderToggle = async (champ: string, valeur: boolean) => {
    setSaving(true)
    try {
      const res = await fetch('/api/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [champ]: valeur }),
      })
      if (res.ok) {
        toast.success('Paramètre mis à jour')
      } else {
        toast.error('Erreur lors de la mise à jour')
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

  const currentPlan = (session?.user?.plan as string) ?? 'GRATUIT'

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
              <p className="text-dark-400 text-xs">{planLabel[currentPlan] ?? '—'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/tableau-de-bord', icon: Heart,         label: 'Mes matchs' },
            { href: '/messages',        icon: MessageCircle, label: 'Messages' },
            { href: '/notifications',   icon: Bell,          label: 'Notifications' },
            { href: '/profil',          icon: User,          label: 'Mon profil' },
            { href: '/abonnement',      icon: TrendingUp,    label: 'Abonnement' },
            { href: '/parametres',      icon: Settings,      label: 'Paramètres', active: true },
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
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-white">Paramètres</h1>
          <p className="text-dark-300 text-sm mt-1">Confidentialité, sécurité et préférences</p>
        </div>

        {/* ── Confidentialité ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800 border border-dark-700 rounded-2xl p-6 mb-5"
        >
          <h2 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
            <Eye size={15} className="text-gold-400" />
            Confidentialité
          </h2>

          {/* Photo publique */}
          <div className="flex items-center justify-between py-3 border-b border-dark-700">
            <div>
              <p className="text-white text-sm font-medium">Photo visible</p>
              <p className="text-dark-500 text-xs mt-0.5">Votre photo est visible par vos matchs</p>
            </div>
            <button
              onClick={() => {
                const next = !photoPublique
                setPhotoPublique(next)
                sauvegarderToggle('photoPublique', next)
              }}
              disabled={saving}
              className="text-gold-400 hover:text-gold-300 transition-colors"
            >
              {photoPublique
                ? <ToggleRight size={30} className="text-gold-400" />
                : <ToggleLeft size={30} className="text-dark-500" />
              }
            </button>
          </div>

          {/* Mode Wali */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-white text-sm font-medium">Mode Wali</p>
              <p className="text-dark-500 text-xs mt-0.5">
                Un tiers de confiance peut suivre vos échanges
              </p>
            </div>
            <button
              onClick={() => {
                const next = !waliEnabled
                setWaliEnabled(next)
                sauvegarderToggle('waliEnabled', next)
              }}
              disabled={saving}
              className="text-gold-400 hover:text-gold-300 transition-colors"
            >
              {waliEnabled
                ? <ToggleRight size={30} className="text-gold-400" />
                : <ToggleLeft size={30} className="text-dark-500" />
              }
            </button>
          </div>
        </motion.div>

        {/* ── Sécurité ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-800 border border-dark-700 rounded-2xl p-6 mb-5"
        >
          <h2 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
            <Lock size={15} className="text-gold-400" />
            Sécurité
          </h2>

          {/* Email */}
          <div className="flex items-center justify-between py-3 border-b border-dark-700">
            <div>
              <p className="text-white text-sm font-medium">Adresse e-mail</p>
              <p className="text-dark-500 text-xs mt-0.5">{session?.user?.email}</p>
            </div>
            <span className="text-dark-600 text-xs">Non modifiable</span>
          </div>

          {/* Mot de passe */}
          <div className="py-3">
            <button
              onClick={() => setShowPasswordForm(v => !v)}
              className="flex items-center justify-between w-full"
            >
              <div>
                <p className="text-white text-sm font-medium text-left">Mot de passe</p>
                <p className="text-dark-500 text-xs mt-0.5">Changer votre mot de passe</p>
              </div>
              <ChevronRight size={16} className={`text-dark-500 transition-transform ${showPasswordForm ? 'rotate-90' : ''}`} />
            </button>

            {showPasswordForm && (
              <div className="mt-4 space-y-3">
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Mot de passe actuel"
                    value={passwords.current}
                    onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white text-sm focus:border-gold-500 focus:outline-none placeholder-dark-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Nouveau mot de passe (8 caractères min.)"
                  value={passwords.nouveau}
                  onChange={(e) => setPasswords(p => ({ ...p, nouveau: e.target.value }))}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white text-sm focus:border-gold-500 focus:outline-none placeholder-dark-500"
                />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Confirmer le nouveau mot de passe"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white text-sm focus:border-gold-500 focus:outline-none placeholder-dark-500"
                />
                <button
                  onClick={() => {
                    if (passwords.nouveau.length < 8) {
                      toast.error('Le mot de passe doit faire au moins 8 caractères')
                      return
                    }
                    if (passwords.nouveau !== passwords.confirm) {
                      toast.error('Les mots de passe ne correspondent pas')
                      return
                    }
                    toast.success('Fonctionnalité disponible prochainement')
                    setShowPasswordForm(false)
                    setPasswords({ current: '', nouveau: '', confirm: '' })
                  }}
                  className="btn-gold text-sm px-4 py-2"
                >
                  Changer le mot de passe
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Légal ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-dark-800 border border-dark-700 rounded-2xl p-6 mb-5"
        >
          <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Shield size={15} className="text-gold-400" />
            Légal & données
          </h2>
          <div className="space-y-1">
            {[
              { href: '/cgu',            label: 'Conditions générales d\'utilisation' },
              { href: '/cgv',            label: 'Conditions générales de vente' },
              { href: '/confidentialite', label: 'Politique de confidentialité' },
              { href: '/mentions-legales', label: 'Mentions légales' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between py-2.5 text-dark-300 hover:text-white text-sm transition-colors"
              >
                {item.label}
                <ChevronRight size={14} className="text-dark-600" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── Zone danger ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6"
        >
          <h2 className="text-red-400 font-semibold text-sm mb-4 flex items-center gap-2">
            <AlertTriangle size={15} />
            Zone de danger
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => {
                if (confirm('Êtes-vous sûr(e) de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                  toast.error('Contactez le support pour supprimer votre compte : support@masr.fr')
                }
              }}
              className="w-full py-3 text-sm text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-colors"
            >
              Supprimer mon compte
            </button>
          </div>
        </motion.div>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 flex md:hidden z-50">
          {[
            { href: '/tableau-de-bord', icon: Heart,         label: 'Matchs' },
            { href: '/messages',        icon: MessageCircle, label: 'Messages' },
            { href: '/notifications',   icon: Bell,          label: 'Notifs' },
            { href: '/profil',          icon: User,          label: 'Profil' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center py-3 gap-1 text-[10px] text-dark-400"
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
