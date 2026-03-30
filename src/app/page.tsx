'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, Heart, Shield, Brain, CheckCircle2, ChevronDown, Star, Zap, Users, MessageCircle, ArrowRight } from 'lucide-react'

// ─── Compteur animé ───────────────────────────────────────────────
function Counter({ end, suffix = '', duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = end / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

// ─── FAQ item ────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center p-5 text-left">
        <span className="text-white font-medium pr-4">{q}</span>
        <ChevronDown size={18} className={`text-purple-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden">
            <p className="px-5 pb-5 text-white/60 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Témoignage ──────────────────────────────────────────────────
function Temoignage({ prenom, ville, texte, note }: { prenom: string; ville: string; texte: string; note: number }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex gap-1">
        {Array.from({ length: note }).map((_, i) => (
          <Star key={i} size={14} fill="#a78bfa" className="text-purple-400" />
        ))}
      </div>
      <p className="text-white/70 text-sm leading-relaxed italic">&ldquo;{texte}&rdquo;</p>
      <div className="flex items-center gap-3 mt-auto">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-white font-bold text-sm">
          {prenom[0]}
        </div>
        <div>
          <p className="text-white font-medium text-sm">{prenom}</p>
          <p className="text-white/40 text-xs">{ville}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const steps = [
    { num: '01', icon: Users,    titre: 'Inscription gratuite',    desc: 'Créez votre profil en 2 minutes. Aucune carte bleue requise.', color: 'from-violet-500 to-purple-700' },
    { num: '02', icon: Brain,    titre: 'Questionnaire approfondi', desc: '40 questions sur votre foi, vos valeurs et votre projet de vie.', color: 'from-purple-500 to-fuchsia-700' },
    { num: '03', icon: Sparkles, titre: "L'IA analyse tout",        desc: 'Notre algorithme compare 7 dimensions de compatibilité entre profils.', color: 'from-fuchsia-500 to-pink-600' },
    { num: '04', icon: Heart,    titre: 'Votre match vous attend',  desc: 'Recevez des profils sélectionnés avec un score de compatibilité.', color: 'from-pink-500 to-rose-600' },
  ]

  const plans = [
    {
      nom: 'Essentiel', prix: '19,90', badge: null,
      features: ['3 profils compatibles / mois', '1 mouqabala virtuelle / mois', 'Score de compatibilité détaillé', 'Chat sécurisé supervisé', 'Support email'],
      cta: 'Commencer', highlight: false,
    },
    {
      nom: 'Premium', prix: '29,90', badge: '⭐ Recommandé',
      features: ['10 profils compatibles / mois', '3 mouqabalas virtuelles / mois', 'Score détaillé + analyse IA', 'Chat prioritaire supervisé', 'Accompagnement psychologue', 'Support prioritaire'],
      cta: 'Choisir Premium', highlight: true,
    },
    {
      nom: 'Élite', prix: '49,90', badge: null,
      features: ['Profils illimités', 'Mouqabalas illimitées', 'Analyse IA complète', 'Suivi personnalisé', 'Accès prioritaire aux nouveaux profils', 'Coach mariage dédié'],
      cta: 'Choisir Élite', highlight: false,
    },
  ]

  return (
    <div className="min-h-screen bg-[#060412] text-white overflow-x-hidden">

      {/* ─── NAVBAR ──────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-[#060412]/80 border-b border-white/5">
        <span className="font-serif text-xl font-bold text-white">
          Mariés<span className="text-purple-400"> au Second Regard</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/connexion" className="text-white/60 hover:text-white text-sm font-medium transition-colors px-4 py-2">
            Connexion
          </Link>
          <Link href="/inscription" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-purple-900/50">
            Inscription gratuite →
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">

        {/* Orbes animées */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-purple-600 opacity-10 blur-[100px] animate-orb pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-violet-700 opacity-10 blur-[100px] animate-orb-slow pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-fuchsia-800 opacity-5 blur-[120px] pointer-events-none" />

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 text-sm text-purple-300 mb-8">
          <Sparkles size={14} />
          <span>Plateforme de mariage islamique avec IA haute performance</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center text-5xl md:text-7xl font-serif font-bold leading-tight max-w-5xl">
          Votre futur conjoint<br />
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">vous attend déjà.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 text-center text-xl text-white/50 max-w-2xl leading-relaxed">
          Une équipe de psychologues musulmans et une IA haute performance analysent{' '}
          <strong className="text-white/80">7 dimensions de compatibilité</strong> pour vous trouver le profil idéal à +87%.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/inscription"
            className="group flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-purple-900/50 hover:shadow-purple-900/80 hover:-translate-y-0.5">
            Je m&apos;inscris gratuitement
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#comment-ca-marche" className="text-white/50 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5">
            Voir comment ça marche <ChevronDown size={14} />
          </a>
        </motion.div>

        {/* Éléments flottants décoratifs */}
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-32 left-8 md:left-24 w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 items-center justify-center backdrop-blur-sm hidden md:flex">
          <Heart size={24} className="text-purple-400" />
        </motion.div>
        <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-48 right-8 md:right-24 w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 items-center justify-center backdrop-blur-sm hidden md:flex">
          <Shield size={24} className="text-violet-400" />
        </motion.div>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-32 left-16 md:left-40 w-14 h-14 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 items-center justify-center backdrop-blur-sm hidden md:flex">
          <Brain size={20} className="text-fuchsia-400" />
        </motion.div>
        <motion.div animate={{ y: [0, 14, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute bottom-40 right-16 md:right-40 w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 items-center justify-center backdrop-blur-sm hidden md:flex">
          <Zap size={20} className="text-purple-400" />
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            { val: 2847, suf: '+', label: 'Membres actifs' },
            { val: 87,   suf: '%', label: 'Compatibilité moyenne' },
            { val: 312,  suf: '',  label: 'Couples formés' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                <Counter end={s.val} suffix={s.suf} />
              </p>
              <p className="text-white/40 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── LE PROBLÈME ─────────────────────────────────────── */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-purple-400 font-medium text-sm tracking-widest uppercase mb-4">La réalité</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8">
              Trouver un conjoint sérieux<br />ne devrait pas être un{' '}
              <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">combat.</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: '😓', titre: 'Les applications classiques', desc: 'Des milliers de profils au hasard, sans filtre islamique, sans sérieux. Du temps perdu.' },
              { icon: '🤝', titre: 'La famille et le cercle proche', desc: 'Limité géographiquement. Peu de choix. Pression sociale. Compatibilité non analysée.' },
              { icon: '🕌', titre: 'Les associations locales', desc: 'Processus lent, peu de profils, aucun outil pour mesurer la compatibilité réelle.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6 text-left">
                <p className="text-3xl mb-3">{item.icon}</p>
                <p className="text-white font-semibold mb-2">{item.titre}</p>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-8 p-6 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
            <p className="text-white text-lg font-medium">
              Mariés au Second Regard a été conçu pour répondre à ce manque —
              <span className="text-purple-300"> une approche islamique sérieuse, guidée par la science et l&apos;IA.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ───────────────────────────────── */}
      <section id="comment-ca-marche" className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <p className="text-purple-400 font-medium text-sm tracking-widest uppercase mb-4">Le processus</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold">Comment ça marche ?</h2>
            <p className="text-white/50 mt-4 text-lg max-w-2xl mx-auto">De l&apos;inscription à votre premier échange — en 4 étapes simples.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}
                  className="group relative bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/40 rounded-2xl p-7 transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-white/20 tracking-widest">{step.num}</span>
                        <h3 className="text-white font-bold text-lg">{step.titre}</h3>
                      </div>
                      <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-8 flex items-center justify-center gap-3 text-white/50 text-sm">
            <CheckCircle2 size={16} className="text-green-400" />
            <span>Étapes 1 &amp; 2 entièrement gratuites — aucune carte bancaire requise</span>
          </motion.div>
        </div>
      </section>

      {/* ─── NOTRE DIFFÉRENCE ────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <p className="text-purple-400 font-medium text-sm tracking-widest uppercase mb-4">Notre différence</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold">
              Pas un site de rencontres.<br />
              <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">Une plateforme de mariages.</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Brain,    titre: 'IA + Psychologues',      desc: 'Notre algorithme combine intelligence artificielle et expertise de psychologues musulmans spécialisés en couples.' },
              { icon: Shield,   titre: '100% halal',             desc: 'Aucun échange de coordonnées, supervision des conversations, clause pénale — votre sécurité est notre priorité.' },
              { icon: Sparkles, titre: '7 dimensions analysées', desc: 'Foi, personnalité, projet de vie, communication, style de vie, carrière, physique — une compatibilité réelle et mesurée.' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  className="text-center p-8 bg-white/5 border border-white/10 hover:border-purple-500/40 rounded-2xl transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-5 group-hover:bg-purple-500/30 transition-colors">
                    <Icon size={26} className="text-purple-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-3">{item.titre}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── TÉMOIGNAGES ─────────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <p className="text-purple-400 font-medium text-sm tracking-widest uppercase mb-4">Témoignages</p>
            <h2 className="text-4xl font-serif font-bold">Ils ont trouvé leur moitié.</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            <Temoignage prenom="Fatima" ville="Lyon" note={5}
              texte="J'avais essayé d'autres plateformes sans succès. Ici, dès le premier profil proposé, j'ai senti que c'était sérieux. Mariés depuis 6 mois, bientôt inshallah." />
            <Temoignage prenom="Youssef" ville="Paris" note={5}
              texte="Le questionnaire est profond, les profils sont vraiment compatibles. Ce n'est pas du tout comme les applis classiques. Alhamdulillah, j'ai rencontré ma femme ici." />
            <Temoignage prenom="Nadia" ville="Marseille" note={5}
              texte="Ce qui m'a convaincue c'est la supervision. Je savais que j'étais protégée. Le score était à 91% — et on se comprend vraiment." />
          </div>
        </div>
      </section>

      {/* ─── TARIFS ──────────────────────────────────────────── */}
      <section id="tarifs" className="py-24 px-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-700 opacity-5 blur-[120px]" />
        </div>
        <div className="max-w-5xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10">
            <p className="text-purple-400 font-medium text-sm tracking-widest uppercase mb-4">Tarifs</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold">Investissez dans votre avenir.</h2>
            <p className="text-white/50 mt-4 max-w-xl mx-auto">
              Inscription et questionnaire <strong className="text-white">100% gratuits.</strong>{' '}
              Abonnement requis pour recevoir vos profils compatibles.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mb-10 flex items-center justify-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl p-4 max-w-lg mx-auto">
            <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
            <p className="text-sm text-white/70">
              <span className="text-white font-semibold">Inscription + Questionnaire gratuits.</span>{' '}
              Abonnement pour recevoir vos matchs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-7 flex flex-col ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-purple-600/30 to-violet-900/20 border-2 border-purple-500/60 shadow-xl shadow-purple-900/30'
                    : 'bg-white/5 border border-white/10'
                }`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-white font-bold text-xl mb-1">{plan.nom}</h3>
                  <div className="flex items-end gap-1 mt-3">
                    <span className="text-4xl font-bold text-white">{plan.prix}€</span>
                    <span className="text-white/40 text-sm mb-1.5">/ mois</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2.5 text-sm text-white/70">
                      <CheckCircle2 size={15} className="text-purple-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/inscription"
                  className={`w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white shadow-lg shadow-purple-900/50'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold">Questions fréquentes</h2>
          </motion.div>
          <div className="space-y-3">
            <FAQItem q="Est-ce que l'inscription est vraiment gratuite ?"
              a="Oui, totalement. Vous créez votre profil et complétez le questionnaire sans aucun frais. L'abonnement est requis uniquement pour recevoir vos profils compatibles et commencer les échanges." />
            <FAQItem q="Comment l'IA calcule-t-elle la compatibilité ?"
              a="Notre algorithme analyse 7 dimensions : foi & pratique, personnalité, projet de vie, style de communication, style de vie, ambitions professionnelles, et préférences physiques. Chaque dimension est pondérée et croisée avec le profil du partenaire potentiel." />
            <FAQItem q="Les conversations sont-elles supervisées ?"
              a="Oui. Toutes les conversations sont supervisées en temps réel par notre IA. Tout échange de coordonnées personnelles est immédiatement bloqué et entraîne un bannissement définitif, conformément à nos CGU." />
            <FAQItem q="La plateforme est-elle réservée aux musulmans pratiquants ?"
              a="La plateforme s'adresse à toute personne musulmane cherchant un mariage sérieux, quel que soit son niveau de pratique. Notre questionnaire s'adapte à chaque profil." />
            <FAQItem q="Puis-je annuler mon abonnement à tout moment ?"
              a="Oui, sans engagement. Vous pouvez annuler depuis votre espace personnel ou en nous contactant. L'accès reste actif jusqu'à la fin de la période payée." />
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ───────────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-purple-600 opacity-10 blur-[100px]" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        <div className="max-w-2xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-900/50 animate-float">
              <Heart size={36} className="text-white" fill="white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Votre histoire<br />
              <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">commence ici.</span>
            </h2>
            <p className="text-white/50 text-lg mb-10 leading-relaxed">
              Rejoignez les milliers de musulmans qui ont fait confiance à Mariés au Second Regard pour trouver leur moitié.
            </p>
            <Link href="/inscription"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-xl px-10 py-5 rounded-2xl transition-all duration-300 shadow-2xl shadow-purple-900/60 hover:-translate-y-1">
              Commencer gratuitement
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="mt-4 text-white/30 text-sm">Aucune carte bancaire requise · Inscription en 2 minutes</p>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-white/30 text-sm">
          <span className="font-serif font-bold text-white/60">Mariés au Second Regard</span>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
            <a href="mailto:contact@mariesausecondregard.fr" className="hover:text-white transition-colors">Contact</a>
          </div>
          <span>© 2026 Mariés au Second Regard</span>
        </div>
      </footer>
    </div>
  )
}
