// ============================================================
// VEIL — Authentication Gateway
// POST /api/auth/login
//
// Database-first authentication:
//   1. Look up the membership record by member ID (or registered
//      email, when one exists) in the real database.
//   2. Verify the provided password against the argon2 hash
//      stored for that member. No plaintext passwords exist.
//   3. Issue the signed session cookie through the existing
//      session architecture.
//
// The development gateway remains active ONLY as a fallback for
// demo identities that are not (yet) database-backed. It is
// clearly marked and must be removed in production.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';
import argon2 from 'argon2';
import { prisma, type Member } from '../../../../lib/db';
import { findDevUser, DEV_PASSWORD_HASH } from '../../../../lib/auth/dev-users';
import { memberToSessionUser } from '../../../../lib/auth/member-record';
import {
  signSessionToken,
  SESSION_COOKIE,
} from '../../../../lib/auth/session-crypto';

const RESPONSE_HEADERS: Record<string, string> = {
  'X-VEIL-DEV-GATEWAY': '1',
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400, headers: RESPONSE_HEADERS },
    );
  }

  const { identifier, password } = body as {
    identifier?: string;
    password?: string;
  };

  if (!identifier || typeof identifier !== 'string' || !password || typeof password !== 'string') {
    return NextResponse.json(
      { error: 'Member ID and password are required.' },
      { status: 400, headers: RESPONSE_HEADERS },
    );
  }

  const trimmed = identifier.trim();

  // ---- Step 1: resolve against the real membership database ----
  let member: Member | null = null;
  try {
    member = await prisma.member.findFirst({
      where: {
        OR: [
          { memberId: trimmed },
          ...(trimmed.includes('@') ? [{ email: trimmed }] : []),
        ],
      },
    });
  } catch {
    member = null;
  }

  let valid = false;
  if (member) {
    if (member.role.toUpperCase() !== 'MEMBER') {
      return NextResponse.json(
        { error: 'This account is not authorized for portal access.' },
        { status: 403, headers: RESPONSE_HEADERS },
      );
    }
    let account: { passwordHash: string } | null = null;
    try {
      account = await prisma.authAccount.findUnique({
        where: { memberId: member.memberId },
        select: { passwordHash: true },
      });
    } catch {
      account = null;
    }
    if (account) {
      try {
        valid = await argon2.verify(account.passwordHash, password);
      } catch {
        valid = false;
      }
    }
  } else {
    // Dummy verify to keep timing uniform for unknown member IDs.
    await argon2.verify(DEV_PASSWORD_HASH, password).catch(() => false);
  }

  if (!member) {
    // ---- fallback: development gateway (demo identities only) ----
    const devUser = findDevUser(trimmed);
    if (!devUser) {
      return NextResponse.json(
        { error: 'The credentials were not recognized.' },
        { status: 401, headers: RESPONSE_HEADERS },
      );
    }
    try {
      valid = await argon2.verify(DEV_PASSWORD_HASH, password);
    } catch {
      valid = false;
    }
    if (!valid) {
      return NextResponse.json(
        { error: 'The credentials were not recognized.' },
        { status: 401, headers: RESPONSE_HEADERS },
      );
    }
    const devToken = await signSessionToken(devUser);
    const devResponse = NextResponse.json(
      { user: devUser },
      { status: 200, headers: RESPONSE_HEADERS },
    );
    return attachSession(devResponse, devToken);
  }

  if (!valid) {
    return NextResponse.json(
      { error: 'The credentials were not recognized.' },
      { status: 401, headers: RESPONSE_HEADERS },
    );
  }

  const user = memberToSessionUser(member);
  const token = await signSessionToken(user);
  const response = NextResponse.json(
    { user, gateway: 'database' },
    { status: 200, headers: RESPONSE_HEADERS },
  );
  return attachSession(response, token);
}

function attachSession(response: NextResponse, token: string): NextResponse {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 8 * 60 * 60,
  });
  return response;
}