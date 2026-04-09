'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function ResetPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') || ''

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPwd,   setShowPwd]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)

  if (!token) {
    return (
      <div className="text-center py-6">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-white font-semibold text-lg mb-2">Lien invalide</h2>
        <p className="text-dark-300 text-sm">
          Ce lien de réinitialisation est invalide ou expiré.
        </p>
        <Link href="/forgot-password" className="btn-gold mt-6 inline-block text-sm px-6 py-2">
          Nouvelle demande
        </Link>
      </div>
    )
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirm) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      toast.error('Le mot de passe doit faire au moins 8 caractères.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/connexion'), 3000)
      } else if (res.status === 429) {
        toast.error('Trop de tentatives. Réessayez dans une heure.')
      } else {
        toast.error(data.error || 'Lien invalide ou expiré.')
      }
    } catch {
      toast.error('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <CheckCircle size={48} className="text-gold-500 mx-auto mb-4" />
        <h2 className="text-white font-semibold text-lg mb-2">Mot de passe modifié</h2>
        <p className="text-dark-300 text-sm">
          Votre mot de passe a été réinitialisé avec succès.
          <br />Redirection vers la connexion…
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label-gold">Nouveau mot de passe</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
          <input
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 caractères"
            className="input-dark pl-10 pr-10"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-white transition-colors"
            tabIndex={-1}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label className="label-gold">Confirmer le mot de passe</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
          <input
            type={showPwd ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Répétez le mot de passe"
            className="input-dark pl-10"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={loading}
          />
        </div>
        {confirm && password !== confirm && (
          <p className="text-red-400 text-xs mt-1">Les mots de passe ne correspondent pas.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !password || !confirm || password !== confirm}
        className="btn-gold w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
            Mise à jour…
          </span>
        ) : (
          'Réinitialiser le mot de passe'
        )}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10" style={{ animation: 'fadeInUp 0.4s ease both' }}>
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full border border-gold-500 flex items-center justify-center">
              <span className="text-gold-500 text-xs font-serif font-bold">M</span>
            </div>
            <span className="font-serif text-white text-sm tracking-wide">MASR</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-white">Nouveau mot de passe</h1>
          <p className="text-dark-300 text-sm mt-2">Choisissez un mot de passe sécurisé</p>
        </div>

        <div className="card-dark">
          <Suspense fallback={<div className="text-dark-300 text-sm text-center py-4">Chargement…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="text-center text-sm text-dark-400 mt-6">
          <Link href="/connexion" className="text-gold-400 hover:text-gold-300 transition-colors">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
