// ============================================================
// VEIL — Logout
// POST /api/auth/logout  |  GET /api/auth/logout
// Clears the session cookie.
// ============================================================

import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '../../../../lib/auth/session-crypto';

export async function POST() {
  return clearSession();
}

export async function GET() {
  return clearSession();
}

function clearSession(): NextResponse {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}