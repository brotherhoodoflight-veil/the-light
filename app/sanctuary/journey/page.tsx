import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionPayload } from "../../../lib/auth/session-server";
import { prisma } from "../../../lib/db";
import VeilEmblem from "../../../components/portal/VeilEmblem";
import "./journey.css";

export const metadata: Metadata = {
  title: "THE JOURNEY — Brotherhood of Light",
  description:
    "The private chronology of a member's passage into the Order. Held within the Sanctuary, shown only to the one it belongs to.",
};

const NOT_RECORDED = "NOT RECORDED";
const NOT_RECORDED_IN_REGISTER = "NOT RECORDED IN THE REGISTER";

const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

function toDignifiedDate(value: Date | null | undefined): string {
  if (!value) return NOT_RECORDED;
  const day = value.getUTCDate();
  const month = MONTHS[value.getUTCMonth()] ?? "";
  const year = value.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

function toUpper(value: string | null | undefined): string {
  return value && value.trim() ? value.toUpperCase() : NOT_RECORDED;
}

interface JourneyStage {
  period: string;
  title: string;
  status: string;
  description: string;
  /** True when the register holds no mark for this stage. */
  sealed: boolean;
  /** True for the member's present standing. */
  current?: boolean;
  /** An additional recorded detail, when the register holds one. */
  detail?: string;
}

function JourneyStageNode({ stage }: { stage: JourneyStage }) {
  const className = [
    "sc-journey-stage",
    stage.sealed ? "sc-journey-stage-veiled" : "",
    stage.current ? "sc-journey-stage-present" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li className={className}>
      <span className="sc-journey-node" aria-hidden="true" />
      <div className="sc-journey-stage-head">
        <span className="sc-journey-period">{stage.period}</span>
        <h3 className="sc-journey-title">{stage.title}</h3>
      </div>
      <span className="sc-journey-status">{stage.status}</span>
      {stage.detail ? (
        <span className="sc-journey-detail">{stage.detail}</span>
      ) : null}
      <p className="sc-journey-description">{stage.description}</p>
    </li>
  );
}

export default async function SanctuaryJourneyPage() {
  const session = await getSessionPayload();

  if (!session?.user) {
    redirect("/sanctuary/login");
  }

  const member = await prisma.member.findUnique({
    where: { memberId: session.user.memberId },
    select: {
      fullName: true,
      memberId: true,
      journeyStartedYear: true,
      initiationDate: true,
      formalApprovalYear: true,
      fullMembershipYear: true,
      membershipType: true,
    },
  });

  if (!member) {
    redirect("/sanctuary/login");
  }

  const began = member.journeyStartedYear;
  const approval = member.formalApprovalYear;
  const full = member.fullMembershipYear;
  const initiation = member.initiationDate;

  const stages: JourneyStage[] = [
    {
      period: began ? String(began) : NOT_RECORDED,
      title: "THE JOURNEY BEGAN",
      status: began ? "THE JOURNEY COMMENCED" : NOT_RECORDED_IN_REGISTER,
      description:
        "First introduction to the Brotherhood and the beginning of the initiation path.",
      sealed: began == null,
      detail: initiation ? `INITIATION — ${toDignifiedDate(initiation)}` : undefined,
    },
    {
      period: began ? `${began + 1}–${began + 3}` : NOT_RECORDED,
      title: "PERIOD OF PREPARATION",
      status: began ? "RECORDED" : NOT_RECORDED_IN_REGISTER,
      description:
        "Preparation, instruction, observation, and continued development.",
      sealed: began == null,
    },
    {
      period: began ? `${began + 4}–${began + 6}` : NOT_RECORDED,
      title: "REVIEW & CONTINUED JOURNEY",
      status: began ? "RECORDED" : NOT_RECORDED_IN_REGISTER,
      description:
        "Continued participation and review of progress, conduct, commitment, and readiness.",
      sealed: began == null,
    },
    {
      period: approval ? String(approval) : NOT_RECORDED,
      title: "FORMAL APPROVAL",
      status: approval ? "APPROVAL RECORDED" : NOT_RECORDED_IN_REGISTER,
      description: "Formal approval for full Brotherhood membership.",
      sealed: approval == null,
    },
    {
      period: full ? String(full) : NOT_RECORDED,
      title: "FULL MEMBERSHIP",
      status: full ? "ENTERED THE REGISTER" : NOT_RECORDED_IN_REGISTER,
      description: "Entered into the official registry as a full member.",
      sealed: full == null,
    },
    {
      period: "THE PRESENT",
      title: "ACTIVE MEMBERSHIP",
      status: toUpper(member.membershipType),
      description: "The member\u2019s present standing in the Order, as the register records it.",
      sealed: false,
      current: true,
    },
  ];

  return (
    <main className="sc-page">
      {/* Concealed ambient geometry */}
      <div className="sc-aura" aria-hidden="true" />
      <div className="sc-arch" aria-hidden="true" />
      <div className="sc-orbit" aria-hidden="true" />

      <div className="sc-record-shell">
        {/* ── The Seal ── */}
        <div className="sc-home-seal" aria-hidden="true">
          <VeilEmblem className="sc-home-emblem" />
        </div>

        {/* ── Title ── */}
        <h1 className="sc-home-title">THE JOURNEY</h1>

        <div className="sc-home-rule" aria-hidden="true" />

        <p className="sc-home-reception">
          THE CHRONICLE OF YOUR PASSAGE
          <br />
          INTO THE LIGHT.
        </p>

        {/* ── Whose passage this is ── */}
        <p className="sc-journey-member">
          <span className="sc-journey-member-name">
            {member.fullName.toUpperCase()}
          </span>
          <span className="sc-journey-member-rule" aria-hidden="true" />
          <span className="sc-journey-member-id">{member.memberId}</span>
        </p>

        {/* ── The passage ── */}
        <div className="sc-record-section">
          <h2 className="sc-record-heading">THE PASSAGE</h2>
          <div className="sc-record-heading-rule" aria-hidden="true" />
          <ol className="sc-journey-passage">
            {stages.map((stage) => (
              <JourneyStageNode key={stage.title} stage={stage} />
            ))}
          </ol>
        </div>

        {/* ── What remains concealed ── */}
        <div className="sc-journey-beyond">
          <VeilEmblem className="sc-journey-beyond-emblem" aria-hidden="true" />

          <p className="sc-journey-beyond-title">WHAT LIES BEYOND</p>

          <div className="sc-journey-beyond-rule" aria-hidden="true" />

          <p className="sc-journey-beyond-text">
            NOT EVERYTHING THAT REMAINS
            <br />
            IS YET RECORDED.
            <br />
            <br />
            THE REGISTER HOLDS WHAT HAS PASSED.
            <br />
            THE VEIL HOLDS WHAT HAS NOT YET COME.
          </p>
        </div>

        {/* ── Quiet assurance ── */}
        <p className="sc-record-note">
          EACH MARK IS ENTERED ONLY
          <br />
          AS THE REGISTER RECORDS IT.
        </p>

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