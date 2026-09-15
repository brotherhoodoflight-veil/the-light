// ============================================================
// VEIL — The Archives · Symbols & Sigils
// The visual archive of the Brotherhood of Light.
//
// THE SYMBOL IS NOT THE SECRET.
// IT IS THE MARK THAT REMEMBERS IT.
//
// CONTENT RULE:
// Every symbol on this page is original fictional canon authored
// for this project — belonging to the fictional Brotherhood of Light
// (VEIL). No symbol is copied from, or presented as, a real-world
// insignia, religious mark, or historical seal, and no mark carries
// any real-world authority or claim.
//
// Where the record does not explain a mark, the archive preserves
// that uncertainty openly. Nothing is invented to fill the gaps.
// ============================================================

import Link from 'next/link';
import type { ReactNode } from 'react';

interface SigilSvgProps {
  className?: string;
  decorative?: boolean;
}

// ------------------------------------------------------------
// Original fictional glyphs (inline SVG, 120×120 viewBox).
// Each is original linework drawn for this archive.
// ------------------------------------------------------------

function GreatSeal({ className, decorative }: SigilSvgProps) {
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 15 * Math.PI) / 180;
    const a = Math.cos(angle);
    const b = Math.sin(angle);
    return {
      key: i,
      x1: 60 + a * 49.5,
      y1: 60 + b * 49.5,
      x2: 60 + a * 53.5,
      y2: 60 + b * 53.5,
    };
  });

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : 'THE GREAT SEAL'}
      aria-hidden={decorative || undefined}
      focusable="false"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="60" cy="60" r="54" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="48" strokeWidth="1" opacity="0.6" />
      {ticks.map((t) => (
        <line
          key={t.key}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          strokeWidth="1"
          opacity="0.7"
        />
      ))}
      <line x1="60" y1="17" x2="60" y2="103" strokeWidth="2" opacity="0.9" />
      <line x1="17" y1="60" x2="103" y2="60" strokeWidth="1" opacity="0.5" />
      <polygon points="60,42 78,60 60,78 42,60" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="1.6" fill="currentColor" />
      <circle cx="60" cy="3" r="2.2" fill="currentColor" />
      <circle cx="117" cy="60" r="2.2" fill="currentColor" />
      <circle cx="60" cy="117" r="2.2" fill="currentColor" />
      <circle cx="3" cy="60" r="2.2" fill="currentColor" />
    </svg>
  );
}

function VeilMark({ className, decorative }: SigilSvgProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : 'THE VEIL MARK'}
      aria-hidden={decorative || undefined}
      focusable="false"
      fill="none"
      stroke="currentColor"
    >
      <line x1="46" y1="24" x2="46" y2="96" strokeWidth="2.5" />
      <line x1="74" y1="24" x2="74" y2="96" strokeWidth="2.5" />
      <line x1="18" y1="24" x2="60" y2="24" strokeWidth="2.5" />
      <line x1="60" y1="96" x2="102" y2="96" strokeWidth="2.5" />
      <polygon points="54,60 60,54 66,60 60,66" strokeWidth="1.5" />
    </svg>
  );
}

function WitnessMark({ className, decorative }: SigilSvgProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : 'THE WITNESS MARK'}
      aria-hidden={decorative || undefined}
      focusable="false"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="60" cy="40" r="10" strokeWidth="2.5" />
      <line x1="60" y1="50" x2="60" y2="104" strokeWidth="2" />
      <line x1="52" y1="89" x2="68" y2="89" strokeWidth="2.5" />
      <line x1="56" y1="97" x2="64" y2="97" strokeWidth="2.5" />
    </svg>
  );
}

function SealOfSilence({ className, decorative }: SigilSvgProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : 'THE SEAL OF SILENCE'}
      aria-hidden={decorative || undefined}
      focusable="false"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="60" cy="60" r="37" strokeWidth="2.5" />
      <line x1="23" y1="60" x2="97" y2="60" strokeWidth="3" opacity="0.9" />
    </svg>
  );
}

function LightWithinVeil({ className, decorative }: SigilSvgProps) {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const a = Math.cos(angle);
    const b = Math.sin(angle);
    return {
      key: i,
      x1: 60 + a * 24,
      y1: 60 + b * 24,
      x2: 60 + a * 36,
      y2: 60 + b * 36,
    };
  });

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : 'THE LIGHT WITHIN THE VEIL'}
      aria-hidden={decorative || undefined}
      focusable="false"
      fill="none"
      stroke="currentColor"
    >
      {rays.map((r) => (
        <line
          key={r.key}
          x1={r.x1}
          y1={r.y1}
          x2={r.x2}
          y2={r.y2}
          strokeWidth="1.3"
        />
      ))}
      <circle cx="60" cy="60" r="3" fill="currentColor" />
      <circle
        cx="60"
        cy="60"
        r="47"
        strokeWidth="1.5"
        strokeDasharray="271 24"
        transform="rotate(-60 60 60)"
      />
    </svg>
  );
}

function UnreadMark({ className, decorative }: SigilSvgProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative || undefined}
      focusable="false"
      fill="none"
      stroke="currentColor"
    >
      <polygon points="60,26 100,60 60,94 20,60" strokeWidth="1.5" opacity="0.65" />
      <line x1="60" y1="44" x2="60" y2="76" strokeWidth="1.5" opacity="0.65" />
    </svg>
  );
}

// ------------------------------------------------------------
// Shared structural helpers (reuse archive / codex styling)
// ------------------------------------------------------------

function SigilRule({ className }: { className?: string }) {
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

function SigilLockline({ items, className }: { items: string[]; className?: string }) {
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

interface SigilSectionProps {
  index: string;
  title: string;
  sub: string;
  children: ReactNode;
}

function SigilSection({ index, title, sub, children }: SigilSectionProps) {
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

function SigilPassage({ lines }: { lines: string[] }) {
  return (
    <div className="dash-archive-passage">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function SigilMeaning({ kicker, text }: { kicker: string; text: string }) {
  return (
    <div className="dash-sigil-meaning">
      <p className="dash-sigil-meaning-kicker">{kicker}</p>
      <p className="dash-sigil-meaning-text">{text}</p>
    </div>
  );
}

function SigilChips({ items }: { items: string[] }) {
  return (
    <div className="dash-sigil-chips">
      {items.map((item) => (
        <span className="dash-sigil-chip" key={item}>
          {item}
        </span>
      ))}
    </div>
  );
}

function SigilNote({ children }: { children: ReactNode }) {
  return <p className="dash-sigil-note">{children}</p>;
}

function SigilFootnote({ children }: { children: ReactNode }) {
  return <p className="dash-sigil-footnote">{children}</p>;
}

function SigilStage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`dash-sigil-stage${className ? ` ${className}` : ''}`}>
      <span className="dash-sigil-corner is-tl" aria-hidden="true" />
      <span className="dash-sigil-corner is-tr" aria-hidden="true" />
      <span className="dash-sigil-corner is-bl" aria-hidden="true" />
      <span className="dash-sigil-corner is-br" aria-hidden="true" />
      {children}
    </div>
  );
}

// ------------------------------------------------------------
// The page
// ------------------------------------------------------------

export default function SymbolsAndSigilsPage() {
  const REGISTER = [
    {
      id: 'the great seal',
      name: 'GREAT SEAL',
      designation: 'PRIMARY BROTHERHOOD SIGIL',
      purpose: 'Ceremonial and archival identification of the assembled Brotherhood.',
      glyph: <GreatSeal decorative />,
    },
    {
      id: 'the veil mark',
      name: 'THE VEIL MARK',
      designation: 'CEREMONIAL MARK',
      purpose: 'Silently marks the presence of a witnessed assembly.',
      glyph: <VeilMark decorative />,
    },
    {
      id: 'the witness mark',
      name: 'THE WITNESS MARK',
      designation: 'RECORD MARK',
      purpose: 'Marks that a matter was seen and entered into the record.',
      glyph: <WitnessMark decorative />,
    },
    {
      id: 'the seal of silence',
      name: 'THE SEAL OF SILENCE',
      designation: 'RESTRICTED MARK',
      purpose: 'Marks that a matter is not to be spoken of openly.',
      glyph: <SealOfSilence decorative />,
    },
    {
      id: 'the light within the veil',
      name: 'THE LIGHT WITHIN THE VEIL',
      designation: 'CEREMONIAL PRINCIPLE',
      purpose: 'A mark of the principle that the hidden is approached in light.',
      glyph: <LightWithinVeil decorative />,
    },
  ];

  const UNKNOWN_MARKS = [
    'UNIDENTIFIED MARK I',
    'UNIDENTIFIED MARK II',
    'UNIDENTIFIED MARK III',
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
        <SigilLockline
          items={['THE ARCHIVES', 'SYMBOL REGISTER', 'THE MARK REMEMBERS']}
        />
        <p className="dash-archive-eyebrow">THE ARCHIVES</p>
        <h1 className="dash-archive-title">SYMBOLS &amp; SIGILS</h1>
        <p className="dash-archive-sub">ARCHIVES · MARKS OF THE VEIL</p>
        <SigilRule />
        <p className="dash-archive-line">
          The Brotherhood of Light keeps no insignia of any office or state
          that the record does not support.
          <br />
          It keeps a small register of marks.
          <br />
          Each mark is drawn, witnessed, and remembered within the archive of
          the Veil.
        </p>
        <p className="dash-archive-line">
          The symbol is not the secret.
          <br />
          It is the mark that remembers it.
        </p>
        <span className="dash-archive-canon">BROTHERHOOD ARCHIVE — SYMBOL REGISTER</span>
        <SigilLockline
          className="is-foot"
          items={['THE SEAL', 'THE MARK', 'THE WITNESS']}
        />
      </header>

      {/* --- Section I — The Great Seal --- */}
      <SigilSection
        index="I"
        title="THE GREAT SEAL"
        sub="PRIMARY BROTHERHOOD SIGIL"
      >
        <SigilStage className="is-great">
          <GreatSeal className="dash-sigil-glyph is-great" />
        </SigilStage>
        <SigilMeaning
          kicker="WHAT IT MARKS"
          text="In the fiction of VEIL, the Great Seal marks the assembled Brotherhood and the records it keeps under one discipline."
        />
        <SigilPassage
          lines={[
            'The Great Seal is the central mark of the Brotherhood.',
            'Where the seal is placed, the reach of the record begins and ends.',
            'It is drawn with a ring, a cross, and a single diamond at the center.',
            'The ring binds.',
            'The cross is not a claim of power; it is the meeting of the vertical and the horizontal.',
            'The diamond is the point where two directions become one mark.',
          ]}
        />
        <SigilNote>
          A rendered mark used within a fictional Brotherhood canon. It is not
          based on, and is not intended to resemble, any real insignia, symbol,
          or claim to historical authority.
        </SigilNote>
        <SigilChips items={['CLASSIFICATION: PRIMARY SIGIL', 'STATUS: RECOGNIZED']} />
      </SigilSection>

      {/* --- Section II — The Veil Mark --- */}
      <SigilSection
        index="II"
        title="THE VEIL MARK"
        sub="CEREMONIAL MARK"
      >
        <SigilStage>
          <VeilMark className="dash-sigil-glyph" />
        </SigilStage>
        <SigilMeaning
          kicker="WHAT IT MARKS"
          text="It silently marks the presence of a witnessed assembly without announcing its contents."
        />
        <SigilPassage
          lines={[
            'The Veil Mark is the mark most often placed by hand.',
            'It is drawn as two vertical movements with a single bar above and a single bar below.',
            'From the left, the eye moves inward.',
            'From the right, the eye returns.',
            'Where the two movements almost meet, a small diamond remains open.',
            'The Veil Mark does not close. It marks the point where the unseen is approached but not entered.',
          ]}
        />
        <SigilChips items={['CLASSIFICATION: CEREMONIAL MARK', 'STATUS: RECOGNIZED']} />
      </SigilSection>

      {/* --- Section III — The Witness Mark --- */}
      <SigilSection
        index="III"
        title="THE WITNESS MARK"
        sub="RECORD MARK"
      >
        <SigilStage>
          <WitnessMark className="dash-sigil-glyph" />
        </SigilStage>
        <SigilMeaning
          kicker="WHAT IT MARKS"
          text="It is used within the fictional record to mark that a matter was witnessed and is therefore part of the record."
        />
        <SigilPassage
          lines={[
            'It is the mark of the witness.',
            'A circle above.',
            'A descending line.',
            'Two short bars are placed near the base, like the marks a witness leaves beside a name.',
            'The Witness Mark is not a signature.',
            'It is a record that someone stood before the matter and saw it.',
          ]}
        />
        <SigilChips items={['CLASSIFICATION: RECORD MARK', 'STATUS: RECOGNIZED']} />
      </SigilSection>

      {/* --- Section IV — The Seal of Silence --- */}
      <SigilSection
        index="IV"
        title="THE SEAL OF SILENCE"
        sub="RESTRICTED MARK"
      >
        <SigilStage>
          <SealOfSilence className="dash-sigil-glyph" />
        </SigilStage>
        <SigilMeaning
          kicker="WHAT IT MARKS"
          text="In fictional practice it marks that a matter is not to be spoken of openly."
        />
        <SigilPassage
          lines={[
            'There are matters that the record does not speak of openly.',
            'The Seal of Silence is the mark for such matters.',
            'It is a closed ring with a single line through it.',
            'The ring says: this matter is guarded.',
            'The line says: this matter is not to be spoken of without cause.',
            'The seal does not hide what it marks. It marks that guarding has begun.',
          ]}
        />
        <SigilFootnote>
          The Seal of Silence appears in ceremony. Within the fictional
          tradition of VEIL, no mark of this archive grants or withholds any
          real permission, and none carries authority of its own.
        </SigilFootnote>
        <SigilChips items={['CLASSIFICATION: RESTRICTED MARK', 'STATUS: RECOGNIZED']} />
      </SigilSection>

      {/* --- Section V — The Light Within the Veil --- */}
      <SigilSection
        index="V"
        title="THE LIGHT WITHIN THE VEIL"
        sub="CEREMONIAL PRINCIPLE"
      >
        <SigilStage>
          <LightWithinVeil className="dash-sigil-glyph" />
        </SigilStage>
        <SigilMeaning
          kicker="WHAT IT MARKS"
          text="A principle: the hidden is not reached by force, but approached through light, and the circle is never completely closed."
        />
        <SigilPassage
          lines={[
            'It is the youngest of the recognized marks, and the only one drawn as a principle rather than a sign.',
            'A single point at the center.',
            'Twelve rays that begin near the center and stop short of the enclosing ring.',
            'The ring is left open in one place.',
          ]}
        />
        <section className="dash-sigil-relation" aria-label="THE GREAT AMAL HAMZAAD">
          <span className="dash-sigil-corner is-tl" aria-hidden="true" />
          <span className="dash-sigil-corner is-tr" aria-hidden="true" />
          <span className="dash-sigil-corner is-bl" aria-hidden="true" />
          <span className="dash-sigil-corner is-br" aria-hidden="true" />
          <div className="dash-sigil-relation-inner">
            <LightWithinVeil className="dash-sigil-relation-glyph" decorative />
            <p className="dash-sigil-relation-kicker">THE CENTER OF THE ARCHIVE</p>
            <h4 className="dash-sigil-relation-name">THE GREAT AMAL HAMZAAD</h4>
            <span className="dash-sigil-relation-rule" aria-hidden="true" />
            <p className="dash-sigil-relation-epithet">THE SECRET HIDDEN ANGEL</p>
            <p className="dash-sigil-relation-text">
              Within the fictional tradition of VEIL, the Great Amal Hamzaad
              remains the central hidden presence around which the
              Brotherhood&apos;s service is ordered.
            </p>
          </div>
        </section>
        <SigilNote>
          The Light Within the Veil is drawn toward that presence. It does not
          claim to reveal it.
        </SigilNote>
        <SigilChips items={['CLASSIFICATION: CEREMONIAL PRINCIPLE', 'STATUS: RECOGNIZED']} />
      </SigilSection>

      {/* --- Section VI — The Symbol Register --- */}
      <SigilSection
        index="VI"
        title="THE SYMBOL REGISTER"
        sub="RECOGNIZED MARKS OF THE ARCHIVE"
      >
        <SigilPassage
          lines={[
            'The recognized marks of the archive are entered in the register below.',
            'A mark enters the register when it has been witnessed in more than one assembly and its drawing is preserved in the record.',
            'Marks that have not satisfied those requirements are not entered.',
          ]}
        />
        <div className="dash-sigil-register" role="table" aria-label="SYMBOL REGISTER">
          <div className="dash-sigil-register-row is-head" role="row">
            <span className="dash-sigil-register-cell is-symbol" role="columnheader">
              SYMBOL
            </span>
            <span className="dash-sigil-register-cell" role="columnheader">
              DESIGNATION
            </span>
            <span className="dash-sigil-register-cell is-purpose" role="columnheader">
              PURPOSE
            </span>
            <span className="dash-sigil-register-cell is-status" role="columnheader">
              STATUS
            </span>
          </div>
          {REGISTER.map((entry) => (
            <div className="dash-sigil-register-row" role="row" key={entry.id}>
              <span className="dash-sigil-register-cell is-symbol" role="cell">
                <span className="dash-sigil-register-tag">SYMBOL</span>
                <span className="dash-sigil-register-symbol">
                  <span className="dash-sigil-register-mini">{entry.glyph}</span>
                  <span className="dash-sigil-register-name">{entry.name}</span>
                </span>
              </span>
              <span className="dash-sigil-register-cell" role="cell">
                <span className="dash-sigil-register-tag">DESIGNATION</span>
                <span className="dash-sigil-register-desig">{entry.designation}</span>
              </span>
              <span className="dash-sigil-register-cell is-purpose" role="cell">
                <span className="dash-sigil-register-tag">PURPOSE</span>
                <span className="dash-sigil-register-purpose">{entry.purpose}</span>
              </span>
              <span className="dash-sigil-register-cell is-status" role="cell">
                <span className="dash-sigil-register-tag">STATUS</span>
                <span className="dash-sigil-register-status">RECOGNIZED</span>
              </span>
            </div>
          ))}
        </div>
      </SigilSection>

      {/* --- Section VII — Not Every Mark Is Understood --- */}
      <SigilSection
        index="VII"
        title="NOT EVERY MARK IS UNDERSTOOD"
        sub="UNRESOLVED MARKS OF THE ARCHIVE"
      >
        <SigilPassage
          lines={[
            'Not every mark in the archives is understood.',
            'Three marks survive without explanation.',
            'The archive does not guess.',
            'Their drawings are preserved because they were found, and their meanings are left open because no record explains them.',
          ]}
        />
        <ul className="dash-sigil-unknown">
          {UNKNOWN_MARKS.map((title) => (
            <li className="dash-sigil-unknown-card" key={title}>
              <UnreadMark className="dash-sigil-unknown-glyph" decorative />
              <h4 className="dash-sigil-unknown-title">{title}</h4>
              <p className="dash-sigil-unknown-desc">
                The archive does not invent a meaning for this mark.
              </p>
              <div className="dash-sigil-unknown-foot">
                <span className="dash-sigil-unknown-foot-label">MEANING</span>
                <span className="dash-sigil-unknown-foot-value">UNKNOWN</span>
              </div>
              <div className="dash-sigil-unknown-foot">
                <span className="dash-sigil-unknown-foot-label">STATUS</span>
                <span className="dash-sigil-unknown-foot-value">UNRESOLVED</span>
              </div>
            </li>
          ))}
        </ul>
      </SigilSection>

      {/* --- Section VIII — The Rule of the Mark --- */}
      <SigilSection
        index="VIII"
        title="THE RULE OF THE MARK"
        sub="WHAT A MARK REQUIRES"
      >
        <SigilPassage
          lines={[
            'The symbol is not the secret.',
            'It is the mark that remembers it.',
            'A mark is not power.',
            'It is discipline applied to memory.',
            'When a mark is drawn, the witness must understand what the mark means.',
            'When it is witnessed, the witness must remember what it guards.',
            'A mark drawn without meaning is only an ornament.',
            'A mark drawn without witness is only a line.',
          ]}
        />
        <div className="dash-archive-statement">
          <p className="dash-archive-statement-text">
            THE MARK REMEMBERS.
            <br />
            THE WITNESS MUST UNDERSTAND.
          </p>
        </div>
      </SigilSection>

      {/* --- Archive notice --- */}
      <div className="dash-sigil-notice" role="note">
        <dl className="dash-dossier-grid">
          <div className="dash-field">
            <dt className="dash-field-label">ARCHIVE</dt>
            <dd className="dash-field-value is-caps">SYMBOLS &amp; SIGILS</dd>
          </div>
          <div className="dash-field">
            <dt className="dash-field-label">CLASSIFICATION</dt>
            <dd className="dash-field-value is-caps">FICTIONAL BROTHERHOOD CANON</dd>
          </div>
          <div className="dash-field">
            <dt className="dash-field-label">STATUS</dt>
            <dd className="dash-field-value is-caps">PRESERVED</dd>
          </div>
          <div className="dash-field">
            <dt className="dash-field-label">RECORD</dt>
            <dd className="dash-field-value is-caps">THE MARK REMEMBERS</dd>
          </div>
        </dl>
      </div>

      <div className="dash-archive-calldown" role="note">
        <p className="dash-archive-calldown-line">BROTHERHOOD ARCHIVES</p>
        <p className="dash-archive-calldown-line">MARKS · THE SEAL · THE WITNESS</p>
        <SigilLockline
          className="is-foot"
          items={['BROTHERHOOD OF LIGHT', 'VEIL', 'FICTIONAL CANON']}
        />
      </div>
    </div>
  );
}