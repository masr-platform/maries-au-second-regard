import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation — Mariés au Second Regard',
}

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar minimaliste */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full border border-[#D4A853] flex items-center justify-center">
              <span className="text-[#D4A853] text-xs font-bold">M</span>
            </div>
            <span className="text-white text-sm font-semibold tracking-widest uppercase">MASR</span>
          </Link>
          <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">
            ← Retour
          </Link>
        </div>
      </nav>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="mb-12 pb-8 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/20 text-[#D4A853] text-xs uppercase tracking-widest mb-6">
            Documents légaux
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Conditions Générales d&apos;Utilisation</h1>
          <p className="text-white/40 text-sm">Dernière mise à jour : mars 2026</p>
        </div>

        <div className="space-y-10 text-white/75 leading-relaxed">

          <Section numero="1" titre="Objet">
            <p>
              La plateforme <strong className="text-white">Mariés au Second Regard</strong> (ci-après « la Plateforme ») met en relation des utilisateurs dans une démarche de mariage sérieuse, avec un système de compatibilité basé sur l&apos;intelligence artificielle, dans le respect des préceptes de l&apos;Islam.
            </p>
          </Section>

          <Section numero="2" titre="Inscription">
            <ul className="list-disc pl-5 space-y-2">
              <li>L&apos;inscription est <strong className="text-white">réservée aux personnes majeures</strong> (18 ans et plus).</li>
              <li>Les informations fournies lors de l&apos;inscription doivent être <strong className="text-white">exactes, complètes et sincères</strong>.</li>
              <li>Tout profil contenant de fausses informations pourra être suspendu ou supprimé sans préavis.</li>
            </ul>
          </Section>

          <Section numero="3" titre="Fonctionnement">
            <ul className="list-disc pl-5 space-y-2">
              <li>Le matching est réalisé grâce à un <strong className="text-white">algorithme d&apos;intelligence artificielle</strong> analysant 7 dimensions de compatibilité.</li>
              <li>La messagerie interne est supervisée et encadrée pour garantir le respect des valeurs de la Plateforme.</li>
              <li>Une mise en relation encadrée (mouquabala) peut être organisée par la Plateforme entre utilisateurs compatibles.</li>
            </ul>
          </Section>

          <Section numero="4" titre="Interdictions">
            <p className="mb-3">Il est <strong className="text-white">strictement interdit</strong> de :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Échanger des coordonnées personnelles (numéro de téléphone, réseaux sociaux, adresse email, adresse postale).</li>
              <li>Contourner la Plateforme pour entrer en contact hors de son cadre sécurisé.</li>
              <li>Adopter un comportement irrespectueux, harcelant ou contraire aux valeurs islamiques.</li>
              <li>Créer plusieurs comptes ou usurper l&apos;identité d&apos;un tiers.</li>
            </ul>
            <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              En cas de violation : <strong>suspension immédiate</strong> et <strong>bannissement définitif</strong> du compte, sans remboursement.
            </div>
          </Section>

          <Section numero="5" titre="Responsabilité">
            <p>
              La Plateforme agit comme <strong className="text-white">intermédiaire de mise en relation</strong> et ne garantit pas la réussite des relations ni le comportement des utilisateurs. L&apos;utilisateur reste seul responsable des informations qu&apos;il partage.
            </p>
          </Section>

          <Section numero="6" titre="Modération">
            <p>
              Les échanges réalisés via la messagerie interne peuvent être <strong className="text-white">surveillés par notre équipe</strong> afin de garantir le respect des présentes CGU et la sécurité des membres. Toute modération est effectuée dans le respect de la vie privée.
            </p>
          </Section>

          <Section numero="7" titre="Résiliation du compte">
            <p>
              L&apos;utilisateur peut à tout moment demander la suppression de son compte via l&apos;espace personnel ou en contactant <a href="mailto:mariesausecondregard@gmail.com" className="text-[#D4A853] hover:underline">mariesausecondregard@gmail.com</a>.
            </p>
          </Section>

          <Section numero="8" titre="Acceptation">
            <p>
              Toute inscription sur la Plateforme vaut <strong className="text-white">acceptation pleine et entière</strong> des présentes Conditions Générales d&apos;Utilisation ainsi que de la Politique de Confidentialité et des CGV.
            </p>
          </Section>

          <div className="pt-8 border-t border-white/10">
            <p className="text-sm text-white/40">Contact : <a href="mailto:mariesausecondregard@gmail.com" className="text-[#D4A853] hover:underline">mariesausecondregard@gmail.com</a></p>
          </div>
        </div>

        {/* Navigation légale */}
        <LegalNav current="cgu" />
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
          <Link
            key={p.href}
            href={p.href}
            className={`px-4 py-2 rounded-lg text-sm border transition-all ${
              p.href === `/${current}`
                ? 'bg-[#D4A853]/10 border-[#D4A853]/40 text-[#D4A853]'
                : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
