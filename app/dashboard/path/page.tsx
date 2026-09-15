// ============================================================
// VEIL — My Journey · The Path
// The member's recorded journey, progression, and recognized
// movement within the Brotherhood of Light.
//
// THE PATH is deliberately distinct from MY MEMBERSHIP (the
// official registry dossier) and MY PROFILE (the personal
// identity record). It reads as a formal historical record of
// the member's path through the Brotherhood.
//
// Data rules honored:
//   • Identity is read from the authenticated member's live
//     database record — never invented.
//   • Registry facts already of record (member ID, role, status,
//     membership type, country) are shown on the Path because
//     they are genuinely recorded in the official registry.
//   • The recorded initiatory journey is preserved: it began in
//     2019 and was formally recognized with full membership in
//     2026. THE JOURNEY PRECEDED THE RECOGNITION.
//   • No doctrine, ranks, degrees, or rituals are taught here.
// ============================================================

import Link from 'next/link';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionPayload } from '../../../lib/auth/session-server';
import { prisma } from '../../../lib/db';
import {
  memberRecordViewFromDb,
  memberRecordViewFromSession,
  type MemberRecordView,
} from '../components/MemberPanels';
import { buildMembershipJourney } from '../../../lib/membership-journey';

export const dynamic = 'force-dynamic';

function PathField({ label, value }: { label: string; value: string }) {
  return (
    <div className="dash-field">
      <p className="dash-field-label">{label}</p>
      <p className="dash-field-value is-caps">{value}</p>
    </div>
  );
}

interface PathSectionProps {
  index: string;
  title: string;
  sub: string;
  children: ReactNode;
  wide?: boolean;
}

function PathSection({ index, title, sub, children, wide }: PathSectionProps) {
  return (
    <section
      className={`dash-dossier-section dash-path-section${wide ? ' is-wide' : ''}`}
    >
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

interface StageRecordProps {
  label: string;
  value: string;
  description?: string;
  emphasized?: boolean;
}

function StageRecord({ label, value, description, emphasized }: StageRecordProps) {
  return (
    <div className="dash-path-stage-record">
      <div className="dash-path-status">
        <span className="dash-path-status-label">{label}</span>
        <span
          className={`dash-path-status-value${emphasized ? ' is-emph' : ''}`}
        >
          {value}
        </span>
        <span className="dash-path-status-rule" aria-hidden="true" />
      </div>
      {description ? <p className="dash-path-status-desc">{description}</p> : null}
    </div>
  );
}

interface TimelineStage {
  index: string;
  period: string;
  title: string;
  description: string;
  current?: boolean;
}

function recordedPathStages(journey: {
  journeyBegan: string;
  preparationPeriod: string;
  reviewPeriod: string;
  formalApproval: string;
  fullMembership: string;
}): TimelineStage[] {
  return [
    {
      index: 'I',
      period: journey.journeyBegan,
      title: 'THE BEGINNING',
      description:
        'First introduction to the Brotherhood and entry into the initiation path.',
    },
    {
      index: 'II',
      period: journey.preparationPeriod,
      title: 'PREPARATION',
      description:
        'Period of preparation, instruction, observation, and development.',
    },
    {
      index: 'III',
      period: journey.reviewPeriod,
      title: 'REVIEW',
      description:
        'Continued journey and review of readiness, conduct, and commitment.',
    },
    {
      index: 'IV',
      period: journey.formalApproval,
      title: 'APPROVAL',
      description: 'Formal approval for full membership.',
    },
    {
      index: 'V',
      period: journey.fullMembership,
      title: 'RECOGNITION',
      description:
        'Full membership entered into the official Brotherhood registry.',
    },
    {
      index: 'VI',
      period: 'CURRENT',
      title: 'THE MEMBER',
      description: 'Active full member of the Brotherhood.',
      current: true,
    },
  ];
}

export default async function PathPage() {
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

  const initials = record.initials;
  const fullName = record.fullName;
  const memberId = record.memberId;
  const station = record.role ?? 'MEMBER';
  const membershipStatus = record.status ?? 'ACTIVE';
  const membershipType = record.membershipType ?? 'MEMBER';
  const country = (record.country ?? 'GHANA').toUpperCase();

  return (
    <div className="dash-path">
      <div className="dash-dossier-nav">
        <Link href="/dashboard" className="dash-dossier-back">
          <span aria-hidden="true">←</span>
          MY VEIL · OVERVIEW
        </Link>
      </div>

      <section className="dash-hero dash-hero-module dash-path-hero">
        <div className="dash-hero-seal" aria-hidden="true">
          <span className="dash-hero-seal-inner">◈</span>
        </div>
        <div className="dash-hero-copy">
          <p className="dash-hero-eyebrow">HISTORICAL RECORD OF PROGRESSION</p>
          <h1 className="dash-hero-title">THE PATH</h1>
          <p className="dash-hero-order">YOUR JOURNEY WITHIN THE BROTHERHOOD</p>
          <div className="dash-hero-divider" aria-hidden="true" />
          <p className="dash-hero-line">
            Your recorded journey, progression, and recognized movement within
            the Brotherhood of Light.
          </p>

          <div className="dash-path-identity">
            <div className="dash-path-identity-person">
              <span className="dash-path-identity-initials" aria-hidden="true">
                {initials}
              </span>
              <span className="dash-path-identity-name">{fullName}</span>
              <span className="dash-path-identity-id">{memberId}</span>
            </div>
            <span className="dash-path-identity-divider" aria-hidden="true" />
            <div className="dash-path-identity-station">
              <span className="dash-path-identity-station-label">
                CURRENT STATION
              </span>
              <span className="dash-path-identity-station-value">{station}</span>
            </div>
          </div>
        </div>
      </section>

      <PathSection
        index="I"
        title="CURRENT POSITION"
        sub="RECOGNIZED POSITION IN THE BROTHERHOOD"
        wide
      >
        <div className="dash-dossier-grid">
          <PathField label="CURRENT STATION" value={station} />
          <PathField label="MEMBERSHIP STATUS" value={membershipStatus} />
          <PathField label="MEMBERSHIP TYPE" value={membershipType} />
          <PathField label="MEMBER ID" value={memberId} />
          <PathField label="COUNTRY" value={country} />
        </div>
      </PathSection>

      <PathSection
        index="II"
        title="THE RECORDED PATH"
        sub={`HISTORICAL JOURNEY · ${journey.span}`}
        wide
      >
        <div className="dash-path-timeline">
          <div className="dash-path-plaque" role="status">
            <span className="dash-path-plaque-seal" aria-hidden="true">
              ◈
            </span>
            <p className="dash-path-plaque-label">
              THE JOURNEY PRECEDED THE RECOGNITION
            </p>
            <p className="dash-path-plaque-desc">
              The recorded initiatory journey began in {journey.journeyBegan} and
              was formally recognized with full membership in{' '}
              {journey.fullMembership}.
            </p>
          </div>

          <ol className="dash-path-timeline-stages" aria-label="Recorded path stages">
            {recordedPathStages(journey).map((stage) => (
              <li
                key={stage.title}
                className={`dash-path-stage${stage.current ? ' is-current' : ''}`}
              >
                <span className="dash-path-stage-node" aria-hidden="true" />
                <div className="dash-path-stage-body">
                  <span className="dash-path-stage-index" aria-hidden="true">
                    {stage.index}
                  </span>
                  <div className="dash-path-stage-text">
                    <p className="dash-path-stage-title">{stage.title}</p>
                    <p className="dash-path-stage-note">{stage.period}</p>
                    {stage.description ? (
                      <p className="dash-path-stage-desc">{stage.description}</p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <p className="dash-path-timeline-note">
            THE RECORDED JOURNEY IS PRESERVED IN THE OFFICIAL REGISTRY
          </p>
        </div>
      </PathSection>

      <div className="dash-dossier-pair">
        <PathSection
          index="III"
          title="THE BEGINNING"
          sub="THE RECORDED ORIGIN"
        >
          <StageRecord
            label="JOURNEY BEGAN"
            value={journey.journeyBegan}
            description="First introduction to the Brotherhood and entry into the initiation path."
            emphasized
          />
        </PathSection>

        <PathSection
          index="IV"
          title="ADVANCEMENT"
          sub="RECOGNIZED MOVEMENT WITHIN THE ORDER"
        >
          <StageRecord
            label="ADVANCEMENT"
            value="NO ADVANCEMENT RECORDS"
            description="Recognized advancement records will appear here once officially recorded."
          />
        </PathSection>
      </div>

      <div className="dash-dossier-pair">
        <PathSection
          index="V"
          title="APPOINTMENTS"
          sub="OFFICIAL BROTHERHOOD POSTINGS"
        >
          <StageRecord
            label="APPOINTMENTS"
            value="NO APPOINTMENTS RECORDED"
            description="Official Brotherhood appointments will appear here once recorded."
          />
        </PathSection>

        <PathSection
          index="VI"
          title="CURRENT STATION"
          sub="THE STATION OF RECORD"
        >
          <StageRecord
            label="CURRENT STATION"
            value={station}
            description="Your recognized station within the Brotherhood of Light as recorded in the official registry."
            emphasized
          />
          <div className="dash-dossier-grid">
            <PathField label="COUNTRY" value={country} />
            <PathField label="ROLE" value={station} />
            <PathField label="MEMBERSHIP STATUS" value={membershipStatus} />
            <PathField label="MEMBERSHIP TYPE" value={membershipType} />
          </div>
        </PathSection>
      </div>

      <div className="dash-dossier-notice" role="note">
        <h2 className="dash-dossier-notice-title">THE RECORDED PATH</h2>
        <p className="dash-dossier-notice-text">
          The recorded initiatory journey began in {journey.journeyBegan} and was
          formally recognized with full membership in {journey.fullMembership}.
        </p>
        <p className="dash-dossier-notice-text">
          THE JOURNEY PRECEDED THE RECOGNITION.
        </p>
      </div>
    </div>
  );
}