// ============================================================
// VEIL — Route Protection Middleware
// The server is the ultimate authority. Any request entering
// the inner chamber without a valid signed session is returned
// to the entrance (/login).
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from './lib/auth/session-crypto';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};