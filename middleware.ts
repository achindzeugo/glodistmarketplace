import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes qui nécessitent une authentification
const protectedRoutes = ['/cart', '/profile', '/dashboard']

// Routes d'authentification (rediriger si déjà connecté)
const authRoutes = ['/login', '/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get('auth_token')?.value
  const isAuthenticated = !!authToken

  // Vérifier si la route nécessite une authentification
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Vérifier si c'est une route d'authentification
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Rediriger vers login si pas authentifié et route protégée
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Rediriger vers accueil si déjà authentifié et sur route d'auth
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}