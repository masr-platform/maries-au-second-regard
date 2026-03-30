import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path  = req.nextUrl.pathname

    // Redirection si questionnaire non complété
    if (
      token &&
      !token.questionnaireCompleted &&
      path !== '/questionnaire' &&
      !path.startsWith('/api') &&
      !path.startsWith('/_next')
    ) {
      if (path !== '/connexion' && path !== '/inscription') {
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
          path.startsWith('/api/auth') ||
          path.startsWith('/api/users') ||
          path.startsWith('/mentions-legales') ||
          path.startsWith('/confidentialite') ||
          path.startsWith('/cgu')
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
