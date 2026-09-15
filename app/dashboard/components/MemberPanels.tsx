// ============================================================
// VEIL — Member Record Panels (presentational)
// Rendered from a member-record view (live DB record or the
// session identity). Values that have not been entered yet are
// shown as elegant VEIL empty states — never fabricated.
//
// This module has no "use client" directive so it can be used
// by both client dashboards and server components.
// ============================================================

import Link from 'next/link';
import type { VeilSessionUser } from '../../../lib/auth/session-types';
import type { Member } from '../../../lib/db';
import { memberInitials } from '../../../lib/member-name';
import { buildMembershipJourney } from '../../../lib/membership-journey';

export interface MemberRecordView {
  fullName: string;
  memberId: string;
  initials: string;
  membershipType?: string;
  status?: string;
  role?: string;
  country?: string;
  countryInitiator?: string;
  initiationDate?: string;
  journeyStartedYear?: number;
  formalApprovalYear?: number;
  fullMembershipYear?: number;
  prefecture?: string;
  directorate?: string;
  minervalAssembly?: string;
  cell?: string;
  insinuatorName?: string;
  /** True when the record was read from the real database. */
  live?: boolean;
}

/** Builds a record view from a live database Member record. */
export function memberRecordViewFromDb(member: Member): MemberRecordView {
  return {
    fullName: member.fullName,
    memberId: member.memberId,
    initials: memberInitials(member.firstName, member.middleName, member.lastName),
    membershipType: member.membershipType,
    status: member.status,
    role: member.role,
    country: member.country,
    countryInitiator: member.countryInitiator ?? undefined,
    initiationDate: member.initiationDate?.toISOString().slice(0, 10),
    journeyStartedYear: member.journeyStartedYear ?? undefined,
    formalApprovalYear: member.formalApprovalYear ?? undefined,
    fullMembershipYear: member.fullMembershipYear ?? undefined,
    prefecture: member.prefecture ?? undefined,
    directorate: member.directorate ?? undefined,
    minervalAssembly: member.minervalAssembly ?? undefined,
    cell: member.cell ?? undefined,
    insinuatorName: member.insinuatorName ?? undefined,
    live: true,
  };
}

/** Builds a record view from the authenticated session identity. */
export function memberRecordViewFromSession(user: VeilSessionUser): MemberRecordView {
  return {
    fullName: user.fullName ?? `${user.firstName} ${user.lastName}`,
    memberId: user.memberId,
    initials: user.initials,
    membershipType: user.membershipType,
    status: user.status,
    role: user.role,
    country: user.country ?? user.org?.countryName ?? user.scope.countryName,
    countryInitiator: user.countryInitiator,
    journeyStartedYear: user.journeyStartedYear,
    formalApprovalYear: user.formalApprovalYear,
    fullMembershipYear: user.fullMembershipYear,
    insinuatorName: user.insinuatorName,
    prefecture: user.org?.prefectureName,
    directorate: user.org?.directorateName,
    minervalAssembly: user.org?.assemblyName,
    cell: user.org?.cellName,
    live: !user.dev,
  };
}

export const NOT_ASSIGNED = 'NOT YET ASSIGNED';
export const NO_RECORDS = 'NO RECORDS AVAILABLE';

interface FieldRowProps {
  label: string;
  value: string | undefined | null;
  emptyLabel?: string;
  sub?: string;
}

function isEmpty(value: string | undefined | null): boolean {
  return value === undefined || value === null || value.trim().length === 0;
}

function FieldRow({ label, value, emptyLabel, sub }: FieldRowProps) {
  const missing = isEmpty(value);
  return (
    <div className="dash-field">
      <p className="dash-field-label">{label}</p>
      <p className={`dash-field-value ${missing ? 'is-unset' : ''}`}>
        {missing ? (emptyLabel ?? NOT_ASSIGNED) : value}
      </p>
      {sub ? <p className="dash-field-sub">{sub}</p> : null}
    </div>
  );
}

function SectionLink({ label, href, value, emptyLabel }: { label: string; href: string; value?: string; emptyLabel?: string }) {
  const missing = isEmpty(value);
  return (
    <div className="dash-field dash-field-link">
      <p className="dash-field-label">{label}</p>
      <p className={`dash-field-value ${missing ? 'is-unset' : ''}`}>
        {missing ? (emptyLabel ?? NOT_ASSIGNED) : value}
      </p>
      <Link href={href} className="dash-field-anchor">
        OPEN CHAMBER <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

// ---- MY MEMBERSHIP -------------------------------------------------

export function MemberMembershipPanel({ record }: { record: MemberRecordView }) {
  const journey = buildMembershipJourney({
    journeyStartedYear: record.journeyStartedYear,
    formalApprovalYear: record.formalApprovalYear,
    fullMembershipYear: record.fullMembershipYear,
  });
  return (
    <div className="dash-panel dash-member-panel">
      <header className="dash-member-panel-head">
        <span className="dash-member-panel-glyph" aria-hidden="true">
          ◇
        </span>
        <div>
          <h3 className="dash-panel-head">MY MEMBERSHIP</h3>
          <p className="dash-member-panel-sub">
            REGISTRY RECORD · {record.live ? 'DATABASE' : 'SESSION'}
          </p>
        </div>
      </header>
      <div className="dash-member-identity">
        <span className="dash-member-initials" aria-hidden="true">
          {record.initials}
        </span>
        <p className="dash-member-name">{record.fullName}</p>
        <p className="dash-member-id">{record.memberId}</p>
      </div>
      <div className="dash-field-list">
        <FieldRow label="MEMBERSHIP ID" value={record.memberId} emptyLabel={NOT_ASSIGNED} />
        <FieldRow label="MEMBERSHIP TYPE" value={record.membershipType} emptyLabel={NOT_ASSIGNED} />
        <FieldRow label="STATUS" value={record.status} emptyLabel={NOT_ASSIGNED} />
        <FieldRow label="ROLE" value={record.role} emptyLabel={NOT_ASSIGNED} />
        <FieldRow label="COUNTRY" value={record.country} emptyLabel={NOT_ASSIGNED} />
        <FieldRow
          label="COUNTRY INITIATOR"
          value={record.countryInitiator}
          emptyLabel={NOT_ASSIGNED}
          sub={!isEmpty(record.countryInitiator) ? 'WHO BROUGHT YOU BEHIND THE VEIL' : undefined}
        />
        <FieldRow
          label="JOURNEY BEGAN"
          value={journey.journeyBegan}
          emptyLabel={NOT_ASSIGNED}
          sub="Initiation journey began"
        />
        <FieldRow
          label="FULL MEMBERSHIP"
          value={journey.fullMembership}
          emptyLabel={NOT_ASSIGNED}
          sub="Formally approved and entered into the official Brotherhood registry"
        />
      </div>
    </div>
  );
}

// ---- MY BROTHERHOOD ------------------------------------------------

export function MemberBrotherhoodPanel({ record }: { record: MemberRecordView }) {
  const journey = buildMembershipJourney({
    journeyStartedYear: record.journeyStartedYear,
    formalApprovalYear: record.formalApprovalYear,
    fullMembershipYear: record.fullMembershipYear,
  });
  return (
    <div className="dash-panel dash-member-panel">
      <header className="dash-member-panel-head">
        <span className="dash-member-panel-glyph" aria-hidden="true">
          ◈
        </span>
        <div>
          <h3 className="dash-panel-head">MY BROTHERHOOD</h3>
          <p className="dash-member-panel-sub">STATION, GUIDANCE & HISTORY</p>
        </div>
      </header>
      <div className="dash-field-list">
        <SectionLink label="MY PROFILE" href="/dashboard/profile" emptyLabel="OPEN PROFILE" />
        <SectionLink label="MY MEMBERSHIP" href="/dashboard/profile" emptyLabel="OPEN MEMBERSHIP" />
        <FieldRow
          label="MY ORGANIZATION"
          value={
            isEmpty(record.prefecture) && isEmpty(record.directorate) && isEmpty(record.minervalAssembly) && isEmpty(record.cell)
              ? undefined
              : [record.prefecture, record.directorate, record.minervalAssembly, record.cell]
                  .filter((value) => !isEmpty(value))
                  .join(' · ')
          }
          emptyLabel={NOT_ASSIGNED}
          sub="Prefecture · Directorate · Minerval Assembly · Cell"
        />
        <FieldRow
          label="MY INSINUATOR"
          value={record.insinuatorName}
          emptyLabel={NOT_ASSIGNED}
          sub="Your guide within the order"
        />
        <FieldRow
          label="RECORDED JOURNEY"
          value={journey.span}
          emptyLabel={NO_RECORDS}
          sub="The recorded initiatory journey · 2019 to 2026"
        />
      </div>
    </div>
  );
}

// ---- CURRENT STATION ----------------------------------------------

export function MemberCurrentStationPanel({ station = 'MEMBER' }: { station?: string }) {
  return (
    <div className="dash-panel dash-station">
      <header className="dash-member-panel-head">
        <span className="dash-member-panel-glyph" aria-hidden="true">◈</span>
        <div>
          <h3 className="dash-panel-head">CURRENT STATION</h3>
          <p className="dash-member-panel-sub">YOUR PLACE WITHIN THE ORDER</p>
        </div>
      </header>
      <div className="dash-station-centerpiece">
        <span className="dash-station-seal" aria-hidden="true">
          <span className="dash-station-seal-ring" />
          <span className="dash-station-diamond">◆</span>
        </span>
        <p className="dash-station-name">{station}</p>
        <div className="dash-station-rule" aria-hidden="true" />
        <p className="dash-station-sub">OF THE BROTHERHOOD OF LIGHT</p>
      </div>
    </div>
  );
}

// ---- MEMBERSHIP STATUS ----------------------------------------------

export function MembershipStatusPanel({ record }: { record: MemberRecordView }) {
  return (
    <div className="dash-panel dash-member-panel">
      <header className="dash-member-panel-head">
        <span className="dash-member-panel-glyph" aria-hidden="true">◇</span>
        <div>
          <h3 className="dash-panel-head">MEMBERSHIP STATUS</h3>
          <p className="dash-member-panel-sub">OFFICIAL MEMBERSHIP INFORMATION</p>
        </div>
      </header>
      <div className="dash-field-list">
        <FieldRow label="MEMBER ID" value={record.memberId} emptyLabel={NOT_ASSIGNED} />
        <FieldRow label="MEMBERSHIP" value={record.membershipType} emptyLabel={NOT_ASSIGNED} />
        <FieldRow label="STATUS" value={record.status} emptyLabel={NOT_ASSIGNED} />
        <FieldRow label="COUNTRY" value={record.country} emptyLabel={NOT_ASSIGNED} />
        <FieldRow
          label="COUNTRY INITIATOR"
          value={record.countryInitiator}
          emptyLabel={NOT_ASSIGNED}
          sub={!isEmpty(record.countryInitiator) ? 'WHO BROUGHT YOU BEHIND THE VEIL' : undefined}
        />
      </div>
    </div>
  );
}

// ---- COMMUNITY -----------------------------------------------------

export function MemberCommunityPanel({ record }: { record: MemberRecordView }) {
  return (
    <div className="dash-panel dash-member-panel">
      <header className="dash-member-panel-head">
        <span className="dash-member-panel-glyph" aria-hidden="true">
          ◇
        </span>
        <div>
          <h3 className="dash-panel-head">COMMUNITY</h3>
          <p className="dash-member-panel-sub">THE FELLOWSHIP ABOUT YOU</p>
        </div>
      </header>
      <div className="dash-member-community">
        <SectionLink label="ANNOUNCEMENTS" href="/dashboard/announcements" emptyLabel={NO_RECORDS} />
        <SectionLink label="ASSEMBLIES" href="/dashboard/assemblies" emptyLabel={NO_RECORDS} />
        <SectionLink label="MESSAGES" href="/dashboard/messages" emptyLabel={NO_RECORDS} />
        <SectionLink label="APPROVED DOCUMENTS / RESOURCES" href="/dashboard/documents" emptyLabel={NO_RECORDS} />
      </div>
    </div>
  );
}