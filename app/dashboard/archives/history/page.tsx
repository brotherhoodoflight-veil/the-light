// ============================================================
// VEIL — The Archives · Brotherhood History
// The historical archive of the Brotherhood of Light.
//
// THE RECORD REMAINS.
//
// The Brotherhood believes that what is forgotten becomes
// vulnerable to distortion. Its history is therefore preserved
// through records, testimony, symbols, and carefully guarded
// archives — and through an honest acceptance of what was never
// recovered.
//
// CONTENT RULE:
// The history preserved on this page is original fictional canon
// authored for this project — the fictional Brotherhood of Light
// (VEIL). It is not real-world historical fact, and no real
// historical person is presented as a founder.
//
// Where the record is incomplete, sealed, unknown, or lost,
// the archive preserves that uncertainty openly. Nothing is
// invented to fill the gaps.
// ============================================================

import Link from 'next/link';
import type { ReactNode } from 'react';
import VeilEmblem from '../../../login/components/VeilEmblem';

interface FieldPair {
  label: string;
  value: string;
  variant?: 'held' | 'absent';
}

interface ArchiveCardProps {
  title: string;
  text: string;
  fieldLabel: string;
  fieldValue: string;
}

function ArchiveRule({ className }: { className?: string }) {
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

function ArchiveLockline({ items, className }: { items: string[]; className?: string }) {
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

interface ArchiveSectionProps {
  index: string;
  title: string;
  sub: string;
  children: ReactNode;
}

function ArchiveSection({ index, title, sub, children }: ArchiveSectionProps) {
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

function ArchivePassage({ lines }: { lines: string[] }) {
  return (
    <div className="dash-archive-passage">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function ArchiveFragment({ code, status }: { code: string; status: string }) {
  return (
    <div className="dash-archive-fragment">
      <span className="dash-archive-fragment-code">{code}</span>
      <span className="dash-archive-fragment-divider" aria-hidden="true" />
      <span className="dash-archive-fragment-status">STATUS: {status}</span>
    </div>
  );
}

interface ArchivePrinciple {
  title: string;
  text?: string;
}

function ArchivePrinciples({ items }: { items: ArchivePrinciple[] }) {
  return (
    <ul className="dash-archive-principles">
      {items.map((item) => (
        <li className="dash-archive-principle" key={item.title}>
          <span className="dash-archive-principle-seal" aria-hidden="true">
            ◆
          </span>
          <div className="dash-archive-principle-copy">
            <h4 className="dash-archive-principle-title">{item.title}</h4>
            {item.text ? <p className="dash-archive-principle-text">{item.text}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function ArchiveCard({ title, text, fieldLabel, fieldValue }: ArchiveCardProps) {
  return (
    <li className="dash-archive-card">
      <h4 className="dash-archive-card-title">{title}</h4>
      <p className="dash-archive-card-text">{text}</p>
      <div className="dash-archive-card-foot">
        <span className="dash-archive-card-foot-label">{fieldLabel}</span>
        <span className="dash-archive-card-foot-value">{fieldValue}</span>
      </div>
    </li>
  );
}

function ArchiveDossier({
  title,
  kicker,
  fields,
}: {
  title: string;
  kicker: string;
  fields: FieldPair[];
}) {
  return (
    <div className="dash-archive-dossier" aria-label={title}>
      <span className="dash-archive-dossier-corner is-tl" aria-hidden="true" />
      <span className="dash-archive-dossier-corner is-tr" aria-hidden="true" />
      <span className="dash-archive-dossier-corner is-bl" aria-hidden="true" />
      <span className="dash-archive-dossier-corner is-br" aria-hidden="true" />
      <header className="dash-archive-dossier-head">
        <p className="dash-archive-dossier-kicker">{kicker}</p>
        <h4 className="dash-archive-dossier-title">{title}</h4>
        <ArchiveRule className="is-dossier" />
      </header>
      <dl className="dash-archive-dossier-fields">
        {fields.map((field) => (
          <div className="dash-archive-dossier-field" key={field.label}>
            <dt className="dash-archive-dossier-field-label">{field.label}</dt>
            <dd
              className={`dash-archive-dossier-field-value${
                field.variant ? ` is-${field.variant}` : ''
              }`}
            >
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

interface ClassifyItem {
  title: string;
  text: string;
}

function ArchiveClassify({ items }: { items: ClassifyItem[] }) {
  return (
    <ul className="dash-archive-classify">
      {items.map((item) => (
        <li className="dash-archive-classify-item" key={item.title}>
          <p className="dash-archive-classify-title">{item.title}</p>
          <p className="dash-archive-classify-text">{item.text}</p>
        </li>
      ))}
    </ul>
  );
}

export default function BrotherhoodHistoryPage() {
  const EARLY_RECORDS: ArchiveCardProps[] = [
    {
      title: 'THE FIRST REGISTER',
      text: 'An early record of members and witnesses. Only fragments are believed to remain.',
      fieldLabel: 'STATUS',
      fieldValue: 'ARCHIVED',
    },
    {
      title: 'THE BOOK OF WORDS',
      text: 'An early collection of declarations, promises, and ceremonial language.',
      fieldLabel: 'STATUS',
      fieldValue: 'ARCHIVED',
    },
    {
      title: 'THE SEALED LEDGER',
      text: 'A record referenced repeatedly by later archivists, but never publicly opened.',
      fieldLabel: 'STATUS',
      fieldValue: 'ARCHIVED',
    },
  ];

  const LOST_RECORDS: ArchiveCardProps[] = [
    {
      title: 'THE BLACK REGISTER',
      text: 'Referenced in three surviving records. Original location unknown.',
      fieldLabel: 'CLASSIFICATION',
      fieldValue: 'UNRESOLVED',
    },
    {
      title: 'THE NINTH LETTER',
      text: 'An incomplete correspondence whose recipient was never identified.',
      fieldLabel: 'CLASSIFICATION',
      fieldValue: 'UNRESOLVED',
    },
    {
      title: 'THE EMPTY CHAMBER',
      text: 'A room described in multiple accounts but absent from later plans.',
      fieldLabel: 'CLASSIFICATION',
      fieldValue: 'UNRESOLVED',
    },
    {
      title: 'THE UNNAMED WITNESS',
      text: 'A witness mentioned in the earliest surviving testimony. Identity unresolved.',
      fieldLabel: 'CLASSIFICATION',
      fieldValue: 'UNRESOLVED',
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
        <ArchiveLockline items={['THE ARCHIVES', 'BROTHERHOOD RECORD', 'THE RECORD REMAINS']} />
        <p className="dash-archive-eyebrow">THE ARCHIVES</p>
        <h1 className="dash-archive-title">BROTHERHOOD HISTORY</h1>
        <p className="dash-archive-sub">ARCHIVES · THE RECORD REMAINS</p>
        <ArchiveRule />
        <p className="dash-archive-line">
          Every Brotherhood leaves a record.
          <br />
          Some records are written in ink.
          <br />
          Others survive only through memory, witness, and silence.
        </p>
        <p className="dash-archive-line">
          The history preserved here belongs to the Brotherhood of Light as
          recorded within the Veil.
        </p>
        <span className="dash-archive-canon">FICTIONAL BROTHERHOOD CANON</span>
        <ArchiveLockline
          className="is-foot"
          items={['HISTORY', 'MEMORY', 'RECORD']}
        />
      </header>

      {/* --- Section I — Before the First Veil --- */}
      <ArchiveSection
        index="I"
        title="BEFORE THE FIRST VEIL"
        sub="THE EARLIEST FRAGMENTS"
      >
        <ArchivePassage
          lines={[
            'Before the Brotherhood had a name, there was the belief that something unseen stood behind the visible world.',
            'The earliest fragments speak of a hidden presence called the Great Amal Hamzaad — the Secret Hidden Angel.',
            'The fragments do not describe the presence as a ruler demanding worship, nor as a figure to be understood completely.',
            'They describe it as a mystery.',
            'A presence approached through discipline.',
            'A presence remembered through silence.',
            'A presence whose meaning was never to be exhausted by a single generation.',
          ]}
        />
        <div className="dash-archive-fragment-row">
          <ArchiveFragment code="ARCHIVE FRAGMENT 001" status="PRESERVED" />
        </div>
      </ArchiveSection>

      {/* --- Section II — The First Veil --- */}
      <ArchiveSection
        index="II"
        title="THE FIRST VEIL"
        sub="THE QUIET CHAMBER"
      >
        <ArchivePassage
          lines={[
            'The first Brotherhood did not begin with a palace, a throne, or a public declaration.',
            'According to the oldest surviving account, it began with seven witnesses who gathered in a place later remembered only as the Quiet Chamber.',
            'They agreed upon three principles:',
          ]}
        />
        <ArchivePrinciples
          items={[
            { title: 'SPEAK WITH PURPOSE.' },
            { title: 'GUARD WHAT IS ENTRUSTED.' },
            { title: 'LET CONDUCT PROVE THE WORD.' },
          ]}
        />
        <ArchivePassage
          lines={[
            'No complete account of the seven witnesses survives.',
            'Their names were deliberately omitted from one of the earliest records.',
            'The reason remains unknown.',
          ]}
        />
        <ArchiveDossier
          kicker="UNRESOLVED RECORD"
          title="THE SEVEN WITNESSES"
          fields={[
            { label: 'RECORD', value: 'INCOMPLETE', variant: 'absent' },
            { label: 'NAMES', value: 'SEALED', variant: 'absent' },
            { label: 'DATE', value: 'UNKNOWN', variant: 'absent' },
            { label: 'LOCATION', value: 'THE QUIET CHAMBER' },
            { label: 'STATUS', value: 'UNRESOLVED', variant: 'absent' },
          ]}
        />
      </ArchiveSection>

      {/* --- Section III — The Early Brotherhood --- */}
      <ArchiveSection
        index="III"
        title="THE EARLY BROTHERHOOD"
        sub="THE PRESERVERS OF RECORD"
      >
        <ArchivePassage
          lines={[
            'As the Brotherhood grew, its earliest members began preserving what they considered worthy of remembrance.',
            'Teachings were copied.',
            'Oaths were recorded.',
            'Decisions were witnessed.',
            'Names were entered into registers.',
            'Errors were preserved rather than erased.',
            'The early Brotherhood learned a lesson that would shape the Veil for generations:',
            'A Brotherhood that destroys its own record eventually becomes a Brotherhood that cannot remember what it promised.',
          ]}
        />
        <ul className="dash-archive-cards">
          {EARLY_RECORDS.map((record) => (
            <ArchiveCard
              key={record.title}
              title={record.title}
              text={record.text}
              fieldLabel={record.fieldLabel}
              fieldValue={record.fieldValue}
            />
          ))}
        </ul>
      </ArchiveSection>

      {/* --- Section IV — The Age of Silence --- */}
      <ArchiveSection
        index="IV"
        title="THE AGE OF SILENCE"
        sub="THE PERIOD OF WITHDRAWAL"
      >
        <ArchivePassage
          lines={[
            'There came a period in which the Brotherhood deliberately withdrew from public recognition.',
            'The reason is uncertain.',
            'Some records describe the period as protection.',
            'Others describe it as preparation.',
            'During this era, correspondence became shorter.',
            'Meetings were recorded less frequently.',
            'Names disappeared from ordinary registers.',
            'Several documents were marked only with the symbol of the Veil.',
            'Later archivists called this period:',
          ]}
        />
        <div className="dash-archive-statement">
          <p className="dash-archive-statement-text">
            WHAT WAS NOT WRITTEN
            <br />
            WAS NOT NECESSARILY FORGOTTEN.
          </p>
        </div>
        <div className="dash-archive-status">
          <span className="dash-archive-status-label">ARCHIVE STATUS</span>
          <span className="dash-archive-status-value">PARTIALLY RECOVERED</span>
          <span className="dash-archive-status-rule" aria-hidden="true" />
        </div>
      </ArchiveSection>

      {/* --- Section V — The Lost Archives --- */}
      <ArchiveSection
        index="V"
        title="THE LOST ARCHIVES"
        sub="RECORDS THAT DID NOT SURVIVE"
      >
        <ArchivePassage
          lines={[
            'Not every record survived.',
            'Some were destroyed by time.',
            'Some disappeared during movement between assemblies.',
            'Some were deliberately sealed.',
            'Others are known only because later documents refer to them.',
          ]}
        />
        <ul className="dash-archive-cards is-four">
          {LOST_RECORDS.map((record) => (
            <ArchiveCard
              key={record.title}
              title={record.title}
              text={record.text}
              fieldLabel={record.fieldLabel}
              fieldValue={record.fieldValue}
            />
          ))}
        </ul>
        <p className="dash-archive-untraced">
          These records are preserved as known losses. Their endings are not
          invented.
        </p>
      </ArchiveSection>

      {/* --- Section VI — The Keepers of the Record --- */}
      <ArchiveSection
        index="VI"
        title="THE KEEPERS OF THE RECORD"
        sub="GUARDIANS OF MEMORY"
      >
        <ArchivePassage
          lines={[
            'Throughout the Brotherhood\u2019s history, certain members were entrusted with preserving the record.',
            'They were not guardians of power.',
            'They were guardians of memory.',
            'Their responsibility was simple:',
            'Do not alter the past to make the Brotherhood appear greater than it was.',
            'Do not erase failure because it is uncomfortable.',
            'Do not create certainty where the record provides none.',
            'Preserve what is known.',
            'Mark what is uncertain.',
            'Protect what remains sealed.',
          ]}
        />
        <ArchivePrinciples
          items={[
            {
              title: 'PRESERVE',
              text: 'Keep the record intact.',
            },
            {
              title: 'DISTINGUISH',
              text: 'Separate testimony from certainty.',
            },
            {
              title: 'PROTECT',
              text: 'Do not expose what the record has marked as restricted.',
            },
          ]}
        />
      </ArchiveSection>

      {/* --- Section VII — The Secret Hidden Angel (centerpiece) --- */}
      <ArchiveSection
        index="VII"
        title="THE SECRET HIDDEN ANGEL"
        sub="THE GREAT AMAL HAMZAAD"
      >
        <ArchivePassage
          lines={[
            'Across the surviving history of the Brotherhood, one name remains at the center of the Veil:',
          ]}
        />
        <section className="dash-archive-shrine" aria-label="THE GREAT AMAL HAMZAAD">
          <div className="dash-archive-shrine-inner">
            <VeilEmblem className="dash-archive-shrine-emblem" />
            <p className="dash-archive-shrine-kicker">THE CENTER OF THE RECORD</p>
            <h4 className="dash-archive-shrine-name">THE GREAT AMAL HAMZAAD</h4>
            <span className="dash-archive-shrine-rule" aria-hidden="true" />
            <p className="dash-archive-shrine-epithet">THE SECRET HIDDEN ANGEL</p>
            <span className="dash-archive-name-rule" aria-hidden="true" />
            <p className="dash-archive-name">THE NAME REMAINED.</p>
          </div>
        </section>
        <ArchivePassage
          lines={[
            'The oldest records do not claim complete knowledge of the Great Amal Hamzaad.',
            'Instead, the name appears as a constant thread through the Brotherhood\u2019s preserved tradition.',
            'Generations changed.',
            'Records disappeared.',
            'Assemblies moved.',
            'Names were forgotten.',
            'The name remained.',
          ]}
        />
        <div className="dash-archive-closing-note" role="note">
          <p className="dash-archive-closing-note-text">
            Whatever else may be lost to time, the Brotherhood&apos;s service to the
            Great Amal Hamzaad remains part of the central record of the Veil.
          </p>
        </div>
      </ArchiveSection>

      {/* --- Section VIII — The Unfinished Record --- */}
      <ArchiveSection
        index="VIII"
        title="THE HISTORY IS NOT COMPLETE"
        sub="WHERE THE RECORD ENDS"
      >
        <ArchivePassage
          lines={[
            'The archive is not a perfect account.',
            'Some chapters remain incomplete.',
            'Some records remain sealed.',
            'Some questions have no surviving answer.',
            'The Brotherhood does not fill those gaps with invention.',
            'Where the record ends, the record ends.',
            'Where uncertainty remains, uncertainty is preserved.',
          ]}
        />
        <ArchiveClassify
          items={[
            {
              title: 'KNOWN',
              text: 'Records supported by surviving Brotherhood documentation.',
            },
            {
              title: 'UNCERTAIN',
              text: 'Accounts requiring further examination.',
            },
            {
              title: 'SEALED',
              text: 'Records not presently available for general access.',
            },
            {
              title: 'LOST',
              text: 'Records referenced but not recovered.',
            },
          ]}
        />
      </ArchiveSection>

      {/* --- Final closing --- */}
      <section className="dash-archive-closing" aria-label="THE RECORD REMAINS">
        <div className="dash-archive-closing-inner">
          <p className="dash-archive-closing-kicker">THE ARCHIVES</p>
          <h2 className="dash-archive-closing-title">THE RECORD REMAINS.</h2>
          <ArchiveRule className="is-closing" />
          <p className="dash-archive-closing-lines">
            The Brotherhood may change.
            <br />
            Members may come and go.
            <br />
            Assemblies may disappear.
            <br />
            Names may be forgotten.
            <br />
            <br />
            But what has been entrusted to the record must not be treated
            lightly.
          </p>
          <p className="dash-archive-closing-veil">THE VEIL REMEMBERS.</p>
        </div>
      </section>

      <div className="dash-archive-calldown" role="note">
        <p className="dash-archive-calldown-line">BROTHERHOOD ARCHIVES</p>
        <p className="dash-archive-calldown-line">HISTORY · MEMORY · RECORD</p>
        <ArchiveLockline
          className="is-foot"
          items={['BROTHERHOOD OF LIGHT', 'VEIL', 'FICTIONAL CANON']}
        />
      </div>
    </div>
  );
}