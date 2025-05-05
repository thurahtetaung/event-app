import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtDecode } from 'jwt-decode'; // Use jwt-decode for client-side safe decoding

// Define routes protected by authentication and specific roles
const adminRoutes = ["/admin"]
const organizerRoutes = ["/organizer"]
const userRoutes = ["/my-events", "/checkout", "/application-status", "/become-organizer", "/events"] // Routes for standard logged-in users

// Routes that should always be allowed (Next.js internals, static files)
const bypassRoutes = [
  "/_next",
  "/favicon.ico",
  "/static",
  // Allow all files with extensions (images, css, etc.)
  // This regex matches paths containing a dot followed by non-slash characters
  /\.(?!well-known|xml|txt)[^/]+$/,
]

// Helper function to check if a path matches any pattern in a list
const matchesPath = (pathname: string, patterns: (string | RegExp)[]) => {
  return patterns.some(pattern => {
    if (typeof pattern === 'string') {
      // Exact match or starts with pattern + '/'
      return pathname === pattern || pathname.startsWith(`${pattern}/`)
    }
    // Regex match
    return pattern.test(pathname)
  })
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value
  const refreshToken = request.cookies.get("refreshToken")?.value

  // 1. Allow bypass routes
  if (matchesPath(pathname, bypassRoutes)) {
    return NextResponse.next()
  }

  // 2. Check for token existence and basic validity (expiration)
  let isPotentiallyAuthenticated = false;
  if (token) {
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      if (decoded.exp * 1000 > Date.now()) {
        isPotentiallyAuthenticated = true;
      }
    } catch {
      // Invalid token format, treat as unauthenticated
    }
  }

  // 3. Define all protected routes that require *any* authentication
  const allProtectedRoutes = [...adminRoutes, ...organizerRoutes, ...userRoutes];

  // 4. Handle redirection for unauthenticated users trying protected routes
  if (!isPotentiallyAuthenticated && matchesPath(pathname, allProtectedRoutes)) {
     // If no valid token and trying a protected route, redirect to login
     // Exception: Allow access if there's a refresh token, client will handle refresh/redirect
     if (!refreshToken) {
        const url = new URL("/login", request.url)
        url.searchParams.set("from", pathname)
        console.log(`[Middleware] Redirecting unauthenticated user from ${pathname} to login.`);
        return NextResponse.redirect(url)
     }
     // If refresh token exists, let client handle it
     return NextResponse.next();
  }

  // 6. Allow request to proceed for all other cases
  // Role checks will happen client-side in layouts for /admin and /organizer
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
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - healthz (health check endpoint)
     * Match all paths except specific internal/static paths and API routes.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|healthz).*)',
  ],
}