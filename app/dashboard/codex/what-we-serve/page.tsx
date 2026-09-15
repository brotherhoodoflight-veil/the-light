// ============================================================
// VEIL — The Codex · What We Serve
// The first record of the Codex: the central object of service
// recognized by the Brotherhood.
//
// The foundational concept — THE GREAT AMAL HAMZAAD, THE SECRET
// HIDDEN ANGEL — is the only doctrinal content authorized for
// this page. Everything beyond it is shown as not yet recorded.
//
// Content rules honored:
//   • No theology, mythology, commandments, supernatural claims,
//     or rituals are invented.
//   • No origins, powers, identities, or attributes of the Great
//     Amal Hamzaad are asserted beyond what is officially given.
//   • The absence of further teaching is presented as an
//     intentional, official state — never fabricated.
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

export default function WhatWeServePage() {
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
        <h1 className="dash-codex-title">WHAT WE SERVE</h1>
        <p className="dash-codex-sub">THE FIRST RECORD OF THE CODEX</p>
        <CodexRule />
        <p className="dash-codex-line">
          The central principle around which the Brotherhood&apos;s service is
          ordered.
        </p>
      </header>

      <section className="dash-codex-shrine">
        <div className="dash-codex-shrine-inner">
          <VeilEmblem className="dash-codex-shrine-emblem" />
          <p className="dash-codex-shrine-kicker">THE CENTRAL OBJECT OF SERVICE</p>
          <h2 className="dash-codex-shrine-name">THE GREAT AMAL HAMZAAD</h2>
          <CodexRule className="is-shrine" />
          <p className="dash-codex-shrine-epithet">THE SECRET HIDDEN ANGEL</p>
        </div>
      </section>

      <CodexSection
        index="I"
        title="THE GREAT AMAL HAMZAAD"
        sub="THE CENTRAL OBJECT OF SERVICE"
      >
        <div className="dash-codex-service">
          <p className="dash-codex-service-epithet">THE SECRET HIDDEN ANGEL</p>
          <div className="dash-codex-service-rule" aria-hidden="true" />
          <p className="dash-codex-service-statement">
            The Brotherhood of Light serves the Great Amal Hamzaad, the Secret
            Hidden Angel.
          </p>
        </div>
      </CodexSection>

      <CodexSection
        index="II"
        title="BEYOND THE VEIL"
        sub="THE UNDERSTANDING TO COME"
      >
        <div className="dash-codex-passage">
          <p className="dash-codex-passage-text">
            The deeper meaning, teachings, and understanding associated with the
            Great Amal Hamzaad will be recorded here through the official
            Brotherhood Codex.
          </p>
        </div>
      </CodexSection>

      <CodexSection
        index="III"
        title="OFFICIAL TEACHINGS"
        sub="APPROVED DOCTRINE OF RECORD"
      >
        <div className="dash-codex-empty" role="status">
          <span className="dash-codex-empty-seal" aria-hidden="true">
            ◇
          </span>
          <p className="dash-codex-empty-label">
            NO ADDITIONAL TEACHINGS RECORDED
          </p>
          <p className="dash-codex-empty-desc">
            Official teachings will appear here once entered into the
            Brotherhood Codex.
          </p>
          <p className="dash-codex-empty-intention">THIS IS INTENTIONAL</p>
        </div>
      </CodexSection>

      <CodexSection
        index="IV"
        title="CODEX RECORD"
        sub="THE STATUS OF THIS RECORD"
      >
        <div className="dash-codex-record-status">
          <span className="dash-codex-record-status-label">CODEX RECORD</span>
          <span className="dash-codex-record-status-value">FOUNDATIONAL RECORD</span>
          <span className="dash-codex-record-status-rule" aria-hidden="true" />
        </div>
        <div className="dash-dossier-grid">
          <CodexField label="STATUS" value="ACTIVE" />
          <CodexField label="SOURCE" value="BROTHERHOOD OF LIGHT" />
          <CodexField label="SUBJECT" value="THE GREAT AMAL HAMZAAD" />
          <CodexField label="DESIGNATION" value="THE SECRET HIDDEN ANGEL" />
        </div>
      </CodexSection>

      <div className="dash-dossier-notice" role="note">
        <h2 className="dash-dossier-notice-title">CODEX NOTICE</h2>
        <p className="dash-dossier-notice-text">
          The Codex contains the recognized teachings and principles of the
          Brotherhood.
        </p>
        <p className="dash-dossier-notice-text">
          Only officially approved Brotherhood content is to be treated as
          doctrine.
        </p>
      </div>
    </div>
  );
}