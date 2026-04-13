import Image from "next/image";

export default function ITINSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full bg-gradient-to-br from-[#4F56E8] to-[#1E293B] flex items-center justify-center px-20">
      <div className="flex items-center gap-20 max-w-[1400px] w-full">
        <div className="flex-1">
          <p className="text-[16px] uppercase tracking-[4px] text-[#F9A825] mb-4">Featured Service</p>
          <h2 className="text-[52px] font-extrabold text-white leading-tight mb-6">ITIN Registration</h2>
          <div className="w-[60px] h-[3px] bg-[#F9A825] rounded-full mb-8" />
          <div className="inline-block bg-white/10 border border-[#F9A825]/40 rounded-xl px-6 py-3 mb-8">
            <p className="text-[20px] text-[#F9A825] font-semibold">IRS Certified Acceptance Agent</p>
          </div>
          <ul className="space-y-5 mb-10">
            {["No need to mail your passport", "Certify & file on-site", "2,250+ ITINs processed"].map((item) => (
              <li key={item} className="text-[24px] text-white/90 flex items-center gap-4">
                <span className="text-[#F9A825] text-[20px]">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="border-t border-white/10 pt-6">
            <p className="text-[16px] uppercase tracking-[3px] text-white/40 mb-3">Also Available</p>
            <p className="text-[20px] text-white/60">Immigration · Citizenship · Legal Services</p>
          </div>
        </div>
        <div className="shrink-0">
          <div className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden border-2 border-white/10">
            <Image
              src="/images/team/kedar.jpg"
              alt="Kedar Gupta — IRS Certified Tax Preparer & Acceptance Agent"
              fill
              className="object-cover object-[50%_10%]"
              sizes="300px"
              quality={90}
            />
          </div>
          <p className="text-center mt-4 text-[18px] text-white font-semibold">Kedar Gupta</p>
          <p className="text-center text-[14px] text-white/50">IRS Certified Tax Preparer</p>
        </div>
      </div>
    </div>
  );
}
