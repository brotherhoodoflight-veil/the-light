"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GoldButton } from "@/components/GoldButton";
import { LEVELS, REGIONS } from "@/lib/levels";
import type { PublicMember } from "@/lib/types";

interface CreateResponse {
  ok?: boolean;
  error?: string;
  member?: PublicMember;
  passphrase?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [granted, setGranted] = useState<{
    id: string;
    passphrase: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    setGranted(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/create-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") ?? ""),
          region: String(fd.get("region") ?? ""),
          level: Number(fd.get("level") ?? 1),
        }),
      });
      const data: CreateResponse = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok || !data.member?.id || !data.passphrase) {
        setError(data.error ?? "The circle refuses.");
        return;
      }
      setGranted({ id: data.member.id, passphrase: data.passphrase });
      e.currentTarget.reset();
      router.refresh();
    } catch {
      setError("The circle refuses.");
    } finally {
      setPending(false);
    }
  }

  async function copyCredential() {
    if (!granted) return;
    try {
      await navigator.clipboard.writeText(
        `${granted.id}\n${granted.passphrase}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="border border-gold-dim/25 bg-card p-6 sm:p-7">
      <header className="flex flex-col gap-1">
        <h2 className="font-serif text-xl font-semibold tracking-[0.2em] text-gold">
          Register an Initiate
        </h2>
        <p className="text-[0.62rem] uppercase tracking-[0.3em] text-gold-dim">
          Only the High Circle may speak the name
        </p>
      </header>

      <div className="hairline my-5" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-gold-dim">
            Name
          </span>
          <input
            name="name"
            required
            maxLength={80}
            placeholder="Full name"
            className="field-input"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-gold-dim">
            Ghana Region
          </span>
          <select name="region" required defaultValue="" className="field-input">
            <option value="" disabled>
              Choose a region
            </option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-gold-dim">
            Level
          </span>
          <select name="level" defaultValue={1} className="field-input">
            {LEVELS.map((l) => (
              <option key={l.level} value={l.level}>
                {l.level} · {l.title}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <p className="border border-gold-dim/40 bg-gold/5 px-3 py-2 text-center text-[0.7rem] tracking-[0.08em] text-gold">
            {error}
          </p>
        )}

        <GoldButton type="submit" disabled={pending} className="mt-1 w-full">
          {pending ? "Binding…" : "Sign the Register"}
        </GoldButton>
      </form>

      {granted && (
        <div className="mt-5 border border-gold/40 bg-gold/5 p-4">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-gold">
            Register sealed — passphrase shown once
          </p>
          <div className="mt-3 flex flex-col gap-1.5 font-mono text-sm tracking-[0.16em] text-parchment">
            <p>ID&nbsp;&nbsp;{granted.id}</p>
            <p>PASS&nbsp;&nbsp;{granted.passphrase}</p>
          </div>
          <button
            type="button"
            onClick={copyCredential}
            className="mt-4 w-full border border-gold-dim/60 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-gold transition-colors hover:border-gold hover:bg-gold/5"
          >
            {copied ? "Copied" : "Copy credentials"}
          </button>
        </div>
      )}
    </section>
  );
}