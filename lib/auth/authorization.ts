// ============================================================
// VEIL — Authorization & Scope Utilities
// ============================================================

import {
  type Permission,
  type Role,
  type UserScope,
  type DashboardContext,
  Permissions as P,
  OrganizationalPositions as Pos,
} from '../types';

// --- Permission matrix: ROLE → PERMISSIONS ---
// System Administrator is deliberately NOT granted organizational
// authority. It is a purely technical role.

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  AREOPAGUS: [
    P.VIEW_ALL_MEMBERS,
    P.VIEW_ALL_CANDIDATES,
    P.MANAGE_GLOBAL_ORGANIZATIONS,
    P.MANAGE_COUNTRIES,
    P.MANAGE_COUNTRY_INITIATORS,
    P.MANAGE_PREFECTURES,
    P.MANAGE_DIRECTORATES,
    P.MANAGE_ASSEMBLIES,
    P.MANAGE_CELLS,
    P.VIEW_GLOBAL_REPORTS,
    P.VIEW_AUDIT_LOGS,
    P.CREATE_COUNTRY_ANNOUNCEMENTS,
    P.MANAGE_COUNTRY_EVENTS,
    P.VIEW_MESSAGES,
    P.SEND_MESSAGES,
    P.VIEW_COMMUNITY_ANNOUNCEMENTS,
    P.VIEW_COMMUNITY_EVENTS,
    P.VIEW_COMMUNITY_DOCUMENTS,
    P.VIEW_OWN_PROFILE,
    P.EDIT_OWN_PROFILE,
    P.VIEW_ORG_POSITION,
  ],

  COUNTRY_INITIATOR: [
    P.MANAGE_PREFECTURES,
    P.MANAGE_COUNTRY_MEMBERS,
    P.MANAGE_COUNTRY_CANDIDATES,
    P.MANAGE_DIRECTORATES,
    P.MANAGE_ASSEMBLIES,
    P.MANAGE_CELLS,
    P.VIEW_COUNTRY_REPORTS,
    P.CREATE_COUNTRY_ANNOUNCEMENTS,
    P.MANAGE_COUNTRY_EVENTS,
    P.SUBMIT_RECOMMENDATIONS,
    P.VIEW_MESSAGES,
    P.SEND_MESSAGES,
    P.VIEW_COMMUNITY_ANNOUNCEMENTS,
    P.VIEW_COMMUNITY_EVENTS,
    P.VIEW_COMMUNITY_DOCUMENTS,
    P.VIEW_OWN_PROFILE,
    P.EDIT_OWN_PROFILE,
    P.VIEW_ORG_POSITION,
  ],

  PREFECT: [
    P.MANAGE_DIRECTORATES,
    P.MANAGE_ASSEMBLIES,
    P.MANAGE_PREFECTURE_MEMBERS,
    P.MANAGE_PREFECTURE_CANDIDATES,
    P.MANAGE_CELLS,
    P.VIEW_PREFECTURE_REPORTS,
    P.CREATE_PREFECTURE_ANNOUNCEMENTS,
    P.SUBMIT_RECOMMENDATIONS,
    P.VIEW_MESSAGES,
    P.SEND_MESSAGES,
    P.VIEW_COMMUNITY_ANNOUNCEMENTS,
    P.VIEW_COMMUNITY_EVENTS,
    P.VIEW_COMMUNITY_DOCUMENTS,
    P.VIEW_OWN_PROFILE,
    P.EDIT_OWN_PROFILE,
    P.VIEW_ORG_POSITION,
  ],

  DIRECTORATE_OFFICER: [
    P.MANAGE_CELLS,
    P.MANAGE_DIRECTORATE_MEMBERS,
    P.VIEW_DIRECTORATE_REPORTS,
    P.CREATE_DIRECTORATE_ANNOUNCEMENTS,
    P.VIEW_MESSAGES,
    P.SEND_MESSAGES,
    P.VIEW_COMMUNITY_ANNOUNCEMENTS,
    P.VIEW_COMMUNITY_EVENTS,
    P.VIEW_COMMUNITY_DOCUMENTS,
    P.VIEW_OWN_PROFILE,
    P.EDIT_OWN_PROFILE,
    P.VIEW_ORG_POSITION,
  ],

  MINERVAL_ASSEMBLY_OFFICER: [
    P.VIEW_ASSEMBLY_MEMBERS,
    P.MANAGE_ASSEMBLY_EVENTS,
    P.VIEW_ASSEMBLY_DOCUMENTS,
    P.CREATE_ASSEMBLY_ANNOUNCEMENTS,
    P.VIEW_MESSAGES,
    P.SEND_MESSAGES,
    P.VIEW_COMMUNITY_ANNOUNCEMENTS,
    P.VIEW_COMMUNITY_EVENTS,
    P.VIEW_COMMUNITY_DOCUMENTS,
    P.VIEW_OWN_PROFILE,
    P.EDIT_OWN_PROFILE,
    P.VIEW_ORG_POSITION,
  ],

  INSINUATOR: [
    P.VIEW_ASSIGNED_CANDIDATES,
    P.VIEW_ASSIGNED_MEMBERS,
    P.SUBMIT_RECOMMENDATIONS,
    P.UPDATE_CANDIDATE_PROGRESS,
    P.VIEW_MESSAGES,
    P.SEND_MESSAGES,
    P.VIEW_COMMUNITY_ANNOUNCEMENTS,
    P.VIEW_COMMUNITY_EVENTS,
    P.VIEW_COMMUNITY_DOCUMENTS,
    P.VIEW_OWN_PROFILE,
    P.EDIT_OWN_PROFILE,
    P.VIEW_ORG_POSITION,
  ],

  MEMBER: [
    P.VIEW_OWN_PROFILE,
    P.EDIT_OWN_PROFILE,
    P.VIEW_ORG_POSITION,
    P.VIEW_COMMUNITY_ANNOUNCEMENTS,
    P.VIEW_COMMUNITY_EVENTS,
    P.VIEW_COMMUNITY_DOCUMENTS,
    P.SEND_MESSAGES,
    P.VIEW_MESSAGES,
  ],

  CANDIDATE: [
    P.VIEW_CANDIDATE_PROFILE,
    P.VIEW_OWN_INVITATION,
    P.VIEW_ASSIGNED_INSINUATOR,
    P.COMPLETE_REQUIRED_ACTIONS,
    P.VIEW_APPROVED_RESOURCES,
    P.VIEW_COMMUNITY_ANNOUNCEMENTS,
    P.VIEW_COMMUNITY_EVENTS,
    P.VIEW_MESSAGES,
  ],

  SYSTEM_ADMINISTRATOR: [
    P.MANAGE_USERS,
    P.VIEW_SYSTEM_ACTIVITY,
    P.MANAGE_SECURITY,
    P.VIEW_SECURITY_EVENTS,
    P.VIEW_AUDIT_LOGS,
    P.MANAGE_SYSTEM_SETTINGS,
    P.VIEW_OWN_PROFILE,
    P.EDIT_OWN_PROFILE,
  ],
};

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(
  role: Role,
  permission: Permission,
  permissions: Permission[] = getPermissionsForRole(role),
): boolean {
  return permissions.includes(permission);
}

// --- Organizational scope authority ---
// Determines whether the actor's scope encompasses the target scope.

const SCOPE_HIERARCHY: Record<UserScope['position'], number> = {
  GLOBAL: 6,
  COUNTRY: 5,
  PREFECTURE: 4,
  DIRECTORATE: 3,
  MINERVAL_ASSEMBLY: 3,
  CELL: 2,
};

export function scopeCovers(actor: UserScope, target: UserScope): boolean {
  const actorLevel = SCOPE_HIERARCHY[actor.position] ?? 0;
  const targetLevel = SCOPE_HIERARCHY[target.position] ?? 0;
  if (actorLevel < targetLevel) return false;
  if (actor.position === Pos.GLOBAL) return true;
  // Same position must match entity; different positions must match country lineage
  if (actor.position === target.position) return actor.entityId === target.entityId;
  return actor.countryId !== undefined && actor.countryId === target.countryId;
}

export function canAccessEntity(
  context: DashboardContext,
  targetScope: UserScope,
): boolean {
  return scopeCovers(context.user.scope, targetScope);
}

// --- Scope label, e.g., "Prefecture of Athena Lodge" ---

const SCOPE_LABELS: Record<UserScope['position'], string> = {
  GLOBAL: 'The Areopagus',
  COUNTRY: 'Country',
  PREFECTURE: 'Prefecture',
  DIRECTORATE: 'Directorate',
  MINERVAL_ASSEMBLY: 'Minerval Assembly',
  CELL: 'Cell',
};

export function scopeLabel(position: UserScope['position']): string {
  return SCOPE_LABELS[position] ?? 'Organization';
}

export function scopeTitle(scope: UserScope): string {
  return `${scopeLabel(scope.position)} · ${scope.entityName}`;
}