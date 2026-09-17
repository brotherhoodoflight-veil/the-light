import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionPayload } from "../../../lib/auth/session-server";
import { prisma } from "../../../lib/db";
import VeilEmblem from "../../../components/portal/VeilEmblem";

export const metadata: Metadata = {
  title: "THE ORDINANCES — Brotherhood of Light",
  description:
    "The laws and obligations of the Order. Rules, obligations, conduct, teachings, observances, and requirements entrusted to members of the Sanctuary.",
};

function OrdinancesSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sc-record-section">
      <h2 className="sc-record-heading">{heading}</h2>
      <div className="sc-record-heading-rule" aria-hidden="true" />
      <div className="sc-home-register">
        <div className="sc-home-register-line" aria-hidden="true" />
        {children}
        <div className="sc-home-register-line" aria-hidden="true" />
      </div>
    </div>
  );
}

function EmptyRegister({
  first,
  second,
}: {
  first: string;
  second?: string;
}) {
  return (
    <p
      className="sc-record-note sc-record-empty"
      style={{ marginTop: 28, marginBottom: 28, marginLeft: 0, marginRight: 0 }}
    >
      {first}
      {second ? (
        <>
          <br />
          {second}
        </>
      ) : null}
    </p>
  );
}

export default async function SanctuaryOrdinancesPage() {
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
        <h1 className="sc-home-title">THE ORDINANCES</h1>

        <div className="sc-home-rule" aria-hidden="true" />

        <p className="sc-home-reception">
          THE LAWS AND OBLIGATIONS
          <br />
          OF THE ORDER.
        </p>

        <p className="sc-record-note">
          THE ORDINANCES CONTAIN THE RULES, OBLIGATIONS, CONDUCT,
          <br />
          TEACHINGS, OBSERVANCES, AND REQUIREMENTS
          <br />
          ENTRUSTED TO MEMBERS OF THE ORDER.
        </p>

        <p className="sc-record-note">
          IT IS THE DUTY OF EVERY MEMBER
          <br />
          TO KNOW AND UNDERSTAND THE ORDINANCES APPLICABLE TO THEM.
        </p>

        {/* ── The ordinance registers ── */}
        <OrdinancesSection heading="THE VEIL">
          <EmptyRegister first="NO ORDINANCE HAS YET BEEN" second="RELEASED TO THIS REGISTER." />
        </OrdinancesSection>

        <OrdinancesSection heading="THE ORDER">
          <EmptyRegister first="NO ORDINANCE HAS YET BEEN" second="RELEASED TO THIS REGISTER." />
        </OrdinancesSection>

        <OrdinancesSection heading="THE MEMBER">
          <EmptyRegister first="NO ORDINANCE HAS YET BEEN" second="RELEASED TO THIS REGISTER." />
        </OrdinancesSection>

        <OrdinancesSection heading="THE TEACHINGS">
          <EmptyRegister first="NO ORDINANCE HAS YET BEEN" second="RELEASED TO THIS REGISTER." />
        </OrdinancesSection>

        <OrdinancesSection heading="SACRED OBSERVANCES">
          <EmptyRegister first="NO ORDINANCE HAS YET BEEN" second="RELEASED TO THIS REGISTER." />
        </OrdinancesSection>

        <OrdinancesSection heading="THE SOUL DAY">
          <EmptyRegister first="NO ORDINANCE HAS YET BEEN" second="RELEASED TO THIS REGISTER." />
        </OrdinancesSection>

        <OrdinancesSection heading="PROHIBITIONS">
          <EmptyRegister first="NO ORDINANCE HAS YET BEEN" second="RELEASED TO THIS REGISTER." />
        </OrdinancesSection>

        <OrdinancesSection heading="AMENDMENTS">
          <EmptyRegister first="NO ORDINANCE HAS YET BEEN" second="RELEASED TO THIS REGISTER." />
        </OrdinancesSection>

        {/* ── Quiet assurance ── */}
        <p className="sc-record-note">
          WHAT IS COMMANDED
          <br />
          SHALL BE MADE KNOWN TO THOSE WHO ARE OBLIGED TO KEEP IT.
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