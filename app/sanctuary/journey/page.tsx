import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionPayload } from "../../../lib/auth/session-server";
import { prisma } from "../../../lib/db";
import VeilEmblem from "../../../components/portal/VeilEmblem";

export const metadata: Metadata = {
  title: "THE JOURNEY — Brotherhood of Light",
  description:
    "The private chronology of a member's passage into the Order. Held within the Sanctuary, shown only to the one it belongs to.",
};

const NOT_RECORDED = "NOT RECORDED";

function toRegistryDate(value: Date | null | undefined): string {
  return value ? value.toISOString().slice(0, 10) : NOT_RECORDED;
}

function toRegistryYear(value: number | null | undefined): string {
  return value ? String(value) : NOT_RECORDED;
}

function JourneyRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const isEmpty = value === NOT_RECORDED;

  return (
    <div className="sc-home-register-row">
      <dt className="sc-home-label">{label}</dt>
      <dd className={`sc-home-value${isEmpty ? " sc-record-empty" : ""}`}>
        {value}
      </dd>
    </div>
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
      journeyStartedYear: true,
      initiationDate: true,
      formalApprovalYear: true,
      fullMembershipYear: true,
    },
  });

  if (!member) {
    redirect("/sanctuary/login");
  }

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

        {/* ── The chronological progression ── */}
        <div className="sc-record-section">
          <h2 className="sc-record-heading">THE PASSAGE</h2>
          <div className="sc-record-heading-rule" aria-hidden="true" />
          <div className="sc-home-register">
            <div className="sc-home-register-line" aria-hidden="true" />
            <dl className="sc-home-register-fields">
              <JourneyRow
                label="THE JOURNEY BEGAN"
                value={toRegistryYear(member.journeyStartedYear)}
              />
              <JourneyRow
                label="INITIATION"
                value={toRegistryDate(member.initiationDate)}
              />
              <JourneyRow
                label="FORMAL APPROVAL"
                value={toRegistryYear(member.formalApprovalYear)}
              />
              <JourneyRow
                label="FULL MEMBERSHIP"
                value={toRegistryYear(member.fullMembershipYear)}
              />
            </dl>
            <div className="sc-home-register-line" aria-hidden="true" />
          </div>
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