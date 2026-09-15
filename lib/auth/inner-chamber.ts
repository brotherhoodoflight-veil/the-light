// ============================================================
// VEIL — Inner Chamber Authorization
// Server-side authority check for the Inner Chamber route.
//
// There is currently NO authorization record granting access to
// the Inner Chamber. Until a real authorization system issues a
// grant, access is deliberately not granted to any member.
//
// This module is the single seam where a future authorization
// system will be consulted. It is server-only and must never be
// imported from a client component.
// ============================================================

import type { VeilSessionUser } from './session-types';

export interface InnerChamberAccess {
  granted: boolean;
  accessLevel: string;
  authorization: string;
  lastAccess: string;
}

export function hasInnerChamberAccess(
  user: VeilSessionUser | null | undefined,
): boolean {
  if (!user) return false;

  // Authorization seam for a future Inner Chamber permission
  // system. No member currently holds such an authorization, so
  // the Inner Chamber stays locked for everyone.
  return false;
}

export function getInnerChamberAccess(
  user: VeilSessionUser | null | undefined,
): InnerChamberAccess {
  const granted = hasInnerChamberAccess(user);
  return {
    granted,
    accessLevel: granted ? 'GRANTED' : 'NOT GRANTED',
    authorization: granted ? 'RECORDED' : 'NOT RECORDED',
    lastAccess: 'NO RECORD',
  };
}