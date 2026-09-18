export default function SanctumPage() {
  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-[#0A0612] text-[#E8E6E3]">
      {/* Fog / Grain overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(205,127,50,0.12)_0%,_transparent_70%)] pointer-events-none" />
      <div className="seal-gold absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none" />

      {/* Top small text */}
      <p className="tracking-[0.6em] text-[10px] text-[#A8843C] mt-12 text-center z-10">
        THE INNER SANCTUM • NO CASUAL WITNESS
      </p>

      {/* Seal - golden sigil */}
      <img
        src="/seals/4-sigil.png"
        alt=""
        className="z-10 mx-auto my-10 h-[140px] w-[140px] opacity-80 drop-shadow-[0_0_18px_rgba(212,175,55,0.45)] transition-all duration-300 hover:drop-shadow-[0_0_34px_#D4AF37] md:h-[190px] md:w-[190px]"
      />

      {/* Main Titles */}
      <h1 className="z-10 text-center font-serif tracking-[0.2em] text-sm text-[#D4AF37]">
        THE SACRED SANCTUM
      </h1>

      <h2 className="z-10 text-center font-serif font-light text-5xl md:text-7xl leading-[0.9] tracking-widest mt-6">
        BROTHERHOOD<br />
        OF<br />
        <span className="text-[#D4AF37]">LIGHT</span>
      </h2>

      <p className="z-10 mt-8 tracking-[0.5em] text-[11px] text-[#8A6D2B]">
        LIGHT EXISTS BEHIND THE VEIL.
      </p>

      {/* Divider */}
      <div className="z-10 w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent my-10 mx-auto" />

      {/* Description */}
      <p className="z-10 max-w-[520px] text-center text-[13px] leading-7 tracking-wide text-[#E8E6E3]/70 font-light px-6 mx-auto">
        The Sanctum is the heart of the Order. Here the veiled knowledge is
        kept, and here the Circle convenes. Entry is permitted only to those
        the Order has chosen — you were never asked, and you will never be.
      </p>

      {/* Hierarchical stats */}
      <div className="z-10 flex items-center gap-8 mt-12 text-center">
        <div>
          <p className="text-3xl font-serif text-[#D4AF37]">VII</p>
          <p className="text-[auscript]">CIRCLES</p>
        </div>
      </div>
    </main>
  );
}