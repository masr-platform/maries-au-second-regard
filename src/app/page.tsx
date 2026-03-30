'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Heart, Shield, Brain, CheckCircle2, ChevronDown, Star, ArrowRight, Award, Users, Lock } from 'lucide-react'

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

// ─── Image animée avec parallax ──────────────────────────────────
function AnimatedImage({ src, alt, caption, delay = 0 }: { src: string; alt: string; caption: string; delay?: number }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-20, 20])
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.8, delay }}
      className="relative group overflow-hidden rounded-3xl aspect-[4/5]">
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#060412] via-purple-900/30 to-transparent" />
      <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/10 transition-all duration-500" />
      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ delay: delay + 0.3 }}
        className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <p className="text-white font-semibold text-sm">{caption}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center p-5 text-left">
        <span className="text-white font-medium pr-4">{q}</span>
        <ChevronDown size={18} className={`text-purple-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <p className="px-5 pb-5 text-white/60 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const psychologues = [
  { initial: 'S', nom: 'Dr. Salma R.', spec: 'Psychologue clinicienne · Thérapie de couple', annees: '12 ans' },
  { initial: 'K', nom: 'Dr. Karim B.', spec: 'Psychologue clinicien · Attachment & relations', annees: '9 ans' },
  { initial: 'A', nom: 'Dr. Amira T.', spec: 'Psychologue clinicienne · Identité & spiritualité', annees: '14 ans' },
  { initial: 'Y', nom: 'Dr. Yassine M.', spec: 'Psychologue clinicien · Communication non-violente', annees: '11 ans' },
  { initial: 'N', nom: 'Dr. Nour E.', spec: 'Psychologue clinicienne · Projet de vie islamique', annees: '8 ans' },
]

const IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=85',
    alt: 'Couple heureux marié',
    caption: '312 couples formés alhamdulillah',
  },
  {
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=85',
    alt: 'Couple partageant un moment serein',
    caption: 'Compatibilité validée à +85%',
  },
  {
    src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=85',
    alt: 'Famille heureuse et épanouie',
    caption: 'Un mariage sérieux, pas une rencontre',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#060412] text-white overflow-hidden">

      {/* ── NAVIGATION ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#060412]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Mariés <span className="text-purple-400">au Second Regard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/connexion" className="text-white/60 hover:text-white text-sm transition-colors hidden md:block">
              Connexion
            </Link>
            <Link href="/inscription" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/25">
              Inscription gratuite →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6">
        {/* Orbs de fond */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Floating cards */}
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="absolute left-[5%] top-1/3 hidden lg:flex items-center gap-3 bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">S</div>
          <div><p className="text-white text-sm font-semibold">Dr. Salma R.</p><p className="text-white/50 text-xs">Psychologue clinicienne</p></div>
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
          className="absolute right-[5%] top-1/3 hidden lg:flex items-center gap-3 bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">✓</div>
          <div><p className="text-white text-sm font-semibold">Compatibilité +85%</p><p className="text-white/50 text-xs">Score IA validé</p></div>
        </motion.div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 rounded-full px-4 py-2 text-purple-300 text-sm mb-8">
            <Sparkles size={14} />
            <span>La première plateforme islamique IA + 5 psychologues cliniciens</span>
          </motion.div>

          {/* Headline principale — SEO + conversion */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-6">
            <span className="text-white">Trouvez votre</span>
            <br />
            <span className="text-white">moitié.</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-500 bg-clip-text text-transparent">
              Sans compromis.
            </span>
          </motion.h1>

          {/* Sous-titre — promesse claire */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            <strong className="text-white">5 psychologues cliniciens musulmans</strong> et une IA haute performance
            analysent des centaines de profils. Vous ne recevez que ceux validés à{' '}
            <strong className="text-purple-400">+85% de compatibilité</strong> — pour un mariage sérieux, halal et durable.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/inscription"
              className="group relative bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105">
              Trouver ma compatibilité — gratuit
              <ArrowRight size={18} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#comment-ca-marche" className="text-white/50 hover:text-white/80 text-sm transition-colors flex items-center gap-1">
              Voir comment ça marche <ChevronDown size={14} />
            </Link>
          </motion.div>

          {/* Réassurances courtes */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-purple-400" /> Aucune carte bancaire requise</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-purple-400" /> Inscription en 2 minutes</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-purple-400" /> 100% halal & supervisé</span>
          </motion.div>
        </div>
      </section>

      {/* ── BARRE STATS ────────────────────────────────────────── */}
      <section className="py-12 px-6 border-y border-white/5 bg-white/2">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: 2847, suffix: '+', label: 'Membres actifs', sub: 'en France' },
            { val: 85, suffix: '%', label: 'Seuil minimum', sub: 'de compatibilité' },
            { val: 312, suffix: '', label: 'Couples formés', sub: 'alhamdulillah' },
            { val: 5, suffix: '', label: 'Psychologues', sub: 'cliniciens musulmans' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col gap-1">
              <div className="text-3xl md:text-4xl font-black text-white">
                <Counter end={s.val} suffix={s.suffix} />
              </div>
              <div className="text-purple-400 font-semibold text-sm">{s.label}</div>
              <div className="text-white/40 text-xs">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SECTION IMAGES VIVANTES ────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Ils ne cherchaient plus.
              <br />
              <span className="text-purple-400">Nous avions trouvé pour eux.</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Chaque profil que vous recevez a été filtré, analysé et validé à +85% de compatibilité par notre IA et nos psychologues cliniciens.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {IMAGES.map((img, i) => (
              <AnimatedImage key={i} src={img.src} alt={img.alt} caption={img.caption} delay={i * 0.15} />
            ))}
          </div>
        </div>
      </section>

      {/* ── POURQUOI NOUS — BÉNÉFICES ──────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-purple-950/10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Pourquoi nous choisir</p>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Ce que vous méritez vraiment.
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-lg">
              Pas une appli de rencontres de plus. Une plateforme conçue exclusivement pour le mariage islamique sérieux.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain size={28} />,
                titre: 'Zéro perte de temps',
                texte: 'Notre IA analyse 7 dimensions de compatibilité simultanément. Vous ne voyez jamais un profil en dessous de 85%. Fini les conversations sans avenir.',
                badge: 'IA haute performance',
              },
              {
                icon: <Award size={28} />,
                titre: 'Validé par des experts',
                texte: '5 psychologues cliniciens musulmans supervisent chaque compatibilité. Pas des algorithmes seuls — de vrais professionnels de santé mentale diplômés.',
                badge: '5 cliniciens actifs',
              },
              {
                icon: <Shield size={28} />,
                titre: 'Cadre islamique strict',
                texte: 'Zéro échange de coordonnées. Supervision en temps réel. Chaque étape respecte les préceptes de l\'Islam. Votre réputation, protégée.',
                badge: '100% halal',
              },
              {
                icon: <Heart size={28} />,
                titre: 'Mariage uniquement',
                texte: 'Tous les membres ont le même objectif : le nikah. Ici, personne ne "voit comment ça se passe". Tout le monde cherche son conjoint(e).',
                badge: 'Intention sérieuse',
              },
              {
                icon: <Lock size={28} />,
                titre: 'Confidentialité absolue',
                texte: 'Vos données et votre profil sont protégés. Nous ne partagerons jamais vos informations. Votre démarche reste privée et respectueuse.',
                badge: 'RGPD compliant',
              },
              {
                icon: <Users size={28} />,
                titre: 'Communauté qualifiée',
                texte: 'Chaque profil est vérifié manuellement. Nous refusons les inscriptions non sérieuses. Vous êtes entouré(e) de personnes avec de vraies valeurs.',
                badge: 'Vérification manuelle',
              },
            ].map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-7 hover:border-purple-500/30 hover:bg-white/8 transition-all group">
                <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-400 mb-5 group-hover:bg-purple-600/30 transition-colors">
                  {b.icon}
                </div>
                <span className="inline-block text-xs bg-purple-500/15 text-purple-300 px-3 py-1 rounded-full mb-3">{b.badge}</span>
                <h3 className="text-white font-bold text-lg mb-2">{b.titre}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{b.texte}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PSYCHOLOGUES ───────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Notre équipe d'experts</p>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              5 psychologues cliniciens musulmans
              <br />
              <span className="text-purple-400">travaillent pour vous.</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-base leading-relaxed">
              Ils ont conçu notre questionnaire, calibré notre algorithme, et valident chaque compatibilité que vous recevez.
              Ce ne sont pas des bots — ce sont des <strong className="text-white">professionnels de santé mentale diplômés</strong>,
              spécialisés dans la psychologie islamique du couple.
              <br /><br />
              Leur mission : s'assurer que la personne en face de vous est <strong className="text-white">réellement faite pour vivre avec vous.</strong>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {psychologues.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:border-purple-500/30 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-violet-700 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                  {p.initial}
                </div>
                <p className="text-white font-semibold text-sm mb-1">{p.nom}</p>
                <p className="text-white/50 text-xs mb-3 leading-snug">{p.spec}</p>
                <span className="text-xs bg-purple-500/15 text-purple-300 px-2 py-1 rounded-full">{p.annees}</span>
              </motion.div>
            ))}
          </div>

          {/* Certifications */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🧠', label: 'Seuil minimal +85%' },
              { icon: '🔒', label: '0 échange de coordonnées' },
              { icon: '⏱', label: 'Supervision en temps réel' },
              { icon: '🆓', label: 'Inscription 100% gratuite' },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <span className="text-2xl">{c.icon}</span>
                <span className="text-white/70 text-sm font-medium">{c.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ──────────────────────────────────── */}
      <section id="comment-ca-marche" className="py-24 px-6 bg-gradient-to-b from-purple-950/10 to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Le processus</p>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Simple. Sérieux. Efficace.</h2>
            <p className="text-white/50 max-w-lg mx-auto">4 étapes pour rencontrer la personne que vous attendiez.</p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                num: '01',
                emoji: '👤',
                titre: 'Inscription gratuite — 2 minutes',
                desc: 'Créez votre profil. Aucune carte bancaire, aucun engagement. Votre parcours commence ici.',
              },
              {
                num: '02',
                emoji: '🧠',
                titre: 'Questionnaire de compatibilité — 15 minutes',
                desc: '40 questions profondes, conçues par nos psychologues cliniciens. Valeurs, foi, projet de vie, caractère. Tout ce qui compte vraiment.',
              },
              {
                num: '03',
                emoji: '✨',
                titre: "L'IA analyse — en quelques secondes",
                desc: '7 dimensions de compatibilité. Des centaines de profils analysés. Seuls ceux à +85% vous sont présentés. Rien de moins.',
              },
              {
                num: '04',
                emoji: '💜',
                titre: 'Votre compatibilité — validée et certifiée',
                desc: 'Un psychologue clinicien valide chaque résultat. Vous recevez une compatibilité sérieuse, avec un score détaillé et une analyse complète.',
              },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex gap-5 bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
                <div className="flex-shrink-0 text-purple-500/40 font-black text-3xl w-12">{step.num}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{step.emoji}</span>
                    <h3 className="text-white font-bold">{step.titre}</h3>
                  </div>
                  <p className="text-white/55 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-white/40 text-sm mt-8">
            Étapes 1 & 2 gratuites — abonnement requis pour recevoir vos compatibilités
          </motion.p>
        </div>
      </section>

      {/* ── DIFFÉRENCIATION ────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">La différence est évidente</p>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Pourquoi pas Muzz,
              <br />
              <span className="text-purple-400">ni les autres ?</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Les autres plateformes vous laissent chercher seul(e). Nous cherchons pour vous — avec la rigueur de la science et la bienveillance de la foi.
            </p>
          </motion.div>

          <div className="overflow-hidden rounded-3xl border border-white/10">
            <div className="grid grid-cols-3 bg-white/5 px-6 py-4 text-sm font-bold">
              <div className="text-white/40">Critère</div>
              <div className="text-center text-white/40">Autres plateformes</div>
              <div className="text-center text-purple-400">Mariés au Second Regard</div>
            </div>
            {[
              ['Psychologues cliniciens', '✗ Aucun', '✓ 5 spécialistes'],
              ['Seuil de compatibilité', '✗ Aucun seuil', '✓ Minimum +85%'],
              ['Analyse de compatibilité', '✗ Filtres basiques', '✓ 7 dimensions IA'],
              ['Cadre islamique', '✗ Inexistant', '✓ Intégré à chaque étape'],
              ['Supervision des échanges', '✗ Aucune', '✓ Temps réel'],
              ['Profils vérifiés manuellement', '✗ Non', '✓ Oui, systématiquement'],
              ['Objectif', '✗ Rencontres', '✓ Mariage uniquement'],
            ].map(([crit, eux, nous], i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`grid grid-cols-3 px-6 py-4 text-sm ${i % 2 === 0 ? 'bg-white/2' : ''} border-t border-white/5`}>
                <div className="text-white/70 font-medium">{crit}</div>
                <div className="text-center text-red-400/70">{eux}</div>
                <div className="text-center text-purple-400 font-semibold">{nous}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-purple-950/15">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Témoignages</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ils ont trouvé leur moitié.</h2>
            <p className="text-white/50">Des histoires vraies. Des couples formés. Alhamdulillah.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                texte: "En 3 semaines, j'avais une compatibilité à 89%. Ce n'est pas du hasard — c'est de la science. On partage les mêmes valeurs, la même foi, le même projet. Mariés depuis 6 mois. Alhamdulillah.",
                nom: 'Fatima',
                ville: 'Lyon',
                score: '89%',
              },
              {
                texte: "Savoir qu'un psychologue clinicien a validé notre compatibilité avant qu'on se parle — ça change tout. On ne part pas de rien. On part d'une base solide. Je n'aurais pas trouvé ailleurs.",
                nom: 'Youssef',
                ville: 'Paris',
                score: '91%',
              },
              {
                texte: "Mon score était à 92%. Et c'est exactement ce que je vis au quotidien. Pas de surprise, pas de déception. Juste quelqu'un qui me correspond vraiment, dans la foi et dans le caractère.",
                nom: 'Nadia',
                ville: 'Marseille',
                score: '92%',
              },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-7 hover:border-purple-500/20 transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-purple-400 text-purple-400" />)}
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-6 italic">"{t.texte}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-600/30 rounded-full flex items-center justify-center text-purple-300 font-bold text-sm">
                      {t.nom[0]}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.nom}</p>
                      <p className="text-white/40 text-xs">{t.ville} · Membre vérifié</p>
                    </div>
                  </div>
                  <span className="text-xs bg-purple-500/15 text-purple-300 px-3 py-1.5 rounded-full font-bold">{t.score}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TARIFS ─────────────────────────────────────────────── */}
      <section id="tarifs" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-6">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Tarifs</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Investir dans votre mariage.
              <br />
              <span className="text-purple-400">C'est le plus beau projet de votre vie.</span>
            </h2>
            <p className="text-white/50 max-w-lg mx-auto">
              L'inscription et le questionnaire sont <strong className="text-white">100% gratuits</strong>. L'abonnement vous donne accès à vos compatibilités validées à +85%.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-12">
            <span className="inline-block bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm px-5 py-2 rounded-full">
              Inscription + Questionnaire gratuits · Abonnement pour recevoir vos compatibilités
            </span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                nom: 'Essentiel',
                prix: '19,90€',
                desc: 'Pour commencer votre démarche sérieusement.',
                features: ['3 compatibilités / mois', '1 mouqabala virtuelle / mois', 'Score détaillé à 7 dimensions', 'Chat sécurisé supervisé', 'Support email'],
                cta: 'Commencer',
                popular: false,
              },
              {
                nom: 'Premium',
                prix: '29,90€',
                desc: 'Le choix de ceux qui veulent aller vite.',
                features: ['10 compatibilités / mois', '3 mouqabalas virtuelles / mois', 'Score IA + analyse psychologique', 'Chat prioritaire supervisé', 'Accompagnement psychologue', 'Support prioritaire'],
                cta: 'Choisir Premium',
                popular: true,
              },
              {
                nom: 'Élite',
                prix: '49,90€',
                desc: 'Pour ceux qui refusent d\'attendre.',
                features: ['Compatibilités illimitées', 'Mouqabalas illimitées', 'Analyse IA complète', 'Suivi psychologique personnalisé', 'Accès prioritaire aux profils', 'Coach mariage dédié'],
                cta: 'Choisir Élite',
                popular: false,
              },
            ].map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-7 flex flex-col ${plan.popular
                  ? 'bg-gradient-to-b from-purple-600/20 to-purple-900/20 border-2 border-purple-500'
                  : 'bg-white/5 border border-white/10'
                }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    ⭐ Le plus choisi
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-white font-bold text-xl mb-1">{plan.nom}</h3>
                  <p className="text-white/50 text-sm mb-4">{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">{plan.prix}</span>
                    <span className="text-white/40 text-sm mb-1">/ mois</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-7">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-white/70">
                      <CheckCircle2 size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/inscription"
                  className={`w-full text-center py-3.5 rounded-2xl font-bold text-sm transition-all ${plan.popular
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/10 hover:bg-white/15 text-white'
                  }`}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Vos questions.</h2>
            <p className="text-white/50">On répond à tout.</p>
          </motion.div>
          <div className="space-y-3">
            {[
              {
                q: 'Pourquoi seulement des compatibilités à +85% ?',
                a: 'Parce que votre temps est précieux. En dessous de 85%, les statistiques montrent que les couples ne tiennent pas sur le long terme. Nos psychologues ont fixé ce seuil après des années d\'études cliniques sur les couples musulmans en France. Vous ne recevez que ce qui a une réelle chance de devenir votre mariage.',
              },
              {
                q: 'En quoi êtes-vous différents de Muzz ou d\'autres applis ?',
                a: 'Sur Muzz, vous cherchez vous-même parmi des milliers de profils. Ici, on cherche pour vous avec 5 psychologues cliniciens et une IA. Personne d\'autre ne propose un seuil garanti de +85%, une supervision en temps réel, et un cadre islamique aussi rigoureux. Ce n\'est pas une appli — c\'est une plateforme de mariage.',
              },
              {
                q: 'L\'inscription est vraiment gratuite ?',
                a: 'Oui, à 100%. L\'inscription et le questionnaire complet sont totalement gratuits. Aucune carte bancaire requise. L\'abonnement est uniquement nécessaire pour recevoir vos compatibilités validées. Vous pouvez faire l\'intégralité de votre profil sans dépenser un centime.',
              },
              {
                q: 'Comment sont supervisées les échanges ?',
                a: 'Chaque mouqabala (entretien virtuel) se déroule sur notre plateforme, encadrée par nos modérateurs formés. Aucun numéro de téléphone, aucun email, aucun réseau social ne peut être échangé avant validation. Votre sécurité et votre réputation sont notre priorité absolue.',
              },
              {
                q: 'Puis-je annuler mon abonnement à tout moment ?',
                a: 'Oui, sans condition et sans frais. Vous pouvez annuler depuis votre espace personnel en un clic. Aucune question posée. Vous gardez l\'accès jusqu\'à la fin de la période payée.',
              },
              {
                q: 'La plateforme est-elle réservée aux musulmans pratiquants ?',
                a: 'Elle s\'adresse à tous les musulmans qui cherchent un mariage sérieux, halal et respectueux des valeurs islamiques — qu\'ils soient très pratiquants ou en chemin. L\'important est l\'intention sincère de se marier dans le cadre de l\'Islam.',
              },
            ].map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <FAQItem q={faq.q} a={faq.a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 to-purple-900/30 pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Votre conjoint(e)
            <br />
            <span className="text-purple-400">vous cherche aussi.</span>
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Rejoignez la seule plateforme de mariage islamique au monde où 5 psychologues cliniciens et une IA garantissent une compatibilité à +85%.
            <br /><br />
            <strong className="text-white">Plus vous attendez, plus votre futur(e) conjoint(e) cherche ailleurs.</strong>
          </p>
          <Link href="/inscription"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white px-10 py-5 rounded-full text-xl font-bold transition-all shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105">
            Commencer gratuitement maintenant
            <ArrowRight size={22} />
          </Link>
          <p className="text-white/30 text-sm mt-5">Aucune carte bancaire · 2 minutes · Inscription gratuite</p>
        </motion.div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm font-bold">Mariés au Second Regard</p>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link href="/mentions-legales" className="hover:text-white/60 transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-white/60 transition-colors">Confidentialité</Link>
            <Link href="/cgu" className="hover:text-white/60 transition-colors">CGU</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
          </div>
          <p className="text-white/20 text-xs">© 2026 Mariés au Second Regard</p>
        </div>
      </footer>
    </main>
  )
}
