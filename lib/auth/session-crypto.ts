// ============================================================
// VEIL — Session Crypto
// HMAC-signed session tokens (WebCrypto, Edge + Node compatible).
// The signing secret is read EXCLUSIVELY from VEIL_SESSION_SECRET.
// A static development fallback exists so the starter runs out of
// the box, but it is only usable outside production. In production
// the secret MUST be set: without it the gateway fails closed and
// no token can be signed or verified.
// ============================================================

import type { VeilSessionUser } from './session-types';

const SESSION_COOKIE = 'veil_session';
const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

const DEV_FALLBACK_SECRET =
  'veil-development-session-secret-do-not-use-in-production';

const enc = new TextEncoder();

/**
 * Resolves the HMAC secret. In production the environment variable
 * is mandatory — the code never falls back to the public constant,
 * because a known signing key would let anyone forge sessions and
 * defeat the realm boundary entirely.
 */
function resolveSecret(): string {
  const secret = process.env.VEIL_SESSION_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret) {
      throw new Error(
        'VEIL_SESSION_SECRET is not set. Refusing to sign or verify ' +
          'sessions in production without a configured secret.',
      );
    }
    return secret;
  }
  return secret ?? DEV_FALLBACK_SECRET;
}

function base64urlEncode(input: string): string {
  const bytes = enc.encode(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64urlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(resolveSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function sign(data: string): Promise<string> {
  const key = await importKey();
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const sigBytes = new Uint8Array(signature);
  let binary = '';
  for (const byte of sigBytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export interface SessionPayload {
  user: VeilSessionUser;
  exp: number;
}

export async function signSessionToken(user: VeilSessionUser): Promise<string> {
  const payload: SessionPayload = { user, exp: Date.now() + TTL_MS };
  const body = base64urlEncode(JSON.stringify(payload));
  const signature = await sign(body);
  return `${body}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const separator = token.lastIndexOf('.');
    if (separator === -1) return null;
    const body = token.slice(0, separator);
    const signature = token.slice(separator + 1);
    const expected = await sign(body);
    if (signature.length !== expected.length) return null;

    let equal = 0;
    for (let i = 0; i < signature.length; i += 1) {
      equal |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (equal !== 0) return null;

    const payload = JSON.parse(base64urlDecode(body)) as SessionPayload;
    if (!payload || typeof payload.exp !== 'number') return null;
    if (payload.exp < Date.now()) return null;
    const { user } = payload;
    if (
      !user ||
      typeof user.memberId !== 'string' ||
      !user.memberId ||
      typeof user.role !== 'string' ||
      !user.role ||
      typeof user.email !== 'string'
    ) {
      return null;
    }
    return { user, exp: payload.exp };
  } catch {
    // Any failure — malformed token, unexpected payload, or an
    // unavailable signing key — must fail closed: no access.
    return null;
  }
}

export { SESSION_COOKIE };