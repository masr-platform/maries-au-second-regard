export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-[#080611] text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-[#C9A84C] text-sm mb-8 inline-block hover:underline">← Retour</a>
        <h1 className="text-3xl font-serif font-bold mb-10">Mentions légales</h1>
        <div className="space-y-8 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Éditeur du site</h2>
            <p>Le site maries-au-second-regard.vercel.app est édité par Mariés au Second Regard.<br/>Email : <a href="mailto:contact@mariesausecondregard.fr" className="text-[#C9A84C]">contact@mariesausecondregard.fr</a></p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. Hébergement</h2>
            <p>Vercel Inc. — 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Propriété intellectuelle</h2>
            <p>L'ensemble des contenus est la propriété exclusive de Mariés au Second Regard. Toute reproduction sans autorisation écrite est interdite.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Droit applicable</h2>
            <p>Les présentes mentions légales sont soumises au droit français.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
