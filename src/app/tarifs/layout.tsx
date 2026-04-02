import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarifs — Abonnements mariage islamique | Mariés au Second Regard',
  description: 'Découvrez nos abonnements pour accéder aux profils compatibles validés par IA et psychologues. À partir de 19,90€/mois. Inscription et questionnaire gratuits.',
  openGraph: {
    title: 'Tarifs — Mariés au Second Regard',
    description: 'Abonnements mariage islamique sérieux en France. Profils validés IA + psychologues cliniciens. Dès 19,90€/mois.',
    url: 'https://mariesausecondregard.com/tarifs',
    type: 'website',
  },
  alternates: {
    canonical: 'https://mariesausecondregard.com/tarifs',
  },
}

export default function TarifsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
