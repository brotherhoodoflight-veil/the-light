// ============================================================
// VEIL — The Archives · Historical Records
// The formal archive register of the Brotherhood of Light.
//
// THE RECORD IS SACRED TO MEMORY.
//
// CONTENT RULE:
// Every record, fragment, and declaration on this page is
// original fictional canon authored for this project — the
// fictional Brotherhood of Light (VEIL). Nothing here is
// presented as real-world history, religion, occult tradition,
// or as an actual organization.
//
// Where the record is sealed, lost, or unresolved, the archive
// preserves that condition openly. Nothing is invented to fill
// the gaps.
// ============================================================

import Link from 'next/link';
import type { ReactNode } from 'react';

interface RecordSectionProps {
  index: string;
  title: string;
  sub: string;
  tone?: 'restricted';
  children: ReactNode;
}

interface RecordFolio {
  id: string;
  title: string;
  classification: string;
  status: string;
  description: string;
}

function RecordRule({ className }: { className?: string }) {
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

function RecordLockline({
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

function RecordSection({ index, title, sub, tone, children }: RecordSectionProps) {
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

function RecordPassage({ lines }: { lines: string[] }) {
  return (
    <div className="dash-archive-passage">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function RecordLabels({ items }: { items: string[] }) {
  return (
    <div className="dash-record-labels">
      {items.map((item) => (
        <span className="dash-record-label" key={item}>
          {item}
        </span>
      ))}
    </div>
  );
}

function RecordMetaValue({
  value,
  isSealed,
}: {
  value: string;
  isSealed?: boolean;
}) {
  return (
    <dd
      className={`dash-record-meta-value${isSealed ? ' is-sealed' : ''}`}
    >
      {value}
    </dd>
  );
}

function RecordFolioCard({ record }: { record: RecordFolio }) {
  return (
    <article className="dash-record-folio" aria-label={record.id}>
      <div className="dash-record-folio-top">
        <span className="dash-record-id">{record.id}</span>
        <span className="dash-record-date">DATE: UNDATED</span>
      </div>
      <div className="dash-record-folio-body">
        <h4 className="dash-record-title">{record.title}</h4>
        <p className="dash-record-desc">{record.description}</p>
        <dl className="dash-record-meta">
          <div className="dash-record-meta-field">
            <dt className="dash-record-meta-label">CLASSIFICATION</dt>
            <RecordMetaValue value={record.classification} />
          </div>
          <div className="dash-record-meta-field">
            <dt className="dash-record-meta-label">STATUS</dt>
            <RecordMetaValue
              value={record.status}
              isSealed={record.status === 'SEALED'}
            />
          </div>
          <div className="dash-record-meta-field">
            <dt className="dash-record-meta-label">PRESERVATION</dt>
            <RecordMetaValue
              value={record.status}
              isSealed={record.status === 'SEALED'}
            />
          </div>
        </dl>
      </div>
    </article>
  );
}

function RecordLostCard({
  title,
}: {
  title: string;
}) {
  return (
    <li className="dash-record-lost-card" aria-label={title}>
      <h4 className="dash-record-lost-title">{title}</h4>
      <dl className="dash-record-lost-fields">
        <div className="dash-record-lost-field">
          <dt className="dash-record-lost-label">REFERENCE STATUS</dt>
          <dd className="dash-record-lost-value">REFERENCED</dd>
        </div>
        <div className="dash-record-lost-field">
          <dt className="dash-record-lost-label">ORIGINAL RECORD</dt>
          <dd className="dash-record-lost-value is-absent">NOT RECOVERED</dd>
        </div>
      </dl>
    </li>
  );
}

// ------------------------------------------------------------
// The page
// ------------------------------------------------------------

export default function HistoricalRecordsPage() {
  const RECORDS: RecordFolio[] = [
    {
      id: 'BOL-ARCH-001',
      title: 'THE FIRST REGISTER',
      classification: 'FOUNDATIONAL',
      status: 'PRESERVED',
      description:
        'Fragmentary register believed to contain some of the earliest recorded names associated with the Brotherhood.',
    },
    {
      id: 'BOL-ARCH-002',
      title: 'THE BOOK OF WORDS',
      classification: 'CEREMONIAL',
      status: 'PRESERVED',
      description:
        'Collection of early declarations, promises, and Brotherhood language.',
    },
    {
      id: 'BOL-ARCH-003',
      title: 'THE SEALED LEDGER',
      classification: 'RESTRICTED',
      status: 'SEALED',
      description:
        'A referenced ledger whose contents are not presently available to the general archive.',
    },
    {
      id: 'BOL-ARCH-004',
      title: 'THE NINTH LETTER',
      classification: 'CORRESPONDENCE',
      status: 'INCOMPLETE',
      description:
        'An unfinished correspondence whose original recipient remains unidentified.',
    },
    {
      id: 'BOL-ARCH-005',
      title: 'THE QUIET CHAMBER ACCOUNT',
      classification: 'TESTIMONY',
      status: 'FRAGMENT',
      description:
        'An incomplete account describing the gathering later remembered as the First Veil.',
    },
    {
      id: 'BOL-ARCH-006',
      title: 'THE WATCHER\u2019S PAGE',
      classification: 'UNKNOWN',
      status: 'UNRESOLVED',
      description:
        'A single surviving page containing a repeated reference to the witness and the Veil.',
    },
  ];

  const CLASSIFICATIONS = [
    {
      title: 'FOUNDATIONAL',
      text: 'Records associated with the earliest recognized Brotherhood tradition.',
    },
    {
      title: 'CEREMONIAL',
      text: 'Declarations, oaths, readings, and formal Brotherhood language.',
    },
    {
      title: 'CORRESPONDENCE',
      text: 'Letters, messages, and written communications preserved in the archive.',
    },
    {
      title: 'TESTIMONY',
      text: 'Accounts attributed to witnesses or participants.',
    },
    {
      title: 'UNRESOLVED',
      text: 'Records whose origin, meaning, or complete history remains uncertain.',
    },
  ];

  const STATUSES = [
    { title: 'PRESERVED', text: 'The record survives sufficiently for archival reference.' },
    { title: 'FRAGMENT', text: 'Only part of the original record survives.' },
    { title: 'INCOMPLETE', text: 'The record survives but important portions are missing.' },
    { title: 'SEALED', text: 'The record exists but is not presently available for general access.' },
    { title: 'LOST', text: 'The record is referenced elsewhere but has not been recovered.' },
    { title: 'UNRESOLVED', text: 'The record survives, but important questions remain unanswered.' },
  ];

  const LOST_RECORDS = [
    'THE BLACK REGISTER',
    'THE SEVENTH ACCOUNT',
    'THE UNNAMED DECLARATION',
  ];

  const PRINCIPLES = [
    {
      numeral: 'I',
      title: 'PRESERVE WHAT EXISTS',
      text: 'Do not alter a record merely because its contents are inconvenient.',
    },
    {
      numeral: 'II',
      title: 'MARK WHAT IS UNCERTAIN',
      text: 'Uncertainty is part of an honest archive.',
    },
    {
      numeral: 'III',
      title: 'DO NOT INVENT THE MISSING',
      text: 'A missing record must remain missing until evidence restores it.',
    },
    {
      numeral: 'IV',
      title: 'PROTECT WHAT IS SEALED',
      text: 'Restricted material must not be exposed without proper authority.',
    },
    {
      numeral: 'V',
      title: 'LEAVE THE RECORD STRONGER',
      text: 'Every generation inherits the archive and is responsible for what it leaves behind.',
    },
  ];

  return (
    <div className="dash-archive">
      <div className="dash-dossier-nav">
        <Link href="/dashboard" className="dash-dossier-back">
          <span aria-hidden="true">←</span>
          MY VEIL · OVERVIEW
        </Link>
      </div>

      {/* --- Archive head --- */}
      <header className="dash-archive-head">
        <RecordLockline
          items={['THE ARCHIVES', 'PRESERVED DOCUMENTS', 'THE RECORD IS SACRED TO MEMORY']}
        />
        <p className="dash-archive-eyebrow">THE ARCHIVES</p>
        <h1 className="dash-archive-title">HISTORICAL RECORDS</h1>
        <p className="dash-archive-sub">THE ARCHIVES · PRESERVED DOCUMENTS</p>
        <RecordRule />
        <p className="dash-archive-line">
          History is remembered through records.
          <br />
          Some records tell what happened.
          <br />
          Some preserve what was promised.
          <br />
          Some reveal what was lost.
          <br />
          Others remain because someone believed they should never be forgotten.
        </p>
        <RecordLabels items={['ARCHIVE REGISTER', 'BROTHERHOOD RECORDS']} />
        <span className="dash-archive-canon">FICTIONAL BROTHERHOOD ARCHIVE · VEIL CANON</span>
        <RecordLockline
          className="is-foot"
          items={['THE REGISTER', 'THE CONDITION', 'THE RECORD']}
        />
      </header>

      {/* --- Section I — The Archive Register --- */}
      <RecordSection
        index="I"
        title="THE ARCHIVE REGISTER"
        sub="PRESERVED DOCUMENTS OF THE BROTHERHOOD"
      >
        <RecordPassage
          lines={[
            'The following records are entered into the archive register of the Brotherhood.',
            'Each entry preserves what the archive holds: a register number, a title, a condition, and a description.',
          ]}
        />
        <ul className="dash-record-folios">
          {RECORDS.map((record) => (
            <RecordFolioCard key={record.id} record={record} />
          ))}
        </ul>
      </RecordSection>

      {/* --- Section II — Record Classifications --- */}
      <RecordSection
        index="II"
        title="ARCHIVE CLASSIFICATIONS"
        sub="HOW RECORDS ARE SORTED"
      >
        <RecordPassage
          lines={[
            'Every record in the register is classified according to the kind of material it preserves.',
          ]}
        />
        <ul className="dash-record-kinds">
          {CLASSIFICATIONS.map((item) => (
            <li className="dash-record-kind" key={item.title}>
              <h4 className="dash-record-kind-title">{item.title}</h4>
              <p className="dash-record-kind-text">{item.text}</p>
            </li>
          ))}
        </ul>
      </RecordSection>

      {/* --- Section III — Record Status --- */}
      <RecordSection
        index="III"
        title="THE CONDITION OF THE RECORD"
        sub="OFFICIAL RECORD STATUSES"
      >
        <RecordPassage
          lines={[
            'Each record also carries a status describing the condition in which it survives.',
            'These are archival classifications, not judgments of a record\u2019s worth.',
          ]}
        />
        <ul className="dash-record-statuses">
          {STATUSES.map((item) => (
            <li className="dash-record-status" key={item.title}>
              <span className="dash-record-status-mark" aria-hidden="true">
                ◆
              </span>
              <h4 className="dash-record-status-title">{item.title}</h4>
              <p className="dash-record-status-text">{item.text}</p>
            </li>
          ))}
        </ul>
      </RecordSection>

      {/* --- Section IV — The Sealed Records --- */}
      <RecordSection
        index="IV"
        title="SEALED RECORDS"
        sub="RESTRICTED MATERIAL OF THE ARCHIVE"
        tone="restricted"
      >
        <RecordPassage
          lines={[
            'Some records are preserved without being opened.',
            'A sealed record is not necessarily a forbidden record.',
            'It is a record whose access is governed by the Brotherhood\u2019s authority, purpose, and preservation requirements.',
          ]}
        />
        <div className="dash-record-sealed-plate" role="note">
          <span className="dash-record-corner is-tl" aria-hidden="true" />
          <span className="dash-record-corner is-tr" aria-hidden="true" />
          <span className="dash-record-corner is-bl" aria-hidden="true" />
          <span className="dash-record-corner is-br" aria-hidden="true" />
          <h4 className="dash-record-sealed-name">THE SEALED LEDGER</h4>
          <dl className="dash-record-sealed-fields">
            <div className="dash-record-sealed-field">
              <dt className="dash-record-sealed-label">ARCHIVE ID</dt>
              <dd className="dash-record-sealed-value">BOL-ARCH-003</dd>
            </div>
            <div className="dash-record-sealed-field">
              <dt className="dash-record-sealed-label">ACCESS</dt>
              <dd className="dash-record-sealed-value">RESTRICTED</dd>
            </div>
            <div className="dash-record-sealed-field">
              <dt className="dash-record-sealed-label">CONTENTS</dt>
              <dd className="dash-record-sealed-value is-sealed">SEALED</dd>
            </div>
          </dl>
        </div>
        <div className="dash-record-sealed-statement">
          <p className="dash-record-sealed-statement-text">
            ACCESS TO A RECORD MUST NEVER BE CONFUSED
            <br />
            WITH OWNERSHIP OF THE RECORD.
          </p>
        </div>
      </RecordSection>

      {/* --- Section V — The Lost Records --- */}
      <RecordSection
        index="V"
        title="THE LOST RECORDS"
        sub="REFERENCES WITHOUT RECOVERY"
      >
        <RecordPassage
          lines={[
            'Some records survive only through references made by other records.',
            'The archive preserves those references rather than pretending the missing documents still exist.',
          ]}
        />
        <ul className="dash-record-lost">
          {LOST_RECORDS.map((title) => (
            <RecordLostCard key={title} title={title} />
          ))}
        </ul>
        <p className="dash-record-untraced">
          The contents of these lost records are not described. The archive
          does not invent them.
        </p>
      </RecordSection>

      {/* --- Section VI — The Archivist's Principles --- */}
      <RecordSection
        index="VI"
        title="THE ARCHIVIST\u2019S PRINCIPLES"
        sub="THE DUTY OF THE KEEPER"
      >
        <section className="dash-record-principles" aria-label="THE ARCHIVIST'S PRINCIPLES">
          <span className="dash-record-corner is-tl" aria-hidden="true" />
          <span className="dash-record-corner is-tr" aria-hidden="true" />
          <span className="dash-record-corner is-bl" aria-hidden="true" />
          <span className="dash-record-corner is-br" aria-hidden="true" />
          <div className="dash-record-principles-inner">
            {PRINCIPLES.map((principle) => (
              <div className="dash-record-principle" key={principle.numeral}>
                <span className="dash-record-principle-numeral" aria-hidden="true">
                  {principle.numeral}.
                </span>
                <div className="dash-record-principle-copy">
                  <h4 className="dash-record-principle-title">{principle.title}</h4>
                  <p className="dash-record-principle-text">{principle.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </RecordSection>

      {/* --- Section VII — The Record and the Veil --- */}
      <RecordSection
        index="VII"
        title="THE RECORD AND THE VEIL"
        sub="WHAT THE BROTHERHOOD PRESERVES"
      >
        <RecordPassage
          lines={[
            'The Veil does not require every mystery to be solved.',
            'Some mysteries survive because the evidence was lost.',
            'Some survive because the record was sealed.',
            'Some survive because the answer was never recorded.',
            'The Brotherhood preserves the distinction.',
          ]}
        />
        <ul className="dash-record-facts" role="list">
          {['KNOWN IS KNOWN.', 'UNKNOWN IS UNKNOWN.', 'SEALED REMAINS SEALED.', 'LOST REMAINS LOST.'].map(
            (fact) => (
              <li className="dash-record-fact" key={fact}>
                <span className="dash-record-fact-mark" aria-hidden="true">
                  ◆
                </span>
                {fact}
              </li>
            ),
          )}
        </ul>
        <RecordPassage
          lines={[
            'The archive does not become stronger by pretending otherwise.',
            'Within that discipline, the Brotherhood keeps the Great Amal Hamzaad — the Secret Hidden Angel — at the center of its record.',
            'The name remained. The record remains.',
          ]}
        />
        <div className="dash-archive-statement">
          <p className="dash-archive-statement-text">
            THE RECORD REMAINS.
          </p>
        </div>
      </RecordSection>

      {/* --- Section VIII — Central Archive Notice --- */}
      <RecordSection
        index="VIII"
        title="ARCHIVE NOTICE"
        sub="STATEMENT OF THE ARCHIVE"
      >
        <div className="dash-record-notice" role="note">
          <p className="dash-record-notice-text">
            These Historical Records form part of the fictional Brotherhood of
            Light — VEIL canon.
          </p>
          <p className="dash-record-notice-text">
            They are narrative records created for this fictional Brotherhood
            system and must not be interpreted as authentic historical
            documents or claims about real-world organizations.
          </p>
          <dl className="dash-dossier-grid is-record">
            <div className="dash-field">
              <dt className="dash-field-label">ARCHIVE</dt>
              <dd className="dash-field-value is-caps">HISTORICAL RECORDS</dd>
            </div>
            <div className="dash-field">
              <dt className="dash-field-label">REGISTER</dt>
              <dd className="dash-field-value is-caps">BOL ARCHIVES</dd>
            </div>
            <div className="dash-field">
              <dt className="dash-field-label">STATUS</dt>
              <dd className="dash-field-value is-caps">PRESERVED</dd>
            </div>
          </dl>
        </div>
      </RecordSection>

      {/* --- Final calldown --- */}
      <div className="dash-archive-calldown" role="note">
        <p className="dash-archive-calldown-line">BROTHERHOOD ARCHIVES</p>
        <p className="dash-archive-calldown-line">RECORDS · THE REGISTER · THE ARCHIVE</p>
        <RecordLockline
          className="is-foot"
          items={['BROTHERHOOD OF LIGHT', 'VEIL', 'FICTIONAL CANON']}
        />
      </div>
    </div>
  );
}