import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path  = req.nextUrl.pathname

    // Redirection si questionnaire non complété
    const publicPaths = ['/connexion', '/inscription', '/tarifs', '/faq', '/forgot-password', '/reset-password']
    if (
      token &&
      !token.questionnaireCompleted &&
      path !== '/questionnaire' &&
      !path.startsWith('/api') &&
      !path.startsWith('/_next')
    ) {
      if (!publicPaths.includes(path)) {
        return NextResponse.redirect(new URL('/questionnaire', req.url))
      }
    }

    // Protection routes admin
    if (path.startsWith('/admin')) {
      const role = token?.role as string
      if (!['ADMIN', 'SUPER_ADMIN', 'MODERATEUR'].includes(role)) {
        return NextResponse.redirect(new URL('/tableau-de-bord', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        // Pages publiques
        if (
          path === '/' ||
          path.startsWith('/inscription') ||
          path.startsWith('/connexion') ||
          path.startsWith('/forgot-password') ||
          path.startsWith('/reset-password') ||
          path.startsWith('/tarifs') ||
          path.startsWith('/faq') ||
          path.startsWith('/api/auth') ||
          path.startsWith('/api/users') ||
          // Routes API sans session utilisateur (webhook, cron, liens email)
          path.startsWith('/api/stripe/webhook') ||
          path.startsWith('/api/cron/') ||
          path.includes('/repondre-email') ||
          path.includes('/confirmer-email') ||
          path.startsWith('/mentions-legales') ||
          path.startsWith('/confidentialite') ||
          path.startsWith('/cgu') ||
          path.startsWith('/cgv') ||
          path.startsWith('/regles')
        ) {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|.*\\.webp|.*\\.gif).*)'],
}
