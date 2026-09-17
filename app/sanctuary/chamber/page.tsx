import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionPayload } from "../../../lib/auth/session-server";
import { prisma } from "../../../lib/db";
import VeilEmblem from "../../../components/portal/VeilEmblem";
import "./chamber.css";

export const metadata: Metadata = {
  title: "THE CHAMBER — Brotherhood of Light",
  description:
    "The private chamber of the Order. Matters exchanged behind closed doors, kept within the Sanctuary.",
};

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function formatChamberDate(value: Date | string): string {
  const d = new Date(value);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = MONTHS[d.getUTCMonth()] ?? "";
  const year = d.getUTCFullYear();
  const hour = String(d.getUTCHours()).padStart(2, "0");
  const minute = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} · ${hour}:${minute}`;
}

function registryText(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toUpperCase() : "NOT RECORDED";
}

type ChamberDispatch = {
  id: string;
  body: string;
  createdAt: Date;
  source: string;
  senderName: string;
  unread: boolean;
};

const OFFICIAL_TYPES = new Set(["OFFICIAL", "RESTRICTED", "ASSEMBLY"]);
const PRIVATE_TYPES = new Set(["PRIVATE", "BROTHERHOOD"]);

function SectionHeading({ numeral, title }: { numeral: string; title: string }) {
  return (
    <header>
      <span className="sc-chamber-section-numeral">{numeral}</span>
      <h2 className="sc-chamber-section-title">{title}</h2>
      <div className="sc-chamber-section-rule" aria-hidden="true" />
    </header>
  );
}

function DispatchEntry({ entry }: { entry: ChamberDispatch }) {
  return (
    <article className={entry.unread ? "sc-chamber-dispatch is-unread" : "sc-chamber-dispatch"}>
      <div className="sc-chamber-dispatch-head">
        <span className="sc-chamber-dispatch-source">{entry.source}</span>
        <span className="sc-chamber-dispatch-date">{formatChamberDate(entry.createdAt)}</span>
      </div>
      <p className="sc-chamber-dispatch-author">FROM {entry.senderName}</p>
      <p className="sc-chamber-dispatch-body">{entry.body}</p>
      <div className="sc-chamber-dispatch-state">
        <span className="sc-chamber-dispatch-state-mark" aria-hidden="true" />
        <span className="sc-chamber-dispatch-state-text">
          {entry.unread ? "NOT YET READ" : "READ"}
        </span>
      </div>
    </article>
  );
}

function EmptyRegister({ primary, secondary }: { primary: string; secondary?: string }) {
  return (
    <div className="sc-chamber-empty">
      <p className="sc-chamber-empty-primary">{primary}</p>
      {secondary ? (
        <p className="sc-chamber-empty-secondary">{secondary}</p>
      ) : null}
    </div>
  );
}

function RegisterRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="sc-home-register-row">
      <dt className="sc-home-label">{label}</dt>
      <dd className="sc-home-value">{value}</dd>
    </div>
  );
}

function DispatchList({ entries }: { entries: ChamberDispatch[] }) {
  return (
    <div className="sc-chamber-frame">
      {entries.map((entry) => (
        <DispatchEntry key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

export default async function SanctuaryChamberPage() {
  const session = await getSessionPayload();

  if (!session?.user) {
    redirect("/sanctuary/login");
  }

  const member = await prisma.member.findUnique({
    where: { memberId: session.user.memberId },
    select: {
      memberId: true,
      fullName: true,
      countryInitiator: true,
    },
  });

  if (!member) {
    redirect("/sanctuary/login");
  }

  const memberships = await prisma.conversationMember.findMany({
    where: { memberId: member.memberId, isRemoved: false },
    include: {
      conversation: {
        include: {
          members: {
            where: { isRemoved: false },
            include: { member: { select: { memberId: true, fullName: true } } },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 40,
            include: {
              sender: { select: { memberId: true, fullName: true } },
              reads: { select: { memberId: true } },
            },
          },
        },
      },
    },
  });

  const initiatorName = member.countryInitiator?.trim();
  const normalized = (value?: string | null) => value?.trim().toLowerCase() ?? "";

  const privateDispatches: ChamberDispatch[] = [];
  const initiatorDispatches: ChamberDispatch[] = [];
  const officialInstructions: ChamberDispatch[] = [];

  for (const membership of memberships) {
    const conversation = membership.conversation;
    if (conversation.status !== "ACTIVE") {
      continue;
    }
    const source = conversation.title?.trim() || conversation.type;
    for (const message of conversation.messages) {
      if (message.senderId === member.memberId) {
        continue;
      }
      if (message.type !== "TEXT" || message.status !== "NORMAL" || message.deletedAt) {
        continue;
      }
      const entry: ChamberDispatch = {
        id: message.id,
        body: message.body,
        createdAt: message.createdAt,
        source,
        senderName: message.sender?.fullName ?? message.senderId,
        unread: !message.reads.some((read) => read.memberId === member.memberId),
      };
      if (initiatorName && normalized(message.sender?.fullName) === normalized(initiatorName)) {
        initiatorDispatches.push(entry);
      } else if (OFFICIAL_TYPES.has(conversation.type)) {
        officialInstructions.push(entry);
      } else if (PRIVATE_TYPES.has(conversation.type)) {
        privateDispatches.push(entry);
      }
    }
  }

  const byNewest = (a: ChamberDispatch, b: ChamberDispatch) =>
    b.createdAt.getTime() - a.createdAt.getTime();

  const privateSorted = [...privateDispatches].sort(byNewest);
  const initiatorSorted = [...initiatorDispatches].sort(byNewest);
  const officialSorted = [...officialInstructions].sort(byNewest);

  const memberName = registryText(member.fullName);
  const initiatorDisplay = registryText(member.countryInitiator);

  return (
    <main className="sc-page sc-chamber-page">
      <div className="sc-aura" aria-hidden="true" />
      <div className="sc-arch" aria-hidden="true" />
      <div className="sc-orbit" aria-hidden="true" />

      <div className="sc-chamber-shell">

        {/* ── The Seal ── */}
        <div className="sc-home-seal" aria-hidden="true">
          <VeilEmblem className="sc-home-emblem" />
        </div>

        {/* ── Title ── */}
        <p className="sc-chamber-eyebrow">THE INNER CHAMBER</p>
        <h1 className="sc-chamber-title">THE CHAMBER</h1>

        <div className="sc-home-rule" aria-hidden="true" />

        <p className="sc-chamber-reception">
          THE PRIVATE CHAMBER OF THE ORDER
        </p>

        <p className="sc-chamber-intro">
          &ldquo;Some matters are not announced before the assembly.
          <br />
          Some words are not written for the uninitiated.
          <br />
          Some instructions are entrusted to one member alone.
          <br />
          This chamber exists for what must pass beyond the ordinary sight.&rdquo;
        </p>

        {/* ── Identity ── */}
        <div className="sc-home-register">
          <div className="sc-home-register-line" aria-hidden="true" />
          <dl className="sc-home-register-fields">
            <RegisterRow label="CURRENT MEMBER" value={memberName} />
            <RegisterRow label="INITIATOR" value={initiatorDisplay} />
          </dl>
          <div className="sc-home-register-line" aria-hidden="true" />
        </div>

        {/* ═══════════════════════
            I · PRIVATE DISPATCHES
            ═══════════════════════ */}
        <section className="sc-chamber-section">
          <SectionHeading numeral="I" title="PRIVATE DISPATCHES" />
          {privateSorted.length > 0 ? (
            <DispatchList entries={privateSorted} />
          ) : (
            <div className="sc-chamber-frame">
              <EmptyRegister
                primary="NO DISPATCHES HAVE BEEN ENTRUSTED TO THIS CHAMBER."
                secondary="WHEN THE ORDER SPEAKS HERE, THE REGISTER SHALL REMEMBER."
              />
            </div>
          )}
        </section>

        {/* ═══════════════════════
            II · FROM THE INITIATOR
            ═══════════════════════ */}
        <section className="sc-chamber-section">
          <SectionHeading numeral="II" title="FROM THE INITIATOR" />
          <p className="sc-chamber-initiator-line">
            THE INITIATOR IS {initiatorDisplay}.
          </p>
          {initiatorSorted.length > 0 ? (
            <DispatchList entries={initiatorSorted} />
          ) : (
            <div className="sc-chamber-frame">
              <EmptyRegister primary="THE CHAMBER OF THE INITIATOR IS SILENT." />
            </div>
          )}
        </section>

        {/* ═══════════════════════
            III · OFFICIAL INSTRUCTIONS
            ═══════════════════════ */}
        <section className="sc-chamber-section">
          <SectionHeading numeral="III" title="OFFICIAL INSTRUCTIONS" />
          {officialSorted.length > 0 ? (
            <DispatchList entries={officialSorted} />
          ) : (
            <div className="sc-chamber-frame">
              <EmptyRegister primary="NO INSTRUCTION HAS BEEN PLACED BEFORE YOU." />
            </div>
          )}
        </section>

        {/* ═══════════════════════
            IV · CHAMBER STATUS
            ═══════════════════════ */}
        <section className="sc-chamber-section">
          <SectionHeading numeral="IV" title="CHAMBER STATUS" />
          <div className="sc-home-register">
            <div className="sc-home-register-line" aria-hidden="true" />
            <dl className="sc-home-register-fields">
              <RegisterRow label="CHAMBER" value="PRIVATE" />
              <RegisterRow label="MEMBER" value={memberName} />
              <RegisterRow label="INITIATOR" value={initiatorDisplay} />
              <RegisterRow label="ACCESS" value="AUTHORIZED" />
            </dl>
            <div className="sc-home-register-line" aria-hidden="true" />
          </div>
        </section>

        {/* ═══════════════════════
            V · THE SILENCE
            ═══════════════════════ */}
        <section className="sc-chamber-section">
          <SectionHeading numeral="V" title="THE SILENCE" />
          <p className="sc-chamber-silence">
            Not every silence means that nothing has been said.
            <br />
            There are matters that remain silent
            <br />
            because they have not yet been entrusted.
            <br /><br />
            Do not mistake silence for permission.
            <br />
            Do not mistake access for authority.
            <br />
            The Chamber opens only what the Order has chosen to open.
          </p>
        </section>

        {/* ═══════════════════════
            VI · CHAMBER NOTICE
            ═══════════════════════ */}
        <section className="sc-chamber-section">
          <SectionHeading numeral="VI" title="CHAMBER NOTICE" />
          <div className="sc-chamber-notice">
            <p className="sc-chamber-notice-line">
              WHAT ENTERS THIS CHAMBER
              <br />
              DOES NOT LEAVE IT
              <br />
              WITHOUT AUTHORITY.
            </p>
            <p className="sc-chamber-notice-note">
              THE MEMBER IS RESPONSIBLE
              <br />
              FOR WHAT IS ENTRUSTED TO HIM.
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