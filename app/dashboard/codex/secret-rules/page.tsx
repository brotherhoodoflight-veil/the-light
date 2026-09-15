// ============================================================
// VEIL — The Codex · Secret Rules
// A restricted Codex chamber reserved for the Brotherhood's
// officially recognized rules.
//
// This is NOT a general website-rules page. It preserves
// official Brotherhood rules and obligations.
//
// Content rules honored:
//   • No secret rules are invented. No commandments, obligations,
//     prohibitions, rituals, penalties, secrecy requirements,
//     hierarchy, initiation, or behavioral rules are fabricated.
//   • Until the official rules are authorized, the chamber is
//     presented as a formal rested archive awaiting entry.
//   • The register's structure is shown, but no rule is treated
//     as official.
// ============================================================

import Link from 'next/link';
import type { ReactNode } from 'react';

function RulesField({ label, value }: { label: string; value: string }) {
  return (
    <div className="dash-field">
      <p className="dash-field-label">{label}</p>
      <p className="dash-field-value is-caps">{value}</p>
    </div>
  );
}

function RulesRule({ className }: { className?: string }) {
  return (
    <div
      className={`dash-rules-rule${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <span className="dash-rules-rule-line" />
      <span className="dash-rules-rule-seal">◆</span>
      <span className="dash-rules-rule-line" />
    </div>
  );
}

function RulesLockline({ className }: { className?: string }) {
  return (
    <div
      className={`dash-rules-lockline${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <span>RESTRICTED</span>
      <span className="dash-rules-lockline-sep">◆</span>
      <span>CODEX</span>
      <span className="dash-rules-lockline-sep">◆</span>
      <span>OFFICIAL RECORD</span>
    </div>
  );
}

interface RulesSectionProps {
  index: string;
  title: string;
  sub: string;
  children: ReactNode;
}

function RulesSection({ index, title, sub, children }: RulesSectionProps) {
  return (
    <section className="dash-rules-section">
      <header className="dash-rules-section-head">
        <span className="dash-rules-section-index" aria-hidden="true">
          {index}
        </span>
        <div className="dash-rules-section-copy">
          <h3 className="dash-rules-section-title">{title}</h3>
          <p className="dash-rules-section-sub">{sub}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

export default function SecretRulesPage() {
  return (
    <div className="dash-rules">
      <div className="dash-dossier-nav">
        <Link href="/dashboard" className="dash-dossier-back">
          <span aria-hidden="true">←</span>
          MY VEIL · OVERVIEW
        </Link>
      </div>

      <header className="dash-rules-head">
        <RulesLockline />
        <p className="dash-rules-eyebrow">THE CODEX · RESTRICTED CHAMBER</p>
        <h1 className="dash-rules-title">SECRET RULES</h1>
        <p className="dash-rules-sub">THE RESTRICTED CODEX</p>
        <RulesRule />
        <p className="dash-rules-line">
          Rules recognized by the Brotherhood are preserved within this
          restricted chamber.
        </p>
        <RulesLockline className="is-foot" />
      </header>

      <RulesSection
        index="I"
        title="THE SECRET RULES"
        sub="THE OFFICIAL RULES OF THE BROTHERHOOD"
      >
        <div className="dash-rules-seal-box" role="status">
          <span className="dash-rules-seal-glyph" aria-hidden="true">
            ◈
          </span>
          <p className="dash-rules-seal-label">OFFICIAL RULES</p>
          <p className="dash-rules-seal-value">NOT YET RECORDED</p>
          <span className="dash-rules-seal-rule" aria-hidden="true" />
          <p className="dash-rules-seal-desc">
            The Brotherhood&apos;s authorized rules will appear here once
            officially entered into the Codex.
          </p>
        </div>
      </RulesSection>

      <RulesSection
        index="II"
        title="RULE REGISTER"
        sub="THE NUMBERED RECORD OF RULES"
      >
        <div className="dash-rules-ledger">
          <div className="dash-rules-ledger-head" aria-hidden="true">
            <span>NUM</span>
            <span>RULE</span>
            <span>STATUS</span>
          </div>
          <div className="dash-rules-ledger-empty" role="status">
            <span className="dash-rules-ledger-seal" aria-hidden="true">
              ◇
            </span>
            <p className="dash-rules-ledger-label">NO RULES CURRENTLY RECORDED</p>
            <p className="dash-rules-ledger-desc">
              No rule may be treated as official until it has been formally
              entered and recognized by the Brotherhood.
            </p>
          </div>
        </div>
      </RulesSection>

      <RulesSection
        index="III"
        title="AUTHORITY OF THE CODEX"
        sub="THE RECOGNIZED BASIS OF THE RULES"
      >
        <div className="dash-rules-authority-grid">
          <RulesField label="STATUS" value="AWAITING OFFICIAL RULES" />
          <RulesField label="SOURCE" value="BROTHERHOOD OF LIGHT" />
          <RulesField label="AUTHORITY" value="OFFICIAL CODEX" />
        </div>
      </RulesSection>

      <RulesSection
        index="IV"
        title="RESTRICTED RECORD"
        sub="THE NATURE OF THIS CHAMBER"
      >
        <p className="dash-rules-citation">
          This chamber is reserved for officially recognized Brotherhood rules.
        </p>
      </RulesSection>

      <div className="dash-dossier-notice" role="note">
        <h2 className="dash-dossier-notice-title">CODEX NOTICE</h2>
        <p className="dash-dossier-notice-text">
          Only rules formally entered and recognized within the Brotherhood&apos;s
          official Codex are to be treated as authoritative.
        </p>
        <p className="dash-dossier-notice-text">
          Do not infer, expand, or substitute unofficial rules.
        </p>
      </div>
    </div>
  );
}