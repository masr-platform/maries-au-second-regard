'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ArrowRight, Shield, Star, Zap, Crown } from 'lucide-react'

const PLANS = [
  {
    key: 'BASIQUE',
    icon: Shield,
    nom: 'Essentiel',
    prix: '19,90',
    periode: '/mois',
    desc: 'Pour une démarche posée et sérieuse',
    badge: null,
    featured: false,
    gradient: 'from-purple-600/10 to-violet-800/10',
    border: 'border-white/15',
    btnCls: 'border border-white/25 text-white hover:bg-white/8 hover:border-white/40',
    iconColor: 'text-purple-400',
    checkColor: 'text-purple-400',
    items: [
      '1 profil compatible par semaine',
      'Vérification IA sur 7 dimensions',
      'Validation psychologue clinicien',
      'Chat encadré (1 profil à la fois)',
      '1 mouqabala virtuelle / mois',
      'Score de compatibilité détaillé',
      'Support email',
    ],
    cta: 'Commencer avec Essentiel',
  },
  {
    key: 'PREMIUM',
    icon: Star,
    nom: 'Premium',
    prix: '29,90',
    periode: '/mois',
    desc: 'Le choix de ceux qui veulent aller plus vite',
    badge: '⭐ Le plus choisi',
    featured: true,
    gradient: 'from-fuchsia-600/20 to-pink-800/15',
    border: 'border-fuchsia-500/50',
    btnCls: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white font-bold hover:from-purple-500 hover:via-fuchsia-500 hover:to-pink-500 shadow-lg shadow-fuchsia-500/25',
    iconColor: 'text-fuchsia-400',
    checkColor: 'text-fuchsia-400',
    items: [
      '1 profil compatible par jour (×4 vs Essentiel)',
      'Vérification IA sur 7 dimensions',
      'Validation psychologue clinicien',
      'Chat encadré (plusieurs profils en parallèle)',
      '3 mouqabalas virtuelles / mois',
      'Accès prioritaire aux nouveaux profils',
      'Score de compatibilité détaillé',
      'Support prioritaire',
    ],
    cta: 'Commencer avec Premium',
  },
  {
    key: 'ULTRA',
    icon: Crown,
    nom: 'Élite',
    prix: '49,90',
    periode: '/mois',
    desc: 'Pour ceux qui veulent le meilleur accompagnement',
    badge: null,
    featured: false,
    gradient: 'from-amber-600/10 to-orange-800/10',
    border: 'border-amber-500/25',
    btnCls: 'border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400/60',
    iconColor: 'text-amber-400',
    checkColor: 'text-amber-400',
    items: [
      '3 profils compatibles par jour',
      'Vérification IA sur 7 dimensions',
      'Validation psychologue clinicien',
      'Chat encadré illimité',
      'Mouqabalas virtuelles illimitées',
      'Accès prioritaire absolu',
      'Coach mariage dédié',
      'Consultation psychologue mensuelle',
      'Support VIP 7j/7',
    ],
    cta: 'Commencer avec Élite',
  },
]

const GARANTIES = [
  { emoji: '🔒', titre: 'Paiement sécurisé', desc: 'Chiffrement SSL, aucune donnée bancaire stockée sur nos serveurs.' },
  { emoji: '↩️', titre: 'Résiliation libre', desc: 'Sans engagement. Résiliez à tout moment depuis votre espace membre.' },
  { emoji: '🛡️', titre: '100% halal', desc: 'Cadre islamique garanti à chaque étape du processus.' },
  { emoji: '🧠', titre: 'IA + psychologues', desc: 'Chaque compatibilité est validée par un clinicien avant de vous être envoyée.' },
]

const COMPARAISON = [
  ['Profils par semaine', '1', '7', '21'],
  ['Validation psychologue', '✓', '✓', '✓'],
  ['Score de compatibilité', '✓', '✓', '✓'],
  ['Chat supervisé', '1 à la fois', 'Multi-profils', 'Illimité'],
  ['Mouqabalas / mois', '1', '3', 'Illimité'],
  ['Accès prioritaire', '✗', '✓', '✓'],
  ['Coach dédié', '✗', '✗', '✓'],
  ['Support', 'Email', 'Prioritaire', 'VIP 7j/7'],
]

export default function TarifsPage() {
  const [annuel, setAnnuel] = useState(false)

  function prixAffiche(prix: string) {
    if (!annuel) return prix
    const num = parseFloat(prix.replace(',', '.'))
    return (num * 0.8 * 12).toFixed(0).replace('.', ',')
  }

  return (
    <main className="min-h-screen bg-[#060412] text-white overflow-hidden">
      {/* Fond */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-purple-700/7 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-fuchsia-600/7 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-purple-500/10 bg-[#060412]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="MASR" style={{ width: 50, height: 50, objectFit: 'contain' }} />
            <span className="text-base font-black tracking-wider bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent hidden sm:block">
              Mariés au Second Regard
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/faq" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block">FAQ</Link>
            <Link href="/connexion" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block">Connexion</Link>
            <Link href="/inscription" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all">
              Commencer gratuitement →
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="relative z-10 pt-32 pb-16 px-6 text-center">
        <div style={{ animation: 'fadeInUp 0.6s ease both' }}>
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-4">Tarifs & abonnements</p>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            Investissez dans<br />
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">
              votre futur.
            </span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto mb-8">
            L'inscription et le questionnaire sont <strong className="text-white/70">100% gratuits</strong>. L'abonnement vous donne accès à vos compatibilités validées.
          </p>

          {/* Toggle mensuel / annuel */}
          <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-6 py-3">
            <button
              onClick={() => setAnnuel(false)}
              className={`text-sm font-semibold transition-colors ${!annuel ? 'text-white' : 'text-white/40'}`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setAnnuel(!annuel)}
              className={`w-12 h-6 rounded-full transition-all relative ${annuel ? 'bg-fuchsia-600' : 'bg-white/15'}`}
              aria-label="Basculer annuel"
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${annuel ? 'left-7' : 'left-1'}`} />
            </button>
            <button
              onClick={() => setAnnuel(true)}
              className={`text-sm font-semibold transition-colors ${annuel ? 'text-white' : 'text-white/40'}`}
            >
              Annuel <span className="text-fuchsia-400 text-xs font-black ml-1">−20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="relative z-10 pb-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon
            return (
              <div
                key={plan.key}
                className={`relative rounded-3xl border bg-gradient-to-b ${plan.gradient} ${plan.border} p-7 flex flex-col ${plan.featured ? 'shadow-2xl shadow-fuchsia-500/15 scale-[1.02]' : ''}`}
                style={{ animation: `fadeInUp 0.5s ease ${i * 0.1}s both` }}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white text-xs font-black px-5 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                    {plan.badge}
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5`}>
                  <Icon size={22} className={plan.iconColor} />
                </div>

                <h2 className="text-xl font-black text-white mb-1">{plan.nom}</h2>
                <p className="text-white/40 text-sm mb-5">{plan.desc}</p>

                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-black text-white">{prixAffiche(plan.prix)}€</span>
                  <span className="text-white/40 text-sm mb-1">
                    {annuel ? '/an' : plan.periode}
                  </span>
                  {annuel && <span className="text-fuchsia-400 text-xs font-bold mb-1 ml-1">−20%</span>}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-white/70">
                      <Check size={16} className={`${plan.checkColor} flex-shrink-0 mt-0.5`} />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/inscription"
                  className={`w-full py-4 rounded-full text-center text-sm font-black transition-all flex items-center justify-center gap-2 ${plan.btnCls}`}
                >
                  {plan.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            )
          })}
        </div>

        <p className="text-center text-white/25 text-xs mt-6">
          Inscription gratuite · Aucune carte bancaire requise pour démarrer · Résiliation sans engagement
        </p>
      </section>

      {/* Tableau comparatif */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">Comparatif détaillé</h2>
            <p className="text-white/40">Choisissez la formule qui correspond à votre rythme.</p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-purple-500/20">
            <div className="grid grid-cols-4 bg-gradient-to-r from-purple-950/40 via-fuchsia-950/20 to-purple-950/40 px-6 py-4 border-b border-purple-500/20">
              <div className="text-white/40 text-xs font-bold uppercase tracking-wider">Fonctionnalité</div>
              {['Essentiel', 'Premium', 'Élite'].map((p) => (
                <div key={p} className={`text-center text-xs font-bold uppercase tracking-wider ${p === 'Premium' ? 'text-fuchsia-300' : 'text-white/60'}`}>{p}</div>
              ))}
            </div>
            {COMPARAISON.map(([crit, ess, prem, elite], i) => (
              <div key={i} className={`grid grid-cols-4 px-6 py-3.5 text-sm border-t border-white/5 ${i % 2 === 0 ? 'bg-purple-950/10' : ''}`}>
                <div className="text-white/60">{crit}</div>
                <div className="text-center text-white/50">{ess}</div>
                <div className="text-center text-fuchsia-300 font-semibold">{prem}</div>
                <div className="text-center text-amber-300">{elite}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Garanties */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">Nos engagements</h2>
            <p className="text-white/40">Nous prenons vos intérêts au sérieux.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {GARANTIES.map((g, i) => (
              <div
                key={i}
                className="bg-white/4 border border-white/8 rounded-2xl p-5 text-center hover:bg-white/6 transition-all"
                style={{ animation: `fadeInUp 0.4s ease ${i * 0.08}s both` }}
              >
                <div className="text-3xl mb-3">{g.emoji}</div>
                <p className="text-white font-bold text-sm mb-1">{g.titre}</p>
                <p className="text-white/40 text-xs leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ rapide */}
      <section className="relative z-10 py-20 px-6 border-t border-purple-500/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black text-white mb-4">Des questions sur les tarifs ?</h2>
          <p className="text-white/40 mb-8">Consultez notre FAQ complète ou contactez-nous directement.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/faq"
              className="border border-white/20 text-white/70 hover:text-white hover:border-white/40 px-8 py-4 rounded-full text-sm font-bold transition-all">
              Voir la FAQ →
            </Link>
            <Link href="/inscription"
              className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white px-8 py-4 rounded-full text-sm font-black hover:scale-105 transition-all shadow-lg shadow-fuchsia-500/20">
              Commencer gratuitement — sans carte bancaire
            </Link>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Footer */}
      <footer className="border-t border-purple-500/10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-purple-300/60 text-sm font-bold">Mariés au Second Regard</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/25">
            <Link href="/" className="hover:text-white/50 transition-colors">Accueil</Link>
            <Link href="/faq" className="hover:text-white/50 transition-colors">FAQ</Link>
            <Link href="/mentions-legales" className="hover:text-white/50 transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-white/50 transition-colors">Confidentialité</Link>
            <Link href="/cgu" className="hover:text-white/50 transition-colors">CGU</Link>
          </div>
          <p className="text-white/20 text-xs">© 2026 Mariés au Second Regard</p>
        </div>
      </footer>
    </main>
  )
}
