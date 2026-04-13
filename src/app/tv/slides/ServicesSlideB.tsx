import { SERVICES } from "@/lib/constants";

const FEATURED = [
  { key: "Insurance", bullets: ["General liability", "Workers compensation", "Disability insurance"] },
  { key: "Audit Defense", bullets: ["Workers comp audits", "Sales tax audits", "Fine reduction services"] },
  { key: "Financial Services", bullets: ["Bookkeeping", "Financial statements", "Business analysis"] },
];

export default function ServicesSlideB({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full bg-[#F8FAFC] flex flex-col items-center justify-center px-16">
      <p className="text-[16px] uppercase tracking-[4px] text-[#4F56E8] mb-4">Our Services</p>
      <h2 className="text-[44px] font-bold text-[#1E293B] mb-16">Protect & Manage Your Business</h2>
      <div className="grid grid-cols-3 gap-10 max-w-[1400px] w-full">
        {FEATURED.map((service) => {
          const full = SERVICES.find((s) => s.name === service.key);
          return (
            <div key={service.key} className="bg-white rounded-2xl p-10 shadow-sm border border-[#E2E8F0]">
              <div className="text-[40px] mb-4">{full?.icon}</div>
              <h3 className="text-[28px] font-bold text-[#1E293B] mb-4">{service.key}</h3>
              <ul className="space-y-3">
                {service.bullets.map((b) => (
                  <li key={b} className="text-[20px] text-[#475569] flex items-start gap-3">
                    <span className="text-[#4F56E8] mt-1 shrink-0">●</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
