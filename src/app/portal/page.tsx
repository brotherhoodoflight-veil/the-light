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
    <div className="veil-vignette min-h-svh">
      <Navbar circle={member.circle} memberId={member.id} />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-12">
        <header className="flex flex-col items-center gap-1 text-center">
          <h1 className="gold-gradient-text font-serif text-3xl font-bold tracking-[0.35em] sm:text-4xl">
            THE PORTAL
          </h1>
          <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-gold-dim">
            The veil has parted for you, {member.name}
          </p>
          <div className="hairline mt-6 w-56" />
        </header>

        <section className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex flex-col items-center gap-5 rounded-sm border border-gold-dim/25 bg-card p-8">
            <MemberSigil
              seed={member.sigil}
              size={180}
              className="ember-pulse text-gold drop-shadow-[0_0_30px_rgba(212,175,55,0.25)]"
            />
            <p className="font-mono text-sm tracking-[0.3em] text-gold">
              {member.id}
            </p>
          </div>

          <div className="rounded-sm border border-gold-dim/25 bg-card p-8">
            <dl className="flex flex-col gap-7">
              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-gold-dim">
                  Initiate
                </dt>
                <dd className="mt-2 font-serif text-2xl tracking-[0.06em] text-parchment">
                  {member.name}
                </dd>
              </div>

              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-gold-dim">
                  Level
                </dt>
                <dd className="mt-2 text-base tracking-[0.12em] text-gold">
                  {levelLabel(member.level)}
                  {member.circle === HIGH_CIRCLE && (
                    <span className="ml-3 inline-block border border-gold-dim/50 px-2 py-0.5 font-mono text-[0.62rem] tracking-[0.24em] text-gold-soft">
                      HIGH CIRCLE
                    </span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-gold-dim">
                  Sigil
                </dt>
                <dd className="mt-2 font-mono text-sm tracking-[0.14em] text-mist">
                  {member.sigil}
                </dd>
              </div>

              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-gold-dim">
                  Region
                </dt>
                <dd className="mt-2 text-base tracking-[0.12em] text-parchment">
                  {member.region}, Ghana
                </dd>
              </div>

              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-gold-dim">
                  Enrolled
                </dt>
                <dd className="mt-2 text-sm tracking-[0.12em] text-mist">
                  {joined}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="rounded-sm border border-gold-dim/25 bg-card p-8">
          <header className="flex items-center gap-4">
            <span className="hairline flex-1" />
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-gold">
              Message from the High Circle
            </p>
            <span className="hairline flex-1" />
          </header>
          <p className="mx-auto mt-6 max-w-2xl text-center font-serif text-lg leading-8 tracking-[0.04em] text-parchment/90">
            “{MESSAGE_FROM_HIGH_CIRCLE}”
          </p>
          <p className="mt-6 text-center text-[0.62rem] uppercase tracking-[0.3em] text-gold-dim">
            {levelTitle(member.level)} — sealed in light
          </p>
        </section>
      </main>
    </div>
  );
}