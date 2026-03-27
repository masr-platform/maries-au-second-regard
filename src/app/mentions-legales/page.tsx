import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions Légales — Mariés au Second Regard',
}

export default function MentionsLegalesPage() {
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
          <h1 className="text-4xl font-bold text-white mb-3">Mentions Légales</h1>
          <p className="text-white/40 text-sm">Conformes à la loi française — mars 2026</p>
        </div>

        <div className="space-y-10 text-white/75 leading-relaxed">

          <Section titre="Éditeur du site">
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
              <InfoRow label="Nom du site" value="Mariés au Second Regard" />
              <InfoRow label="Email" value="mariesausecondregard@gmail.com" href="mailto:mariesausecondregard@gmail.com" />
              <InfoRow label="Responsable de publication" value="Mariés au Second Regard" />
            </div>
          </Section>

          <Section titre="Hébergement">
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
              <InfoRow label="Hébergeur" value="Vercel Inc." />
              <InfoRow label="Adresse" value="440 N Barranca Ave #4133, Covina, CA 91723, États-Unis" />
              <InfoRow label="Site web" value="vercel.com" href="https://vercel.com" />
            </div>
          </Section>

          <Section titre="Responsabilité">
            <p>
              L&apos;éditeur met en œuvre tous les moyens nécessaires pour assurer l&apos;exactitude et la mise à jour des informations
              diffusées sur ce site. Toutefois, il ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations
              mises à disposition. En conséquence, l&apos;éditeur décline toute responsabilité pour toute imprécision, inexactitude ou omission.
            </p>
          </Section>

          <Section titre="Propriété intellectuelle">
            <p>
              Tous les contenus présents sur le site <strong className="text-white">Mariés au Second Regard</strong> — textes, images,
              algorithmes, design, marque, logo — sont protégés par le droit de la propriété intellectuelle et sont la propriété
              exclusive de l&apos;éditeur. Toute reproduction, représentation, modification ou exploitation, même partielle, est
              strictement interdite sans autorisation préalable et écrite.
            </p>
          </Section>

          <Section titre="Droit applicable">
            <p>
              Le présent site et ses mentions légales sont soumis au droit français. En cas de litige, les tribunaux français
              seront seuls compétents.
            </p>
          </Section>

          <Section titre="Contact">
            <p>
              Pour toute question relative aux mentions légales ou au fonctionnement du site :{' '}
              <a href="mailto:mariesausecondregard@gmail.com" className="text-[#D4A853] hover:underline">
                mariesausecondregard@gmail.com
              </a>
            </p>
          </Section>

        </div>

        <LegalNav current="mentions-legales" />
      </div>
    </div>
  )
}

function InfoRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <span className="text-[#D4A853] text-sm w-48 shrink-0">{label}</span>
      {href ? (
        <a href={href} className="text-white hover:text-[#D4A853] transition-colors text-sm">{value}</a>
      ) : (
        <span className="text-white/80 text-sm">{value}</span>
      )}
    </div>
  )
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">{titre}</h2>
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
