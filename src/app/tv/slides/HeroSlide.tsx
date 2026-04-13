import Image from "next/image";
import { ADDRESS } from "@/lib/constants";

export default function HeroSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="relative h-full w-full">
      <Image
        src="/images/office-exterior-hd.jpg"
        alt="Advantage Services Office"
        fill
        className="object-cover"
        sizes="1920px"
        quality={90}
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1A]/80 via-[#0A0F1A]/60 to-[#0A0F1A]/90" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-16">
        <p className="text-[18px] uppercase tracking-[4px] text-[#F9A825] mb-6">Welcome To</p>
        <h1 className="text-[72px] font-extrabold text-white leading-tight mb-6">Advantage Services</h1>
        <div className="w-[80px] h-[3px] bg-[#F9A825] rounded-full mb-8" />
        <p className="text-[32px] text-white/90 font-medium max-w-[900px] leading-snug">One Stop Shop For All Business Solutions</p>
        <div className="mt-12 border border-[#F9A825]/40 rounded-2xl px-10 py-4">
          <p className="text-[22px] text-white/80">20+ Years Serving NYC Small Businesses</p>
        </div>
        <p className="absolute bottom-12 text-[18px] text-white/50">{ADDRESS.full}</p>
      </div>
    </div>
  );
}
