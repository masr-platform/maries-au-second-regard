export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/auth/AuthProvider'

export const metadata: Metadata = {
  title: 'Mariés au Second Regard — Mariage islamique sérieux en France | Nikah halal',
  description:
    'Trouvez votre partenaire pour le mariage islamique en France. Compatibilité validée à +85% par IA et 5 psychologues cliniciens musulmans. Inscription gratuite. Nikah halal, chat supervisé, mouqabala encadrée.',
  keywords: [
    'mariage islamique France',
    'mariage musulman France',
    'rencontre halal France',
    'site mariage halal',
    'nikah France',
    'mouquabala',
    'rencontre musulmane sérieuse',
    'mariage islamique sérieux',
    'plateforme mariage halal',
    'rencontre musulmane France',
    'site nikah',
    'mariage selon islam',
    'célibataire musulman France',
    'compatibilité islamique',
    'psychologue mariage musulman',
    'mariage halal gratuit',
    'trouver mari musulman',
    'trouver femme musulmane',
  ],
  authors: [{ name: 'Mariés au Second Regard', url: 'https://mariesausecondregard.com' }],
  creator: 'Mariés au Second Regard',
  publisher: 'Mariés au Second Regard',
  metadataBase: new URL('https://mariesausecondregard.com'),
  alternates: {
    canonical: 'https://mariesausecondregard.com',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/favicon-192.png' }],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'Mariés au Second Regard — Mariage islamique sérieux en France',
    description: 'La première plateforme de mariage islamique avec IA + 5 psychologues cliniciens musulmans. Compatibilité prouvée à +85%. Inscription gratuite.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://mariesausecondregard.com',
    siteName: 'Mariés au Second Regard',
    images: [
      {
        url: 'https://images.pexels.com/photos/31619527/pexels-photo-31619527.jpeg?auto=compress&cs=tinysrgb&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Mariés au Second Regard — Plateforme de mariage islamique en France',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mariés au Second Regard — Mariage islamique sérieux',
    description: 'Compatibilité validée à +85% par IA et psychologues musulmans. Inscription gratuite.',
    images: ['https://images.pexels.com/photos/31619527/pexels-photo-31619527.jpeg?auto=compress&cs=tinysrgb&w=1200&q=80'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'à-remplir-après-Search-Console',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#111', color: '#fff', border: '1px solid #2c2c2c' },
              success: { iconTheme: { primary: '#B8960C', secondary: '#000' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
