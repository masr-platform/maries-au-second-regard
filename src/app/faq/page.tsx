import type { Metadata } from 'next'
import Link from 'next/link'
import FAQClient from './FAQClient'

export const metadata: Metadata = {
  title: 'FAQ — Questions fréquentes | Mariés au Second Regard',
  description: 'Toutes vos questions sur la plateforme de mariage islamique Mariés au Second Regard. Inscription, processus, abonnements, mouqabala, psychologues — nous répondons à tout.',
}

const FAQS = [
  {
    categorie: 'La plateforme',
    questions: [
      {
        q: "Qu'est-ce que Mariés au Second Regard ?",
        a: "Mariés au Second Regard est la première plateforme de mariage islamique sérieux en France combinant intelligence artificielle et psychologues cliniciens musulmans. Nous ne sommes pas une application de rencontres : notre unique objectif est le nikah. Chaque compatibilité est analysée sur 7 dimensions par notre IA, puis validée par un psychologue clinicien avant d'être présentée.",
      },
      {
        q: "Qui peut s'inscrire ?",
        a: "Tous les célibataires musulmans de plus de 18 ans avec un engagement sérieux et sincère envers le mariage islamique. Pour les femmes divorcées, le respect de la période d'attente ('idda) après le divorce est requis. La polygamie est interdite sur notre plateforme. Nous respectons les lois françaises.",
      },
      {
        q: "Qui compose l'équipe de Mariés au Second Regard ?",
        a: "Notre équipe comprend 5 psychologues cliniciens musulmans spécialisés en thérapie conjugale, des experts en intelligence artificielle, et des administrateurs pour superviser les échanges. Chaque psychologue est diplômé d'État et spécialisé dans des domaines complémentaires : thérapie de couple, attachement émotionnel, identité islamique, communication non-violente, et projet de vie selon l'Islam.",
      },
    ],
  },
  {
    categorie: 'Le processus',
    questions: [
      {
        q: "Comment fonctionne le processus de recherche de partenaires ?",
        a: "Le processus se déroule en 5 étapes : (1) Inscription gratuite + questionnaire de 40 questions conçu par nos psychologues. (2) Notre IA analyse 7 dimensions de compatibilité et sélectionne les profils au-dessus de 85%. (3) Un psychologue clinicien valide chaque résultat. (4) Si les deux parties acceptent, un chat supervisé s'ouvre sur la plateforme. (5) Si des affinités sont confirmées, une mouqabala virtuelle est organisée.",
      },
      {
        q: "Qu'est-ce qu'une mouqabala ?",
        a: "Une mouqabala (terme arabe pour 'rencontre encadrée') est un entretien virtuel entre deux personnes envisageant le mariage. Elle se déroule sur notre plateforme, dans un cadre islamique strict, sans échange de coordonnées personnelles. Elle peut se faire avec ou sans la famille selon les préférences. C'est l'étape finale avant de décider d'aller vers le mariage.",
      },
      {
        q: "Comment fonctionne le chat supervisé ?",
        a: "Les participants communiquent via le chat de la plateforme, supervisé par un membre de notre équipe. Les échanges doivent rester sérieux et conformes aux principes islamiques. Les données personnelles (numéros de téléphone, réseaux sociaux, photos personnelles) sont strictement interdites d'échange entre membres. L'objectif est de vérifier l'alchimie par les mots, avant la mouqabala.",
      },
      {
        q: "Comment vous organisez la mouqabala ?",
        a: "Si des affinités se développent lors du chat, accédez à l'icône 'mouqabala' dans votre profil. Notre équipe vous guidera tout au long du processus pour organiser un entretien virtuel dans un cadre islamique respectueux.",
      },
    ],
  },
  {
    categorie: "L'IA et les psychologues",
    questions: [
      {
        q: "Quels sont les tests utilisés pour évaluer la compatibilité ?",
        a: "Notre algorithme analyse 7 dimensions : valeurs islamiques, foi pratiquée, caractère et tempérament, vision du couple, style de vie, projet familial, et mode de communication. Un questionnaire de psychologie affective complémentaire évalue les besoins émotionnels spécifiques de chaque candidat. Seules les compatibilités dépassant 85% sur l'ensemble de ces dimensions sont retenues.",
      },
      {
        q: "Pourquoi un psychologue valide-t-il chaque compatibilité ?",
        a: "L'IA identifie des patterns de compatibilité, mais un regard humain expert reste indispensable. Nos psychologues vérifient que le score reflète une vraie compatibilité de fond (et non une corrélation superficielle), que les deux profils sont sérieux dans leur démarche, et que rien ne contre-indique la mise en relation.",
      },
      {
        q: "Quelle est la garantie de réussite ?",
        a: "Bien que nous investissions tous nos efforts pour maximiser vos chances, nous ne pouvons garantir le mariage — il s'agit d'une décision humaine et spirituelle. Notre approche méthodique (IA + psychologues + cadre islamique) est conçue pour optimiser significativement vos probabilités. Nos 312 mariages formés en témoignent.",
      },
    ],
  },
  {
    categorie: 'Inscription & abonnements',
    questions: [
      {
        q: "L'inscription est-elle gratuite ?",
        a: "Oui, l'inscription et le questionnaire de 40 questions sont entièrement gratuits. Un abonnement est nécessaire uniquement pour recevoir vos compatibilités validées et accéder au chat supervisé.",
      },
      {
        q: "Quels sont les abonnements disponibles ?",
        a: "Nous proposons trois formules : ESSENTIEL (19,90€/mois) — 1 profil compatible par semaine, chat encadré, 1 mouqabala/mois. PREMIUM (29,90€/mois) — 1 profil par jour, chat multi-matchs, 3 mouqabalas/mois, accès prioritaire. ÉLITE (49,90€/mois) — 3 profils par jour, compatibilités illimitées, coach dédié, mouqabalas illimitées.",
      },
      {
        q: "Puis-je changer d'abonnement ou résilier ?",
        a: "Oui, vous pouvez changer de formule ou résilier à tout moment depuis votre espace personnel. L'abonnement reste actif jusqu'à la fin de la période en cours.",
      },
    ],
  },
  {
    categorie: 'Vie privée & sécurité',
    questions: [
      {
        q: "Mes données sont-elles protégées ?",
        a: "Absolument. Vos données sont hébergées en Europe, chiffrées, et ne sont jamais vendues à des tiers. Seule notre équipe de psychologues et d'administrateurs y accède dans le cadre du processus de validation. Conformément au RGPD, vous pouvez demander la suppression complète de votre compte à tout moment.",
      },
      {
        q: "Ma photo est-elle visible par tout le monde ?",
        a: "Non. Votre photo n'est partagée qu'avec les membres avec qui vous avez une compatibilité validée au-dessus de 85%, et uniquement après que les deux parties ont accepté d'aller plus loin. Votre photo n'est jamais affichée publiquement.",
      },
      {
        q: "Comment contacter l'équipe ?",
        a: "Vous pouvez nous écrire à mariesausecondregard@gmail.com. Notre équipe répond sous 24h en jours ouvrés. Pour les abonnés Premium et Élite, un support prioritaire est disponible.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#060412] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-purple-500/10 bg-[#060412]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="MASR" style={{ width: 50, height: 50, objectFit: 'contain' }} />
            <span className="text-base font-black tracking-wider bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent hidden sm:block">
              Mariés au Second Regard
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/tarifs" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block">Tarifs</Link>
            <Link href="/connexion" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block">Connexion</Link>
            <Link href="/inscription" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all">
              Commencer gratuitement →
            </Link>
          </div>
        </div>
      </nav>

      {/* Fond décoratif */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-700/6 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-600/6 rounded-full blur-[140px]" />
      </div>

      {/* Header */}
      <section className="relative z-10 pt-32 pb-16 px-6 text-center">
        <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-4">Questions fréquentes</p>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
          Vos questions.<br />
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">
            Nos réponses.
          </span>
        </h1>
        <p className="text-white/40 text-lg max-w-xl mx-auto">
          Tout ce que vous devez savoir avant de commencer votre démarche.
        </p>
      </section>

      {/* FAQ par catégories */}
      <section className="relative z-10 pb-24 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          {FAQS.map((cat) => (
            <div key={cat.categorie}>
              <h2 className="text-lg font-black text-purple-400 uppercase tracking-widest mb-5 flex items-center gap-3">
                <span className="flex-1 h-px bg-purple-500/20" />
                {cat.categorie}
                <span className="flex-1 h-px bg-purple-500/20" />
              </h2>
              <FAQClient questions={cat.questions} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-6 text-center border-t border-purple-500/10">
        <p className="text-white/40 text-sm mb-3">Vous n'avez pas trouvé votre réponse ?</p>
        <p className="text-white/60 text-base mb-6">
          Écrivez-nous à{' '}
          <a href="mailto:mariesausecondregard@gmail.com" className="text-purple-400 hover:text-purple-300 underline underline-offset-4">
            mariesausecondregard@gmail.com
          </a>
        </p>
        <Link href="/inscription"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white px-10 py-5 rounded-full text-base font-black hover:scale-105 transition-all shadow-2xl shadow-fuchsia-500/20">
          Commencer gratuitement →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-purple-300/60 text-sm font-bold">Mariés au Second Regard</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/25">
            <Link href="/" className="hover:text-white/50 transition-colors">Accueil</Link>
            <Link href="/tarifs" className="hover:text-white/50 transition-colors">Tarifs</Link>
            <Link href="/mentions-legales" className="hover:text-white/50 transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-white/50 transition-colors">Confidentialité</Link>
            <Link href="/cgu" className="hover:text-white/50 transition-colors">CGU</Link>
          </div>
          <p className="text-white/20 text-xs">© 2026 Mariés au Second Regard</p>
        </div>
      </footer>
    </main>
  )
}
