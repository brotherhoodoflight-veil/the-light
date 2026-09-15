// ============================================================
// VEIL — Development Gateway Accounts
// WARNING: This is a DEVELOPMENT-ONLY identity store used to
// exercise role-aware paths until the real membership database
// and production authentication gateway are built.
//
// This file MUST be replaced by a database-backed gateway.
// It is deliberately isolated and clearly marked as non-production.
// ============================================================

import type { VeilSessionUser } from './session-types';
import { Roles, type Role } from '../types';

const DEV_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,p=4,t=3$+VT8Otp8BRePu5OMK6IEMg$QO8nVm/leA2aa30ijx2d+jjBpHQe5RxGcw1VGbJfvB0';

interface DevIdentity {
  memberId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  initials: string;
  status: VeilSessionUser['status'];
  title?: string;
  insinuatorName?: string;
  scope: VeilSessionUser['scope'];
  org?: VeilSessionUser['org'];
}

const DEV_IDENTITIES: DevIdentity[] = [
  {
    memberId: 'FR-2026-0001',
    email: 'kwame.mensah@veil.dev',
    firstName: 'Kwame',
    lastName: 'Mensah',
    role: Roles.MEMBER,
    initials: 'KM',
    status: 'ACTIVE',
    title: 'Brother',
    insinuatorName: 'Sefia Adjei',
    scope: {
      position: 'CELL',
      entityId: 'cell-phoenix-01',
      entityName: 'Phoenix Cell',
      countryId: 'GH',
      countryName: 'Ghana',
    },
    org: {
      countryName: 'Ghana',
      prefectureName: 'Accra Prefecture',
      directorateName: 'Luminari Directorate',
      assemblyName: 'Aurelia Assembly',
      cellName: 'Phoenix Cell',
    },
  },
  {
    memberId: 'FR-2026-0009',
    email: 'ama.serwah@veil.dev',
    firstName: 'Ama',
    lastName: 'Serwah',
    role: Roles.CANDIDATE,
    initials: 'AS',
    status: 'CANDIDATE',
    title: 'Aspirant',
    insinuatorName: 'Sefia Adjei',
    scope: {
      position: 'COUNTRY',
      entityId: 'GH',
      entityName: 'Ghana',
      countryId: 'GH',
      countryName: 'Ghana',
    },
    org: { countryName: 'Ghana' },
  },
  {
    memberId: 'FR-2001-0001',
    email: 'kwasi.amankwah@veil.dev',
    firstName: 'Kwasi',
    lastName: 'Amankwah',
    role: Roles.AREOPAGUS,
    initials: 'KA',
    status: 'ACTIVE',
    title: 'Brother',
    scope: {
      position: 'GLOBAL',
      entityId: 'GLOBAL',
      entityName: 'The Areopagus',
    },
  },
  {
    memberId: 'FR-2015-0012',
    email: 'efua.darko@veil.dev',
    firstName: 'Efua',
    lastName: 'Darko',
    role: Roles.COUNTRY_INITIATOR,
    initials: 'ED',
    status: 'ACTIVE',
    title: 'Country Initiator',
    scope: {
      position: 'COUNTRY',
      entityId: 'GH',
      entityName: 'Ghana',
      countryId: 'GH',
      countryName: 'Ghana',
    },
    org: { countryName: 'Ghana' },
  },
  {
    memberId: 'FR-2018-0044',
    email: 'nana.osei@veil.dev',
    firstName: 'Nana',
    lastName: 'Osei',
    role: Roles.PREFECT,
    initials: 'NO',
    status: 'ACTIVE',
    title: 'Prefect',
    scope: {
      position: 'PREFECTURE',
      entityId: 'pref-accra',
      entityName: 'Accra Prefecture',
      countryId: 'GH',
      countryName: 'Ghana',
    },
    org: {
      countryName: 'Ghana',
      prefectureName: 'Accra Prefecture',
    },
  },
  {
    memberId: 'FR-2019-0071',
    email: 'opoku.kumi@veil.dev',
    firstName: 'Opoku',
    lastName: 'Kumi',
    role: Roles.DIRECTORATE_OFFICER,
    initials: 'OK',
    status: 'ACTIVE',
    title: 'Directorate Officer',
    scope: {
      position: 'DIRECTORATE',
      entityId: 'dir-luminari',
      entityName: 'Luminari Directorate',
      countryId: 'GH',
      countryName: 'Ghana',
    },
    org: {
      countryName: 'Ghana',
      prefectureName: 'Accra Prefecture',
      directorateName: 'Luminari Directorate',
    },
  },
  {
    memberId: 'FR-2020-0102',
    email: 'adwoa.biney@veil.dev',
    firstName: 'Adwoa',
    lastName: 'Biney',
    role: Roles.MINERVAL_ASSEMBLY_OFFICER,
    initials: 'AB',
    status: 'ACTIVE',
    title: 'Assembly Officer',
    scope: {
      position: 'MINERVAL_ASSEMBLY',
      entityId: 'asm-aurelia',
      entityName: 'Aurelia Assembly',
      countryId: 'GH',
      countryName: 'Ghana',
    },
    org: {
      countryName: 'Ghana',
      prefectureName: 'Accra Prefecture',
      directorateName: 'Luminari Directorate',
      assemblyName: 'Aurelia Assembly',
    },
  },
  {
    memberId: 'FR-2017-0033',
    email: 'sefia.adjei@veil.dev',
    firstName: 'Sefia',
    lastName: 'Adjei',
    role: Roles.INSINUATOR,
    initials: 'SA',
    status: 'ACTIVE',
    title: 'Insinuator',
    scope: {
      position: 'MINERVAL_ASSEMBLY',
      entityId: 'asm-aurelia',
      entityName: 'Aurelia Assembly',
      countryId: 'GH',
      countryName: 'Ghana',
    },
    org: {
      countryName: 'Ghana',
      prefectureName: 'Accra Prefecture',
      directorateName: 'Luminari Directorate',
      assemblyName: 'Aurelia Assembly',
      cellName: 'Phoenix Cell',
    },
  },
  {
    memberId: 'SYS-0001',
    email: 'admin@veil.dev',
    firstName: 'Gatekeeper',
    lastName: 'Prime',
    role: Roles.SYSTEM_ADMINISTRATOR,
    initials: 'GP',
    status: 'ACTIVE',
    title: 'System Administration',
    scope: {
      position: 'GLOBAL',
      entityId: 'SYS',
      entityName: 'Technical Administration',
    },
  },
];

function buildSessionUser(identity: DevIdentity): VeilSessionUser {
  return {
    id: identity.memberId,
    memberId: identity.memberId,
    email: identity.email,
    firstName: identity.firstName,
    lastName: identity.lastName,
    role: identity.role,
    initials: identity.initials,
    status: identity.status,
    title: identity.title,
    insinuatorName: identity.insinuatorName,
    scope: identity.scope,
    org: identity.org,
    dev: true,
  };
}

export const DEV_USERS: VeilSessionUser[] = DEV_IDENTITIES.map(buildSessionUser);

export function findDevUser(identifier: string): VeilSessionUser | undefined {
  const value = identifier.trim().toLowerCase();
  return DEV_USERS.find(
    (user) =>
      user.memberId.toLowerCase() === value || user.email.toLowerCase() === value,
  );
}

export { DEV_PASSWORD_HASH };