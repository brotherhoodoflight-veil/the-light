"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HIGH_CIRCLE, levelTitle } from "@/lib/levels";
import type { PublicMember } from "@/lib/types";

interface MemberTableProps {
  members: PublicMember[];
  currentId: string;
}

export function MemberTable({ members, currentId }: MemberTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.id, m.name, m.region, levelTitle(m.level)]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [members, query]);

  function isSelf(m: PublicMember) {
    return m.id === currentId;
  }

  async function changeLevel(m: PublicMember, delta: -1 | 1) {
    if (busyId || isSelf(m)) return;
    setBusyId(m.id);
    setError(null);
    try {
      const target = Math.min(9, Math.max(1, m.level + delta));
      const res = await fetch("/api/admin/set-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id, level: target }),
      });
      const data: { ok?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error ?? "The register refuses.");
        return;
      }
      router.refresh();
    } catch {
      setError("The register refuses.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the register…"
          className="field-input sm:max-w-xs"
          aria-label="Search members"
        />
        <p className="text-[0.65rem] uppercase tracking-[0.28em] text-mist sm:ml-auto">
          {filtered.length} / {members.length} initiated
        </p>
      </div>

      {error && (
        <p className="border border-gold-dim/40 bg-gold/5 px-3 py-2 text-center text-[0.7rem] tracking-[0.08em] text-gold">
          {error}
        </p>
      )}

      <div className="overflow-x-auto border border-gold-dim/25">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gold-dim/25 text-[0.6rem] uppercase tracking-[0.26em] text-gold-dim">
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Region</th>
              <th className="px-4 py-3 font-semibold">Level</th>
              <th className="px-4 py-3 text-right font-semibold">Mend</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr
                key={m.id}
                className="border-b border-gold-dim/10 transition-colors last:border-b-0 hover:bg-gold/[0.03]"
              >
                <td className="px-4 py-3 font-mono text-xs tracking-[0.14em] text-gold">
                  {m.id}
                  {m.circle === HIGH_CIRCLE && (
                    <span className="ml-2 inline-block border border-gold-dim/50 px-1.5 py-0.5 text-[0.55rem] tracking-[0.2em] text-gold-soft">
                      HIGH CIRCLE
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm tracking-[0.04em] text-parchment">
                  {m.name}
                  {isSelf(m) && (
                    <span className="ml-2 text-[0.6rem] uppercase tracking-[0.22em] text-mist">
                      (you)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm tracking-[0.04em] text-mist">
                  {m.region}
                </td>
                <td className="px-4 py-3 text-sm tracking-[0.04em] text-parchment">
                  {m.level} · {levelTitle(m.level)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      aria-label={`Demote ${m.name}`}
                      disabled={
                        busyId !== null || isSelf(m) || m.level <= 1
                      }
                      onClick={() => changeLevel(m, -1)}
                      className="border border-gold-dim/50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-mist transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      aria-label={`Promote ${m.name}`}
                      disabled={
                        busyId !== null || isSelf(m) || m.level >= 9
                      }
                      onClick={() => changeLevel(m, 1)}
                      className="border border-gold-dim/50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-mist transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm tracking-[0.08em] text-mist">
            No initiate answers that name.
          </p>
        )}
      </div>
    </div>
  );
}