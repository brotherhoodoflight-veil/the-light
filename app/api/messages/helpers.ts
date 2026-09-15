// ============================================================
// VEIL — Brotherhood Chamber · Route Helpers
// Shared request/response plumbing for the communication API.
// The authenticated member is always resolved from the signed
// session cookie — never trusted from the client body.
// ============================================================

import { NextResponse } from 'next/server';
import { getSessionPayload } from '../../../lib/auth/session-server';
import { ChamberError } from '../../../lib/messages/chamber-service';

export interface Requester {
  memberId: string;
  role: string;
}

/** Returns the authenticated member or a 401 response. */
export async function requireRequester(): Promise<Requester | NextResponse> {
  const session = await getSessionPayload();
  const memberId = session?.user?.memberId;
  if (!session || !memberId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  return { memberId, role: session.user.role };
}

export function chamberError(error: unknown): NextResponse {
  if (error instanceof ChamberError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error('[chamber] unexpected error:', String(error));
  return NextResponse.json(
    { error: 'An unexpected error occurred within the chamber.' },
    { status: 500 },
  );
}