"use client";

// ============================================================
// VEIL — Dashboard Overview
// The inner chamber. Role-aware welcome, statistics bound to
// the authenticated context, hierarchy, quick actions, and
// honest empty states until real data systems are connected.
//
// For MEMBER-role sessions the overview resolves around the
// member's own registry record (MY MEMBERSHIP / MY BROTHERHOOD /
// COMMUNITY), surfaced through the database-backed identity.
// ============================================================

import { useSession } from '../../lib/auth/session-provider';
import { roleLabel } from '../../lib/auth/role-labels';
import type { StatCard as StatCardData } from '../../lib/types';
import type { VeilSessionUser } from '../../lib/auth/session-types';
import StatCard from './components/StatCard';
import HierarchyPanel from './components/HierarchyPanel';
import QuickActions from './components/QuickActions';
import AnnouncementsPanel from './components/AnnouncementsPanel';
import ActivityPanel from './components/ActivityPanel';
import AssembliesPanel from './components/AssembliesPanel';
import {
  MemberMembershipPanel,
  MemberBrotherhoodPanel,
  MemberCommunityPanel,
  MemberCurrentStationPanel,
  MembershipStatusPanel,
  memberRecordViewFromSession,
} from './components/MemberPanels';

const AWAITING = '—';

function greetingFor(user: VeilSessionUser): { eyebrow: string; title: string; line: string } {
  if (user.role === 'MEMBER') {
    return {
      eyebrow: 'WELCOME WITHIN THE VEIL',
      title: user.fullName ?? `${user.firstName} ${user.lastName}`,
      line: 'Your membership is recorded. Your station within the order and the fellowship about you are shown below.',
    };
  }
  if (user.role === 'CANDIDATE') {
    return {
      eyebrow: 'WELCOME WITHIN THE VEIL',
      title: `${user.firstName} ${user.lastName}`,
      line: 'Your candidacy is recorded. Your path, your insinuator, and the resources approved for you await inside.',
    };
  }
  if (user.role === 'SYSTEM_ADMINISTRATOR') {
    return {
      eyebrow: 'WELCOME WITHIN THE VEIL',
      title: `${user.firstName} ${user.lastName}`,
      line: 'You hold no organizational office. Your station concerns the machinery of the order alone.',
    };
  }
  return {
    eyebrow: 'WELCOME WITHIN THE VEIL',
    title: `${user.title ?? 'Brother'} ${user.lastName}`,
    line: 'You have passed through the veil. Your station within the order and the fellowship about you are shown below.',
  };
}

function heroOrder(user: VeilSessionUser): string {
  if (user.role === 'MEMBER' && user.membershipType) {
    return `${roleLabel(user.role).toUpperCase()} · ${user.membershipType.toUpperCase()}`;
  }
  return `${roleLabel(user.role).toUpperCase()} · THE BROTHERHOOD OF LIGHT`;
}

function memberTags(user: VeilSessionUser): { key: string; label: string }[] {
  const tags: { key: string; label: string }[] = [];
  if (user.memberId) tags.push({ key: 'id', label: user.memberId });
  if (user.status) tags.push({ key: 'status', label: user.status });
  const country = user.country ?? user.org?.countryName ?? user.scope.countryName;
  if (country) tags.push({ key: 'country', label: country.toUpperCase() });
  return tags;
}

function buildStats(user: VeilSessionUser): StatCardData[] {
  switch (user.role) {
    case 'MEMBER':
      return [
        { label: 'MEMBERSHIP ID', value: user.memberId || AWAITING, subtitle: 'Historical registry number' },
        { label: 'MEMBERSHIP TYPE', value: user.membershipType ?? AWAITING, subtitle: 'Registry classification' },
        { label: 'MEMBERSHIP STATUS', value: user.status ?? AWAITING, subtitle: 'In good standing' },
        { label: 'COUNTRY', value: user.country ?? user.org?.countryName ?? user.scope.countryName ?? AWAITING, subtitle: 'Country of record' },
      ];
    case 'CANDIDATE':
      return [
        { label: 'CANDIDACY', value: user.status, subtitle: 'Registered path' },
        { label: 'INSINUATOR', value: user.insinuatorName ?? AWAITING, subtitle: user.insinuatorName ? 'Assigned guide' : 'Awaiting assignment' },
        { label: 'REQUIRED ACTIONS', value: AWAITING, subtitle: 'Awaiting records' },
        { label: 'APPROVED RESOURCES', value: AWAITING, subtitle: 'Awaiting records' },
      ];
    case 'AREOPAGUS':
      return [
        { label: 'SCOPE', value: 'GLOBAL', subtitle: 'The Areopagus' },
        { label: 'MEMBERS', value: AWAITING, subtitle: 'Awaiting database' },
        { label: 'CANDIDATES', value: AWAITING, subtitle: 'Awaiting database' },
        { label: 'REPORTS', value: AWAITING, subtitle: 'Awaiting records' },
      ];
    case 'COUNTRY_INITIATOR':
      return [
        { label: 'SCOPE', value: user.org?.countryName ?? user.scope.entityName ?? AWAITING, subtitle: 'Country' },
        { label: 'MEMBERS', value: AWAITING, subtitle: 'Awaiting database' },
        { label: 'CANDIDATES', value: AWAITING, subtitle: 'Awaiting database' },
        { label: 'REPORTS', value: AWAITING, subtitle: 'Awaiting records' },
      ];
    case 'PREFECT':
      return [
        { label: 'SCOPE', value: user.org?.prefectureName ?? user.scope.entityName ?? AWAITING, subtitle: 'Prefecture' },
        { label: 'MEMBERS', value: AWAITING, subtitle: 'Awaiting database' },
        { label: 'CANDIDATES', value: AWAITING, subtitle: 'Awaiting database' },
        { label: 'REPORTS', value: AWAITING, subtitle: 'Awaiting records' },
      ];
    case 'DIRECTORATE_OFFICER':
      return [
        { label: 'SCOPE', value: user.scope.entityName ?? AWAITING, subtitle: 'Directorate' },
        { label: 'CELLS', value: AWAITING, subtitle: 'Awaiting database' },
        { label: 'MEMBERS', value: AWAITING, subtitle: 'Awaiting database' },
        { label: 'REPORTS', value: AWAITING, subtitle: 'Awaiting records' },
      ];
    case 'MINERVAL_ASSEMBLY_OFFICER':
      return [
        { label: 'SCOPE', value: user.scope.entityName ?? AWAITING, subtitle: 'Minerval Assembly' },
        { label: 'MEMBERS', value: AWAITING, subtitle: 'Awaiting database' },
        { label: 'EVENTS', value: AWAITING, subtitle: 'Awaiting records' },
        { label: 'DOCUMENTS', value: AWAITING, subtitle: 'Awaiting records' },
      ];
    case 'INSINUATOR':
      return [
        { label: 'SCOPE', value: user.scope.entityName ?? AWAITING, subtitle: 'Minerval Assembly' },
        { label: 'ASSIGNED CANDIDATES', value: AWAITING, subtitle: 'Awaiting database' },
        { label: 'ASSIGNED MEMBERS', value: AWAITING, subtitle: 'Awaiting database' },
        { label: 'RECOMMENDATIONS', value: AWAITING, subtitle: 'Awaiting records' },
      ];
    case 'SYSTEM_ADMINISTRATOR':
      return [
        { label: 'ENVIRONMENT', value: user.dev ? 'DEVELOPMENT' : 'PRODUCTION', subtitle: 'Gateway mode' },
        { label: 'USERS', value: AWAITING, subtitle: 'Awaiting database' },
        { label: 'SECURITY EVENTS', value: AWAITING, subtitle: 'Awaiting records' },
        { label: 'AUDIT LOG', value: AWAITING, subtitle: 'Awaiting records' },
      ];
    default:
      return [];
  }
}

export default function OverviewPage() {
  const { user, permissions } = useSession();

  if (!user) return null;

  const greeting = greetingFor(user);
  const stats = buildStats(user);
  const isMember = user.role === 'MEMBER';
  const order = heroOrder(user);

  return (
    <div className="dash-overview">
      <section className="dash-hero">
        <div className="dash-hero-profile" aria-hidden="true">
          <span className="dash-hero-profile-inner">{user.initials}</span>
        </div>
        <div className="dash-hero-copy">
          <p className="dash-hero-eyebrow">{greeting.eyebrow}</p>
          <h1 className="dash-hero-title">{greeting.title}</h1>
          <p className="dash-hero-order">{order}</p>
          {isMember ? (
            <div className="dash-hero-tags" aria-label="Member information">
              {memberTags(user).map((tag) => (
                <span className="dash-hero-tag" key={tag.key}>
                  {tag.label}
                </span>
              ))}
            </div>
          ) : null}
          <div className="dash-hero-divider" aria-hidden="true" />
          <p className="dash-hero-line">{greeting.line}</p>
          {user.dev ? (
            <span className="dash-dev-badge" title="Authenticated through the development gateway">
              <span className="dash-dev-badge-dot" aria-hidden="true" />
              DEVELOPMENT GATEWAY
            </span>
          ) : null}
        </div>

        {user.photoUrl ? (
          <figure className="dash-hero-photo">
            <span className="dash-hero-photo-frame">
              <img
                src={user.photoUrl}
                alt={`Official membership photograph of ${greeting.title}`}
              />
            </span>
            <figcaption>OFFICIAL PHOTOGRAPH</figcaption>
          </figure>
        ) : null}
      </section>

      {isMember ? (
        <div className="dash-station-grid">
          <MemberCurrentStationPanel />
          <MembershipStatusPanel record={memberRecordViewFromSession(user)} />
        </div>
      ) : (
        <section className="dash-overview-stats" aria-label="Overview statistics">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>
      )}

      {isMember ? (
        <>
          <div className="dash-member-grid">
            <MemberMembershipPanel record={memberRecordViewFromSession(user)} />
            <MemberBrotherhoodPanel record={memberRecordViewFromSession(user)} />
          </div>

          <div className="dash-overview-columns">
            <div className="dash-overview-hierarchy">
              <HierarchyPanel user={user} />
              <MemberCommunityPanel record={memberRecordViewFromSession(user)} />
            </div>
            <div className="dash-overview-side">
              <QuickActions user={user} permissions={permissions} />
              <AnnouncementsPanel />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="dash-overview-columns">
            <div className="dash-overview-hierarchy">
              <HierarchyPanel user={user} />
            </div>
            <div className="dash-overview-side">
              <QuickActions user={user} permissions={permissions} />
              <AnnouncementsPanel />
            </div>
          </div>
        </>
      )}

      <div className="dash-overview-columns">
        <ActivityPanel />
        <AssembliesPanel />
      </div>
    </div>
  );
}