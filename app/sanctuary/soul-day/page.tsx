import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionPayload } from "../../../lib/auth/session-server";
import { prisma } from "../../../lib/db";
import VeilEmblem from "../../../components/portal/VeilEmblem";
import "./soul-day.css";

export const metadata: Metadata = {
  title: "THE SOUL DAY — Brotherhood of Light",
  description:
    "The member's chamber of inward reckoning, preparation, examination and remembrance. Held in private within the Sanctuary.",
};

function ChapterSeparator() {
  return <div className="sc-teachings-separator" aria-hidden="true" />;
}

function Solemn({ children }: { children: React.ReactNode }) {
  return <span className="sc-sd-solemn">{children}</span>;
}

const SOUL_FIELDS = [
  "WHAT DO I KNOW?",
  "WHAT DO I FEAR?",
  "WHAT DO I HIDE FROM MYSELF?",
  "WHAT HAVE I BEEN ENTRUSTED WITH?",
  "WHAT MUST I LEARN BEFORE I ASK FOR MORE?",
] as const;

export default async function SanctuarySoulDayPage() {
  const session = await getSessionPayload();

  if (!session?.user) {
    redirect("/sanctuary/login");
  }

  const member = await prisma.member.findUnique({
    where: { memberId: session.user.memberId },
    select: {
      memberId: true,
      fullName: true,
      status: true,
    },
  });

  if (!member) {
    redirect("/sanctuary/login");
  }

  const fullName = member.fullName.toUpperCase();

  return (
    <main className="sc-page sc-sd-page">
      <div className="sc-aura" aria-hidden="true" />
      <div className="sc-arch" aria-hidden="true" />
      <div className="sc-orbit" aria-hidden="true" />

      <div className="sc-record-shell">

        {/* ── The Seal ── */}
        <div className="sc-home-seal" aria-hidden="true">
          <VeilEmblem className="sc-home-emblem" />
        </div>

        {/* ── Title ── */}
        <h1 className="sc-home-title">THE SOUL DAY</h1>

        <div className="sc-home-rule" aria-hidden="true" />

        <p className="sc-home-reception">
          THE DAY ON WHICH THE MEMBER
          <br />
          STANDS BEFORE THE VEIL.
        </p>

        {/* ── The examined member ── */}
        <div className="sc-sd-subject">
          <span className="sc-sd-subject-label">THE MEMBER EXAMINED</span>
          <span className="sc-sd-subject-name">{fullName}</span>
        </div>

        {/* ── The opening ── */}
        <p
          className="sc-teachings-body"
          style={{ textAlign: "center", marginTop: 44, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}
        >
          There are teachings a member may read.
        </p>

        <p
          className="sc-teachings-body"
          style={{ textAlign: "center", marginTop: 18, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}
        >
          There are truths a member may understand.
        </p>

        <p
          className="sc-teachings-body"
          style={{ textAlign: "center", marginTop: 18, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}
        >
          And there is the moment when understanding turns inward.
        </p>

        <p
          className="sc-teachings-body"
          style={{ textAlign: "center", marginTop: 18, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}
        >
          The Soul Day is that moment.
        </p>

        <p
          className="sc-teachings-body"
          style={{ textAlign: "center", marginTop: 18, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}
        >
          Here the member does not stand before another man.
        </p>

        <p
          className="sc-teachings-body"
          style={{ textAlign: "center", marginTop: 18, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}
        >
          He stands before the record of himself.
        </p>

        {/* ── The warning ── */}
        <span className="sc-sd-warning">
          THE ORDER CANNOT EXAMINE
          <br />
          WHAT THE MEMBER REFUSES TO SEE.
        </span>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            I — THE FIRST QUESTION
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-sd-chapter" data-depth="1">
          <span className="sc-sd-numeral">I</span>
          <h2 className="sc-sd-kicker">THE FIRST QUESTION</h2>
          <p className="sc-sd-question">&ldquo;WHO ARE YOU WHEN NO ONE IS WATCHING?&rdquo;</p>
          <div className="sc-sd-heading-rule" aria-hidden="true" />

          <p className="sc-sd-body">
            Every member enters the Sanctuary bearing a name, a standing, and a record. These are true. They are also partial.
          </p>

          <p className="sc-sd-body">
            Public identity, position, and reputation describe what the Order may see and what the world may meet. They do not describe everything.
          </p>

          <p className="sc-sd-body">
            The Soul Day begins with the person beneath the title.
          </p>

          <p className="sc-sd-body">
            Set aside the ceremonial name for a moment. Set aside the accomplishments. The question does not admit an audience.
          </p>

          <Solemn>
            WHAT YOU ARE IN THE PRESENCE OF THE ORDER
            <br />
            IS NOT YET WHAT YOU ARE ALONE.
          </Solemn>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            II — THE SECOND QUESTION
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-sd-chapter" data-depth="2">
          <span className="sc-sd-numeral">II</span>
          <h2 className="sc-sd-kicker">THE SECOND QUESTION</h2>
          <p className="sc-sd-question">&ldquo;WHAT HAVE YOU COME TO KNOW?&rdquo;</p>
          <div className="sc-sd-heading-rule" aria-hidden="true" />

          <p className="sc-sd-body">
            Understanding is not the same as having been told.
          </p>

          <p className="sc-sd-body">
            Knowledge that has not been examined is only repetition.
          </p>

          <p className="sc-sd-body">
            The Order has placed before you teachings concerning:
          </p>

          <ul className="sc-teachings-list">
            {[
              "THE VEIL",
              "THE GREAT AMAL HAMZAAD",
              "THE HIDDEN DOUBLE",
              "THE SHADOW",
              "THE COVENANT",
            ].map((item) => (
              <li key={item} className="sc-teachings-list-item">
                <div className="sc-teachings-list-marker" aria-hidden="true" />
                <span className="sc-teachings-list-text">{item}</span>
              </li>
            ))}
          </ul>

          <p className="sc-sd-body">
            Have you studied them, or only seen them? Have you understood them, or only learned to name them?
          </p>

          <p className="sc-sd-body">
            The question does not ask what you can repeat. It asks what has changed because you know.
          </p>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            III — THE THIRD QUESTION
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-sd-chapter" data-depth="3">
          <span className="sc-sd-numeral">III</span>
          <h2 className="sc-sd-kicker">THE THIRD QUESTION</h2>
          <p className="sc-sd-question">&ldquo;WHAT DID YOU SEEK?&rdquo;</p>
          <div className="sc-sd-heading-rule" aria-hidden="true" />

          <p className="sc-sd-body">
            Men do not always know what they are seeking.
          </p>

          <p className="sc-sd-body">
            Some approach the Veil out of curiosity. Some seek power. Some seek knowledge. Some seek recognition.
          </p>

          <p className="sc-sd-body">
            These are not the same as seeking understanding.
          </p>

          <p className="sc-sd-body">
            Understanding waits to be given. Control reaches out to take. The distance between them is a distance each member must measure honestly.
          </p>

          <p className="sc-sd-body">
            Discovering what you actually sought — and not only what you claimed to seek — is part of the reckoning.
          </p>

          <Solemn>
            CURIOSITY UNEXAMINED
            <br />
            BECOMES GRASPING.
          </Solemn>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            IV — THE FOURTH QUESTION
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-sd-chapter" data-depth="4">
          <span className="sc-sd-numeral">IV</span>
          <h2 className="sc-sd-kicker">THE FOURTH QUESTION</h2>
          <p className="sc-sd-question">&ldquo;WHAT DID YOU REFUSE TO SEE?&rdquo;</p>
          <div className="sc-sd-heading-rule" aria-hidden="true" />

          <p className="sc-sd-body">
            Think now of what you would rather not consider.
          </p>

          <p className="sc-sd-body">
            Initiation does not remove weakness. It reveals it.
          </p>

          <p className="sc-sd-body">
            It does not remove fear, vanity, or contradiction. It gives these things a place where they can finally be looked at.
          </p>

          <p className="sc-sd-body">
            The member who passes through the Veil and refuses to examine what he carries has only changed rooms.
          </p>

          <p className="sc-sd-body">
            There is no teaching in this Order strong enough to replace the looking.
          </p>

          <Solemn>
            WHAT IS BURIED DOES NOT REST.
            <br />
            IT IS MERELY QUIET WHERE NO ONE LISTENS.
          </Solemn>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            V — THE FIFTH QUESTION
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-sd-chapter" data-depth="5">
          <span className="sc-sd-numeral">V</span>
          <h2 className="sc-sd-kicker">THE FIFTH QUESTION</h2>
          <p className="sc-sd-question">&ldquo;WHAT HAVE YOU BECOME?&rdquo;</p>
          <div className="sc-sd-heading-rule" aria-hidden="true" />

          <p className="sc-sd-body">
            Membership is not proven by an identification number.
          </p>

          <p className="sc-sd-body">
            It is not proven by standing in the register, or by the freedom to enter the Sanctuary.
          </p>

          <p className="sc-sd-body">
            It is demonstrated through conduct, discipline, discretion, and responsibility.
          </p>

          <p className="sc-sd-body">
            The Order does not ask how far you have come. It asks what you have become.
          </p>

          <p className="sc-sd-body">
            Becoming is the only proof the Order records.
          </p>

          <Solemn>
            KNOWLEDGE WITHOUT TRANSFORMATION
            <br />
            IS ACCUMULATION.
          </Solemn>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            VI — THE SIXTH QUESTION
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-sd-chapter" data-depth="6">
          <span className="sc-sd-numeral">VI</span>
          <h2 className="sc-sd-kicker">THE SIXTH QUESTION</h2>
          <p className="sc-sd-question">&ldquo;WHAT DID THE VEIL WITHHOLD FROM YOU?&rdquo;</p>
          <div className="sc-sd-heading-rule" aria-hidden="true" />

          <p className="sc-sd-body">
            Every member has felt, at some hour, that the Veil did not answer him.
          </p>

          <p className="sc-sd-body">
            Not receiving an answer is sometimes itself part of the teaching.
          </p>

          <Solemn>
            THE ABSENCE OF AN ANSWER
            <br />
            IS NOT ALWAYS THE ABSENCE OF A TEACHING.
          </Solemn>

          <p className="sc-sd-body">
            Silence may be preparation. Withholding may be protection. What was not yet given to you may have been kept from you so that you would be able to bear it.
          </p>

          <p className="sc-sd-body">
            The question is not why the Veil kept it. The question is whether you are ready to receive what was withheld.
          </p>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            VII — THE SEVENTH QUESTION
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-sd-chapter" data-depth="7">
          <span className="sc-sd-numeral">VII</span>
          <h2 className="sc-sd-kicker">THE SEVENTH QUESTION</h2>
          <p className="sc-sd-question">&ldquo;WHAT DID YOU ATTEMPT TO TAKE BEFORE IT WAS GIVEN?&rdquo;</p>
          <div className="sc-sd-heading-rule" aria-hidden="true" />

          <p className="sc-sd-body">
            Authority in the Order is not seized. It is entrusted.
          </p>

          <p className="sc-sd-body">
            The member must never attempt to force access to knowledge, chambers, authority, or teachings that have not been entrusted to him.
          </p>

          <p className="sc-sd-body">
            Consider the doors you have passed. Consider the ones you were not given.
          </p>

          <p className="sc-sd-body">
            Restraint is not the absence of desire. It is the discipline of desire submitted to the Order.
          </p>

          <Solemn>
            THE VEIL DOES NOT YIELD TO PRESSURE.
            <br />
            IT MOVES ONLY WITH TRUST.
          </Solemn>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            VIII — THE RECORD OF THE SOUL
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-sd-reflection" data-depth="8">
          <span className="sc-sd-numeral">VIII</span>
          <h2 className="sc-sd-kicker">THE RECORD OF THE SOUL</h2>
          <div className="sc-sd-heading-rule" aria-hidden="true" />

          <p className="sc-sd-body">
            This chamber keeps no copy of what follows.
          </p>

          <p className="sc-sd-body">
            Nothing written below is submitted. Nothing is stored. Nothing is read by another.
          </p>

          <p className="sc-sd-body">
            It is a private reckoning, kept only as long as you choose to keep it.
          </p>

          <p className="sc-sd-private">PRIVATE REFLECTION — NOT SUBMITTED</p>

          <div className="sc-sd-reflection-fields">
            {SOUL_FIELDS.map((prompt) => (
              <label key={prompt} className="sc-sd-reflection-field">
                <span className="sc-sd-reflection-label">{prompt}</span>
                <textarea
                  className="sc-sd-reflection-input"
                  rows={4}
                  placeholder="WRITE HERE, OR REMAIN SILENT."
                />
              </label>
            ))}
          </div>

          <p className="sc-sd-body">
            Answer honestly. No one will verify these words. That is precisely why they matter.
          </p>
        </section>

        <ChapterSeparator />

        {/* ── The closing ── */}
        <div className="sc-sd-closing">
          <VeilEmblem className="sc-sd-closing-emblem" />

          <p className="sc-sd-verse">
            THE SOUL HAS NO SHADOW
            <br />
            THAT IT CAN HIDE FROM ITSELF.
          </p>

          <p className="sc-sd-verse">
            WHEN YOU LEAVE THIS CHAMBER,
            <br />
            THE ORDER WILL STILL BE HERE.
            <br />
            THE QUESTION IS WHETHER
            <br />
            YOU WILL BE THE SAME.
          </p>

          <p className="sc-sd-charge">
            LOOK WITHIN.
            <br />
            SPEAK WITH DISCIPLINE.
            <br />
            CARRY WHAT HAS BEEN ENTRUSTED.
            <br />
            AND WHEN THE VEIL CLOSES,
            <br />
            REMEMBER WHAT YOU SAW.
          </p>
        </div>

        {/* ── Return to the Sanctuary ── */}
        <footer className="sc-home-footer">
          <div className="sc-home-depart-rule" aria-hidden="true" />
          <Link href="/sanctuary" className="sc-home-depart">
            RETURN TO THE SANCTUARY
          </Link>
        </footer>
      </div>
    </main>
  );
}