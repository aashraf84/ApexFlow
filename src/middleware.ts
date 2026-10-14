import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * ApexFlow — server-side auth gate (edge middleware).
 *
 * Closes the gap where every /admin/* page and /api/admin/* + business /api/*
 * route was reachable without authentication. This middleware enforces that a
 * valid `admin_session` cookie is present for all protected paths.
 *
 * Full session validity is still verified DB-side by:
 *   - /admin/layout.tsx (client fetch to /api/auth/session) for admin pages
 *   - /api/auth/session route (AdminSession table lookup)
 * So a forged/stale cookie is rejected there. This middleware provides the
 * fast edge-level "is there a session cookie at all?" check that blocks the
 * obvious unauthenticated-access gap on every protected route at once.
 */

// API paths that are intentionally public (no admin auth required)
const PUBLIC_API_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/session',
  '/api/auth/seed', // bootstrap (idempotent — only creates admin if none exists)
  '/api/auth/ping',
  '/api/auth/logout',
  '/api/erp-systems', // public ERP catalog
  '/api/erp-clients', // public testimonials on ERP detail pages
  '/api/stripe/webhook', // signature-verified by Stripe
  '/api/admin/sync-cron', // Vercel Cron — CRON_SECRET-verified in the route itself
])

function isPublicApi(pathname: string): boolean {
  if (PUBLIC_API_PATHS.has(pathname)) return true
  // per-ERP public stats (aggregate numbers, used on public ERP detail pages)
  if (pathname.startsWith('/api/erp/') && pathname.endsWith('/stats')) return true
  if (pathname === '/api/erp/apparelflow/clients') return true
  // public checkout flow (customers buying without an admin login)
  if (pathname.startsWith('/api/checkout/')) return true
  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('admin_session')?.value

  // Admin pages: redirect to login if no session cookie (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // Protected API routes: 401 if no session cookie
  if (pathname.startsWith('/api/') && !isPublicApi(pathname)) {
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  // Run on all /admin/* and /api/* paths. Public marketing pages (/, /erp/*,
  // /pricing, etc.) are NOT matched, so they stay fast and unaffected.
  matcher: ['/admin/:path*', '/api/:path*'],
}
