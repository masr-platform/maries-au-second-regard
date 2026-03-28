'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import {
  Shield, Brain, Heart, Star, ChevronRight,
  Check, Users, Clock, Zap, Lock, Award,
  TrendingUp, MessageCircle, ArrowRight,
} from 'lucide-react'

// ─── Animation helper ─────────────────────────────────────────────
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// ─── Compteur animé ───────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = to / 60
    const timer = setInterval(() => {
      start += step
      if (start >= to) { setCount(to); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, to])

  return <span ref={ref}>{count}{suffix}</span>
}

// ─── Page principale ───────────────────────────────────────────────
export default function LandingPage() {
  const [urgencyLeft] = useState(7)

  return (
    <div className="min-h-screen bg-[#0B0912] text-white overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════
          BANDEAU URGENCE
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-violet-900 via-violet-800 to-violet-900 py-2.5 px-4 text-center text-sm">
        <span className="text-violet-200">
          🔒 Accès limité — Plus que{' '}
          <span className="text-white font-bold">{urgencyLeft} places disponibles</span>
          {' '}cette semaine. Notre algorithme n&apos;accepte que des profils sérieux.
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════
          NAV
      ══════════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-[#0B0912]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border-2 border-[#C9A84C] flex items-center justify-center">
              <span className="text-[#C9A84C] font-serif font-bold text-sm">M</span>
            </div>
            <span className="font-serif font-bold text-white text-lg tracking-wide">MASR</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/connexion"
              className="text-sm text-white/60 hover:text-white px-4 py-2 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="text-sm font-bold bg-[#C9A84C] text-black px-5 py-2.5 rounded-full hover:bg-[#d4b05a] transition-all shadow-lg shadow-[#C9A84C]/20"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative px-6 pt-20 pb-24 text-center overflow-hidden">
        {/* Glow arrière */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-[#C9A84C]/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Badge expert */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-medium mb-8"
          >
            <Award size={13} />
            Conçu avec des psychologues musulmans certifiés
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6"
          >
            Ce n&apos;est pas un site de{' '}
            <br />
            <span className="bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] bg-clip-text text-transparent">
              rencontre de plus.
            </span>
          </motion.h1>

          {/* Sous-titre choc */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-4"
          >
            MASR est une <strong className="text-white">plateforme de mariage à compatibilité extrême</strong>,
            pensée pour les musulmans qui refusent de laisser le hasard décider de leur avenir conjugal.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-lg text-white/50 max-w-2xl mx-auto mb-10"
          >
            Notre algorithme IA analyse <span className="text-[#C9A84C] font-semibold">87 dimensions de compatibilité</span> —
            foi, valeurs, projet de vie, personnalité — pour vous proposer uniquement des profils
            avec qui une vie commune est réellement possible.
          </motion.p>

          {/* CTA principal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/inscription"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-[#C9A84C] hover:bg-[#d4b05a] text-black font-bold text-lg rounded-full transition-all shadow-2xl shadow-[#C9A84C]/30 hover:shadow-[#C9A84C]/50 hover:scale-105"
            >
              Analyser ma compatibilité gratuitement
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-white/40 text-sm">Sans carte bancaire · Résultat en 8 min</p>
          </motion.div>

          {/* Preuves sociales */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-white/50"
          >
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-[#C9A84C]" />
              <span>100% halal & supervisé</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain size={14} className="text-[#C9A84C]" />
              <span>87% de compatibilité moyenne</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-[#C9A84C]" />
              <span>Profils vérifiés manuellement</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CHIFFRES CLÉS
      ══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-16 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 87, suffix: '%',    label: 'Compatibilité\nmoyenne garantie' },
            { value: 3,  suffix: ' min', label: 'Pour recevoir\nvotre premier match' },
            { value: 8,  suffix: 'j',    label: 'Délai moyen avant\nune première réponse' },
            { value: 0,  suffix: ' ❌',  label: 'Contact mixte\nnon supervisé' },
          ].map((stat, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div>
                <div className="text-3xl md:text-4xl font-serif font-bold text-[#C9A84C] mb-2">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-white/40 text-xs leading-relaxed whitespace-pre-line">{stat.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PROBLÈME → SOLUTION
      ══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-5">
                Pourquoi 40% des mariages musulmans
                <br />
                <span className="text-red-400">se terminent en divorce ?</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Parce qu&apos;on choisit son conjoint sur l&apos;apparence, les premiers sentiments, ou la pression familiale.
                Pas sur une vraie compatibilité de fond.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Problème */}
            <FadeUp delay={0.1}>
              <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-7">
                <h3 className="text-red-400 font-bold text-lg mb-5 flex items-center gap-2">
                  <span>✗</span> Sans MASR
                </h3>
                <ul className="space-y-3.5">
                  {[
                    'Profils non vérifiés, photos trompeuses',
                    'Matching basé sur l\'âge et la ville — rien de plus',
                    'Échanges non supervisés, risques de dérives',
                    'Aucun accompagnement psychologique',
                    'Divorce probable si incompatibilité de fond',
                    'Sentiment d\'avoir perdu du temps et de l\'énergie',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/60 text-sm">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>

            {/* Solution */}
            <FadeUp delay={0.2}>
              <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/30 rounded-3xl p-7 relative">
                <div className="absolute -top-3 left-6 bg-[#C9A84C] text-black text-xs font-bold px-3 py-1 rounded-full">
                  MASR
                </div>
                <h3 className="text-[#C9A84C] font-bold text-lg mb-5 flex items-center gap-2">
                  <span>✓</span> Avec MASR
                </h3>
                <ul className="space-y-3.5">
                  {[
                    'Chaque profil est vérifié manuellement par notre équipe',
                    '87 dimensions analysées par notre IA islamique',
                    'Conversations supervisées, étapes progressives halal',
                    'Psychologues & imams disponibles pour vous guider',
                    'Seuls les profils à haute compatibilité sont proposés',
                    'Un mariage fondé sur la conviction, pas le hasard',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/80 text-sm">
                      <Check size={14} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COMMENT ÇA MARCHE
      ══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Notre méthode</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold">
                Un processus rigoureux,<br />conçu par des experts
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                icon: Brain,
                titre: 'Questionnaire profond',
                desc: '5 sections, 45 questions — foi, personnalité, projet de vie, style de vie, critères. Notre IA construit votre profil de compatibilité sur 87 dimensions.',
              },
              {
                num: '02',
                icon: Zap,
                titre: 'Algorithme IA islamique',
                desc: 'Développé avec des psychologues spécialisés en mariage islamique. Il ne cherche pas "ce qui plaît" — il cherche "ce qui dure".',
              },
              {
                num: '03',
                icon: Heart,
                titre: 'Profil certifié compatible',
                desc: 'Vous recevez uniquement des propositions à 75%+ de compatibilité. Pas de scroll infini — une ou deux personnes sélectionnées chaque semaine.',
              },
              {
                num: '04',
                icon: Shield,
                titre: 'Échange supervisé halal',
                desc: 'Conversations par étapes progressives, supervision IA, possibilité d\'impliquer un wali ou un imam. Tout dans le respect de votre deen.',
              },
            ].map((step, i) => {
              const Icon = step.icon
              return (
                <FadeUp key={i} delay={i * 0.12}>
                  <div className="bg-[#0F0C18] border border-white/8 rounded-2xl p-6 hover:border-[#C9A84C]/30 transition-all duration-300">
                    <div className="text-[#C9A84C]/25 font-serif text-4xl font-bold mb-3 leading-none">{step.num}</div>
                    <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center mb-4">
                      <Icon size={20} className="text-[#C9A84C]" />
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-2">{step.titre}</h3>
                    <p className="text-white/50 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          DIFFÉRENCIATEURS
      ══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Ce qui nous rend uniques</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold">
                Pas un algorithme de dating.
                <br />
                <span className="text-[#C9A84C]">Un système de mariage.</span>
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Award,
                titre: 'Experts en mariage islamique',
                desc: 'Notre équipe réunit des psychologues spécialisés en mariage islamique, des imams certifiés et des ingénieurs IA. Chaque fonctionnalité est validée religieusement.',
                borderCls: 'border-violet-500/20',
                iconCls:   'text-violet-400',
                bgCls:     'bg-violet-500/10',
              },
              {
                icon: Brain,
                titre: 'IA entraînée sur le mariage halal',
                desc: 'Notre modèle n\'optimise pas pour les "coups de cœur" — il optimise pour la compatibilité durable. Il cherche la personne avec qui vous irez à la janna ensemble.',
                borderCls: 'border-[#C9A84C]/20',
                iconCls:   'text-[#C9A84C]',
                bgCls:     'bg-[#C9A84C]/10',
              },
              {
                icon: Shield,
                titre: 'Zéro compromis sur le halal',
                desc: 'Supervision de toutes les conversations, étapes progressives obligatoires, possibilité d\'impliquer un wali à tout moment. Votre honneur est notre priorité absolue.',
                borderCls: 'border-emerald-500/20',
                iconCls:   'text-emerald-400',
                bgCls:     'bg-emerald-500/10',
              },
              {
                icon: Users,
                titre: 'Communauté exclusive',
                desc: 'Nous limitons volontairement le nombre d\'inscriptions. Chaque profil passe par une vérification manuelle. Qualité > quantité, toujours.',
                borderCls: 'border-blue-500/20',
                iconCls:   'text-blue-400',
                bgCls:     'bg-blue-500/10',
              },
              {
                icon: MessageCircle,
                titre: 'Accompagnement humain',
                desc: 'Sessions avec des imams et psychologues disponibles à chaque étape du processus. Vous n\'êtes jamais seul(e) dans votre démarche.',
                borderCls: 'border-pink-500/20',
                iconCls:   'text-pink-400',
                bgCls:     'bg-pink-500/10',
              },
              {
                icon: TrendingUp,
                titre: 'Résultats mesurables',
                desc: 'Chaque profil proposé inclut un score de compatibilité détaillé sur 7 dimensions, une explication IA et des points d\'attention. Vous comprenez pourquoi.',
                borderCls: 'border-[#C9A84C]/20',
                iconCls:   'text-[#C9A84C]',
                bgCls:     'bg-[#C9A84C]/10',
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <FadeUp key={i} delay={i * 0.08}>
                  <div className={`bg-[#0F0C18] border-2 ${item.borderCls} rounded-2xl p-6 h-full hover:scale-[1.02] transition-transform duration-300`}>
                    <div className={`w-11 h-11 rounded-xl ${item.bgCls} flex items-center justify-center mb-4`}>
                      <Icon size={22} className={item.iconCls} />
                    </div>
                    <h3 className="font-semibold text-white mb-2 text-sm">{item.titre}</h3>
                    <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TÉMOIGNAGES
      ══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-serif font-bold mb-4">Ils ont trouvé leur moitié</h2>
              <p className="text-white/50">Des témoignages réels, des résultats concrets</p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                prenom: 'Khadija',
                age: 28,
                ville: 'Lyon',
                texte: '"J\'avais essayé d\'autres plateformes. MASR est différent. En 3 semaines, j\'ai reçu 2 propositions avec 89% et 91% de compatibilité. Je suis aujourd\'hui fiancée. Notre première conversation a duré 4 heures."',
              },
              {
                prenom: 'Ibrahim',
                age: 31,
                ville: 'Paris',
                texte: '"Ce qui m\'a convaincu c\'est le questionnaire. Pas de questions superficielles. On parle de foi, de projet de vie, de valeurs. J\'ai su dès le premier match que c\'était sérieux. Marié alhamdulillah."',
              },
              {
                prenom: 'Yasmine',
                age: 26,
                ville: 'Marseille',
                texte: '"Mon wali a pu suivre les échanges depuis le début. La transparence de la plateforme nous a rassuré toute la famille. Le mariage est prévu ce printemps. Barak Allahu fikoum."',
              },
            ].map((t, i) => (
              <FadeUp key={i} delay={i * 0.12}>
                <div className="bg-[#0F0C18] border border-white/8 rounded-2xl p-6">
                  <div className="flex mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={13} className="text-[#C9A84C] fill-[#C9A84C]" />
                    ))}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-5 italic">{t.texte}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
                      <span className="text-[#C9A84C] font-bold text-sm">{t.prenom[0]}</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{t.prenom}, {t.age} ans</p>
                      <p className="text-white/40 text-xs">{t.ville}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TARIFS
      ══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Abonnements</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                Investissez dans votre mariage
              </h2>
              <p className="text-white/50 max-w-xl mx-auto">
                Un mariage réussi vaut infiniment plus que quelques euros par mois.
                Commencez gratuitement — passez Premium quand vous êtes prêt(e).
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {[
              {
                nom: 'Basique',
                prix: '19',
                description: 'Pour commencer votre démarche',
                borderCls: 'border-white/10',
                badge: null,
                items: [
                  '1 profil compatible / semaine',
                  'Score de compatibilité détaillé',
                  'Chat supervisé inclus',
                  'Profil vérifié',
                ],
                cta: 'Commencer',
                ctaCls: 'border border-white/20 text-white hover:bg-white/5',
                scale: '',
              },
              {
                nom: 'Premium',
                prix: '39',
                description: 'Le plus choisi par nos membres',
                borderCls: 'border-[#C9A84C]/50',
                badge: '⭐ Recommandé',
                items: [
                  '2 profils compatibles / semaine',
                  'Analyse IA approfondie',
                  'Chat + mode Wali intégré',
                  'Accès psychologue en ligne',
                  'Support prioritaire',
                ],
                cta: 'Choisir Premium',
                ctaCls: 'bg-[#C9A84C] text-black font-bold hover:bg-[#d4b05a]',
                scale: 'md:scale-105',
              },
              {
                nom: 'Ultra',
                prix: '69',
                description: 'Pour ceux qui veulent aller vite',
                borderCls: 'border-violet-500/40',
                badge: '🚀 Résultats rapides',
                items: [
                  '3 profils compatibles / semaine',
                  'Tout le contenu Premium',
                  'Session imam offerte / mois',
                  'Mise en relation prioritaire',
                  'Accompagnement personnalisé',
                ],
                cta: 'Choisir Ultra',
                ctaCls: 'bg-violet-600 text-white font-bold hover:bg-violet-500',
                scale: '',
              },
            ].map((plan, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className={`relative bg-[#0F0C18] border-2 ${plan.borderCls} rounded-2xl p-7 flex flex-col ${plan.scale}`}>
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-[#C9A84C] text-black whitespace-nowrap">
                      {plan.badge}
                    </div>
                  )}
                  <div className="mb-5">
                    <h3 className="font-serif font-bold text-white text-xl mb-1">{plan.nom}</h3>
                    <p className="text-white/40 text-xs mb-4">{plan.description}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold text-white">{plan.prix}€</span>
                      <span className="text-white/40 text-sm mb-1">/mois</span>
                    </div>
                  </div>
                  <ul className="space-y-3 flex-1 mb-7">
                    {plan.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-white/70">
                        <Check size={14} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/inscription"
                    className={`w-full text-center py-3 rounded-xl text-sm transition-all ${plan.ctaCls}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.3}>
            <p className="text-center text-white/30 text-xs mt-8">
              Sans engagement · Résiliation en 1 clic · Essai gratuit inclus
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-20 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl font-serif font-bold text-center mb-12">Questions fréquentes</h2>
          </FadeUp>
          <div className="space-y-4">
            {[
              {
                q: 'MASR est-il vraiment halal ?',
                r: 'Oui. Toutes les communications sont supervisées par notre IA et notre équipe de modération. Les échanges suivent des étapes progressives : présentation, connaissance, famille, puis visio. À aucun moment il n\'y a de contact direct non encadré. Le wali peut être impliqué à tout moment.',
              },
              {
                q: 'Comment fonctionne l\'algorithme de compatibilité ?',
                r: 'Notre IA analyse votre profil sur 87 dimensions : niveau de pratique, valeurs islamiques, projet conjugal, personnalité, style de vie, ambitions professionnelles et critères physiques. Seuls les profils avec une compatibilité globale ≥75% vous sont proposés.',
              },
              {
                q: 'Combien de temps faut-il pour recevoir un premier match ?',
                r: 'En moyenne 3 à 7 jours après la validation de votre profil et la complétion de votre questionnaire. Notre équipe vérifie chaque profil manuellement avant de l\'activer.',
              },
              {
                q: 'Puis-je annuler mon abonnement à tout moment ?',
                r: 'Oui, sans condition ni préavis. La résiliation se fait en un clic depuis votre tableau de bord. Vous conservez l\'accès jusqu\'à la fin de la période payée.',
              },
              {
                q: 'Mes données sont-elles protégées ?',
                r: 'Absolument. Nous ne partageons jamais vos données personnelles avec des tiers. Vos réponses au questionnaire sont chiffrées et utilisées uniquement par notre algorithme. MASR est conforme RGPD.',
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.05}>
                <details className="bg-[#0F0C18] border border-white/8 rounded-2xl p-5 group">
                  <summary className="text-white font-medium text-sm cursor-pointer flex items-center justify-between list-none">
                    {item.q}
                    <ChevronRight size={16} className="text-white/40 group-open:rotate-90 transition-transform flex-shrink-0 ml-3" />
                  </summary>
                  <p className="text-white/50 text-sm leading-relaxed mt-4 border-t border-white/5 pt-4">
                    {item.r}
                  </p>
                </details>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-[#C9A84C]/5 rounded-full blur-[60px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <FadeUp>
            <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-4">La décision est la vôtre</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
              Votre conjoint(e) idéal(e)
              <br />
              <span className="text-[#C9A84C]">vous attend quelque part.</span>
            </h2>
            <p className="text-xl text-white/60 mb-4 max-w-2xl mx-auto leading-relaxed">
              La question n&apos;est pas de savoir si vous le/la trouverez.
              <br />
              La question est : combien de temps voulez-vous attendre ?
            </p>
            <p className="text-white/40 text-sm mb-10 max-w-xl mx-auto">
              Chaque jour sans agir est un jour de moins avec la personne qui vous correspond vraiment.
              Notre algorithme travaille pour vous — laissez-le faire.
            </p>
            <Link
              href="/inscription"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-[#C9A84C] hover:bg-[#d4b05a] text-black font-bold text-xl rounded-full transition-all shadow-2xl shadow-[#C9A84C]/30 hover:shadow-[#C9A84C]/50 hover:scale-105"
            >
              Trouver ma compatibilité maintenant
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/30 text-xs">
              <span>✓ Gratuit pour commencer</span>
              <span>✓ Résultat en 8 minutes</span>
              <span>✓ Sans carte bancaire</span>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-[#C9A84C] flex items-center justify-center">
                <span className="text-[#C9A84C] font-serif font-bold text-xs">M</span>
              </div>
              <span className="font-serif font-bold text-white">MASR</span>
              <span className="text-white/30 text-xs ml-2">— Mariés au Second Regard</span>
            </div>
            <div className="flex flex-wrap justify-center gap-5 text-white/30 text-xs">
              <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
              <Link href="/cgv" className="hover:text-white transition-colors">CGV</Link>
              <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
              <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
              <Link href="/regles" className="hover:text-white transition-colors">Règles</Link>
            </div>
          </div>
          <p className="text-center text-white/15 text-xs mt-8">
            © 2025 MASR — Tous droits réservés · Plateforme de mariage islamique
          </p>
        </div>
      </footer>
    </div>
  )
}
