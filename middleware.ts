import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Add routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/landing"]

// Add routes that should bypass token check
const bypassRoutes = [
  "/api/users/refresh-token",
  "/_next",
  "/favicon.ico",
  "/static",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow bypass routes
  if (bypassRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next()
  }

  // Allow API routes (they'll handle their own auth)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Allow static files and images
  if (pathname.includes(".")) {
    return NextResponse.next()
  }

  // Check for token in cookie
  const token = request.cookies.get("token")?.value
  const refreshToken = request.cookies.get("refreshToken")?.value

  // If no token but has refresh token, let the client handle the refresh
  if (!token && refreshToken) {
    return NextResponse.next()
  }

  // Redirect to login if no token and no refresh token
  if (!token && !refreshToken) {
    const url = new URL("/login", request.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // Add token to Authorization header for API requests
  const requestHeaders = new Headers(request.headers)
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/ (API routes)
     * 2. /_next/ (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml (static files)
     */
    "/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)",
  ],
}