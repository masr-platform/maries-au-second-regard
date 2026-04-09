'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      if (res.status === 429) {
        toast.error('Trop de tentatives. Réessayez dans une heure.')
        return
      }

      // Toujours afficher le message de succès (anti-énumération)
      setSent(true)
    } catch {
      toast.error('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-2xl font-serif font-bold text-white">Mot de passe oublié</h1>
          <p className="text-dark-300 text-sm mt-2">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <div className="card-dark">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-gold-500 mx-auto mb-4" />
              <h2 className="text-white font-semibold text-lg mb-2">Email envoyé</h2>
              <p className="text-dark-300 text-sm leading-relaxed">
                Si un compte est associé à <span className="text-gold-400">{email}</span>,
                vous recevrez un lien valable <strong className="text-white">1 heure</strong>.
              </p>
              <p className="text-dark-400 text-xs mt-3">
                Vérifiez vos spams si vous ne le recevez pas.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="label-gold">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="input-dark pl-10"
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="btn-gold w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                    Envoi en cours…
                  </span>
                ) : (
                  'Envoyer le lien'
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-dark-400 mt-6">
          <Link href="/connexion" className="inline-flex items-center gap-1 text-gold-400 hover:text-gold-300 transition-colors">
            <ArrowLeft size={14} />
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
