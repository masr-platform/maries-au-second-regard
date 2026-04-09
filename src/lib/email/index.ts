// ============================================================
// MASR — Service Email Centralisé (Resend)
// Usage : import { emailService } from '@/lib/email'
//         await emailService.sendWelcome({ prenom, email })
// ============================================================

import { Resend } from 'resend'
import * as T from './templates'

// ── FROM : utilise le domaine vérifié Resend si dispo, sinon fallback onboarding
// Accepte RESEND_FROM ou EMAIL_FROM (compatibilité .env existant)
// Pour utiliser votre domaine custom : vérifiez-le dans Resend et définissez
// RESEND_FROM="Mariés au Second Regard <noreply@mariesausecondregard.com>" dans Vercel
const FROM = process.env.RESEND_FROM
  || process.env.EMAIL_FROM
  || 'Mariés au Second Regard <onboarding@resend.dev>'   // domaine de test Resend (toujours ok)
const REPLY_TO = 'mariesausecondregard@gmail.com'

// ── Clé API : accepte RESEND_API_KEY ou EMAIL_SERVER_PASSWORD (compatibilité .env existant)
const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.EMAIL_SERVER_PASSWORD

// ─── Fonction d'envoi de base ────────────────────────────────
async function send(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY manquant — email non envoyé:', subject, '→', to)
    return
  }
  try {
    const resend = new Resend(RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      reply_to: REPLY_TO,
      subject,
      html,
    })
    if (error) {
      console.error('[email] Resend error:', subject, '→', to, error)
      throw error
    }
    console.log('[email] Envoyé:', subject, '→', to, 'id:', data?.id)
  } catch (err) {
    console.error('[email] Échec envoi:', subject, '→', to, err)
    // Ne pas propager — l'email est non bloquant pour l'UX
  }
}

// ─── Service Email ────────────────────────────────────────────
export const emailService = {

  // ── Authentification ────────────────────────────────────────

  /** Email de bienvenue après création de compte */
  async sendWelcome({ email, prenom }: { email: string; prenom: string }) {
    const { subject, html } = T.welcomeEmail({ prenom })
    await send(email, subject, html)
  },

  /** Lien de vérification d'email */
  async sendVerifyEmail({ email, prenom, verifyUrl }: { email: string; prenom: string; verifyUrl: string }) {
    const { subject, html } = T.verifyEmailEmail({ prenom, verifyUrl })
    await send(email, subject, html)
  },

  /** Lien de réinitialisation du mot de passe */
  async sendResetPassword({ email, prenom, resetUrl }: { email: string; prenom: string; resetUrl: string }) {
    const { subject, html } = T.resetPasswordEmail({ prenom, resetUrl })
    await send(email, subject, html)
  },

  /** Confirmation après changement de mot de passe */
  async sendPasswordChanged({ email, prenom }: { email: string; prenom: string }) {
    const { subject, html } = T.passwordChangedEmail({ prenom })
    await send(email, subject, html)
  },

  // ── Paiements / Stripe ───────────────────────────────────────

  /** Confirmation d'abonnement souscrit */
  async sendSubscriptionConfirm({ email, prenom, plan, montant, nextBilling }: {
    email: string; prenom: string; plan: string; montant: string; nextBilling: string
  }) {
    const { subject, html } = T.subscriptionConfirmEmail({ prenom, plan, montant, nextBilling })
    await send(email, subject, html)
  },

  /** Reçu de paiement */
  async sendPaymentConfirm({ email, prenom, montant, plan, date, invoiceUrl }: {
    email: string; prenom: string; montant: string; plan: string; date: string; invoiceUrl?: string
  }) {
    const { subject, html } = T.paymentConfirmEmail({ prenom, montant, plan, date, invoiceUrl })
    await send(email, subject, html)
  },

  /** Paiement échoué */
  async sendPaymentFailed({ email, prenom }: { email: string; prenom: string }) {
    const { subject, html } = T.paymentFailedEmail({ prenom })
    await send(email, subject, html)
  },

  /** Carte bancaire sur le point d'expirer */
  async sendCardExpiring({ email, prenom, expiryMonth, expiryYear }: {
    email: string; prenom: string; expiryMonth: string; expiryYear: string
  }) {
    const { subject, html } = T.cardExpiringEmail({ prenom, expiryMonth, expiryYear })
    await send(email, subject, html)
  },

  /** Résiliation confirmée */
  async sendSubscriptionCancelled({ email, prenom, endDate }: {
    email: string; prenom: string; endDate: string
  }) {
    const { subject, html } = T.subscriptionCancelledEmail({ prenom, endDate })
    await send(email, subject, html)
  },

  /** Renouvellement automatique effectué */
  async sendSubscriptionRenewed({ email, prenom, plan, montant, nextBilling }: {
    email: string; prenom: string; plan: string; montant: string; nextBilling: string
  }) {
    const { subject, html } = T.subscriptionRenewedEmail({ prenom, plan, montant, nextBilling })
    await send(email, subject, html)
  },

  // ── Matching & Activité ──────────────────────────────────────

  /** Nouveau match détecté */
  async sendNewMatch({ email, prenom, matchPrenom, score, ville }: {
    email: string; prenom: string; matchPrenom: string; score: number; ville?: string
  }) {
    const { subject, html } = T.newMatchEmail({ prenom, matchPrenom, score, ville })
    await send(email, subject, html)
  },

  /** Nouveau message reçu */
  async sendNewMessage({ email, prenom, expediteur, apercu }: {
    email: string; prenom: string; expediteur: string; apercu: string
  }) {
    const { subject, html } = T.newMessageEmail({ prenom, expediteur, apercu })
    await send(email, subject, html)
  },

  /** Relance après inactivité (ex : 7 jours sans connexion) */
  async sendInactivity({ email, prenom, joursInactif }: {
    email: string; prenom: string; joursInactif: number
  }) {
    const { subject, html } = T.inactivityEmail({ prenom, joursInactif })
    await send(email, subject, html)
  },

  /** Relance questionnaire non complété — cron J+1 */
  async sendQuestionnaireReminder({ email, prenom, heuresEcoules }: {
    email: string; prenom: string; heuresEcoules: number
  }) {
    const { subject, html } = T.questionnaireReminderEmail({ prenom, heuresEcoules })
    await send(email, subject, html)
  },

  /** Résumé hebdomadaire */
  async sendWeeklyDigest({ email, prenom, nouveauxMatches, messages, vues }: {
    email: string; prenom: string; nouveauxMatches: number; messages: number; vues: number
  }) {
    const { subject, html } = T.weeklyDigestEmail({ prenom, nouveauxMatches, messages, vues })
    await send(email, subject, html)
  },

  // ── Sécurité ─────────────────────────────────────────────────

  /** Connexion depuis un nouvel appareil */
  async sendSuspiciousLogin({ email, prenom, ip, location, device, date }: {
    email: string; prenom: string; ip: string; location: string; device: string; date: string
  }) {
    const { subject, html } = T.suspiciousLoginEmail({ prenom, ip, location, device, date })
    await send(email, subject, html)
  },

  // ── Événements Plateforme ────────────────────────────────────

  /** Mouquabala acceptée par l'autre partie */
  async sendMouquabalaAccepted({ email, prenom, matchPrenom }: {
    email: string; prenom: string; matchPrenom: string
  }) {
    const { subject, html } = T.mouquabalaAcceptedEmail({ prenom, matchPrenom })
    await send(email, subject, html)
  },

  /** Demande de conversation — user A a accepté, user B est notifié */
  async sendChatRequest({ email, prenom, matchPrenom, matchId }: {
    email: string; prenom: string; matchPrenom: string; matchId: string
  }) {
    const { subject, html } = T.chatRequestEmail({ prenom, matchPrenom, matchId })
    await send(email, subject, html)
  },

  /** Demande de mouqabala — user A a planifié, user B est invité */
  async sendMouquabalaRequest({ email, prenom, matchPrenom, sessionId, dateHeure, dureeMinutes, superviseur }: {
    email: string; prenom: string; matchPrenom: string; sessionId: string
    dateHeure: string; dureeMinutes: number; superviseur: string
  }) {
    const { subject, html } = T.mouquabalaRequestEmail({ prenom, matchPrenom, sessionId, dateHeure, dureeMinutes, superviseur })
    await send(email, subject, html)
  },
}
