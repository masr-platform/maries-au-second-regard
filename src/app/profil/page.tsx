'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Heart, MessageCircle, Bell, Settings, LogOut,
  TrendingUp, CheckCircle2, Clock, Edit3, MapPin,
  Camera, Shield, BookOpen, Star, Sparkles, Crown,
  Zap, Award, Lock, ChevronRight, Upload, X, ImagePlus,
  Eye, EyeOff, ToggleLeft, ToggleRight, Key, AlertCircle,
  Video, Phone, Mail, AlertTriangle, Calendar,
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

const MAX_PHOTOS = 3

interface ProfilData {
  id:                     string
  prenom:                 string
  email:                  string
  genre:                  string
  ville:                  string | null
  pays:                   string
  plan:                   string
  photoUrl:               string | null
  photos:                 string[]
  photoPublique:          boolean
  questionnaireCompleted: boolean
  profileCompleted:       boolean
  isVerified:             boolean
  waliEnabled:            boolean
  waliEmail:              string | null
  waliNom:                string | null
  phone:                  string | null
  createdAt:              string
  lastActiveAt:           string | null
}

/* ── Couleurs selon le genre ───────────────────────────── */
function useGenreTheme(genre: string | undefined) {
  const isHomme = genre === 'HOMME'
  if (isHomme) {
    return {
      heroBg:       'from-blue-900/60 via-indigo-900/40 to-cyan-900/30',
      heroBorder:   'border-blue-500/30',
      avatarRing:   'ring-4 ring-blue-500/50 shadow-lg shadow-blue-500/30',
      avatarBg:     'bg-gradient-to-br from-blue-600/40 to-cyan-500/30',
      avatarColor:  'text-blue-300',
      accent:       'text-blue-400',
      accentHover:  'hover:text-blue-300',
      accentBg:     'bg-blue-500/15',
      accentBorder: 'border-blue-500/30',
      iconBg:       'bg-gradient-to-br from-blue-600 to-cyan-500',
      badgeBg:      'bg-blue-500/20 border border-blue-400/30',
      badgeText:    'text-blue-300',
      progressBar:  'bg-gradient-to-r from-blue-500 to-cyan-400',
      cameraBtn:    'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40 text-blue-400',
      symbol:       '♂',
      label:        'Homme',
      sidebarActive:'bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-blue-400 border border-blue-500/30',
      ctaGradient:  'from-blue-500 to-cyan-500',
      glow:         'shadow-blue-500/20',
    }
  }
  return {
    heroBg:       'from-fuchsia-900/60 via-pink-900/40 to-rose-900/30',
    heroBorder:   'border-fuchsia-500/30',
    avatarRing:   'ring-4 ring-fuchsia-500/50 shadow-lg shadow-fuchsia-500/30',
    avatarBg:     'bg-gradient-to-br from-fuchsia-600/40 to-pink-500/30',
    avatarColor:  'text-fuchsia-300',
    accent:       'text-fuchsia-400',
    accentHover:  'hover:text-fuchsia-300',
    accentBg:     'bg-fuchsia-500/15',
    accentBorder: 'border-fuchsia-500/30',
    iconBg:       'bg-gradient-to-br from-fuchsia-500 to-pink-500',
    badgeBg:      'bg-fuchsia-500/20 border border-fuchsia-400/30',
    badgeText:    'text-fuchsia-300',
    progressBar:  'bg-gradient-to-r from-fuchsia-500 to-pink-400',
    cameraBtn:    'bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border-fuchsia-500/40 text-fuchsia-400',
    symbol:       '♀',
    label:        'Femme',
    sidebarActive:'bg-gradient-to-r from-fuchsia-500/20 to-pink-500/10 text-fuchsia-400 border border-fuchsia-500/30',
    ctaGradient:  'from-fuchsia-500 to-pink-500',
    glow:         'shadow-fuchsia-500/20',
  }
}

export default function ProfilPage() {
  const { data: session, status, update } = useSession()
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [profil,         setProfil]         = useState<ProfilData | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [editMode,       setEditMode]       = useState(false)
  const [editData,       setEditData]       = useState({ prenom: '', ville: '' })
  const [saving,         setSaving]         = useState(false)
  const [photos,         setPhotos]         = useState<string[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [savingToggle,   setSavingToggle]   = useState(false)
  const [waliEnabled,    setWaliEnabled]    = useState(false)
  const [waliEmail,      setWaliEmail]      = useState('')
  const [waliNom,        setWaliNom]        = useState('')
  const [savingWali,     setSavingWali]     = useState(false)
  const [photoPublique,  setPhotoPublique]  = useState(true)
  const [showPwdForm,    setShowPwdForm]    = useState(false)
  const [pwdData,        setPwdData]        = useState({ current: '', nouveau: '', confirm: '' })
  const [showPwd,        setShowPwd]        = useState(false)
  const [savingPwd,      setSavingPwd]      = useState(false)
  const [activePhoto,    setActivePhoto]    = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/connexion')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') chargerProfil()
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Retour depuis Stripe
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('paiement') === 'succes') {
      window.history.replaceState({}, '', '/profil')
      update().then(() => {
        setTimeout(() => {
          chargerProfil()
          toast.success('🎉 Abonnement activé ! Bienvenue dans Mariés au Second Regard.')
        }, 1500)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const chargerProfil = async () => {
    try {
      const res = await fetch('/api/profil')
      if (res.ok) {
        const data = await res.json()
        setProfil(data.profil)
        setEditData({ prenom: data.profil.prenom, ville: data.profil.ville || '' })
        setPhotos(data.profil.photos || [])
        setWaliEnabled(data.profil.waliEnabled ?? false)
        setWaliEmail(data.profil.waliEmail || '')
        setWaliNom(data.profil.waliNom || '')
        setPhotoPublique(data.profil.photoPublique ?? true)
        setActivePhoto(data.profil.photoUrl || null)
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

  const sauvegarderToggle = async (champ: string, valeur: boolean) => {
    setSavingToggle(true)
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
      setSavingToggle(false)
    }
  }

  // ── Sauvegarde wali ──────────────────────────────────────────────
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
      else toast.error('Erreur lors de la mise à jour')
    } catch { toast.error('Erreur réseau') }
    finally { setSavingWali(false) }
  }

  // ── Upload photo ─────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (photos.length >= MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos autorisées`)
      return
    }
    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('photo', file)
    try {
      const res  = await fetch('/api/upload/photo', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur upload')
      } else {
        setPhotos(prev => [...prev, data.url])
        if (!activePhoto) setActivePhoto(data.url)
        toast.success('Photo ajoutée !')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setUploadingPhoto(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // ── Supprimer photo ──────────────────────────────────────────────
  const removePhoto = async (url: string) => {
    try {
      await fetch('/api/upload/photo', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url }),
      })
      setPhotos(prev => prev.filter(p => p !== url))
      if (activePhoto === url) setActivePhoto(photos.find(p => p !== url) || null)
      toast.success('Photo supprimée')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  // ── Changer mot de passe ─────────────────────────────────────────
  const changerMotDePasse = async () => {
    if (pwdData.nouveau.length < 8) {
      toast.error('Le mot de passe doit faire au moins 8 caractères')
      return
    }
    if (pwdData.nouveau !== pwdData.confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    setSavingPwd(true)
    try {
      const res = await fetch('/api/users/change-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ currentPassword: pwdData.current, newPassword: pwdData.nouveau }),
      })
      if (res.ok) {
        toast.success('Mot de passe modifié avec succès !')
        setShowPwdForm(false)
        setPwdData({ current: '', nouveau: '', confirm: '' })
      } else {
        const d = await res.json()
        toast.error(d.error || 'Mot de passe actuel incorrect')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setSavingPwd(false)
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

  const badge      = planBadge[profil?.plan ?? 'GRATUIT'] ?? planBadge.GRATUIT
  const memberSince = profil?.createdAt
    ? new Date(profil.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : '—'

  const steps = [
    { done: profil?.questionnaireCompleted ?? false, label: 'Questionnaire de compatibilité', href: '/questionnaire' },
    { done: photos.length > 0,                       label: 'Photo de profil',                href: null },
    { done: profil?.isVerified ?? false,              label: 'Profil vérifié par MASR',        href: null },
  ]
  const progression = Math.round((steps.filter(s => s.done).length / steps.length) * 100)

  return (
    <div className="min-h-screen bg-[#060412]">

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0d0a1f] border-r border-white/8 flex-col hidden md:flex">
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

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/tableau-de-bord', icon: Heart,         label: 'Mes matchs',    color: 'text-pink-400'    },
            { href: '/messages',        icon: MessageCircle, label: 'Messages',       color: 'text-violet-400'  },
            { href: '/notifications',   icon: Bell,          label: 'Notifications',  color: 'text-amber-400'   },
            { href: '/profil',          icon: User,          label: 'Mon profil',     color: theme.accent, active: true },
            { href: '/abonnement',      icon: Crown,         label: 'Abonnement',     color: 'text-amber-400'   },
            { href: '/parametres',      icon: Settings,      label: 'Paramètres',     color: 'text-slate-400'   },
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

      {/* ── Contenu principal ────────────────────────────────────────────── */}
      <main className="md:ml-64 p-5 md:p-8 max-w-2xl">

        {/* ═══════════════════════════════════════════════════
            HERO — Avatar + Identité + Edit
        ═══════════════════════════════════════════════════ */}
        <div
          className={`relative rounded-3xl overflow-hidden mb-5 border ${theme.heroBorder}`}
          style={{ animation: 'fadeInUp 0.35s ease both' }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.heroBg}`} />
          <div className="absolute inset-0 bg-[#0d0a1f]/60" />

          <div className="relative p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${theme.badgeBg} ${theme.badgeText}`}>
                  {theme.symbol} {theme.label}
                </span>
                {profil?.isVerified && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center gap-1">
                    <Shield size={10} /> Vérifié
                  </span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${badge.bg} ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className={`flex items-center gap-1.5 text-xs font-medium ${theme.accent} ${theme.accentBg} border ${theme.accentBorder} px-3 py-1.5 rounded-lg ${theme.accentHover} transition-all`}
                >
                  <Edit3 size={12} /> Modifier
                </button>
              )}
            </div>

            <div className="flex items-end gap-5">
              {/* Avatar + upload photo rapide */}
              <div className="relative flex-shrink-0">
                <div className={`w-24 h-24 rounded-2xl ${theme.avatarBg} ${theme.avatarRing} flex items-center justify-center overflow-hidden`}>
                  {activePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activePhoto} alt={profil?.prenom} className="w-full h-full object-cover" />
                  ) : (
                    <User size={36} className={theme.avatarColor} />
                  )}
                </div>
                {/* Bouton camera FONCTIONNEL */}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingPhoto || photos.length >= MAX_PHOTOS}
                  className={`absolute -bottom-2 -right-2 w-8 h-8 ${theme.cameraBtn} border rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-40`}
                  title={photos.length >= MAX_PHOTOS ? 'Maximum 3 photos atteint' : 'Ajouter une photo'}
                >
                  {uploadingPhoto
                    ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    : <Camera size={13} />
                  }
                </button>
                {/* Miniatures si plusieurs photos */}
                {photos.length > 1 && (
                  <div className="flex gap-1 mt-3">
                    {photos.slice(0, 3).map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePhoto(p)}
                        className="w-6 h-6 rounded overflow-hidden transition-transform hover:scale-110"
                        style={{ border: activePhoto === p ? `1.5px solid ${theme.accent.replace('text-', '#')}` : '1.5px solid rgba(255,255,255,0.1)' }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Infos / mode edit */}
              <div className="flex-1">
                {editMode ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Prénom</label>
                      <input
                        type="text"
                        value={editData.prenom}
                        onChange={(e) => setEditData(d => ({ ...d, prenom: e.target.value }))}
                        className={`w-full bg-white/5 border ${theme.accentBorder} rounded-xl px-3 py-2 text-white text-sm focus:border-current focus:outline-none`}
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
                        onClick={sauvegarder} disabled={saving}
                        className={`text-sm px-4 py-2 rounded-xl bg-gradient-to-r ${theme.ctaGradient} text-white font-semibold disabled:opacity-50`}
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
                      <div className="flex items-center gap-1.5 text-white/40 text-xs mb-2">
                        <MapPin size={11} className={theme.accent} />
                        {profil.ville}{profil.pays && profil.pays !== 'France' ? `, ${profil.pays}` : ''}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-white/30">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> Membre depuis {memberSince}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            MES PHOTOS — gestion complète
        ═══════════════════════════════════════════════════ */}
        <div
          className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 mb-5"
          style={{ animation: 'fadeInUp 0.35s ease 0.04s both' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Camera size={15} className={theme.accent} />
              Mes photos
            </h3>
            <span className="text-xs text-white/30">{photos.length}/{MAX_PHOTOS} photos</span>
          </div>

          {/* Confidentialité photos */}
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <Eye size={12} style={{ color: '#D4AF37', flexShrink: 0 }} />
            <p className="text-xs flex-1" style={{ color: 'rgba(212,175,55,0.8)' }}>
              Photos visibles uniquement après compatibilité confirmée
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Photos existantes */}
            {photos.map((url, i) => (
              <div key={url} className="relative aspect-square rounded-xl overflow-hidden group"
                style={{ border: activePhoto === url ? `2px solid ${i === 0 ? '#D4AF37' : 'rgba(255,255,255,0.3)'}` : '1.5px solid rgba(255,255,255,0.08)', background: '#111' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover cursor-pointer" onClick={() => setActivePhoto(url)} />
                {i === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1">
                    <p className="text-[9px] text-center text-white/70">Principale</p>
                  </div>
                )}
                <button
                  onClick={() => removePhoto(url)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                >
                  <X size={11} className="text-white" />
                </button>
              </div>
            ))}

            {/* Slots vides */}
            {Array.from({ length: MAX_PHOTOS - photos.length }).map((_, i) => (
              <button
                key={`slot-${i}`}
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all hover:border-white/25 hover:bg-white/5 disabled:opacity-40"
                style={{ border: '1.5px dashed rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
              >
                {uploadingPhoto && photos.length === MAX_PHOTOS - (i + 1) ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ImagePlus size={20} style={{ color: 'rgba(255,255,255,0.2)' }} />
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Ajouter</span>
                  </>
                )}
              </button>
            ))}
          </div>

          {photos.length < MAX_PHOTOS && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              className="w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              style={{ border: `1.5px dashed ${theme.accent.replace('text-', 'rgba(') + '/0.4)'}`, background: theme.accentBg.replace('bg-', '').includes('fuchsia') ? 'rgba(217,70,239,0.04)' : 'rgba(59,130,246,0.04)', color: 'rgba(255,255,255,0.5)' }}
            >
              <Upload size={14} />
              {uploadingPhoto ? 'Upload en cours…' : 'Choisir une photo (JPEG, PNG — 5 Mo max)'}
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* ═══════════════════════════════════════════════════
            ABONNEMENT
        ═══════════════════════════════════════════════════ */}
        <div
          className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 mb-5"
          style={{ animation: 'fadeInUp 0.35s ease 0.08s both' }}
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

        {/* ═══════════════════════════════════════════════════
            ACCÈS RAPIDE — Raccourcis vers les fonctionnalités
        ═══════════════════════════════════════════════════ */}
        <div
          className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 mb-5"
          style={{ animation: 'fadeInUp 0.35s ease 0.11s both' }}
        >
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Sparkles size={15} className={theme.accent} />
            Accès rapide
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                href: '/tableau-de-bord',
                icon: Heart,
                label: 'Mes matchs',
                desc: 'Voir mes compatibilités',
                color: 'text-pink-400',
                bg: 'bg-pink-500/10',
                border: 'border-pink-500/20',
              },
              {
                href: '/messages',
                icon: MessageCircle,
                label: 'Messages',
                desc: 'Conversations actives',
                color: 'text-violet-400',
                bg: 'bg-violet-500/10',
                border: 'border-violet-500/20',
              },
              {
                href: '/mouqabala',
                icon: Video,
                label: 'Sessions',
                desc: 'Rencontre avec imam',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
              },
              {
                href: '/questionnaire',
                icon: BookOpen,
                label: 'Questionnaire',
                desc: profil?.questionnaireCompleted ? 'Complété ✓' : 'À remplir',
                color: profil?.questionnaireCompleted ? 'text-amber-400' : 'text-red-400',
                bg: profil?.questionnaireCompleted ? 'bg-amber-500/10' : 'bg-red-500/10',
                border: profil?.questionnaireCompleted ? 'border-amber-500/20' : 'border-red-500/20',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] ${item.bg} border ${item.border}`}
                >
                  <div className={`p-2 rounded-lg bg-white/5`}>
                    <Icon size={16} className={item.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold">{item.label}</p>
                    <p className="text-white/40 text-[10px] truncate">{item.desc}</p>
                  </div>
                  <ChevronRight size={12} className="text-white/20 shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            AVANCEMENT DU PROFIL
        ═══════════════════════════════════════════════════ */}
        <div
          className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 mb-5"
          style={{ animation: 'fadeInUp 0.35s ease 0.14s both' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <TrendingUp size={15} className={theme.accent} />
              Avancement du profil
            </h3>
            <span className={`text-xs font-bold ${theme.accent}`}>{progression}%</span>
          </div>

          <div className="h-2 bg-white/8 rounded-full mb-5 overflow-hidden">
            <div
              className={`h-full rounded-full ${theme.progressBar} shadow-sm`}
              style={{ width: `${progression}%`, transition: 'width 0.8s ease 0.3s' }}
            />
          </div>

          <div className="space-y-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  step.done ? `${theme.accentBg} border ${theme.accentBorder}` : 'bg-white/4 border border-white/6'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.done ? `bg-gradient-to-br ${theme.ctaGradient} shadow-sm` : 'bg-white/10'
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
                {!step.done && !step.href && i === 1 && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className={`text-xs font-semibold ${theme.accent} ${theme.accentHover} flex items-center gap-0.5`}
                  >
                    Ajouter <ChevronRight size={11} />
                  </button>
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

        {/* ═══════════════════════════════════════════════════
            CONFIDENTIALITÉ — Toggles inline
        ═══════════════════════════════════════════════════ */}
        <div
          className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 mb-5"
          style={{ animation: 'fadeInUp 0.35s ease 0.17s both' }}
        >
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Eye size={15} className="text-violet-400" />
            Confidentialité
          </h3>

          {/* Photo visible */}
          <div className="flex items-center justify-between py-3 border-b border-white/6">
            <div>
              <p className="text-white text-sm font-medium">Photo visible par mes matchs</p>
              <p className="text-white/30 text-xs mt-0.5">Vos matchs voient votre photo après compatibilité</p>
            </div>
            <button
              onClick={() => {
                const next = !photoPublique
                setPhotoPublique(next)
                sauvegarderToggle('photoPublique', next)
              }}
              disabled={savingToggle}
              className="text-white/40 hover:text-white transition-colors"
            >
              {photoPublique
                ? <ToggleRight size={28} className={theme.accent} />
                : <ToggleLeft size={28} className="text-white/20" />
              }
            </button>
          </div>

          {/* Mode Wali */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-white text-sm font-medium">Mode Wali</p>
              <p className="text-white/30 text-xs mt-0.5">Un tiers de confiance suit vos échanges</p>
            </div>
            <button
              onClick={() => {
                const next = !waliEnabled
                setWaliEnabled(next)
                sauvegarderToggle('waliEnabled', next)
              }}
              disabled={savingToggle}
              className="transition-colors"
            >
              {waliEnabled
                ? <ToggleRight size={28} className={theme.accent} />
                : <ToggleLeft size={28} className="text-white/20" />
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
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
              />
              <input
                type="email"
                placeholder="Email du wali *"
                value={waliEmail}
                onChange={e => setWaliEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
              />
              <button
                onClick={sauvegarderWali}
                disabled={savingWali}
                className="w-full py-2 rounded-xl text-sm font-medium text-white transition-opacity"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', opacity: savingWali ? 0.6 : 1 }}
              >
                {savingWali ? 'Enregistrement…' : 'Enregistrer le wali'}
              </button>
              <p className="text-xs text-white/30 text-center">Le wali recevra un email de notification pour confirmer</p>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
            COMPTE & SÉCURITÉ — Section complète + actions
        ═══════════════════════════════════════════════════ */}
        <div
          className="bg-[#0d0a1f] border border-white/8 rounded-2xl p-5 mb-5"
          style={{ animation: 'fadeInUp 0.35s ease 0.20s both' }}
        >
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Lock size={15} className="text-violet-400" />
            Compte &amp; sécurité
          </h3>

          {/* Infos clés */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/6">
              <Mail size={14} className="text-violet-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40">E-mail</p>
                <p className="text-sm text-white font-medium truncate">{profil?.email}</p>
              </div>
              <span className="text-[10px] text-white/20 shrink-0">Non modifiable</span>
            </div>

            {profil?.phone && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/6">
                <Phone size={14} className="text-violet-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/40">Téléphone</p>
                  <p className="text-sm text-white font-medium">{profil.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/6">
              <Shield size={14} className={profil?.isVerified ? 'text-emerald-400' : 'text-amber-400'} />
              <div className="flex-1">
                <p className="text-xs text-white/40">Statut du compte</p>
                <p className={`text-sm font-semibold ${profil?.isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {profil?.isVerified ? '✓ Vérifié par MASR' : '⏳ En attente de vérification'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Changer le mot de passe ── */}
          <div className="border-t border-white/6 pt-4">
            <button
              onClick={() => setShowPwdForm(v => !v)}
              className="flex items-center justify-between w-full p-3 rounded-xl transition-all hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <Key size={14} className="text-violet-400" />
                <div className="text-left">
                  <p className="text-sm text-white font-medium">Changer le mot de passe</p>
                  <p className="text-xs text-white/30">Sécurisez votre compte</p>
                </div>
              </div>
              <ChevronRight size={15} className={`text-white/20 transition-transform ${showPwdForm ? 'rotate-90' : ''}`} />
            </button>

            {showPwdForm && (
              <div className="mt-3 space-y-3 px-1" style={{ animation: 'fadeIn 0.2s ease' }}>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Mot de passe actuel"
                    value={pwdData.current}
                    onChange={(e) => setPwdData(p => ({ ...p, current: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-violet-500/50 focus:outline-none placeholder-white/20 pr-10"
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Nouveau mot de passe (8 caractères min.)"
                  value={pwdData.nouveau}
                  onChange={(e) => setPwdData(p => ({ ...p, nouveau: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-violet-500/50 focus:outline-none placeholder-white/20"
                />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Confirmer le nouveau mot de passe"
                  value={pwdData.confirm}
                  onChange={(e) => setPwdData(p => ({ ...p, confirm: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-violet-500/50 focus:outline-none placeholder-white/20"
                />
                {pwdData.nouveau && pwdData.confirm && pwdData.nouveau !== pwdData.confirm && (
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle size={12} /> Les mots de passe ne correspondent pas
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={changerMotDePasse} disabled={savingPwd}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white disabled:opacity-40 transition-opacity"
                  >
                    {savingPwd ? 'Modification…' : 'Confirmer'}
                  </button>
                  <button
                    onClick={() => { setShowPwdForm(false); setPwdData({ current: '', nouveau: '', confirm: '' }) }}
                    className="px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white border border-white/10 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Liens paramètres & légal ── */}
          <div className="mt-4 pt-4 border-t border-white/6 space-y-1">
            {[
              { href: '/parametres', icon: Settings, label: 'Tous les paramètres',          desc: 'Notifications, Wali, préférences avancées' },
              { href: '/cgu',        icon: Shield,   label: 'Conditions d\'utilisation',    desc: 'CGU & CGV' },
              { href: '/confidentialite', icon: Eye, label: 'Politique de confidentialité', desc: 'RGPD & données personnelles' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5">
                  <Icon size={14} className="text-white/30 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/70">{item.label}</p>
                    <p className="text-xs text-white/25 truncate">{item.desc}</p>
                  </div>
                  <ChevronRight size={12} className="text-white/15 shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            ZONE DANGER — Suppression compte
        ═══════════════════════════════════════════════════ */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', animation: 'fadeInUp 0.35s ease 0.23s both' }}
        >
          <h3 className="text-red-400 font-semibold text-sm mb-4 flex items-center gap-2">
            <AlertTriangle size={15} />
            Zone de danger
          </h3>
          <p className="text-xs text-white/30 mb-4">
            La suppression de votre compte est définitive. Toutes vos données, matchs et conversations seront effacés.
          </p>
          <button
            onClick={() => {
              if (confirm('Êtes-vous sûr(e) de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues.')) {
                toast.error('Pour supprimer votre compte, contactez-nous : support@mariesausecondregard.com')
              }
            }}
            className="w-full py-3 text-sm font-semibold text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            Supprimer mon compte
          </button>
        </div>

        {/* ── Mobile bottom nav ─────────────────────────────────────── */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0d0a1f] border-t border-white/8 flex md:hidden z-50 pb-safe">
          {[
            { href: '/tableau-de-bord', icon: Heart,         label: 'Matchs',   color: 'text-pink-400'   },
            { href: '/messages',        icon: MessageCircle, label: 'Messages', color: 'text-violet-400' },
            { href: '/notifications',   icon: Bell,          label: 'Notifs',   color: 'text-amber-400'  },
            { href: '/profil',          icon: User,          label: 'Profil',   color: theme.accent, active: true },
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
