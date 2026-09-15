// ============================================================
// VEIL — Type Definitions
// The Brotherhood of Light
// ============================================================

// --- Roles ---

export const Roles = {
  AREOPAGUS: 'AREOPAGUS',
  COUNTRY_INITIATOR: 'COUNTRY_INITIATOR',
  PREFECT: 'PREFECT',
  DIRECTORATE_OFFICER: 'DIRECTORATE_OFFICER',
  MINERVAL_ASSEMBLY_OFFICER: 'MINERVAL_ASSEMBLY_OFFICER',
  INSINUATOR: 'INSINUATOR',
  MEMBER: 'MEMBER',
  CANDIDATE: 'CANDIDATE',
  SYSTEM_ADMINISTRATOR: 'SYSTEM_ADMINISTRATOR',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

// --- Organizational Positions ---

export const OrganizationalPositions = {
  CELL: 'CELL',
  MINERVAL_ASSEMBLY: 'MINERVAL_ASSEMBLY',
  DIRECTORATE: 'DIRECTORATE',
  PREFECTURE: 'PREFECTURE',
  COUNTRY: 'COUNTRY',
  GLOBAL: 'GLOBAL',
} as const;

export type OrganizationalPosition =
  (typeof OrganizationalPositions)[keyof typeof OrganizationalPositions];

// --- User Scope ---
// Defines the organizational boundary a user can access.

export interface UserScope {
  /** The highest organizational level this user can access */
  position: OrganizationalPosition;
  /** ID of the entity at this scope level (e.g., countryId, prefectureId) */
  entityId: string;
  /** Human-readable name of the entity */
  entityName: string;
  /** Country context — always present for non-Areopagus users */
  countryId?: string;
  countryName?: string;
}

// --- Permissions ---

export const Permissions = {
  // Global Administration
  MANAGE_GLOBAL_ORGANIZATIONS: 'MANAGE_GLOBAL_ORGANIZATIONS',
  MANAGE_COUNTRIES: 'MANAGE_COUNTRIES',
  MANAGE_COUNTRY_INITIATORS: 'MANAGE_COUNTRY_INITIATORS',
  VIEW_ALL_MEMBERS: 'VIEW_ALL_MEMBERS',
  VIEW_ALL_CANDIDATES: 'VIEW_ALL_CANDIDATES',
  VIEW_GLOBAL_REPORTS: 'VIEW_GLOBAL_REPORTS',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  MANAGE_SYSTEM_SETTINGS: 'MANAGE_SYSTEM_SETTINGS',

  // Country-Level
  MANAGE_PREFECTURES: 'MANAGE_PREFECTURES',
  MANAGE_COUNTRY_MEMBERS: 'MANAGE_COUNTRY_MEMBERS',
  MANAGE_COUNTRY_CANDIDATES: 'MANAGE_COUNTRY_CANDIDATES',
  VIEW_COUNTRY_REPORTS: 'VIEW_COUNTRY_REPORTS',
  CREATE_COUNTRY_ANNOUNCEMENTS: 'CREATE_COUNTRY_ANNOUNCEMENTS',
  MANAGE_COUNTRY_EVENTS: 'MANAGE_COUNTRY_EVENTS',

  // Prefecture-Level
  MANAGE_DIRECTORATES: 'MANAGE_DIRECTORATES',
  MANAGE_ASSEMBLIES: 'MANAGE_ASSEMBLIES',
  MANAGE_PREFECTURE_MEMBERS: 'MANAGE_PREFECTURE_MEMBERS',
  MANAGE_PREFECTURE_CANDIDATES: 'MANAGE_PREFECTURE_CANDIDATES',
  VIEW_PREFECTURE_REPORTS: 'VIEW_PREFECTURE_REPORTS',
  CREATE_PREFECTURE_ANNOUNCEMENTS: 'CREATE_PREFECTURE_ANNOUNCEMENTS',

  // Directorate-Level
  MANAGE_CELLS: 'MANAGE_CELLS',
  MANAGE_DIRECTORATE_MEMBERS: 'MANAGE_DIRECTORATE_MEMBERS',
  VIEW_DIRECTORATE_REPORTS: 'VIEW_DIRECTORATE_REPORTS',
  CREATE_DIRECTORATE_ANNOUNCEMENTS: 'CREATE_DIRECTORATE_ANNOUNCEMENTS',

  // Assembly-Level
  VIEW_ASSEMBLY_MEMBERS: 'VIEW_ASSEMBLY_MEMBERS',
  MANAGE_ASSEMBLY_EVENTS: 'MANAGE_ASSEMBLY_EVENTS',
  VIEW_ASSEMBLY_DOCUMENTS: 'VIEW_ASSEMBLY_DOCUMENTS',
  CREATE_ASSEMBLY_ANNOUNCEMENTS: 'CREATE_ASSEMBLY_ANNOUNCEMENTS',

  // Insinuator/Mentor
  VIEW_ASSIGNED_CANDIDATES: 'VIEW_ASSIGNED_CANDIDATES',
  VIEW_ASSIGNED_MEMBERS: 'VIEW_ASSIGNED_MEMBERS',
  SUBMIT_RECOMMENDATIONS: 'SUBMIT_RECOMMENDATIONS',
  UPDATE_CANDIDATE_PROGRESS: 'UPDATE_CANDIDATE_PROGRESS',

  // Member
  VIEW_OWN_PROFILE: 'VIEW_OWN_PROFILE',
  EDIT_OWN_PROFILE: 'EDIT_OWN_PROFILE',
  VIEW_ORG_POSITION: 'VIEW_ORG_POSITION',
  VIEW_COMMUNITY_ANNOUNCEMENTS: 'VIEW_COMMUNITY_ANNOUNCEMENTS',
  VIEW_COMMUNITY_EVENTS: 'VIEW_COMMUNITY_EVENTS',
  VIEW_COMMUNITY_DOCUMENTS: 'VIEW_COMMUNITY_DOCUMENTS',
  SEND_MESSAGES: 'SEND_MESSAGES',
  VIEW_MESSAGES: 'VIEW_MESSAGES',

  // Candidate (restricted)
  VIEW_CANDIDATE_PROFILE: 'VIEW_CANDIDATE_PROFILE',
  VIEW_OWN_INVITATION: 'VIEW_OWN_INVITATION',
  VIEW_ASSIGNED_INSINUATOR: 'VIEW_ASSIGNED_INSINUATOR',
  COMPLETE_REQUIRED_ACTIONS: 'COMPLETE_REQUIRED_ACTIONS',
  VIEW_APPROVED_RESOURCES: 'VIEW_APPROVED_RESOURCES',

  // System Administration
  MANAGE_USERS: 'MANAGE_USERS',
  VIEW_SYSTEM_ACTIVITY: 'VIEW_SYSTEM_ACTIVITY',
  MANAGE_SECURITY: 'MANAGE_SECURITY',
  VIEW_SECURITY_EVENTS: 'VIEW_SECURITY_EVENTS',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

// --- Navigation ---

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  /** If true, this item only appears in the mobile menu */
  mobileOnly?: boolean;
  /** Permissions required to see this item */
  requiredPermissions: Permission[];
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
  /** Marks a chamber of restricted appearance (e.g. INNER CHAMBER). */
  restricted?: boolean;
}

// --- Dashboard Overview Cards ---

export interface StatCard {
  label: string;
  value: string | number;
  /** Optional secondary label (e.g., "+12 this month") */
  subtitle?: string;
  /** Route link when card is clicked */
  href?: string;
}

// --- Activity Feed ---

export interface ActivityItem {
  id: string;
  type: 'member_joined' | 'candidate_recommended' | 'promotion' | 'appointment' | 'event' | 'announcement' | 'message' | 'system';
  title: string;
  description: string;
  timestamp: string;
  /** User who performed the action */
  actorId?: string;
  actorName?: string;
}

// --- Dashboard Context ---

export interface DashboardUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  scope: UserScope;
  avatarUrl?: string;
  initials: string;
}

export interface DashboardContext {
  user: DashboardUser;
  permissions: Permission[];
}
