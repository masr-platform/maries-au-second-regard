'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Heart, Shield, Brain, CheckCircle2, ChevronDown, Star, ArrowRight, Award, BookOpen, Microscope } from 'lucide-react'

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
      {/* Image avec parallax */}
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </motion.div>
      {/* Overlay violet */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060412] via-purple-900/30 to-transparent" />
      {/* Hover glow */}
      <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/10 transition-all duration-500" />
      {/* Caption */}
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

// URLs Unsplash libres de droits — couples respectueux et positifs
const IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=85',
    alt: 'Couple main dans la main',
    caption: 'Compatibilité validée à +85%',
  },
  {
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=85',
    alt: 'Couple heureux ensemble',
    caption: 'Analysé par nos psychologues',
  },
  {
    src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=85',
    alt: 'Couple qui se regarde',
    caption: 'Un projet de mariage sérieux',
  },
]

export default function LandingPage() {
  const plans = [
    {
      nom: 'Essentiel', prix: '19,90', badge: null,
      features: ['3 compatibilités / mois', '1 mouqabala virtuelle / mois', 'Score détaillé à 7 dimensions', 'Chat sécurisé supervisé', 'Support email'],
      cta: 'Commencer', highlight: false,
    },
    {
      nom: 'Premium', prix: '29,90', badge: '⭐ Le plus choisi',
      features: ['10 compatibilités / mois', '3 mouqabalas virtuelles / mois', 'Score IA + analyse psychologique', 'Chat prioritaire supervisé', 'Accompagnement par un psychologue', 'Support prioritaire'],
      cta: 'Choisir Premium', highlight: true,
    },
    {
      nom: 'Élite', prix: '49,90', badge: null,
      features: ['Compatibilités illimitées', 'Mouqabalas illimitées', 'Analyse IA complète', 'Suivi psychologique personnalisé', 'Accès prioritaire aux nouveaux profils', 'Coach mariage dédié'],
      cta: 'Choisir Élite', highlight: false,
    },
  ]

  return (
    <div className="min-h-screen bg-[#060412] text-white overflow-x-hidden">

      {/* ─── NAVBAR ──────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-[#060412]/80 border-b border-white/5">
        <span className="font-serif text-xl font-bold">Mariés<span className="text-purple-400"> au Second Regard</span></span>
        <div className="flex items-center gap-3">
          <Link href="/connexion" className="text-white/50 hover:text-white text-sm transition-colors px-4 py-2">Connexion</Link>
          <Link href="/inscription" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-900/50">
            Inscription gratuite →
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-10 overflow-hidden">
        {/* Orbes de fond */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-700 opacity-10 blur-[120px] animate-orb pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-800 opacity-10 blur-[100px] animate-orb-slow pointer-events-none" />

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex items-center gap-2 bg-purple-500/15 border border-purple-500/40 rounded-full px-5 py-2 text-sm text-purple-300 mb-8 font-medium">
          <Sparkles size={14} className="text-purple-400" />
          <span>La première plateforme islamique IA + 5 psychologues cliniciens</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center text-5xl md:text-7xl font-serif font-bold leading-[1.1] max-w-5xl">
          Nous ne vous présentons<br />que la certitude :<br />
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
            une compatibilité à +85%.
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 text-center text-xl text-white/55 max-w-2xl leading-relaxed">
          <strong className="text-white">5 psychologues cliniciens musulmans</strong> et une IA haute performance analysent des centaines de profils.
          Vous ne recevez que ceux <strong className="text-purple-300">validés à +85% de compatibilité</strong> — rien de moins.
        </motion.p>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/inscription"
            className="group flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-lg px-9 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-purple-900/60 hover:-translate-y-0.5">
            Trouver ma compatibilité
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#images" className="text-white/40 hover:text-white/70 text-sm transition-colors flex items-center gap-1.5">
            Voir la plateforme <ChevronDown size={14} />
          </a>
        </motion.div>

        {/* Badges flottants */}
        <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-36 left-8 md:left-20 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-3 hidden md:flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-xs font-bold">S</div>
          <div><p className="text-white text-xs font-semibold">Dr. Salma R.</p><p className="text-white/40 text-xs">Psychologue clinicienne</p></div>
        </motion.div>
        <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-48 right-8 md:right-20 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-3 hidden md:flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center"><Brain size={16} className="text-white" /></div>
          <div><p className="text-white text-xs font-semibold">Compatibilité +85%</p><p className="text-white/40 text-xs">Score IA validé</p></div>
        </motion.div>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-24 left-12 md:left-32 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-3 hidden md:flex items-center gap-2">
          <Shield size={16} className="text-purple-400" /><p className="text-white text-xs font-semibold">100% Halal & supervisé</p>
        </motion.div>
        <motion.div animate={{ y: [0, 14, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute bottom-36 right-12 md:right-32 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-3 hidden md:flex items-center gap-2">
          <Heart size={16} className="text-pink-400" fill="#f472b6" /><p className="text-white text-xs font-semibold">312 couples formés</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-20 flex flex-wrap justify-center gap-10 md:gap-20">
          {[
            { val: 2847, suf: '+', label: 'Membres actifs' },
            { val: 85,   suf: '%', label: 'Seuil minimum de compatibilité' },
            { val: 312,  suf: '',  label: 'Couples formés' },
            { val: 5,    suf: '',  label: 'Psychologues cliniciens' },
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

      {/* ─── BANDE DE CONFIANCE ──────────────────────────────── */}
      <div className="border-y border-white/5 bg-white/3 py-5 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-sm text-white/40">
          {['5 psychologues cliniciens musulmans', 'Seuil minimal +85% de compatibilité', '0 échange de coordonnées', 'Supervisé en temps réel', 'Inscription 100% gratuite'].map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-purple-500" />{item}
            </span>
          ))}
        </div>
      </div>

      {/* ─── 3 IMAGES ANIMÉES ─────────────────────────────────── */}
      <section id="images" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <p className="text-purple-400 font-medium text-sm tracking-widest uppercase mb-4">Leur histoire</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold">
              Ils ne cherchaient plus.<br />
              <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">Nous avons trouvé pour eux.</span>
            </h2>
            <p className="text-white/45 mt-4 text-lg max-w-xl mx-auto">
              Chaque profil que vous recevez a été filtré, analysé et validé à +85% de compatibilité par notre IA et nos psychologues cliniciens.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {IMAGES.map((img, i) => (
              <AnimatedImage key={i} src={img.src} alt={img.alt} caption={img.caption} delay={i * 0.15} />
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-10 text-center">
            <Link href="/inscription"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-all text-sm">
              Je veux ma compatibilité <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── PSYCHOLOGUES ─────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-violet-700 opacity-5 blur-[140px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/25 rounded-full px-4 py-1.5 text-purple-300 text-sm font-medium mb-6">
              <Award size={14} /> Ce qui nous rend uniques au monde
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
              Pour la première fois,<br />
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-violet-400 bg-clip-text text-transparent">
                la science du couple<br />au service du mariage islamique.
              </span>
            </h2>
            <p className="text-white/50 text-xl mt-6 max-w-2xl mx-auto">Aucune autre plateforme ne propose ça. Ni en France, ni dans le monde.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-violet-900/20 to-[#060412] p-10 md:p-14 mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-purple-600 opacity-10 blur-[80px] pointer-events-none" />
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-900/50">
                    <BookOpen size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">Notre équipe de psychologues</p>
                    <p className="text-purple-400 text-sm">Cliniciens · Musulmans · Spécialistes du couple</p>
                  </div>
                </div>
                <h3 className="text-3xl font-serif font-bold text-white mb-5 leading-tight">
                  5 psychologues cliniciens musulmans travaillent <span className="text-purple-300">pour vous.</span>
                </h3>
                <p className="text-white/60 leading-relaxed mb-5">
                  Ils ont conçu notre questionnaire, calibré notre algorithme, et valident chaque compatibilité présentée.
                  Ce ne sont pas des bots — ce sont des <strong className="text-white">professionnels de santé mentale diplômés</strong>, spécialisés dans la psychologie islamique du couple.
                </p>
                <p className="text-white/60 leading-relaxed mb-8">
                  Leur mission unique : s&apos;assurer que la personne en face de vous ne soit pas seulement compatible sur le papier,
                  mais <strong className="text-white">réellement faite pour vivre avec vous</strong>.
                </p>
                <Link href="/inscription"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm">
                  Bénéficier de leur expertise <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {psychologues.map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 bg-white/5 border border-white/10 hover:border-purple-500/40 rounded-xl px-5 py-3.5 transition-all">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{p.initial}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{p.nom}</p>
                      <p className="text-white/40 text-xs truncate">{p.spec}</p>
                    </div>
                    <span className="text-purple-400/60 text-xs flex-shrink-0 hidden sm:block">{p.annees}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 3 piliers */}
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Brain,       color: 'from-violet-500 to-purple-700', titre: 'IA haute performance',    desc: 'Notre algorithme analyse 7 dimensions simultanément. Seuls les profils à +85% vous sont présentés.' },
              { icon: Microscope,  color: 'from-fuchsia-500 to-pink-700',  titre: 'Psychologie clinique',   desc: 'Chaque compatibilité est validée par nos cliniciens. Ce n\'est pas de l\'intuition — c\'est de la science.' },
              { icon: Shield,      color: 'from-purple-500 to-violet-700', titre: 'Cadre islamique strict', desc: 'Supervision temps réel, zéro échange de coordonnées, valeurs islamiques au cœur du processus.' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  className="p-7 bg-white/5 border border-white/10 hover:border-purple-500/30 rounded-2xl transition-all">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-3">{item.titre}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── COMPARAISON ─────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-serif font-bold">
              La différence est <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">évidente.</span>
            </h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl overflow-hidden border border-white/10">
            <div className="grid grid-cols-3 bg-white/5">
              <div className="p-4 text-white/40 text-sm font-medium text-center">Critère</div>
              <div className="p-4 text-center border-x border-white/10"><span className="text-white/40 text-sm font-medium">Autres plateformes</span></div>
              <div className="p-4 text-center bg-purple-500/10"><span className="text-purple-300 font-bold text-sm">Mariés au Second Regard</span></div>
            </div>
            {[
              { label: 'Psychologues cliniciens',    eux: '✗ Aucun',                        nous: '✓ 5 spécialistes' },
              { label: 'Seuil de compatibilité',     eux: '✗ Aucun seuil',                   nous: '✓ Minimum +85%' },
              { label: 'Analyse de compatibilité',   eux: '✗ Filtres basiques',              nous: '✓ 7 dimensions IA' },
              { label: 'Cadre islamique',             eux: '✗ Inexistant ou superficiel',     nous: '✓ Intégré à chaque étape' },
              { label: 'Supervision des échanges',   eux: '✗ Aucune',                        nous: '✓ Temps réel' },
              { label: 'Objectif',                   eux: '✗ Rencontres',                    nous: '✓ Mariage' },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 border-t border-white/5 ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                <div className="p-4 text-white/50 text-sm flex items-center">{row.label}</div>
                <div className="p-4 text-center text-white/30 text-sm border-x border-white/5 flex items-center justify-center">{row.eux}</div>
                <div className="p-4 text-center text-purple-300 text-sm font-semibold bg-purple-500/5 flex items-center justify-center">{row.nous}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ───────────────────────────────── */}
      <section id="comment-ca-marche" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <p className="text-purple-400 font-medium text-sm tracking-widest uppercase mb-4">Le processus</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold">Simple. Sérieux. Efficace.</h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { num: '01', icon: 'Users',    titre: 'Inscription',     desc: 'Gratuit. 2 minutes. Aucune carte.', color: 'from-violet-500 to-purple-600' },
              { num: '02', icon: 'Brain',    titre: 'Questionnaire',   desc: '40 questions conçues par nos psychologues.', color: 'from-purple-500 to-fuchsia-600' },
              { num: '03', icon: 'Sparkles', titre: "L'IA analyse",    desc: '7 dimensions. Seuls les +85% passent.', color: 'from-fuchsia-500 to-pink-600' },
              { num: '04', icon: 'Heart',    titre: 'Votre match',     desc: 'Validé IA + psychologue. Certifié.', color: 'from-pink-500 to-rose-600' },
            ].map((step, i) => {
              const icons = { Users: '👥', Brain: '🧠', Sparkles: '✨', Heart: '💜' } as Record<string, string>
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="relative text-center p-6 bg-white/5 border border-white/10 hover:border-purple-500/30 rounded-2xl transition-all">
                  <div className="text-xs font-bold text-white/20 tracking-widest mb-4">{step.num}</div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 shadow-lg text-2xl`}>
                    {icons[step.icon]}
                  </div>
                  <h3 className="text-white font-bold mb-2">{step.titre}</h3>
                  <p className="text-white/45 text-xs leading-relaxed">{step.desc}</p>
                </motion.div>
              )
            })}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-8 flex items-center justify-center gap-3 text-white/40 text-sm">
            <CheckCircle2 size={15} className="text-green-400" />
            Étapes 1 &amp; 2 gratuites — abonnement requis pour recevoir vos compatibilités
          </motion.div>
        </div>
      </section>

      {/* ─── TÉMOIGNAGES ─────────────────────────────────────── */}
      <section className="py-24 px-6 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <p className="text-purple-400 font-medium text-sm tracking-widest uppercase mb-4">Témoignages</p>
            <h2 className="text-4xl font-serif font-bold">Ils témoignent.</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { prenom: 'Fatima', ville: 'Lyon', note: 5, texte: "En 3 semaines, j'avais une compatibilité à 89%. Ce n'est pas du hasard — c'est de la science. On partage les mêmes valeurs, la même foi. Mariés depuis 6 mois, alhamdulillah." },
              { prenom: 'Youssef', ville: 'Paris', note: 5, texte: "Savoir qu'un psychologue clinicien a validé notre compatibilité avant même qu'on se parle — ça change tout. On ne part pas de rien. On part d'une base solide." },
              { prenom: 'Nadia', ville: 'Marseille', note: 5, texte: "Mon score était à 91%. Et c'est exactement ce que je vis. Pas de surprise, pas de déception — juste quelqu'un qui me correspond vraiment, validé par des professionnels." },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }} whileHover={{ y: -4 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col gap-5">
                <div className="flex gap-1">{Array.from({ length: t.note }).map((_, j) => <Star key={j} size={14} fill="#a78bfa" className="text-purple-400" />)}</div>
                <p className="text-white/70 text-sm leading-relaxed italic flex-1">&ldquo;{t.texte}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-white font-bold text-sm">{t.prenom[0]}</div>
                  <div><p className="text-white font-semibold text-sm">{t.prenom}</p><p className="text-purple-400/60 text-xs">{t.ville} · Membre vérifié</p></div>
                </div>
              </motion.div>
            ))}
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
            <h2 className="text-4xl md:text-5xl font-serif font-bold">Un investissement dans votre vie.</h2>
            <p className="text-white/45 mt-4 max-w-xl mx-auto text-lg">
              Inscription + questionnaire <strong className="text-white">100% gratuits.</strong>{' '}
              L&apos;abonnement vous donne accès à vos compatibilités validées à +85%.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mb-10 flex items-center justify-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl p-4 max-w-md mx-auto">
            <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
            <p className="text-sm text-white/70"><span className="text-white font-semibold">Inscription + Questionnaire gratuits.</span> Abonnement pour recevoir vos compatibilités.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-7 flex flex-col ${plan.highlight
                  ? 'bg-gradient-to-b from-purple-600/30 to-violet-900/20 border-2 border-purple-500/60 shadow-xl shadow-purple-900/30'
                  : 'bg-white/5 border border-white/10'}`}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">{plan.badge}</div>
                )}
                <div className="mb-6">
                  <h3 className="text-white font-bold text-xl mb-1">{plan.nom}</h3>
                  <div className="flex items-end gap-1 mt-3">
                    <span className="text-4xl font-bold text-white">{plan.prix}€</span>
                    <span className="text-white/35 text-sm mb-1.5">/ mois</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2.5 text-sm text-white/65">
                      <CheckCircle2 size={15} className="text-purple-400 flex-shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/inscription"
                  className={`w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${plan.highlight
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white shadow-lg shadow-purple-900/50'
                    : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'}`}>
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
            <h2 className="text-4xl font-serif font-bold">Vos questions.</h2>
          </motion.div>
          <div className="space-y-3">
            <FAQItem q="Pourquoi seulement des compatibilités à +85% ?"
              a="Parce que nous refusons de vous faire perdre votre temps. Notre algorithme analyse des centaines de profils — mais vous ne voyez que ceux validés à +85% de compatibilité par notre IA et nos psychologues cliniciens. Qualité, pas quantité." />
            <FAQItem q="Pourquoi 5 psychologues cliniciens et pas juste une IA ?"
              a="Parce que la compatibilité réelle dépasse les données. Nos psychologues ont conçu chaque question du questionnaire, calibré l'algorithme, et valident les cas complexes. L'IA traite — les psychologues certifient." />
            <FAQItem q="L'inscription est vraiment gratuite ?"
              a="Oui, totalement. Profil + questionnaire = 0€. L'abonnement est requis pour découvrir vos compatibilités validées et commencer les échanges supervisés." />
            <FAQItem q="Les conversations sont-elles vraiment supervisées ?"
              a="Oui. Toute tentative d'échange de coordonnées est détectée et bloquée en temps réel. Violation = bannissement immédiat + clause pénale (CGU art. 5)." />
            <FAQItem q="Puis-je annuler à tout moment ?"
              a="Oui, sans engagement. Annulation depuis votre espace ou par email. L'accès reste actif jusqu'à la fin de la période payée." />
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ───────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-purple-700 opacity-10 blur-[120px]" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-purple-900/60">
              <Heart size={40} className="text-white" fill="white" />
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
              Votre conjoint(e)<br />
              <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-fuchsia-400 bg-clip-text text-transparent">vous cherche aussi.</span>
            </h2>
            <p className="text-white/50 text-xl mb-4 leading-relaxed max-w-xl mx-auto">
              Rejoignez la seule plateforme islamique au monde où <strong className="text-white">5 psychologues cliniciens</strong> et une IA garantissent une compatibilité à +85%.
            </p>
            <p className="text-purple-400 font-semibold mb-10 text-lg">Plus vous attendez, plus votre futur(e) conjoint(e) cherche ailleurs.</p>
            <Link href="/inscription"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-xl px-12 py-5 rounded-2xl transition-all duration-300 shadow-2xl shadow-purple-900/60 hover:-translate-y-1">
              Commencer gratuitement maintenant
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="mt-5 text-white/25 text-sm">Aucune carte bancaire · 2 minutes · Inscription gratuite</p>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-white/25 text-sm">
          <span className="font-serif font-bold text-white/50">Mariés au Second Regard</span>
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
