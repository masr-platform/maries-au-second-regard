'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Heart, MessageCircle, Bell, User, Settings, LogOut,
  TrendingUp, Shield, Lock, Eye, EyeOff, ChevronRight,
  ToggleLeft, ToggleRight, AlertTriangle, Users,
} from 'lucide-react'
import toast from 'react-hot-toast'

const planLabel: Record<string, string> = {
  GRATUIT:  'Accès gratuit',
  STANDARD: '1 profil/semaine',
  BASIQUE:  '3 profils/mois',
  PREMIUM:  '10 profils/mois',
  ULTRA:    'Profils illimités',
}

// ── Palette partagée avec le reste de l'app ──────────────────────────────────
const theme = {
  bg:        'bg-[#0d0a1f]',
  card:      'bg-[#0d0a1f] border border-white/8 rounded-2xl p-6',
  sidebar:   'bg-[#080615] border-r border-white/8',
  inputBase: 'w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none placeholder-white/30',
  inputStyle:{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' },
}

export default function ParametresPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [waliEnabled,    setWaliEnabled]    = useState(false)
  const [waliEmail,      setWaliEmail]      = useState('')
  const [waliNom,        setWaliNom]        = useState('')
  const [savingWali,     setSavingWali]     = useState(false)
  const [photoPublique,  setPhotoPublique]  = useState(true)
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', nouveau: '', confirm: '' })
  const [showPwd,   setShowPwd]   = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

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
        setWaliEmail(data.profil.waliEmail || '')
        setWaliNom(data.profil.waliNom || '')
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
      if (res.ok) toast.success('Paramètre mis à jour')
      else        toast.error('Erreur lors de la mise à jour')
    } catch { toast.error('Erreur réseau') }
    finally { setSaving(false) }
  }

  const sauvegarderWali = async () => {
    if (!waliEmail.trim()) { toast.error('Email du wali requis'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(waliEmail.trim())) { toast.error('Email invalide'); return }
    setSavingWali(true)
    try {
      const res = await fetch('/api/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waliEmail: waliEmail.trim(), waliNom: waliNom.trim() }),
      })
      if (res.ok) toast.success('Wali enregistré')
      else        toast.error('Erreur lors de la mise à jour')
    } catch { toast.error('Erreur réseau') }
    finally { setSavingWali(false) }
  }

  const changerMotDePasse = async () => {
    if (passwords.nouveau.length < 8) { toast.error('8 caractères minimum'); return }
    if (passwords.nouveau !== passwords.confirm) { toast.error('Les mots de passe ne correspondent pas'); return }
    setSavingPwd(true)
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.nouveau }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Mot de passe modifié !')
        setShowPasswordForm(false)
        setPasswords({ current: '', nouveau: '', confirm: '' })
      } else {
        toast.error(data.error || 'Erreur lors du changement')
      }
    } catch { toast.error('Erreur réseau') }
    finally { setSavingPwd(false) }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0d0a1f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentPlan = (session?.user?.plan as string) ?? 'GRATUIT'

  return (
    <div className="min-h-screen bg-[#0d0a1f]">

      {/* ── Sidebar desktop ─────────────────────────────────────────── */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 flex-col hidden md:flex ${theme.sidebar}`}>
        <div className="p-6 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-violet-500/60 flex items-center justify-center">
              <span className="text-violet-400 font-serif font-bold text-sm">M</span>
            </div>
            <div>
              <p className="text-white font-serif text-sm font-semibold">MASR</p>
              <p className="text-white/30 text-xs">{planLabel[currentPlan] ?? '—'}</p>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                  item.active
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
              <span className="text-violet-400 text-sm font-semibold">
                {session?.user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{session?.user?.name}</p>
              <p className="text-white/30 text-xs truncate">{session?.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 text-white/30 hover:text-white text-sm w-full transition-colors"
          >
            <LogOut size={15} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu ─────────────────────────────────────────────────── */}
      <main className="md:ml-64 p-5 md:p-8 max-w-2xl">
        <div className="mb-7">
          <h1 className="text-2xl font-serif font-bold text-white">Paramètres</h1>
          <p className="text-white/30 text-sm mt-1">Confidentialité, sécurité et préférences</p>
        </div>

        {/* ── Confidentialité ──────────────────────────────────────── */}
        <div
          className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 mb-5"
          style={{ animation: 'fadeInUp 0.35s ease both' }}
        >
          <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Eye size={15} className="text-violet-400" />
            Confidentialité
          </h2>

          {/* Photo publique */}
          <div className="flex items-center justify-between py-3 border-b border-white/6">
            <div>
              <p className="text-white text-sm font-medium">Photo visible par mes matchs</p>
              <p className="text-white/30 text-xs mt-0.5">Votre photo apparaît après compatibilité</p>
            </div>
            <button
              onClick={() => { const next = !photoPublique; setPhotoPublique(next); sauvegarderToggle('photoPublique', next) }}
              disabled={saving}
              className="transition-colors"
            >
              {photoPublique
                ? <ToggleRight size={28} className="text-violet-400" />
                : <ToggleLeft  size={28} className="text-white/20" />
              }
            </button>
          </div>

          {/* Mode Wali */}
          <div className="pt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Mode Wali</p>
                <p className="text-white/30 text-xs mt-0.5">Un tiers de confiance suit vos échanges</p>
              </div>
              <button
                onClick={() => { const next = !waliEnabled; setWaliEnabled(next); sauvegarderToggle('waliEnabled', next) }}
                disabled={saving}
                className="transition-colors"
              >
                {waliEnabled
                  ? <ToggleRight size={28} className="text-violet-400" />
                  : <ToggleLeft  size={28} className="text-white/20" />
                }
              </button>
            </div>

            {waliEnabled && (
              <div className="mt-3 space-y-2" style={{ animation: 'fadeInUp 0.2s ease both' }}>
                <input
                  type="text"
                  placeholder="Nom du wali (ex : Mon frère)"
                  value={waliNom}
                  onChange={e => setWaliNom(e.target.value)}
                  className={theme.inputBase}
                  style={theme.inputStyle}
                />
                <input
                  type="email"
                  placeholder="Email du wali *"
                  value={waliEmail}
                  onChange={e => setWaliEmail(e.target.value)}
                  className={theme.inputBase}
                  style={theme.inputStyle}
                />
                <button
                  onClick={sauvegarderWali}
                  disabled={savingWali}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', opacity: savingWali ? 0.6 : 1 }}
                >
                  {savingWali ? 'Enregistrement…' : 'Enregistrer le wali'}
                </button>
                <p className="text-xs text-white/25 text-center">Le wali recevra un email de notification</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Sécurité ─────────────────────────────────────────────── */}
        <div
          className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 mb-5"
          style={{ animation: 'fadeInUp 0.35s ease 0.08s both' }}
        >
          <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Lock size={15} className="text-violet-400" />
            Sécurité
          </h2>

          {/* Email */}
          <div className="flex items-center justify-between py-3 border-b border-white/6">
            <div>
              <p className="text-white text-sm font-medium">Adresse e-mail</p>
              <p className="text-white/30 text-xs mt-0.5">{session?.user?.email}</p>
            </div>
            <span className="text-white/20 text-xs">Non modifiable</span>
          </div>

          {/* Mot de passe */}
          <div className="py-3">
            <button
              onClick={() => setShowPasswordForm(v => !v)}
              className="flex items-center justify-between w-full group"
            >
              <div>
                <p className="text-white text-sm font-medium text-left">Mot de passe</p>
                <p className="text-white/30 text-xs mt-0.5">Changer votre mot de passe</p>
              </div>
              <ChevronRight size={16} className={`text-white/30 transition-transform ${showPasswordForm ? 'rotate-90' : ''}`} />
            </button>

            {showPasswordForm && (
              <div className="mt-4 space-y-3" style={{ animation: 'fadeInUp 0.2s ease both' }}>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Mot de passe actuel"
                    value={passwords.current}
                    onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                    className={`${theme.inputBase} pr-10`}
                    style={theme.inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Nouveau mot de passe (8 caractères min.)"
                  value={passwords.nouveau}
                  onChange={e => setPasswords(p => ({ ...p, nouveau: e.target.value }))}
                  className={theme.inputBase}
                  style={theme.inputStyle}
                />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Confirmer le nouveau mot de passe"
                  value={passwords.confirm}
                  onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  className={theme.inputBase}
                  style={theme.inputStyle}
                />
                <button
                  onClick={changerMotDePasse}
                  disabled={savingPwd}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', opacity: savingPwd ? 0.6 : 1 }}
                >
                  {savingPwd ? 'Modification…' : 'Changer le mot de passe'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Légal ─────────────────────────────────────────────────── */}
        <div
          className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 mb-5"
          style={{ animation: 'fadeInUp 0.35s ease 0.15s both' }}
        >
          <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Shield size={15} className="text-violet-400" />
            Légal &amp; données
          </h2>
          <div className="space-y-0.5">
            {[
              { href: '/cgu',              label: "Conditions générales d'utilisation" },
              { href: '/cgv',              label: 'Conditions générales de vente' },
              { href: '/confidentialite',  label: 'Politique de confidentialité' },
              { href: '/mentions-legales', label: 'Mentions légales' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between py-2.5 text-white/50 hover:text-white text-sm transition-colors"
              >
                {item.label}
                <ChevronRight size={14} className="text-white/20" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Zone danger ──────────────────────────────────────────── */}
        <div
          className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5"
          style={{ animation: 'fadeInUp 0.35s ease 0.20s both' }}
        >
          <h2 className="text-red-400 font-semibold text-sm mb-4 flex items-center gap-2">
            <AlertTriangle size={15} />
            Zone de danger
          </h2>
          <button
            onClick={() => {
              if (confirm('Êtes-vous sûr(e) de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                toast.error('Contactez le support : support@mariesausecondregard.com')
              }
            }}
            className="w-full py-3 text-sm text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            Supprimer mon compte
          </button>
        </div>

        <style jsx global>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* ── Mobile bottom nav ────────────────────────────────────── */}
        <nav className="fixed bottom-0 left-0 right-0 flex md:hidden z-50" style={{ background: '#080615', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
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
                className="flex-1 flex flex-col items-center py-3 gap-1 text-[10px] text-white/30"
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
