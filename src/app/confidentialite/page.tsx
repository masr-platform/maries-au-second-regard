import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — Mariés au Second Regard',
}

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full border border-[#D4A853] flex items-center justify-center">
              <span className="text-[#D4A853] text-xs font-bold">M</span>
            </div>
            <span className="text-white text-sm font-semibold tracking-widest uppercase">MASR</span>
          </Link>
          <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">← Retour</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-12 pb-8 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/20 text-[#D4A853] text-xs uppercase tracking-widest mb-6">
            Documents légaux
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Politique de Confidentialité</h1>
          <p className="text-white/40 text-sm">Conforme RGPD — Dernière mise à jour : mars 2026</p>
        </div>

        <div className="space-y-10 text-white/75 leading-relaxed">

          <Section numero="1" titre="Données collectées">
            <p className="mb-3">Dans le cadre de l&apos;utilisation de la Plateforme, nous collectons :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Informations personnelles</strong> : prénom, âge, genre, ville, adresse email.</li>
              <li><strong className="text-white">Réponses au questionnaire</strong> : valeurs, pratique religieuse, projet de vie, personnalité.</li>
              <li><strong className="text-white">Données de navigation</strong> : pages visitées, temps de session (via cookies analytiques).</li>
              <li><strong className="text-white">Échanges sur la Plateforme</strong> : messages internes, signalements.</li>
              <li><strong className="text-white">Données de paiement</strong> : traitées directement par Stripe (non stockées sur nos serveurs).</li>
            </ul>
          </Section>

          <Section numero="2" titre="Finalité du traitement">
            <p className="mb-3">Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Calculer votre <strong className="text-white">Score de Compatibilité Globale</strong> et proposer des matchs pertinents.</li>
              <li>Assurer le bon fonctionnement de la messagerie interne et de la modération.</li>
              <li>Améliorer l&apos;algorithme IA et l&apos;expérience utilisateur.</li>
              <li>Gérer les abonnements et les paiements.</li>
              <li>Vous envoyer des notifications transactionnelles et de suivi.</li>
            </ul>
          </Section>

          <Section numero="3" titre="Base légale">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Consentement</strong> : recueilli lors de l&apos;inscription et matérialisé par l&apos;acceptation des CGU/CGV.</li>
              <li><strong className="text-white">Exécution du contrat</strong> : traitement nécessaire à la fourniture du service.</li>
              <li><strong className="text-white">Intérêt légitime</strong> : amélioration du service, sécurité de la Plateforme.</li>
            </ul>
          </Section>

          <Section numero="4" titre="Conservation des données">
            <p>
              Vos données sont conservées pendant toute la <strong className="text-white">durée d&apos;utilisation active</strong> de votre compte.
              En cas de suppression du compte, vos données personnelles sont effacées dans un délai de <strong className="text-white">30 jours</strong>,
              à l&apos;exception des données nécessaires au respect d&apos;obligations légales (3 ans pour les données de facturation).
            </p>
          </Section>

          <Section numero="5" titre="Partage des données">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-4">
              ✓ Vos données ne sont <strong>jamais vendues</strong> à des tiers. Jamais.
            </div>
            <p className="mb-3">Certaines données peuvent être traitées par nos sous-traitants dans le cadre de l&apos;exécution du service :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Supabase</strong> — base de données sécurisée (hébergement EU disponible).</li>
              <li><strong className="text-white">Stripe</strong> — traitement sécurisé des paiements (PCI-DSS niveau 1).</li>
              <li><strong className="text-white">Vercel</strong> — hébergement de l&apos;application.</li>
              <li><strong className="text-white">Resend</strong> — envoi d&apos;emails transactionnels.</li>
            </ul>
          </Section>

          <Section numero="6" titre="Sécurité">
            <p>
              Des mesures techniques et organisationnelles sont mises en œuvre pour protéger vos données :
              chiffrement TLS en transit, accès restreint aux données, mots de passe hashés (bcrypt),
              monitoring des accès et journalisation des événements sensibles.
            </p>
          </Section>

          <Section numero="7" titre="Vos droits (RGPD)">
            <p className="mb-3">Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { droit: 'Accès', desc: 'Obtenir une copie de vos données personnelles.' },
                { droit: 'Rectification', desc: 'Corriger vos informations inexactes ou incomplètes.' },
                { droit: 'Suppression', desc: 'Demander l\'effacement de vos données ("droit à l\'oubli").' },
                { droit: 'Portabilité', desc: 'Recevoir vos données dans un format lisible.' },
                { droit: 'Opposition', desc: 'Vous opposer à certains traitements.' },
                { droit: 'Limitation', desc: 'Restreindre le traitement dans certaines circonstances.' },
              ].map((r) => (
                <div key={r.droit} className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="text-[#D4A853] text-sm font-medium mb-1">{r.droit}</div>
                  <div className="text-white/60 text-sm">{r.desc}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm">
              Pour exercer ces droits : <a href="mailto:mariesausecondregard@gmail.com" className="text-[#D4A853] hover:underline">mariesausecondregard@gmail.com</a>.
              Vous pouvez également introduire une réclamation auprès de la <strong className="text-white">CNIL</strong> (www.cnil.fr).
            </p>
          </Section>

          <Section numero="8" titre="Cookies">
            <p>
              Le site utilise des cookies techniques <strong className="text-white">nécessaires</strong> au fonctionnement (session, authentification)
              et des cookies analytiques <strong className="text-white">anonymisés</strong> pour améliorer l&apos;expérience.
              Aucun cookie publicitaire n&apos;est déposé.
            </p>
          </Section>

          <div className="pt-8 border-t border-white/10">
            <p className="text-sm text-white/40">Contact DPO : <a href="mailto:mariesausecondregard@gmail.com" className="text-[#D4A853] hover:underline">mariesausecondregard@gmail.com</a></p>
          </div>
        </div>

        <LegalNav current="confidentialite" />
      </div>
    </div>
  )
}

function Section({ numero, titre, children }: { numero: string; titre: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
        <span className="text-[#D4A853] font-mono text-sm">{numero}.</span>
        {titre}
      </h2>
      {children}
    </div>
  )
}

function LegalNav({ current }: { current: string }) {
  const pages = [
    { href: '/cgu', label: 'CGU' },
    { href: '/cgv', label: 'CGV' },
    { href: '/confidentialite', label: 'Confidentialité' },
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/regles', label: 'Règles' },
  ]
  return (
    <nav className="mt-16 pt-8 border-t border-white/10">
      <p className="text-xs uppercase tracking-widest text-white/30 mb-4">Autres documents</p>
      <div className="flex flex-wrap gap-3">
        {pages.map((p) => (
          <Link key={p.href} href={p.href} className={`px-4 py-2 rounded-lg text-sm border transition-all ${p.href === `/${current}` ? 'bg-[#D4A853]/10 border-[#D4A853]/40 text-[#D4A853]' : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'}`}>
            {p.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
