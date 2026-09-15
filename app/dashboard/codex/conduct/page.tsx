// ============================================================
// VEIL — The Codex · Conduct & Discipline
// The formal chamber of conduct, obligations, violations,
// accountability, discipline, hearings, and restoration.
//
// Each principle, violation, level, and process shown here is
// original VEIL doctrine created for this fictional project.
// It is NOT real-world law, and it is not connected to any
// actual member disciplinary record.
//
// Content rules honored:
//   • Only the authorized doctrine supplied for this chamber is
//     displayed. Nothing is invented beyond it.
//   • Restrained crimson is used only for serious matters.
//   • No individual disciplinary cases, complaints, records,
//     accusations, or member names are shown. The privacy of the
//     record is preserved; restricted administrative systems
//     handle individual cases separately.
//   • No physical punishment, violence, or threat imagery is
//     introduced. The weight of this chamber is accountability,
//     order, silence, authority, consequence, and memory.
// ============================================================

import Link from 'next/link';
import type { ReactNode } from 'react';
import VeilEmblem from '../../../login/components/VeilEmblem';

interface ConductItem {
  index: string;
  title: string;
  text: string;
}

interface ConductSectionProps {
  index: string;
  title: string;
  sub: string;
  children: ReactNode;
}

const CONDUCT_PRINCIPLES: ConductItem[] = [
  {
    index: 'I',
    title: 'HONOR THE WORD',
    text: "A member's word is not given casually. What is promised before the Brotherhood must be treated with seriousness.",
  },
  {
    index: 'II',
    title: 'GUARD WHAT IS ENTRUSTED',
    text: 'Information entrusted within the Brotherhood must not be exposed carelessly or used for personal advantage.',
  },
  {
    index: 'III',
    title: 'DO NOT ABUSE THE VEIL',
    text: 'The Brotherhood must never be used to pursue personal hatred, intimidation, revenge, fraud, greed, or cruelty.',
  },
  {
    index: 'IV',
    title: 'RESPECT THE BROTHERHOOD',
    text: 'A member shall conduct himself with discipline and dignity in matters representing the Brotherhood.',
  },
  {
    index: 'V',
    title: 'DO NOT CORRUPT AUTHORITY',
    text: 'Authority exists for service and order, not vanity, domination, or personal enrichment.',
  },
  {
    index: 'VI',
    title: 'SPEAK TRUTHFULLY',
    text: 'False accusations, deliberate deception, fabricated records, and manipulation of Brotherhood processes are serious violations.',
  },
  {
    index: 'VII',
    title: 'PROTECT THE RECORD',
    text: 'Official Brotherhood records must not be altered, destroyed, concealed, or falsified without authorized cause.',
  },
  {
    index: 'VIII',
    title: 'ACCEPT ACCOUNTABILITY',
    text: 'A member who violates the Code must face the consequences of his actions honestly.',
  },
];

const SERIOUS_VIOLATIONS: ConductItem[] = [
  {
    index: 'I',
    title: 'BETRAYAL OF TRUST',
    text: 'Knowingly exposing protected Brotherhood information for unauthorized purposes.',
  },
  {
    index: 'II',
    title: 'FALSE RECORD',
    text: 'Knowingly creating, altering, or submitting false Brotherhood information.',
  },
  {
    index: 'III',
    title: 'ABUSE OF AUTHORITY',
    text: 'Using Brotherhood authority for intimidation, personal gain, revenge, or improper influence.',
  },
  {
    index: 'IV',
    title: 'DELIBERATE DECEPTION',
    text: 'Knowingly misleading the Brotherhood in a matter of significance.',
  },
  {
    index: 'V',
    title: 'CORRUPTION',
    text: 'Using Brotherhood resources, position, or influence for personal enrichment or unlawful purposes.',
  },
  {
    index: 'VI',
    title: 'HARM AGAINST A BROTHER',
    text: 'Deliberate conduct intended to seriously harm another member.',
  },
];

const CONSEQUENCE_LEVELS: ConductItem[] = [
  {
    index: 'I',
    title: 'WARNING',
    text: 'A formal warning for lesser violations or first incidents.',
  },
  {
    index: 'II',
    title: 'CENSURE',
    text: 'A formal recognition that conduct has violated Brotherhood standards.',
  },
  {
    index: 'III',
    title: 'SUSPENSION',
    text: 'Temporary removal of specified Brotherhood privileges or participation.',
  },
  {
    index: 'IV',
    title: 'SEPARATION',
    text: 'Removal of Brotherhood membership following proper authority and procedure.',
  },
];

const HEARING_PROCESS = ['REPORT', 'REVIEW', 'HEARING', 'DECISION', 'RECORD'];

const RESTORATION_PATH = ['ACCOUNTABILITY', 'CORRECTION', 'PROVEN CHANGE'];

function ConductSection({ index, title, sub, children }: ConductSectionProps) {
  return (
    <section className="dash-conduct-section">
      <header className="dash-conduct-section-head">
        <span className="dash-conduct-section-index" aria-hidden="true">
          {index}
        </span>
        <div className="dash-conduct-section-copy">
          <h3 className="dash-conduct-section-title">{title}</h3>
          <p className="dash-conduct-section-sub">{sub}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function ConductRule({ className }: { className?: string }) {
  return (
    <div
      className={`dash-conduct-rule${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <span className="dash-conduct-rule-line" />
      <span className="dash-conduct-rule-seal">◆</span>
      <span className="dash-conduct-rule-line" />
    </div>
  );
}

function ConductLockline({ className }: { className?: string }) {
  return (
    <div
      className={`dash-conduct-lockline${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <span>CONDUCT</span>
      <span className="dash-conduct-lockline-sep">◆</span>
      <span>ACCOUNTABILITY</span>
      <span className="dash-conduct-lockline-sep">◆</span>
      <span>RECORD</span>
    </div>
  );
}

interface ConductFlowProps {
  steps: string[];
  final: string;
  label: string;
}

function ConductFlow({ steps, final, label }: ConductFlowProps) {
  return (
    <ol className="dash-conduct-flow" aria-label={label}>
      {steps.map((step) => (
        <li className="dash-conduct-flow-item" key={step}>
          <span className="dash-conduct-flow-step">{step}</span>
          <span className="dash-conduct-flow-arrow" aria-hidden="true">
            ↓
          </span>
        </li>
      ))}
      <li className="dash-conduct-flow-item">
        <span className="dash-conduct-flow-final">
          <span className="dash-conduct-flow-final-item">{final}</span>
        </span>
      </li>
    </ol>
  );
}

function ConductGrid({ items, className }: { items: ConductItem[]; className?: string }) {
  return (
    <ul className={`dash-conduct-grid${className ? ` ${className}` : ''}`}>
      {items.map((item) => (
        <li className="dash-conduct-card" key={item.index}>
          <span className="dash-conduct-card-index" aria-hidden="true">
            {item.index}
          </span>
          <h4 className="dash-conduct-card-title">{item.title}</h4>
          <p className="dash-conduct-card-text">{item.text}</p>
        </li>
      ))}
    </ul>
  );
}

export default function ConductDisciplinePage() {
  return (
    <div className="dash-conduct">
      <div className="dash-dossier-nav">
        <Link href="/dashboard" className="dash-dossier-back">
          <span aria-hidden="true">←</span>
          MY VEIL · OVERVIEW
        </Link>
      </div>

      {/* --- Chamber header --- */}
      <header className="dash-conduct-head">
        <ConductLockline />
        <p className="dash-conduct-eyebrow">THE CODEX · CHAMBER OF ACCOUNTABILITY</p>
        <h1 className="dash-conduct-title">CONDUCT &amp; DISCIPLINE</h1>
        <p className="dash-conduct-sub">THE GOVERNANCE OF THE ORDER</p>
        <ConductRule />
        <p className="dash-conduct-line">
          The formal chamber of conduct, obligations, violations, accountability,
          discipline, hearings, and restoration.
        </p>
        <ConductLockline className="is-foot" />
      </header>

      {/* --- Core principle --- */}
      <section className="dash-conduct-principle" aria-label="THE VEIL REMEMBERS">
        <div className="dash-conduct-principle-inner">
          <VeilEmblem className="dash-conduct-principle-emblem" />
          <p className="dash-conduct-principle-kicker">THE PRINCIPLE OF THE RECORD</p>
          <h2 className="dash-conduct-principle-title">THE VEIL REMEMBERS.</h2>
          <ConductRule className="is-principle" />
          <p className="dash-conduct-principle-line">
            Every word leaves a mark.
            <br />
            Every action leaves a record.
            <br />
            Every choice carries its weight.
          </p>
        </div>
      </section>

      {/* --- Section I — The Code of Conduct --- */}
      <ConductSection
        index="I"
        title="THE CODE OF CONDUCT"
        sub="THE PRINCIPLES OF THE ORDER"
      >
        <ConductGrid items={CONDUCT_PRINCIPLES} />
        <p className="dash-conduct-postscript">
          The Code binds every member. Ignorance of it is no release from its
          weight.
        </p>
      </ConductSection>

      {/* --- Section II — Serious Violations --- */}
      <ConductSection
        index="II"
        title="SERIOUS VIOLATIONS"
        sub="WHAT THE BROTHERHOOD CANNOT BEAR"
      >
        <ConductGrid items={SERIOUS_VIOLATIONS} className="is-crimson" />
        <p className="dash-conduct-postscript is-warn">
          Each of these, established in fact and proven in procedure, demands the
          full weight of the chamber.
        </p>
      </ConductSection>

      {/* --- Section III — The Weight of Consequence --- */}
      <ConductSection
        index="III"
        title="THE WEIGHT OF CONSEQUENCE"
        sub="THE LEVELS OF DISCIPLINE"
      >
        <ConductGrid items={CONSEQUENCE_LEVELS} />
        <div className="dash-conduct-note" role="note">
          <span className="dash-conduct-note-seal" aria-hidden="true">
            ◇
          </span>
          <p className="dash-conduct-note-text">
            These levels are VEIL disciplinary categories within the fictional
            Brotherhood governance model. They are not real-world legal penalties.
          </p>
        </div>
      </ConductSection>

      {/* --- Section IV — The Hearing --- */}
      <ConductSection
        index="IV"
        title="BEFORE THE CHAMBER"
        sub="THE COURSE OF A DISCIPLINARY MATTER"
      >
        <div className="dash-conduct-statement">
          <p>
            No member is condemned by rumor.
            <br />
            A matter requiring discipline must be examined.
            <br />
            The accused must be heard.
            <br />
            The record must be preserved.
            <br />
            The decision must be made by proper authority.
          </p>
        </div>
        <ConductFlow
          steps={HEARING_PROCESS}
          final="RESTORATION OR SEPARATION"
          label="THE DISCIPLINARY PROCESS"
        />
        <div className="dash-conduct-note" role="note">
          <span className="dash-conduct-note-seal" aria-hidden="true">
            ◇
          </span>
          <p className="dash-conduct-note-text">
            The hearing is the fictional Brotherhood governance model. It conducts
            no actual legal proceedings.
          </p>
        </div>
      </ConductSection>

      {/* --- Section V — The Record --- */}
      <ConductSection
        index="V"
        title="THE VEIL REMEMBERS"
        sub="THE PERMANENCE OF THE RECORD"
      >
        <div className="dash-conduct-statement is-center">
          <p>
            A punishment may end.
            <br />
            A lesson may fade.
            <br />
            But the record of what occurred must not be rewritten.
          </p>
        </div>
        <div className="dash-conduct-record">
          <h4 className="dash-conduct-record-title">DISCIPLINARY RECORDS</h4>
          <p className="dash-conduct-record-text">
            All authorized disciplinary decisions remain part of the
            Brotherhood&apos;s historical record according to the rules governing
            access and retention.
          </p>
          <span className="dash-conduct-record-rule" aria-hidden="true" />
        </div>
        <div className="dash-conduct-note" role="note">
          <span className="dash-conduct-note-seal" aria-hidden="true">
            ◇
          </span>
          <p className="dash-conduct-note-text">
            Individual disciplinary records, complaints, and investigations are
            confidential and are not displayed in this chamber.
          </p>
        </div>
      </ConductSection>

      {/* --- Section VI — Restoration --- */}
      <ConductSection
        index="VI"
        title="THE RETURN"
        sub="THE PATH OF RESTORATION"
      >
        <div className="dash-conduct-statement">
          <p>
            Discipline is not always the end.
            <br />
            Where accountability has been accepted, trust may be rebuilt.
            <br />
            Where correction has been demonstrated, restoration may be considered.
          </p>
        </div>
        <ConductFlow
          steps={RESTORATION_PATH}
          final="RESTORATION"
          label="THE PATH OF RESTORATION"
        />
        <div className="dash-conduct-note" role="note">
          <span className="dash-conduct-note-seal" aria-hidden="true">
            ◇
          </span>
          <p className="dash-conduct-note-text">
            Restoration is not automatic. It is considered, never compelled.
          </p>
        </div>
      </ConductSection>

      {/* --- Final warning --- */}
      <section className="dash-conduct-memorial" aria-label="FINAL WARNING">
        <div className="dash-conduct-memorial-inner">
          <p className="dash-conduct-memorial-kicker">FINAL WARNING</p>
          <h2 className="dash-conduct-memorial-title">THE VEIL DOES NOT FORGET.</h2>
          <ConductRule className="is-memorial" />
          <p className="dash-conduct-memorial-line">
            The Brotherhood may forgive.
            <br />
            The Brotherhood may restore.
            <br />
            But the record shall not be rewritten.
          </p>
        </div>
      </section>

      {/* --- Chamber notice --- */}
      <div className="dash-dossier-notice" role="note">
        <h2 className="dash-dossier-notice-title">CODEX NOTICE</h2>
        <p className="dash-dossier-notice-text">
          This chamber contains official VEIL doctrine created for this project,
          presented within the fictional Brotherhood governance model.
        </p>
        <p className="dash-dossier-notice-text">
          It is not real-world law, and it is not connected to any actual member
          disciplinary record.
        </p>
      </div>
    </div>
  );
}