import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getSessionPayload } from "../../../lib/auth/session-server";
import { prisma } from "../../../lib/db";
import VeilEmblem from "../../../components/portal/VeilEmblem";

export const metadata: Metadata = {
  title: "MY RECORD — THE SEALED REGISTER — Brotherhood of Light",
  description:
    "The private official registry record of the member. A sealed page from the Register of the Order, held within the Sanctuary and shown only to the one it belongs to.",
};

const NOT_RECORDED = "NOT RECORDED";
const NOT_RECORDED_IN_REGISTER = "NOT RECORDED IN THE REGISTER";

const PORTRAIT_WIDTH = 224;

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

function toRegistryText(value: string | null | undefined): string {
  return value && value.trim() ? value.toUpperCase() : NOT_RECORDED;
}

function toDignifiedDate(value: Date | null | undefined): string {
  if (!value) return NOT_RECORDED;
  const day = value.getUTCDate();
  const month = MONTHS[value.getUTCMonth()] ?? "";
  const year = value.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

function toRegistryYear(value: number | null | undefined): string {
  return value ? String(value) : NOT_RECORDED;
}

// ─────────────────────────────────────────────
// Presentational fragments
// ─────────────────────────────────────────────

function RegisterChapter({
  numeral,
  title,
  children,
}: {
  numeral: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="sc-register-chapter">
      <span className="sc-register-numeral">{numeral}</span>
      <h2 className="sc-register-chapter-title">{title}</h2>
      <div className="sc-register-chapter-rule" aria-hidden="true" />
      {children}
    </section>
  );
}

function DescriptorGrid({ children }: { children: React.ReactNode }) {
  return <dl className="sc-register-descriptors">{children}</dl>;
}

function Descriptor({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const isEmpty = value === NOT_RECORDED;
  return (
    <div className="sc-register-descriptor">
      <dt className="sc-register-descriptor-label">{label}</dt>
      <dd
        className={`sc-register-descriptor-value${isEmpty ? " sc-register-empty" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function LedgerRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  const isEmpty = value === NOT_RECORDED;
  return (
    <div className="sc-register-ledger-row">
      <dt className="sc-register-ledger-label">{label}</dt>
      <dd
        className={`sc-register-ledger-value${isEmpty ? " sc-register-empty" : ""}`}
      >
        {value}
        {note ? (
          <span className="sc-register-ledger-note">{note}</span>
        ) : null}
      </dd>
    </div>
  );
}

function TimelineMilestone({
  date,
  event,
  status,
  present,
}: {
  date: string;
  event: string;
  status: string;
  present: boolean;
}) {
  return (
    <li
      className={`sc-register-milestone${present ? "" : " sc-register-milestone-void"}`}
    >
      <span className="sc-register-milestone-node" aria-hidden="true" />
      <div className="sc-register-milestone-content">
        <div className="sc-register-milestone-head">
          <span className="sc-register-milestone-date">{date}</span>
          <span className="sc-register-milestone-event">{event}</span>
        </div>
        <span className="sc-register-milestone-status">{status}</span>
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────
// The page
// ─────────────────────────────────────────────

export default async function SanctuaryRecordPage() {
  const session = await getSessionPayload();

  if (!session?.user) {
    redirect("/sanctuary/login");
  }

  const member = await prisma.member.findUnique({
    where: { memberId: session.user.memberId },
    select: {
      memberId: true,
      firstName: true,
      fullName: true,
      sex: true,
      nationality: true,
      country: true,
      cityOfResidence: true,
      idCardType: true,
      idCardNumber: true,
      maritalStatus: true,
      occupation: true,
      email: true,
      phone: true,
      address: true,
      membershipType: true,
      status: true,
      role: true,
      countryInitiator: true,
      initiationDate: true,
      journeyStartedYear: true,
      formalApprovalYear: true,
      fullMembershipYear: true,
    },
  });

  if (!member) {
    redirect("/sanctuary/login");
  }

  const fullName = member.fullName.toUpperCase();
  const status = member.status.toUpperCase();
  const role = member.role.toUpperCase();
  const email = member.email?.trim() ? member.email : NOT_RECORDED;
  const phone = member.phone?.trim() ? member.phone : NOT_RECORDED;

  // Official photograph of record, resolved from the registry identity
  // using the Order's portrait naming convention: public/members/{first}.jpg.
  const portraitName = `${member.firstName.toLowerCase()}.jpg`;
  const portraitSrc = `/members/${portraitName}`;
  const portraitPath = join(process.cwd(), "public", "members", portraitName);
  const hasPortrait = existsSync(portraitPath);
  const portraitSize = hasPortrait ? readJpegDimensions(portraitPath) : null;
  const portraitWidth = portraitSize ? PORTRAIT_WIDTH : 0;
  const portraitHeight = portraitSize
    ? Math.max(
        1,
        Math.round((PORTRAIT_WIDTH * portraitSize.height) / portraitSize.width),
      )
    : 0;

  const initiator = toRegistryText(member.countryInitiator);
  const hasInitiator = initiator !== NOT_RECORDED;

  const journeyMilestones = [
    {
      event: "JOURNEY BEGAN",
      recordedStatus: "THE JOURNEY COMMENCED",
      value: toRegistryYear(member.journeyStartedYear),
      present: member.journeyStartedYear != null,
    },
    {
      event: "FORMAL APPROVAL",
      recordedStatus: "APPROVAL RECORDED",
      value: toRegistryYear(member.formalApprovalYear),
      present: member.formalApprovalYear != null,
    },
    {
      event: "FULL MEMBERSHIP",
      recordedStatus: "ENTERED THE REGISTER",
      value: toRegistryYear(member.fullMembershipYear),
      present: member.fullMembershipYear != null,
    },
  ];

  return (
    <main className="sc-page">
      {/* Concealed ambient geometry */}
      <div className="sc-aura" aria-hidden="true" />
      <div className="sc-arch" aria-hidden="true" />
      <div className="sc-orbit" aria-hidden="true" />

      <div className="sc-register-shell">
        {/* ── The Seal ── */}
        <div className="sc-home-seal" aria-hidden="true">
          <VeilEmblem className="sc-home-emblem" />
        </div>

        {/* ── Header ── */}
        <header className="sc-home-header">
          <h1 className="sc-home-title">THE SEALED REGISTER</h1>
          <p className="sc-register-eyebrow">THE NAME IS ENTERED.
            <br />
            THE RECORD REMAINS.</p>
        </header>

        {/* ── The identity locked to the register ── */}
        <section className="sc-register-lock">
          {hasPortrait && portraitWidth > 0 ? (
            <figure className="sc-register-portrait">
              <span className="sc-register-portrait-label">PORTRAIT OF RECORD</span>
              <div className="sc-register-portrait-frame">
                <Image
                  src={portraitSrc}
                  alt={`Official portrait of record for ${fullName}`}
                  width={portraitWidth}
                  height={portraitHeight}
                  className="sc-register-portrait-image"
                  priority
                />
              </div>
              <figcaption className="sc-register-portrait-caption">
                THE OFFICIAL PHOTOGRAPH OF THE REGISTER
              </figcaption>
            </figure>
          ) : (
            <div className="sc-register-portrait sc-register-portrait-absent">
              <span className="sc-register-portrait-label">PORTRAIT OF RECORD</span>
              <div className="sc-register-portrait-placeholder">
                <span className="sc-register-portrait-placeholder-title">
                  PORTRAIT NOT ENTERED
                </span>
                <span className="sc-register-portrait-placeholder-note">
                  NO PORTRAIT ON REGISTER
                </span>
              </div>
            </div>
          )}

          <div className="sc-register-lock-fields">
            <div className="sc-register-lock-field">
              <span className="sc-register-lock-label">REGISTERED NAME</span>
              <p className="sc-register-lock-name">{fullName}</p>
            </div>

            <div className="sc-register-lock-id-rule" aria-hidden="true" />

            <div className="sc-register-lock-field">
              <span className="sc-register-lock-label">MEMBERSHIP ID</span>
              <p className="sc-register-lock-id">{member.memberId}</p>
            </div>

            <div className="sc-register-lock-meta">
              <div className="sc-register-lock-meta-field">
                <span className="sc-register-lock-meta-label">STATUS</span>
                <p className="sc-register-lock-meta-value">{status}</p>
              </div>
              <div className="sc-register-lock-meta-field">
                <span className="sc-register-lock-meta-label">ROLE</span>
                <p className="sc-register-lock-meta-value">{role}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION I — IDENTITY ── */}
        <RegisterChapter numeral="Section I" title="IDENTITY">
          <DescriptorGrid>
            <Descriptor label="FULL NAME" value={toRegistryText(member.fullName)} />
            <Descriptor label="SEX" value={toRegistryText(member.sex)} />
            <Descriptor label="NATIONALITY" value={toRegistryText(member.nationality)} />
            <Descriptor label="COUNTRY" value={toRegistryText(member.country)} />
            <Descriptor label="CITY OF RESIDENCE" value={toRegistryText(member.cityOfResidence)} />
          </DescriptorGrid>
        </RegisterChapter>

        {/* ── SECTION II — PERSONAL RECORD ── */}
        <RegisterChapter numeral="Section II" title="PERSONAL RECORD">
          <DescriptorGrid>
            <Descriptor label="ID CARD TYPE" value={toRegistryText(member.idCardType)} />
            <Descriptor label="ID CARD NUMBER" value={toRegistryText(member.idCardNumber)} />
            <Descriptor label="MARITAL STATUS" value={toRegistryText(member.maritalStatus)} />
            <Descriptor label="OCCUPATION" value={toRegistryText(member.occupation)} />
            <Descriptor label="EMAIL" value={email} />
            <Descriptor label="PHONE" value={phone} />
            <Descriptor label="ADDRESS" value={toRegistryText(member.address)} />
          </DescriptorGrid>
        </RegisterChapter>

        {/* ── SECTION III — THE ORDER RECORD ── */}
        <RegisterChapter numeral="Section III" title="THE ORDER RECORD">
          <dl className="sc-register-ledger">
            <LedgerRow label="MEMBERSHIP TYPE" value={toRegistryText(member.membershipType)} />
            <LedgerRow label="STATUS" value={status} />
            <LedgerRow label="ROLE" value={role} />
            <LedgerRow
              label="COUNTRY INITIATOR"
              value={initiator}
              note={
                hasInitiator
                  ? "THE ONE THROUGH WHOM THIS MEMBER ENTERED THE REGISTER."
                  : undefined
              }
            />
            <LedgerRow label="INITIATION DATE" value={toDignifiedDate(member.initiationDate)} />
            <LedgerRow label="JOURNEY STARTED" value={toRegistryYear(member.journeyStartedYear)} />
            <LedgerRow label="FORMAL APPROVAL" value={toRegistryYear(member.formalApprovalYear)} />
            <LedgerRow label="FULL MEMBERSHIP" value={toRegistryYear(member.fullMembershipYear)} />
          </dl>
        </RegisterChapter>

        {/* ── SECTION IV — THE JOURNEY OF THE REGISTER ── */}
        <RegisterChapter numeral="Section IV" title="THE JOURNEY OF THE REGISTER">
          <ol className="sc-register-timeline">
            {journeyMilestones.map((milestone) => (
              <TimelineMilestone
                key={milestone.event}
                date={milestone.present ? milestone.value : NOT_RECORDED}
                event={milestone.event}
                status={milestone.present ? milestone.recordedStatus : NOT_RECORDED_IN_REGISTER}
                present={milestone.present}
              />
            ))}
          </ol>
        </RegisterChapter>

        {/* ── SECTION V — THE REGISTER'S SEAL ── */}
        <section className="sc-register-chapter">
          <span className="sc-register-numeral">Section V</span>
          <h2 className="sc-register-chapter-title">THE REGISTER'S SEAL</h2>
          <div className="sc-register-chapter-rule" aria-hidden="true" />
          <div className="sc-register-seal">
            <VeilEmblem className="sc-register-seal-emblem" />
            <p className="sc-register-seal-title">THE REGISTER RECORD</p>
            <div className="sc-register-seal-rule" aria-hidden="true" />
            <p className="sc-register-seal-statement">
              THIS RECORD IS MAINTAINED
              <br />
              UNDER THE AUTHORITY OF THE ORDER.
              <br />
              <br />
              THE MEMBER MAY VIEW
              <br />
              WHAT HAS BEEN ENTERED.
              <br />
              <br />
              THE MEMBER MAY NOT ALTER
              <br />
              WHAT HAS BEEN SEALED.
            </p>
          </div>
        </section>

        {/* ── SECTION VI — PRIVACY ── */}
        <section className="sc-register-chapter">
          <span className="sc-register-numeral">Section VI</span>
          <h2 className="sc-register-chapter-title">PRIVACY</h2>
          <div className="sc-register-chapter-rule" aria-hidden="true" />
          <div className="sc-register-privacy">
            <p className="sc-register-privacy-statement">
              THIS RECORD IS PRIVATE.
              <br />
              IT IS NOT A PUBLIC PROFILE.
              <br />
              IT IS NOT DISPLAYED TO OTHER MEMBERS
              <br />
              UNLESS THE ORDER'S AUTHORITY
              <br />
              PERMITS SUCH DISCLOSURE.
            </p>
            <p className="sc-register-privacy-entrusted">
              WHAT IS ENTERED INTO THE REGISTER
              <br />
              MUST BE TREATED AS ENTRUSTED.
            </p>
          </div>
        </section>

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