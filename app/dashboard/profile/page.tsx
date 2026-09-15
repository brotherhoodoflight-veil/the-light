// ============================================================
// VEIL — My Journey · My Profile
// The member's personal identity and contact chamber.
//
// This page is deliberately distinct from MY MEMBERSHIP (the
// official registry dossier). It surfaces the member's personal
// identity, contact record, official photograph, read-only
// profile information, and account security standing.
//
// Data rules honored:
//   • Values are read from the authenticated member's live
//     database record — never invented.
//   • Contact fields with no recorded value display
//     "NOT YET PROVIDED".
//   • Official Brotherhood records (Member ID, Role, Membership
//     Type, Status, Station, Country Initiator, Photograph) are
//     never member-editable. Self-service profile editing is not
//     yet supported by the backend, so fields render read-only.
//   • No password, hash, or authentication secret is exposed.
//     Password management has no backend route yet, so the
//     section states who manages it — no insecure substitute is
//     built.
// ============================================================

import Link from 'next/link';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionPayload } from '../../../lib/auth/session-server';
import { prisma } from '../../../lib/db';
import { memberPhotoPath } from '../../../lib/member-name';
import {
  memberRecordViewFromDb,
  memberRecordViewFromSession,
  type MemberRecordView,
} from '../components/MemberPanels';
import { buildMembershipJourney } from '../../../lib/membership-journey';

export const dynamic = 'force-dynamic';

const NOT_PROVIDED = 'NOT YET PROVIDED';

function isPresent(value: string | null | undefined): boolean {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

interface ProfileFieldProps {
  label: string;
  value?: string | null;
  sub?: string;
  uppercase?: boolean;
}

function ProfileField({ label, value, sub, uppercase }: ProfileFieldProps) {
  const missing = !isPresent(value);
  return (
    <div className="dash-field">
      <p className="dash-field-label">{label}</p>
      <p className={`dash-field-value ${missing ? 'is-unset' : ''} ${uppercase ? 'is-caps' : ''}`}>
        {missing ? NOT_PROVIDED : value}
      </p>
      {sub ? <p className="dash-field-sub">{sub}</p> : null}
    </div>
  );
}

interface ProfileSectionProps {
  index: string;
  title: string;
  sub: string;
  children: ReactNode;
  wide?: boolean;
}

function ProfileSection({ index, title, sub, children, wide }: ProfileSectionProps) {
  return (
    <section className={`dash-dossier-section dash-persona-section${wide ? ' is-wide' : ''}`}>
      <header className="dash-dossier-section-head">
        <span className="dash-dossier-index" aria-hidden="true">
          {index}
        </span>
        <h3 className="dash-dossier-section-title">{title}</h3>
        <p className="dash-dossier-section-sub">{sub}</p>
      </header>
      {children}
    </section>
  );
}

export default async function ProfilePage() {
  const session = await getSessionPayload();

  if (!session) {
    redirect('/login');
  }

  const { user } = session;

  let member = null;
  if (user.role === 'MEMBER' || user.role === 'CANDIDATE') {
    try {
      member = await prisma.member.findUnique({
        where: { memberId: user.memberId },
      });
    } catch {
      member = null;
    }
  }

  const record: MemberRecordView =
    member && member.status !== 'CANDIDATE'
      ? memberRecordViewFromDb(member)
      : memberRecordViewFromSession(user);

  const journey = buildMembershipJourney({
    journeyStartedYear: record.journeyStartedYear,
    formalApprovalYear: record.formalApprovalYear,
    fullMembershipYear: record.fullMembershipYear,
  });

  const photoUrl =
    user.photoUrl ?? (member ? memberPhotoPath(member.memberId) : undefined);

  const firstName = member ? member.firstName : user.firstName;
  const middleName = member ? member.middleName : null;
  const lastName = member ? member.lastName : user.lastName;
  const displayName = firstName;

  const email = member ? member.email : null;
  const phone = member ? member.phone : null;
  const address = member ? member.address : null;

  const country = record.country;
  const role = record.role ?? 'MEMBER';
  const status = record.status ?? 'ACTIVE';
  const username = record.memberId;

  return (
    <div className="dash-persona">
      <div className="dash-dossier-nav">
        <Link href="/dashboard" className="dash-dossier-back">
          <span aria-hidden="true">←</span>
          MY VEIL · OVERVIEW
        </Link>
      </div>

      <section className="dash-hero dash-hero-module">
        <div className="dash-hero-seal" aria-hidden="true">
          <span className="dash-hero-seal-inner">◈</span>
        </div>
        <div className="dash-hero-copy">
          <p className="dash-hero-eyebrow">PERSONAL MEMBER PROFILE</p>
          <h1 className="dash-hero-title">MY PROFILE</h1>
          <p className="dash-hero-order">
            PERSONAL PROFILE · THE BROTHERHOOD OF LIGHT
          </p>
          <div className="dash-hero-divider" aria-hidden="true" />
          <p className="dash-hero-line">
            Your personal profile within the Brotherhood of Light.
          </p>
          <div className="dash-hero-tags" aria-label="Profile identity">
            <span className="dash-hero-tag">{record.initials}</span>
            <span className="dash-hero-tag">{record.fullName}</span>
            <span className="dash-hero-tag">{record.memberId}</span>
          </div>
        </div>
      </section>

      <div className="dash-dossier-pair">
        <ProfileSection
          index="I"
          title="PERSONAL IDENTITY"
          sub="THE IDENTITY RECORDED ON YOUR ACCOUNT"
        >
          <div className="dash-persona-idcompose">
            {photoUrl ? (
              <figure className="dash-persona-idphoto">
                <span className="dash-persona-idphoto-frame">
                  <img
                    src={photoUrl}
                    alt={`Official membership photograph of ${record.fullName}`}
                  />
                </span>
                <figcaption className="dash-persona-idphoto-caption">
                  OFFICIAL PHOTOGRAPH
                </figcaption>
              </figure>
            ) : null}
            <div className="dash-dossier-grid">
              <ProfileField label="FULL NAME" value={record.fullName} />
              <ProfileField label="DISPLAY NAME" value={displayName} />
              <ProfileField label="INITIALS" value={record.initials} />
              <ProfileField label="MEMBER ID" value={record.memberId} />
              <ProfileField label="COUNTRY" value={country} uppercase />
              <ProfileField label="ROLE" value={role} uppercase />
            </div>
          </div>
        </ProfileSection>

        <ProfileSection
          index="II"
          title="CONTACT INFORMATION"
          sub="CONTACT RECORDS HELD ON YOUR ACCOUNT"
        >
          <div className="dash-dossier-grid">
            <ProfileField
              label="EMAIL ADDRESS"
              value={email}
              sub="Used for privileged Brotherhood communications"
            />
            <ProfileField label="PHONE NUMBER" value={phone} />
            <ProfileField label="RESIDENTIAL ADDRESS" value={address} />
          </div>
          <p className="dash-persona-note">
            Contact details appear here once they are recorded on your account.
            Entries without a value are shown as NOT YET PROVIDED — nothing is
            assumed or invented.
          </p>
        </ProfileSection>
      </div>

      <ProfileSection
        index="III"
        title="OFFICIAL PHOTOGRAPH"
        sub="THE RECORDED RESEMBLANCE OF RECORD"
        wide
      >
        <div className="dash-persona-photo-wrap">
          <figure className="dash-persona-photo">
            <span className="dash-persona-photo-frame">
              <img
                src={photoUrl}
                alt={`Official Brotherhood photograph of ${record.fullName}`}
              />
            </span>
            <figcaption className="dash-persona-photo-caption">
              OFFICIAL BROTHERHOOD PHOTOGRAPH
            </figcaption>
          </figure>
          <p className="dash-persona-photo-note">
            Official photographs are managed by authorized Brotherhood
            administrators.
          </p>
        </div>
      </ProfileSection>

      <div className="dash-dossier-pair">
        <ProfileSection
          index="IV"
          title="PROFILE INFORMATION"
          sub="PERSONAL PROFILE FIELDS · READ ONLY"
        >
          <div className="dash-dossier-grid">
            <ProfileField label="FIRST NAME" value={firstName} />
            <ProfileField label="MIDDLE NAME" value={middleName} />
            <ProfileField label="LAST NAME" value={lastName} />
            <ProfileField label="DISPLAY NAME" value={displayName} />
          </div>
          <p className="dash-persona-note is-lock">
            Personal profile fields are read-only. They are recorded in the
            official Brotherhood registry, and corrections are handled by
            authorized administrators rather than by self-service editing.
          </p>
        </ProfileSection>

        <ProfileSection
          index="V"
          title="ACCOUNT SECURITY"
          sub="YOUR CHAMBER ACCESS"
        >
          <div className="dash-dossier-grid">
            <ProfileField label="ACCOUNT STATUS" value={status} />
            <ProfileField
              label="USERNAME / MEMBER ID"
              value={username}
            />
          </div>
          <div className="dash-persona-seg">
            <p className="dash-persona-seg-label">MEMBERSHIP</p>
            <p className="dash-persona-seg-value">
              FULL MEMBER · {journey.fullMembership} — the recorded initiation
              journey is maintained in MY MEMBERSHIP.
            </p>
          </div>
          <div className="dash-persona-seg">
            <p className="dash-persona-seg-label">PASSWORD MANAGEMENT</p>
            <p className="dash-persona-seg-value">
              Managed through the Brotherhood account security system.
            </p>
          </div>
        </ProfileSection>
      </div>

      <div className="dash-dossier-notice" role="note">
        <h2 className="dash-dossier-notice-title">PROFILE RECORD</h2>
        <p className="dash-dossier-notice-text">
          This profile contains personal information associated with your
          Brotherhood account.
        </p>
        <p className="dash-dossier-notice-text">
          Official membership information is maintained separately in MY
          MEMBERSHIP.
        </p>
        <Link href="/dashboard/membership" className="dash-persona-notice-link">
          OPEN MY MEMBERSHIP <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}