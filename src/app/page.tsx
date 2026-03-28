'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Check, Star, Users, Heart, Shield,
  Sparkles, ChevronDown, Menu, X, Zap, Lock, Clock
} from 'lucide-react'

// ─── PALETTE VIOLET PREMIUM ───────────────────────────────────
const V = {
  bg:       '#0D0A14',   // fond très sombre violet
  card:     '#150F22',   // carte principale
  card2:    '#1C1432',   // carte surlignée
  border:   'rgba(139,92,246,0.15)',
  borderHi: 'rgba(139,92,246,0.4)',
  violet:   '#7C3AED',   // violet principal
  violetLt: '#A78BFA',   // violet clair
  accent:   '#C084FC',   // violet très clair
  pink:     '#EC4899',   // rose accent émotionnel
  teal:     '#06B6D4',   // cyan pour contraste
  text:     '#F8F5FF',   // blanc légèrement violet
  muted:    '#94A3B8',   // gris bleuté
  dimmed:   '#4B5563',   // très discret
  success:  '#34D399',   // vert subtil
}

// ─── Framer variants ──────────────────────────────────────────
const up = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22,1,0.36,1] } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const inRight = { hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22,1,0.36,1] } } }

// ─── Compteur animé ───────────────────────────────────────────
function Count({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let v = 0; const step = to / 60
    const t = setInterval(() => { v = Math.min(v + step, to); setN(Math.floor(v)); if (v >= to) clearInterval(t) }, 25)
    return () => clearInterval(t)
  }, [inView, to])
  return <span ref={ref}>{n.toLocaleString('fr-FR')}{suffix}</span>
}

// ─── Barre de progress animée ─────────────────────────────────
function Bar({ pct, color }: { pct: number; color: string }) {
  const ref = useRef(null); const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
      <motion.div className="h-full rounded-full" style={{ background: color }}
        initial={{ width: 0 }} animate={inView ? { width: `${pct}%` } : {}}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }} />
    </div>
  )
}

// ─── Badge pill ───────────────────────────────────────────────
function Pill({ children, color = V.violetLt }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border uppercase tracking-wider"
      style={{ color, borderColor: color + '35', background: color + '12' }}>
      {children}
    </span>
  )
}

// ─── Carte étape ─────────────────────────────────────────────
function StepCard({ n, title, desc, icon: Icon, color }: {
  n: string; title: string; desc: string; icon: React.ElementType; color: string
}) {
  return (
    <motion.div variants={up} className="relative rounded-2xl p-6 border group overflow-hidden"
      style={{ background: V.card, borderColor: V.border }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}08 0%, transparent 70%)` }} />
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: color + '18' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="text-xs font-bold mb-1" style={{ color: color + 'aa' }}>Étape {n}</div>
      <h3 className="font-bold text-base mb-2" style={{ color: V.text }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: V.muted }}>{desc}</p>
    </motion.div>
  )
}

// ─── Carte tarif ─────────────────────────────────────────────
function PlanCard({ plan, price, period = '/mois', badge, features, cta, highlight, color, unavailable }: {
  plan: string; price: string; period?: string; badge?: string; features: string[];
  cta: string; highlight?: boolean; color: string; unavailable?: string[]
}) {
  return (
    <motion.div variants={up} className="rounded-2xl border flex flex-col overflow-hidden relative"
      style={{
        background: highlight ? V.card2 : V.card,
        borderColor: highlight ? color + '55' : V.border,
        boxShadow: highlight ? `0 0 60px ${color}20, 0 0 0 1px ${color}20` : 'none',
      }}>
      {highlight && (
        <div className="absolute -top-px left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      )}
      {badge && (
        <div className="text-center text-xs font-bold py-2.5 tracking-widest"
          style={{ background: `linear-gradient(135deg, ${color}25, ${color}15)`, color }}>
          ✦ {badge}
        </div>
      )}
      <div className="p-7 flex flex-col gap-6 flex-1">
        <div>
          <div className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color }}>{plan}</div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black" style={{ color: V.text }}>{price}</span>
            {price !== 'Gratuit' && <span className="text-sm" style={{ color: V.muted }}>{period}</span>}
          </div>
          {highlight && (
            <div className="text-xs mt-2 font-medium" style={{ color: color + 'cc' }}>
              Engagement mensuel · Sans engagement longue durée
            </div>
          )}
        </div>
        <ul className="space-y-3 flex-1">
          {features.map((f, i) => {
            const unavail = unavailable?.includes(f)
            return (
              <li key={i} className="flex items-start gap-2.5 text-sm"
                style={{ color: unavail ? V.dimmed : V.muted }}>
                <Check size={15} className="mt-0.5 shrink-0"
                  style={{ color: unavail ? V.dimmed : color }} />
                <span style={{ textDecoration: unavail ? 'line-through' : 'none' }}>{f}</span>
              </li>
            )
          })}
        </ul>
        <Link href="/inscription"
          className="w-full py-3.5 px-6 rounded-xl text-center text-sm font-bold transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-100"
          style={{
            background: highlight ? `linear-gradient(135deg, ${color}, ${color}cc)` : 'transparent',
            color: highlight ? '#fff' : color,
            border: `1.5px solid ${color}${highlight ? 'ff' : '60'}`,
          }}>
          {cta}
        </Link>
      </div>
    </motion.div>
  )
}

// ─── Carte upsell ─────────────────────────────────────────────
function UpsellCard({ qty, price, saving }: { qty: number; price: string; saving?: string }) {
  return (
    <motion.div variants={up}
      className="rounded-2xl border p-5 flex items-center justify-between gap-4 cursor-pointer group hover:border-violet-500/40 transition-all duration-200"
      style={{ background: V.card, borderColor: V.border }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
          style={{ background: V.violet + '20', color: V.accent }}>
          +{qty}
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: V.text }}>
            {qty} profil{qty > 1 ? 's' : ''} supplémentaire{qty > 1 ? 's' : ''}
          </div>
          {saving && <div className="text-xs" style={{ color: V.success }}>Économie : {saving}</div>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xl font-black" style={{ color: V.violetLt }}>{price}</div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: V.violet + '30' }}>
          <ArrowRight size={14} style={{ color: V.accent }} />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Témoignage ───────────────────────────────────────────────
function Testi({ name, age, city, text, score }: { name: string; age: number; city: string; text: string; score?: number }) {
  return (
    <motion.div variants={up} className="rounded-2xl p-6 border flex flex-col gap-4"
      style={{ background: V.card, borderColor: V.border }}>
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={13} fill={V.accent} stroke="none" />)}</div>
        {score && <div className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: V.violet + '20', color: V.accent }}>
          Score {score}%
        </div>}
      </div>
      <p className="text-sm leading-relaxed flex-1 italic" style={{ color: V.muted }}>&ldquo;{text}&rdquo;</p>
      <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: V.border }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: `linear-gradient(135deg, ${V.violet}40, ${V.pink}30)`, color: V.accent }}>
          {name[0]}
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: V.text }}>{name}, {age} ans</div>
          <div className="text-xs" style={{ color: V.dimmed }}>{city} · Marié(e) via MASR 🤲</div>
        </div>
      </div>
    </motion.div>
  )
}

// ════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════════
export default function HomePage() {
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [spotsLeft] = useState(47) // urgence

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ background: V.bg, color: V.text }} className="min-h-screen font-sans antialiased overflow-x-hidden">

      {/* ── BARRE URGENCE ───────────────────────────────────────── */}
      <div className="relative z-50 text-center py-2.5 text-xs font-semibold"
        style={{ background: `linear-gradient(90deg, ${V.violet}cc, ${V.pink}cc)` }}>
        <span className="opacity-90">⚡ Places limitées cette semaine — </span>
        <span className="font-bold">{spotsLeft} profils disponibles</span>
        <span className="opacity-90"> · Qualité garantie</span>
      </div>

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 transition-all duration-300"
        style={{
          background: scrolled ? V.bg + 'f2' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? `1px solid ${V.border}` : 'none',
        }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
              style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.pink})` }}>M</div>
            <span className="font-bold text-sm tracking-wide">Mariés au Second Regard</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {[['Comment ça marche', '#comment-ca-marche'], ['Tarifs', '#tarifs'], ['Témoignages', '#temoignages']].map(([l, h]) => (
              <a key={l} href={h} className="text-sm opacity-60 hover:opacity-100 transition-opacity" style={{ color: V.text }}>{l}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/connexion" className="text-sm px-4 py-2" style={{ color: V.muted }}>Connexion</Link>
            <Link href="/questionnaire"
              className="text-sm px-5 py-2.5 rounded-xl font-bold transition-all hover:opacity-90 hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.pink})`, color: '#fff' }}>
              Commencer mon test →
            </Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenu(!menu)} style={{ color: V.muted }}>
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <AnimatePresence>
          {menu && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t px-6 py-4 flex flex-col gap-4" style={{ background: V.card, borderColor: V.border }}>
              <Link href="/questionnaire" className="py-3 px-4 rounded-xl font-bold text-center text-sm"
                style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.pink})`, color: '#fff' }}>
                Commencer mon test →
              </Link>
              <Link href="/connexion" className="text-sm text-center py-2" style={{ color: V.muted }}>Se connecter</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-88px)] flex items-center overflow-hidden">
        {/* Orbs */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${V.violet}18 0%, transparent 70%)` }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${V.pink}12 0%, transparent 70%)` }} />

        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <div className="grid lg:grid-cols-[1fr_440px] gap-16 items-center">

            {/* Left */}
            <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-8">
              <motion.div variants={up}>
                <Pill color={V.accent}>✦ Mariage islamique · Matching IA · Encadré</Pill>
              </motion.div>

              <motion.div variants={up} className="space-y-4">
                <h1 className="text-5xl lg:text-[62px] font-black leading-[1.05] tracking-tight">
                  Trouve la personne
                  <span className="block" style={{
                    background: `linear-gradient(135deg, ${V.violetLt}, ${V.pink})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                  }}>compatible</span>
                  pour le mariage.
                </h1>
                <p className="text-xl font-medium" style={{ color: V.muted }}>
                  Basée sur tes valeurs, ta foi et ton profil — pas sur une photo.
                </p>
              </motion.div>

              <motion.div variants={up} className="space-y-3">
                <Link href="/questionnaire"
                  className="inline-flex items-center gap-3 px-8 py-4.5 rounded-2xl font-black text-base transition-all hover:scale-105 hover:shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${V.violet}, ${V.pink})`,
                    color: '#fff',
                    boxShadow: `0 20px 60px ${V.violet}40`,
                    padding: '18px 36px',
                  }}>
                  <Sparkles size={18} />
                  Commencer mon test de compatibilité
                  <ArrowRight size={18} />
                </Link>
                <p className="text-sm" style={{ color: V.dimmed }}>
                  Gratuit · 10 minutes · Résultats immédiats
                </p>
              </motion.div>

              {/* Proof stats */}
              <motion.div variants={up} className="flex flex-wrap items-center gap-6 pt-2">
                {[
                  { n: 2400, s: '+', label: 'membres actifs', color: V.violetLt },
                  { n: 380, s: '+', label: 'matchs réalisés', color: V.accent },
                  { n: 12, s: ' mariages', label: 'confirmés 🤲', color: V.pink },
                ].map((s) => (
                  <div key={s.label} className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black" style={{ color: s.color }}>
                      <Count to={s.n} suffix={s.s} />
                    </span>
                    <span className="text-sm" style={{ color: V.dimmed }}>{s.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right : carte profil IA */}
            <motion.div initial="hidden" animate="show" variants={inRight} className="relative">
              {/* Card principale */}
              <div className="rounded-3xl border p-7 space-y-6 relative overflow-hidden"
                style={{ background: V.card2, borderColor: V.violet + '40', boxShadow: `0 40px 80px ${V.violet}25` }}>
                {/* Gradient top */}
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${V.violet}, transparent)` }} />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: V.success }} />
                    <span className="text-xs font-semibold" style={{ color: V.success }}>Analyse IA en cours</span>
                  </div>
                  <Pill color={V.accent}>Score IA</Pill>
                </div>

                {/* Score */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20">
                    <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                      <circle cx="40" cy="40" r="34" fill="none" stroke={V.border} strokeWidth="6" />
                      <motion.circle cx="40" cy="40" r="34" fill="none"
                        stroke="url(#grad)" strokeWidth="6"
                        strokeLinecap="round" strokeDasharray="213.6"
                        initial={{ strokeDashoffset: 213.6 }}
                        animate={{ strokeDashoffset: 213.6 * 0.06 }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                      />
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={V.violet} />
                          <stop offset="100%" stopColor={V.pink} />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black" style={{ color: V.text }}>94</span>
                      <span className="text-xs" style={{ color: V.muted }}>%</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-base" style={{ color: V.text }}>Yasmine, 27 ans</div>
                    <div className="text-xs mt-0.5" style={{ color: V.dimmed }}>Paris · Pratiquante · Après nikah</div>
                    <div className="text-xs mt-1.5 font-semibold" style={{ color: V.accent }}>★ Forte compatibilité détectée</div>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="space-y-3">
                  {[
                    { label: 'Foi & pratique', pct: 96, color: V.violetLt },
                    { label: 'Projet de vie', pct: 100, color: V.success },
                    { label: 'Communication', pct: 82, color: V.accent },
                    { label: 'Personnalité', pct: 91, color: V.pink },
                  ].map((d) => (
                    <div key={d.label} className="space-y-1">
                      <div className="flex justify-between text-xs" style={{ color: V.muted }}>
                        <span>{d.label}</span><span style={{ color: d.color }}>{d.pct}%</span>
                      </div>
                      <Bar pct={d.pct} color={d.color} />
                    </div>
                  ))}
                </div>

                <Link href="/questionnaire"
                  className="w-full py-3.5 rounded-xl text-center text-sm font-bold block transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.pink})`, color: '#fff' }}>
                  Voir ce profil →
                </Link>
              </div>

              {/* Badge flottant */}
              <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-5 -right-3 px-3 py-2 rounded-xl border text-xs font-bold"
                style={{ background: V.card, borderColor: V.teal + '40', color: V.teal, boxShadow: `0 8px 24px ${V.teal}20` }}>
                🔒 Échanges supervisés
              </motion.div>

              <motion.div animate={{ y: [6, -6, 6] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -left-3 px-3 py-2 rounded-xl border text-xs font-bold"
                style={{ background: V.card, borderColor: V.pink + '40', color: V.pink, boxShadow: `0 8px 24px ${V.pink}20` }}>
                ✦ Selon les valeurs islamiques
              </motion.div>
            </motion.div>
          </div>
        </div>

        <a href="#comment-ca-marche"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 group">
          <span className="text-xs group-hover:opacity-100 opacity-40 transition-opacity" style={{ color: V.muted }}>Découvrir</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown size={18} style={{ color: V.dimmed }} />
          </motion.div>
        </a>
      </section>

      {/* ── PROOF BAR ───────────────────────────────────────────── */}
      <div className="border-y py-10" style={{ borderColor: V.border }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: 2400, s: '+', label: 'Membres actifs', color: V.violetLt },
              { n: 380, s: '+', label: 'Matchs réalisés', color: V.accent },
              { n: 140, s: '+', label: 'Mouqabalas organisées', color: V.pink },
              { n: 94, s: '%', label: 'Satisfaction membres', color: V.success },
            ].map((s) => (
              <motion.div key={s.label} variants={up}>
                <div className="text-4xl font-black mb-1" style={{ color: s.color }}>
                  <Count to={s.n} suffix={s.s} />
                </div>
                <div className="text-sm" style={{ color: V.dimmed }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── COMMENT ÇA MARCHE ───────────────────────────────────── */}
      <section id="comment-ca-marche" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <motion.div variants={up}><Pill color={V.accent}>Processus</Pill></motion.div>
            <motion.h2 variants={up} className="text-4xl font-black" style={{ color: V.text }}>
              De l&apos;inscription au mariage.<br />
              <span style={{ color: V.violetLt }}>En 4 étapes claires.</span>
            </motion.h2>
            <motion.p variants={up} className="text-base leading-relaxed" style={{ color: V.muted }}>
              Compréhensible en 5 secondes. Pensé pour vous guider à chaque étape.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: '1', title: 'Questionnaire', desc: '40 questions sur vos valeurs, votre foi et votre projet de vie. 10 minutes, résultats immédiats.', icon: Sparkles, color: V.violet },
              { n: '2', title: 'Analyse IA', desc: 'Notre algorithme analyse 7 dimensions de compatibilité. Pas des swipes — des correspondances réelles.', icon: Zap, color: V.accent },
              { n: '3', title: 'Profils compatibles', desc: 'Recevez chaque semaine des profils sélectionnés selon votre score de compatibilité globale.', icon: Users, color: V.pink },
              { n: '4', title: 'Mise en relation', desc: 'Si les deux parties le souhaitent, une mouqabala encadrée est organisée par notre équipe.', icon: Heart, color: V.success },
            ].map((s) => <StepCard key={s.n} {...s} />)}
          </motion.div>
        </div>
      </section>

      {/* ── STORYTELLING / ÉMOTION ──────────────────────────────── */}
      <section className="py-20 border-t" style={{ borderColor: V.border }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-3xl border overflow-hidden" style={{ borderColor: V.violet + '30' }}>
            <div className="p-12 md:p-16 relative" style={{ background: `linear-gradient(135deg, ${V.card2} 0%, ${V.bg} 100%)` }}>
              <div className="absolute inset-0 opacity-30"
                style={{ background: `radial-gradient(circle at 20% 50%, ${V.violet}20 0%, transparent 60%)` }} />
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={stagger}
                className="relative space-y-8 max-w-3xl">
                <motion.div variants={up}><Pill color={V.pink}>Notre promesse</Pill></motion.div>
                <motion.blockquote variants={up}
                  className="text-3xl md:text-4xl font-black leading-tight"
                  style={{ color: V.text }}>
                  &ldquo;Et si la bonne personne existait vraiment,<br />
                  <span style={{
                    background: `linear-gradient(135deg, ${V.violetLt}, ${V.pink})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                  }}>mais que vous ne l&apos;aviez pas encore rencontrée ?&rdquo;</span>
                </motion.blockquote>
                <motion.p variants={up} className="text-lg leading-relaxed max-w-2xl" style={{ color: V.muted }}>
                  MASR ne vous promet pas un mariage. On vous offre quelque chose de plus rare :
                  une <strong style={{ color: V.text }}>rencontre sincère</strong>, basée sur la compatibilité profonde,
                  dans le respect des valeurs islamiques — sans jeu, sans superficialité.
                </motion.p>
                <motion.div variants={up} className="flex flex-wrap gap-4">
                  {[
                    { icon: Shield, text: 'Encadré & supervisé' },
                    { icon: Lock, text: 'Halal & sérieux' },
                    { icon: Heart, text: 'Projet de mariage' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2 text-sm font-medium"
                      style={{ color: V.muted }}>
                      <item.icon size={15} style={{ color: V.violet }} />
                      {item.text}
                    </div>
                  ))}
                </motion.div>
                <motion.div variants={up}>
                  <Link href="/questionnaire"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.pink})`, color: '#fff' }}>
                    Commencer mon test gratuit <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TARIFS ──────────────────────────────────────────────── */}
      <section id="tarifs" className="py-24 border-t" style={{ borderColor: V.border }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger}
            className="text-center max-w-xl mx-auto mb-16 space-y-4">
            <motion.div variants={up}><Pill color={V.accent}>Tarifs</Pill></motion.div>
            <motion.h2 variants={up} className="text-4xl font-black" style={{ color: V.text }}>
              Choisissez votre offre
            </motion.h2>
            <motion.p variants={up} className="text-base" style={{ color: V.muted }}>
              Sans engagement longue durée. Résiliable à tout moment.
            </motion.p>
          </motion.div>

          {/* Plans */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={stagger}
            className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-16">
            <PlanCard
              plan="Basique"
              price="19€"
              color={V.muted}
              cta="Choisir Basique"
              features={[
                '1 profil compatible / semaine',
                'Matching IA',
                'Score de compatibilité détaillé',
                'Messagerie interne',
                'Chat limité (étapes 1-2)',
                'Explication IA complète',
                'Priorité dans les suggestions',
              ]}
              unavailable={['Explication IA complète', 'Priorité dans les suggestions']}
            />
            <PlanCard
              plan="Premium"
              price="39€"
              badge="Le plus choisi"
              color={V.violet}
              cta="Choisir Premium →"
              highlight
              features={[
                '2 profils compatibles / semaine',
                'Matching IA illimité',
                'Chat complet (toutes étapes)',
                'Explication IA complète',
                'Priorité dans les suggestions',
                'Accès mouqabala standard',
              ]}
            />
            <PlanCard
              plan="Ultra"
              price="69€"
              color={V.pink}
              cta="Choisir Ultra"
              features={[
                '3 profils compatibles / semaine',
                'Tout le plan Premium',
                'Priorité élevée dans le matching',
                'Accès prioritaire à la mouqabala',
                'Support dédié',
                'Profil boosté en visibilité',
              ]}
            />
          </motion.div>

          {/* Upsells */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger}
            className="max-w-3xl mx-auto">
            <motion.div variants={up} className="text-center mb-8 space-y-2">
              <h3 className="text-2xl font-black" style={{ color: V.text }}>
                Obtenir plus de profils compatibles
              </h3>
              <p className="text-sm" style={{ color: V.muted }}>
                Disponible pour tous les abonnés · Crédits valables 30 jours
              </p>
            </motion.div>
            <div className="space-y-3">
              <UpsellCard qty={1} price="7€" />
              <UpsellCard qty={3} price="18€" saving="3€ vs à l'unité" />
              <UpsellCard qty={5} price="29€" saving="6€ vs à l'unité" />
            </div>
            <motion.p variants={up} className="text-center text-xs mt-5" style={{ color: V.dimmed }}>
              Paiement sécurisé par Stripe · Aucun remboursement après achat · TVA incluse
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── URGENCE + POURQUOI AGIR ─────────────────────────────── */}
      <section className="py-16 border-t" style={{ borderColor: V.border }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger}
            className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Clock, title: 'Places limitées', desc: `Seulement ${spotsLeft} nouveaux profils acceptés cette semaine pour garantir la qualité des matchs.`, color: V.pink },
              { icon: Shield, title: 'Zéro risque', desc: 'Aucun engagement longue durée. Résiliable en 2 clics. Votre argent, vos décisions.', color: V.violet },
              { icon: Star, title: '94% de satisfaction', desc: 'Nos membres qui complètent le questionnaire reçoivent leur premier match en moins de 48h.', color: V.accent },
            ].map((item) => (
              <motion.div key={item.title} variants={up}
                className="rounded-2xl p-6 border flex flex-col gap-3" style={{ background: V.card, borderColor: V.border }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: item.color + '18' }}>
                  <item.icon size={18} style={{ color: item.color }} />
                </div>
                <div className="font-bold" style={{ color: V.text }}>{item.title}</div>
                <div className="text-sm leading-relaxed" style={{ color: V.muted }}>{item.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ─────────────────────────────────────────── */}
      <section id="temoignages" className="py-24 border-t" style={{ borderColor: V.border }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger}
            className="text-center max-w-xl mx-auto mb-14 space-y-4">
            <motion.div variants={up}><Pill color={V.pink}>Témoignages</Pill></motion.div>
            <motion.h2 variants={up} className="text-4xl font-black" style={{ color: V.text }}>
              Ils ont trouvé leur moitié 🤲
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="grid md:grid-cols-3 gap-5">
            <Testi name="Yasmine" age={27} city="Paris" score={91}
              text="En 3 semaines, j'avais rencontré mon mari. Le score de compatibilité était de 91% — et c'est exactement ce qu'on vit au quotidien. Je ne croyais plus aux rencontres islamiques sérieuses. MASR m'a prouvé que ça existait." />
            <Testi name="Adam" age={31} city="Lyon" score={88}
              text="J'avais essayé d'autres plateformes. Rien de sérieux. Ici, le cadre et la supervision font toute la différence. On se concentre sur l'essentiel. La mouqabala a été parfaitement organisée. Alhamdulillah." />
            <Testi name="Fatima" age={26} city="Marseille" score={94}
              text="Le questionnaire est long mais c'est exactement pour ça que ça marche. Mon score avec lui était de 94%. On s'est marié 4 mois après notre première mouqabala. Que Allah bénisse cette plateforme." />
          </motion.div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────── */}
      <section className="py-28 border-t" style={{ borderColor: V.border }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={stagger}
            className="space-y-8">
            <motion.div variants={up}>
              <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-3xl mb-6"
                style={{
                  background: `linear-gradient(135deg, ${V.violet}30, ${V.pink}20)`,
                  border: `1px solid ${V.violet}30`,
                }}>🤲</div>
            </motion.div>
            <motion.h2 variants={up} className="text-5xl md:text-6xl font-black leading-tight" style={{ color: V.text }}>
              Votre moitié<br />
              <span style={{
                background: `linear-gradient(135deg, ${V.violetLt}, ${V.pink})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>vous attend.</span>
            </motion.h2>
            <motion.p variants={up} className="text-lg" style={{ color: V.muted }}>
              Commencez votre test de compatibilité maintenant — gratuit, 10 minutes, résultats immédiats.
            </motion.p>
            <motion.div variants={up} className="flex flex-col items-center gap-4">
              <Link href="/questionnaire"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${V.violet}, ${V.pink})`,
                  color: '#fff',
                  boxShadow: `0 30px 80px ${V.violet}40`,
                }}>
                <Sparkles size={22} />
                Commencer mon test gratuit
                <ArrowRight size={22} />
              </Link>
              <p className="text-sm" style={{ color: V.dimmed }}>
                ⚡ Encore <strong style={{ color: V.pink }}>{spotsLeft} places</strong> disponibles cette semaine
              </p>
            </motion.div>
            <motion.p variants={up} className="text-sm italic" style={{ color: V.dimmed }}>
              Que Allah facilite votre chemin vers le mariage.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t py-14" style={{ borderColor: V.border }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
                  style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.pink})` }}>M</div>
                <span className="font-bold text-sm">MASR</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: V.muted }}>
                La première plateforme de mariage islamique basée sur l&apos;IA. Encadrée. Sérieuse. Halal.
              </p>
            </div>
            {[
              { title: 'PLATEFORME', links: [['Commencer mon test', '/questionnaire'], ['Se connecter', '/connexion'], ['Tarifs', '#tarifs']] },
              { title: 'LÉGAL', links: [['Mentions légales', '/mentions-legales'], ['Confidentialité', '/confidentialite'], ['CGU', '/cgu'], ['CGV', '/cgv'], ['Règles', '/regles']] },
              { title: 'CONTACT', links: [['mariesausecondregard@gmail.com', 'mailto:mariesausecondregard@gmail.com'], ['Instagram', '#'], ['Facebook', '#']] },
            ].map((col) => (
              <div key={col.title} className="space-y-3">
                <div className="text-xs font-bold tracking-widest" style={{ color: V.dimmed }}>{col.title}</div>
                <ul className="space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-sm opacity-60 hover:opacity-100 transition-opacity" style={{ color: V.muted }}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderColor: V.border }}>
            <p className="text-xs" style={{ color: V.dimmed }}>© 2026 Mariés au Second Regard · Tous droits réservés · Marque déposée à l&apos;INPI</p>
            <p className="text-xs" style={{ color: V.dimmed }}>Paiements sécurisés par <span style={{ color: V.muted }}>Stripe</span></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
