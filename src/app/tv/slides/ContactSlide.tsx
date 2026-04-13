import { ADDRESS, PHONE, HOURS } from "@/lib/constants";

export default function ContactSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full bg-[#0A0F1A] flex flex-col items-center justify-center px-16">
      <p className="text-[16px] uppercase tracking-[4px] text-[#F9A825] mb-6">Advantage Services</p>
      <h2 className="text-[48px] font-bold text-white mb-14">We&apos;re Here For You</h2>
      <div className="border border-white/10 rounded-2xl px-16 py-12 max-w-[800px] w-full">
        <div className="space-y-8 text-center">
          <div>
            <p className="text-[16px] uppercase tracking-[3px] text-white/40 mb-2">Visit Us</p>
            <p className="text-[26px] text-white">{ADDRESS.full}</p>
          </div>
          <div className="w-[60px] h-[2px] bg-[#F9A825]/30 mx-auto" />
          <div>
            <p className="text-[16px] uppercase tracking-[3px] text-white/40 mb-2">Call Us</p>
            <p className="text-[30px] text-white font-semibold">{PHONE.main}</p>
          </div>
          <div className="w-[60px] h-[2px] bg-[#F9A825]/30 mx-auto" />
          <div>
            <p className="text-[16px] uppercase tracking-[3px] text-white/40 mb-2">Office Hours</p>
            <p className="text-[26px] text-white">{HOURS.days}</p>
            <p className="text-[24px] text-white/70 mt-1">{HOURS.time} {HOURS.timezone}</p>
          </div>
        </div>
      </div>
      <div className="mt-10 flex items-center gap-4">
        <div className="w-[80px] h-[80px] bg-white rounded-lg flex items-center justify-center">
          <div className="w-[70px] h-[70px] bg-[#E2E8F0] rounded flex items-center justify-center text-[10px] text-[#475569]">QR</div>
        </div>
        <p className="text-[16px] text-white/40">advantagenys.com</p>
      </div>
    </div>
  );
}
