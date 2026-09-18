"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SealEye } from "@/components/Seals";

export default function ThresholdPage() {
  const router = useRouter();
  const [sigil, setSigil] = useState("");
  const [bondWord, setBondWord] = useState("");
  const [rejected, setRejected] = useState(false);

  function sever(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const marked =
      sigil.trim().toUpperCase().startsWith("VEIL-") && bondWord.length > 3;
    if (marked) {
      router.push("/portal");
      return;
    }
    setRejected(true);
    window.setTimeout(() => setRejected(false), 4200);
    alert("THE VEIL REJECTS THE UNMARKED.");
  }

  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-[#050505] text-[#F5F5F5]">
      <div
        className="grain-overlay pointer-events-none fixed inset-0 z-50 opacity-[0.3] mix-blend-overlay"
        aria-hidden="true"
      />
      <div
        className="threshold-scan pointer-events-none fixed left-0 top-0 z-40 h-px w-full bg-gold/50"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 z-30 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.07)_0%,transparent_62%)]"
        aria-hidden="true"
      />

      <div className="relative z-40 flex w-full items-center border-b border-gold-dim/20 bg-black/60 py-3 backdrop-blur">
        <p className="mx-auto px-4 text-center text-[9px] font-semibold uppercase tracking-[0.42em] text-gold-dim sm:text-[10px] sm:tracking-[0.5em]">
          CODEX: I&nbsp;&nbsp;•&nbsp;&nbsp;THE FIRST SEVERANCE&nbsp;&nbsp;•&nbsp;&nbsp;YOU
          ARE LEAVING THE FLESH
        </p>
      </div>

      <Link
        href="/"
        prefetch={false}
        className="absolute left-5 top-14 z-40 text-[9px] font-semibold uppercase tracking-[0.35em] text-gold-dim/60 transition-colors hover:text-gold sm:left-8"
      >
        ← RETURN TO PHYSICAL
      </Link>

      <div className="relative z-30 flex flex-1 flex-col items-center px-6 pb-10 pt-[15vh] text-center">
        <div className="mb-6">
          <SealEye />
        </div>
        <h1 className="gold-gradient-text threshold-flicker mt-6 font-serif text-4xl font-bold tracking-[0.38em] sm:text-5xl">
          AT THE&nbsp;THRESHOLD
        </h1>
        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.42em] leading-relaxed text-gold-dim sm:text-[11px]">
          IF YOU WERE NOT MARKED BEFORE BIRTH,&nbsp;TURN&nbsp;BACK.
        </p>

        <div className="hairline mt-10 w-52" />

        <form
          onSubmit={sever}
          className="mt-12 flex w-full max-w-sm flex-col gap-9"
        >
          <label className="flex flex-col gap-2 text-left">
            <span className="text-[9px] font-semibold uppercase tracking-[0.42em] text-gold-dim">
              YOUR SIGIL&nbsp;&nbsp;•&nbsp;&nbsp;GIVEN AT THE MARKING
            </span>
            <input
              value={sigil}
              onChange={(e) => setSigil(e.target.value)}
              placeholder="BOL-XXXX-XXXX/COUNTRY"
              required
              autoCapitalize="characters"
              autoComplete="off"
              className="threshold-field font-mono"
            />
          </label>

          <label className="flex flex-col gap-2 text-left">
            <span className="text-[9px] font-semibold uppercase tracking-[0.42em] text-gold-dim">
              BOND-WORD&nbsp;&nbsp;•&nbsp;&nbsp;WHISPERED IN DARK
            </span>
            <input
              value={bondWord}
              onChange={(e) => setBondWord(e.target.value)}
              type="password"
              placeholder="••••••••••••"
              required
              autoComplete="off"
              className="threshold-field"
            />
          </label>

          {rejected && (
            <p className="-mt-4 text-center text-[9px] font-semibold uppercase tracking-[0.34em] text-[#8a2521]">
              THE VEIL REJECTS THE UNMARKED.
            </p>
          )}

          <button
            type="submit"
            className="mt-2 border border-gold-dim/40 bg-transparent py-5 text-[11px] font-semibold uppercase tracking-[0.45em] text-gold shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-none hover:border-[#8B0000] hover:bg-[#8B0000] hover:text-[#F5F5F5] focus:outline focus:outline-1 focus:outline-gold"
          >
            SEVER THE VEIL&nbsp;&nbsp;&nbsp;✕&nbsp;&nbsp;&nbsp;CROSS
          </button>
          <p className="-mt-4 text-center text-[8px] uppercase tracking-[0.34em] text-[#8a2521]/90">
            THERE IS NO RETURN AFTER THIS
          </p>
        </form>

        <div className="mt-auto pt-24">
          <p className="threshold-flicker text-[9px] uppercase tracking-[0.4em] text-[#8a2521]/80">
            THE ORDER KEEPS NO RECORD OF THOSE WHO FAIL
          </p>
        </div>

        <footer className="mt-16 w-full border-t border-[#8B0000]/20 pt-8 text-center">
          <p className="mx-auto text-[9px] uppercase tracking-[0.4em] text-[#D4AF37]/30">
            THIS PRECINCT IS RESERVED FOR MEMBERS OF THE ORDER.
          </p>
          <p className="mx-auto text-[9px] uppercase tracking-[0.4em] text-[#D4AF37]/30">
            UNAUTHORIZED ACCESS IS NOT PERMITTED.
          </p>
        </footer>
      </div>
    </main>
  );
}
