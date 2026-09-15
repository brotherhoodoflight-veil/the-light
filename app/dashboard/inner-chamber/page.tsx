// ============================================================
// VEIL — Inner Chamber · Restricted Access
//
// THE THRESHOLD IS A BOUNDARY, NOT A REWARD.
//
// This page is the most restricted area currently visible in the
// member portal. It renders the threshold, not the material beyond
// it. No restricted content is exposed here. Access state is
// computed server-side from the member's authorization seam in
// lib/auth/inner-chamber.ts; nothing on this page unlocks a
// client-side mechanism, and no secret route grants access.
//
// FICTIONAL CANON: All descriptions of the Inner Chamber are
// fictional Brotherhood-of-Light (VEIL) atmosphere, not claims
// about any real organization or any real individual.
// ============================================================

import Link from 'next/link';
import type { ReactNode } from 'react';
import { getSessionPayload } from '../../../lib/auth/session-server';
import { roleShortLabel } from '../../../lib/auth/role-labels';
import { getInnerChamberAccess } from '../../../lib/auth/inner-chamber';

// ------------------------------------------------------------
// Shared structural helpers
// ------------------------------------------------------------

function ChamberRule({ className }: { className?: string }) {
  return (
    <div
      className={`dash-codex-rule${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <span className="dash-codex-rule-line" />
      <span className="dash-codex-rule-seal">◆</span>
      <span className="dash-codex-rule-line" />
    </div>
  );
}

function ChamberLockline({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div
      className={`dash-archive-lockline${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      {items.map((item, i) => (
        <span key={item}>
          {i > 0 ? <span className="dash-archive-lockline-sep">◆</span> : null}
          {item}
        </span>
      ))}
    </div>
  );
}

function ChamberCorners() {
  return (
    <>
      <span className="dash-chamber-corner is-tl" aria-hidden="true" />
      <span className="dash-chamber-corner is-tr" aria-hidden="true" />
      <span className="dash-chamber-corner is-bl" aria-hidden="true" />
      <span className="dash-chamber-corner is-br" aria-hidden="true" />
    </>
  );
}

function ChamberSection({
  index,
  title,
  sub,
  tone,
  children,
}: {
  index: string;
  title: string;
  sub: string;
  tone?: 'threshold';
  children: ReactNode;
}) {
  const toneClass = tone ? ` is-${tone}` : '';
  return (
    <section className={`dash-codex-section${toneClass}`}>
      <header className="dash-codex-section-head">
        <span className="dash-codex-section-index" aria-hidden="true">
          {index}
        </span>
        <h3 className="dash-codex-section-title">{title}</h3>
        <p className="dash-codex-section-sub">{sub}</p>
      </header>
      {children}
    </section>
  );
}

function ChamberPassage({ lines }: { lines: string[] }) {
  return (
    <div className="dash-archive-passage">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function ChamberFieldRow({
  label,
  value,
  absent,
}: {
  label: string;
  value: string;
  absent?: boolean;
}) {
  return (
    <div className="dash-chamber-field">
      <dt className="dash-chamber-field-label">{label}</dt>
      <dd className={`dash-chamber-field-value${absent ? ' is-absent' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

// ------------------------------------------------------------
// The door of the threshold (CSS-only motif, no images)
// ------------------------------------------------------------

function ChamberDoor() {
  return (
    <div className="dash-chamber-door" aria-hidden="true">
      <span className="dash-chamber-door-frame is-outer" />
      <span className="dash-chamber-door-frame is-inner" />
      <span className="dash-chamber-door-hairline is-lintel" />
      <span className="dash-chamber-door-hairline is-sill" />
      <span className="dash-chamber-door-light" />
      <span className="dash-chamber-door-jewel" />
    </div>
  );
}

// ------------------------------------------------------------
// The page
// ------------------------------------------------------------

export default async function InnerChamberPage() {
  const session = await getSessionPayload();
  const user = session?.user ?? null;

  const displayName = user
    ? (user.fullName ?? [user.firstName, user.lastName].filter(Boolean).join(' '))
    : 'UNKNOWN';

  const access = getInnerChamberAccess(user);

  const CATEGORIES = [
    'RESTRICTED BROTHERHOOD RECORDS',
    'ADVANCED CEREMONIAL MATERIAL',
    'INNER BROTHERHOOD DOCUMENTS',
    'AUTHORIZED DELIBERATIONS',
    'SEALED ARCHIVE MATERIAL',
  ];

  const PRINCIPLES = [
    {
      numeral: 'I',
      title: 'ACCESS IS GRANTED, NOT ASSUMED.',
      text: 'Membership alone does not establish access to every chamber.',
    },
    {
      numeral: 'II',
      title: 'AUTHORITY MUST BE RECORDED.',
      text: 'An authorization without a record cannot be treated as established authority.',
    },
    {
      numeral: 'III',
      title: 'RESTRICTION PROTECTS PURPOSE.',
      text: 'Restricted information is protected because its purpose matters.',
    },
    {
      numeral: 'IV',
      title: 'THE RECORD CONTROLS THE CLAIM.',
      text: 'Where the archive does not establish access, the system must not assume it.',
    },
    {
      numeral: 'V',
      title: 'THE VEIL IS NOT A REWARD.',
      text: 'Restricted knowledge is not a prize. It carries responsibility.',
    },
  ];

  return (
    <div className="dash-chamber">
      <div className="dash-dossier-nav">
        <Link href="/dashboard" className="dash-dossier-back">
          <span aria-hidden="true">←</span>
          MY VEIL · OVERVIEW
        </Link>
      </div>

      {/* --- Page head --- */}
      <header className="dash-archive-head">
        <ChamberLockline
          items={['THE INNER CHAMBER', 'RESTRICTED ACCESS', 'THE THRESHOLD GUARDS THE RECORD']}
        />
        <p className="dash-archive-eyebrow">THE VEIL · RESTRICTED</p>
        <h1 className="dash-archive-title">INNER CHAMBER</h1>
        <p className="dash-archive-sub">RESTRICTED ACCESS · THE INNER VEIL</p>
        <ChamberRule />
        <p className="dash-archive-line">
          Beyond the ordinary chambers lies a deeper part of the Veil.
          <br />
          Its records are not available to every member.
          <br />
          Access is determined by Brotherhood authority, recorded station,
          and permission.
        </p>

        <div className="dash-chamber-status">
          <ChamberCorners />
          <p className="dash-chamber-status-label">CURRENT ACCESS STATUS</p>
          <p
            className={`dash-chamber-status-value${
              access.granted ? ' is-granted' : ''
            }`}
          >
            {access.granted ? 'GRANTED' : 'NOT YET GRANTED'}
          </p>
          <span className="dash-chamber-status-rule" aria-hidden="true" />
          <p className="dash-chamber-status-support">
            {access.granted
              ? 'Your current membership record contains an authorization for the Inner Chamber. This page displays no restricted material.'
              : 'Your current membership record does not contain an authorization granting access to the Inner Chamber.'}
          </p>
        </div>
        <span className="dash-archive-canon">FICTIONAL BROTHERHOOD CANON · VEIL</span>
      </header>

      {/* --- Section I — The Threshold --- */}
      <ChamberSection
        index="I"
        title="THE THRESHOLD"
        sub="THE BOUNDARY, NOT THE REWARD"
        tone="threshold"
      >
        <ChamberDoor />
        <ChamberPassage
          lines={[
            'Every chamber has a threshold.',
            'The existence of a locked door does not mean the record behind it is lost.',
            'It means the record has a boundary.',
          ]}
        />
        <ChamberPassage
          lines={[
            'Those boundaries exist to protect the Brotherhood\u2019s records, its members, and the purpose for which restricted knowledge was preserved.',
          ]}
        />
        <p className="dash-chamber-door-caption">THE DOOR IS PRESENT.</p>
      </ChamberSection>

      {/* --- Section II — Access Record --- */}
      <ChamberSection
        index="II"
        title="ACCESS RECORD"
        sub="THE MEMBER'S RECORDED POSITION"
      >
        <div className="dash-chamber-sheet" role="note" aria-label="ACCESS RECORD">
          <p className="dash-chamber-sheet-kicker">ACCESS RECORD</p>
          <span className="dash-chamber-sheet-rule" aria-hidden="true" />
          <dl className="dash-chamber-sheet-fields">
            <ChamberFieldRow label="CURRENT MEMBER" value={displayName} />
            <ChamberFieldRow label="MEMBERSHIP ID" value={user?.memberId ?? '—'} />
            <ChamberFieldRow label="ROLE" value={user ? roleShortLabel(user.role) : '—'} />
            <ChamberFieldRow
              label="ACCESS LEVEL"
              value={access.accessLevel}
              absent={!access.granted}
            />
            <ChamberFieldRow
              label="AUTHORIZATION"
              value={access.authorization}
              absent={!access.granted}
            />
            <ChamberFieldRow label="LAST ACCESS" value={access.lastAccess} absent />
          </dl>
        </div>
      </ChamberSection>

      {/* --- Section III — Within the Inner Chamber --- */}
      <ChamberSection
        index="III"
        title="WITHIN THE INNER CHAMBER"
        sub="INTENDED STRUCTURE — NOT CONFIRMED CONTENT"
      >
        <ChamberPassage
          lines={[
            'The Inner Chamber is not described here by its contents.',
            'It is described by the categories of material that a restricted chamber of this kind may hold.',
          ]}
        />
        <ul className="dash-chamber-categories">
          {CATEGORIES.map((title) => (
            <li className="dash-chamber-category" key={title}>
              <span className="dash-chamber-category-mark" aria-hidden="true">
                ◆
              </span>
              <h4 className="dash-chamber-category-title">{title}</h4>
              <p className="dash-chamber-category-status">ACCESS CONTROLLED</p>
            </li>
          ))}
        </ul>
        <p className="dash-chamber-disclaimer" role="note">
          Restricted categories shown here describe the intended structure of
          the Inner Chamber. They do not confirm that corresponding records
          currently exist.
        </p>
      </ChamberSection>

      {/* --- Section IV — The Law of the Threshold --- */}
      <ChamberSection
        index="IV"
        title="THE LAW OF THE THRESHOLD"
        sub="PRINCIPLES OF THE BOUNDARY"
      >
        <section className="dash-chamber-law" aria-label="THE LAW OF THE THRESHOLD">
          <ChamberCorners />
          <div className="dash-chamber-law-inner">
            {PRINCIPLES.map((principle) => (
              <div className="dash-chamber-law-principle" key={principle.numeral}>
                <span
                  className="dash-chamber-law-numeral"
                  aria-hidden="true"
                >
                  {principle.numeral}.
                </span>
                <div className="dash-chamber-law-copy">
                  <h4 className="dash-chamber-law-title">{principle.title}</h4>
                  <p className="dash-chamber-law-text">“{principle.text}”</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ChamberSection>

      {/* --- Section V — Request Access --- */}
      <ChamberSection
        index="V"
        title="REQUEST ACCESS"
        sub="NO REQUEST WORKFLOW IS ENABLED"
      >
        <div className="dash-chamber-request" role="note" aria-label="REQUEST ACCESS">
          <div className="dash-chamber-request-line">
            <dt className="dash-chamber-request-label">INNER CHAMBER ACCESS</dt>
            <dd className="dash-chamber-request-value">CURRENTLY UNAVAILABLE</dd>
          </div>
          <p className="dash-chamber-request-text">
            Your current Brotherhood record does not show authorization for
            this chamber.
          </p>
          <span className="dash-chamber-request-rule" aria-hidden="true" />
          <div className="dash-chamber-request-line">
            <dt className="dash-chamber-request-label">ACCESS REQUESTS</dt>
            <dd className="dash-chamber-request-value is-absent">NOT YET AVAILABLE</dd>
          </div>
          <p className="dash-chamber-request-text">
            An access request workflow will appear here when Brotherhood
            administration enables it.
          </p>
        </div>
      </ChamberSection>

      {/* --- Section VI — The Watcher --- */}
      <ChamberSection
        index="VI"
        title="THE WATCHER"
        sub="THE GUARDIAN OF THE THRESHOLD"
      >
        <ChamberPassage
          lines={[
            'Every restricted chamber requires a keeper of its boundary.',
            'The Watcher does not reveal what lies beyond the threshold.',
            'The Watcher ensures that the threshold remains meaningful.',
          ]}
        />
        <div className="dash-chamber-sheet is-compact" role="note" aria-label="THE WATCHER">
          <p className="dash-chamber-sheet-kicker">THE WATCHER</p>
          <span className="dash-chamber-sheet-rule" aria-hidden="true" />
          <dl className="dash-chamber-sheet-fields">
            <ChamberFieldRow label="ROLE" value="ARCHIVE GUARDIAN" />
            <ChamberFieldRow label="STATUS" value="NOT ASSIGNED" absent />
          </dl>
        </div>
      </ChamberSection>

      {/* --- Final ceremonial closing --- */}
      <section className="dash-chamber-closing" aria-label="THE VEIL REMAINS">
        <div className="dash-chamber-closing-inner">
          <ChamberCorners />
          <p className="dash-chamber-closing-kicker">THE INNER CHAMBER</p>
          <p className="dash-chamber-closing-lines">
            THE DOOR IS NOT CLOSED BECAUSE THERE IS NOTHING BEYOND IT.
            <br />
            <br />
            THE DOOR IS CLOSED BECAUSE NOT EVERY RECORD BELONGS TO EVERY HAND.
          </p>
          <ChamberRule className="is-closing" />
          <p className="dash-chamber-closing-title">THE VEIL REMAINS.</p>
          <span className="dash-chamber-closing-rule" aria-hidden="true" />
          <p className="dash-chamber-closing-label">
            INNER CHAMBER
            <br />
            RESTRICTED ACCESS
          </p>
        </div>
      </section>

      <div className="dash-chamber-calldown" role="note">
        <ChamberLockline
          items={['INNER CHAMBER', 'RESTRICTED ACCESS', 'FICTIONAL CANON']}
        />
      </div>
    </div>
  );
}