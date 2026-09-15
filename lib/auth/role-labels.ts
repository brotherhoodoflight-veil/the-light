// ============================================================
// VEIL — Role Display Labels
// ============================================================

import type { Role } from '../types';

const ROLE_LABELS: Record<Role, string> = {
  AREOPAGUS: 'Member of the Areopagus',
  COUNTRY_INITIATOR: 'Country Initiator',
  PREFECT: 'Prefect',
  DIRECTORATE_OFFICER: 'Directorate Officer',
  MINERVAL_ASSEMBLY_OFFICER: 'Minerval Assembly Officer',
  INSINUATOR: 'Insinuator',
  MEMBER: 'Member',
  CANDIDATE: 'Candidate',
  SYSTEM_ADMINISTRATOR: 'System Administration',
};

const ROLE_SHORT: Record<Role, string> = {
  AREOPAGUS: 'AREOPAGUS',
  COUNTRY_INITIATOR: 'COUNTRY INITIATOR',
  PREFECT: 'PREFECT',
  DIRECTORATE_OFFICER: 'DIRECTORATE OFFICER',
  MINERVAL_ASSEMBLY_OFFICER: 'ASSEMBLY OFFICER',
  INSINUATOR: 'INSINUATOR',
  MEMBER: 'MEMBER',
  CANDIDATE: 'CANDIDATE',
  SYSTEM_ADMINISTRATOR: 'SYSTEM ADMINISTRATION',
};

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? 'Member';
}

export function roleShortLabel(role: Role): string {
  return ROLE_SHORT[role] ?? 'MEMBER';
}