// ============================================================
// VEIL — My Journey · My Membership
// The official Brotherhood registry record. A formal dossier
// rendered from the authenticated member's live database record.
// The recorded initiatory journey and its formal recognition are
// preserved here — never fabricated.
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
import {
  buildMembershipJourney,
  buildMembershipHistoryStages,
} from '../../../lib/membership-journey';

export const dynamic = 'force-dynamic';

const NOT_ASSIGNED = 'NOT YET ASSIGNED';

function isPresent(value: string | null | undefined): boolean {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

interface DossierFieldProps {
  label: string;
  value?: string | null;
  sub?: string;
  uppercase?: boolean;
}

function DossierField({ label, value, sub, uppercase }: DossierFieldProps) {
  const missing = !isPresent(value);
  return (
    <div className="dash-field">
      <p className="dash-field-label">{label}</p>
      <p className={`dash-field-value ${missing ? 'is-unset' : ''} ${uppercase ? 'is-caps' : ''}`}>
        {missing ? NOT_ASSIGNED : value}
      </p>
      {sub ? <p className="dash-field-sub">{sub}</p> : null}
    </div>
  );
}

interface DossierSectionProps {
  index: string;
  title: string;
  sub: string;
  children: ReactNode;
  wide?: boolean;
}

function DossierSection({ index, title, sub, children, wide }: DossierSectionProps) {
  return (
    <section className={`dash-dossier-section${wide ? ' is-wide' : ''}`}>
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

export default async function MembershipPage() {
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
  const historyStages = buildMembershipHistoryStages(journey);

  const role = record.role ?? 'MEMBER';
  const country = record.country;
  const photoUrl =
    user.photoUrl ?? (member ? memberPhotoPath(member.memberId) : undefined);

  return (
    <div className="dash-registry">
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
          <p className="dash-hero-eyebrow">OFFICIAL BROTHERHOOD REGISTRY</p>
          <h1 className="dash-hero-title">MY MEMBERSHIP</h1>
          <p className="dash-hero-order">
            {record.fullName} · {record.memberId}
          </p>
          <div className="dash-hero-divider" aria-hidden="true" />
          <p className="dash-hero-line">
            Your recognized membership record within the Brotherhood of Light.
          </p>

          <div className="dash-dossier-plate">
            <div className="dash-dossier-plate-id">
              <span className="dash-dossier-plate-label">REGISTRY NUMBER</span>
              <span className="dash-dossier-plate-value">{record.memberId}</span>
            </div>
            <span className="dash-dossier-plate-divider" aria-hidden="true" />
            <div className="dash-dossier-plate-chips">
              <span className="dash-dossier-chip is-emph">{record.status}</span>
              <span className="dash-dossier-chip">
                {record.membershipType ?? NOT_ASSIGNED}
              </span>
              <span className="dash-dossier-chip">{role}</span>
            </div>
          </div>
        </div>
      </section>

      <DossierSection
        index="I"
        title="MEMBER RECORD"
        sub="REGISTRY IDENTITY · OFFICIAL DATA OF RECORD"
        wide
      >
        <div className="dash-dossier-record">
          <div className="dash-dossier-thumb">
            {photoUrl ? (
              <figure className="dash-dossier-photo">
                <span className="dash-dossier-photo-frame">
                  <img
                    src={photoUrl}
                    alt={`Official membership photograph of ${record.fullName}`}
                  />
                </span>
                <figcaption className="dash-dossier-photo-caption">
                  OFFICIAL PHOTOGRAPH
                </figcaption>
              </figure>
            ) : null}
            <div className="dash-dossier-identity">
              <p className="dash-dossier-identity-name">{record.fullName}</p>
              <p className="dash-dossier-identity-initials">
                {record.initials}
              </p>
              <p className="dash-dossier-identity-id">{record.memberId}</p>
            </div>
          </div>
          <div className="dash-dossier-grid">
            <DossierField label="FULL NAME" value={record.fullName} />
            <DossierField label="MEMBER ID" value={record.memberId} />
            <DossierField label="ROLE" value={record.role} />
            <DossierField
              label="MEMBERSHIP TYPE"
              value={record.membershipType}
            />
            <DossierField label="MEMBERSHIP STATUS" value={record.status} />
            <DossierField label="COUNTRY" value={country} />
            <DossierField
              label="COUNTRY INITIATOR"
              value={record.countryInitiator}
              sub={
                isPresent(record.countryInitiator)
                  ? 'WHO BROUGHT YOU BEHIND THE VEIL'
                  : undefined
              }
            />
            <DossierField label="CURRENT STATION" value={role} />
          </div>
        </div>
      </DossierSection>

      <div className="dash-dossier-pair">
        <DossierSection
          index="II"
          title="MEMBERSHIP HISTORY"
          sub={`HISTORICAL JOURNEY · ${journey.span}`}
        >
          <div className="dash-dossier-timeline">
            <div className="dash-dossier-timeline-head" role="status">
              <span className="dash-dossier-timeline-seal" aria-hidden="true">
                ◈
              </span>
              <p className="dash-dossier-timeline-kicker">RECORDED JOURNEY</p>
              <p className="dash-dossier-timeline-title">{journey.span}</p>
              <p className="dash-dossier-timeline-desc">
                The recorded initiatory journey that preceded formal recognition
                within the Brotherhood.
              </p>
            </div>
            <ol className="dash-dossier-timeline-list" aria-label="Membership history milestones">
              {historyStages.map((stage) => (
                <li
                  key={stage.title}
                  className={`dash-dossier-milestone${
                    stage.period === 'CURRENT' ? ' is-current' : ''
                  }`}
                >
                  <span className="dash-dossier-milestone-node" aria-hidden="true" />
                  <div className="dash-dossier-milestone-body">
                    <p className="dash-dossier-milestone-period">{stage.period}</p>
                    <p className="dash-dossier-milestone-title">{stage.title}</p>
                    <p className="dash-dossier-milestone-status">{stage.status}</p>
                    <p className="dash-dossier-milestone-desc">{stage.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </DossierSection>

        <DossierSection
          index="III"
          title="MEMBERSHIP JOURNEY"
          sub="RECORDED CLOCK OF THE JOURNEY · YEAR OF RECORD"
        >
          <div className="dash-dossier-grid">
            <DossierField
              label="JOURNEY BEGAN"
              value={journey.journeyBegan}
              sub="Beginning of the member's recorded initiation journey"
              uppercase
            />
            <DossierField
              label="FORMAL APPROVAL"
              value={journey.formalApproval}
              sub="Official approval for full Brotherhood membership"
              uppercase
            />
            <DossierField
              label="FULL MEMBERSHIP"
              value={journey.fullMembership}
              sub="Entered into the official Brotherhood registry as a full member"
              uppercase
            />
          </div>
        </DossierSection>
      </div>

      <DossierSection
        index="IV"
        title="CURRENT BROTHERHOOD POSITION"
        sub="STATION & ORGANIZATIONAL SEAT"
        wide
      >
        <div className="dash-dossier-grid is-three">
          <DossierField label="COUNTRY" value={country} />
          <DossierField label="STATION" value={role} />
          <DossierField
            label="ORGANIZATION"
            value={undefined}
            sub="REGIONAL BODY OF RECORD"
          />
          <DossierField label="PREFECTURE" value={record.prefecture} />
          <DossierField label="DIRECTORATE" value={record.directorate} />
          <DossierField
            label="MINERVAL ASSEMBLY"
            value={record.minervalAssembly}
          />
          <DossierField label="CELL" value={record.cell} />
        </div>
      </DossierSection>

      <div className="dash-dossier-pair">
        <DossierSection
          index="V"
          title="INSINUATOR / INTRODUCTION"
          sub="THE MEMBER'S RECORDED INTRODUCER"
        >
          <DossierField
            label="INSINUATOR"
            value={record.insinuatorName}
            sub="The member's recorded introducer will appear here once officially recorded."
          />
        </DossierSection>

        <DossierSection
          index="VI"
          title="MEMBERSHIP STATUS"
          sub="OFFICIAL STANDING WITHIN THE ORDER"
        >
          <div className="dash-dossier-status">
            <span className="dash-dossier-status-label">MEMBERSHIP STATUS</span>
            <span className="dash-dossier-status-value">{record.status}</span>
            <span className="dash-dossier-status-rule" aria-hidden="true" />
          </div>
          <div className="dash-dossier-grid">
            <DossierField
              label="MEMBERSHIP TYPE"
              value={record.membershipType}
            />
            <DossierField label="ROLE" value={record.role} />
            <DossierField label="CURRENT STATION" value={role} />
            <DossierField label="COUNTRY" value={country} uppercase />
            <DossierField
              label="COUNTRY INITIATOR"
              value={record.countryInitiator}
              uppercase
            />
          </div>
        </DossierSection>
      </div>

      <div className="dash-dossier-notice" role="note">
        <h2 className="dash-dossier-notice-title">OFFICIAL MEMBERSHIP RECORD</h2>
        <p className="dash-dossier-notice-text">
          This page reflects the recorded Brotherhood membership information
          preserved for this member.
        </p>
        <p className="dash-dossier-notice-text">
          The recorded initiatory journey began in {journey.journeyBegan}; formal
          approval and full membership were entered in the official Brotherhood
          registry in {journey.formalApproval}.
        </p>
      </div>
    </div>
  );
}