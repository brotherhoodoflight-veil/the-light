// ============================================================
// VEIL — Protected Realms
// The Brotherhood of Light admits members and officers through
// two distinct protected domains within one application:
//
//   THE SANCTUARY      — the private domain of individual members
//   THE GRAND CHAMBER  — the restricted domain of entrusted
//                        officers and administrators
//
// Realm membership is derived EXCLUSIVELY from the server-side
// role of the authenticated account. It is the single authority
// both the login gateway and the route middleware consult. It
// must never be trusted to a client.
// ============================================================

import { Roles } from '../types';

export type ProtectedRealm = 'sanctuary' | 'grand-chamber';

/** Member-level roles admitted to the Sanctuary. */
const SANCTUARY_ROLES: ReadonlySet<string> = new Set([
  Roles.MEMBER,
  Roles.CANDIDATE,
]);

/** Officer/administrator roles admitted to the Grand Chamber. */
const GRAND_CHAMBER_ROLES: ReadonlySet<string> = new Set([
  Roles.AREOPAGUS,
  Roles.COUNTRY_INITIATOR,
  Roles.PREFECT,
  Roles.DIRECTORATE_OFFICER,
  Roles.MINERVAL_ASSEMBLY_OFFICER,
  Roles.INSINUATOR,
  Roles.SYSTEM_ADMINISTRATOR,
]);

export const REALMS: readonly ProtectedRealm[] = ['sanctuary', 'grand-chamber'];

export function isSanctuaryRole(role: string): boolean {
  return SANCTUARY_ROLES.has(role.toUpperCase());
}

export function isGrandChamberRole(role: string): boolean {
  return GRAND_CHAMBER_ROLES.has(role.toUpperCase());
}

export function roleBelongsToRealm(
  role: string,
  realm: ProtectedRealm,
): boolean {
  return realm === 'grand-chamber'
    ? isGrandChamberRole(role)
    : isSanctuaryRole(role);
}

/** Which realm a given server-side role is entitled to enter. */
export function realmForRole(role: string): ProtectedRealm | null {
  const upper = role.toUpperCase();
  if (GRAND_CHAMBER_ROLES.has(upper)) return 'grand-chamber';
  if (SANCTUARY_ROLES.has(upper)) return 'sanctuary';
  return null;
}

/** Normalizes an unknown realm value; unknown values fall back to the Sanctuary. */
export function normalizeRealm(value: unknown): ProtectedRealm {
  return value === 'grand-chamber' ? 'grand-chamber' : 'sanctuary';
}

/** Dignified, realm-specific authorization denial copy. */
export const REALM_DENIAL: Record<
  ProtectedRealm,
  { error: string; gateway: string }
> = {
  sanctuary: {
    error:
      'This account is not entrusted with entry to the Sanctuary.',
    gateway: 'SANCTUARY',
  },
  'grand-chamber': {
    error:
      'This account does not hold a seat in the Grand Chamber.',
    gateway: 'GRAND CHAMBER',
  },
};

/** Convenience for typed iteration when needed. */
export function isProtectedRealm(value: unknown): value is ProtectedRealm {
  return value === 'sanctuary' || value === 'grand-chamber';
}