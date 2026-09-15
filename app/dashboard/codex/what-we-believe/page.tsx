// ============================================================
// VEIL — The Codex · What We Believe
// The Brotherhood's official beliefs/teachings chamber.
//
// CRITICAL CONTENT RULE:
// The official belief text is supplied separately. This page
// therefore presents the structure of the chamber and an honest
// record state — NO belief, doctrine, philosophy, commandment,
// spiritual teaching, or supernatural claim is invented.
//
// The only doctrinal reference present is the already-established
// CENTRAL FOUNDATION: the Great Amal Hamzaad, the Secret Hidden
// Angel — shown exactly as officially given, and never expanded
// upon with invented attributes or teachings.
// ============================================================

import Link from 'next/link';
import type { ReactNode } from 'react';
import VeilEmblem from '../../../login/components/VeilEmblem';

function CodexField({ label, value }: { label: string; value: string }) {
  return (
    <div className="dash-field">
      <p className="dash-field-label">{label}</p>
      <p className="dash-field-value is-caps">{value}</p>
    </div>
  );
}

interface CodexSectionProps {
  index: string;
  title: string;
  sub: string;
  children: ReactNode;
}

function CodexSection({ index, title, sub, children }: CodexSectionProps) {
  return (
    <section className="dash-codex-section">
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

function CodexRule({ className }: { className?: string }) {
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

export default function WhatWeBelievePage() {
  return (
    <div className="dash-codex">
      <div className="dash-dossier-nav">
        <Link href="/dashboard" className="dash-dossier-back">
          <span aria-hidden="true">←</span>
          MY VEIL · OVERVIEW
        </Link>
      </div>

      <header className="dash-codex-head">
        <p className="dash-codex-eyebrow">THE CODEX</p>
        <h1 className="dash-codex-title">WHAT WE BELIEVE</h1>
        <p className="dash-codex-sub">THE BELIEFS OF THE BROTHERHOOD</p>
        <CodexRule />
        <p className="dash-codex-line">
          The recognized principles and beliefs of the Brotherhood of Light are
          preserved within this chamber.
        </p>
      </header>

      <CodexSection
        index="I"
        title="THE BELIEF RECORD"
        sub="THE OFFICIAL RECORD OF BELIEF"
      >
        <div className="dash-codex-record-status">
          <span className="dash-codex-record-status-label">OFFICIAL BELIEFS</span>
          <span className="dash-codex-record-status-value">NOT YET RECORDED</span>
          <span className="dash-codex-record-status-rule" aria-hidden="true" />
        </div>
        <div className="dash-codex-passage">
          <p className="dash-codex-passage-text">
            The Brotherhood&apos;s officially recognized beliefs will be recorded
            here once the authorized Codex text has been entered.
          </p>
        </div>
      </CodexSection>

      <CodexSection
        index="II"
        title="CENTRAL FOUNDATION"
        sub="THE FOUNDATION RECOGNIZED BY THE BROTHERHOOD"
      >
        <div className="dash-codex-shrine">
          <div className="dash-codex-shrine-inner">
            <VeilEmblem className="dash-codex-shrine-emblem" />
            <p className="dash-codex-shrine-kicker">CENTRAL FOUNDATION</p>
            <h2 className="dash-codex-shrine-name">THE GREAT AMAL HAMZAAD</h2>
            <CodexRule className="is-shrine" />
            <p className="dash-codex-shrine-epithet">THE SECRET HIDDEN ANGEL</p>
            <p className="dash-codex-line">
              The Brotherhood has identified the Great Amal Hamzaad, the Secret
              Hidden Angel, as central to its service.
            </p>
          </div>
        </div>
      </CodexSection>

      <CodexSection
        index="III"
        title="RECOGNIZED BELIEFS"
        sub="APPROVED BELIEFS OF THE ORDER"
      >
        <div className="dash-codex-empty" role="status">
          <span className="dash-codex-empty-seal" aria-hidden="true">
            ◇
          </span>
          <p className="dash-codex-empty-label">NO OFFICIAL BELIEFS RECORDED</p>
          <p className="dash-codex-empty-desc">
            Official Brotherhood beliefs will appear here when formally entered
            and approved.
          </p>
          <p className="dash-codex-empty-intention">THIS IS INTENTIONAL</p>
        </div>
      </CodexSection>

      <CodexSection
        index="IV"
        title="CODEX STATUS"
        sub="THE STATUS OF THIS RECORD"
      >
        <div className="dash-codex-record-status">
          <span className="dash-codex-record-status-label">STATUS</span>
          <span className="dash-codex-record-status-value">
            AWAITING OFFICIAL TEXT
          </span>
          <span className="dash-codex-record-status-rule" aria-hidden="true" />
        </div>
        <div className="dash-dossier-grid">
          <CodexField label="RECORD TYPE" value="BROTHERHOOD BELIEFS" />
          <CodexField label="AUTHORITY" value="BROTHERHOOD OF LIGHT" />
        </div>
      </CodexSection>

      <div className="dash-dossier-notice" role="note">
        <h2 className="dash-dossier-notice-title">CODEX NOTICE</h2>
        <p className="dash-dossier-notice-text">
          Only officially recognized Brotherhood teachings entered into the Codex
          are to be treated as authoritative.
        </p>
        <p className="dash-dossier-notice-text">
          The absence of a teaching from this chamber must not be interpreted or
          supplemented by assumption.
        </p>
      </div>
    </div>
  );
}