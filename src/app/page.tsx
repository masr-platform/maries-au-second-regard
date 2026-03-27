'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Users, Heart, CheckCircle, Star, ArrowRight, Shield,
  MessageCircle, Zap, Globe, Lock, ChevronDown, Menu, X
} from 'lucide-react'

// ─── Palette (calquée sur admin.html) ────────────────────────
const C = {
  bg:      '#0f1521',
  card:    '#1a2236',
  card2:   '#1e2a40',
  border:  'rgba(255,255,255,0.07)',
  amber:   '#e8a020',
  green:   '#22c55e',
  blue:    '#3b82f6',
  purple:  '#a855f7',
  text:    '#f1f5f9',
  muted:   '#94a3b8',
  dimmed:  '#475569',
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
}

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = to / 50
    const t = setInterval(() => {
      start = Math.min(start + step, to)
      setCount(Math.floor(start))
      if (start >= to) clearInterval(t)
    }, 30)
    return () => clearInterval(t)
  }, [inView, to])
  return <span ref={ref}>{count.toLocaleString('fr-FR')}{suffix}</span>
}

function Tag({ children, color = C.amber }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ color, borderColor: color + '40', backgroundColor: color + '15' }}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border uppercase tracking-wider">
      {children}
    </span>
  )
}

function StatCard({ value, label, suffix = '', color, icon: Icon }: {
  value: number; label: string; suffix?: string; color: string; icon: React.ElementType
}) {
  return (
    <motion.div variants={fadeUp}
      className="rounded-2xl p-6 border flex flex-col gap-3"
      style={{ background: C.card, borderColor: C.border }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: C.muted }}>{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: color + '20' }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-bold tracking-tight" style={{ color }}>
        <Counter to={value} suffix={suffix} />
      </div>
    </motion.div>
  )
}

function StepCard({ num, title, desc, color }: { num: string; title: string; desc: string; color: string }) {
  return (
    <motion.div variants={fadeUp}
      className="relative rounded-2xl p-6 border group hover:border-opacity-50 transition-all duration-300"
      style={{ background: C.card, borderColor: C.border }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mb-4"
        style={{ background: color + '20', color }}>
        {num}
      </div>
      <h3 className="font-semibold text-base mb-2" style={{ color: C.text }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{desc}</p>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    </motion.div>
  )
}

function TestimonialCard({ name, age, city, text }: { name: string; age: number; city: string; text: string }) {
  return (
    <motion.div variants={fadeUp}
      className="rounded-2xl p-6 border flex flex-col gap-4"
      style={{ background: C.card, borderColor: C.border }}>
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map((i) => <Star key={i} size={14} fill={C.amber} stroke="none" />)}
      </div>
      <p className="text-sm leading-relaxed flex-1 italic" style={{ color: C.muted }}>&ldquo;{text}&rdquo;</p>
      <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: C.border }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: C.amber + '20', color: C.amber }}>{name[0]}</div>
        <div>
          <div className="text-sm font-semibold" style={{ color: C.text }}>{name}, {age} ans</div>
          <div className="text-xs" style={{ color: C.dimmed }}>{city}</div>
        </div>
      </div>
    </motion.div>
  )
}

function PricingCard({ plan, price, features, cta, highlight, color }: {
  plan: string; price: string; features: string[]; cta: string; highlight?: boolean; color: string
}) {
  return (
    <motion.div variants={fadeUp}
      className="rounded-2xl border flex flex-col overflow-hidden"
      style={{
        background: highlight ? C.card2 : C.card,
        borderColor: highlight ? color + '50' : C.border,
        boxShadow: highlight ? `0 0 40px ${color}18` : 'none',
      }}>
      {highlight && (
        <div className="text-center text-xs font-bold py-2 uppercase tracking-widest"
          style={{ background: color + '20', color }}>✦ Recommandé</div>
      )}
      <div className="p-7 flex flex-col gap-6 flex-1">
        <div>
          <div className="text-sm font-semibold mb-3" style={{ color }}>{plan}</div>
          <div className="text-4xl font-bold" style={{ color: C.text }}>{price}</div>
          {price !== 'Gratuit' && <div className="text-xs mt-1" style={{ color: C.dimmed }}>/ mois · engagement mensuel</div>}
        </div>
        <ul className="space-y-3 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: C.muted }}>
              <CheckCircle size={15} className="mt-0.5 shrink-0" style={{ color }} />{f}
            </li>
          ))}
        </ul>
        <Link href="/inscription"
          className="w-full py-3 px-6 rounded-xl text-center text-sm font-semibold transition-all duration-200 hover:opacity-90"
          style={{
            background: highlight ? color : 'transparent',
            color: highlight ? '#000' : color,
            border: `1.5px solid ${color}`,
          }}>{cta} →</Link>
      </div>
    </motion.div>
  )
}

function DimBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between text-xs" style={{ color: C.muted }}>
        <span>{label}</span><span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }} />
      </div>
    </div>
  )
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh' }} className="font-sans antialiased">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? C.bg + 'f0' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? `1px solid ${C.border}` : 'none',
        }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: C.amber, color: '#000' }}>M</div>
            <span className="font-bold text-sm tracking-wide" style={{ color: C.text }}>Mariés au Second Regard</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[['Comment ça marche', '#comment-ca-marche'], ['Tarifs', '#tarifs'], ['Témoignages', '#temoignages']].map(([label, href]) => (
              <a key={label} href={href}
                className="text-sm transition-colors opacity-60 hover:opacity-100"
                style={{ color: C.text }}>{label}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/connexion" className="text-sm px-4 py-2 rounded-lg" style={{ color: C.muted }}>Se connecter</Link>
            <Link href="/inscription"
              className="text-sm px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
              style={{ background: C.amber, color: '#000' }}>S&apos;inscrire gratuitement</Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} style={{ color: C.muted }}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
              style={{ background: C.card, borderColor: C.border }}>
              {['Comment ça marche', 'Tarifs', 'Témoignages'].map((item) => (
                <a key={item} href="#" className="text-sm opacity-60" style={{ color: C.text }} onClick={() => setMenuOpen(false)}>{item}</a>
              ))}
              <Link href="/connexion" className="text-sm" style={{ color: C.muted }}>Se connecter</Link>
              <Link href="/inscription" className="text-sm px-4 py-2.5 rounded-lg font-semibold text-center"
                style={{ background: C.amber, color: '#000' }}>S&apos;inscrire gratuitement</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: C.amber }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: C.blue }} />

        <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-7">
              <motion.div variants={fadeUp}><Tag color={C.green}>✦ Selon les préceptes de l&apos;Islam</Tag></motion.div>
              <motion.h1 variants={fadeUp} className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                La rencontre qui
                <span className="block" style={{ color: C.amber }}> commence par</span>
                <span className="block">le fond.</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-base leading-relaxed max-w-lg" style={{ color: C.muted }}>
                Notre IA analyse <strong style={{ color: C.text }}>7 dimensions</strong> de compatibilité
                pour vous proposer des rencontres sérieuses, encadrées et halal.
                <span style={{ color: C.dimmed }}> Encadrée. Sérieuse. Selon l&apos;Islam.</span>
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <Link href="/inscription"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
                  style={{ background: C.amber, color: '#000' }}>
                  Commencer gratuitement <ArrowRight size={16} />
                </Link>
                <Link href="#comment-ca-marche"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm border hover:opacity-80 transition-all"
                  style={{ color: C.text, borderColor: C.border, background: C.card }}>
                  Comment ça marche
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} className="flex items-center gap-8 pt-2">
                {[
                  { label: 'Membres actifs', value: '2 400+', color: C.amber },
                  { label: 'Matchs réalisés', value: '380+', color: C.green },
                  { label: 'Mouqabalas', value: '140+', color: C.blue },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs" style={{ color: C.dimmed }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Carte compatibilité */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }} className="relative">
              <div className="rounded-2xl border p-6 space-y-5"
                style={{ background: C.card, borderColor: C.amber + '30', boxShadow: `0 0 60px ${C.amber}10` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.green }} />
                    <span className="text-xs font-medium" style={{ color: C.green }}>Compatibilité détectée</span>
                  </div>
                  <Tag color={C.amber}>Score IA</Tag>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: C.amber + '20' }}>🌙</div>
                  <div className="flex-1">
                    <div className="font-bold text-base" style={{ color: C.text }}>Yasmine, 27 ans</div>
                    <div className="text-xs" style={{ color: C.dimmed }}>Paris · Pratiquante · Après nikah</div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-col"
                    style={{ background: C.amber + '20', border: `2px solid ${C.amber}` }}>
                    <span className="text-2xl font-bold leading-none" style={{ color: C.amber }}>94</span>
                    <span className="text-xs" style={{ color: C.amber + 'aa' }}>%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <DimBar label="Foi & pratique" pct={96} color={C.amber} />
                  <DimBar label="Projet de vie" pct={100} color={C.green} />
                  <DimBar label="Communication" pct={80} color={C.blue} />
                  <DimBar label="Personnalité" pct={95} color={C.purple} />
                </div>
                <button className="w-full py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                  style={{ background: C.amber, color: '#000' }}>
                  Ouvrir la conversation →
                </button>
              </div>
              <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 px-3 py-2 rounded-xl border text-xs font-semibold"
                style={{ background: C.card2, borderColor: C.green + '40', color: C.green }}>
                ⚡ IA · Analyse en cours
              </motion.div>
            </motion.div>
          </div>

          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            <span className="text-xs" style={{ color: C.dimmed }}>Découvrir</span>
            <ChevronDown size={16} style={{ color: C.dimmed }} />
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y py-12" style={{ borderColor: C.border }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={2400} suffix="+" label="Membres actifs" color={C.amber} icon={Users} />
            <StatCard value={380} suffix="+" label="Matchs réalisés" color={C.green} icon={Heart} />
            <StatCard value={140} suffix="+" label="Mouqabalas" color={C.blue} icon={MessageCircle} />
            <StatCard value={12} suffix=" mariages" label="Confirmés" color={C.purple} icon={CheckCircle} />
          </motion.div>
        </div>
      </section>

      {/* ── CONCEPT ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger}
            className="text-center max-w-2xl mx-auto mb-14 space-y-4">
            <motion.div variants={fadeUp}><Tag color={C.blue}>Notre philosophie</Tag></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold" style={{ color: C.text }}>
              Pas un simple swipe.<br />Une démarche de vie.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base leading-relaxed" style={{ color: C.muted }}>
              MASR n&apos;est pas une app de rencontres classique. C&apos;est un système encadré, supervisé,
              conçu pour des personnes qui cherchent un partenaire de vie dans le respect des valeurs islamiques.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: 'Encadré & Supervisé', desc: 'Chaque échange est supervisé. Tout échange de coordonnées personnelles est détecté et sanctionné immédiatement.', color: C.amber },
              { icon: Zap, title: 'IA de compatibilité', desc: '7 dimensions analysées par notre algorithme : foi, personnalité, projet de vie, communication et bien plus.', color: C.green },
              { icon: Lock, title: 'Sérieux & Halal', desc: 'Réservé aux personnes majeures avec une démarche sincère de mariage. La polygamie est interdite sur la plateforme.', color: C.blue },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeUp}
                className="rounded-2xl p-7 border space-y-4" style={{ background: C.card, borderColor: C.border }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: item.color + '20' }}>
                  <item.icon size={22} style={{ color: item.color }} />
                </div>
                <h3 className="font-bold text-base" style={{ color: C.text }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ÉTAPES ── */}
      <section id="comment-ca-marche" className="py-20 border-t" style={{ borderColor: C.border }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger}
            className="text-center max-w-xl mx-auto mb-14 space-y-4">
            <motion.div variants={fadeUp}><Tag color={C.green}>Processus</Tag></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold" style={{ color: C.text }}>
              6 étapes vers votre moitié
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { num: '01', title: 'Créer votre profil', desc: 'Inscription rapide, informations essentielles et préférences de recherche.', color: C.amber },
              { num: '02', title: 'Questionnaire IA', desc: '40 questions couvrant 7 dimensions : foi, personnalité, projet de vie, communication…', color: C.green },
              { num: '03', title: 'Score de compatibilité', desc: 'Notre algorithme calcule votre Score de Compatibilité Globale avec chaque profil.', color: C.blue },
              { num: '04', title: 'Découvrir vos matchs', desc: 'Accédez aux profils compatibles avec votre score et vos critères essentiels.', color: C.purple },
              { num: '05', title: 'Messagerie encadrée', desc: 'Échangez en toute sécurité via notre messagerie supervisée, étape par étape.', color: C.amber },
              { num: '06', title: 'La Mouqabala', desc: 'Si les deux parties le souhaitent, une rencontre encadrée est organisée par notre équipe.', color: C.green },
            ].map((step) => <StepCard key={step.num} {...step} />)}
          </motion.div>
        </div>
      </section>

      {/* ── IA ── */}
      <section className="py-20 border-t" style={{ borderColor: C.border }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="space-y-6">
              <motion.div variants={fadeUp}><Tag color={C.purple}>Intelligence artificielle</Tag></motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold" style={{ color: C.text }}>
                7 dimensions analysées.<br /><span style={{ color: C.amber }}>Une compatibilité réelle.</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-base leading-relaxed" style={{ color: C.muted }}>
                Notre algorithme analyse vos réponses en langage naturel pour saisir la profondeur de vos valeurs — pas seulement vos préférences de surface.
              </motion.p>
              <motion.div variants={fadeUp} className="space-y-4">
                {[
                  { label: 'Valeurs islamiques & Foi', pct: 25, color: C.amber },
                  { label: 'Personnalité & Communication', pct: 35, color: C.green },
                  { label: 'Projet de vie & Famille', pct: 20, color: C.blue },
                  { label: 'Style de vie & Carrière', pct: 15, color: C.purple },
                  { label: 'Compatibilité physique', pct: 5, color: C.muted },
                ].map((d) => <DimBar key={d.label} {...d} />)}
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6 }}
              className="rounded-2xl border p-8 space-y-6" style={{ background: C.card, borderColor: C.border }}>
              <div className="text-center space-y-2">
                <div className="text-5xl font-bold" style={{ color: C.amber }}>94%</div>
                <div className="text-sm" style={{ color: C.muted }}>Score de Compatibilité Globale</div>
              </div>
              <div className="space-y-3">
                {[
                  { dim: 'Foi & pratique', val: 96, color: C.amber },
                  { dim: 'Projet de vie', val: 100, color: C.green },
                  { dim: 'Communication', val: 80, color: C.blue },
                  { dim: 'Personnalité', val: 95, color: C.purple },
                  { dim: 'Style de vie', val: 88, color: C.muted },
                  { dim: 'Valeurs familiales', val: 92, color: C.amber },
                  { dim: 'Vision spirituelle', val: 97, color: C.green },
                ].map((d) => (
                  <div key={d.dim} className="flex items-center gap-3 text-xs" style={{ color: C.muted }}>
                    <div className="w-32 shrink-0">{d.dim}</div>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
                      <motion.div className="h-full rounded-full" style={{ background: d.color }}
                        initial={{ width: 0 }} whileInView={{ width: `${d.val}%` }}
                        viewport={{ once: true }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                    </div>
                    <span style={{ color: d.color }}>{d.val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TARIFS ── */}
      <section id="tarifs" className="py-20 border-t" style={{ borderColor: C.border }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger}
            className="text-center max-w-xl mx-auto mb-14 space-y-4">
            <motion.div variants={fadeUp}><Tag color={C.amber}>Tarifs</Tag></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold" style={{ color: C.text }}>
              Des plans pour chaque étape
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base" style={{ color: C.muted }}>
              Commencez gratuitement. Passez en premium quand vous êtes prêt(e).
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <PricingCard plan="Gratuit" price="Gratuit" color={C.muted} cta="Commencer"
              features={['Questionnaire de compatibilité complet', '1 profil compatible / semaine', 'Score de compatibilité détaillé', 'Accès en lecture aux profils']} />
            <PricingCard plan="Standard" price="19 €" color={C.amber} cta="Choisir Standard" highlight
              features={['2 profils compatibles / semaine', 'Messagerie interne encadrée', 'Matching IA illimité', 'Profil complet avec photos', 'Notifications prioritaires']} />
            <PricingCard plan="Premium" price="39 €" color={C.green} cta="Choisir Premium"
              features={['3 profils compatibles / semaine', 'Tout le plan Standard', 'Accès prioritaire aux nouveaux profils', 'Organisation mouqabala encadrée', 'Accompagnement personnalisé']} />
          </motion.div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-xs mt-8" style={{ color: C.dimmed }}>
            Paiement sécurisé par Stripe · Résiliation à tout moment · Aucun remboursement après souscription
          </motion.p>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section id="temoignages" className="py-20 border-t" style={{ borderColor: C.border }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger}
            className="text-center max-w-xl mx-auto mb-14 space-y-4">
            <motion.div variants={fadeUp}><Tag color={C.green}>Témoignages</Tag></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold" style={{ color: C.text }}>
              Ils ont trouvé leur moitié
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="grid md:grid-cols-3 gap-5">
            <TestimonialCard name="Yasmine" age={27} city="Paris"
              text="Le questionnaire est vraiment approfondi. J'ai rencontré mon mari 3 semaines après mon inscription. Le score de compatibilité était de 91% — et c'est exactement ce qu'on vit au quotidien." />
            <TestimonialCard name="Adam" age={31} city="Lyon"
              text="J'avais essayé d'autres plateformes sans succès. Ici, le cadre islamique et la supervision donnent confiance. La mouqabala organisée par l'équipe s'est parfaitement passée." />
            <TestimonialCard name="Fatima" age={26} city="Marseille"
              text="Ce qui m'a convaincue c'est le sérieux de la plateforme. Zéro échange de contacts, tout est encadré. Je recommande à toutes les sœurs qui cherchent quelque chose de sérieux." />
          </motion.div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 border-t" style={{ borderColor: C.border }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={stagger} className="space-y-7">
            <motion.div variants={fadeUp}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
                style={{ background: C.amber + '20', border: `1px solid ${C.amber}30` }}>🤲</div>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold" style={{ color: C.text }}>
              Votre moitié<br /><span style={{ color: C.amber }}>vous attend.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base" style={{ color: C.muted }}>
              Inscription gratuite · Questionnaire en 10 minutes · Premiers résultats immédiats.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/inscription"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                style={{ background: C.amber, color: '#000' }}>
                Créer mon profil gratuitement <ArrowRight size={16} />
              </Link>
              <Link href="/connexion"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm border transition-all"
                style={{ color: C.muted, borderColor: C.border }}>
                J&apos;ai déjà un compte
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="text-xs" style={{ color: C.dimmed }}>
              Que Allah facilite votre chemin vers le mariage. 🤲
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-14" style={{ borderColor: C.border }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{ background: C.amber, color: '#000' }}>M</div>
                <span className="font-bold text-sm" style={{ color: C.text }}>MASR</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
                La première plateforme de mariage islamique intelligente. Encadrée. Sérieuse. Selon l&apos;Islam.
              </p>
              <div className="flex items-center gap-1.5">
                <Globe size={12} style={{ color: C.dimmed }} />
                <span className="text-xs" style={{ color: C.dimmed }}>France · Belgique · Suisse</span>
              </div>
            </div>
            {[
              { title: 'PLATEFORME', links: [{ label: "S'inscrire", href: '/inscription' }, { label: 'Se connecter', href: '/connexion' }, { label: 'Tarifs', href: '#tarifs' }] },
              { title: 'LÉGAL', links: [{ label: 'Mentions légales', href: '/mentions-legales' }, { label: 'Confidentialité', href: '/confidentialite' }, { label: 'CGU', href: '/cgu' }, { label: 'CGV', href: '/cgv' }, { label: 'Règles', href: '/regles' }] },
              { title: 'CONTACT', links: [{ label: 'mariesausecondregard@gmail.com', href: 'mailto:mariesausecondregard@gmail.com' }, { label: 'Instagram', href: '#' }, { label: 'Facebook', href: '#' }] },
            ].map((col) => (
              <div key={col.title} className="space-y-3">
                <div className="text-xs font-bold tracking-widest" style={{ color: C.dimmed }}>{col.title}</div>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm opacity-60 hover:opacity-100 transition-all" style={{ color: C.muted }}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderColor: C.border }}>
            <p className="text-xs" style={{ color: C.dimmed }}>© 2026 Mariés au Second Regard · Tous droits réservés · Marque déposée à l&apos;INPI</p>
            <p className="text-xs" style={{ color: C.dimmed }}>Paiements sécurisés par <span style={{ color: C.muted }}>Stripe</span></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
