// ============================================================
// VEIL — Session Crypto
// HMAC-signed session tokens (WebCrypto, Edge + Node compatible).
// The signing secret comes from VEIL_SESSION_SECRET with a
// development fallback. Production MUST set a strong secret.
// ============================================================

import type { VeilSessionUser } from './session-types';

const SESSION_COOKIE = 'veil_session';
const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

const DEV_FALLBACK_SECRET =
  process.env.VEIL_SESSION_SECRET ?? 'veil-development-session-secret-do-not-use-in-production';

const enc = new TextEncoder();

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
    enc.encode(DEV_FALLBACK_SECRET),
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

  try {
    const payload = JSON.parse(base64urlDecode(body)) as SessionPayload;
    if (!payload || !payload.user || typeof payload.exp !== 'number') return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };