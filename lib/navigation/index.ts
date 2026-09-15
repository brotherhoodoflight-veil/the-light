// ============================================================
// VEIL — Navigation Configuration
// Each role has its own menu structure.
// ============================================================

import {
  type NavGroup,
  type NavItem,
  type Role,
  Permissions as P,
} from '../types';

interface RoleNavigation {
  groups: NavGroup[];
}

function item(
  label: string,
  href: string,
  requiredPermissions: NavItem['requiredPermissions'] = [],
  icon?: string,
): NavItem {
  return { label, href, requiredPermissions, ...(icon ? { icon } : {}) };
}

const LEGACY_ITEMS: NavGroup = {
  title: 'SECONDARY',
  items: [
    item('My Profile', '/dashboard/profile', [P.VIEW_OWN_PROFILE]),
    item('Settings', '/dashboard/settings', [P.VIEW_OWN_PROFILE]),
  ],
};

const COMMUNITY_ITEMS: NavGroup = {
  title: 'COMMUNITY',
  items: [
    item('Announcements', '/dashboard/announcements', [P.VIEW_COMMUNITY_ANNOUNCEMENTS]),
    item('Assemblies', '/dashboard/assemblies', [P.VIEW_COMMUNITY_EVENTS]),
    item('Messages', '/dashboard/messages', [P.VIEW_MESSAGES]),
    item('Documents', '/dashboard/documents', [P.VIEW_COMMUNITY_DOCUMENTS]),
  ],
};

const AREOPAGUS_NAV: RoleNavigation = {
  groups: [
    {
      title: 'OVERVIEW',
      items: [item('Dashboard', '/dashboard', [])],
    },
    {
      title: 'GLOBAL ADMINISTRATION',
      items: [
        item('Members', '/dashboard/members', [P.VIEW_ALL_MEMBERS]),
        item('Candidates', '/dashboard/candidates', [P.VIEW_ALL_CANDIDATES]),
        item('Countries', '/dashboard/organizations/countries', [P.MANAGE_COUNTRIES]),
        item('Country Initiators', '/dashboard/organizations/country-initiators', [P.MANAGE_COUNTRY_INITIATORS]),
        item('Prefectures', '/dashboard/organizations/prefectures', [P.MANAGE_PREFECTURES]),
        item('Directorates', '/dashboard/organizations/directorates', [P.MANAGE_DIRECTORATES]),
        item('Minerval Assemblies', '/dashboard/organizations/assemblies', [P.MANAGE_ASSEMBLIES]),
        item('Cells', '/dashboard/organizations/cells', [P.MANAGE_CELLS]),
        item('Insinuators', '/dashboard/organizations/insinuators', [P.VIEW_ALL_MEMBERS]),
      ],
    },
    {
      title: 'GOVERNANCE',
      items: [
        item('Appointments', '/dashboard/appointments', [P.MANAGE_COUNTRY_INITIATORS]),
        item('Promotions', '/dashboard/promotions', [P.MANAGE_COUNTRY_INITIATORS]),
        item('Membership History', '/dashboard/history', [P.VIEW_ALL_MEMBERS]),
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        item('Global Announcements', '/dashboard/announcements', [P.CREATE_COUNTRY_ANNOUNCEMENTS]),
        item('Assemblies', '/dashboard/assemblies', [P.MANAGE_COUNTRY_EVENTS]),
        item('Messages', '/dashboard/messages', [P.VIEW_MESSAGES]),
        item('Documents', '/dashboard/documents', [P.VIEW_COMMUNITY_DOCUMENTS]),
      ],
    },
    {
      title: 'OVERSIGHT',
      items: [
        item('Reports', '/dashboard/reports', [P.VIEW_GLOBAL_REPORTS]),
        item('Audit Logs', '/dashboard/security', [P.VIEW_AUDIT_LOGS]),
        item('System Activity', '/dashboard/security/activity', [P.VIEW_SECURITY_EVENTS]),
      ],
    },
    LEGACY_ITEMS,
  ],
};

const COUNTRY_INITIATOR_NAV: RoleNavigation = {
  groups: [
    {
      title: 'OVERVIEW',
      items: [item('Country Dashboard', '/dashboard', [])],
    },
    {
      title: 'COUNTRY ADMINISTRATION',
      items: [
        item('Members', '/dashboard/members', [P.MANAGE_COUNTRY_MEMBERS]),
        item('Candidates', '/dashboard/candidates', [P.MANAGE_COUNTRY_CANDIDATES]),
        item('Prefectures', '/dashboard/organizations/prefectures', [P.MANAGE_PREFECTURES]),
        item('Directorates', '/dashboard/organizations/directorates', [P.MANAGE_DIRECTORATES]),
        item('Minerval Assemblies', '/dashboard/organizations/assemblies', [P.MANAGE_ASSEMBLIES]),
        item('Cells', '/dashboard/organizations/cells', [P.MANAGE_CELLS]),
        item('Insinuators', '/dashboard/organizations/insinuators', [P.MANAGE_COUNTRY_MEMBERS]),
      ],
    },
    {
      title: 'GOVERNANCE',
      items: [
        item('Recommendations', '/dashboard/recommendations', [P.MANAGE_COUNTRY_CANDIDATES]),
        item('Promotions', '/dashboard/promotions', [P.MANAGE_COUNTRY_MEMBERS]),
        item('Appointments', '/dashboard/appointments', [P.MANAGE_PREFECTURES]),
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        item('Announcements', '/dashboard/announcements', [P.CREATE_COUNTRY_ANNOUNCEMENTS]),
        item('Assemblies', '/dashboard/assemblies', [P.MANAGE_COUNTRY_EVENTS]),
        item('Messages', '/dashboard/messages', [P.VIEW_MESSAGES]),
        item('Documents', '/dashboard/documents', [P.VIEW_COMMUNITY_DOCUMENTS]),
      ],
    },
    {
      title: 'OVERSIGHT',
      items: [item('Reports', '/dashboard/reports', [P.VIEW_COUNTRY_REPORTS])],
    },
    LEGACY_ITEMS,
  ],
};

const PREFECT_NAV: RoleNavigation = {
  groups: [
    {
      title: 'OVERVIEW',
      items: [item('Prefecture Dashboard', '/dashboard', [])],
    },
    {
      title: 'PREFECTURE',
      items: [
        item('Members', '/dashboard/members', [P.MANAGE_PREFECTURE_MEMBERS]),
        item('Candidates', '/dashboard/candidates', [P.MANAGE_PREFECTURE_CANDIDATES]),
        item('Directorates', '/dashboard/organizations/directorates', [P.MANAGE_DIRECTORATES]),
        item('Minerval Assemblies', '/dashboard/organizations/assemblies', [P.MANAGE_ASSEMBLIES]),
        item('Cells', '/dashboard/organizations/cells', [P.MANAGE_CELLS]),
        item('Insinuators', '/dashboard/organizations/insinuators', [P.MANAGE_PREFECTURE_MEMBERS]),
        item('Recommendations', '/dashboard/recommendations', [P.MANAGE_PREFECTURE_CANDIDATES]),
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        item('Announcements', '/dashboard/announcements', [P.CREATE_PREFECTURE_ANNOUNCEMENTS]),
        item('Assemblies', '/dashboard/assemblies', [P.MANAGE_ASSEMBLY_EVENTS]),
        item('Messages', '/dashboard/messages', [P.VIEW_MESSAGES]),
      ],
    },
    {
      title: 'OVERSIGHT',
      items: [item('Reports', '/dashboard/reports', [P.VIEW_PREFECTURE_REPORTS])],
    },
    LEGACY_ITEMS,
  ],
};

const DIRECTORATE_OFFICER_NAV: RoleNavigation = {
  groups: [
    {
      title: 'OVERVIEW',
      items: [item('Directorate Dashboard', '/dashboard', [])],
    },
    {
      title: 'DIRECTORATE',
      items: [
        item('Members', '/dashboard/members', [P.MANAGE_DIRECTORATE_MEMBERS]),
        item('Cells', '/dashboard/organizations/cells', [P.MANAGE_CELLS]),
        item('Insinuators', '/dashboard/organizations/insinuators', [P.MANAGE_DIRECTORATE_MEMBERS]),
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        item('Announcements', '/dashboard/announcements', [P.CREATE_DIRECTORATE_ANNOUNCEMENTS]),
        item('Assemblies', '/dashboard/assemblies', [P.MANAGE_ASSEMBLY_EVENTS]),
        item('Messages', '/dashboard/messages', [P.VIEW_MESSAGES]),
      ],
    },
    {
      title: 'OVERSIGHT',
      items: [item('Reports', '/dashboard/reports', [P.VIEW_DIRECTORATE_REPORTS])],
    },
    LEGACY_ITEMS,
    COMMUNITY_ITEMS,
  ],
};

const MINERVAL_NAV: RoleNavigation = {
  groups: [
    {
      title: 'OVERVIEW',
      items: [item('Assembly Dashboard', '/dashboard', [])],
    },
    {
      title: 'ASSEMBLY',
      items: [item('Members', '/dashboard/members', [P.VIEW_ASSEMBLY_MEMBERS])],
    },
    {
      title: 'COMMUNICATION',
      items: [
        item('Announcements', '/dashboard/announcements', [P.CREATE_ASSEMBLY_ANNOUNCEMENTS]),
        item('Assemblies', '/dashboard/assemblies', [P.MANAGE_ASSEMBLY_EVENTS]),
        item('Messages', '/dashboard/messages', [P.VIEW_MESSAGES]),
        item('Documents', '/dashboard/documents', [P.VIEW_ASSEMBLY_DOCUMENTS]),
      ],
    },
    {
      title: 'OVERSIGHT',
      items: [item('Reports', '/dashboard/reports', [P.VIEW_DIRECTORATE_REPORTS])],
    },
    LEGACY_ITEMS,
    COMMUNITY_ITEMS,
  ],
};

const INSINUATOR_NAV: RoleNavigation = {
  groups: [
    {
      title: 'OVERVIEW',
      items: [item('Mentorship Dashboard', '/dashboard', [])],
    },
    {
      title: 'MENTORSHIP',
      items: [
        item('Assigned Candidates', '/dashboard/candidates', [P.VIEW_ASSIGNED_CANDIDATES]),
        item('Assigned Members', '/dashboard/members', [P.VIEW_ASSIGNED_MEMBERS]),
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        item('Announcements', '/dashboard/announcements', [P.VIEW_COMMUNITY_ANNOUNCEMENTS]),
        item('Assemblies', '/dashboard/assemblies', [P.VIEW_COMMUNITY_EVENTS]),
        item('Messages', '/dashboard/messages', [P.VIEW_MESSAGES]),
        item('Documents', '/dashboard/documents', [P.VIEW_COMMUNITY_DOCUMENTS]),
      ],
    },
    LEGACY_ITEMS,
  ],
};

const MEMBER_NAV: RoleNavigation = {
  groups: [
    {
      title: 'MY VEIL',
      items: [item('Overview', '/dashboard', [])],
    },
    {
      title: 'THE BROTHERHOOD',
      items: [
        item('Announcements', '/dashboard/announcements', [P.VIEW_COMMUNITY_ANNOUNCEMENTS]),
        item('Assemblies', '/dashboard/assemblies', [P.VIEW_COMMUNITY_EVENTS]),
        item('Messages', '/dashboard/messages', [P.VIEW_MESSAGES]),
        item('Documents', '/dashboard/documents', [P.VIEW_COMMUNITY_DOCUMENTS]),
      ],
    },
    {
      title: 'MY JOURNEY',
      items: [
        item('My Membership', '/dashboard/membership', [P.VIEW_OWN_PROFILE]),
        item('My Profile', '/dashboard/profile', [P.VIEW_OWN_PROFILE]),
        item('The Path', '/dashboard/path', []),
      ],
    },
    {
      title: 'THE CODEX',
      items: [
        item('What We Serve', '/dashboard/codex/what-we-serve', []),
        item('What We Believe', '/dashboard/codex/what-we-believe', []),
        item('Secret Rules', '/dashboard/codex/secret-rules', []),
        item('The Oath', '/dashboard/codex/the-oath', []),
        item('Conduct & Discipline', '/dashboard/codex/conduct', []),
      ],
    },
    {
      title: 'THE ARCHIVES',
      items: [
        item('Brotherhood History', '/dashboard/archives/history', []),
        item('Symbols & Sigils', '/dashboard/archives/symbols', []),
        item('Historical Records', '/dashboard/archives/records', []),
      ],
    },
    {
      title: 'INNER CHAMBER',
      restricted: true,
      items: [
        item('Restricted Access', '/dashboard/inner-chamber', [], '◈'),
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        item('Settings', '/dashboard/settings', [P.VIEW_OWN_PROFILE]),
      ],
    },
  ],
};

const CANDIDATE_NAV: RoleNavigation = {
  groups: [
    {
      title: 'CANDIDATE',
      items: [
        item('My VEIL', '/dashboard', []),
        item('My Profile', '/dashboard/profile', [P.VIEW_CANDIDATE_PROFILE]),
      ],
    },
    {
      title: 'PATH',
      items: [
        item('Required Actions', '/dashboard/actions', [P.COMPLETE_REQUIRED_ACTIONS]),
        item('My Insinuator', '/dashboard/mentor', [P.VIEW_ASSIGNED_INSINUATOR]),
      ],
    },
    {
      title: 'APPROVED',
      items: [
        item('Announcements', '/dashboard/announcements', [P.VIEW_COMMUNITY_ANNOUNCEMENTS]),
        item('Assemblies', '/dashboard/assemblies', [P.VIEW_COMMUNITY_EVENTS]),
        item('Messages', '/dashboard/messages', [P.VIEW_MESSAGES]),
        item('Resources', '/dashboard/documents', [P.VIEW_APPROVED_RESOURCES]),
      ],
    },
    LEGACY_ITEMS,
  ],
};

const SYSTEM_ADMIN_NAV: RoleNavigation = {
  groups: [
    {
      title: 'OVERVIEW',
      items: [item('Dashboard', '/dashboard', [])],
    },
    {
      title: 'SYSTEM',
      items: [
        item('Users', '/dashboard/users', [P.MANAGE_USERS]),
        item('Security', '/dashboard/security', [P.MANAGE_SECURITY]),
        item('Activity', '/dashboard/security/activity', [P.VIEW_SYSTEM_ACTIVITY]),
        item('Audit Logs', '/dashboard/security/audit', [P.VIEW_AUDIT_LOGS]),
        item('Settings', '/dashboard/settings', [P.MANAGE_SYSTEM_SETTINGS]),
      ],
    },
  ],
};

const NAVIGATION: Record<Role, RoleNavigation> = {
  AREOPAGUS: AREOPAGUS_NAV,
  COUNTRY_INITIATOR: COUNTRY_INITIATOR_NAV,
  PREFECT: PREFECT_NAV,
  DIRECTORATE_OFFICER: DIRECTORATE_OFFICER_NAV,
  MINERVAL_ASSEMBLY_OFFICER: MINERVAL_NAV,
  INSINUATOR: INSINUATOR_NAV,
  MEMBER: MEMBER_NAV,
  CANDIDATE: CANDIDATE_NAV,
  SYSTEM_ADMINISTRATOR: SYSTEM_ADMIN_NAV,
};

export function getNavigationForRole(role: Role): NavGroup[] {
  return NAVIGATION[role]?.groups ?? [];
}

export { NAVIGATION };