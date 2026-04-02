import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inscription gratuite — Mariage islamique sérieux | Mariés au Second Regard',
  description: "Créez votre profil gratuitement. Questionnaire de compatibilité en 5 minutes, validé par des psychologues cliniciens musulmans. Trouvez votre moitié selon les préceptes de l'Islam.",
  openGraph: {
    title: 'Inscription — Mariés au Second Regard',
    description: "Rejoignez la plateforme de mariage islamique sérieux. Inscription et questionnaire 100% gratuits.",
    url: 'https://mariesausecondregard.com/inscription',
    type: 'website',
  },
  alternates: {
    canonical: 'https://mariesausecondregard.com/inscription',
  },
}

export default function InscriptionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
