import Link from "next/link";
import { SealPentagram } from "@/components/Seals";

export default function Home() {
  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-[#050505] text-[#F5F0E8]">
      {/* Grain overlay */}
      <div
        className="grain-overlay pointer-events-none fixed inset-0 z-50 opacity-[0.25] mix-blend-overlay"
        aria-hidden="true"
      />
      {/* Slow breathing radial glow */}
      <div
        className="ember-pulse pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.10)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-30 flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-[16vh] text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.6em] text-gold-dim/70">
          HEADQUARTERS:&nbsp;UNITED&nbsp;STATES&nbsp;&nbsp;•&nbsp;&nbsp;EST.&nbsp;1863
        </p>

        <div className="hairline mt-10 w-44" />

        {/* Seal - golden pentagram (inline SVG, no black box) */}
        <SealPentagram className="seal-gold mx-auto my-14 h-[180px] w-[180px] drop-shadow-[0_0_18px_rgba(212,175,55,0.5)] transition-all duration-300 hover:drop-shadow-[0_0_40px_#D4AF37] md:h-[240px] md:w-[240px]" />

        <h1 className="mt-10 font-serif text-xs font-semibold uppercase tracking-[0.3em] text-gold-dim/80">
          THE SACRED ORDER OF THE VEILED LIGHT
        </h1>

        <h2 className="threshold-flicker mt-6 font-serif text-6xl font-extralight leading-[0.92] tracking-[0.16em] md:text-8xl">
          BROTHERHOOD<br />
          OF<br />
          <span className="text-[#D4AF37]">LIGHT</span>
        </h2>

        <p className="mt-8 text-[10px] font-light uppercase tracking-[0.5em] text-gold-dim/60">
          LIGHT EXISTS BEHIND THE VEIL.
        </p>

        <div className="hairline mt-10 w-52" />

        <p className="mt-10 max-w-[520px] text-[13px] font-light leading-8 tracking-wide text-parchment/60">
          The Order keeps no public register and receives no casual witness.
          Its knowledge is held in confidence. Its authority is closed until
          granted. Its membership is chosen, never requested. What sits beyond
          this frame is not shown to the unmarked.
        </p>

        {/* Warning */}
        <p className="mt-10 text-[9px] font-semibold uppercase tracking-[0.45em] text-[#8a2521]">
          THE UNMARKED ARE NOT RECEIVED
        </p>

        {/* ENTER IF YOU DARE */}
        <Link
          href="/the-threshold"
          prefetch={false}
          className="mt-14 border border-gold-dim/40 px-14 py-5 text-[11px] font-semibold uppercase tracking-[0.5em] text-gold transition-all duration-500 hover:border-gold hover:bg-gold hover:text-black hover:shadow-[0_0_42px_rgba(212,175,55,0.45)] focus:outline focus:outline-1 focus:outline-gold"
        >
          ENTER IF YOU DARE
        </Link>
        <p className="mt-4 text-[8px] font-semibold uppercase tracking-[0.4em] text-gold-dim/60">
          THERE IS NO TURNING BACK AFTER THIS
        </p>

        {/* Footer stats */}
        <footer className="mt-auto w-full max-w-md pt-24">
          <p className="mx-auto text-center text-[8px] font-medium uppercase tracking-[0.4em] text-gold-dim/50">
            WITNESS:&nbsp;147&nbsp;GH&nbsp;&nbsp;•&nbsp;&nbsp;5700&nbsp;GLOBAL&nbsp;&nbsp;•&nbsp;&nbsp;HQ:&nbsp;US
          </p>
        </footer>
      </div>
    </main>
  );
}
