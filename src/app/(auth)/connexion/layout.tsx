import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion | Mariés au Second Regard',
  description: "Connectez-vous à votre espace Mariés au Second Regard pour consulter vos compatibilités et gérer vos échanges.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: 'https://mariesausecondregard.com/connexion',
  },
}

export default function ConnexionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
