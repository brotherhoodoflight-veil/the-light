// ============================================================
// VEIL — Member Record → Session Mapping
// Converts a real database Member record into a VeilSessionUser
// so the dashboard renders genuine registry data. Fields with no
// assigned value remain absent (rendered as "not assigned").
// ============================================================

import { type Member } from '../db';
import { Roles } from '../types';
import { memberInitials, memberPhotoPath } from '../member-name';
import type { VeilSessionUser } from './session-types';

function normalizeStatus(status: string): VeilSessionUser['status'] {
  if (status === 'ACTIVE') return 'ACTIVE';
  if (status === 'CANDIDATE') return 'CANDIDATE';
  if (status === 'RESTRICTED') return 'RESTRICTED';
  return 'ARCHIVED';
}

function normalizeRole(role: string): VeilSessionUser['role'] {
  const upper = role.toUpperCase();
  if ((Object.values(Roles) as string[]).includes(upper)) {
    return upper as VeilSessionUser['role'];
  }
  return Roles.MEMBER;
}

/**
 * Builds the session identity for a database-authenticated member.
 * The member's organizational scope defaults to COUNTRY (their
 * country of record) because no lower-level seat is assigned in
 * the registry yet. Prefecture, Directorate, Minerval Assembly,
 * Cell, and Insinuator remain not-assigned until the database
 * genuinely holds those assignments.
 */
export function memberToSessionUser(member: Member): VeilSessionUser {
  return {
    id: member.memberId,
    memberId: member.memberId,
    email: member.email ?? '',
    firstName: member.firstName,
    lastName: member.lastName,
    fullName: member.fullName,
    role: normalizeRole(member.role),
    initials: memberInitials(member.firstName, member.middleName, member.lastName),
    photoUrl: memberPhotoPath(member.memberId),
    status: normalizeStatus(member.status),
    title: 'Brother',
    membershipType: member.membershipType,
    country: member.country,
    countryInitiator: member.countryInitiator ?? undefined,
    journeyStartedYear: member.journeyStartedYear ?? undefined,
    formalApprovalYear: member.formalApprovalYear ?? undefined,
    fullMembershipYear: member.fullMembershipYear ?? undefined,
    insinuatorName: member.insinuatorName ?? undefined,
    org: {
      countryName: member.country,
    },
    scope: {
      position: 'COUNTRY',
      entityId: 'GH',
      entityName: member.country,
      countryId: 'GH',
      countryName: member.country,
    },
    dev: false,
  };
}