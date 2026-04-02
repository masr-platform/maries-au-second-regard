'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Heart, MessageCircle, Bell, Settings, LogOut,
  TrendingUp, CheckCircle2, Clock, Edit3, MapPin,
  Camera, Shield, BookOpen, Star, Sparkles, Crown,
  Zap, Award, Lock, ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

const planLabel: Record<string, string> = {
  GRATUIT:  '1 profil/semaine',
  STANDARD: '1 profil/semaine',
  BASIQUE:  '3 profils/mois',
  PREMIUM:  '2 profils/semaine',
  ULTRA:    'Profils illimités',
}

const planBadge: Record<string, { label: string; color: string; bg: string; gradient: string }> = {
  GRATUIT:  { label: 'Gratuit',   color: 'text-slate-400',  bg: 'bg-slate-700/50',    gradient: 'from-slate-600 to-slate-500' },
  STANDARD: { label: 'Essentiel', color: 'text-amber-400',  bg: 'bg-amber-500/15',    gradient: 'from-amber-500 to-yellow-400' },
  BASIQUE:  { label: 'Essentiel', color: 'text-amber-400',  bg: 'bg-amber-500/15',    gradient: 'from-amber-500 to-yellow-400' },
  PREMIUM:  { label: 'Premium',   color: 'text-purple-400', bg: 'bg-purple-500/15',   gradient: 'from-purple-500 to-fuchsia-500' },
  ULTRA:    { label: 'Élite',     color: 'text-cyan-400',   bg: 'bg-cyan-500/15',     gradient: 'from-cyan-400 to-blue-500' },
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

/* ── Couleurs selon le genre ───────────────────────────── */
function useGenreTheme(genre: string | undefined) {
  const isHomme = genre === 'HOMME'
  if (isHomme) {
    return {
      heroBg:      'from-blue-900/60 via-indigo-900/40 to-cyan-900/30',
      heroBorder:  'border-blue-500/30',
      avatarRing:  'ring-4 ring-blue-500/50 shadow-lg shadow-blue-500/30',
      avatarBg:    'bg-gradient-to-br from-blue-600/40 to-cyan-500/30',
      avatarColor: 'text-blue-300',
      accent:      'text-blue-400',
      accentHover: 'hover:text-blue-300',
      accentBg:    'bg-blue-500/15',
      accentBorder:'border-blue-500/30',
      iconBg:      'bg-gradient-to-br from-blue-600 to-cyan-500',
      badgeBg:     'bg-blue-500/20 border border-blue-400/30',
      badgeText:   'text-blue-300',
      progressBar: 'bg-gradient-to-r from-blue-500 to-cyan-400',
      cameraBtn:   'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40 text-blue-400',
      symbol:      '♂',
      label:       'Homme',
      sidebarActive:'bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-blue-400 border border-blue-500/30',
      sidebarGlow: 'shadow-blue-500/20',
      ctaGradient: 'from-blue-500 to-cyan-500',
      glow:        'shadow-blue-500/20',
    }
  }
  return {
    heroBg:      'from-fuchsia-900/60 via-pink-900/40 to-rose-900/30',
    heroBorder:  'border-fuchsia-500/30',
    avatarRing:  'ring-4 ring-fuchsia-500/50 shadow-lg shadow-fuchsia-500/30',
    avatarBg:    'bg-gradient-to-br from-fuchsia-600/40 to-pink-500/30',
    avatarColor: 'text-fuchsia-300',
    accent:      'text-fuchsia-400',
    accentHover: 'hover:text-fuchsia-300',
    accentBg:    'bg-fuchsia-500/15',
    accentBorder:'border-fuchsia-500/30',
    iconBg:      'bg-gradient-to-br from-fuchsia-500 to-pink-500',
    badgeBg:     'bg-fuchsia-500/20 border border-fuchsia-400/30',
    badgeText:   'text-fuchsia-300',
    progressBar: 'bg-gradient-to-r from-fuchsia-500 to-pink-400',
    cameraBtn:   'bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border-fuchsia-500/40 text-fuchsia-400',
    symbol:      '♀',
    label:       'Femme',
    sidebarActive:'bg-gradient-to-r from-fuchsia-500/20 to-pink-500/10 text-fuchsia-400 border border-fuchsia-500/30',
    sidebarGlow: 'shadow-fuchsia-500/20',
    ctaGradient: 'from-fuchsia-500 to-pink-500',
    glow:        'shadow-fuchsia-500/20',
  }
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

  const theme = useGenreTheme(profil?.genre)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#060412] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Chargement du profil…</p>
        </div>
      </div>
    )
  }

  const badge = planBadge[profil?.plan ?? 'GRATUIT'] ?? planBadge.GRATUIT
  const memberSince = profil?.createdAt
    ? new Date(profil.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : '—'

  /* progression */
  const steps = [
    { done: profil?.questionnaireCompleted ?? false, label: 'Questionnaire de compatibilité', href: '/questionnaire' },
    { done: !!(profil?.photoUrl),                   label: 'Photo de profil',                href: null },
    { done: profil?.isVerified ?? false,             label: 'Profil vérifié par MASR',        href: null },
  ]
  const progression = Math.round((steps.filter(s => s.done).length / steps.length) * 100)

  return (
    <div className="min-h-screen bg-[#060412]">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0d0a1f] border-r border-white/8 flex-col hidden md:flex">
        {/* Logo */}
        <div className="p-6 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
              <span className="text-white font-serif font-bold text-sm">M</span>
            </div>
            <div>
              <p className="text-white font-serif text-sm font-semibold">MASR</p>
              <p className="text-white/40 text-xs">{planLabel[session?.user?.plan as string] || '—'}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/tableau-de-bord', icon: Heart,         label: 'Mes matchs',   color: 'text-pink-400' },
            { href: '/messages',        icon: MessageCircle, label: 'Messages',      color: 'text-violet-400' },
            { href: '/notifications',   icon: Bell,          label: 'Notifications', color: 'text-amber-400' },
            { href: '/profil',          icon: User,          label: 'Mon profil',    color: theme.accent, active: true },
            { href: '/abonnement',      icon: Crown,         label: 'Abonnement',    color: 'text-amber-400' },
            { href: '/parametres',      icon: Settings,      label: 'Paramètres',    color: 'text-slate-400' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  item.active
                    ? theme.sidebarActive
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${item.active ? theme.accentBg : 'bg-white/5'}`}>
                  <Icon size={15} className={item.active ? item.color : 'text-white/50'} />
                </div>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-3 mb-3 p-2.5 rounded-xl bg-white/5">
            <div className={`w-8 h-8 rounded-lg ${theme.accentBg} flex items-center justify-center`}>
              <span className={`${theme.accent} text-sm font-semibold`}>
                {session?.user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{session?.user?.name}</p>
              <p className="text-white/40 text-xs truncate">{session?.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 text-white/40 hover:text-red-400 text-sm w-full px-2 transition-colors"
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu ─────────────────────────────────────────────────────── */}
      <main className="md:ml-64 p-5 md:p-8 max-w-2xl">

        {/* ── Hero profil ───────────────────────────────────────────── */}
        <div
          className={`relative rounded-3xl overflow-hidden mb-5 border ${theme.heroBorder}`}
          style={{ animation: 'fadeInUp 0.35s ease both' }}
        >
          {/* gradient bg */}
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.heroBg}`} />
          <div className="absolute inset-0 bg-[#0d0a1f]/60" />

          <div className="relative p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${theme.badgeBg} ${theme.badgeText}`}>
                  {theme.symbol} {theme.label}
                </span>
                {profil?.isVerified && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center gap-1">
                    <Shield size={10} /> Vérifié
                  </span>
                )}
              </div>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className={`flex items-center gap-1.5 text-xs font-medium ${theme.accent} ${theme.accentBg} border ${theme.accentBorder} px-3 py-1.5 rounded-lg ${theme.accentHover} transition-all`}
                >
                  <Edit3 size={12} />
                  Modifier
                </button>
              )}
            </div>

            <div className="flex items-end gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={`w-24 h-24 rounded-2xl ${theme.avatarBg} ${theme.avatarRing} flex items-center justify-center overflow-hidden`}>
                  {profil?.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profil.photoUrl} alt={profil.prenom} className="w-full h-full object-cover" />
                  ) : (
                    <User size={36} className={theme.avatarColor} />
                  )}
                </div>
                <button className={`absolute -bottom-2 -right-2 w-7 h-7 ${theme.cameraBtn} border rounded-full flex items-center justify-center transition-colors`}>
                  <Camera size={12} />
                </button>
              </div>

              {/* Infos / édit */}
              <div className="flex-1">
                {editMode ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Prénom</label>
                      <input
                        type="text"
                        value={editData.prenom}
                        onChange={(e) => setEditData(d => ({ ...d, prenom: e.target.value }))}
                        className={`w-full bg-white/5 border ${theme.accentBorder} rounded-xl px-3 py-2 text-white text-sm focus:border-current focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Ville</label>
                      <input
                        type="text"
                        value={editData.ville}
                        onChange={(e) => setEditData(d => ({ ...d, ville: e.target.value }))}
                        placeholder="Paris, Lyon, Marseille…"
                        className={`w-full bg-white/5 border ${theme.accentBorder} rounded-xl px-3 py-2 text-white text-sm focus:outline-none placeholder-white/20`}
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={sauvegarder}
                        disabled={saving}
                        className={`text-sm px-4 py-2 rounded-xl bg-gradient-to-r ${theme.ctaGradient} text-white font-semibold disabled:opacity-50 transition-opacity`}
                      >
                        {saving ? 'Sauvegarde…' : 'Sauvegarder'}
                      </button>
                      <button
                        onClick={() => { setEditMode(false); setEditData({ prenom: profil?.prenom || '', ville: profil?.ville || '' }) }}
                        className="text-sm text-white/40 hover:text-white px-4 py-2 border border-white/10 rounded-xl transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-serif font-bold text-white mb-0.5">{profil?.prenom}</h2>
                    <p className="text-white/50 text-sm mb-2">{profil?.email}</p>
                    {profil?.ville && (
                      <div className="flex items-center gap-1.5 text-white/40 text-xs mb-3">
                        <MapPin size={11} className={theme.accent} />
                        {profil.ville}
                      </div>
                    )}
                    <p className="text-white/40 text-xs">Membre depuis {memberSince}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Abonnement ───────────────────────────────────────────── */}
        <div
          className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 mb-5"
          style={{ animation: 'fadeInUp 0.35s ease 0.05s both' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${badge.gradient} shadow-lg`}>
                <Crown size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Plan {badge.label}</p>
                <p className="text-white/40 text-xs">{planLabel[profil?.plan ?? 'GRATUIT']}</p>
              </div>
            </div>
            <Link
              href="/abonnement"
              className={`text-xs font-semibold ${badge.color} ${badge.bg} px-3 py-1.5 rounded-lg flex items-center gap-1 hover:opacity-80 transition-opacity`}
            >
              Gérer <ChevronRight size={12} />
            </Link>
          </div>

          {(profil?.plan === 'GRATUIT' || profil?.plan === 'BASIQUE' || profil?.plan === 'STANDARD') && (
            <Link
              href="/abonnement"
              className="mt-4 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 rounded-xl shadow-lg shadow-fuchsia-500/20 hover:opacity-90 transition-opacity"
            >
              <Zap size={14} />
              Passer Premium — 2× plus de matchs
            </Link>
          )}
        </div>

        {/* ── Avancement ───────────────────────────────────────────── */}
        <div
          className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 mb-5"
          style={{ animation: 'fadeInUp 0.35s ease 0.1s both' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Sparkles size={15} className={theme.accent} />
              Avancement du profil
            </h3>
            <span className={`text-xs font-bold ${theme.accent}`}>{progression}%</span>
          </div>

          {/* Barre de progression */}
          <div className="h-2 bg-white/8 rounded-full mb-5 overflow-hidden">
            <div
              className={`h-full rounded-full ${theme.progressBar} shadow-sm`}
              style={{ width: `${progression}%`, transition: 'width 0.8s ease 0.3s' }}
            />
          </div>

          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                step.done ? `${theme.accentBg} border ${theme.accentBorder}` : 'bg-white/4 border border-white/6'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.done
                      ? `bg-gradient-to-br ${theme.ctaGradient} shadow-sm`
                      : 'bg-white/10'
                  }`}>
                    {step.done
                      ? <CheckCircle2 size={16} className="text-white" />
                      : <Clock size={16} className="text-white/30" />
                    }
                  </div>
                  <span className={`text-sm font-medium ${step.done ? 'text-white' : 'text-white/50'}`}>
                    {step.label}
                  </span>
                </div>
                {!step.done && step.href && (
                  <Link href={step.href} className={`text-xs font-semibold ${theme.accent} ${theme.accentHover} flex items-center gap-0.5`}>
                    Compléter <ChevronRight size={11} />
                  </Link>
                )}
              </div>
            ))}
          </div>

          {!profil?.questionnaireCompleted && (
            <div className={`mt-4 p-4 rounded-xl bg-gradient-to-r ${theme.heroBg} border ${theme.accentBorder}`}>
              <p className={`text-sm font-semibold ${theme.accent} flex items-center gap-2 mb-3`}>
                <Star size={14} className="flex-shrink-0 fill-current" />
                Complétez votre questionnaire pour recevoir vos premiers matchs !
              </p>
              <Link
                href="/questionnaire"
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r ${theme.ctaGradient} rounded-xl shadow-lg ${theme.glow} hover:opacity-90 transition-opacity`}
              >
                <BookOpen size={14} />
                Démarrer le questionnaire
              </Link>
            </div>
          )}
        </div>

        {/* ── Compte & sécurité ─────────────────────────────────────── */}
        <div
          className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 mb-5"
          style={{ animation: 'fadeInUp 0.35s ease 0.15s both' }}
        >
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Lock size={14} className="text-violet-400" />
            Compte &amp; sécurité
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Wali activé',         value: profil?.waliEnabled ? 'Oui' : 'Non',  icon: Shield,  color: profil?.waliEnabled ? 'text-emerald-400' : 'text-white/40' },
              { label: 'Profil complété',      value: profil?.profileCompleted ? 'Oui' : 'Non', icon: Award, color: profil?.profileCompleted ? 'text-amber-400' : 'text-white/40' },
              { label: 'Pays',                 value: profil?.pays || '—',                  icon: MapPin,  color: 'text-blue-400' },
            ].map((row, i) => {
              const Icon = row.icon
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-white/6">
                  <div className="flex items-center gap-3">
                    <Icon size={14} className={row.color} />
                    <span className="text-sm text-white/60">{row.label}</span>
                  </div>
                  <span className={`text-sm font-semibold ${row.color}`}>{row.value}</span>
                </div>
              )
            })}
          </div>
        </div>

        <style jsx global>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* ── Mobile bottom nav ─────────────────────────────────────── */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0d0a1f] border-t border-white/8 flex md:hidden z-50 pb-safe">
          {[
            { href: '/tableau-de-bord', icon: Heart,         label: 'Matchs',    color: 'text-pink-400'    },
            { href: '/messages',        icon: MessageCircle, label: 'Messages',  color: 'text-violet-400'  },
            { href: '/notifications',   icon: Bell,          label: 'Notifs',    color: 'text-amber-400'   },
            { href: '/profil',          icon: User,          label: 'Profil',    color: theme.accent, active: true },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center py-3 gap-1 text-[10px] font-medium transition-colors ${
                  item.active ? item.color : 'text-white/30 hover:text-white/60'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="pb-24 md:pb-0" />
      </main>
    </div>
  )
}
