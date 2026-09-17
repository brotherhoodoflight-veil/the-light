// ============================================================
// VEIL — Authentication Gateway
// POST /api/auth/login
//
// Realm-aware, database-first authentication:
//   1. The caller specifies a realm: 'sanctuary' or
//      'grand-chamber'. Unknown values fall back to the
//      Sanctuary (the default protected domain).
//   2. The server resolves the membership identity from the real
//      registry and verifies the password against the stored
//      argon2 hash from the AuthAccount record.
//   3. Server-side role enforcement confirms the identity is
//      entitled to enter the requested realm.
//   4. The signed session cookie is issued upon success.
//
// There is no development/demo gateway. Every session is issued
// only after a genuine Member + AuthAccount credential match.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';
import argon2 from 'argon2';
import { prisma, type Member } from '../../../../lib/db';
import { memberToSessionUser } from '../../../../lib/auth/member-record';
import {
  signSessionToken,
  SESSION_COOKIE,
} from '../../../../lib/auth/session-crypto';
import {
  normalizeRealm,
  roleBelongsToRealm,
  REALM_DENIAL,
  type ProtectedRealm,
} from '../../../../lib/auth/realm';

function realmDenied(realm: ProtectedRealm) {
  const denial = REALM_DENIAL[realm];
  return NextResponse.json({ error: denial.error }, { status: 403 });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const { identifier, password, realm: rawRealm } = body as {
    identifier?: string;
    password?: string;
    realm?: unknown;
  };

  if (!identifier || typeof identifier !== 'string' || !password || typeof password !== 'string') {
    return NextResponse.json(
      { error: 'Member ID and password are required.' },
      { status: 400 },
    );
  }

  const trimmed = identifier.trim();
  const realm = normalizeRealm(rawRealm);

  // ---- Resolve against the real membership registry ----
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

  if (!member) {
    return NextResponse.json(
      { error: 'The credentials were not recognized.' },
      { status: 401 },
    );
  }

  // Server-side realm enforcement: the role must belong to the requested domain.
  if (!roleBelongsToRealm(member.role, realm)) {
    return realmDenied(realm);
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

  let valid = false;
  if (account) {
    try {
      valid = await argon2.verify(account.passwordHash, password);
    } catch {
      valid = false;
    }
  }

  if (!valid) {
    return NextResponse.json(
      { error: 'The credentials were not recognized.' },
      { status: 401 },
    );
  }

  const user = memberToSessionUser(member);
  const token = await signSessionToken(user);
  const response = NextResponse.json(
    { user, gateway: 'database' },
    { status: 200 },
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
