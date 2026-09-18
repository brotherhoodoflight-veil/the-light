"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GoldButton } from "@/components/GoldButton";

interface LoginResponse {
  ok?: boolean;
  error?: string;
  redirectTo?: string;
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initiateId: fd.get("initiateId"),
          passphrase: fd.get("passphrase"),
        }),
      });
      const data: LoginResponse = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error ?? "The veil does not part.");
        return;
      }
      router.replace(data.redirectTo ?? "/portal");
      router.refresh();
    } catch {
      setError("The veil does not part.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-gold-dim">
          Initiate ID
        </span>
        <input
          name="initiateId"
          required
          placeholder="BOL-0000"
          autoCapitalize="characters"
          autoComplete="off"
          className="field-input font-mono tracking-[0.14em]"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-gold-dim">
          Passphrase
        </span>
        <input
          name="passphrase"
          required
          type="password"
          placeholder="••••••••"
          autoComplete="off"
          className="field-input"
        />
      </label>

      {error && (
        <p className="border border-gold-dim/40 bg-gold/5 px-3 py-2 text-center text-[0.7rem] tracking-[0.1em] text-gold">
          {error}
        </p>
      )}

      <GoldButton type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Parting…" : "Enter"}
      </GoldButton>
    </form>
  );
}