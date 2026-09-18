import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MemberTable } from "@/components/admin/MemberTable";
import { RegisterForm } from "@/components/admin/RegisterForm";
import { Navbar } from "@/components/Navbar";
import { SESSION_COOKIE_NAME, readSessionToken } from "@/lib/auth";
import { listMembers, publicMember } from "@/lib/db";
import { HIGH_CIRCLE, levelTitle, REGIONS } from "@/lib/levels";

export const metadata: Metadata = {
  title: "High Circle",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = await readSessionToken(
    cookieStore.get(SESSION_COOKIE_NAME)?.value,
  );
  if (!session) redirect("/login");
  if (session.circle !== HIGH_CIRCLE) redirect("/portal");

  const members = (await listMembers()).map(publicMember);

  return (
    <div className="veil-vignette min-h-svh">
      <Navbar circle={session.circle} memberId={session.id} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-12">
        <header className="flex flex-col items-center gap-1 text-center">
          <h1 className="gold-gradient-text font-serif text-3xl font-bold tracking-[0.35em] sm:text-4xl">
            HIGH CIRCLE
          </h1>
          <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-gold-dim">
            {session.name} — keeper of the register
          </p>
          <div className="hairline mt-6 w-56" />
        </header>

        <section className="grid grid-cols-2 gap-6">
          <div className="rounded-sm border border-gold-dim/25 bg-card p-5 text-center">
            <p className="font-serif text-3xl tracking-[0.08em] text-gold">
              {members.length}
            </p>
            <p className="mt-1 text-[0.6rem] uppercase tracking-[0.3em] text-mist">
              Initiated souls
            </p>
          </div>
          <div className="rounded-sm border border-gold-dim/25 bg-card p-5 text-center">
            <p className="font-serif text-3xl tracking-[0.08em] text-gold">
              {REGIONS.length}
            </p>
            <p className="mt-1 text-[0.6rem] uppercase tracking-[0.3em] text-mist">
              Ghana regions
            </p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
          <RegisterForm />
          <MemberTable members={members} currentId={session.id} />
        </div>

        <footer className="border-t border-gold-dim/20 pt-6 text-center">
          <p className="font-serif text-sm tracking-[0.3em] text-gold-dim">
            Something concealed shall be revealed — {levelTitle(session.level)}
          </p>
        </footer>
      </main>
    </div>
  );
}