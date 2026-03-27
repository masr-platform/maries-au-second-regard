import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/auth/AuthProvider'

export const metadata: Metadata = {
  title: 'Mariés au Second Regard — Rencontre islamique sérieuse',
  description:
    'La première plateforme de mariage islamique intelligente. Matching par intelligence artificielle, ' +
    'rencontre encadrée selon les préceptes de l\'Islam, accompagnement par des psychologues et imams.',
  keywords: [
    'mariage islamique', 'rencontre halal', 'mariage musulman', 'nikah',
    'site de rencontre halal', 'marriage islam', 'wali', 'mouquabala',
  ],
  authors: [{ name: 'Mariés au Second Regard' }],
  openGraph: {
    title: 'Mariés au Second Regard',
    description: 'La rencontre qui commence par le fond.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://mariesausecondregard.fr',
    siteName: 'Mariés au Second Regard',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Mariés au Second Regard' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mariés au Second Regard',
    description: 'La rencontre qui commence par le fond.',
  },
  robots: { index: true, follow: true },
  themeColor: '#0a0a0a',
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
