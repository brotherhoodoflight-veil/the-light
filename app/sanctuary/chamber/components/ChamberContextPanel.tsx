"use client";

import type { ConversationSummary } from "../../../../lib/messages/types";
import type { ChamberMemberInfo } from "../utils";

interface ChamberContextPanelProps {
  conversation: ConversationSummary;
  member: ChamberMemberInfo;
}

function KvRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function ChamberContextPanel({
  conversation,
  member,
}: ChamberContextPanelProps) {
  const present = conversation.participants.filter((p) => p.present);
  const presentCount = present.length;
  const selfEntry = conversation.participants.find(
    (p) => p.memberId === member.memberId,
  );
  const yourStanding = selfEntry?.status ?? member.status ?? "ACTIVE";

  return (
    <aside className="cc-info" aria-label="Chamber context">
      <div className="cc-info-scroll">
        {/* ── Identity ── */}
        <section className="cc-info-section">
          <p className="cc-info-eyebrow">CHAMBER</p>
          <h3 className="cc-info-title">{conversation.displayTitle}</h3>
          <p className="cc-info-type">
            {conversation.type}
            {conversation.readOnly ? " · READ ONLY" : ""}
          </p>
          {conversation.description ? (
            <p className="cc-info-desc">{conversation.description}</p>
          ) : null}
        </section>

        {/* ── State of the Chamber ── */}
        <section className="cc-info-section">
          <p className="cc-info-eyebrow">STATE OF THE CHAMBER</p>
          <dl className="cc-info-kv">
            <KvRow label="MODE" value={conversation.type} />
            <KvRow
              label="MEMBERS SEATED"
              value={String(conversation.memberCount)}
            />
            <KvRow label="PRESENT" value={String(presentCount)} />
            <KvRow label="YOUR STANDING" value={yourStanding.toUpperCase()} />
          </dl>
        </section>

        {/* ── Participants ── */}
        <section className="cc-info-section">
          <p className="cc-info-eyebrow">PARTICIPANTS</p>
          <ul className="cc-info-participants">
            {conversation.participants.map((p) => (
              <li key={p.memberId} className="cc-info-participant">
                <span className="cc-info-participant-avatar">
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt="" loading="lazy" />
                  ) : (
                    p.initials
                  )}
                </span>
                <span className="cc-info-participant-copy">
                  <span className="cc-info-participant-name">
                    {p.displayName}
                  </span>
                  <span className="cc-info-participant-sub">
                    {p.memberId} · {p.status}
                  </span>
                </span>
                <span
                  className={
                    p.present
                      ? "cc-info-presence is-present"
                      : "cc-info-presence"
                  }
                >
                  {p.present ? "PRESENT" : "ABSENT"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Access & Custody ── */}
        <section className="cc-info-section">
          <p className="cc-info-eyebrow">ACCESS &amp; CUSTODY</p>
          <ul className="cc-info-scope">
            <li>RESTRICTED MEMBER ACCESS</li>
            <li>ACCESS GOVERNED BY THE ORDER&apos;S MEMBERSHIP PERMISSIONS</li>
            <li>READ RECEIPTS ARE RECORDED BY THE CHAMBER</li>
            <li>REPORTS OF MISCONDUCT ARE DIRECTED TO THE STEWARDS</li>
          </ul>
        </section>

        {/* ── Filed Documents ── */}
        <section className="cc-info-section">
          <p className="cc-info-eyebrow">FILED DOCUMENTS</p>
          <p className="cc-info-note">
            Documents shared within this chamber remain under the custody of the
            Order. No uncontrolled filing or external sharing is permitted.
          </p>
        </section>

        <hr className="cc-info-rule" aria-hidden="true" />
        <span className="cc-info-seal" aria-hidden="true">
          ◈
        </span>
      </div>
    </aside>
  );
}
