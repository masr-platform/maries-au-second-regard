import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Règles de la Communauté — Mariés au Second Regard',
}

export default function ReglesPage() {
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
            Communauté
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Règles de la Communauté</h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
            Nous avons une mission : créer des connexions sérieuses, halal et durables.
            Ces règles protègent chaque membre de notre communauté.
          </p>
        </div>

        <div className="space-y-8 text-white/75 leading-relaxed">

          {/* Engagements */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-5">Vos engagements en rejoignant MASR</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '🤝', titre: 'Respect', desc: 'Traiter chaque membre avec dignité, bienveillance et respect, indépendamment de son profil.' },
                { icon: '✊', titre: 'Sérieux', desc: 'Adopter une démarche sincère et sérieuse dans votre recherche de mariage.' },
                { icon: '🛡️', titre: 'Intégrité', desc: 'Ne jamais tenter de contourner ou d\'utiliser la Plateforme à des fins autres que le mariage.' },
              ].map((e) => (
                <div key={e.titre} className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="text-2xl mb-3">{e.icon}</div>
                  <div className="text-white font-semibold mb-2">{e.titre}</div>
                  <div className="text-white/55 text-sm">{e.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Règles absolues */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Règles absolues</h2>
            <div className="space-y-3">
              {[
                { regle: 'Interdiction formelle d\'échange de coordonnées personnelles', detail: 'Numéro de téléphone, email personnel, réseaux sociaux, adresse — tout échange de ce type est strictement interdit.' },
                { regle: 'Interdiction de contourner la Plateforme', detail: 'Toute tentative de contact en dehors du cadre sécurisé de MASR est interdite et entraîne un bannissement immédiat.' },
                { regle: 'Polygamie interdite', detail: 'Conformément aux lois françaises, la polygamie est strictement interdite sur notre Plateforme. Tout utilisateur en situation de polygamie ne peut pas s\'inscrire.' },
                { regle: 'Authenticité obligatoire', detail: 'Les faux profils, usurpations d\'identité et photos non personnelles entraînent un bannissement immédiat.' },
                { regle: 'Tolérance zéro pour le harcèlement', detail: 'Tout comportement harcelant, irrespectueux ou contraire aux valeurs islamiques sera sanctionné sans préavis.' },
              ].map((r, i) => (
                <div key={i} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                  <div className="flex items-start gap-3">
                    <div className="text-red-400 mt-0.5 shrink-0">✕</div>
                    <div>
                      <div className="text-white font-medium mb-1">{r.regle}</div>
                      <div className="text-white/55 text-sm">{r.detail}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conséquences */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Conséquences en cas de violation</h2>
            <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                <span><strong className="text-white">Avertissement</strong> — pour les infractions mineures et premières occurrences.</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                <span><strong className="text-white">Suspension temporaire</strong> — accès restreint pendant une durée déterminée.</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <span><strong className="text-white">Bannissement définitif</strong> — sans remboursement, pour les infractions graves ou répétées.</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-white/50">
              La Plateforme se réserve le droit d&apos;agir <strong className="text-white/70">sans préavis</strong> pour protéger ses membres.
            </p>
          </div>

          {/* Modération */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Modération et signalement</h2>
            <p>
              Les échanges peuvent être surveillés par notre équipe de modération pour garantir le respect de ces règles.
              Si vous êtes témoin d&apos;un comportement inapproprié, vous pouvez le signaler directement depuis l&apos;interface de messagerie.
              Chaque signalement est traité avec sérieux et confidentialité.
            </p>
          </div>

          {/* Contact */}
          <div className="pt-8 border-t border-white/10">
            <p className="text-sm text-white/40">
              Questions sur les règles :{' '}
              <a href="mailto:mariesausecondregard@gmail.com" className="text-[#D4A853] hover:underline">
                mariesausecondregard@gmail.com
              </a>
            </p>
          </div>
        </div>

        <LegalNav current="regles" />
      </div>
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
