'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Heart, MessageCircle, Bell, User, Settings, LogOut,
  TrendingUp, Check, Zap, Star, Shield, ArrowRight,
  CreditCard, RefreshCw, AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

const planLabel: Record<string, string> = {
  GRATUIT:  'Accès limité',
  STANDARD: 'Accès limité',
  BASIQUE:  'Essentiel — 1 profil qualifié/semaine',
  PREMIUM:  'Premium — 1 profil qualifié/jour',
  ULTRA:    'Élite — 3 profils qualifiés/jour',
}

const PLANS = [
  {
    key: 'BASIQUE',
    nom: 'Essentiel',
    prix: '19,90',
    desc: 'Pour une démarche posée et sérieuse',
    color: 'border-white/15',
    badge: null,
    note: 'Une formule rythmée pour prendre le temps de vraiment connaître chaque profil proposé.',
    items: [
      '1 profil compatible proposé chaque semaine',
      'Profils 100% vérifiés et sélectionnés par notre IA',
      'Chat encadré avec 1 personne à la fois (pas de mélange)',
      '1 Mouqabala virtuelle par mois avec un imam',
      'Score de compatibilité détaillé sur 7 dimensions',
      'Support par email',
    ],
    ctaCls: 'border border-white/25 text-white hover:bg-white/5',
  },
  {
    key: 'PREMIUM',
    nom: 'Premium',
    prix: '29,90',
    desc: 'Le plus choisi — Recommandé',
    color: 'border-gold-500/50',
    badge: '⭐ Le plus choisi',
    note: 'Tout ce qu\'inclut l\'Essentiel, avec plus de profils et plus de liberté d\'échange.',
    items: [
      '1 profil compatible proposé chaque jour (×4 vs Essentiel)',
      'Profils 100% vérifiés et sélectionnés par notre IA',
      'Chat encadré avec plusieurs matchs en même temps',
      '3 Mouqabalas virtuelles par mois avec un imam',
      'Accès prioritaire aux nouveaux profils inscrits',
      'Score de compatibilité détaillé sur 7 dimensions',
      'Support prioritaire',
    ],
    ctaCls: 'bg-gold-500 text-black font-bold hover:bg-gold-400',
  },
  {
    key: 'ULTRA',
    nom: 'Élite',
    prix: '49,90',
    desc: 'Pour accélérer sérieusement',
    color: 'border-purple-500/40',
    badge: '💍 Maximum',
    note: 'Tout ce qu\'inclut le Premium, avec le maximum de visibilité et d\'accompagnement.',
    items: [
      '3 profils compatibles proposés chaque jour (×3 vs Premium)',
      'Profils 100% vérifiés et sélectionnés par notre IA',
      'Chat encadré avec plusieurs matchs en même temps',
      'Mouqabalas virtuelles illimitées avec un imam',
      'Votre profil mis en avant — vu en priorité par les autres membres',
      'Accès en avant-première aux nouveaux inscrits',
      'Score de compatibilité détaillé sur 7 dimensions',
      'Accompagnement personnalisé par notre équipe',
      'Support prioritaire',
    ],
    ctaCls: 'bg-purple-600 text-white font-bold hover:bg-purple-500',
  },
]

const PACKS = [
  { key: 'PACK_3', label: '+ 3 profils supplémentaires', prix: '9,90', emoji: '🔥' },
]

// ─── Stripe Payment Links (LIVE) ─────────────────────────────────────────────
const PAYMENT_LINKS: Record<string, string> = {
  BASIQUE: 'https://buy.stripe.com/5kQ28qcdTgpU5tTdWignK00',  // Essentiel 19,90€
  PREMIUM: 'https://buy.stripe.com/3cI14m7XDa1w2hH6tQgnK01',  // Premium   29,90€
  ULTRA:   'https://buy.stripe.com/3cIbJ06Tz7To9K905sgnK02',  // Élite     49,90€
}

export default function AbonnementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [loadingPack, setLoadingPack] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/connexion')
  }, [status, router])

  const souscire = (planKey: string) => {
    const url = PAYMENT_LINKS[planKey]
    if (!url) {
      toast.error('Lien de paiement introuvable')
      return
    }
    setLoadingPlan(planKey)
    window.location.href = url
  }

  const acheterPack = async (packKey: string) => {
    setLoadingPack(packKey)
    try {
      const res = await fetch('/api/stripe/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack: packKey }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Erreur lors de la création du paiement')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoadingPack(null)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentPlan = (session?.user?.plan as string) ?? 'GRATUIT'
  const isPaid = !['GRATUIT'].includes(currentPlan)

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
            { href: '/tableau-de-bord', icon: Heart,          label: 'Mes matchs' },
            { href: '/messages',        icon: MessageCircle,  label: 'Messages' },
            { href: '/notifications',   icon: Bell,           label: 'Notifications' },
            { href: '/profil',          icon: User,           label: 'Mon profil' },
            { href: '/abonnement',      icon: TrendingUp,     label: 'Abonnement', active: true },
            { href: '/parametres',      icon: Settings,       label: 'Paramètres' },
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
      <main className="md:ml-64 p-6 md:p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-white">Mon abonnement</h1>
          <p className="text-dark-300 text-sm mt-1">Gérez votre plan et vos crédits de profils</p>
        </div>

        {/* Plan actuel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800 border border-dark-700 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-sm">Plan actuel</h2>
            {isPaid && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <Check size={12} /> Actif
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
              <Star size={22} className="text-gold-400" />
            </div>
            <div>
              <p className="text-white font-bold text-lg capitalize">
                {currentPlan === 'STANDARD' ? 'Basique' : currentPlan.charAt(0) + currentPlan.slice(1).toLowerCase()}
              </p>
              <p className="text-dark-400 text-sm">{planLabel[currentPlan]}</p>
            </div>
          </div>

          {!isPaid && (
            <div className="mt-4 p-3 bg-gold-500/5 border border-gold-500/20 rounded-xl">
              <p className="text-gold-400 text-xs flex items-center gap-2">
                <AlertCircle size={13} />
                Passez Premium pour recevoir 2× plus de matchs et débloquer toutes les fonctionnalités.
              </p>
            </div>
          )}
        </motion.div>

        {/* Plans */}
        <h2 className="text-white font-semibold text-sm mb-4">Changer de plan</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {PLANS.map((plan, i) => {
            const isActive = currentPlan === plan.key || (plan.key === 'BASIQUE' && currentPlan === 'STANDARD')
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`relative bg-dark-800 border-2 ${plan.color} rounded-2xl p-5 flex flex-col ${isActive ? 'ring-1 ring-gold-500/40' : ''}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-black text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}
                {isActive && (
                  <div className="absolute -top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Actif
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-white font-serif font-bold text-lg">{plan.nom}</p>
                  <p className="text-dark-500 text-xs mb-2">{plan.desc}</p>
                  <div className="flex items-end gap-0.5">
                    <span className="text-2xl font-bold text-white">{plan.prix}€</span>
                    <span className="text-dark-500 text-xs mb-0.5">/mois</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-3">
                  {plan.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-dark-300">
                      <Check size={12} className="text-gold-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                {plan.note && (
                  <p className="text-dark-500 text-[11px] italic mb-4 leading-relaxed flex-1">{plan.note}</p>
                )}

                <button
                  onClick={() => !isActive && souscire(plan.key)}
                  disabled={isActive || loadingPlan === plan.key}
                  className={`w-full py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-dark-700 text-dark-500 cursor-default'
                      : plan.ctaCls
                  } disabled:opacity-60`}
                >
                  {loadingPlan === plan.key ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : isActive ? (
                    'Plan actuel'
                  ) : (
                    `Passer ${plan.nom}`
                  )}
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Crédits one-shot */}
        <h2 className="text-white font-semibold text-sm mb-1">Crédits supplémentaires</h2>
        <p className="text-dark-500 text-xs mb-4">Achetez des profils en plus, sans changer d&apos;abonnement</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-10 max-w-sm">
          {PACKS.map((pack, i) => (
            <motion.div
              key={pack.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="bg-dark-800 border border-dark-700 hover:border-gold-500/30 rounded-2xl p-5 transition-colors"
            >
              <div className="text-2xl mb-2">{pack.emoji}</div>
              <p className="text-white text-sm font-medium mb-0.5">{pack.label}</p>
              <p className="text-gold-400 font-bold text-xl mb-4">{pack.prix}€</p>
              <button
                onClick={() => acheterPack(pack.key)}
                disabled={loadingPack === pack.key}
                className="w-full py-2 text-sm border border-gold-500/40 text-gold-400 hover:bg-gold-500/10 rounded-xl transition-all disabled:opacity-60"
              >
                {loadingPack === pack.key ? (
                  <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  <>Acheter <ArrowRight size={13} className="inline ml-1" /></>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Pourquoi ces limites */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 mb-4">
          <h3 className="text-white font-semibold text-sm mb-2">Pourquoi ces limites ?</h3>
          <p className="text-dark-400 text-xs leading-relaxed">
            Parce que la qualité passe avant la quantité. Nous faisons le choix de proposer des profils pertinents, plutôt qu&apos;une infinité de rencontres sans sens.
          </p>
          <p className="text-amber-400/60 text-xs mt-3 leading-relaxed">
            ⚠️ Les places sont volontairement limitées pour garantir un niveau de qualité élevé et des profils réellement engagés.
          </p>
        </div>

        {/* Notre engagement */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Notre engagement</h3>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { icon: Shield,     text: 'Profils vérifiés' },
              { icon: Heart,      text: 'Respect des valeurs' },
              { icon: Star,       text: 'Rencontres encadrées' },
              { icon: Check,      text: 'Démarche sérieuse uniquement' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-center gap-2 text-xs text-dark-300">
                  <Icon size={13} className="text-gold-500 flex-shrink-0" />
                  {item.text}
                </div>
              )
            })}
          </div>
          <div className="space-y-2 border-t border-dark-700 pt-4">
            {[
              { icon: RefreshCw, text: 'Sans engagement — résiliation en 1 clic' },
              { icon: CreditCard, text: 'Paiement sécurisé par Stripe' },
              { icon: Zap, text: 'Plan activé instantanément après paiement' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-start gap-3 text-xs text-dark-400">
                  <Icon size={13} className="text-gold-500 mt-0.5 flex-shrink-0" />
                  {item.text}
                </div>
              )
            })}
          </div>
        </div>

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
