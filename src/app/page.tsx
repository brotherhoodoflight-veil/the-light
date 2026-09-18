import Link from "next/link";
import SealPentagram from "@/components/SealPentagram";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col items-center justify-center relative overflow-hidden">

      {/* Fog / Grain overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.15)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

      {/* Top small text */}
      <p className="tracking-[0.6em] text-[10px] text-[#8A6D2B] mt-12 z-10">
        HEADQUARTERS: UNITED STATES • EST. 1863
      </p>

      {/* Seal - golden pentagram */}
      <SealPentagram className="seal-gold z-10 mx-auto mb-8 h-[180px] w-[180px] md:h-[240px] md:w-[240px]" />

      {/* Main Titles */}
      <h1 className="z-10 text-center font-serif tracking-[0.2em] text-[#D4AF37] text-sm">
        THE SACRED ORDER OF THE VEILED LIGHT
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
      <div className="z-10 my-10 h-[1px] w-24 bg-[#D4AF37]/20" />

      {/* Description - Your text */}
      <p className="z-10 max-w-[520px] text-center text-[13px] leading-7 tracking-wide text-[#E8E6E3]/70 font-light px-6">
        The Order keeps no public register and receives no casual witness. Its knowledge is held in confidence. Its authority is closed until granted. Its membership is chosen, never requested. The institution itself is not displayed here; it stands beyond the threshold.
      </p>

      {/* Approach button - SCARY */}
      <div className="z-10 mt-16 flex flex-col items-center">
        <p className="text-[9px] tracking-[0.4em] text-[#8A6D2B] mb-4">YOU ARE STILL IN THE PHYSICAL WORLD</p>
        <Link
          href="/the-threshold"
          className="relative border border-[#D4AF37] px-12 py-4 text-[12px] tracking-[0.4em] text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-none hover:border-[#8B0000] hover:bg-[#8B0000] hover:text-[#F5F5F5]"
        >
          APPROACH THE THRESHOLD
        </Link>
        <p className="text-[9px] tracking-[0.3em] text-[#E8E6E3]/30 mt-4">
          THE BROTHERHOOD OF LIGHT • A PRIVATE INSTITUTION
        </p>
      </div>

      {/* Bottom warning */}
      <p className="absolute bottom-6 text-[8px] tracking-widest text-[#E8E6E3]/20 z-10">
        LEAVING THE PHYSICAL • ENTER AT OWN RISK
      </p>
    </main>
  );
}
