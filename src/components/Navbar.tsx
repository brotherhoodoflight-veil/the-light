"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HIGH_CIRCLE } from "@/lib/levels";
import { CircleSigil } from "@/components/CircleSigil";

interface NavbarProps {
  circle: number;
  memberId: string;
}

export function Navbar({ circle, memberId }: NavbarProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  const linkClass =
    "text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-mist transition-colors hover:text-gold";

  return (
    <header className="sticky top-0 z-40 border-b border-gold-dim/25 bg-void/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-5 px-5 py-3">
        <Link
          href="/portal"
          className="flex items-center gap-3"
          prefetch={false}
        >
          <CircleSigil size={34} strokeWidth={2.4} />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-sm font-semibold tracking-[0.35em] text-gold">
              THE VEIL
            </span>
            <span className="mt-1 text-[0.55rem] uppercase tracking-[0.3em] text-gold-dim">
              Brotherhood of Light
            </span>
          </span>
        </Link>

        <nav className="ml-auto flex flex-wrap items-center gap-5">
          <Link href="/portal" className={linkClass} prefetch={false}>
            Portal
          </Link>
          {circle === HIGH_CIRCLE && (
            <Link href="/admin" className={linkClass} prefetch={false}>
              High Circle
            </Link>
          )}
          <span className="hidden text-[0.65rem] tracking-[0.18em] text-gold-dim sm:inline">
            {memberId}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            disabled={pending}
            className="border border-gold-dim/50 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold transition-colors hover:border-gold hover:bg-gold/5 disabled:opacity-40"
          >
            {pending ? "Veiling…" : "Withdraw"}
          </button>
        </nav>
      </div>
    </header>
  );
}