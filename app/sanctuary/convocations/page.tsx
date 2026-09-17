import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionPayload } from "../../../lib/auth/session-server";
import { prisma } from "../../../lib/db";
import VeilEmblem from "../../../components/portal/VeilEmblem";

export const metadata: Metadata = {
  title: "CONVOCATIONS — Brotherhood of Light",
  description:
    "The official convocations and gatherings of the Order, as recorded in the register. Held within the Sanctuary.",
};

const NOT_RECORDED = "NOT RECORDED";

function toRegistryText(value: string | null | undefined): string {
  return value && value.trim() ? value.toUpperCase() : NOT_RECORDED;
}

function toRegistryDate(value: Date | null | undefined): string {
  return value ? value.toISOString().slice(0, 10) : NOT_RECORDED;
}

function ConvocationRow({
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

export default async function SanctuaryConvocationsPage() {
  const session = await getSessionPayload();

  if (!session?.user) {
    redirect("/sanctuary/login");
  }

  const member = await prisma.member.findUnique({
    where: { memberId: session.user.memberId },
    select: {
      memberId: true,
      country: true,
    },
  });

  if (!member) {
    redirect("/sanctuary/login");
  }

  const convocations = await prisma.assembly.findMany({
    where: {
      OR: [
        { accessLevel: "BROTHERHOOD" },
        { accessLevel: "COUNTRY", country: member.country },
        {
          seats: {
            some: { memberId: member.memberId, isRemoved: false },
          },
        },
      ],
    },
    orderBy: { convenedAt: "desc" },
    select: {
      id: true,
      assemblyNumber: true,
      classification: true,
      title: true,
      convenedAt: true,
      location: true,
      purpose: true,
      status: true,
    },
  });

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
        <h1 className="sc-home-title">CONVOCATIONS</h1>

        <div className="sc-home-rule" aria-hidden="true" />

        <p className="sc-home-reception">
          THE GATHERINGS
          <br />
          OF THE ORDER.
        </p>

        <p className="sc-record-note">
          OFFICIAL CONVOCATIONS AND GATHERINGS
          <br />
          RELEVANT TO YOUR STANDING IN THE ORDER
          <br />
          ARE ENTERED HERE AS THE REGISTER RECORDS THEM.
        </p>

        {convocations.length === 0 ? (
          /* ── Solemn empty register ── */
          <div className="sc-record-section">
            <div className="sc-home-register">
              <div className="sc-home-register-line" aria-hidden="true" />
              <p
                className="sc-record-note"
                style={{ marginTop: 28, marginBottom: 28, marginLeft: 0, marginRight: 0 }}
              >
                NO CONVOCATIONS
                <br />
                ARE PRESENTLY RECORDED.
              </p>
              <div className="sc-home-register-line" aria-hidden="true" />
            </div>
          </div>
        ) : (
          /* ── The recorded convocations ── */
          convocations.map((convocation) => (
            <div key={convocation.id} className="sc-record-section">
              <h2 className="sc-record-heading">
                {convocation.assemblyNumber?.trim()
                  ? convocation.assemblyNumber.toUpperCase()
                  : toRegistryText(convocation.classification)}
              </h2>
              <div className="sc-record-heading-rule" aria-hidden="true" />
              <div className="sc-home-register">
                <div className="sc-home-register-line" aria-hidden="true" />
                <dl className="sc-home-register-fields">
                  <ConvocationRow label="DATE" value={toRegistryDate(convocation.convenedAt)} />
                  <ConvocationRow label="TITLE / NAME" value={toRegistryText(convocation.title)} />
                  <ConvocationRow label="LOCATION" value={toRegistryText(convocation.location)} />
                  <ConvocationRow label="PURPOSE" value={toRegistryText(convocation.purpose)} />
                  <ConvocationRow label="STATUS" value={toRegistryText(convocation.status)} />
                </dl>
                <div className="sc-home-register-line" aria-hidden="true" />
              </div>
            </div>
          ))
        )}

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