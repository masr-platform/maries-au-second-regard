export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/auth/AuthProvider'

export const metadata: Metadata = {
  title: 'Mariés au Second Regard — Mariage islamique sérieux en France',
  description:
    'La première plateforme de mariage islamique intelligente. Matching par IA, ' +
    'validé par des psychologues cliniciens, encadré selon les préceptes de l\'Islam.',
  keywords: [
    'mariage islamique', 'rencontre halal', 'mariage musulman', 'nikah',
    'site de rencontre halal', 'marriage islam', 'wali', 'mouquabala',
  ],
  authors: [{ name: 'Mariés au Second Regard' }],
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
    title: 'Mariés au Second Regard',
    description: 'Mariage islamique sérieux — IA + psychologues cliniciens musulmans.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://mariesausecondregard.com',
    siteName: 'Mariés au Second Regard',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Mariés au Second Regard' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mariés au Second Regard',
    description: 'Mariage islamique sérieux — IA + psychologues cliniciens musulmans.',
  },
  robots: { index: true, follow: true },
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
