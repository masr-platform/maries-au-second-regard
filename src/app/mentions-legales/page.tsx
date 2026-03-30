export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-[#080611] text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-[#C9A84C] text-sm mb-8 inline-block hover:underline">← Retour</a>
        <h1 className="text-3xl font-serif font-bold mb-10">Mentions légales</h1>
        <div className="space-y-8 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Éditeur du site</h2>
            <p>Le site maries-au-second-regard.vercel.app est édité par :<br/>
            <strong className="text-white">Lamia Belkhodja</strong><br/>
            Directrice de la publication : Lamia Belkhodja<br/>
            Email : <a href="mailto:contact@mariesausecondregard.fr" className="text-[#C9A84C]">contact@mariesausecondregard.fr</a><br/>
            Adresse : disponible sur demande à l'adresse email ci-dessus</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. Hébergement</h2>
            <p>Vercel Inc. — 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br/>
            <a href="https://vercel.com" className="text-[#C9A84C]" target="_blank" rel="noopener noreferrer">vercel.com</a></p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Propriété intellectuelle</h2>
            <p>L'ensemble des contenus présents sur le site (textes, images, graphismes, logo) est la propriété exclusive de Lamia Belkhodja / Mariés au Second Regard. Toute reproduction sans autorisation écrite préalable est interdite et constitue une contrefaçon sanctionnée par le Code de la propriété intellectuelle.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Données personnelles</h2>
            <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits : <a href="mailto:contact@mariesausecondregard.fr" className="text-[#C9A84C]">contact@mariesausecondregard.fr</a></p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Droit applicable</h2>
            <p>Les présentes mentions légales sont soumises au droit français. Tout litige sera soumis aux tribunaux français compétents.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
