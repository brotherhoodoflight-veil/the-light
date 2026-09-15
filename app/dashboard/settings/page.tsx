// ============================================================
// VEIL — Settings · Account
// The member's account-control area within the portal.
//
// Deliberately calmer and more practical than Codex or
// Archives: clear hierarchy, restrained controls, strong
// readability — never a generic SaaS settings screen.
//
// Security rules honored here:
//   • Identity is resolved server-side from the authenticated
//     session and (when available) the live membership record
//     in the database. Client-supplied identity is never used.
//   • Official Brotherhood registry fields are READ-ONLY. No
//     control here can alter them.
//   • No password, password hash, or authentication secret is
//     ever rendered. Password management has no backend route,
//     so the section states who manages it — no insecure fake
//     implementation is built, and nothing looks like a reveal.
//   • Notification / privacy preferences are NOT persisted by
//     any backend yet, so they are shown as read-only states
//     with an explicit notice — not as fake switches.
//   • No session dates, locations, or tokens are invented or
//     exposed. Sign-out uses the existing authentication
//     logout mechanism only.
// ============================================================

import Link from 'next/link';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionPayload } from '../../../lib/auth/session-server';
import { roleShortLabel } from '../../../lib/auth/role-labels';
import { prisma } from '../../../lib/db';
import {
  memberRecordViewFromDb,
  memberRecordViewFromSession,
  type MemberRecordView,
} from '../components/MemberPanels';
import SignOutButton from './SignOutButton';

export const dynamic = 'force-dynamic';

const NOT_ASSIGNED = 'NOT ASSIGNED';
const NOT_CONFIGURED = 'NOT YET CONFIGURED';

function isPresent(value: string | undefined | null): boolean {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

// ------------------------------------------------------------
// Structural helpers
// ------------------------------------------------------------

function SettingsRule({ className }: { className?: string }) {
  return (
    <div
      className={`dash-settings-rule${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    />
  );
}

function SettingsSection({
  index,
  title,
  sub,
  children,
  protectedPanel,
}: {
  index: string;
  title: string;
  sub: string;
  children: ReactNode;
  protectedPanel?: boolean;
}) {
  return (
    <section
      className={`dash-settings-section${
        protectedPanel ? ' is-protected' : ''
      }`}
    >
      <header className="dash-settings-section-head">
        <span className="dash-settings-section-index" aria-hidden="true">
          {index}
        </span>
        <div>
          <h3 className="dash-settings-section-title">{title}</h3>
          <p className="dash-settings-section-sub">{sub}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

type FieldState = 'set' | 'unset' | 'good' | 'protect';

function SettingsRow({
  label,
  value,
  state = 'set',
  lock,
}: {
  label: string;
  value: string;
  state?: FieldState;
  lock?: boolean;
}) {
  return (
    <div className="dash-settings-row">
      <p className="dash-settings-label">
        {lock ? (
          <span className="dash-settings-lock" aria-hidden="true">
            ◆
          </span>
        ) : null}
        {label}
      </p>
      <p className={`dash-settings-value is-${state}`}>{value}</p>
    </div>
  );
}

function SettingsNote({ children }: { children: ReactNode }) {
  return <p className="dash-settings-note">{children}</p>;
}

// ------------------------------------------------------------
// Page
// ------------------------------------------------------------

export default async function SettingsPage() {
  const session = await getSessionPayload();

  if (!session) {
    redirect('/login');
  }

  const { user } = session;

  // Authoritative, live membership record where one exists.
  let liveMember = null;
  if (user.role === 'MEMBER' || user.role === 'CANDIDATE') {
    try {
      liveMember = await prisma.member.findUnique({
        where: { memberId: user.memberId },
      });
    } catch {
      liveMember = null;
    }
  }

  const record: MemberRecordView =
    liveMember && liveMember.status !== 'CANDIDATE'
      ? memberRecordViewFromDb(liveMember)
      : memberRecordViewFromSession(user);

  const firstName = liveMember ? liveMember.firstName : user.firstName;
  const fullName = record.fullName;
  const memberId = record.memberId;
  const roleLabel = isPresent(record.role)
    ? String(record.role).toUpperCase()
    : roleShortLabel(user.role);
  const statusLabel = isPresent(record.status)
    ? String(record.status).toUpperCase()
    : NOT_ASSIGNED;
  const membershipType = isPresent(record.membershipType)
    ? String(record.membershipType).toUpperCase()
    : NOT_ASSIGNED;
  const country = isPresent(record.country)
    ? String(record.country).toUpperCase()
    : NOT_ASSIGNED;
  const countryInitiator = isPresent(record.countryInitiator)
    ? String(record.countryInitiator).toUpperCase()
    : NOT_ASSIGNED;

  return (
    <div className="dash-settings">
      <div className="dash-dossier-nav">
        <Link href="/dashboard" className="dash-dossier-back">
          <span aria-hidden="true">←</span>
          MY VEIL · OVERVIEW
        </Link>
      </div>

      {/* --- Page head --- */}
      <header className="dash-settings-head">
        <p className="dash-settings-eyebrow">THE BROTHERHOOD OF LIGHT · ACCOUNT</p>
        <h1 className="dash-settings-title">SETTINGS</h1>
        <p className="dash-settings-sub">ACCOUNT · PREFERENCES &amp; SECURITY</p>
        <SettingsRule className="is-head" />
        <p className="dash-settings-intro">
          Manage the preferences and security controls associated with your
          VEIL account.
        </p>
      </header>

      {/* --- Section I — Account Identity --- */}
      <SettingsSection
        index="I"
        title="ACCOUNT IDENTITY"
        sub="THE OFFICIAL IDENTITY BOUND TO THIS ACCOUNT"
      >
        <div className="dash-settings-rows" role="group" aria-label="ACCOUNT IDENTITY">
          <SettingsRow label="DISPLAY NAME" value={firstName} />
          <SettingsRow label="FULL NAME" value={fullName} />
          <SettingsRow label="MEMBERSHIP ID" value={memberId} lock />
          <SettingsRow label="ROLE" value={roleLabel} lock />
          <SettingsRow label="ACCOUNT STATUS" value={statusLabel} state="good" />
        </div>
        <SettingsNote>
          Official Brotherhood identity records cannot be changed from member
          settings.
        </SettingsNote>
      </SettingsSection>

      {/* --- Section II — Account Security --- */}
      <SettingsSection
        index="II"
        title="ACCOUNT SECURITY"
        sub="CREDENTIALS & CHAMBER ACCESS"
      >
        <div className="dash-settings-rows" role="group" aria-label="ACCOUNT SECURITY">
          <SettingsRow label="PASSWORD" value="PROTECTED" state="protect" lock />
        </div>
        <SettingsNote>
          Password management is controlled through the account security system.
        </SettingsNote>
      </SettingsSection>

      {/* --- Section III — Communication Preferences --- */}
      <SettingsSection
        index="III"
        title="COMMUNICATION PREFERENCES"
        sub="NOTIFICATION BEHAVIOR · READ ONLY"
      >
        <div
          className="dash-settings-rows"
          role="group"
          aria-label="COMMUNICATION PREFERENCES"
        >
          <SettingsRow label="MESSAGE NOTIFICATIONS" value="ENABLED" state="good" />
          <SettingsRow label="ASSEMBLY NOTIFICATIONS" value="ENABLED" state="good" />
          <SettingsRow label="OFFICIAL ANNOUNCEMENTS" value="ENABLED" state="good" />
          <SettingsRow label="EMAIL NOTIFICATIONS" value="NOT CONFIGURED" state="unset" />
        </div>
        <SettingsNote>
          Saved notification preferences are not yet available. The states above
          reflect the current default behavior of the VEIL portal, and will
          connect to the Brotherhood Chamber notification system once member
          preferences are enabled.
        </SettingsNote>
      </SettingsSection>

      {/* --- Section IV — Privacy --- */}
      <SettingsSection
        index="IV"
        title="PRIVACY"
        sub="PRESENCE & VISIBILITY CONTROLS"
      >
        <div className="dash-settings-rows" role="group" aria-label="PRIVACY">
          <SettingsRow label="PROFILE VISIBILITY" value={NOT_CONFIGURED} state="unset" />
          <SettingsRow label="MEMBER DIRECTORY VISIBILITY" value={NOT_CONFIGURED} state="unset" />
          <SettingsRow label="ONLINE / PRESENCE VISIBILITY" value={NOT_CONFIGURED} state="unset" />
        </div>
        <SettingsNote>
          Privacy controls will become available when the corresponding
          Brotherhood communication settings are enabled.
        </SettingsNote>
      </SettingsSection>

      {/* --- Section V — Official Record Protection --- */}
      <SettingsSection
        index="V"
        title="OFFICIAL RECORD PROTECTION"
        sub="PROTECTED REGISTRY RECORDS · READ ONLY"
        protectedPanel
      >
        <p className="dash-settings-blurb">
          Certain information belongs to the Brotherhood registry rather than
          the member&rsquo;s personal settings.
        </p>
        <div
          className="dash-settings-rows"
          role="group"
          aria-label="OFFICIAL RECORD PROTECTION"
        >
          <SettingsRow label="MEMBERSHIP ID" value={memberId} lock />
          <SettingsRow label="MEMBERSHIP TYPE" value={membershipType} lock />
          <SettingsRow label="ROLE" value={roleLabel} lock />
          <SettingsRow label="STATUS" value={statusLabel} state="good" lock />
          <SettingsRow label="COUNTRY" value={country} lock />
          <SettingsRow label="COUNTRY INITIATOR" value={countryInitiator} lock />
          <SettingsRow label="OFFICIAL PHOTOGRAPH" value="PROTECTED" state="protect" lock />
        </div>
        <SettingsNote>These records cannot be edited from Settings.</SettingsNote>
      </SettingsSection>

      {/* --- Section VI — Account Activity --- */}
      <SettingsSection
        index="VI"
        title="ACCOUNT ACTIVITY"
        sub="CURRENT SESSION STANDING"
      >
        <div className="dash-settings-rows" role="group" aria-label="ACCOUNT ACTIVITY">
          <SettingsRow label="CURRENT SESSION" value="ACTIVE" state="good" />
          <SettingsRow label="LAST ACCOUNT ACTIVITY" value="NOT AVAILABLE" state="unset" />
        </div>
        <SettingsNote>
          Session activity is not recorded on the account. No access dates or
          locations are assumed.
        </SettingsNote>
      </SettingsSection>

      {/* --- Section VII — Account Actions --- */}
      <SettingsSection
        index="VII"
        title="ACCOUNT ACTIONS"
        sub="RESTRAINED ACCOUNT CONTROLS"
      >
        <p className="dash-settings-blurb">
          Account actions that could delete, cancel, suspend, or otherwise alter
          official Brotherhood membership records are intentionally not offered
          from this page.
        </p>
        <div className="dash-settings-action">
          <SignOutButton />
          <p className="dash-settings-action-note">
            Signing out ends your current session on this device.
          </p>
        </div>
      </SettingsSection>

      {/* --- Final notice --- */}
      <section
        className="dash-settings-notice"
        role="note"
        aria-label="YOUR ACCOUNT IS YOUR KEY TO THE VEIL"
      >
        <p className="dash-settings-notice-kicker">FINAL NOTICE</p>
        <h2 className="dash-settings-notice-title">
          YOUR ACCOUNT IS YOUR KEY TO THE VEIL.
        </h2>
        <SettingsRule className="is-notice" />
        <p className="dash-settings-notice-text">
          Protect your credentials.
        </p>
        <p className="dash-settings-notice-text">
          Official membership records are maintained separately from personal
          account preferences.
        </p>
        <p className="dash-settings-notice-text">
          If something appears incorrect in your Brotherhood record, contact
          authorized Brotherhood administration.
        </p>
      </section>

      <div className="dash-settings-lockline" aria-hidden="true">
        <span>ACCOUNT · SETTINGS</span>
        <span className="dash-settings-lockline-sep">◆</span>
        <span>THE BROTHERHOOD OF LIGHT</span>
        <span className="dash-settings-lockline-sep">◆</span>
        <span>FICTIONAL CANON</span>
      </div>
    </div>
  );
}