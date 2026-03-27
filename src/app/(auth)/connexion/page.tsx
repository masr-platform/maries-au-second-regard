'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ConnexionPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') || '/tableau-de-bord'

  const [email,   setEmail]   = useState('')
  const [pwd,     setPwd]     = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !pwd) return

    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password: pwd,
        redirect: false,
        callbackUrl,
      })

      if (res?.ok) {
        toast.success('Connexion réussie')
        router.push(callbackUrl)
        router.refresh()
      } else {
        toast.error('Email ou mot de passe incorrect.')
      }
    } catch {
      toast.error('Erreur réseau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full border border-gold-500 flex items-center justify-center">
              <span className="text-gold-500 text-xs font-serif font-bold">M</span>
            </div>
            <span className="font-serif text-white text-sm tracking-wide">MASR</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-white">Connexion</h1>
          <p className="text-dark-300 text-sm mt-2">Bon retour parmi nous</p>
        </div>

        <div className="card-dark">
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
                />
              </div>
            </div>

            <div>
              <label className="label-gold">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="input-dark pl-10 pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-white"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="/mot-de-passe-oublie" className="text-xs text-gold-400 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-dark-400 text-sm mt-4">
            Pas encore de compte ?{' '}
            <Link href="/inscription" className="text-gold-400 hover:underline font-medium">
              S&apos;inscrire gratuitement
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
