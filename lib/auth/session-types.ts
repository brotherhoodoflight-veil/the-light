// ============================================================
// VEIL — Session Types
// The typed identity carried within the signed session token.
// ============================================================

import type { DashboardUser } from '../types';

// --- Organizational lineage (only populated when authenticated context has it) ---

export interface VeilOrgContext {
  countryName?: string;
  prefectureName?: string;
  directorateName?: string;
  assemblyName?: string;
  cellName?: string;
}

export type MembershipStatus =
  | 'ACTIVE'
  | 'CANDIDATE'
  | 'RESTRICTED'
  | 'ARCHIVED';

// --- Authenticated user carried in the session ---

export interface VeilSessionUser extends DashboardUser {
  memberId: string;
  status: MembershipStatus;
  title?: string;
  insinuatorName?: string;
  org?: VeilOrgContext;
  /** Full name exactly as recorded in the membership registry. */
  fullName?: string;
  /** Registry classification, e.g. "LIFE MEMBER". */
  membershipType?: string;
  /** Country of record. */
  country?: string;
  /** The Country Initiator who brought the member behind the veil. */
  countryInitiator?: string;
  /** Year the recorded initiation journey began. Not the full-membership date. */
  journeyStartedYear?: number;
  /** Year the member was formally approved for full membership. */
  formalApprovalYear?: number;
  /** Year full membership was entered into the official registry. */
  fullMembershipYear?: number;
  /** Official membership photograph. Read-only for the member; only
   *  administration may change or remove it. */
  photoUrl?: string;
  /** Marks development-gateway sessions. Never true in a production gateway. */
  dev?: boolean;
}