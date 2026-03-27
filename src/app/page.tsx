'use client'

import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import {
  Shield, Brain, MessageCircle, Star, ChevronDown,
  CheckCircle2, Users, Lock, Sparkles, ArrowRight, Heart
} from 'lucide-react'

// ─── Variants animation ────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}
const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
}

// ─── Geometric SVG background ─────────────────────────────────────
function GeometricBg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M40 0 L80 20 L80 60 L40 80 L0 60 L0 20 Z" fill="none" stroke="#D4A853" strokeWidth="0.5" />
          <path d="M40 10 L70 25 L70 55 L40 70 L10 55 L10 25 Z" fill="none" stroke="#D4A853" strokeWidth="0.3" />
          <circle cx="40" cy="40" r="4" fill="none" stroke="#D4A853" strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#geo)" />
    </svg>
  )
}

// ─── Counter animé ─────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1400
    const step = 16
    const increment = to / (duration / step)
    const timer = setInterval(() => {
      start += increment
      if (start >= to) { setCount(to); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, step)
    return () => clearInterval(timer)
  }, [inView, to])

  return <span ref={ref}>{count}{suffix}</span>
}

// ─── Mock carte compatibilité hero ────────────────────────────────
function MockCompatCard() {
  const dims = [
    { label: 'Foi & pratique', score: 96 },
    { label: 'Projet de vie', score: 100 },
    { label: 'Communication', score: 80 },
    { label: 'Personnalité', score: 95 },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: 8 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }}
      style={{ perspective: '1000px' }}
      className="w-full max-w-sm mx-auto"
    >
      <div
        className="rounded-2xl border p-6 shadow-gold-lg"
        style={{
          background: 'linear-gradient(145deg, #161616 0%, #1a1a1a 100%)',
          borderColor: '#D4A853',
          borderWidth: '1px',
          boxShadow: '0 0 60px rgba(212, 168, 83, 0.15), 0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Badge forte compatibilité */}
        <div className="flex items-center gap-2 mb-4">
          <span style={{ background: 'rgba(212,168,83,0.15)', border: '1px solid rgba(212,168,83,0.4)', color: '#D4A853' }}
            className="text-xs font-semibold px-3 py-1 rounded-full tracking-wide">
            ★ Forte compatibilité détectée
          </span>
        </div>

        {/* Profil + score */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{ background: 'rgba(212,168,83,0.1)', border: '2px solid rgba(212,168,83,0.3)' }}>
            🌙
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">Yasmine, 27 ans</p>
            <p className="text-xs" style={{ color: '#888' }}>Paris · Pratiquante · Après nikah</p>
          </div>
          {/* Jauge circulaire */}
          <div className="relative w-14 h-14">
            <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="28" cy="28" r="22" fill="none" stroke="#2a2a2a" strokeWidth="5" />
              <circle cx="28" cy="28" r="22" fill="none" stroke="#D4A853" strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - 0.94)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.5s ease 0.8s' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold" style={{ color: '#D4A853' }}>94</span>
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-2.5">
          {dims.map((d) => (
            <div key={d.label}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: '#999' }}>{d.label}</span>
                <span style={{ color: '#D4A853' }} className="font-medium">{d.score}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: '#2a2a2a' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${d.score}%` }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #B8960C, #D4A853)' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bouton */}
        <div className="mt-5 h-9 rounded-lg flex items-center justify-center text-sm font-semibold"
          style={{ background: 'rgba(212,168,83,0.12)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.3)' }}>
          Ouvrir la conversation →
        </div>
      </div>

      {/* Floating pill */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="mt-4 mx-auto w-fit px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2"
        style={{
          background: 'rgba(212,168,83,0.08)',
          border: '1px solid rgba(212,168,83,0.2)',
          color: '#D4A853',
        }}
      >
        <Sparkles size={12} /> IA · Analyse en cours
      </motion.div>
    </motion.div>
  )
}

// ─── Données ────────────────────────────────────────────────────────
const ETAPES = [
  { num: '01', titre: 'Inscription & Vérification', desc: 'Profil sécurisé, identité vérifiée. Chaque membre est authentifié avant d\'accéder aux matchs.', icon: Shield },
  { num: '02', titre: 'Questionnaire Approfondi', desc: '7 dimensions : foi, personnalité, projet de vie, communication, style de vie, famille, carrière.', icon: Brain },
  { num: '03', titre: 'L\'IA Analyse Votre Profil', desc: 'Embeddings vectoriels + scoring multi-dimensionnel pour identifier les compatibilités profondes.', icon: Sparkles },
  { num: '04', titre: 'Propositions Personnalisées', desc: '1 à 3 profils compatibles par semaine selon votre abonnement, avec score et explication.', icon: Heart },
  { num: '05', titre: 'Chat Encadré', desc: 'Conversation supervisée, étape par étape, selon les préceptes islamiques. Pas de dérive.', icon: MessageCircle },
  { num: '06', titre: 'Mouquabala & Wali', desc: 'Rencontre en visio avec un imam, facilitant ensuite le contact avec le tuteur.', icon: Star },
]

const PLANS = [
  {
    nom: 'Gratuit',
    prix: '0',
    periode: '',
    profils: '1 profil / semaine',
    features: ['1 profil compatible par semaine', 'Chat introduction', 'Profil vérifié', 'Support email'],
    cta: 'Commencer gratuitement',
    highlight: false,
  },
  {
    nom: 'Standard',
    prix: '14,90',
    periode: '/ mois',
    profils: '2 profils / semaine',
    features: ['2 profils compatibles par semaine', 'Chat complet (toutes étapes)', 'Messages vocaux', 'Mode Wali', 'Support prioritaire'],
    cta: 'Choisir Standard',
    highlight: true,
  },
  {
    nom: 'Premium',
    prix: '29,90',
    periode: '/ mois',
    profils: '3 profils / semaine',
    features: ['3 profils compatibles par semaine', 'Toutes fonctionnalités Standard', 'Badge Premium vérifié', 'Visio illimitée', 'Accès prioritaire imams'],
    cta: 'Choisir Premium',
    highlight: false,
  },
]

const TEMOIGNAGES = [
  {
    texte: 'Je n\'aurais jamais osé m\'inscrire sur un site classique. Ici tout était encadré. Nous nous sommes mariés 6 mois après.',
    nom: 'Fatima & Yassine',
    ville: 'Lyon',
    score: 94,
  },
  {
    texte: 'L\'imam qui a supervisé notre mouquabala était attentionné. Il a tout facilité avec ma famille. Un processus vraiment digne.',
    nom: 'Khadija & Omar',
    ville: 'Paris',
    score: 88,
  },
  {
    texte: 'Le questionnaire est profond. Quand j\'ai vu le profil proposé, j\'ai compris pourquoi. Notre vision du foyer était identique.',
    nom: 'Amina & Ibrahim',
    ville: 'Marseille',
    score: 91,
  },
]

// ─── Ornament ─────────────────────────────────────────────────────
function GoldOrnament() {
  return (
    <div className="flex items-center justify-center gap-4 my-2" aria-hidden>
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #D4A853)' }} />
      <span style={{ color: '#D4A853', fontSize: '18px' }}>✦</span>
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #D4A853)' }} />
    </div>
  )
}

// ─── Composant principal ────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: '#0a0a0a', color: '#f0ece4' }}>

      {/* ══ NAVBAR ════════════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
        style={{ background: 'rgba(10,10,10,0.88)', borderBottom: '1px solid rgba(212,168,83,0.12)' }}
      >
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ border: '1.5px solid #D4A853' }}>
              <span className="font-serif font-bold text-xs" style={{ color: '#D4A853' }}>M</span>
            </div>
            <span className="font-serif font-semibold text-sm tracking-widest text-white hidden sm:block">
              MARIÉS AU SECOND REGARD
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: '#888' }}>
            <a href="#comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</a>
            <a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a>
            <a href="#temoignages" className="hover:text-white transition-colors">Témoignages</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/connexion" className="text-sm transition-colors hidden sm:block" style={{ color: '#888' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f0ece4')}
              onMouseLeave={e => (e.currentTarget.style.color = '#888')}>
              Se connecter
            </Link>
            <Link
              href="/inscription"
              className="text-sm font-semibold px-5 py-2 rounded-lg transition-all"
              style={{ background: '#D4A853', color: '#000' }}
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-16" style={{ background: '#0a0a0a' }}>
        <GeometricBg />

        {/* Gradient radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(212,168,83,0.06) 0%, transparent 70%)',
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-5 w-full py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Texte gauche */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="mb-6">
                <span className="inline-flex items-center gap-2 text-xs tracking-widest uppercase px-4 py-1.5 rounded-full"
                  style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.3)', color: '#D4A853' }}>
                  ✦ Selon les préceptes de l&apos;Islam ✦
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-serif font-bold leading-[1.1] mb-6"
                style={{ fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', color: '#fff' }}
              >
                La rencontre qui<br />
                <span style={{
                  background: 'linear-gradient(90deg, #B8960C 0%, #D4A853 40%, #e6b820 70%, #B8960C 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 3s linear infinite',
                }}>
                  commence par le fond
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg leading-relaxed mb-8"
                style={{ color: '#9a9a8e', maxWidth: '480px' }}
              >
                Notre intelligence artificielle analyse votre profil en 7 dimensions et vous propose
                des compatibilités réelles. <span style={{ color: '#D4A853' }}>Encadrée. Sérieuse. Halal.</span>
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/inscription"
                  className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-xl transition-all"
                  style={{ background: '#D4A853', color: '#000', fontSize: '15px' }}
                >
                  Commencer mon parcours
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="#comment-ca-marche"
                  className="inline-flex items-center justify-center gap-2 font-medium px-7 py-3.5 rounded-xl transition-all"
                  style={{
                    border: '1px solid rgba(212,168,83,0.4)',
                    color: '#D4A853',
                    fontSize: '15px',
                    background: 'rgba(212,168,83,0.05)',
                  }}
                >
                  Découvrir le concept
                  <ChevronDown size={16} />
                </a>
              </motion.div>

              {/* Trust signals */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-5 text-sm" style={{ color: '#666' }}>
                {[
                  { icon: Shield, label: 'Identités vérifiées' },
                  { icon: Lock, label: 'Chat supervisé' },
                  { icon: Users, label: 'Imams partenaires' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon size={14} style={{ color: '#D4A853' }} />
                    <span>{label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Carte droite */}
            <div className="hidden lg:flex items-center justify-center">
              <MockCompatCard />
            </div>
          </div>
        </div>

        {/* Stats bar flottante */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-0 right-0 flex justify-center px-5"
        >
          <div
            className="flex items-center gap-8 sm:gap-12 px-8 py-4 rounded-2xl"
            style={{
              background: 'rgba(20,18,14,0.9)',
              border: '1px solid rgba(212,168,83,0.2)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {[
              { val: 94, suffix: '%', label: 'Satisfaction' },
              { val: 7, suffix: '', label: 'Dimensions IA' },
              { val: 48, suffix: 'h', label: 'Premier match' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold font-serif" style={{ color: '#D4A853' }}>
                  <Counter to={s.val} suffix={s.suffix} />
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#666' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══ CONCEPT ══════════════════════════════════════════════════ */}
      <section className="py-24 relative" style={{ background: '#0d0d0d' }}>
        <div className="max-w-4xl mx-auto px-5 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-xs tracking-widest uppercase mb-5" style={{ color: '#D4A853' }}>
              Notre différence
            </motion.p>
            <GoldOrnament />
            <motion.h2
              variants={fadeUp}
              className="font-serif font-bold mt-8 mb-6 leading-tight"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#fff' }}
            >
              Vous ne choisissez pas un profil.<br />
              <span style={{ color: '#D4A853' }}>Nous vous révélons une compatibilité.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg leading-relaxed mx-auto" style={{ color: '#888', maxWidth: '680px' }}>
              Contrairement aux applications classiques où vous scrollez des centaines de photos,
              Mariés au Second Regard vous propose uniquement des profils sélectionnés par notre IA
              après analyse approfondie de vos valeurs, personnalité et aspirations.
              Comme <em style={{ color: '#D4A853', fontStyle: 'italic' }}>Mariés au Premier Regard</em>, mais selon les préceptes de l&apos;Islam.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10">
              <GoldOrnament />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══ COMMENT ÇA MARCHE ════════════════════════════════════════ */}
      <section id="comment-ca-marche" className="py-24" style={{ background: '#0a0a0a' }}>
        <div className="max-w-6xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-xs tracking-widest uppercase mb-3" style={{ color: '#D4A853' }}>
              Le parcours
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif font-bold" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#fff' }}>
              De l&apos;inscription au mariage
            </motion.h2>
            <motion.div variants={fadeUp}>
              <div className="w-12 h-0.5 mx-auto mt-5" style={{ background: '#D4A853' }} />
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ETAPES.map((etape, i) => {
              const Icon = etape.icon
              return (
                <motion.div
                  key={etape.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="relative rounded-2xl p-6 group transition-all duration-300"
                  style={{
                    background: '#111',
                    border: '1px solid #222',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,168,83,0.35)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#222')}
                >
                  {/* Numéro */}
                  <div
                    className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: '#D4A853', color: '#000' }}
                  >
                    {etape.num}
                  </div>

                  <div className="mb-4 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.2)' }}>
                    <Icon size={18} style={{ color: '#D4A853' }} />
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-sm">{etape.titre}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#666' }}>{etape.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ IA SECTION ═══════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: '#0d0d0d' }}>
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <GeometricBg />
        </div>
        <div className="max-w-6xl mx-auto px-5 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Texte */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <p className="text-xs tracking-widest uppercase mb-4" style={{ color: '#D4A853' }}>Intelligence artificielle</p>
              <h2 className="font-serif font-bold mb-5 leading-tight" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#fff' }}>
                Une IA pensée pour<br />les valeurs islamiques
              </h2>
              <div className="w-10 h-0.5 mb-6" style={{ background: '#D4A853' }} />
              <p className="leading-relaxed mb-8 text-sm" style={{ color: '#888' }}>
                Notre algorithme analyse 7 dimensions clés pour calculer votre Score de Compatibilité Globale.
                Les réponses libres sont analysées par traitement du langage naturel pour saisir la profondeur
                de vos valeurs — pas seulement vos préférences de surface.
              </p>

              <div className="space-y-3">
                {[
                  { dim: 'Valeurs islamiques & Foi', pct: 25 },
                  { dim: 'Personnalité & Communication', pct: 35 },
                  { dim: 'Projet de vie & Famille', pct: 20 },
                  { dim: 'Style de vie & Carrière', pct: 15 },
                  { dim: 'Compatibilité physique', pct: 5 },
                ].map((d) => (
                  <div key={d.dim}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span style={{ color: '#888' }}>{d.dim}</span>
                      <span style={{ color: '#D4A853' }} className="font-medium">{d.pct}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1e1e1e' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${d.pct * 2}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #B8960C, #D4A853)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Card score */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="rounded-2xl p-7"
              style={{
                background: '#111',
                border: '1px solid rgba(212,168,83,0.25)',
                boxShadow: '0 0 40px rgba(212,168,83,0.08)',
              }}
            >
              <div className="text-center mb-6">
                <div className="relative w-28 h-28 mx-auto mb-3">
                  <svg width="112" height="112" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="56" cy="56" r="48" fill="none" stroke="#1e1e1e" strokeWidth="8" />
                    <motion.circle
                      cx="56" cy="56" r="48" fill="none" stroke="#D4A853" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 48}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                      whileInView={{ strokeDashoffset: 2 * Math.PI * 48 * 0.08 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-serif" style={{ color: '#D4A853' }}>92</span>
                    <span className="text-xs" style={{ color: '#666' }}>/ 100</span>
                  </div>
                </div>
                <p className="text-white font-semibold text-sm">Score de Compatibilité Globale</p>
                <p className="text-xs mt-1" style={{ color: '#555' }}>Exemple de matching réel</p>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Valeurs islamiques', score: 96 },
                  { label: 'Projet de vie', score: 94 },
                  { label: 'Personnalité', score: 89 },
                  { label: 'Communication', score: 91 },
                  { label: 'Style de vie', score: 87 },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="text-xs w-32 flex-shrink-0" style={{ color: '#777' }}>{s.label}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e1e1e' }}>
                      <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: 'linear-gradient(90deg, #B8960C, #D4A853)' }} />
                    </div>
                    <span className="text-xs font-medium w-8 text-right" style={{ color: '#D4A853' }}>{s.score}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-3 rounded-xl text-center text-xs font-medium"
                style={{ background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.2)', color: '#D4A853' }}>
                ✦ Forte compatibilité détectée
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ TARIFS ════════════════════════════════════════════════════ */}
      <section id="tarifs" className="py-24" style={{ background: '#0a0a0a' }}>
        <div className="max-w-5xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-xs tracking-widest uppercase mb-3" style={{ color: '#D4A853' }}>Nos formules</motion.p>
            <motion.h2 variants={fadeUp} className="font-serif font-bold" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#fff' }}>
              Choisissez votre rythme
            </motion.h2>
            <motion.div variants={fadeUp}>
              <div className="w-12 h-0.5 mx-auto mt-5" style={{ background: '#D4A853' }} />
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.nom}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl p-7 flex flex-col"
                style={{
                  background: plan.highlight ? '#131008' : '#111',
                  border: plan.highlight ? '1px solid #D4A853' : '1px solid #222',
                  boxShadow: plan.highlight ? '0 0 40px rgba(212,168,83,0.12)' : 'none',
                }}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="text-xs font-bold px-4 py-1.5 rounded-full"
                      style={{ background: '#D4A853', color: '#000' }}>
                      LE PLUS CHOISI
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-base font-bold text-white mb-3">{plan.nom}</h3>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-bold font-serif" style={{ color: '#D4A853' }}>{plan.prix}€</span>
                    <span className="text-sm mb-1.5" style={{ color: '#555' }}>{plan.periode}</span>
                  </div>
                  <p className="text-xs font-medium" style={{ color: '#D4A853' }}>{plan.profils}</p>
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs" style={{ color: '#777' }}>
                      <CheckCircle2 size={13} style={{ color: '#D4A853', flexShrink: 0, marginTop: 1 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/inscription"
                  className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-semibold transition-all"
                  style={plan.highlight
                    ? { background: '#D4A853', color: '#000' }
                    : { border: '1px solid rgba(212,168,83,0.4)', color: '#D4A853', background: 'transparent' }
                  }
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs mt-6" style={{ color: '#555' }}>
            Sans engagement · Résiliation à tout moment · Paiement sécurisé par Stripe
          </p>
        </div>
      </section>

      {/* ══ TÉMOIGNAGES ══════════════════════════════════════════════ */}
      <section id="temoignages" className="py-24" style={{ background: '#0d0d0d' }}>
        <div className="max-w-6xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-xs tracking-widest uppercase mb-3" style={{ color: '#D4A853' }}>Ils se sont mariés</motion.p>
            <motion.h2 variants={fadeUp} className="font-serif font-bold" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#fff' }}>
              Des histoires vraies
            </motion.h2>
            <motion.div variants={fadeUp}>
              <div className="w-12 h-0.5 mx-auto mt-5" style={{ background: '#D4A853' }} />
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEMOIGNAGES.map((t, i) => (
              <motion.div
                key={t.nom}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6"
                style={{ background: '#111', border: '1px solid #1e1e1e' }}
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={12} style={{ color: '#D4A853', fill: '#D4A853' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5 italic" style={{ color: '#888' }}>
                  &ldquo;{t.texte}&rdquo;
                </p>
                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #1e1e1e' }}>
                  <div>
                    <p className="text-white font-semibold text-xs">{t.nom}</p>
                    <p className="text-xs" style={{ color: '#555' }}>{t.ville}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm font-serif" style={{ color: '#D4A853' }}>{t.score}%</p>
                    <p className="text-xs" style={{ color: '#555' }}>compatibilité</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ════════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden" style={{ background: '#0a0a0a' }}>
        <GeometricBg />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(212,168,83,0.05) 0%, transparent 70%)' }} />
        <div className="max-w-3xl mx-auto px-5 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="mb-5">
              <GoldOrnament />
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-serif font-bold mb-5 leading-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: '#fff' }}>
              Votre moitié vous attend.<br />
              <span style={{
                background: 'linear-gradient(90deg, #B8960C 0%, #D4A853 40%, #e6b820 70%, #B8960C 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmer 3s linear infinite',
              }}>
                Commencez maintenant.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base mb-10" style={{ color: '#666' }}>
              Inscription gratuite · Questionnaire 15 min · Premier profil compatible sous 48h
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/inscription"
                className="inline-flex items-center gap-3 font-semibold px-10 py-4 rounded-xl transition-all text-base"
                style={{ background: '#D4A853', color: '#000', boxShadow: '0 0 40px rgba(212,168,83,0.25)' }}
              >
                Créer mon profil gratuitement
                <ArrowRight size={18} />
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-8">
              <GoldOrnament />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════ */}
      <footer style={{ background: '#080808', borderTop: '1px solid rgba(212,168,83,0.1)' }} className="py-14">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ border: '1.5px solid #D4A853' }}>
                  <span className="font-serif text-xs font-bold" style={{ color: '#D4A853' }}>M</span>
                </div>
                <span className="font-serif font-semibold text-sm text-white tracking-wide">MASR</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#555', maxWidth: '200px' }}>
                La première plateforme de mariage islamique intelligente. Encadrée. Sérieuse. Selon l&apos;Islam.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white mb-4 uppercase tracking-wide">Plateforme</h4>
              <ul className="space-y-2.5 text-xs" style={{ color: '#555' }}>
                <li><Link href="/inscription" className="hover:text-white transition-colors">S&apos;inscrire</Link></li>
                <li><Link href="/connexion" className="hover:text-white transition-colors">Se connecter</Link></li>
                <li><a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white mb-4 uppercase tracking-wide">Légal</h4>
              <ul className="space-y-2.5 text-xs" style={{ color: '#555' }}>
                <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                <li><Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link href="/cgu" className="hover:text-white transition-colors">CGU</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white mb-4 uppercase tracking-wide">Contact</h4>
              <ul className="space-y-2.5 text-xs" style={{ color: '#555' }}>
                <li>contact@mariesausecondregard.fr</li>
                <li className="hover:text-white transition-colors cursor-pointer">Instagram</li>
                <li className="hover:text-white transition-colors cursor-pointer">Facebook</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6"
            style={{ borderTop: '1px solid rgba(212,168,83,0.08)' }}>
            <p className="text-xs" style={{ color: '#444' }}>
              © 2026 Mariés au Second Regard · Tous droits réservés · Marque déposée à l&apos;INPI
            </p>
            <p className="text-xs" style={{ color: '#444' }}>
              Paiements sécurisés par <span className="text-white">Stripe</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
