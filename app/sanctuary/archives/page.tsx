import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionPayload } from "../../../lib/auth/session-server";
import { prisma } from "../../../lib/db";
import VeilEmblem from "../../../components/portal/VeilEmblem";

export const metadata: Metadata = {
  title: "THE ARCHIVES — Brotherhood of Light",
  description:
    "The preserved records of the Order. History, foundational records, teachings, decrees, and writings entrusted to the Sanctuary.",
};

function ArchivesSection({
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

export default async function SanctuaryArchivesPage() {
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
        <h1 className="sc-home-title">THE ARCHIVES</h1>

        <div className="sc-home-rule" aria-hidden="true" />

        <p className="sc-home-reception">
          THE PRESERVED RECORDS
          <br />
          OF THE ORDER.
        </p>

        <p className="sc-record-note">
          THE ARCHIVES PRESERVE THE HISTORY, FOUNDATIONAL RECORDS,
          <br />
          TEACHINGS, DECREES, AND WRITINGS
          <br />
          ENTRUSTED TO THE ORDER.
        </p>

        {/* ── The archive registers ── */}
        <ArchivesSection heading="FOUNDATIONS">
          <EmptyRegister first="NO ARCHIVAL RECORDS" second="ARE PRESENTLY RELEASED TO THIS REGISTER." />
        </ArchivesSection>

        <ArchivesSection heading="TEACHINGS">
          <EmptyRegister first="NO ARCHIVAL RECORDS" second="ARE PRESENTLY RELEASED TO THIS REGISTER." />
        </ArchivesSection>

        <ArchivesSection heading="DECREES">
          <EmptyRegister first="NO ARCHIVAL RECORDS" second="ARE PRESENTLY RELEASED TO THIS REGISTER." />
        </ArchivesSection>

        <ArchivesSection heading="HISTORICAL RECORDS">
          <EmptyRegister first="NO ARCHIVAL RECORDS" second="ARE PRESENTLY RELEASED TO THIS REGISTER." />
        </ArchivesSection>

        {/* ── Quiet assurance ── */}
        <p className="sc-record-note">
          WHAT IS ENTRUSTED
          <br />
          SHALL BE RELEASED WHEN THE ORDER DETERMINES IT.
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