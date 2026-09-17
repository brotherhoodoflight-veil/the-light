import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getSessionPayload } from "../../lib/auth/session-server";
import { SESSION_COOKIE } from "../../lib/auth/session-crypto";
import { prisma } from "../../lib/db";
import VeilEmblem from "../../components/portal/VeilEmblem";

export const metadata: Metadata = {
  title: "The Sanctuary — Brotherhood of Light",
  description:
    "The private inner chamber of the Order. Sacred. Secretive. Reserved for those whose name is entered into the Register.",
};

// The private destinations of the Sanctuary. These pages already
// exist behind their established routes; this landing only admits
// the members toward them — it does not rebuild them.
const SANCTUARY_DESTINATIONS = [
  { label: "MY RECORD", href: "/sanctuary/record" },
  { label: "THE JOURNEY", href: "/sanctuary/journey" },
  { label: "THE CHAMBER", href: "/sanctuary/chamber" },
  { label: "CONVOCATIONS", href: "/sanctuary/convocations" },
  { label: "THE ARCHIVES", href: "/sanctuary/archives" },
  { label: "DISPATCHES", href: "/sanctuary/dispatches" },
  { label: "ORDINANCES", href: "/sanctuary/ordinances" },
  { label: "THE SOUL DAY", href: "/sanctuary/soul-day" },
  { label: "THE VEILED TEACHINGS", href: "/sanctuary/teachings" },
] as const;

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

async function departSanctuary() {
  "use server";

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  redirect("/sanctuary/login");
}

export default async function SanctuaryPage() {
  const session = await getSessionPayload();

  if (!session?.user) {
    redirect("/sanctuary/login");
  }

  // Authoritative identity comes from the real membership registry.
  // A development-gateway session without a registry record falls
  // back to the identity fields carried by the signed session itself.
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

  return (
    <main className="sc-page">
      {/* Concealed ambient geometry */}
      <div className="sc-aura" aria-hidden="true" />
      <div className="sc-arch" aria-hidden="true" />
      <div className="sc-orbit" aria-hidden="true" />

      <div className="sc-home-shell">
        {/* ── Ceremonial Header ── */}
        <header className="sc-home-header">
          <h1 className="sc-home-title">THE SACRED ORDER<br/>OF THE VEILED LIGHT</h1>

          <div className="sc-home-seal">
            <VeilEmblem className="sc-home-emblem" />
          </div>

          <h2 className="sc-home-sanctuary-title">THE SANCTUARY</h2>

          <p className="sc-home-reception">THE VEIL RECEIVES YOU.</p>
        </header>

        {/* ── The Register of the Order ── */}
        <section className="sc-home-register" aria-label="Register of the Order">
          <div className="sc-home-register-line" aria-hidden="true" />
          <dl className="sc-home-register-fields">
            <div className="sc-home-register-row">
              <dt className="sc-home-label">NAME</dt>
              <dd className="sc-home-value">{fullName}</dd>
            </div>
            <div className="sc-home-register-row">
              <dt className="sc-home-label">IDENTIFIER</dt>
              <dd className="sc-home-value sc-home-member-id">{memberId}</dd>
            </div>
            <div className="sc-home-register-row">
              <dt className="sc-home-label">STANDING</dt>
              <dd className="sc-home-value">{standing}</dd>
            </div>
            <div className="sc-home-register-row">
              <dt className="sc-home-label">ROLE</dt>
              <dd className="sc-home-value">{role}</dd>
            </div>
            <div className="sc-home-register-row">
              <dt className="sc-home-label">COUNTRY OF RECORD</dt>
              <dd className="sc-home-value">{country}</dd>
            </div>
            <div className="sc-home-register-row">
              <dt className="sc-home-label">INITIATOR</dt>
              <dd className="sc-home-value">{initiator}</dd>
            </div>
          </dl>
          <div className="sc-home-register-line" aria-hidden="true" />
        </section>

        {/* ── Authority / Status ── */}
        <section className="sc-home-authority" aria-label="Member standing">
          <p className="sc-home-standing">
            <span className="sc-home-standing-title">STANDING</span>
            <span className="sc-home-standing-value">{standing}</span>
          </p>
          <p className="sc-home-initiator">
            <span className="sc-home-initiator-title">INITIATOR</span>
            <span className="sc-home-initiator-value">{initiator}</span>
          </p>
        </section>

        {/* ── Private Precincts ── */}
        <section className="sc-home-precincts" aria-label="Private precincts">
          <h3 className="sc-home-precincts-title">THE PRIVATE PRECINCTS</h3>

          <nav className="sc-home-nav" aria-label="Sanctuary destinations">
            {SANCTUARY_DESTINATIONS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="sc-home-nav-entry"
              >
                <span className="sc-home-nav-diamond" aria-hidden="true" />
                <span className="sc-home-nav-label">{label}</span>
              </Link>
            ))}
          </nav>
        </section>

        {/* ── Veiled Inscription ── */}
        <p className="sc-home-inscription">
          THAT WHICH IS ENTRUSTED
          <br />
          SHALL REMAIN VEILED.
        </p>

        {/* ── Departure ── */}
        <footer className="sc-home-footer">
          <div className="sc-home-depart-rule" aria-hidden="true" />
          <form action={departSanctuary}>
            <button type="submit" className="sc-home-depart">
              DEPART THE SANCTUARY
            </button>
          </form>
        </footer>
      </div>
    </main>
  );
}