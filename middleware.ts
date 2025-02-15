import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Add routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/verify", "/landing"]

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next()
  }

  // Allow API routes (they'll handle their own auth)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Allow static files and images
  if (
    pathname.includes(".") || // Has file extension
    pathname.startsWith("/_next/") || // Next.js internal
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  // Redirect to login if no token
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
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