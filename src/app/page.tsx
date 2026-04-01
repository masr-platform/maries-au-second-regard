import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, Star, ArrowRight } from 'lucide-react'
import { FAQItem } from './FAQItem'

// ─── Compteur statique ────────────────────────────────────────────
function Counter({ end, suffix = '' }: { end: number; suffix?: string; duration?: number }) {
  return <span>{end}{suffix}</span>
}

const psychologues = [
  { initial: 'S', nom: 'Dr. Salma R.', spec: 'Psychologue clinicienne · Thérapie de couple', annees: '12 ans' },
  { initial: 'K', nom: 'Dr. Karim B.', spec: 'Psychologue clinicien · Attachment & relations', annees: '9 ans' },
  { initial: 'A', nom: 'Dr. Amira T.', spec: 'Psychologue clinicienne · Identité & spiritualité', annees: '14 ans' },
  { initial: 'Y', nom: 'Dr. Yassine M.', spec: 'Psychologue clinicien · Communication non-violente', annees: '11 ans' },
  { initial: 'N', nom: 'Dr. Nour E.', spec: 'Psychologue clinicienne · Projet de vie islamique', annees: '8 ans' },
]


const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://mariesausecondregard.com/#website',
      url: 'https://mariesausecondregard.com',
      name: 'Mariés au Second Regard',
      description: 'Plateforme de mariage islamique sérieux en France — IA + psychologues cliniciens musulmans',
      inLanguage: 'fr-FR',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://mariesausecondregard.com/inscription',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://mariesausecondregard.com/#organization',
      name: 'Mariés au Second Regard',
      url: 'https://mariesausecondregard.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mariesausecondregard.com/logo.png',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'mariesausecondregard@gmail.com',
        contactType: 'customer service',
        availableLanguage: 'French',
      },
      sameAs: [],
    },
    {
      '@type': 'Service',
      '@id': 'https://mariesausecondregard.com/#service',
      name: 'Mariage islamique sérieux en France',
      description: 'Service de mise en relation pour le mariage islamique. Compatibilité validée par IA et psychologues cliniciens musulmans. Inscription gratuite. Nikah halal.',
      provider: { '@id': 'https://mariesausecondregard.com/#organization' },
      areaServed: { '@type': 'Country', name: 'France' },
      serviceType: 'Mariage islamique',
      offers: [
        {
          '@type': 'Offer',
          name: 'Essentiel',
          price: '19.90',
          priceCurrency: 'EUR',
          description: '1 profil qualifié par semaine, mouqabala encadrée, chat supervisé',
        },
        {
          '@type': 'Offer',
          name: 'Premium',
          price: '29.90',
          priceCurrency: 'EUR',
          description: '10 compatibilités par mois, accompagnement psychologue',
        },
        {
          '@type': 'Offer',
          name: 'Élite',
          price: '49.90',
          priceCurrency: 'EUR',
          description: 'Compatibilités illimitées, coach mariage dédié',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: "Qu'est-ce que Mariés au Second Regard ?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Mariés au Second Regard est une plateforme de mariage islamique sérieux en France. Elle utilise l'IA et 5 psychologues cliniciens musulmans pour valider les compatibilités à +85% avant de les présenter aux membres.",
          },
        },
        {
          '@type': 'Question',
          name: "Comment fonctionne le processus de mariage islamique sur la plateforme ?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Le processus se déroule en 5 étapes : questionnaire de 40 questions, analyse IA sur 7 dimensions, validation par un psychologue clinicien, chat supervisé si accord des deux parties, puis mouqabala virtuelle encadrée.",
          },
        },
        {
          '@type': 'Question',
          name: "L'inscription est-elle gratuite ?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Oui, l'inscription et le questionnaire sont entièrement gratuits. Un abonnement est nécessaire uniquement pour recevoir vos compatibilités validées (à partir de 19,90€/mois).",
          },
        },
        {
          '@type': 'Question',
          name: "Qu'est-ce qu'une mouqabala ?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Une mouqabala est un entretien encadré entre deux personnes envisageant le mariage. Elle se déroule de manière virtuelle sur la plateforme, dans un cadre islamique strict, sans échange de coordonnées personnelles.",
          },
        },
      ],
    },
  ],
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#060412] text-white overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Fond coloré global — dégradés ambiants fixes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-700/8 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-fuchsia-600/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-violet-500/6 rounded-full blur-[120px]" />
      </div>

      {/* ── NAVIGATION ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-purple-500/10 bg-[#060412]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Mariés au Second Regard"
              style={{ width: 70, height: 70, objectFit: 'contain' }}
            />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-black tracking-widest uppercase bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">
                Mariés au Second Regard
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium">
                Selon les préceptes de l'Islam
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/tarifs" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block">
              Tarifs
            </Link>
            <Link href="/faq" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block">
              FAQ
            </Link>
            <Link href="/connexion" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block">
              Connexion
            </Link>
            <Link href="/inscription"
              className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:shadow-lg hover:shadow-purple-500/25">
              Commencer gratuitement →
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          HERO — Cinématique, inattendu, émotionnel
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-screen flex items-center justify-center pt-28 pb-20 px-6">
        {/* Photo de fond — mariage musulman */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://images.pexels.com/photos/31619527/pexels-photo-31619527.jpeg?auto=compress&cs=tinysrgb&w=1260&q=75"
            alt=""
            fill
            priority
            quality={70}
            sizes="(max-width: 640px) 640px, (max-width: 1080px) 1080px, 1920px"
            className="object-cover"
            style={{ filter: 'brightness(0.55) saturate(1.0)', objectPosition: 'center 8%' }}
          />
          {/* Dégradé par-dessus pour lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060412]/40 via-[#060412]/10 to-[#060412]/65" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060412]/30 via-transparent to-[#060412]/30" />
        </div>

        {/* Orbs dramatiques par-dessus la photo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-700/8 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">

          {/* Indicateur live — preuve de vie et d'activité */}
          <div
            className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 mb-14">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fuchsia-400" />
            </span>
            <span className="text-white/55 text-sm">
              En ce moment — <strong className="text-white">3 nouvelles compatibilités</strong> viennent d'être validées
            </span>
          </div>

          {/* HEADLINE — Cinématique, narratif, inattendu */}
          <div>
            <p
              className="text-white/35 text-lg md:text-xl font-medium tracking-wide mb-4">
              Quelque part en France,
            </p>
          </div>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[85px] font-black leading-[1.05] tracking-tight mb-5">
            <span className="text-white">quelqu'un vous cherche.</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">
              Nous l'avons trouvé(e).
            </span>
          </h1>

          <p
            className="text-white/30 text-base md:text-lg font-medium italic mb-10">
            Il ne manque que vous.
          </p>

          {/* CTA principal */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link href="/inscription"
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white px-10 py-5 rounded-full text-lg font-black transition-all shadow-2xl shadow-fuchsia-500/25 hover:shadow-fuchsia-500/45 hover:scale-105">
              <span className="relative z-10 flex items-center gap-2">
                Trouver ma compatibilité — gratuit
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link href="#le-processus" className="text-white/30 hover:text-white/60 text-sm transition-colors">
              Comment ça marche ↓
            </Link>
          </div>

          {/* Signaux de confiance */}
          <div
            className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/30">
            {['Aucune carte bancaire', 'Inscription 2 min', 'Psychologues certifiés', '100% halal'].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-fuchsia-400" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BARRE DE PREUVE — Crédibilité immédiate
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 border-y border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-fuchsia-950/20 to-purple-950/30 relative z-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: 2847, suffix: '+', label: 'Membres actifs', sub: 'profils vérifiés manuellement' },
            { val: 85, suffix: '%', label: 'Seuil minimum', sub: 'de compatibilité garantie' },
            { val: 312, suffix: '', label: 'Mariages formés', sub: 'alhamdulillah' },
            { val: 5, suffix: '', label: 'Psychologues', sub: 'cliniciens musulmans diplômés' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent mb-1">
                <Counter end={s.val} suffix={s.suffix} />
              </div>
              <div className="text-purple-400 font-semibold text-sm mb-0.5">{s.label}</div>
              <div className="text-white/30 text-xs">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FILTRAGE & SÉLECTION — Mécanisme de qualification
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Ce qu'on est vraiment</p>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Mariés au Second Regard,
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">c'est quoi ?</span>
            </h2>
          </div>

          {/* ── 5 étapes ────────────────────────────────────────── */}
          <div className="mb-16">
            <p className="text-center text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">De l'inscription au mariage</p>
            <h3 className="text-center text-2xl md:text-3xl font-black text-white mb-10">
              Chaque étape a
              <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent"> un sens.</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { emoji: '📝', label: 'Questionnaire', sub: '40 questions sur vos valeurs, votre foi, votre projet de vie' },
                { emoji: '🤖', label: "L'IA analyse", sub: 'Compatibilité spirituelle, caractère, style de vie, vision du couple' },
                { emoji: '🩺', label: 'Psychologue valide', sub: 'Il confirme que le score est réel et que le profil est sérieux' },
                { emoji: '💬', label: 'Chat supervisé', sub: 'Si les deux acceptent — échanges encadrés sur la plateforme' },
                { emoji: '🤝', label: 'Mouqabala', sub: 'Entretien virtuel pour confirmer avant le mariage' },
              ].map((step, i) => (
                <div key={i}
                  className="flex flex-col items-center text-center gap-3 relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-2xl shadow-lg shadow-fuchsia-500/20">
                    {step.emoji}
                  </div>
                  <p className="text-white text-sm font-bold leading-tight">{step.label}</p>
                  <p className="text-white/40 text-xs leading-snug">{step.sub}</p>
                  {i < 4 && <div className="absolute top-7 left-full w-4 text-white/20 text-sm hidden sm:block">→</div>}
                </div>
              ))}
            </div>
          </div>

          {/* ── 4 boxes colorées ────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                emoji: '🧠',
                titre: 'Une plateforme de mariage islamique sérieux',
                texte: 'Pas une appli de rencontres. Ici, tout le monde cherche le nikah. Rien d\'autre.',
                gradient: 'from-purple-600/20 to-violet-800/20',
                border: 'border-purple-500/30',
                color: 'text-purple-300',
              },
              {
                emoji: '🤖',
                titre: 'Une IA qui analyse vraiment',
                texte: 'Elle compare vos valeurs, votre foi, votre caractère, votre vision du couple. Sur 7 critères. Seul un score +85% passe.',
                gradient: 'from-fuchsia-600/20 to-pink-800/20',
                border: 'border-fuchsia-500/30',
                color: 'text-fuchsia-300',
              },
              {
                emoji: '🩺',
                titre: '5 psychologues cliniciens musulmans',
                texte: 'Ils ont conçu les questions, calibré l\'IA, et valident chaque compatibilité avant qu\'elle vous soit envoyée.',
                gradient: 'from-blue-600/20 to-indigo-800/20',
                border: 'border-blue-500/30',
                color: 'text-blue-300',
              },
              {
                emoji: '🔒',
                titre: 'Un cadre islamique à chaque étape',
                texte: 'Chat supervisé, mouqabala encadrée, zéro échange de coordonnées. Votre réputation est protégée.',
                gradient: 'from-amber-600/15 to-orange-800/15',
                border: 'border-amber-500/30',
                color: 'text-amber-300',
              },
            ].map((b, i) => (
              <div key={i}
                className={`bg-gradient-to-br ${b.gradient} border ${b.border} rounded-3xl p-7 hover:scale-[1.02] transition-all`}>
                <div className="text-4xl mb-4">{b.emoji}</div>
                <h3 className={`font-black text-lg mb-2 ${b.color}`}>{b.titre}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{b.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TARIFS — Investment framing
      ═══════════════════════════════════════════════════════════ */}
      <section id="tarifs" className="py-28 px-6 bg-gradient-to-b from-fuchsia-950/10 via-purple-950/15 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-5">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Accès</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Un seul profil.
              <br />
              <span className="bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Le bon.</span>
            </h2>
            <p className="text-white/45 max-w-lg mx-auto leading-relaxed">
              Pas 500 swipes. Pas de hasard. Nos psychologues et notre IA sélectionnent pour vous
              les profils les plus compatibles. <strong className="text-white">Vous n'avez qu'une décision à prendre.</strong>
            </p>
          </div>
          <div
            className="text-center mb-12">
            <span className="inline-block bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm px-5 py-2 rounded-full">
              Inscription + Questionnaire gratuits · Abonnement pour recevoir vos compatibilités
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                nom: 'Essentiel',
                prix: '19,90€',
                desc: 'Pour une démarche posée et sérieuse.',
                features: [
                  '1 profil compatible proposé par semaine',
                  'Profils 100% vérifiés et sélectionnés par notre IA',
                  'Chat encadré avec 1 personne à la fois',
                  '1 Mouqabala virtuelle par mois avec un imam',
                  'Score de compatibilité sur 7 dimensions',
                  'Support email',
                ],
                cta: 'Commencer',
                popular: false,
              },
              {
                nom: 'Premium',
                prix: '29,90€',
                desc: 'Tout l\'Essentiel, plus de profils et plus de liberté.',
                features: [
                  '1 profil compatible proposé par jour (×4 vs Essentiel)',
                  'Profils 100% vérifiés et sélectionnés par notre IA',
                  'Chat encadré avec plusieurs matchs en même temps',
                  '3 Mouqabalas virtuelles par mois avec un imam',
                  'Accès prioritaire aux nouveaux profils inscrits',
                  'Score de compatibilité sur 7 dimensions',
                  'Support prioritaire',
                ],
                cta: 'Choisir Premium',
                popular: true,
              },
              {
                nom: 'Élite',
                prix: '49,90€',
                desc: 'Tout le Premium, avec visibilité maximale.',
                features: [
                  '3 profils compatibles proposés par jour (×3 vs Premium)',
                  'Profils 100% vérifiés et sélectionnés par notre IA',
                  'Chat encadré avec plusieurs matchs en même temps',
                  'Mouqabalas virtuelles illimitées avec un imam',
                  'Votre profil mis en avant — vu en priorité par les autres',
                  'Accès en avant-première aux nouveaux inscrits',
                  'Score de compatibilité sur 7 dimensions',
                  'Accompagnement personnalisé par notre équipe',
                ],
                cta: 'Choisir Élite',
                popular: false,
              },
            ].map((plan, i) => (
              <div key={i}
                className={`relative rounded-3xl p-7 flex flex-col ${
                  plan.popular
                    ? 'bg-gradient-to-b from-purple-600/25 to-fuchsia-900/20 border-2 border-purple-500 shadow-2xl shadow-purple-500/15'
                    : i === 0
                      ? 'bg-gradient-to-b from-blue-950/30 to-indigo-950/20 border border-blue-500/20'
                      : 'bg-gradient-to-b from-amber-950/20 to-orange-950/15 border border-amber-500/20'
                }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                    ⭐ Le plus choisi
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-white font-black text-xl mb-1">{plan.nom}</h3>
                  <p className="text-white/40 text-sm mb-4">{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">{plan.prix}</span>
                    <span className="text-white/35 text-sm mb-1">/ mois</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-7">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-white/60">
                      <CheckCircle2 size={15} className="text-purple-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/inscription"
                  className={`w-full text-center py-4 rounded-2xl font-bold text-sm transition-all ${plan.popular
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40'
                    : 'bg-white/8 hover:bg-white/12 text-white'
                  }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PSYCHOLOGUES — Autorité et crédibilité
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-gradient-to-b from-fuchsia-950/10 via-purple-950/15 to-transparent relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-0 w-[500px] h-[400px] bg-purple-700/5 rounded-full blur-[130px]" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-fuchsia-400 text-sm font-semibold uppercase tracking-widest mb-3">L'équipe derrière chaque compatibilité</p>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-5">
              5 psychologues cliniciens musulmans.
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Pas des bots. Des humains.</span>
            </h2>
            <p className="text-white/45 max-w-2xl mx-auto text-base leading-relaxed">
              Ils ont conçu notre questionnaire, calibré notre algorithme et valident chaque compatibilité.
              Ce sont des <strong className="text-white">professionnels de santé mentale diplômés</strong>,
              spécialisés dans la psychologie islamique du couple.
              Leur mission unique : vous présenter uniquement la personne <strong className="text-white">réellement faite pour vous.</strong>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            {[
              { ...psychologues[0], grad: 'from-purple-600 to-violet-700', border: 'hover:border-purple-500/40', badge: 'bg-purple-500/15 text-purple-300' },
              { ...psychologues[1], grad: 'from-fuchsia-600 to-pink-700', border: 'hover:border-fuchsia-500/40', badge: 'bg-fuchsia-500/15 text-fuchsia-300' },
              { ...psychologues[2], grad: 'from-violet-600 to-purple-700', border: 'hover:border-violet-500/40', badge: 'bg-violet-500/15 text-violet-300' },
              { ...psychologues[3], grad: 'from-blue-600 to-indigo-700', border: 'hover:border-blue-500/40', badge: 'bg-blue-500/15 text-blue-300' },
              { ...psychologues[4], grad: 'from-pink-600 to-rose-700', border: 'hover:border-pink-500/40', badge: 'bg-pink-500/15 text-pink-300' },
            ].map((p, i) => (
              <div key={i}
                className={`bg-white/4 border border-white/8 rounded-2xl p-5 text-center ${p.border} hover:bg-white/7 transition-all`}>
                <div className={`w-14 h-14 bg-gradient-to-br ${p.grad} rounded-full flex items-center justify-center text-white font-black text-xl mx-auto mb-3 shadow-lg`}>
                  {p.initial}
                </div>
                <p className="text-white font-semibold text-sm mb-1">{p.nom}</p>
                <p className="text-white/45 text-xs mb-3 leading-snug">{p.spec}</p>
                <span className={`text-xs ${p.badge} px-2.5 py-1 rounded-full`}>{p.annees} d'expérience</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DÉCLARATION DE POSITIONNEMENT — L'identité de la marque
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 relative overflow-hidden">
        {/* Glow derrière la citation */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-fuchsia-700/6 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div>
            <p className="text-purple-400/60 text-sm font-semibold uppercase tracking-widest mb-8">Notre engagement</p>
            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-10">
              "Le mariage est une décision sacrée.
              <br />
              <span className="bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Elle mérite mieux qu'un algorithme.</span>
              <br />
              Elle mérite la science et la foi."
            </blockquote>
            <p className="text-white/45 text-base max-w-2xl mx-auto leading-relaxed">
              Pendant que les autres plateformes vous donnent accès à des milliers de profils sans filtre,
              nous faisons le travail en amont. Nos psychologues cliniciens et notre IA analysent,
              filtrent et valident pour vous ne présenter <strong className="text-white/80">que la certitude</strong>.
              Pas des possibilités. Des compatibilités prouvées.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          L'IA — Au cœur de l'expérience
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-gradient-to-b from-purple-950/15 via-fuchsia-950/8 to-transparent relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-violet-600/6 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-4">Notre technologie</p>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                L'IA qui analyse
                <br />
                <span className="text-purple-400">ce que vous ne dites pas.</span>
              </h2>
              <p className="text-white/55 text-base leading-relaxed mb-8">
                Notre algorithme ne se contente pas de comparer des réponses. Il analyse{' '}
                <strong className="text-white">7 dimensions simultanées</strong> : attachement émotionnel,
                compatibilité spirituelle, dynamique de communication, projet de vie commun,
                valeurs familiales, gestion des conflits, style d'amour.
                <br /><br />
                Résultat : vous ne recevez jamais un profil en dessous de 85% de compatibilité.
                <strong className="text-white"> Jamais.</strong>
              </p>
              <div className="space-y-3">
                {[
                  '7 dimensions analysées simultanément',
                  'Score de compatibilité détaillé et expliqué',
                  'Validation humaine par un psychologue clinicien',
                  'Apprentissage continu sur les couples formés',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white/65">
                    <CheckCircle2 size={15} className="text-purple-400 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Visualisation IA */}
            <div
              className="bg-gradient-to-br from-purple-950/40 to-fuchsia-950/30 border border-purple-500/20 rounded-3xl p-8 shadow-xl shadow-purple-900/20">
              <p className="text-fuchsia-300 text-xs font-bold uppercase tracking-widest mb-6">Analyse en cours — profil anonymisé</p>
              {[
                { label: 'Compatibilité spirituelle', score: 94, bar: 'from-purple-500 to-violet-400' },
                { label: 'Projet de vie commun', score: 91, bar: 'from-fuchsia-500 to-pink-400' },
                { label: 'Communication & valeurs', score: 88, bar: 'from-purple-500 to-fuchsia-400' },
                { label: 'Vision familiale', score: 87, bar: 'from-violet-500 to-purple-400' },
                { label: 'Attachement émotionnel', score: 85, bar: 'from-fuchsia-600 to-pink-400' },
              ].map((dim, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between text-xs text-white/60 mb-1.5">
                    <span>{dim.label}</span>
                    <span className="text-fuchsia-300 font-bold">{dim.score}%</span>
                  </div>
                  <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div style={{ width: `${dim.score}%` }}
                      className={`h-full bg-gradient-to-r ${dim.bar} rounded-full`} />
                  </div>
                </div>
              ))}
              <div className="mt-6 pt-5 border-t border-purple-500/15 flex items-center justify-between">
                <span className="text-white/40 text-xs">Score global validé</span>
                <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">89%</span>
              </div>
              <p className="text-fuchsia-400/40 text-xs mt-2">✓ Validé par Dr. Salma R. — Psychologue clinicienne</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LE PROCESSUS — Le vrai parcours complet
      ═══════════════════════════════════════════════════════════ */}
      <section id="le-processus" className="py-28 px-6 bg-gradient-to-b from-transparent to-purple-950/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Le processus complet</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              De l'inscription au mariage.
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Chaque étape a un sens.</span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">Un parcours pensé pour protéger votre démarche, respecter vos valeurs et maximiser vos chances d'une vraie rencontre.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                num: '01',
                emoji: '📝',
                titre: 'Inscription & questionnaire',
                desc: 'Vous créez votre profil gratuitement en 2 minutes, puis répondez à 40 questions profondes conçues par nos psychologues cliniciens. Valeurs islamiques, projet de vie, caractère, vision du couple. Ce questionnaire est le cœur de tout — il permet à notre IA de vous connaître vraiment.',
                tag: 'Gratuit',
                tagColor: 'text-green-400 bg-green-500/15',
                borderLeft: 'border-l-4 border-l-green-500/60',
              },
              {
                num: '02',
                emoji: '🤖',
                titre: "L'IA analyse et nos psychologues valident",
                desc: 'Notre algorithme analyse 7 dimensions de compatibilité et croise des centaines de profils. Un psychologue clinicien examine ensuite chaque résultat. Seules les compatibilités à +85% sont retenues. Les autres sont rejetées automatiquement. Vous ne voyez jamais un profil en dessous de ce seuil.',
                tag: 'Science + humain',
                tagColor: 'text-purple-300 bg-purple-500/15',
                borderLeft: 'border-l-4 border-l-purple-500/60',
              },
              {
                num: '03',
                emoji: '💜',
                titre: 'Vous recevez votre compatibilité — score ET photo',
                desc: 'Vous recevez le score détaillé, l\'analyse complète et la photo du profil. Les valeurs, la foi, le projet de vie — et l\'attirance physique. Les deux comptent. Si la compatibilité vous correspond et que la personne vous plaît, vous acceptez. L\'autre membre fait de même de son côté.',
                tag: 'Score + photo',
                tagColor: 'text-fuchsia-300 bg-fuchsia-500/15',
                borderLeft: 'border-l-4 border-l-fuchsia-500/60',
              },
              {
                num: '04',
                emoji: '💬',
                titre: 'Chat supervisé — si les deux acceptent',
                desc: 'Si les deux parties acceptent après avoir vu le profil complet, un chat supervisé s\'ouvre. Les échanges sont encadrés et bienveillants. Aucun numéro, aucun réseau social. L\'objectif est simple : vérifier qu\'il y a une vraie alchimie par les mots, avant d\'aller plus loin.',
                tag: '100% supervisé',
                tagColor: 'text-blue-300 bg-blue-500/15',
                borderLeft: 'border-l-4 border-l-blue-500/60',
              },
              {
                num: '05',
                emoji: '🤝',
                titre: 'Mouqabala virtuelle — si l\'alchimie est confirmée',
                desc: 'Si le chat confirme une compatibilité réelle, une mouqabala (entretien virtuel) est organisée sur notre plateforme. Elle peut se faire avec ou sans la famille, selon les préférences. C\'est l\'étape finale avant de décider d\'aller vers le mariage. Tout reste dans un cadre islamique respectueux.',
                tag: 'Cadre islamique',
                tagColor: 'text-amber-300 bg-amber-500/15',
                borderLeft: 'border-l-4 border-l-amber-500/60',
              },
            ].map((step, i) => (
              <div key={i}
                className={`flex gap-5 bg-white/4 border border-white/8 ${step.borderLeft} rounded-2xl p-6 hover:bg-white/6 transition-all`}>
                <div className="flex-shrink-0 font-black text-2xl text-white/15 w-10 pt-1">{step.num}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="text-xl">{step.emoji}</span>
                    <h3 className="text-white font-bold">{step.titre}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${step.tagColor}`}>{step.tag}</span>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-white/30 text-xs mt-8">
            Étapes 1 & 2 gratuites — abonnement requis pour recevoir vos compatibilités validées
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DIFFÉRENCIATION — Vs concurrents
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Comparaison</p>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Pourquoi pas les autres.
            </h2>
            <p className="text-white/45 max-w-xl mx-auto">
              Sur les autres plateformes, vous cherchez seul(e) dans une masse. Ici, nous cherchons pour vous avec la rigueur de la science et la bienveillance de la foi islamique.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-purple-500/20">
            <div className="min-w-[520px]">
              <div className="grid grid-cols-3 bg-gradient-to-r from-purple-950/40 via-fuchsia-950/20 to-purple-950/40 px-4 py-4 text-xs font-bold uppercase tracking-wider border-b border-purple-500/20">
                <div className="text-white/40">Critère</div>
                <div className="text-center text-white/30">Les autres</div>
                <div className="text-center text-fuchsia-300">Nous</div>
              </div>
              {[
                ['Psychologues cliniciens', '✗ Aucun', '✓ 5 spécialistes'],
                ['Seuil de compatibilité garanti', '✗ Aucun seuil', '✓ Minimum +85%'],
                ['Analyse scientifique', '✗ Filtres basiques', '✓ 7 dimensions IA'],
                ['Cadre islamique intégré', '✗ Inexistant', '✓ À chaque étape'],
                ['Supervision des échanges', '✗ Aucune', '✓ Temps réel'],
                ['Vérification manuelle des profils', '✗ Automatique', '✓ Systématique'],
                ['Valeurs avant apparence', '✗ Photo en premier', '✓ Score en premier'],
                ['Objectif clair', '✗ Rencontres', '✓ Mariage uniquement'],
              ].map(([crit, eux, nous], i) => (
                <div key={i} className={`grid grid-cols-3 px-4 py-4 text-sm border-t border-white/5 ${i % 2 === 0 ? 'bg-purple-950/10' : 'bg-white/[0.01]'}`}>
                  <div className="text-white/60 font-medium text-xs">{crit}</div>
                  <div className="text-center text-red-400/50 text-xs">{eux}</div>
                  <div className="text-center text-fuchsia-300 font-semibold text-xs">{nous}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TÉMOIGNAGES — Preuve sociale émotionnelle
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-gradient-to-b from-transparent to-purple-950/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Ils témoignent</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">312 couples. Des histoires vraies.</h2>
            <p className="text-white/40">Pas des témoignages inventés. Des vies réelles, construites ici.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                texte: "En 3 semaines, j'avais une compatibilité à 89%. Ce n'est pas une coïncidence — c'est de la science appliquée. On partage les mêmes valeurs, la même foi, le même projet de vie. Mariés depuis 6 mois. Alhamdulillah.",
                nom: 'Fatima',
                ville: 'Lyon',
                score: '89%',
                detail: 'Mariée depuis 6 mois',
                topGrad: 'from-purple-600/30 to-transparent',
                starColor: 'fill-purple-400 text-purple-400',
                avatarGrad: 'from-purple-600 to-violet-700',
                scoreColor: 'bg-purple-500/15 text-purple-300',
                border: 'border-purple-500/20',
              },
              {
                texte: "Savoir qu'un psychologue clinicien a validé notre compatibilité avant même qu'on se parle — ça change tout. Pas de doute, pas d'hésitation. Une base solide avant le premier mot. Je n'aurais pas trouvé ailleurs.",
                nom: 'Youssef',
                ville: 'Paris',
                score: '91%',
                detail: 'Marié depuis 4 mois',
                topGrad: 'from-fuchsia-600/30 to-transparent',
                starColor: 'fill-fuchsia-400 text-fuchsia-400',
                avatarGrad: 'from-fuchsia-600 to-pink-700',
                scoreColor: 'bg-fuchsia-500/15 text-fuchsia-300',
                border: 'border-fuchsia-500/20',
              },
              {
                texte: "Mon score était 92%. Et c'est exactement ce que je vis au quotidien. Aucune surprise, aucune déception. Juste quelqu'un qui me correspond dans la foi, le caractère et les valeurs. Exactement ce que j'avais demandé à Allah.",
                nom: 'Nadia',
                ville: 'Marseille',
                score: '92%',
                detail: 'Mariée depuis 8 mois',
                topGrad: 'from-pink-600/30 to-transparent',
                starColor: 'fill-pink-400 text-pink-400',
                avatarGrad: 'from-pink-600 to-rose-700',
                scoreColor: 'bg-pink-500/15 text-pink-300',
                border: 'border-pink-500/20',
              },
            ].map((t, i) => (
              <div key={i}
                className={`relative bg-white/4 border ${t.border} rounded-3xl p-7 hover:bg-white/6 transition-all flex flex-col overflow-hidden`}>
                {/* Top gradient strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.topGrad}`} />
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, j) => <Star key={j} size={13} className={t.starColor} />)}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6 italic flex-1">"{t.texte}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/8">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 bg-gradient-to-br ${t.avatarGrad} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                      {t.nom[0]}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.nom} · {t.ville}</p>
                      <p className="text-white/30 text-xs">{t.detail}</p>
                    </div>
                  </div>
                  <span className={`text-xs ${t.scoreColor} px-3 py-1.5 rounded-full font-black`}>{t.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-violet-950/8 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">Vos questions.</h2>
            <p className="text-white/40">Nous répondons à tout. Franchement.</p>
          </div>
          <div className="space-y-3">
            {[
              {
                q: 'Quel est l\'objectif de Mariés au Second Regard ?',
                a: 'Mariés au Second Regard a pour mission de faciliter les rencontres entre célibataires musulmans désireux de trouver un partenaire compatible pour un mariage respectueux des principes et préceptes de l\'Islam.',
              },
              {
                q: 'Comment fonctionne le processus de recherche de partenaires ?',
                a: 'Vous remplissez un questionnaire avec vos critères de recherche, puis notre équipe utilise une intelligence artificielle sophistiquée pour vous proposer des profils compatibles. Dans un premier temps, nous vous proposerons d\'échanger avec le ou les profils (selon l\'abonnement choisi) par chat sur notre site. Si des affinités se développent, vous pourrez organiser une première rencontre — la "mouquabala" — par vidéoconférence en présence d\'un imam qualifié.',
              },
              {
                q: 'Comment puis-je m\'inscrire sur Mariés au Second Regard ?',
                a: 'Vous pouvez vous inscrire sur notre site web en remplissant un formulaire et en choisissant l\'abonnement qui vous convient. Une fois inscrit et l\'abonnement choisi, vous pourrez participer au processus de sélection.',
              },
              {
                q: 'Qu\'est-ce qu\'une mouquabala ?',
                a: 'Une mouquabala, terme arabe, se traduit par une rencontre ou un entretien. C\'est une étape lors de laquelle un homme et une femme qui envisagent un mariage se rencontrent pour se connaître, échanger et évaluer leur compatibilité. Elle ne constitue pas une demande de mariage formelle, mais une opportunité pour les deux personnes de décider si elles souhaitent poursuivre leur relation vers le mariage.',
              },
              {
                q: 'Qui compose l\'équipe de Mariés au Second Regard ?',
                a: 'Notre équipe comprend des psychologues cliniciens musulmans, des experts en thérapie conjugale, et des imams qui jouent un rôle crucial dans le soutien spirituel et religieux des participants. Ils peuvent également agir comme médiateurs pour les couples déjà formés. Des administrateurs sont aussi disponibles pour répondre à vos questions et superviser les discussions en ligne.',
              },
              {
                q: 'Quels sont les tests utilisés pour évaluer la compatibilité ?',
                a: 'Nous utilisons des tests de compatibilité composés de plusieurs questions pour évaluer les objectifs à long terme des célibataires. Un deuxième questionnaire de psychologie affective est également utilisé pour comprendre les besoins émotionnels spécifiques de chaque candidat.',
              },
              {
                q: 'Comment fonctionne le chat supervisé ?',
                a: 'Les participants communiquent via le chat du site, supervisé par un membre de notre équipe pour garantir des échanges sérieux et conformes aux principes de l\'Islam. Les données personnelles (numéros de téléphone, réseaux sociaux, photos) sont strictement interdites d\'échange entre membres.',
              },
              {
                q: 'Quels sont les abonnements disponibles ?',
                a: 'Nous proposons trois abonnements : ESSENTIEL (19,99€), PREMIUM (29,99€) et ÉLITE (49,99€). Chaque formule offre des avantages différents en termes de nombre de profils proposés et de niveau de suivi personnalisé.',
              },
              {
                q: 'Qui peut s\'inscrire sur Mariés au Second Regard ?',
                a: 'Tous les célibataires musulmans de plus de 18 ans avec un engagement sérieux et sincère peuvent s\'inscrire. Pour les femmes divorcées, le respect de la période d\'attente après le divorce est requis. La polygamie est interdite sur notre site. Nous respectons les lois françaises et n\'acceptons que les personnes en situation régulière.',
              },
              {
                q: 'Comment contacter l\'équipe de Mariés au Second Regard ?',
                a: 'Vous pouvez nous contacter via le formulaire de contact sur notre site ou par e-mail à mariesausecondregard@gmail.com. Notre équipe vous répondra dans les plus brefs délais.',
              },
              {
                q: 'Comment organiser une mouquabala ?',
                a: 'Si des affinités se développent avec un candidat(e) proposé(e), cliquez sur l\'icône "mouquabala" dans votre profil. Notre équipe vous guidera tout au long du processus pour organiser un entretien virtuel en présence d\'un imam qualifié.',
              },
              {
                q: 'Quelle est la garantie de réussite de Mariés au Second Regard ?',
                a: 'Bien que nous investissions tous nos efforts pour assister nos utilisateurs dans leur recherche de partenaire compatible, nous ne pouvons garantir le résultat final sous forme de mariage. Notre approche méthodique et hautement structurée est néanmoins spécifiquement conçue pour optimiser les probabilités de succès dans cette quête.',
              },
            ].map((faq, i) => (
              <div key={i}>
                <FAQItem q={faq.q} a={faq.a} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          VIDÉO — Projection émotionnelle
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Ils ne cherchaient plus.
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Nous avions trouvé pour eux.</span>
            </h2>
            <p className="text-white/40 text-base max-w-lg mx-auto">
              312 couples. Des histoires vraies. Des vies construites sur des bases solides.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Vidéo — gauche */}
            <div
              className="relative rounded-3xl overflow-hidden border border-purple-500/20 shadow-2xl shadow-fuchsia-500/10">
              <img
                src="https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&q=75"
                alt="Couple heureux"
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover"
                style={{ aspectRatio: '4/3' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060412]/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
                <p className="text-white/80 text-sm font-semibold">312 mariages formés — alhamdulillah</p>
              </div>
            </div>

            {/* Texte — droite */}
            <div
              className="flex flex-col gap-8">
              <div>
                <p className="text-fuchsia-400 text-sm font-semibold uppercase tracking-widest mb-4">Ce que les autres ne font pas</p>
                <h3 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                  Ici, on ne vous donne pas accès à des profils.
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">On vous présente votre compatibilité.</span>
                </h3>
                <p className="text-white/50 text-base leading-relaxed">
                  Pas de scroll infini. Pas de déception répétée. Nos psychologues analysent, notre IA valide, et vous recevez uniquement des profils prouvés à +85% compatibles avec vous.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { icon: '🧠', titre: 'Analyse sur 7 dimensions', texte: 'Valeurs, foi, caractère, vision du couple, style de vie, projet familial, communication.' },
                  { icon: '🩺', titre: 'Validé par un psychologue', texte: 'Chaque compatibilité est confirmée par un clinicien avant de vous être envoyée.' },
                  { icon: '🔒', titre: 'Cadre islamique garanti', texte: 'Zéro contact direct. Chat supervisé. Mouqabala encadrée. Votre honneur est protégé.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600/30 to-fuchsia-600/20 border border-purple-500/20 flex items-center justify-center text-lg flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm mb-1">{item.titre}</p>
                      <p className="text-white/40 text-sm leading-relaxed">{item.texte}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/inscription"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-8 py-4 rounded-full font-black text-base hover:scale-105 transition-all shadow-lg shadow-fuchsia-500/20 w-fit">
                Commencer gratuitement
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA FINAL — Urgence, responsabilité, destin
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-36 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950/25 via-fuchsia-950/20 to-purple-950/25" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-r from-purple-600/10 via-fuchsia-600/10 to-pink-600/10 rounded-full blur-[100px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">

          <p className="text-purple-400/60 text-sm font-semibold uppercase tracking-widest mb-8">La décision vous appartient</p>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.05]">
            Votre futur(e) conjoint(e)
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">est déjà là.</span>
          </h2>

          <p className="text-white/50 text-lg mb-4 max-w-xl mx-auto leading-relaxed">
            En ce moment, il ou elle complète son profil. Nos algorithmes analysent.
            Nos psychologues valident. Votre compatibilité existe déjà.
          </p>

          <p className="text-white/30 text-sm italic mb-12">
            La seule question est : allez-vous vous donner les moyens de le découvrir ?
          </p>

          <Link href="/inscription"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-pink-500 text-white px-12 py-6 rounded-full text-xl font-black transition-all shadow-2xl shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:scale-105">
            Je commence maintenant — gratuitement
            <ArrowRight size={22} />
          </Link>

          <p className="text-white/25 text-xs mt-6">Aucune carte bancaire · 2 minutes · 100% halal & supervisé</p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-purple-500/15 py-10 px-6 bg-gradient-to-r from-purple-950/20 via-fuchsia-950/10 to-purple-950/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-purple-300/60 text-sm font-bold">Mariés au Second Regard</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/25">
            <Link href="/tarifs" className="hover:text-white/50 transition-colors">Tarifs</Link>
            <Link href="/faq" className="hover:text-white/50 transition-colors">FAQ</Link>
            <Link href="/connexion" className="hover:text-white/50 transition-colors">Connexion</Link>
            <Link href="/mentions-legales" className="hover:text-white/50 transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-white/50 transition-colors">Confidentialité</Link>
            <Link href="/cgu" className="hover:text-white/50 transition-colors">CGU</Link>
          </div>
          <p className="text-white/20 text-xs">© 2026 Mariés au Second Regard. Mariage islamique sérieux en France.</p>
        </div>
      </footer>
    </main>
  )
}
