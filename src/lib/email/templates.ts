// ============================================================
// MASR — Templates d'emails
// Design : fond blanc, accents or (#D4A853), ton humain premium
// Compatible : Gmail, Outlook, Apple Mail, mobile
// ============================================================

const BRAND_COLOR = '#D4A853'
const DARK_COLOR = '#0a0a0a'
const TEXT_COLOR = '#1a1a1a'
const MUTED_COLOR = '#6b7280'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://maries-au-second-regard.vercel.app'

// ─── Layout de base ──────────────────────────────────────────
function baseLayout(content: string, preheader = ''): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mariés au Second Regard</title>
  <!--[if mso]><style>table{border-collapse:collapse;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}&nbsp;‌&nbsp;‌&nbsp;‌</div>` : ''}

  <!-- Email wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f4f5;">
    <tr><td align="center" style="padding:32px 16px;">

      <!-- Card -->
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:${DARK_COLOR};padding:28px 40px;text-align:center;">
            <div style="display:inline-block;width:44px;height:44px;border-radius:50%;border:2px solid ${BRAND_COLOR};line-height:40px;text-align:center;margin-bottom:12px;">
              <span style="color:${BRAND_COLOR};font-size:18px;font-weight:700;">M</span>
            </div>
            <div style="color:#ffffff;font-size:14px;font-weight:600;letter-spacing:3px;text-transform:uppercase;">MARIÉS AU SECOND REGARD</div>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding:40px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:${MUTED_COLOR};">
              Mariés au Second Regard — La rencontre qui commence par le fond.
            </p>
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              <a href="${BASE_URL}/cgu" style="color:#9ca3af;text-decoration:none;">CGU</a> &nbsp;·&nbsp;
              <a href="${BASE_URL}/confidentialite" style="color:#9ca3af;text-decoration:none;">Confidentialité</a> &nbsp;·&nbsp;
              <a href="${BASE_URL}/cgv" style="color:#9ca3af;text-decoration:none;">CGV</a> &nbsp;·&nbsp;
              <a href="mailto:mariesausecondregard@gmail.com" style="color:#9ca3af;text-decoration:none;">Contact</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Bouton CTA ──────────────────────────────────────────────
function ctaButton(text: string, href: string): string {
  return `<div style="text-align:center;margin:32px 0;">
    <a href="${href}" style="display:inline-block;background:${BRAND_COLOR};color:#000000;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.3px;">${text} →</a>
  </div>`
}

// ─── Divider ─────────────────────────────────────────────────
const divider = `<hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;" />`

// ─── Heading ─────────────────────────────────────────────────
function h1(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:${TEXT_COLOR};line-height:1.3;">${text}</h1>`
}
function h2(text: string): string {
  return `<h2 style="margin:0 0 8px;font-size:19px;font-weight:600;color:${TEXT_COLOR};line-height:1.3;">${text}</h2>`
}
function p(text: string, style = ''): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:${MUTED_COLOR};line-height:1.7;${style}">${text}</p>`
}
function gold(text: string): string {
  return `<span style="color:${BRAND_COLOR};font-weight:600;">${text}</span>`
}

// ════════════════════════════════════════════════════════════════
// 1. BIENVENUE (création de compte)
// ════════════════════════════════════════════════════════════════
export function welcomeEmail({ prenom }: { prenom: string }) {
  return {
    subject: `Bienvenue, ${prenom} — votre parcours commence ici 🌙`,
    html: baseLayout(`
      ${h1(`Ahlan wa sahlan, ${prenom} 🌙`)}
      ${p(`Votre compte sur <strong>Mariés au Second Regard</strong> a été créé avec succès. Nous sommes heureux de vous accueillir dans cette communauté pensée pour des rencontres sérieuses, encadrées et halal.`)}
      ${p(`La prochaine étape : remplissez votre questionnaire de compatibilité. Notre IA analyse <strong>7 dimensions</strong> de votre personnalité pour vous proposer des correspondances réellement compatibles.`)}
      ${ctaButton('Compléter mon questionnaire', `${BASE_URL}/questionnaire`)}
      ${divider}
      ${h2('Ce que vous pouvez faire maintenant')}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        ${['Répondre au questionnaire de compatibilité (10 min)', 'Consulter vos premières compatibilités', 'Découvrir comment fonctionne la mouquabala encadrée'].map(item =>
          `<tr><td style="padding:6px 0;font-size:14px;color:${MUTED_COLOR};">
            <span style="color:${BRAND_COLOR};margin-right:8px;">✓</span>${item}
          </td></tr>`
        ).join('')}
      </table>
      ${divider}
      ${p(`Si vous avez des questions, notre équipe est disponible à <a href="mailto:mariesausecondregard@gmail.com" style="color:${BRAND_COLOR};">mariesausecondregard@gmail.com</a>.`)}
      ${p(`Que Allah facilite votre chemin vers le mariage. 🤲`, `font-style:italic;color:#9ca3af;font-size:13px;`)}
    `, `Bienvenue sur MASR — votre parcours vers le mariage commence maintenant.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 2. VÉRIFICATION EMAIL
// ════════════════════════════════════════════════════════════════
export function verifyEmailEmail({ prenom, verifyUrl }: { prenom: string; verifyUrl: string }) {
  return {
    subject: `${prenom}, confirmez votre adresse email`,
    html: baseLayout(`
      ${h1('Confirmez votre email')}
      ${p(`Bonjour ${prenom}, pour finaliser votre inscription et accéder à toutes les fonctionnalités, cliquez sur le bouton ci-dessous.`)}
      ${ctaButton('Confirmer mon adresse email', verifyUrl)}
      ${p(`Ce lien est valable <strong>24 heures</strong>. Après ce délai, vous devrez en demander un nouveau.`, `font-size:13px;color:#9ca3af;`)}
      ${divider}
      ${p(`Si vous n'avez pas créé de compte sur Mariés au Second Regard, ignorez cet email.`, `font-size:13px;color:#9ca3af;`)}
    `, `Cliquez pour confirmer votre adresse email sur MASR.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 3. RÉINITIALISATION MOT DE PASSE
// ════════════════════════════════════════════════════════════════
export function resetPasswordEmail({ prenom, resetUrl }: { prenom: string; resetUrl: string }) {
  return {
    subject: 'Réinitialisation de votre mot de passe',
    html: baseLayout(`
      ${h1('Nouveau mot de passe')}
      ${p(`Bonjour ${prenom}, nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.`)}
      ${ctaButton('Réinitialiser mon mot de passe', resetUrl)}
      ${p(`Ce lien expire dans <strong>1 heure</strong>.`, `font-size:13px;`)}
      ${divider}
      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:16px;">
        <p style="margin:0;font-size:13px;color:#92400e;">Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe reste inchangé.</p>
      </div>
    `, `Demande de réinitialisation de mot de passe MASR.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 4. CHANGEMENT MOT DE PASSE CONFIRMÉ
// ════════════════════════════════════════════════════════════════
export function passwordChangedEmail({ prenom }: { prenom: string }) {
  return {
    subject: 'Votre mot de passe a été modifié',
    html: baseLayout(`
      ${h1('Mot de passe modifié ✓')}
      ${p(`Bonjour ${prenom}, votre mot de passe a bien été mis à jour.`)}
      <div style="background:#d1fae5;border-left:4px solid #10b981;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:16px;">
        <p style="margin:0;font-size:13px;color:#065f46;">Modification effectuée le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.</p>
      </div>
      ${p(`Si vous n'êtes pas à l'origine de cette modification, contactez-nous immédiatement à <a href="mailto:mariesausecondregard@gmail.com" style="color:${BRAND_COLOR};">mariesausecondregard@gmail.com</a>.`)}
      ${ctaButton('Accéder à mon compte', `${BASE_URL}/connexion`)}
    `, `Votre mot de passe MASR a été modifié avec succès.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 5. CONFIRMATION ABONNEMENT
// ════════════════════════════════════════════════════════════════
export function subscriptionConfirmEmail({ prenom, plan, montant, nextBilling }: {
  prenom: string; plan: string; montant: string; nextBilling: string
}) {
  return {
    subject: `Abonnement ${plan} activé — Bienvenue en Premium 🌟`,
    html: baseLayout(`
      ${h1(`Votre abonnement ${gold(plan)} est actif !`)}
      ${p(`Bonjour ${prenom}, merci pour votre confiance. Votre abonnement est maintenant actif et toutes les fonctionnalités premium vous sont accessibles.`)}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:10px;padding:20px;margin-bottom:24px;">
        <tr><td style="padding:6px 0;font-size:14px;"><strong>Plan :</strong> <span style="color:${BRAND_COLOR};">${plan}</span></td></tr>
        <tr><td style="padding:6px 0;font-size:14px;"><strong>Montant :</strong> ${montant} / mois</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;"><strong>Prochain prélèvement :</strong> ${nextBilling}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;"><strong>Paiement sécurisé par :</strong> Stripe</td></tr>
      </table>
      ${ctaButton('Découvrir mes matches', `${BASE_URL}/tableau-de-bord`)}
      ${divider}
      ${p(`Pour gérer votre abonnement ou télécharger vos factures, rendez-vous dans les paramètres de votre compte.`, `font-size:13px;color:#9ca3af;`)}
    `, `Votre abonnement ${plan} MASR est actif.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 6. CONFIRMATION PAIEMENT / FACTURE
// ════════════════════════════════════════════════════════════════
export function paymentConfirmEmail({ prenom, montant, plan, date, invoiceUrl }: {
  prenom: string; montant: string; plan: string; date: string; invoiceUrl?: string
}) {
  return {
    subject: `Reçu de paiement — ${montant} débité`,
    html: baseLayout(`
      ${h1('Paiement confirmé ✓')}
      ${p(`Bonjour ${prenom}, votre paiement a bien été traité.`)}
      <table width="100%" cellpadding="16" cellspacing="0" style="background:#f9f9f9;border-radius:10px;margin-bottom:24px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #e5e7eb;"><td style="font-size:14px;color:#6b7280;">Plan</td><td style="font-size:14px;font-weight:600;color:${TEXT_COLOR};text-align:right;">${plan}</td></tr>
        <tr style="border-bottom:1px solid #e5e7eb;"><td style="font-size:14px;color:#6b7280;">Date</td><td style="font-size:14px;color:${TEXT_COLOR};text-align:right;">${date}</td></tr>
        <tr><td style="font-size:16px;font-weight:700;color:${TEXT_COLOR};">Total</td><td style="font-size:16px;font-weight:700;color:${BRAND_COLOR};text-align:right;">${montant}</td></tr>
      </table>
      ${invoiceUrl ? ctaButton('Télécharger ma facture', invoiceUrl) : ''}
      ${p(`Conservez cet email comme preuve de paiement. En cas de question : <a href="mailto:mariesausecondregard@gmail.com" style="color:${BRAND_COLOR};">mariesausecondregard@gmail.com</a>`, `font-size:13px;color:#9ca3af;`)}
    `, `Paiement de ${montant} confirmé sur MASR.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 7. ÉCHEC DE PAIEMENT
// ════════════════════════════════════════════════════════════════
export function paymentFailedEmail({ prenom }: { prenom: string }) {
  return {
    subject: 'Action requise — Problème avec votre paiement',
    html: baseLayout(`
      ${h1('Paiement non abouti')}
      <div style="background:#fee2e2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0 24px;">
        <p style="margin:0;font-size:14px;color:#991b1b;font-weight:600;">Votre paiement n'a pas pu être traité.</p>
      </div>
      ${p(`Bonjour ${prenom}, nous n'avons pas pu débiter votre moyen de paiement. Votre accès premium sera suspendu dans <strong>48 heures</strong> si aucune action n'est effectuée.`)}
      ${p('Causes possibles : fonds insuffisants, carte expirée, plafond atteint, ou opposition bancaire.')}
      ${ctaButton('Mettre à jour mon moyen de paiement', `${BASE_URL}/tableau-de-bord`)}
      ${divider}
      ${p(`Besoin d'aide ? Contactez-nous à <a href="mailto:mariesausecondregard@gmail.com" style="color:${BRAND_COLOR};">mariesausecondregard@gmail.com</a>`, `font-size:13px;color:#9ca3af;`)}
    `, `Action requise : votre paiement MASR n'a pas abouti.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 8. EXPIRATION DE CARTE
// ════════════════════════════════════════════════════════════════
export function cardExpiringEmail({ prenom, expiryMonth, expiryYear }: {
  prenom: string; expiryMonth: string; expiryYear: string
}) {
  return {
    subject: `Votre carte expire bientôt — Mettez-la à jour`,
    html: baseLayout(`
      ${h1('Votre carte bancaire expire bientôt')}
      ${p(`Bonjour ${prenom}, votre carte de paiement arrive à expiration : <strong>${expiryMonth}/${expiryYear}</strong>.`)}
      ${p('Pour éviter toute interruption de service, mettez à jour votre moyen de paiement dès maintenant.')}
      ${ctaButton('Mettre à jour ma carte', `${BASE_URL}/tableau-de-bord`)}
    `, `Votre carte MASR expire en ${expiryMonth}/${expiryYear} — pensez à la renouveler.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 9. RÉSILIATION ABONNEMENT
// ════════════════════════════════════════════════════════════════
export function subscriptionCancelledEmail({ prenom, endDate }: { prenom: string; endDate: string }) {
  return {
    subject: 'Votre abonnement a été résilié',
    html: baseLayout(`
      ${h1('Résiliation confirmée')}
      ${p(`Bonjour ${prenom}, votre demande de résiliation a bien été prise en compte.`)}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:10px;padding:20px;margin-bottom:24px;">
        <tr><td style="font-size:14px;padding:4px 0;"><strong>Accès premium jusqu'au :</strong> <span style="color:${BRAND_COLOR};">${endDate}</span></td></tr>
      </table>
      ${p(`Vous conservez l'accès à toutes vos fonctionnalités premium jusqu'à cette date.`)}
      ${p(`Nous espérons que MASR vous a aidé dans votre démarche. Si vous souhaitez nous faire part de votre expérience, nous sommes à l'écoute.`)}
      ${ctaButton('Réactiver mon abonnement', `${BASE_URL}/tarifs`)}
    `, `Résiliation de votre abonnement MASR confirmée.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 10. RENOUVELLEMENT AUTOMATIQUE
// ════════════════════════════════════════════════════════════════
export function subscriptionRenewedEmail({ prenom, plan, montant, nextBilling }: {
  prenom: string; plan: string; montant: string; nextBilling: string
}) {
  return {
    subject: `Abonnement renouvelé — ${montant} débité`,
    html: baseLayout(`
      ${h1('Renouvellement automatique ✓')}
      ${p(`Bonjour ${prenom}, votre abonnement <strong>${plan}</strong> a été renouvelé automatiquement.`)}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:10px;padding:20px;margin-bottom:24px;">
        <tr><td style="font-size:14px;padding:4px 0;"><strong>Montant débité :</strong> <span style="color:${BRAND_COLOR};">${montant}</span></td></tr>
        <tr><td style="font-size:14px;padding:4px 0;"><strong>Prochain renouvellement :</strong> ${nextBilling}</td></tr>
      </table>
      ${ctaButton('Accéder à mon espace', `${BASE_URL}/tableau-de-bord`)}
    `, `Votre abonnement MASR ${plan} a été renouvelé.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 11. NOUVEAU MATCH
// ════════════════════════════════════════════════════════════════
export function newMatchEmail({ prenom, matchPrenom, score, ville }: {
  prenom: string; matchPrenom: string; score: number; ville?: string
}) {
  return {
    subject: `✨ Nouvelle compatibilité détectée — Score ${score}%`,
    html: baseLayout(`
      ${h1(`Une nouvelle compatibilité vous attend !`)}
      ${p(`Bonjour ${prenom}, notre IA a détecté une correspondance significative entre votre profil et celui de ${gold(matchPrenom)}${ville ? ` (${ville})` : ''}.`)}
      <div style="background:linear-gradient(135deg,#1a1a1a 0%,#111 100%);border-radius:12px;padding:24px;margin:24px 0;text-align:center;border:1px solid rgba(212,168,83,0.2);">
        <div style="font-size:14px;color:${BRAND_COLOR};font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Score de Compatibilité</div>
        <div style="font-size:56px;font-weight:800;color:#ffffff;line-height:1;">${score}<span style="font-size:32px;color:${BRAND_COLOR};">%</span></div>
        <div style="font-size:13px;color:#9ca3af;margin-top:8px;">${matchPrenom}${ville ? ` · ${ville}` : ''}</div>
      </div>
      ${p('Découvrez ce profil et, si vous le souhaitez, manifestez votre intérêt pour initier une correspondance encadrée.')}
      ${ctaButton('Voir ce profil', `${BASE_URL}/tableau-de-bord`)}
      ${divider}
      ${p(`Rappel : tout échange doit rester dans le cadre sécurisé de la Plateforme.`, `font-size:12px;color:#9ca3af;font-style:italic;`)}
    `, `Score de compatibilité ${score}% détecté avec ${matchPrenom} sur MASR.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 12. NOUVEAU MESSAGE
// ════════════════════════════════════════════════════════════════
export function newMessageEmail({ prenom, expediteur, apercu }: {
  prenom: string; expediteur: string; apercu: string
}) {
  return {
    subject: `💬 Message de ${expediteur}`,
    html: baseLayout(`
      ${h1(`${expediteur} vous a écrit`)}
      ${p(`Bonjour ${prenom}, vous avez reçu un nouveau message sur Mariés au Second Regard.`)}
      <div style="background:#f9f9f9;border-left:4px solid ${BRAND_COLOR};padding:16px 20px;border-radius:0 8px 8px 0;margin:16px 0 24px;">
        <p style="margin:0;font-size:14px;color:#374151;font-style:italic;">"${apercu.length > 120 ? apercu.substring(0, 120) + '…' : apercu}"</p>
        <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">— ${expediteur}</p>
      </div>
      ${ctaButton('Répondre', `${BASE_URL}/messages`)}
      ${p(`Pour votre sécurité, répondez uniquement depuis la messagerie interne de la Plateforme.`, `font-size:12px;color:#9ca3af;`)}
    `, `Nouveau message de ${expediteur} sur MASR.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 13. RELANCE INACTIVITÉ
// ════════════════════════════════════════════════════════════════
export function inactivityEmail({ prenom, joursInactif }: { prenom: string; joursInactif: number }) {
  return {
    subject: `${prenom}, votre espace vous attend 🌙`,
    html: baseLayout(`
      ${h1(`Vous nous manquez, ${prenom}`)}
      ${p(`Cela fait ${joursInactif} jours que vous n'avez pas visité votre espace. Pendant ce temps, notre algorithme a peut-être trouvé de nouvelles compatibilités pour vous.`)}
      ${p(`Le mariage est un chemin qui demande du temps et de la constance. Chaque connexion sérieuse commence par un premier regard — et ce regard, c'est maintenant.`)}
      ${ctaButton('Voir mes nouvelles compatibilités', `${BASE_URL}/tableau-de-bord`)}
      ${divider}
      ${p(`Si vous souhaitez suspendre votre compte ou avez des questions, contactez-nous.`, `font-size:12px;color:#9ca3af;`)}
    `, `Des nouvelles compatibilités vous attendent sur MASR.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 14. RÉSUMÉ HEBDOMADAIRE
// ════════════════════════════════════════════════════════════════
export function weeklyDigestEmail({ prenom, nouveauxMatches, messages, vues }: {
  prenom: string; nouveauxMatches: number; messages: number; vues: number
}) {
  return {
    subject: `Votre semaine sur MASR — ${nouveauxMatches} nouveau${nouveauxMatches > 1 ? 'x' : ''} match${nouveauxMatches > 1 ? 's' : ''}`,
    html: baseLayout(`
      ${h1(`Votre résumé de la semaine`)}
      ${p(`Bonjour ${prenom}, voici ce qui s'est passé sur votre espace cette semaine :`)}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          ${[
            { chiffre: nouveauxMatches, label: 'Nouveau' + (nouveauxMatches > 1 ? 'x' : '') + ' match' + (nouveauxMatches > 1 ? 's' : '') },
            { chiffre: messages, label: 'Message' + (messages > 1 ? 's' : '') + ' reçu' + (messages > 1 ? 's' : '') },
            { chiffre: vues, label: 'Vue' + (vues > 1 ? 's' : '') + ' de profil' },
          ].map(stat => `
            <td style="text-align:center;padding:0 8px;">
              <div style="background:#f9f9f9;border-radius:12px;padding:16px;">
                <div style="font-size:28px;font-weight:800;color:${BRAND_COLOR};">${stat.chiffre}</div>
                <div style="font-size:12px;color:#6b7280;margin-top:4px;">${stat.label}</div>
              </div>
            </td>`).join('')}
        </tr>
      </table>
      ${ctaButton('Consulter mon espace', `${BASE_URL}/tableau-de-bord`)}
    `, `Votre résumé hebdomadaire MASR — ${nouveauxMatches} match${nouveauxMatches > 1 ? 's' : ''} cette semaine.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 15. CONNEXION SUSPECTE
// ════════════════════════════════════════════════════════════════
export function suspiciousLoginEmail({ prenom, ip, location, device, date }: {
  prenom: string; ip: string; location: string; device: string; date: string
}) {
  return {
    subject: '⚠️ Connexion depuis un nouvel appareil',
    html: baseLayout(`
      ${h1('Nouvelle connexion détectée')}
      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0 24px;">
        <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">Une connexion a été détectée depuis un appareil non reconnu.</p>
      </div>
      ${p(`Bonjour ${prenom}, voici les détails de cette connexion :`)}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:10px;padding:20px;margin-bottom:24px;">
        <tr><td style="font-size:14px;padding:4px 0;"><strong>Date :</strong> ${date}</td></tr>
        <tr><td style="font-size:14px;padding:4px 0;"><strong>Appareil :</strong> ${device}</td></tr>
        <tr><td style="font-size:14px;padding:4px 0;"><strong>Localisation :</strong> ${location}</td></tr>
        <tr><td style="font-size:14px;padding:4px 0;"><strong>IP :</strong> ${ip}</td></tr>
      </table>
      ${p(`Si c'était vous, ignorez cet email. Sinon, changez votre mot de passe immédiatement.`)}
      ${ctaButton('Sécuriser mon compte', `${BASE_URL}/connexion`)}
    `, `Connexion depuis un nouvel appareil détectée sur votre compte MASR.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 16. MOUQUABALA ACCEPTÉE (bonus — événement clé plateforme)
// ════════════════════════════════════════════════════════════════
export function mouquabalaAcceptedEmail({ prenom, matchPrenom }: { prenom: string; matchPrenom: string }) {
  return {
    subject: `🤲 ${matchPrenom} a accepté la mouquabala`,
    html: baseLayout(`
      ${h1(`${matchPrenom} a dit oui à la rencontre`)}
      ${p(`Bonjour ${prenom}, bonne nouvelle ! ${gold(matchPrenom)} a accepté votre demande de mouquabala. Notre équipe va maintenant organiser votre rencontre encadrée dans les meilleures conditions.`)}
      ${p(`Un membre de l'équipe vous contactera prochainement pour convenir des modalités (présentiel ou visioconférence, avec présence du wali pour les sœurs).`)}
      ${ctaButton('Accéder à mes messages', `${BASE_URL}/messages`)}
      ${divider}
      ${p(`Que Allah bénisse cette rencontre et facilite votre chemin. 🤲`, `font-style:italic;color:#9ca3af;font-size:13px;`)}
    `, `${matchPrenom} a accepté la mouquabala — la rencontre encadrée peut commencer.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 18. DEMANDE DE CHAT
// Envoyé à user B quand user A accepte le match et souhaite
// ouvrir une conversation.
// ════════════════════════════════════════════════════════════════
export function chatRequestEmail({ prenom, matchPrenom, matchId }: {
  prenom: string; matchPrenom: string; matchId: string
}) {
  const acceptUrl  = `${BASE_URL}/api/matching/${matchId}/repondre-email?reponse=ACCEPTE`
  const declineUrl = `${BASE_URL}/api/matching/${matchId}/repondre-email?reponse=REJETE`

  return {
    subject: `💬 ${matchPrenom} souhaite démarrer une conversation avec vous`,
    html: baseLayout(`
      ${h1(`${matchPrenom} veut vous connaître`)}
      ${p(`Bonjour ${prenom}, ${gold(matchPrenom)} a manifesté son intérêt pour votre profil et souhaite ouvrir une conversation encadrée sur Mariés au Second Regard.`)}
      <div style="background:linear-gradient(135deg,#1a1a1a 0%,#111 100%);border-radius:12px;padding:24px;margin:24px 0;text-align:center;border:1px solid rgba(212,168,83,0.2);">
        <div style="font-size:36px;margin-bottom:12px;">💬</div>
        <div style="font-size:18px;font-weight:700;color:#ffffff;margin-bottom:8px;">${matchPrenom} aimerait vous parler</div>
        <div style="font-size:13px;color:#9ca3af;">Chat supervisé · Cadre islamique · Aucune donnée personnelle partagée</div>
      </div>
      ${p(`Vous pouvez accepter pour ouvrir la conversation, ou décliner si ce profil ne vous correspond pas. Dans tous les cas, votre décision reste confidentielle.`)}
      <div style="text-align:center;margin:32px 0;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="${acceptUrl}" style="display:inline-block;background:${BRAND_COLOR};color:#000000;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:8px;margin:4px;">Accepter la conversation →</a>
        <a href="${declineUrl}" style="display:inline-block;background:#f4f4f5;color:#374151;font-size:14px;font-weight:600;text-decoration:none;padding:14px 24px;border-radius:8px;border:1px solid #e5e7eb;margin:4px;">Décliner</a>
      </div>
      ${divider}
      ${p(`Si les boutons ne fonctionnent pas, <a href="${BASE_URL}/tableau-de-bord" style="color:${BRAND_COLOR};">connectez-vous à votre espace</a> pour répondre.`, `font-size:12px;color:#9ca3af;`)}
      ${p(`Rappel : tout échange reste dans le cadre sécurisé de la plateforme. Votre numéro et vos coordonnées ne sont jamais partagés.`, `font-size:12px;color:#9ca3af;font-style:italic;`)}
    `, `${matchPrenom} souhaite ouvrir une conversation avec vous sur MASR.`)
  }
}

// ════════════════════════════════════════════════════════════════
// 19. DEMANDE DE MOUQABALA
// Envoyé à user B quand user A planifie une session mouqabala.
// ════════════════════════════════════════════════════════════════
export function mouquabalaRequestEmail({ prenom, matchPrenom, sessionId, dateHeure, dureeMinutes, superviseur }: {
  prenom: string; matchPrenom: string; sessionId: string
  dateHeure: string; dureeMinutes: number; superviseur: string
}) {
  const acceptUrl  = `${BASE_URL}/api/sessions/${sessionId}/confirmer-email?action=ACCEPTER`
  const declineUrl = `${BASE_URL}/api/sessions/${sessionId}/confirmer-email?action=DECLINER`
  const sessionUrl = `${BASE_URL}/sessions/${sessionId}`

  return {
    subject: `🤝 ${matchPrenom} vous invite à une mouqabala virtuelle`,
    html: baseLayout(`
      ${h1(`Invitation à une mouqabala encadrée`)}
      ${p(`Bonjour ${prenom}, ${gold(matchPrenom)} vous invite à une mouqabala virtuelle sur Mariés au Second Regard. Cette session encadrée est la prochaine étape vers la connaissance mutuelle selon les préceptes de l'Islam.`)}
      <div style="background:linear-gradient(135deg,#1a1a1a 0%,#111 100%);border-radius:12px;padding:24px;margin:24px 0;border:1px solid rgba(212,168,83,0.2);">
        <div style="font-size:13px;color:${BRAND_COLOR};font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Détails de la session</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${[
            { icon: '📅', label: 'Date & heure', value: dateHeure },
            { icon: '⏱️', label: 'Durée', value: `${dureeMinutes} minutes` },
            { icon: '🕌', label: 'Superviseur', value: superviseur },
            { icon: '🔒', label: 'Cadre', value: 'Islamique · Supervisé · Confidentiel' },
            { icon: '👥', label: 'Participants', value: `Vous, ${matchPrenom} et le superviseur` },
          ].map(row => `
            <tr>
              <td style="padding:6px 0;width:28px;font-size:16px;">${row.icon}</td>
              <td style="padding:6px 8px;font-size:12px;color:#9ca3af;width:110px;">${row.label}</td>
              <td style="padding:6px 0;font-size:13px;color:#ffffff;font-weight:500;">${row.value}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      ${p(`Acceptez pour confirmer votre présence, ou déclinez si vous ne souhaitez pas participer. ${gold(matchPrenom)} sera notifié(e) de votre décision.`)}
      <div style="text-align:center;margin:32px 0;">
        <a href="${acceptUrl}" style="display:inline-block;background:${BRAND_COLOR};color:#000000;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:8px;margin:4px 8px 4px 4px;">Accepter la mouqabala →</a>
        <a href="${declineUrl}" style="display:inline-block;background:#f4f4f5;color:#374151;font-size:14px;font-weight:600;text-decoration:none;padding:14px 24px;border-radius:8px;border:1px solid #e5e7eb;margin:4px;">Décliner</a>
      </div>
      ${divider}
      ${p(`Vous pouvez également <a href="${sessionUrl}" style="color:${BRAND_COLOR};">accéder à la session</a> depuis votre espace pour rejoindre la mouqabala le jour J.`, `font-size:12px;color:#9ca3af;`)}
      ${p(`Que Allah facilite votre chemin vers le mariage. 🤲`, `font-style:italic;color:#9ca3af;font-size:13px;`)}
    `, `${matchPrenom} vous invite à une mouqabala virtuelle encadrée sur MASR.`)
  }
}

// ─── Relance questionnaire non complété ──────────────────────
export function questionnaireReminderEmail({ prenom, heuresEcoules }: {
  prenom: string
  heuresEcoules: number
}) {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://maries-au-second-regard.vercel.app'
  const questionnaireUrl = `${BASE_URL}/questionnaire`
  const delaiTxt = heuresEcoules < 30 ? 'hier' : `il y a ${Math.round(heuresEcoules / 24)} jours`
  return {
    subject: `${prenom}, votre profil est incomplet — complétez votre questionnaire`,
    html: baseLayout(`
      <h2 style="font-size:22px;font-weight:700;color:#0a0a0a;margin:0 0 16px;">
        Votre compatibilité n'a pas encore pu être calculée, ${prenom}.
      </h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Vous avez créé votre compte <strong>${delaiTxt}</strong>, mais votre questionnaire n'est pas encore complété.
      </p>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
        Sans questionnaire, notre IA ne peut pas analyser votre profil ni vous proposer de compatibilités validées par nos psychologues cliniciens.
      </p>
      <div style="background:#fefce8;border:1px solid #d4a853;border-radius:8px;padding:16px 20px;margin:0 0 28px;">
        <p style="font-size:14px;color:#92400e;margin:0;font-weight:500;">
          ⏱ Le questionnaire prend environ <strong>10 minutes</strong>. Il est la base de tout ce qui suit.
        </p>
      </div>
      ${ctaButton('Compléter mon questionnaire maintenant', questionnaireUrl)}
      <p style="font-size:13px;color:#9ca3af;text-align:center;margin:16px 0 0;">
        Si vous avez des questions, répondez directement à cet email.
      </p>
    `, `${prenom}, complétez votre questionnaire pour recevoir vos compatibilités.`),
  }
}
