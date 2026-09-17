// ============================================================
// VEIL — The Assemblies · Server Access Control
// Server-only authority checks for the Assemblies register.
// MUST NOT be imported from a client component.
//
// RULES:
//   • Access is decided here, server-side, on every request —
//     never by hiding UI.
//   • BROTHERHOOD  — every active Brother.
//   • COUNTRY      — active Brothers of the assembly's country.
//   • INVITED      — only members named in the call.
//   • RESTRICTED / INNER — only members granted a seat by
//     authority (SEATED), plus the presiding and issuing officers.
//   • Recognized Brotherhood officers may open and record any
//     chamber; they see the register to maintain it.
// ============================================================

import type { Role } from '../types';
import type {
  AssemblyAccessLevel,
  AssemblyResponse,
  AssemblySeat,
  AssemblyStatus,
} from './types';

/** Roles regarded as Assembly officers for register maintenance. */
const OFFICER_ROLES: ReadonlySet<string> = new Set<string>([
  'AREOPAGUS',
  'COUNTRY_INITIATOR',
  'PREFECT',
  'DIRECTORATE_OFFICER',
  'MINERVAL_ASSEMBLY_OFFICER',
]);

export function isAssemblyOfficer(role: Role | string): boolean {
  return OFFICER_ROLES.has(role);
}

export interface MemberAccessIdentity {
  memberId: string;
  status: string;
  role: Role | string;
  country: string | null;
}

export interface AssemblyAccessState {
  id: string;
  accessLevel: AssemblyAccessLevel;
  status: AssemblyStatus;
  country: string | null;
  presidingMemberId: string | null;
  issuedByMemberId: string | null;
}

export interface SeatAccessState {
  seat: AssemblySeat;
  response: AssemblyResponse;
  isRemoved: boolean;
}

export function countryMatches(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Whether the member may see this assembly at all. Every Assembly
 * shown to a member passes this check first, server-side.
 */
export function canViewAssembly(
  assembly: AssemblyAccessState,
  identity: MemberAccessIdentity,
  seat: SeatAccessState | null,
): boolean {
  if (isAssemblyOfficer(identity.role)) return true;
  if (identity.status !== 'ACTIVE') return false;
  if (
    identity.memberId === assembly.presidingMemberId ||
    identity.memberId === assembly.issuedByMemberId
  ) {
    return true;
  }

  switch (assembly.accessLevel) {
    case 'BROTHERHOOD':
      return true;
    case 'COUNTRY':
      return countryMatches(assembly.country, identity.country);
    case 'INVITED':
      return seat !== null && !seat.isRemoved;
    case 'RESTRICTED':
    case 'INNER':
      return seat !== null && !seat.isRemoved && seat.seat === 'SEATED';
    default:
      return false;
  }
}

/** Whether a summon may still be answered (the response window). */
export function isResponseWindowOpen(status: AssemblyStatus): boolean {
  return status === 'CALLED' || status === 'ANNOUNCED';
}

export type RespondPermission =
  | 'RESPOND' // window open, no final answer yet
  | 'RECORDED' // a final answer is already recorded
  | 'CLOSED' // outside the response window
  | 'FORBIDDEN'; // not authorized to answer this call

export function canRespondToCall(
  assembly: AssemblyAccessState,
  identity: MemberAccessIdentity,
  seat: SeatAccessState | null,
): RespondPermission {
  if (!canViewAssembly(assembly, identity, seat)) return 'FORBIDDEN';
  if (!isResponseWindowOpen(assembly.status)) return 'CLOSED';
  if (seat && seat.response !== 'PENDING' && !seat.isRemoved) return 'RECORDED';
  return 'RESPOND';
}