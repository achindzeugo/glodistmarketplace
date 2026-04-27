import { NextRequest, NextResponse } from "next/server"

// Routes qui nécessitent d'être connecté
const PROTECTED = ["/profile", "/cart", "/dashboard", "/shop-registration"]
// Routes accessibles uniquement si NON connecté
const AUTH_ONLY = ["/login", "/signup"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hasToken = req.cookies.has("access_token")

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p))

  if (isProtected && !hasToken) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthOnly && hasToken) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/cart/:path*",
    "/dashboard/:path*",
    "/shop-registration/:path*",
    "/login",
    "/signup",
  ],
}
