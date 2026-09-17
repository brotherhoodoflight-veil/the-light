import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getSessionPayload } from "../../lib/auth/session-server";
import { SESSION_COOKIE } from "../../lib/auth/session-crypto";
import { prisma } from "../../lib/db";
import VeilEmblem from "../../components/portal/VeilEmblem";

export const metadata: Metadata = {
  title: "The Grand Chamber — Brotherhood of Light",
  description:
    "The private administrative chamber of the Order. Reserved for authorized officers and administrators.",
};

// Role-to-ceremonial-presentation mapping. Only values actually returned
// from the database are displayed; missing fields show NOT RECORDED.
const ROLE_PRESENTATION: Record<string, string> = {
  AREOPAGUS: "AREOPAGUS",
  COUNTRY_INITIATOR: "COUNTRY INITIATOR",
  PREFECT: "PREFECT",
  DIRECTORATE_OFFICER: "DIRECTORATE OFFICER",
  MINERVAL_ASSEMBLY_OFFICER: "MINERVAL ASSEMBLY OFFICER",
  INSINUATOR: "INSINUATOR",
  SYSTEM_ADMINISTRATOR: "SYSTEM ADMINISTRATOR",
};

const PORTRAIT_WIDTH = 300;

function readJpegDimensions(filePath: string): { width: number; height: number } | null {
  const buffer = readFileSync(filePath);
  let i = 2;
  while (i < buffer.length - 1) {
    if (buffer[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buffer[i + 1];
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      return {
        height: buffer.readUInt16BE(i + 5),
        width: buffer.readUInt16BE(i + 7),
      };
    }
    const length = buffer.readUInt16BE(i + 2);
    i += 2 + length;
  }
  return null;
}

async function departGrandChamber() {
  "use server";

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  redirect("/grand-chamber/login");
}

export default async function GrandChamberPage() {
  const session = await getSessionPayload();

  if (!session?.user) {
    redirect("/grand-chamber/login");
  }

  // Authoritative identity comes from the real membership registry.
  const member = await prisma.member.findUnique({
    where: { memberId: session.user.memberId },
    select: {
      memberId: true,
      firstName: true,
      fullName: true,
      status: true,
      membershipType: true,
      role: true,
      country: true,
      countryInitiator: true,
    },
  });

  const fullName = (
    member?.fullName ??
    session.user.fullName ??
    [session.user.firstName, session.user.lastName].filter(Boolean).join(" ")
  ).toUpperCase();
  const memberId = member?.memberId ?? session.user.memberId;
  const standing = (
    member?.membershipType ?? member?.status ?? "MEMBER"
  ).toUpperCase();
  const role = (member?.role ?? session.user.role).toUpperCase();
  const country = (
    member?.country ??
    session.user.country ??
    session.user.org?.countryName ??
    "NOT RECORDED"
  ).toUpperCase();
  const initiatorRaw =
    member?.countryInitiator?.trim() || session.user.countryInitiator?.trim();
  const initiator = initiatorRaw ? initiatorRaw.toUpperCase() : "NOT RECORDED";

  // Official photograph, when the registry holds one for this member.
  const portraitName = `${(member?.firstName ?? session.user.firstName).toLowerCase()}.jpg`;
  const portraitSrc = `/members/${portraitName}`;
  const portraitPath = join(process.cwd(), "public", "members", portraitName);
  const hasPortrait = existsSync(portraitPath);
  const portraitSize = hasPortrait ? readJpegDimensions(portraitPath) : null;
  const portraitWidth = portraitSize ? PORTRAIT_WIDTH : 0;
  const portraitHeight = portraitSize
    ? Math.round((PORTRAIT_WIDTH * portraitSize.height) / portraitSize.width)
    : 0;

  const rolePresentation = ROLE_PRESENTATION[role] ?? "NOT RECORDED";

  return (
    <main className="gc-page">
      {/* Authoritative geometry — severe, institutional */}
      <div className="gc-lintel" aria-hidden="true" />
      <div className="gc-axis" aria-hidden="true" />

      {/* The seat of officer authority */}
      <div className="gc-shell">
        <header className="gc-header">
          <div className="gc-seal" aria-hidden="true">
            <VeilEmblem className="gc-emblem" />
          </div>

          <p className="gc-kicker">
            THE SACRED ORDER OF THE VEILED LIGHT
          </p>

          <h1 className="gc-wordmark">THE GRAND CHAMBER</h1>

          <div className="gc-rule" aria-hidden="true" />

          <p className="gc-inscription">
            THE KEEPING OF THE ORDER
            <br />
            REQUIRES AUTHORITY.
          </p>
        </header>

        {/* ── Officer Register ── */}
        <section className="gc-officer-register" aria-label="Officer register">
          <div className="gc-register-line" aria-hidden="true" />
          <dl className="gc-register-fields">
            <div className="gc-register-row">
              <dt className="gc-register-label">NAME</dt>
              <dd className="gc-register-value">{fullName}</dd>
            </div>
            <div className="gc-register-row">
              <dt className="gc-register-label">IDENTIFIER</dt>
              <dd className="gc-register-value gc-register-member-id">{memberId}</dd>
            </div>
            <div className="gc-register-row">
              <dt className="gc-register-label">STANDING</dt>
              <dd className="gc-register-value">{standing}</dd>
            </div>
            <div className="gc-register-row">
              <dt className="gc-register-label">ROLE</dt>
              <dd className="gc-register-value">{rolePresentation}</dd>
            </div>
            <div className="gc-register-row">
              <dt className="gc-register-label">COUNTRY OF RECORD</dt>
              <dd className="gc-register-value">{country}</dd>
            </div>
            <div className="gc-register-row">
              <dt className="gc-register-label">INITIATOR</dt>
              <dd className="gc-register-value">{initiator}</dd>
            </div>
          </dl>
          <div className="gc-register-line" aria-hidden="true" />
        </section>

        {/* ── Authority ── */}
        <section className="gc-authority" aria-label="Officer authority">
          <p className="gc-authority-role">
            AUTHORIZED OFFICER
            <span className="gc-authority-value">{role}</span>
          </p>
        </section>

        {/* ── Chambers of Authority ── */}
        <section className="gc-chambers" aria-label="Chambers of authority">
          <h3 className="gc-chambers-title">THE CHAMBERS OF AUTHORITY</h3>

          <div className="gc-chamber-sealed">
            <p className="gc-chamber-sealed-text">
              THE CHAMBER REMAINS SEALED.
            </p>
            <p className="gc-chamber-sealed-subtitle">
              AUTHORITY TO OPEN THIS PRECINCT HAS NOT YET BEEN ESTABLISHED.
            </p>
          </div>
        </section>

        {/* ── Order Governance ── */}
        <section className="gc-governance" aria-label="Order governance">
          <h3 className="gc-governance-title">ORDER GOVERNANCE</h3>

          <div className="gc-governance-sealed">
            <p className="gc-governance-sealed-text">
              GOVERNANCE FUNCTIONS REMAIN UNOPENED.
            </p>
            <p className="gc-governance-sealed-subtitle">
              DESTINATIONS ARE AVAILABLE ONLY WHEN THEIR ROUTES ARE ESTABLISHED.
            </p>
          </div>
        </section>

        {/* ── Veiled Warning ── */}
        <p className="gc-veiled-warning">
          THAT WHICH IS ENTRUSTED TO THE STEWARDS
          <br />
          SHALL REMAIN VEILED.
        </p>

        {/* ── Departure ── */}
        <footer className="gc-footer">
          <div className="gc-depart-rule" aria-hidden="true" />
          <form action={departGrandChamber}>
            <button type="submit" className="gc-depart">
              DEPART THE GRAND CHAMBER
            </button>
          </form>
        </footer>
      </div>
    </main>
  );
}