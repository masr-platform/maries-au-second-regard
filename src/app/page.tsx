'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

// ─── Animation helper ─────────────────────────────────────────────
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ─── Compteur animé ───────────────────────────────────────────────
function Counter({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = to / 80
    const timer = setInterval(() => {
      start += step
      if (start >= to) { setCount(to); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, to])

  return <span ref={ref}>{prefix}{count}{suffix}</span>
}

// ─── FAQ item ─────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="border border-white/10 rounded-2xl overflow-hidden cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-5 gap-4">
        <span className="text-white font-medium text-sm md:text-base">{q}</span>
        <span className="text-[#C9A84C] text-xl flex-shrink-0">{open ? '−' : '+'}</span>
      </div>
      {open && (
        <div className="px-5 pb-5 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

// ─── Page principale ───────────────────────────────────────────────
export default function LandingPage() {
  const [urgencyLeft] = useState(7)

  const steps = [
    { num: '01', emoji: '📋', title: 'Tu réponds au questionnaire', desc: 'Un questionnaire conçu avec des psychologues. Valeurs, personnalité, vision du couple — on va chercher l\'essentiel.' },
    { num: '02', emoji: '🧠', title: 'L\'IA analyse instantanément', desc: 'Notre algorithme traite 87 dimensions de compatibilité en quelques secondes. Aucun site de rencontre ne fait ça.' },
    { num: '03', emoji: '✅', title: 'Nos experts valident', desc: 'Une équipe de psychologues musulmans relève les profils. Pas d\'algorithme seul — des humains qualifiés derrière.' },
    { num: '04', emoji: '💌', title: 'On te propose un profil compatible', desc: 'Tu reçois un profil soigneusement sélectionné. Pas 500 profils à trier. Un profil sérieux, compatible à +87%.' },
    { num: '05', emoji: '💬', title: 'Chat sécurisé & encadré', desc: 'La communication se fait dans un espace sécurisé, dans le respect des valeurs islamiques.' },
    { num: '06', emoji: '🕌', title: 'Mouqabala avec imam', desc: 'Si la connexion est réelle, on t\'accompagne jusqu\'à la rencontre encadrée. Du sérieux, du début à la fin.' },
  ]

  const testimonials = [
    {
      name: 'Yasmine M.',
      ville: 'Lyon',
      stars: 5,
      text: 'J\'ai essayé d\'autres applications pendant 3 ans. Ici en 6 semaines j\'ai rencontré mon fiancé. Le questionnaire m\'a permis de rencontrer quelqu\'un qui me comprend vraiment.',
      tag: 'Fiancée en 6 semaines',
    },
    {
      name: 'Ibrahim K.',
      ville: 'Paris',
      stars: 5,
      text: 'Ce qui m\'a convaincu c\'est le sérieux. Il y a de vrais psychologues derrière, pas juste un algorithme. Je me suis senti respecté dans mes valeurs dès le départ.',
      tag: 'Marié il y a 4 mois',
    },
    {
      name: 'Nour B.',
      ville: 'Marseille',
      stars: 5,
      text: 'Enfin une plateforme qui parle de mariage et pas juste de rencontres. Le cadre islamique, la validation des experts… c\'est ce que j\'attendais depuis longtemps.',
      tag: 'En discussion sérieuse',
    },
  ]

  const faqs = [
    { q: 'C\'est quoi exactement MASR ?', a: 'MASR est une plateforme de matching pour mariage destinée aux musulmans francophones. Contrairement aux applis de rencontre classiques, nous utilisons une IA haute performance couplée à une validation humaine par des psychologues musulmans pour vous proposer des profils réellement compatibles.' },
    { q: 'Comment fonctionne le taux de 87% de compatibilité ?', a: 'Notre algorithme analyse 87 dimensions : valeurs islamiques, personnalité, vision du couple, style de communication, projets de vie… Le score est calculé sur l\'ensemble de ces dimensions, pas juste sur des critères superficiels.' },
    { q: 'Est-ce que c\'est halal ?', a: 'Absolument. Toute la plateforme est conçue dans le respect des valeurs islamiques. La communication est encadrée, les profils sont validés, et nous accompagnons jusqu\'à la mouqabala avec imam si les deux personnes souhaitent aller plus loin.' },
    { q: 'Combien de temps avant de recevoir un profil ?', a: 'En général entre 48h et 7 jours après avoir complété votre questionnaire. Nos experts prennent le temps de valider chaque matching sérieusement.' },
    { q: 'Que se passe-t-il si le profil proposé ne me correspond pas ?', a: 'Vous pouvez refuser et nous affinerons encore davantage votre recherche. Notre objectif n\'est pas de vous proposer des dizaines de profils — c\'est de vous trouver le bon.' },
  ]

  return (
    <div className="min-h-screen bg-[#080611] text-white overflow-x-hidden">

      {/* ══ BANDEAU URGENCE ══════════════════════════════════════════ */}
      <div className="bg-[#C9A84C]/15 border-b border-[#C9A84C]/20 py-2.5 px-4 text-center text-sm">
        <span className="text-[#C9A84C]">
          ⏳ <span className="font-semibold">Accès limité</span> — Seulement{' '}
          <span className="text-white font-bold">{urgencyLeft} places disponibles</span>
          {' '}cette semaine. Notre équipe n&apos;accepte que des profils sérieux.
        </span>
      </div>

      {/* ══ NAV ══════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-[#080611]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border-2 border-[#C9A84C] flex items-center justify-center">
              <span className="text-[#C9A84C] font-serif font-bold text-sm">M</span>
            </div>
            <span className="font-serif font-bold text-white text-lg tracking-wide">MASR</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/connexion" className="text-white/60 hover:text-white text-sm transition-colors hidden md:block">
              Se connecter
            </Link>
            <Link
              href="/inscription"
              className="bg-[#C9A84C] hover:bg-[#D4B75C] text-black text-sm font-bold px-5 py-2.5 rounded-full transition-all"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════════ */}
      <section className="relative px-6 pt-20 pb-28 overflow-hidden">
        {/* Fond lumineux */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#C9A84C]/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-violet-900/20 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge */}
          <FadeUp>
            <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-full px-4 py-2 text-[#C9A84C] text-xs font-semibold mb-8 tracking-widest uppercase">
              🕌 La première plateforme de mariage islamique par IA + psychologues
            </div>
          </FadeUp>

          {/* Headline principale */}
          <FadeUp delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
              Une équipe de{' '}
              <span className="text-[#C9A84C]">psychologues musulmans</span>
              {' '}+ une IA haute performance trouvent pour vous une compatibilité à{' '}
              <span className="text-[#C9A84C]">+87%</span>
            </h1>
          </FadeUp>

          {/* Sous-titre émotionnel */}
          <FadeUp delay={0.2}>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-4 max-w-2xl mx-auto">
              Trouve une personne sérieuse pour le mariage.{' '}
              <span className="text-white font-medium">Pas pour perdre ton temps.</span>
            </p>
            <p className="text-white/50 text-base md:text-lg mb-10 max-w-xl mx-auto">
              Mariage, pas flirt. Valeurs, pas photos. Destin, pas hasard.
            </p>
          </FadeUp>

          {/* CTA principal */}
          <FadeUp delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/inscription"
                className="group inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B75C] text-black font-bold text-base px-8 py-4 rounded-full transition-all shadow-lg shadow-[#C9A84C]/20 hover:shadow-[#C9A84C]/40"
              >
                Analyser ma compatibilité gratuitement
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            <p className="text-white/30 text-xs mt-4">Questionnaire en 8 min · Résultat en 48h · 100% gratuit pour commencer</p>
          </FadeUp>
        </div>
      </section>

      {/* ══ STATS BAR ════════════════════════════════════════════════ */}
      <section className="border-y border-white/5 bg-white/2 px-6 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { to: 87, suffix: '%', label: 'taux de compatibilité', prefix: '+' },
            { to: 3200, suffix: '+', label: 'membres vérifiés' },
            { to: 94, suffix: '%', label: 'satisfaction membres', prefix: '' },
            { to: 6, suffix: ' sem.', label: 'délai moyen avant match' },
          ].map((s, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-[#C9A84C] mb-1">
                  <Counter to={s.to} suffix={s.suffix} prefix={s.prefix || ''} />
                </div>
                <div className="text-white/40 text-xs uppercase tracking-wider">{s.label}</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══ PROBLÈME / SOLUTION ══════════════════════════════════════ */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4">
              Le problème avec les autres plateformes
            </h2>
            <p className="text-white/50 text-center mb-16 text-lg">Ce que tu vis probablement en ce moment.</p>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Problèmes */}
            <FadeUp delay={0.1}>
              <div className="bg-red-950/20 border border-red-800/20 rounded-3xl p-8 space-y-4">
                <div className="text-red-400 font-bold text-sm uppercase tracking-widest mb-6">❌ Les autres applis</div>
                {[
                  'Des centaines de profils à trier sans résultat',
                  'Des personnes pas sérieuses, juste là pour passer le temps',
                  'Aucun encadrement islamique, tout est laissé au hasard',
                  'Des algorithmes basiques sur l\'apparence et la localisation',
                  'Aucun expert, aucun accompagnement, tu es seul',
                ].map((p, i) => (
                  <div key={i} className="flex items-start gap-3 text-white/60 text-sm">
                    <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                    {p}
                  </div>
                ))}
              </div>
            </FadeUp>

            {/* Solutions */}
            <FadeUp delay={0.2}>
              <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-3xl p-8 space-y-4">
                <div className="text-[#C9A84C] font-bold text-sm uppercase tracking-widest mb-6">✅ MASR</div>
                {[
                  'Un seul profil. Soigneusement sélectionné. Vraiment compatible.',
                  'Des membres vérifiés avec une intention réelle de mariage',
                  'Cadre islamique à chaque étape, jusqu\'à la mouqabala',
                  'IA analysant 87 dimensions + validation par psychologues',
                  'Une équipe humaine derrière chaque matching',
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3 text-white/80 text-sm">
                    <span className="text-[#C9A84C] mt-0.5 flex-shrink-0">✓</span>
                    {s}
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══ PROCESS CLAIR ════════════════════════════════════════════ */}
      <section className="px-6 py-24 bg-white/2 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-block bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-full px-4 py-1.5 text-[#C9A84C] text-xs font-semibold uppercase tracking-widest mb-4">
                Comment ça fonctionne
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                6 étapes vers le mariage que tu mérites
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto">
                Un processus clair, encadré, pensé pour aller jusqu&apos;au bout.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="relative bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-[#C9A84C]/30 transition-all group">
                  <div className="absolute top-4 right-4 text-white/10 font-bold text-2xl font-serif">{step.num}</div>
                  <div className="text-3xl mb-4">{step.emoji}</div>
                  <h3 className="font-bold text-white text-base mb-2 group-hover:text-[#C9A84C] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DIFFÉRENCIATEUR EXPERT ═══════════════════════════════════ */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="rounded-3xl bg-gradient-to-br from-[#C9A84C]/10 via-violet-900/10 to-[#080611] border border-[#C9A84C]/15 p-10 md:p-16 text-center">
              <div className="text-5xl mb-6">🏆</div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
                Pas juste une appli.<br />
                <span className="text-[#C9A84C]">Une équipe derrière toi.</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                MASR est la seule plateforme qui combine une IA haute performance <strong className="text-white">et</strong> une validation humaine par des psychologues spécialisés dans le couple musulman, et un accompagnement jusqu'à la mouqabala avec imam.
                <br /><br />
                Ce n&apos;est pas un site de rencontres. C&apos;est un service de matching sérieux pour personnes sérieuses.
              </p>
              <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
                {[
                  { icon: '🧠', label: 'Psychologues\nmusulmans' },
                  { icon: '⚡', label: 'IA haute\nperformance' },
                  { icon: '🕌', label: 'Mouqabala\navec imam' },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="text-white/60 text-xs leading-tight">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══ TÉMOIGNAGES ══════════════════════════════════════════════ */}
      <section className="px-6 py-24 bg-white/2 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">
                Ils ont trouvé leur moitié
              </h2>
              <p className="text-white/50 text-lg">Des histoires vraies. Des mariages qui durent.</p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="bg-white/3 border border-white/8 rounded-2xl p-7 flex flex-col h-full">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.stars)].map((_, j) => (
                      <span key={j} className="text-[#C9A84C] text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-6 flex-1">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div>
                    <div className="inline-block bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {t.tag}
                    </div>
                    <div className="text-white font-medium text-sm">{t.name}</div>
                    <div className="text-white/40 text-xs">{t.ville}</div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TARIFS ═══════════════════════════════════════════════════ */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">
                Un investissement pour toute une vie
              </h2>
              <p className="text-white/50 text-lg">Commence gratuitement. Engage-toi quand tu es prêt(e).</p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Essentiel',
                price: '19,90',
                desc: 'Pour commencer sérieusement',
                color: 'border-white/10',
                features: ['3 profils sérieux sélectionnés / mois', 'Chat supervisé (1 personne à la fois)', '1 mouqabala encadrée / mois', 'Profils vérifiés par MASR'],
                cta: 'Choisir Essentiel',
                popular: false,
              },
              {
                name: 'Premium',
                price: '29,90',
                desc: 'Le plus choisi — Recommandé',
                color: 'border-[#C9A84C]/40',
                features: ['10 profils sérieux sélectionnés / mois', 'Chat supervisé multi-personnes', '3 mouqabalas encadrées / mois', 'Accès prioritaire aux profils sérieux', 'Filtres avancés de compatibilité'],
                cta: 'Choisir Premium',
                popular: true,
              },
              {
                name: 'Élite',
                price: '49,90',
                desc: 'Accompagnement complet',
                color: 'border-white/10',
                features: ['Profils illimités', 'Mouqabalas illimitées', 'Coach matrimonial dédié — 1 appel/mois', 'Profil boosté — vu en priorité', 'Accès avant-première aux nouveaux inscrits', 'Accompagnement personnalisé'],
                cta: 'Choisir Élite',
                popular: false,
              },
            ].map((plan, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className={`relative bg-white/3 border-2 ${plan.color} rounded-3xl p-7 flex flex-col h-full ${plan.popular ? 'bg-[#C9A84C]/5' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C9A84C] text-black text-xs font-bold px-4 py-1 rounded-full">
                      ⭐ Le plus choisi
                    </div>
                  )}
                  <div className="mb-6">
                    <div className="text-white/50 text-xs uppercase tracking-widest mb-1">{plan.desc}</div>
                    <div className="font-serif font-bold text-white text-xl mb-1">{plan.name}</div>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold text-white">{plan.price}€</span>
                      <span className="text-white/40 text-sm mb-1">/mois</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-white/70">
                        <span className="text-[#C9A84C] mt-0.5 flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/inscription"
                    className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${
                      plan.popular
                        ? 'bg-[#C9A84C] text-black hover:bg-[#D4B75C]'
                        : 'bg-white/8 text-white hover:bg-white/15'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.3}>
            <p className="text-center text-white/30 text-sm mt-8">
              🔒 Paiement sécurisé · Annulable à tout moment · Aucun engagement
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-24 bg-white/2 border-y border-white/5">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-14">
              Questions fréquentes
            </h2>
          </FadeUp>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <FadeUp key={i} delay={i * 0.05}>
                <FaqItem q={f.q} a={f.a} />
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ════════════════════════════════════════════════ */}
      <section className="px-6 py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#C9A84C]/10 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <FadeUp>
            <div className="text-5xl mb-6">💍</div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
              Ton mariage commence<br />
              <span className="text-[#C9A84C]">par une décision.</span>
            </h2>
            <p className="text-white/60 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
              Des milliers de musulmans sérieux attendent. Ton profil compatible existe. Il ne manque que toi.
            </p>
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B75C] text-black font-bold text-lg px-10 py-5 rounded-full transition-all shadow-xl shadow-[#C9A84C]/20 hover:shadow-[#C9A84C]/40"
            >
              Analyser ma compatibilité gratuitement →
            </Link>
            <p className="text-white/25 text-xs mt-5">
              Questionnaire 8 min · Résultat en 48h · Sans engagement
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border-2 border-[#C9A84C] flex items-center justify-center">
              <span className="text-[#C9A84C] font-serif font-bold text-xs">M</span>
            </div>
            <span className="font-serif font-bold text-white">MASR</span>
          </div>
          <div className="flex gap-6 text-white/30 text-xs">
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/connexion" className="hover:text-white transition-colors">Se connecter</Link>
          </div>
          <p className="text-white/20 text-xs">© 2025 MASR · Mariage avec intention</p>
        </div>
      </footer>

    </div>
  )
}
