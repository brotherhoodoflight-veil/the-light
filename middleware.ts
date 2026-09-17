// ============================================================
// VEIL — Route Protection Middleware
// The server is the ultimate authority. Any request entering
// the inner chamber without a valid signed session is returned
// to the appropriate entrance. The Grand Chamber additionally
// requires that the session carry an officer-level role.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from './lib/auth/session-crypto';
import { isGrandChamberRole } from './lib/auth/realm';

const SANCTUARY_LOGIN = '/sanctuary/login';
const GRAND_CHAMBER_LOGIN = '/grand-chamber/login';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  const { pathname } = request.nextUrl;

  // Login pages are public thresholds; they must never be gated.
  if (pathname === '/sanctuary/login' || pathname === '/grand-chamber/login') {
    return NextResponse.next();
  }

  // ── Grand Chamber: session + officer role required ──
  if (pathname.startsWith('/grand-chamber')) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = GRAND_CHAMBER_LOGIN;
      url.search = '';
      return NextResponse.redirect(url);
    }

    if (!isGrandChamberRole(session.user.role)) {
      // Authenticated members are returned to their own Sanctuary.
      const url = request.nextUrl.clone();
      url.pathname = '/sanctuary';
      url.search = '';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // ── Sanctuary / Dashboard: session required ──
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = SANCTUARY_LOGIN;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/sanctuary/:path*', '/grand-chamber/:path*'],
};
