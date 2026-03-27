import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente — Mariés au Second Regard',
}

export default function CGVPage() {
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
          <h1 className="text-4xl font-bold text-white mb-3">Conditions Générales de Vente</h1>
          <p className="text-white/40 text-sm">Dernière mise à jour : mars 2026</p>
        </div>

        <div className="space-y-10 text-white/75 leading-relaxed">

          <Section numero="1" titre="Abonnement">
            <p className="mb-4">L&apos;accès à certaines fonctionnalités premium de la Plateforme est soumis à un abonnement payant.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Les abonnements sont <strong className="text-white">à reconduction automatique</strong> selon la périodicité choisie.</li>
              <li>Le paiement est sécurisé via <strong className="text-white">Stripe</strong>, solution conforme PCI-DSS.</li>
              <li>L&apos;utilisateur accepte explicitement le prélèvement automatique lors de la souscription.</li>
            </ul>
          </Section>

          <Section numero="2" titre="Tarifs">
            <div className="grid md:grid-cols-3 gap-4 mt-2">
              {[
                { plan: 'Gratuit', prix: '0 €', desc: 'Accès limité au questionnaire et aux résultats de compatibilité.' },
                { plan: 'Standard', prix: '19 € / mois', desc: 'Messagerie interne, matching IA illimité, profil complet.' },
                { plan: 'Premium', prix: '39 € / mois', desc: 'Tout Standard + accès prioritaire, mouquabala encadrée, suivi personnalisé.' },
              ].map((t) => (
                <div key={t.plan} className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="text-[#D4A853] font-semibold mb-1">{t.plan}</div>
                  <div className="text-white text-xl font-bold mb-2">{t.prix}</div>
                  <div className="text-white/50 text-sm">{t.desc}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section numero="3" titre="Résiliation">
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">Résiliation par l&apos;utilisateur</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Préavis de <strong className="text-white">2 mois</strong> requis avant la date de renouvellement.</li>
                  <li>Demande à effectuer via l&apos;espace personnel ou par email à <a href="mailto:mariesausecondregard@gmail.com" className="text-[#D4A853] hover:underline">mariesausecondregard@gmail.com</a>.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Résiliation automatique</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>L&apos;abonnement prend fin automatiquement lorsqu&apos;une <strong className="text-white">mouquabala</strong> est validée et que les deux parties souhaitent poursuivre.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Résiliation pour faute</h3>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  En cas de violation des CGU (échange de coordonnées, contournement de la Plateforme…) : <strong>bannissement immédiat</strong> et maintien de l&apos;abonnement jusqu&apos;à <strong>3 mois</strong> sans remboursement.
                </div>
              </div>
            </div>
          </Section>

          <Section numero="4" titre="Paiement">
            <ul className="list-disc pl-5 space-y-2">
              <li>Le paiement est traité de manière sécurisée par <strong className="text-white">Stripe</strong> (cryptage TLS, conformité PCI-DSS niveau 1).</li>
              <li>L&apos;utilisateur autorise le prélèvement automatique à chaque période de renouvellement.</li>
              <li>En cas d&apos;échec de paiement, l&apos;accès aux fonctionnalités premium est suspendu.</li>
            </ul>
          </Section>

          <Section numero="5" titre="Remboursements">
            <div className="p-4 rounded-lg bg-white/[0.03] border border-white/10 text-sm space-y-2">
              <p>❌ <strong className="text-white">Aucun remboursement</strong> après souscription à un abonnement.</p>
              <p>❌ <strong className="text-white">Aucun remboursement</strong> en cas de résiliation anticipée.</p>
              <p>❌ <strong className="text-white">Aucun remboursement</strong> en cas de bannissement pour violation des CGU.</p>
            </div>
          </Section>

          <Section numero="6" titre="Litiges">
            <p>
              En cas de litige, une solution amiable sera privilégiée. L&apos;utilisateur peut contacter la Plateforme à{' '}
              <a href="mailto:mariesausecondregard@gmail.com" className="text-[#D4A853] hover:underline">mariesausecondregard@gmail.com</a>.
              En l&apos;absence de résolution amiable, les tribunaux compétents seront ceux du ressort du siège de la Plateforme, selon la loi française.
            </p>
          </Section>

          <div className="pt-8 border-t border-white/10">
            <p className="text-sm text-white/40">Contact : <a href="mailto:mariesausecondregard@gmail.com" className="text-[#D4A853] hover:underline">mariesausecondregard@gmail.com</a></p>
          </div>
        </div>

        <LegalNav current="cgv" />
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
