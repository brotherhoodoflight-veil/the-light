import type { Metadata } from "next";
import Link from "next/link";
import { CircleSigil } from "@/components/CircleSigil";
import { LoginForm } from "@/components/LoginForm";
import {
  HIGH_CIRCLE_MEMBER_ID,
  HIGH_CIRCLE_PASSPHRASE,
  SEED_PASSPHRASE,
} from "@/lib/db";

export const metadata: Metadata = {
  title: "Initiates",
  description: "Enter beneath the veil.",
};

export default function LoginPage() {
  const showHint = process.env.NODE_ENV !== "production";

  return (
    <main className="veil-vignette relative flex min-h-svh items-center justify-center overflow-hidden px-6 py-24">
      <div className="w-full max-w-sm">
        <header className="flex flex-col items-center text-center">
          <CircleSigil size={92} className="text-gold" />
          <h1 className="gold-gradient-text mt-7 font-serif text-3xl font-bold tracking-[0.35em]">
            INITIATES
          </h1>
          <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-gold-dim">
            Enter beneath the veil
          </p>
          <div className="hairline my-7 w-44" />
        </header>

        <LoginForm />

        {showHint && (
          <p className="mt-7 text-center text-[0.62rem] tracking-[0.08em] leading-relaxed text-mist">
            Demo access — any initiate: passphrase “{SEED_PASSPHRASE}” · High Circle{" "}
            {HIGH_CIRCLE_MEMBER_ID}: passphrase “{HIGH_CIRCLE_PASSPHRASE}”
          </p>
        )}

        <div className="mt-9 flex items-center justify-center gap-3">
          <span className="hairline w-10" />
          <Link
            href="/"
            prefetch={false}
            className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-mist transition-colors hover:text-gold"
          >
            Return to the Veil
          </Link>
          <span className="hairline w-10" />
        </div>
      </div>
    </main>
  );
}