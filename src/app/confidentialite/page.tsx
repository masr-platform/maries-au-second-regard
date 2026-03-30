export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-[#080611] text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-[#C9A84C] text-sm mb-8 inline-block hover:underline">← Retour</a>
        <h1 className="text-3xl font-serif font-bold mb-10">Politique de confidentialité</h1>
        <div className="space-y-8 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Données collectées</h2>
            <p>Nous collectons les données suivantes lors de votre inscription : prénom, genre, date de naissance, adresse email, ville (optionnelle), et les réponses à votre questionnaire de compatibilité.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. Utilisation des données</h2>
            <p>Vos données sont utilisées exclusivement pour :<br/>— Vous proposer des profils compatibles<br/>— Vous envoyer des notifications liées à votre compte<br/>— Traiter vos paiements via Stripe (données bancaires non stockées par nous)<br/>— Améliorer notre service de matching</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Partage des données</h2>
            <p>Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées uniquement avec nos prestataires techniques (Stripe pour les paiements, Resend pour les emails, Supabase pour la base de données) dans le strict cadre de leur mission.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Durée de conservation</h2>
            <p>Vos données sont conservées pendant toute la durée de votre inscription. En cas de suppression de compte, vos données sont effacées sous 30 jours.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Vos droits (RGPD)</h2>
            <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Pour exercer ces droits : <a href="mailto:contact@mariesausecondregard.fr" className="text-[#C9A84C]">contact@mariesausecondregard.fr</a></p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Cookies</h2>
            <p>Le site utilise uniquement des cookies techniques nécessaires au fonctionnement (session d'authentification). Aucun cookie publicitaire ou de tracking n'est utilisé.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
