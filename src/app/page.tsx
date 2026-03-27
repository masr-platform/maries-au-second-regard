'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart, Shield, Brain, MessageCircle, Star, ChevronDown,
  CheckCircle2, Users, Lock, Sparkles, ArrowRight
} from 'lucide-react'

// ─── Animation variants ────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}
const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
}

// ─── Données statiques ─────────────────────────────────────────────
const ETAPES = [
  {
    num: '01',
    titre: 'Inscription & Vérification',
    desc: 'Créez votre profil sécurisé. Votre identité est vérifiée pour garantir l\'authenticité de chaque membre.',
    icon: Shield,
  },
  {
    num: '02',
    titre: 'Questionnaire Approfondi',
    desc: 'Répondez à notre questionnaire en 7 dimensions : foi, valeurs, personnalité, projet de vie et bien plus.',
    icon: Brain,
  },
  {
    num: '03',
    titre: 'L\'IA Travaille Pour Vous',
    desc: 'Notre intelligence artificielle analyse votre profil et identifie les compatibilités les plus profondes.',
    icon: Sparkles,
  },
  {
    num: '04',
    titre: 'Proposition de Profil',
    desc: 'Vous recevez 1 à 3 profils compatibles par semaine selon votre abonnement, avec le score de compatibilité.',
    icon: Heart,
  },
  {
    num: '05',
    titre: 'Chat Supervisé',
    desc: 'Si l\'intérêt est mutuel, un chat encadré s\'ouvre. Chaque conversation respecte les préceptes islamiques.',
    icon: MessageCircle,
  },
  {
    num: '06',
    titre: 'Mouquabala & Wali',
    desc: 'Une rencontre en visio supervisée par un imam, qui facilitera ensuite le contact avec le tuteur de la jeune femme.',
    icon: Star,
  },
]

const PLANS = [
  {
    nom: 'Gratuit',
    prix: '0',
    periode: 'pour commencer',
    profils: '1 profil / semaine',
    features: ['1 profil compatible proposé par semaine', 'Chat de base (étape présentation)', 'Profil vérifiable', 'Support par email'],
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
    features: ['3 profils compatibles par semaine', 'Toutes fonctionnalités Standard', 'Badge vérifié Premium', 'Appel visio illimité', 'Accès prioritaire aux imams'],
    cta: 'Choisir Premium',
    highlight: false,
  },
]

const TEMOIGNAGES = [
  {
    texte: 'Je n\'aurais jamais osé m\'inscrire sur un site de rencontre classique. Ici, j\'ai su dès le départ que tout était encadré. Nous nous sommes mariés 6 mois après notre première conversation.',
    nom: 'Fatima & Yassine',
    ville: 'Lyon',
    score: 94,
  },
  {
    texte: 'L\'imam qui a supervisé notre mouquabala était attentionné et professionnel. Il a tout facilité avec ma famille. Un processus digne et respectueux.',
    nom: 'Khadija & Omar',
    ville: 'Paris',
    score: 88,
  },
  {
    texte: 'Le questionnaire est vraiment profond. Quand j\'ai vu le profil proposé, j\'ai compris pourquoi on nous avait mis en relation. Notre vision du foyer était identique.',
    nom: 'Amina & Ibrahim',
    ville: 'Marseille',
    score: 91,
  },
]

// ─── Composant principal ────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-900 overflow-x-hidden">

      {/* ══ NAVBAR ══════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-md border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-gold-500 flex items-center justify-center">
              <span className="text-gold-500 text-xs font-serif font-bold">M</span>
            </div>
            <span className="font-serif text-white font-semibold text-sm tracking-wide">
              MARIÉS AU SECOND REGARD
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-dark-200">
            <a href="#comment-ca-marche" className="hover:text-gold-400 transition-colors">Comment ça marche</a>
            <a href="#tarifs" className="hover:text-gold-400 transition-colors">Tarifs</a>
            <a href="#temoignages" className="hover:text-gold-400 transition-colors">Témoignages</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/connexion" className="text-sm text-dark-200 hover:text-white transition-colors">
              Se connecter
            </Link>
            <Link href="/inscription" className="btn-gold text-sm py-2 px-4">
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background subtil */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="mb-6">
              <span className="badge-gold text-xs tracking-widest uppercase">
                ✦ Selon les préceptes de l&apos;Islam ✦
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-6"
            >
              La rencontre qui<br />
              <span className="shimmer-text">commence par le fond</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl md:text-2xl text-dark-200 max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Notre intelligence artificielle analyse votre profil en profondeur
              et vous propose des compatibilités réelles. Encadrée. Sérieuse. Halal.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/inscription" className="btn-gold text-base py-4 px-8 flex items-center gap-2 justify-center">
                Commencer mon parcours
                <ArrowRight size={18} />
              </Link>
              <a href="#comment-ca-marche" className="btn-outline-gold text-base py-4 px-8 flex items-center gap-2 justify-center">
                Découvrir le concept
                <ChevronDown size={18} />
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12 flex items-center justify-center gap-8 text-sm text-dark-300">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-gold-500" />
                <span>100% sécurisé & vérifié</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-gold-500" />
                <span>Chat supervisé & encadré</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gold-500" />
                <span>Imams partenaires</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats flottantes */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex items-center gap-8 bg-dark-700/80 backdrop-blur border border-dark-500 rounded-2xl px-8 py-4"
          >
            {[
              { val: '94%', label: 'Taux de satisfaction' },
              { val: '7', label: 'Dimensions analysées' },
              { val: '48h', label: 'Délai premier matching' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-gold-500">{s.val}</div>
                <div className="text-xs text-dark-300 mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ CONCEPT ═════════════════════════════════════════════════ */}
      <section className="py-24 bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/2 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-4">
              Notre différence
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-title mb-6">
              Vous ne choisissez pas un profil.<br />
              <span className="text-gold-400">Nous vous révélons une compatibilité.</span>
            </motion.h2>
            <motion.div variants={fadeUp} className="gold-divider" />
            <motion.p variants={fadeUp} className="text-lg text-dark-200 max-w-3xl mx-auto leading-relaxed">
              Contrairement aux applications de rencontre classiques où vous scrollez des centaines de photos,
              Mariés au Second Regard vous propose uniquement des profils sélectionnés par notre intelligence artificielle
              après analyse approfondie de vos valeurs, votre personnalité et vos aspirations.
              Comme <em className="text-gold-400">Mariés au Premier Regard</em>, mais selon les préceptes de l&apos;Islam.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ══ COMMENT ÇA MARCHE ══════════════════════════════════════ */}
      <section id="comment-ca-marche" className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-4">
              Le parcours
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-title">
              De l&apos;inscription au mariage
            </motion.h2>
            <motion.div variants={fadeUp} className="gold-divider" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ETAPES.map((etape, i) => {
              const Icon = etape.icon
              return (
                <motion.div
                  key={etape.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="card-dark relative group hover:border-gold-500/40 transition-all duration-300"
                >
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center">
                    <span className="text-black text-xs font-bold">{etape.num}</span>
                  </div>
                  <div className="mb-4 p-3 bg-gold-500/10 rounded-lg w-fit">
                    <Icon size={22} className="text-gold-500" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{etape.titre}</h3>
                  <p className="text-sm text-dark-200 leading-relaxed">{etape.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ L'IA ════════════════════════════════════════════════════ */}
      <section className="py-24 bg-dark-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-4">Intelligence artificielle</p>
              <h2 className="section-title mb-6">Une IA pensée pour<br />les valeurs islamiques</h2>
              <div className="gold-divider ml-0 mb-6" />
              <p className="text-dark-200 leading-relaxed mb-8">
                Notre algorithme analyse 7 dimensions clés pour calculer votre Score de Compatibilité Globale.
                Les réponses libres sont analysées par traitement du langage naturel pour saisir la profondeur
                de vos valeurs — pas seulement vos préférences de surface.
              </p>

              <div className="space-y-4">
                {[
                  { dim: 'Valeurs islamiques', pct: 25 },
                  { dim: 'Personnalité & Communication', pct: 35 },
                  { dim: 'Projet de vie & Famille', pct: 20 },
                  { dim: 'Style de vie & Carrière', pct: 15 },
                  { dim: 'Compatibilité physique', pct: 5 },
                ].map((d) => (
                  <div key={d.dim}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-dark-200">{d.dim}</span>
                      <span className="text-gold-500 font-medium">{d.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${d.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full bg-gold-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card-dark border-gold-500/30"
            >
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full border-4 border-gold-500 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-gold-500">92%</span>
                </div>
                <p className="text-white font-semibold">Score de Compatibilité</p>
                <p className="text-sm text-dark-300 mt-1">Exemple de matching réel</p>
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
                    <span className="text-sm text-dark-200 w-36 flex-shrink-0">{s.label}</span>
                    <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold-gradient rounded-full"
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gold-400 w-10 text-right">{s.score}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-3 bg-gold-500/10 border border-gold-500/30 rounded-lg text-center">
                <p className="text-gold-400 text-sm font-medium">✦ Forte compatibilité détectée</p>
                <p className="text-dark-300 text-xs mt-1">Profil proposé aux deux utilisateurs</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ TARIFS ══════════════════════════════════════════════════ */}
      <section id="tarifs" className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-4">
              Nos formules
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-title">
              Choisissez votre rythme
            </motion.h2>
            <motion.div variants={fadeUp} className="gold-divider" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.nom}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-8 border ${
                  plan.highlight
                    ? 'bg-dark-700 border-gold-500 shadow-gold'
                    : 'bg-dark-800 border-dark-600'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gold-500 text-black text-xs font-bold px-4 py-1.5 rounded-full">
                      LE PLUS CHOISI
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-2">{plan.nom}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-gold-500">{plan.prix}€</span>
                  <span className="text-dark-300 text-sm">{plan.periode}</span>
                </div>
                <p className="text-sm text-gold-400 font-medium mb-6">{plan.profils}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-dark-200">
                      <CheckCircle2 size={16} className="text-gold-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/inscription"
                  className={`w-full flex items-center justify-center py-3 rounded-lg font-semibold transition-all ${
                    plan.highlight
                      ? 'btn-gold'
                      : 'btn-outline-gold'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-dark-400 text-sm mt-8">
            Sans engagement. Résiliation à tout moment. Paiement sécurisé par Stripe.
          </p>
        </div>
      </section>

      {/* ══ TÉMOIGNAGES ════════════════════════════════════════════ */}
      <section id="temoignages" className="py-24 bg-dark-800">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-4">
              Ils se sont mariés
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-title">
              Des histoires vraies
            </motion.h2>
            <motion.div variants={fadeUp} className="gold-divider" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEMOIGNAGES.map((t, i) => (
              <motion.div
                key={t.nom}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-dark"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="text-gold-500 fill-current" />
                  ))}
                </div>
                <p className="text-dark-200 text-sm leading-relaxed mb-6 italic">&ldquo;{t.texte}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">{t.nom}</p>
                    <p className="text-dark-400 text-xs">{t.ville}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold-500 font-bold">{t.score}%</p>
                    <p className="text-dark-400 text-xs">compatibilité</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ══════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/5 to-transparent" />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="section-title mb-6">
              Votre moitié vous attend.<br />
              <span className="shimmer-text">Commencez maintenant.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-200 text-lg mb-10">
              Inscription gratuite. Le questionnaire prend 15 minutes.
              Votre premier profil compatible arrive sous 48h.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/inscription" className="btn-gold text-lg py-4 px-10 inline-flex items-center gap-3">
                Créer mon profil gratuitement
                <ArrowRight size={20} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════════ */}
      <footer className="bg-dark-900 border-t border-dark-700 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="font-serif text-white font-semibold mb-4">Mariés au Second Regard</h4>
              <p className="text-dark-300 text-sm leading-relaxed">
                La première plateforme de mariage islamique intelligente. Selon les préceptes de l&apos;Islam.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4 text-sm">Plateforme</h4>
              <ul className="space-y-2 text-dark-300 text-sm">
                <li><Link href="/inscription" className="hover:text-gold-400 transition-colors">S&apos;inscrire</Link></li>
                <li><Link href="/connexion" className="hover:text-gold-400 transition-colors">Se connecter</Link></li>
                <li><a href="#tarifs" className="hover:text-gold-400 transition-colors">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4 text-sm">Légal</h4>
              <ul className="space-y-2 text-dark-300 text-sm">
                <li><Link href="/mentions-legales" className="hover:text-gold-400 transition-colors">Mentions légales</Link></li>
                <li><Link href="/confidentialite" className="hover:text-gold-400 transition-colors">Confidentialité & RGPD</Link></li>
                <li><Link href="/cgu" className="hover:text-gold-400 transition-colors">CGU</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4 text-sm">Contact</h4>
              <ul className="space-y-2 text-dark-300 text-sm">
                <li>contact@mariesausecondregard.fr</li>
                <li>Instagram</li>
                <li>Facebook</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-dark-400 text-sm">
              © 2026 Mariés au Second Regard. Tous droits réservés. Marque déposée à l&apos;INPI.
            </p>
            <p className="text-dark-500 text-xs">
              Paiements sécurisés par <span className="text-white">Stripe</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
