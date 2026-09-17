import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionPayload } from "../../../lib/auth/session-server";
import { prisma } from "../../../lib/db";
import VeilEmblem from "../../../components/portal/VeilEmblem";

export const metadata: Metadata = {
  title: "THE VEILED TEACHINGS — Brotherhood of Light",
  description:
    "Knowledge entrusted to the initiated. The private place of the Brotherhood's teachings and required knowledge, within the Sanctuary.",
};

function ChapterSeparator() {
  return <div className="sc-teachings-separator" aria-hidden="true" />;
}

function Ceremonial({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="sc-teachings-ceremonial">
      {children}
    </span>
  );
}

function Solemn({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="sc-teachings-solemn">
      {children}
    </span>
  );
}

function Warning({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="sc-teachings-warning">
      {children}
    </span>
  );
}

function QuestionBlock({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sc-teachings-question-block">
      {children}
    </div>
  );
}

export default async function SanctuaryTeachingsPage() {
  const session = await getSessionPayload();

  if (!session?.user) {
    redirect("/sanctuary/login");
  }

  const member = await prisma.member.findUnique({
    where: { memberId: session.user.memberId },
    select: {
      memberId: true,
      status: true,
    },
  });

  if (!member) {
    redirect("/sanctuary/login");
  }

  return (
    <main className="sc-page">
      <div className="sc-aura" aria-hidden="true" />
      <div className="sc-arch" aria-hidden="true" />
      <div className="sc-orbit" aria-hidden="true" />

      <div className="sc-record-shell">

        {/* ── The Seal ── */}
        <div className="sc-home-seal" aria-hidden="true">
          <VeilEmblem className="sc-home-emblem" />
        </div>

        {/* ── Title ── */}
        <h1 className="sc-home-title">THE VEILED TEACHINGS</h1>

        <div className="sc-home-rule" aria-hidden="true" />

        <p className="sc-home-reception">
          KNOWLEDGE ENTRUSTED
          <br />
          TO THE INITIATED.
        </p>

        {/* ── Introduction ── */}
        <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 44, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
          This chamber contains teachings concerning the Veil, the Amal, the Shadow, and the Great Amal Hamzaad.
        </p>

        <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 18, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
          Not every teaching is given to every member. Knowledge is not merely possessed. It is entrusted.
        </p>

        <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 18, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
          What is revealed here must remain within the Order.
        </p>

        <Solemn>
          NOT EVERYTHING THAT MAY BE KNOWN
          <br />
          IS PERMITTED TO BE SPOKEN.
        </Solemn>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            CHAPTER I — THE GREAT AMAL HAMZAAD
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-teachings-chapter">
          <span className="sc-teachings-numeral">Chapter I</span>
          <h2 className="sc-teachings-title">THE GREAT AMAL HAMZAAD</h2>
          <div className="sc-teachings-heading-rule" aria-hidden="true" />

          <p className="sc-teachings-body">
            Among the oldest and most guarded traditions surrounding the Veil is the teaching of the Hamzaad — the hidden double, the unseen companion, the shadow that belongs neither entirely to the visible world nor entirely to the world beyond it.
          </p>

          <p className="sc-teachings-body">
            In South Asian and Indo-Islamic esoteric traditions, Hamzaad is associated with the Arabic concept of the qareen and is variously described as a companion, spiritual double, shadow-self, or unseen counterpart.
          </p>

          <p className="sc-teachings-body">
            The traditions do not speak with one voice.
          </p>

          <p className="sc-teachings-body">
            Some describe the Hamzaad as a companion of the human being. Some describe it as a spiritual reflection. Others describe it as a presence associated with the shadow and the hidden faculties of the self.
          </p>

          <p className="sc-teachings-body">
            The Order therefore does not teach the Hamzaad as ordinary folklore.
          </p>

          <p className="sc-teachings-body">
            The Hamzaad is approached as a mystery of the Veil.
          </p>

          <p className="sc-teachings-body">
            The Great Amal is the name given within the tradition to the disciplined body of knowledge concerning that mystery.
          </p>

          <p className="sc-teachings-body">
            It is not a performance for curiosity. It is not entertainment. It is not a spectacle.
          </p>

          <Warning>
            WHAT IS HIDDEN MUST NOT BE SUMMONED BY CURIOSITY.
            <br /><br />
            WHAT IS UNKNOWN MUST NOT BE TREATED AS A TOY.
            <br /><br />
            AND THAT WHICH STANDS BEHIND THE SHADOW
            <br />
            MUST NEVER BE MISTAKEN FOR THE SHADOW ITSELF.
          </Warning>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            CHAPTER II — THE HIDDEN DOUBLE
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-teachings-chapter">
          <span className="sc-teachings-numeral">Chapter II</span>
          <h2 className="sc-teachings-title">THE HIDDEN DOUBLE</h2>
          <div className="sc-teachings-heading-rule" aria-hidden="true" />

          <p className="sc-teachings-body">
            Every visible form suggests a hidden counterpart.
          </p>

          <p className="sc-teachings-body">
            The teaching of the Hidden Double concerns the ancient esoteric idea that the human being is accompanied by more than the ordinary eye perceives.
          </p>

          <p className="sc-teachings-body">
            The double is not necessarily understood as another physical person. It is the concealed reflection. The unseen companion. The figure that belongs to the boundary between identity and mystery.
          </p>

          <p className="sc-teachings-body">
            Traditions concerning Hamzaad sometimes describe this presence as resembling the individual to whom it belongs. Other traditions treat the idea symbolically, as a reflection of the hidden self.
          </p>

          <p className="sc-teachings-body">
            The distinction matters.
          </p>

          <p className="sc-teachings-body">
            The Order teaches the member to approach the Hidden Double first as a mystery of knowledge — never as an object of vanity or command.
          </p>

          <QuestionBlock>
            <p className="sc-teachings-question">
              The question is not:
            </p>
            <p className="sc-teachings-question">
              &ldquo;How may I control what is hidden?&rdquo;
            </p>
            <p className="sc-teachings-question">
              The deeper question is:
            </p>
            <p className="sc-teachings-question">
              &ldquo;What does the hidden reveal about the one who seeks it?&rdquo;
            </p>
          </QuestionBlock>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            CHAPTER III — THE VEIL
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-teachings-chapter">
          <span className="sc-teachings-numeral">Chapter III</span>
          <h2 className="sc-teachings-title">THE VEIL</h2>
          <div className="sc-teachings-heading-rule" aria-hidden="true" />

          <p className="sc-teachings-body">
            The Veil is not merely a curtain.
          </p>

          <p className="sc-teachings-body">
            It is the boundary between what is disclosed and what remains concealed.
          </p>

          <p className="sc-teachings-body">
            Every initiate must learn that secrecy is not the absence of knowledge. Secrecy is the protection of knowledge.
          </p>

          <p className="sc-teachings-body">
            The Veil separates the initiated from the unprepared. It protects the teaching from curiosity. It protects the member from knowledge received before understanding.
          </p>

          <p className="sc-teachings-body">
            The Order therefore recognizes four conditions:
          </p>

          <Ceremonial>
            THAT WHICH MAY BE SEEN.
            <br /><br />
            THAT WHICH MAY BE KNOWN.
            <br /><br />
            THAT WHICH IS PERMITTED.
            <br /><br />
            THAT WHICH MUST REMAIN VEILED.
          </Ceremonial>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 28 }}>
            The mature member learns not only how to receive knowledge.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            He learns when not to ask for it.
          </p>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            CHAPTER IV — THE AMAL
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-teachings-chapter">
          <span className="sc-teachings-numeral">Chapter IV</span>
          <h2 className="sc-teachings-title">THE AMAL</h2>
          <div className="sc-teachings-heading-rule" aria-hidden="true" />

          <p className="sc-teachings-body">
            Amal signifies work, practice, or disciplined action.
          </p>

          <p className="sc-teachings-body">
            Within esoteric traditions, an Amal is not merely a spoken formula. It represents disciplined attention directed toward a defined spiritual purpose.
          </p>

          <p className="sc-teachings-body">
            The traditions surrounding Hamzaad contain many accounts of Amal. Some describe prayer, recitation, purification, solitude, fasting, concentration, protection and contemplation.
          </p>

          <p className="sc-teachings-body">
            The Order preserves the principle without reducing it to spectacle:
          </p>

          <Ceremonial>
            DISCIPLINE PRECEDES REVELATION.
          </Ceremonial>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 28 }}>
            A member who seeks revelation without discipline seeks power without understanding.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            Therefore the Amal is first a test of the practitioner.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            The mystery is secondary.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            The discipline is primary.
          </p>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            CHAPTER V — THE CHILLA
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-teachings-chapter">
          <span className="sc-teachings-numeral">Chapter V</span>
          <h2 className="sc-teachings-title">THE CHILLA</h2>
          <div className="sc-teachings-heading-rule" aria-hidden="true" />

          <p className="sc-teachings-body">
            The Chilla is traditionally associated with an extended period of disciplined retreat, withdrawal, contemplation and spiritual practice.
          </p>

          <p className="sc-teachings-body">
            In occult literature concerning Hamzaad, accounts of Chilla frequently describe prolonged periods of solitude, fasting, concentration and night practice.
          </p>

          <p className="sc-teachings-body">
            Such accounts belong to esoteric and folk traditions and vary considerably between sources.
          </p>

          <p className="sc-teachings-body">
            The Order records the deeper principle:
          </p>

          <Ceremonial>
            THE CHILLA IS A TEST OF THE SELF.
          </Ceremonial>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 28 }}>
            It is the confrontation with silence.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            It is the removal of distraction.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            It is the question of what remains when the ordinary world becomes quiet.
          </p>

          <Ceremonial>
            WHEN THE WORLD BECOMES QUIET,
            <br />
            THE MEMBER IS LEFT WITH WHAT
            <br />
            THE WORLD COULD NOT HIDE.
          </Ceremonial>

          <Warning>
            THE UNPREPARED PERSON SEEKS VISIONS.
            <br /><br />
            THE PREPARED PERSON SEEKS UNDERSTANDING.
            <br /><br />
            NO MEMBER IS AUTHORIZED TO UNDERTAKE A DANGEROUS
            <br />
            PHYSICAL OR PSYCHOLOGICAL ORDEAL MERELY BECAUSE
            <br />
            AN OLD TEXT DESCRIBES ONE.
          </Warning>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 28 }}>
            Knowledge of the Chilla is therefore preserved as doctrine, not as an invitation to reckless imitation.
          </p>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            CHAPTER VI — THE HISAR
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-teachings-chapter">
          <span className="sc-teachings-numeral">Chapter VI</span>
          <h2 className="sc-teachings-title">THE HISAR</h2>
          <div className="sc-teachings-heading-rule" aria-hidden="true" />

          <p className="sc-teachings-body">
            Hisar is traditionally understood in occult practice as a boundary of protection.
          </p>

          <p className="sc-teachings-body">
            The circle represents separation.
          </p>

          <Ceremonial>
            INSIDE:
            <br />
            THE PRACTITIONER.
            <br /><br />
            OUTSIDE:
            <br />
            THE UNKNOWN.
          </Ceremonial>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 28 }}>
            But the deeper teaching is older than the circle itself.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            Every initiate must understand the existence of boundaries.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            There are boundaries of the body.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            Boundaries of the mind.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            Boundaries of knowledge.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            Boundaries of the Order.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            A boundary is not weakness.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            A boundary is authority.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            The Veil without a boundary is merely cloth.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            The boundary gives the Veil its power.
          </p>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            CHAPTER VII — THE SHADOW
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-teachings-chapter">
          <span className="sc-teachings-numeral">Chapter VII</span>
          <h2 className="sc-teachings-title">THE SHADOW</h2>
          <div className="sc-teachings-heading-rule" aria-hidden="true" />

          <p className="sc-teachings-body">
            Human beings have always feared the shadow because it follows without speaking.
          </p>

          <p className="sc-teachings-body">
            The shadow is visible proof of an invisible relationship.
          </p>

          <p className="sc-teachings-body">
            In Hamzaad traditions, the shadow becomes a central symbol of the hidden double. Whether understood literally, spiritually, psychologically or symbolically, the image carries the same warning:
          </p>

          <Ceremonial>
            WHAT FOLLOWS YOU IS NOT NECESSARILY
            <br />
            WHAT YOU UNDERSTAND.
          </Ceremonial>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 28 }}>
            The initiate therefore learns to observe the shadow without worshipping it.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            To study the shadow is not to surrender to it.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            To acknowledge the hidden is not to obey the hidden.
          </p>

          <Ceremonial>
            THE SHADOW DOES NOT SPEAK.
            <br />
            THAT DOES NOT MEAN IT HAS NOTHING TO SAY.
          </Ceremonial>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 28 }}>
            The Order teaches that mystery must produce discipline — never madness, vanity or fear.
          </p>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            CHAPTER VIII — THE COVENANT
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-teachings-chapter">
          <span className="sc-teachings-numeral">Chapter VIII</span>
          <h2 className="sc-teachings-title">THE COVENANT</h2>
          <div className="sc-teachings-heading-rule" aria-hidden="true" />

          <p className="sc-teachings-body">
            Every secret creates a responsibility.
          </p>

          <p className="sc-teachings-body">
            The Covenant is therefore not merely an agreement. It is the obligation that follows revelation.
          </p>

          <p className="sc-teachings-body">
            A member who receives knowledge becomes responsible for what he does with it.
          </p>

          <p className="sc-teachings-body">
            He does not display it before the uninitiated. He does not trade it for attention. He does not turn sacred knowledge into entertainment. He does not claim authority he has not been given.
          </p>

          <p className="sc-teachings-body">
            The Covenant begins where curiosity ends.
          </p>

          <Ceremonial>
            THAT WHICH IS ENTRUSTED
            <br />
            SHALL NOT BE TRADED FOR ATTENTION.
          </Ceremonial>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            CHAPTER IX — THE SOUL DAY
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-teachings-chapter">
          <span className="sc-teachings-numeral">Chapter IX</span>
          <h2 className="sc-teachings-title">THE SOUL DAY</h2>
          <div className="sc-teachings-heading-rule" aria-hidden="true" />

          <p className="sc-teachings-body">
            The Soul Day concerns the inward reckoning of the initiate.
          </p>

          <p className="sc-teachings-body">
            It is the point at which the member is required to examine the distance between what he has been taught and what he has become.
          </p>

          <p className="sc-teachings-body">
            Knowledge without transformation is accumulation.
          </p>

          <p className="sc-teachings-body">
            Transformation without discipline is instability.
          </p>

          <p className="sc-teachings-body">
            The Soul Day therefore asks:
          </p>

          <QuestionBlock>
            <p className="sc-teachings-question">WHAT HAVE YOU LEARNED?</p>
            <p className="sc-teachings-question">WHAT HAVE YOU BECOME?</p>
            <p className="sc-teachings-question">WHAT DID YOU SEEK?</p>
            <p className="sc-teachings-question">WHAT DID YOU REFUSE TO SEE?</p>
            <p className="sc-teachings-question">WHAT DID THE VEIL KEEP FROM YOU?</p>
            <p className="sc-teachings-question">WHAT DID YOU ATTEMPT TO TAKE</p>
            <p className="sc-teachings-question">BEFORE IT WAS GIVEN?</p>
          </QuestionBlock>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            CHAPTER X — KNOWLEDGE REQUIRED OF THE MEMBER
            ═══════════════════════════════════════════════════════ */}
        <section className="sc-teachings-chapter">
          <span className="sc-teachings-numeral">Chapter X</span>
          <h2 className="sc-teachings-title">KNOWLEDGE REQUIRED OF THE MEMBER</h2>
          <div className="sc-teachings-heading-rule" aria-hidden="true" />

          <p className="sc-teachings-body">
            Before a member may claim understanding, he must understand the foundations.
          </p>

          <p className="sc-teachings-body">
            He must understand:
          </p>

          <ul className="sc-teachings-list">
            {[
              "THE VEIL",
              "THE ORDER",
              "THE MEANING OF SECRECY",
              "THE RESPONSIBILITY OF KNOWLEDGE",
              "THE DISTINCTION BETWEEN TRADITION AND FACT",
              "THE DANGER OF UNDISCIPLINED CURIOSITY",
              "THE MEANING OF THE SHADOW",
              "THE PURPOSE OF THE AMAL",
              "THE TRADITION OF THE CHILLA",
              "THE SYMBOLISM OF THE HISAR",
              "THE MYSTERY OF THE GREAT AMAL HAMZAAD",
              "THE COVENANT OF THE INITIATE",
            ].map((item) => (
              <li key={item} className="sc-teachings-list-item">
                <div className="sc-teachings-list-marker" aria-hidden="true" />
                <span className="sc-teachings-list-text">{item}</span>
              </li>
            ))}
          </ul>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 28 }}>
            The member is not required to believe every account preserved in esoteric literature.
          </p>

          <p className="sc-teachings-body" style={{ textAlign: "center", marginTop: 14 }}>
            He is required to understand what the tradition says, where the tradition differs, and why the Order guards what it guards.
          </p>

          <Warning>
            KNOWLEDGE IS NOT MEASURED BY HOW MUCH
            <br />
            A MEMBER CAN REPEAT.
            <br /><br />
            KNOWLEDGE IS MEASURED BY WHAT THE MEMBER
            <br />
            CAN BE TRUSTED TO CARRY.
          </Warning>
        </section>

        <ChapterSeparator />

        {/* ═══════════════════════════════════════════════════════
            FINAL VEIL
            ═══════════════════════════════════════════════════════ */}
        <div className="sc-teachings-veil">
          <VeilEmblem className="sc-teachings-emblem-mark" />

          <div className="sc-teachings-veil-text">
            THE VEIL DOES NOT OPEN
            <br />
            BECAUSE YOU KNOCK.
            <br /><br />
            IT OPENS WHEN THE ORDER
            <br />
            DEEMS YOU PREPARED.
            <br /><br />
            UNTIL THEN,
            <br /><br />
            LEARN.
            <br />
            REMAIN SILENT.
            <br />
            REMEMBER.
          </div>
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
