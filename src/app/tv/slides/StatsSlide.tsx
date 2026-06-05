"use client";

import { useState, useEffect, useRef } from "react";
import { STATS } from "@/lib/constants";
import { GOOGLE_RATING } from "@/lib/reviews";
import { SlideShell, Eyebrow, Rule, GOLD } from "./_shared";

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

export default function StatsSlide({ cycleCount: _c }: { cycleCount: number }) {
  return (
    <SlideShell>
      <div style={{ marginBottom: 72 }}>
        <Eyebrow>Trusted By NYC Small Businesses</Eyebrow>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 56,
          maxWidth: 1500,
          width: "100%",
        }}
      >
        {DISPLAY_STATS.map((stat) => (
          <div
            key={stat.label}
            style={{
              textAlign: "center",
              padding: "36px 16px",
              borderRadius: 24,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 92, fontWeight: 800, color: "#FFFFFF", lineHeight: 1, marginBottom: 16 }}>
              <CountUp target={stat.count} isRating={stat.isRating} />
              <span style={{ color: GOLD }}>{stat.suffix}</span>
            </div>
            {stat.isRating && <div style={{ fontSize: 32, color: GOLD, marginBottom: 8 }}>{"★".repeat(5)}</div>}
            <p style={{ fontSize: 26, color: "rgba(255,255,255,0.78)", margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 72 }}>
        <Rule />
      </div>
      <p style={{ marginTop: 24, fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>Since 2005</p>
    </SlideShell>
  );
}
