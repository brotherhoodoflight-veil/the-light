// ============================================================
// VEIL — The Codex · The Oath
// The ceremonial chamber of the Brotherhood's sacred promise.
//
// This chamber presents the binding words of the Brotherhood —
// the Oath of the Veil — given in full as the official record
// of the Brotherhood.
//
// Content rules honored:
//   • Only the authorized text of the Oath and its ceremonial
//     framing are shown. No additional vows, rites, prayers, or
//     obligations are invented.
//   • The oath is displayed verbatim as officially recorded.
//   • The acknowledgement area is ceremonial only — it grants no
//     legal authority and creates no binding signature.
// ============================================================

import Link from 'next/link';
import VeilEmblem from '../../../login/components/VeilEmblem';

interface OathFieldProps {
  label: string;
  value: string;
}

function OathField({ label, value }: OathFieldProps) {
  return (
    <div className="dash-field">
      <p className="dash-field-label">{label}</p>
      <p className="dash-field-value is-caps">{value}</p>
    </div>
  );
}

function OathRule() {
  return (
    <div className="dash-codex-rule" aria-hidden="true">
      <span className="dash-codex-rule-line" />
      <span className="dash-codex-rule-seal">◆</span>
      <span className="dash-codex-rule-line" />
    </div>
  );
}

interface OathSectionProps {
  index: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}

function OathSection({ index, title, sub, children }: OathSectionProps) {
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

export default function TheOathPage() {
  const oathLines = [
    'I stand before the unseen witness,',
    'beneath the silence that conceals all things.',
    'I enter not for glory,',
    'nor for the praise of men.',
    'I enter beneath the Veil',
    'with my word given,',
    'my eyes awakened,',
    'and my duty accepted.',
    'I shall honor the Brotherhood,',
    'guard what is entrusted to me,',
    'and betray neither the truth',
    'nor the brother who stands beside me.',
    'I shall not speak what is forbidden.',
    'I shall not reveal what is entrusted.',
    'I shall not use the Brotherhood',
    'for vanity, hatred, greed, or cruelty.',
    'Where the path is difficult,',
    'I shall not abandon my duty.',
    'Where the truth is hidden,',
    'I shall seek it with discipline.',
    'Where darkness surrounds the Brotherhood,',
    'I shall remember the light.',
  ];

  return (
    <div className="dash-oath">
      <div className="dash-dossier-nav">
        <Link href="/dashboard" className="dash-dossier-back">
          <span aria-hidden="true">←</span>
          MY VEIL · OVERVIEW
        </Link>
      </div>

      <header className="dash-oath-head">
        <p className="dash-codex-eyebrow">THE CODEX</p>
        <h1 className="dash-codex-title">THE OATH</h1>
        <p className="dash-codex-sub">THE SACRED PROMISE OF THE BROTHERHOOD</p>
        <OathRule />
        <p className="dash-oath-line">
          The binding words of the Brotherhood — the Oath of the Veil — as
          preserved in the Codex.
        </p>
      </header>

      {/* --- The oath itself --- */}
      <section className="dash-oath-plaque" aria-label="THE OATH OF THE VEIL">
        <div className="dash-oath-plaque-frame">
          <div className="dash-oath-plaque-corner is-tl" aria-hidden="true" />
          <div className="dash-oath-plaque-corner is-tr" aria-hidden="true" />
          <div className="dash-oath-plaque-corner is-bl" aria-hidden="true" />
          <div className="dash-oath-plaque-corner is-br" aria-hidden="true" />

          <div className="dash-oath-plaque-head">
            <p className="dash-oath-plaque-kicker">THE OATH OF THE VEIL</p>
            <p className="dash-oath-plaque-seal">◆</p>
            <p className="dash-oath-plaque-index">
              THAT WHICH IS SPOKEN BENEATH THE VEIL
            </p>
          </div>

          <div className="dash-oath-plaque-rule" aria-hidden="true">
            <span className="dash-oath-plaque-rule-line" />
            <span className="dash-oath-plaque-rule-diamond">◇</span>
            <span className="dash-oath-plaque-rule-line" />
          </div>

          <div className="dash-oath-text" lang="en">
            <p className="dash-oath-stanza">
              I stand before the unseen witness,
              <br />
              beneath the silence that conceals all things.
            </p>
            <p className="dash-oath-stanza">
              I enter not for glory,
              <br />
              nor for the praise of men.
            </p>
            <p className="dash-oath-stanza">
              I enter beneath the Veil
              <br />
              with my word given,
              <br />
              my eyes awakened,
              <br />
              and my duty accepted.
            </p>
          </div>

          <div className="dash-oath-text is-second">
            <p className="dash-oath-stanza">
              I shall honor the Brotherhood,
              <br />
              guard what is entrusted to me,
              <br />
              and betray neither the truth
              <br />
              nor the brother who stands beside me.
            </p>
            <p className="dash-oath-stanza">
              I shall not speak what is forbidden.
              <br />
              I shall not reveal what is entrusted.
              <br />
              I shall not use the Brotherhood
              <br />
              for vanity, hatred, greed, or cruelty.
            </p>
            <p className="dash-oath-stanza">
              Where the path is difficult,
              <br />
              I shall not abandon my duty.
            </p>
            <p className="dash-oath-stanza">
              Where the truth is hidden,
              <br />
              I shall seek it with discipline.
            </p>
            <p className="dash-oath-stanza">
              Where darkness surrounds the Brotherhood,
              <br />
              I shall remember the light.
            </p>
          </div>

          <div className="dash-oath-text is-close">
            <p className="dash-oath-stanza">
              Before the Great Amal Hamzaad,
              <br />
              the Secret Hidden Angel,
              <br />
              I give my word.
            </p>
            <p className="dash-oath-stanza">
              What I enter here,
              <br />
              I enter by my will.
            </p>
            <p className="dash-oath-stanza">
              What I accept,
              <br />
              I accept with understanding.
            </p>
            <p className="dash-oath-stanza">
              What I promise,
              <br />
              I promise before the Veil.
            </p>
            <p className="dash-oath-stanza">
              Let my word be remembered.
              <br />
              Let my conduct bear witness.
              <br />
              Let my loyalty be tested by time.
            </p>
            <p className="dash-oath-stanza">
              I enter in silence.
            </p>
            <p className="dash-oath-stanza">
              I remain by conviction.
            </p>
            <p className="dash-oath-stanza is-final">
              And if I depart,
              <br />
              let the record remember
              <br />
              that I once stood within the Veil.
            </p>
          </div>
        </div>
      </section>

      {/* --- Closing inscription --- */}
      <section className="dash-oath-closing" aria-label="CLOSING">
        <p className="dash-oath-closing-rule" aria-hidden="true">
          <span className="dash-oath-closing-rule-line" />
          <span className="dash-oath-closing-rule-diamond">◆</span>
          <span className="dash-oath-closing-rule-line" />
        </p>
        <p className="dash-oath-closing-word">THE WORD HAS BEEN GIVEN.</p>
        <p className="dash-oath-closing-veil">THE VEIL REMEMBERS.</p>
      </section>

      {/* --- Section II — Status of the oath --- */}
      <OathSection
        index="II"
        title="THE OATH — STATUS"
        sub="THE RECORD OF THE OATH"
      >
        <div className="dash-dossier-grid">
          <OathField label="STATUS" value="FOUNDATIONAL" />
          <OathField label="RECORD" value="BROTHERHOOD CODEX" />
          <OathField label="SUBJECT" value="GREAT AMAL HAMZAAD" />
          <OathField label="DESIGNATION" value="SECRET HIDDEN ANGEL" />
        </div>
      </OathSection>

      {/* --- Section III — Before the Veil --- */}
      <OathSection
        index="III"
        title="BEFORE THE VEIL"
        sub="THE CEREMONY OF THE OATH"
      >
        <p className="dash-oath-ceremony">
          Silence precedes the word.
          <br />
          The word precedes the oath.
          <br />
          The oath precedes the path.
        </p>
        <p className="dash-oath-ceremony is-guide">
          Stand in stillness. Speak only what you mean. Let the promise be
          heavier than the voice that speaks it.
        </p>
      </OathSection>

      {/* --- Section IV — Member acknowledgement --- */}
      <OathSection
        index="IV"
        title="MEMBER ACKNOWLEDGEMENT"
        sub="THE SUBSCRIBED RECORD"
      >
        <div className="dash-oath-ack">
          <p className="dash-oath-ack-title">MEMBER ACKNOWLEDGEMENT</p>
          <div className="dash-dossier-grid">
            <OathField label="REGISTRY" value="BOL-1385" />
            <OathField label="NAME" value="DANKWAH KWAME FOSTER" />
          </div>
          <div className="dash-oath-ack-statement">
            <p className="dash-oath-ack-text">
              &ldquo;I acknowledge the words of the Oath of the Veil.&rdquo;
            </p>
          </div>
          <p className="dash-oath-ack-note">
            This acknowledgement is ceremonial. It grants no legal authority
            and creates no binding signature.
          </p>
        </div>
      </OathSection>

      {/* --- Codex notice --- */}
      <div className="dash-dossier-notice" role="note">
        <h2 className="dash-dossier-notice-title">CODEX NOTICE</h2>
        <p className="dash-dossier-notice-text">
          The Oath, once taken, is held to bind the will of the member to the
          duty and to the brother who stands beside them.
        </p>
        <p className="dash-dossier-notice-text">
          The Oath of the Veil is preserved in full in this chamber as the
          official record of the Brotherhood.
        </p>
      </div>
    </div>
  );
}