import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-[#040404] text-[#E7E3DC]">
      {/* Hiss / grain */}
      <div
        className="pointer-events-none fixed inset-0 z-50 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22%3E%3Cfilter id=%22g%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23g)%22 opacity=%220.55%22/%3E%3C/svg%3E')] opacity-[0.09] mix-blend-overlay"
        aria-hidden="true"
      />

      {/* Corner codes */}
      <p className="pointer-events-none absolute left-6 top-6 z-10 text-[8px] font-medium uppercase tracking-[0.5em] text-[#6b6b66]/60">
        EST.&nbsp;1863&nbsp;&nbsp;•&nbsp;&nbsp;HQ:&nbsp;US
      </p>
      <p className="pointer-events-none absolute right-6 top-6 z-10 -rotate-90 origin-top-right text-[8px] font-medium uppercase tracking-[0.5em] text-[#6b6b66]/60">
        STOP
      </p>
      <p className="pointer-events-none absolute bottom-6 left-6 z-10 whitespace-pre text-[8px] font-medium uppercase leading-[2.4] tracking-[0.5em] text-[#6b6b66]/60">
        THE&nbsp;FLESH<br />ENDS&nbsp;HERE
      </p>
      <p className="pointer-events-none absolute bottom-6 right-6 z-10 text-[8px] font-medium uppercase tracking-[0.5em] text-[#6b6b66]/60">
        147&nbsp;•&nbsp;SEALED
      </p>

      <div className="relative z-20 flex flex-1 flex-col items-center justify-center px-8 pb-32 pt-[14vh] text-center">
        <p className="text-[9px] font-medium uppercase tracking-[0.55em] text-[#3d3d39]/90">
          SILENCE.
        </p>

        <h1 className="mt-9 font-serif text-[13vw] font-extralight leading-[0.95] tracking-[0.02em] text-[#E7E3DC]/90 sm:text-7xl">
          YOU ARE
          <br />
          BEING
          <br />
          <span className="text-[#B8860B]">COUNTED.</span>
        </h1>

        <div className="mt-11 h-px w-32 bg-gradient-to-r from-transparent via-[#8a6d2b]/50 to-transparent" />

        <p className="mt-11 max-w-[520px] text-[13px] font-light leading-8 tracking-wide text-[#b9b6ae]/85">
          This frame is closed to the unregistered. That you are reading it
          means you were already named. The Order does not make that kind of
          mistake. Look at your own hand — it was not your choice that got it
          here.
        </p>

        <p className="mt-9 text-[9px] font-semibold uppercase tracking-[0.45em] text-[#7a1f1b]/95">
          THE ORDER DOES NOT RECEIVE VISITORS. IT KEEPS THEM.
        </p>

        <Link
          href="/the-threshold"
          prefetch={false}
          className="group relative mt-14 inline-block"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.5em] text-[#c9a227] transition-colors duration-500 group-hover:text-[#F5E9C8]">
            ENTER IF YOU DARE
          </span>
          <span className="absolute -bottom-2 left-0 h-px w-full bg-[#c9a227]/50 transition-all duration-700 group-hover:w-0" />
          <span className="absolute -bottom-2 left-0 h-px w-0 bg-[#7a1f1b] transition-all duration-700 group-hover:w-full" />
        </Link>

        <p className="mt-8 text-[8px] font-light uppercase tracking-[0.45em] text-[#6b6b66]/70">
          THE DOOR YOU CAME IN WITH WILL NOT FIT THE ONE BEHIND IT.
        </p>
      </div>
    </main>
  );
}
