'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Heart, MessageCircle, Bell, User, Settings, LogOut,
  TrendingUp, Check, Zap, Star, Shield, ArrowRight,
  CreditCard, RefreshCw, AlertCircle, Crown, Sparkles, Flame,
} from 'lucide-react'
import toast from 'react-hot-toast'

const planLabel: Record<string, string> = {
  GRATUIT:  'Accès limité',
  STANDARD: 'Essentiel — 1 profil qualifié/semaine',
  BASIQUE:  'Essentiel — 1 profil qualifié/semaine',
  PREMIUM:  'Premium — 1 profil qualifié/jour',
  ULTRA:    'Élite — 3 profils qualifiés/jour',
}

const planNom: Record<string, string> = {
  GRATUIT:  'Gratuit',
  STANDARD: 'Essentiel',
  BASIQUE:  'Essentiel',
  PREMIUM:  'Premium',
  ULTRA:    'Élite',
}

const PLANS = [
  {
    key: 'BASIQUE',
    nom: 'Essentiel',
    prix: '19,90',
    desc: 'Pour une démarche posée et sérieuse',
    icon: Heart,
    badge: null,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderColor: 'rgba(255,255,255,0.1)',
    accentColor: '#D4AF37',
    note: 'Une formule rythmée pour prendre le temps de vraiment connaître chaque profil proposé.',
    items: [
      '1 profil compatible proposé chaque semaine',
      'Profils 100% vérifiés et sélectionnés par notre IA',
      'Chat encadré avec 1 personne à la fois',
      '1 Mouqabala virtuelle par mois avec un imam',
      'Score de compatibilité détaillé sur 7 dimensions',
      'Support par email',
    ],
    cta: 'Commencer',
    ctaStyle: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' },
  },
  {
    key: 'PREMIUM',
    nom: 'Premium',
    prix: '29,90',
    desc: 'Le choix de ceux qui veulent avancer',
    icon: Star,
    badge: { text: '⭐ RECOMMANDÉ', bg: 'linear-gradient(90deg, #D4AF37, #f0d060)', color: '#000' },
    gradient: 'linear-gradient(135deg, #1c1610 0%, #2a1f0a 50%, #1c1610 100%)',
    borderColor: 'rgba(212,175,55,0.5)',
    accentColor: '#D4AF37',
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
    cta: 'Passer Premium',
    ctaStyle: { background: 'linear-gradient(90deg, #D4AF37, #f0d060)', color: '#000', fontWeight: 700 },
  },
  {
    key: 'ULTRA',
    nom: 'Élite',
    prix: '49,90',
    desc: 'Pour ceux qui visent le meilleur',
    icon: Crown,
    badge: { text: '👑 EXCLUSIF', bg: 'linear-gradient(90deg, #7c3aed, #a855f7)', color: '#fff' },
    gradient: 'linear-gradient(135deg, #0f0a1a 0%, #1a0f2e 50%, #0f0a1a 100%)',
    borderColor: 'rgba(168,85,247,0.45)',
    accentColor: '#a855f7',
    note: 'Tout ce qu\'inclut le Premium, avec le maximum de visibilité et d\'accompagnement.',
    items: [
      '3 profils compatibles proposés chaque jour (×3 vs Premium)',
      'Profils 100% vérifiés et sélectionnés par notre IA',
      'Chat encadré avec plusieurs matchs en même temps',
      'Mouqabalas virtuelles illimitées avec un imam',
      'Votre profil mis en avant — vu en priorité',
      'Accès en avant-première aux nouveaux inscrits',
      'Score de compatibilité détaillé sur 7 dimensions',
      'Accompagnement personnalisé par notre équipe',
    ],
    cta: 'Accéder à l\'Élite',
    ctaStyle: { background: 'linear-gradient(90deg, #7c3aed, #a855f7)', color: '#fff', fontWeight: 700 },
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
    if (status === 'loading') {
      toast.error('Veuillez patienter…')
      return
    }
    if (!session?.user?.id) {
      toast.error('Connexion requise pour souscrire')
      router.replace('/connexion')
      return
    }
    const baseUrl = PAYMENT_LINKS[planKey]
    if (!baseUrl) {
      toast.error('Lien de paiement introuvable')
      return
    }
    setLoadingPlan(planKey)
    const userId = (session.user as { id?: string }).id!
    const url = `${baseUrl}?client_reference_id=${userId}:${planKey}`
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
      <main className="md:ml-64 p-6 md:p-8 max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-white">Mon abonnement</h1>
          <p className="text-dark-300 text-sm mt-1">Choisissez le plan qui correspond à votre démarche</p>
        </div>

        {/* ── Plan actuel ─────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 mb-10 relative overflow-hidden"
          style={{
            background: isPaid
              ? 'linear-gradient(135deg, #1c1610 0%, #2a1f0a 100%)'
              : 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
            border: isPaid ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Glow subtil */}
          {isPaid && (
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
            />
          )}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider opacity-60">Plan actuel</h2>
            {isPaid && (
              <span className="text-xs text-green-400 flex items-center gap-1.5 bg-green-400/10 px-2.5 py-1 rounded-full border border-green-400/20">
                <Check size={11} /> Actif
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: isPaid ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)', border: isPaid ? '1px solid rgba(212,175,55,0.25)' : '1px solid rgba(255,255,255,0.08)' }}
            >
              <Star size={24} style={{ color: isPaid ? '#D4AF37' : '#6b7280' }} />
            </div>
            <div>
              <p className="text-white font-bold text-xl font-serif">
                {planNom[currentPlan] ?? currentPlan.charAt(0) + currentPlan.slice(1).toLowerCase()}
              </p>
              <p className="text-sm mt-0.5" style={{ color: isPaid ? 'rgba(212,175,55,0.7)' : '#6b7280' }}>
                {planLabel[currentPlan]}
              </p>
            </div>
          </div>

          {!isPaid && (
            <div className="mt-5 p-3.5 rounded-xl flex items-start gap-2.5" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <Sparkles size={14} style={{ color: '#D4AF37', marginTop: 1, flexShrink: 0 }} />
              <p className="text-xs" style={{ color: 'rgba(212,175,55,0.8)' }}>
                Passez à un plan payant pour recevoir vos premiers profils compatibles et débloquer toutes les fonctionnalités.
              </p>
            </div>
          )}
        </div>

        {/* ── Titre section plans ─────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-white font-semibold text-lg">Choisir un plan</h2>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }} />
        </div>

        {/* ── Cards plans ─────────────────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-5 mb-12">
          {PLANS.map((plan) => {
            const isActive = currentPlan === plan.key || (plan.key === 'BASIQUE' && currentPlan === 'STANDARD')
            const Icon = plan.icon
            const isPremium = plan.key === 'PREMIUM'

            return (
              <div
                key={plan.key}
                className="relative rounded-2xl flex flex-col transition-transform duration-200 hover:-translate-y-0.5"
                style={{
                  background: plan.gradient,
                  border: `1.5px solid ${isActive ? 'rgba(212,175,55,0.6)' : plan.borderColor}`,
                  boxShadow: isPremium && !isActive
                    ? '0 0 30px rgba(212,175,55,0.12), 0 4px 24px rgba(0,0,0,0.4)'
                    : plan.key === 'ULTRA' && !isActive
                    ? '0 0 30px rgba(168,85,247,0.1), 0 4px 24px rgba(0,0,0,0.4)'
                    : '0 4px 16px rgba(0,0,0,0.3)',
                  padding: isPremium ? '1.5px' : '0',
                }}
              >
                {/* Bordure gradient pour Premium */}
                {isPremium && !isActive && (
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.4), rgba(240,208,96,0.1), rgba(212,175,55,0.4))', zIndex: 0, borderRadius: 'inherit' }}
                  />
                )}

                <div className="relative z-10 p-5 flex flex-col h-full" style={{ background: plan.gradient, borderRadius: 'calc(1rem - 1.5px)' }}>

                  {/* Badge */}
                  {plan.badge && !isActive && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap"
                      style={{ background: plan.badge.bg, color: plan.badge.color, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                    >
                      {plan.badge.text}
                    </div>
                  )}
                  {isActive && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap"
                      style={{ background: 'linear-gradient(90deg, #22c55e, #16a34a)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                    >
                      ✓ Plan actuel
                    </div>
                  )}

                  {/* Header carte */}
                  <div className="mb-5 mt-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${plan.accentColor}18`, border: `1px solid ${plan.accentColor}30` }}
                    >
                      <Icon size={18} style={{ color: plan.accentColor }} />
                    </div>
                    <p className="text-white font-serif font-bold text-xl leading-tight">{plan.nom}</p>
                    <p className="text-xs mt-0.5 mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{plan.desc}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold text-white leading-none">{plan.prix}€</span>
                      <span className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>/mois</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-4 flex-1">
                    {plan.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        <Check size={11} className="mt-0.5 flex-shrink-0" style={{ color: plan.accentColor }} />
                        {item}
                      </li>
                    ))}
                  </ul>

                  {plan.note && (
                    <p className="text-[10px] italic mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>{plan.note}</p>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => !isActive && souscire(plan.key)}
                    disabled={isActive || loadingPlan === plan.key}
                    className="w-full py-2.5 rounded-xl text-sm transition-all duration-200 disabled:opacity-60"
                    style={isActive
                      ? { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', cursor: 'default' }
                      : plan.ctaStyle
                    }
                  >
                    {loadingPlan === plan.key ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : isActive ? (
                      'Plan actuel'
                    ) : (
                      plan.cta
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Crédits supplémentaires ─────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Flame size={16} style={{ color: '#f97316' }} />
            <h2 className="text-white font-semibold">Crédits supplémentaires</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Achetez des profils en plus, sans changer d&apos;abonnement
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-xs">
            {PACKS.map((pack) => (
              <div
                key={pack.key}
                className="rounded-2xl p-5 transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #1f1f1f 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="text-2xl mb-2">{pack.emoji}</div>
                <p className="text-white text-sm font-medium mb-0.5">{pack.label}</p>
                <p className="font-bold text-xl mb-4" style={{ color: '#D4AF37' }}>{pack.prix}€</p>
                <button
                  onClick={() => acheterPack(pack.key)}
                  disabled={loadingPack === pack.key}
                  className="w-full py-2 text-sm rounded-xl transition-all duration-200 disabled:opacity-60"
                  style={{ border: '1px solid rgba(212,175,55,0.35)', color: '#D4AF37', background: 'rgba(212,175,55,0.05)' }}
                >
                  {loadingPack === pack.key ? (
                    <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    <>Acheter <ArrowRight size={13} className="inline ml-1" /></>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pourquoi ces limites ─────────────────────────────── */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h3 className="text-white font-semibold text-sm mb-2">Pourquoi ces limites ?</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Parce que la qualité passe avant la quantité. Nous faisons le choix de proposer des profils pertinents, plutôt qu&apos;une infinité de rencontres sans sens.
          </p>
          <p className="text-xs mt-3 leading-relaxed" style={{ color: 'rgba(245,158,11,0.6)' }}>
            ⚠️ Les places sont volontairement limitées pour garantir un niveau de qualité élevé et des profils réellement engagés.
          </p>
        </div>

        {/* ── Notre engagement ─────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h3 className="text-white font-semibold text-sm mb-4">Notre engagement</h3>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { icon: Shield,  text: 'Profils vérifiés' },
              { icon: Heart,   text: 'Respect des valeurs' },
              { icon: Star,    text: 'Rencontres encadrées' },
              { icon: Check,   text: 'Démarche sérieuse uniquement' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <Icon size={13} style={{ color: '#D4AF37', flexShrink: 0 }} />
                  {item.text}
                </div>
              )
            })}
          </div>
          <div className="space-y-2.5 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {[
              { icon: RefreshCw,  text: 'Sans engagement — résiliation en 1 clic' },
              { icon: CreditCard, text: 'Paiement sécurisé par Stripe' },
              { icon: Zap,        text: 'Plan activé instantanément après paiement' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-start gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Icon size={13} style={{ color: '#D4AF37', marginTop: 1, flexShrink: 0 }} />
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
