// ============================================================
// VEIL — Server Session
// Reads the signed session cookie via next/headers.
// Server-only — do NOT import from client components.
// ============================================================

import { cookies } from 'next/headers';
import {
  verifySessionToken,
  SESSION_COOKIE,
} from './session-crypto';
import type { SessionPayload } from './session-crypto';

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}