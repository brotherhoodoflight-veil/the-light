import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MemberSigil } from "@/components/MemberSigil";
import { Navbar } from "@/components/Navbar";
import { SESSION_COOKIE_NAME, readSessionToken } from "@/lib/auth";
import { HIGH_CIRCLE, levelLabel, levelTitle } from "@/lib/levels";

export const metadata: Metadata = {
  title: "The Portal",
  robots: { index: false, follow: false },
};

const MESSAGE_FROM_HIGH_CIRCLE =
  "Brothers and sisters of the light, the veil thins as the season turns. Guard your sigil in silence, tend your region, and remain watchful — for what is recognized may yet be called.";

export default async function PortalPage() {
  const cookieStore = await cookies();
  const member = await readSessionToken(
    cookieStore.get(SESSION_COOKIE_NAME)?.value,
  );
  if (!member) redirect("/login");

  const joined = new Date(member.createdAt).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-svh bg-[#0B0F19] text-[#94A3B8]">
      <Navbar circle={member.circle} memberId={member.id} />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-12">
        <header className="flex flex-col items-center gap-1 text-center">
          <svg
            viewBox="0 0 100 100"
            className="mx-auto mb-8 h-[160px] w-[160px] opacity-90 drop-shadow-[0_0_25px_rgba(0,229,255,0.6)] transition-all duration-[3000ms] hover:rotate-180 hover:drop-shadow-[0_0_40px_rgba(0,229,255,0.9)] md:h-[220px] md:w-[220px]"
          >
            <g stroke="#00E5FF" fill="none" strokeWidth="0.8" opacity="0.8">
              <circle cx="50" cy="50" r="40" />
              <path d="M82 30 a38 38 0 1 0 2 26" />
              <circle cx="50" cy="12" r="5" fill="#00E5FF" />
              <circle cx="44" cy="5" r="2" fill="#00E5FF" />
              <circle cx="56" cy="5" r="2" fill="#00E5FF" />
            </g>
          </svg>
          <h1 className="font-serif text-3xl font-bold tracking-[0.35em] text-[#00E5FF] sm:text-4xl">
            THE PORTAL
          </h1>
          <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-[#94A3B8]">
            The veil has parted for you, {member.name}
          </p>
          <div className="mt-6 h-px w-56 bg-[#00E5FF]/20" />
        </header>

        <section className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex flex-col items-center gap-5 border border-[#00E5FF]/20 bg-[#1E293B] p-8">
            <MemberSigil
              seed={member.sigil}
              size={180}
              className="ember-pulse text-[#00E5FF]"
            />
            <p className="font-mono text-sm tracking-[0.3em] text-[#00E5FF]">
              {member.id}
            </p>
          </div>

          <div className="border border-[#00E5FF]/20 bg-[#1E293B] p-8">
            <dl className="flex flex-col gap-7">
              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[#94A3B8]">
                  Initiate
                </dt>
                <dd className="mt-2 font-serif text-2xl tracking-[0.06em] text-[#E2E8F0]">
                  {member.name}
                </dd>
              </div>

              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[#94A3B8]">
                  Level
                </dt>
                <dd className="mt-2 text-base tracking-[0.12em] text-[#00E5FF]">
                  {levelLabel(member.level)}
                  {member.circle === HIGH_CIRCLE && (
                    <span className="ml-3 inline-block border border-[#00E5FF]/50 px-2 py-0.5 font-mono text-[0.62rem] tracking-[0.24em] text-[#00E5FF]">
                      HIGH CIRCLE
                    </span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[#94A3B8]">
                  Sigil
                </dt>
                <dd className="mt-2 font-mono text-sm tracking-[0.14em] text-[#94A3B8]">
                  {member.sigil}
                </dd>
              </div>

              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[#94A3B8]">
                  Region
                </dt>
                <dd className="mt-2 text-base tracking-[0.12em] text-[#E2E8F0]">
                  {member.region}, Ghana
                </dd>
              </div>

              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[#94A3B8]">
                  Enrolled
                </dt>
                <dd className="mt-2 text-sm tracking-[0.12em] text-[#94A3B8]">
                  {joined}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="border border-[#00E5FF]/20 bg-[#1E293B] p-8">
          <header className="flex items-center gap-4">
            <span className="h-px flex-1 bg-[#00E5FF]/20" />
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-[#00E5FF]">
              Message from the High Circle
            </p>
            <span className="h-px flex-1 bg-[#00E5FF]/20" />
          </header>
          <p className="mx-auto mt-6 max-w-2xl text-center font-serif text-lg leading-8 tracking-[0.04em] text-[#E2E8F0]/90">
            “{MESSAGE_FROM_HIGH_CIRCLE}”
          </p>
          <p className="mt-6 text-center text-[0.62rem] uppercase tracking-[0.3em] text-[#94A3B8]">
            {levelTitle(member.level)} — sealed in light
          </p>
        </section>
      </main>
    </div>
  );
}