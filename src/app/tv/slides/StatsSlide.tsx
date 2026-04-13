"use client";

import { useState, useEffect, useRef } from "react";
import { STATS } from "@/lib/constants";
import { GOOGLE_RATING } from "@/lib/reviews";

const DISPLAY_STATS = [
  { count: STATS.businessSetups.count, label: "Businesses Formed", suffix: "+" },
  { count: STATS.taxClients.count, label: "Tax Clients Served", suffix: "+" },
  { count: STATS.businessLicenses.count, label: "Business Licenses", suffix: "+" },
  { count: GOOGLE_RATING.rating, label: "Google Rating", suffix: "", isRating: true },
];

function CountUp({ target, duration = 2000, isRating = false }: { target: number; duration?: number; isRating?: boolean }) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    setValue(0);

    function animate(timestamp: number) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      if (isRating) {
        setValue(parseFloat((eased * target).toFixed(1)));
      } else {
        setValue(Math.floor(eased * target));
      }

      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [target, duration, isRating]);

  if (isRating) return <>{value.toFixed(1)}</>;
  return <>{value.toLocaleString()}</>;
}

export default function StatsSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full bg-gradient-to-br from-[#4F56E8] to-[#1E293B] flex flex-col items-center justify-center px-16">
      <p className="text-[18px] uppercase tracking-[4px] text-[#F9A825] mb-16">Trusted By NYC Small Businesses</p>
      <div className="grid grid-cols-4 gap-12 max-w-[1400px] w-full">
        {DISPLAY_STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-[80px] font-extrabold text-white leading-none mb-4">
              <CountUp target={stat.count} isRating={stat.isRating} />
              <span className="text-[#F9A825]">{stat.suffix}</span>
            </div>
            {stat.isRating && (
              <div className="text-[28px] text-[#F9A825] mb-2">{"★".repeat(5)}</div>
            )}
            <p className="text-[22px] text-white/70">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-16 w-[80px] h-[3px] bg-[#F9A825] rounded-full" />
      <p className="mt-6 text-[20px] text-white/50">Since 2004</p>
    </div>
  );
}
