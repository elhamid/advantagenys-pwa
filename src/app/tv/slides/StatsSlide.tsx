"use client";

import { useState, useEffect, useRef } from "react";
import { STATS } from "@/lib/constants";
import { GOOGLE_RATING } from "@/lib/reviews";

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

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
    <div
      style={{
        height: '100%',
        width: '100%',
        background: 'linear-gradient(135deg, #4F56E8 0%, #1E293B 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 64px',
        fontFamily: FONT,
      }}
    >
      <p style={{ fontSize: 18, textTransform: 'uppercase', letterSpacing: 4, color: '#F9A825', marginBottom: 64 }}>
        Trusted By NYC Small Businesses
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 48,
          maxWidth: 1400,
          width: '100%',
        }}
      >
        {DISPLAY_STATS.map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 80, fontWeight: 800, color: '#FFFFFF', lineHeight: 1, marginBottom: 16 }}>
              <CountUp target={stat.count} isRating={stat.isRating} />
              <span style={{ color: '#F9A825' }}>{stat.suffix}</span>
            </div>
            {stat.isRating && (
              <div style={{ fontSize: 28, color: '#F9A825', marginBottom: 8 }}>{"★".repeat(5)}</div>
            )}
            <p style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)' }}>{stat.label}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 64, width: 80, height: 3, backgroundColor: '#F9A825', borderRadius: 9999 }} />
      <p style={{ marginTop: 24, fontSize: 20, color: 'rgba(255,255,255,0.5)' }}>Since 2004</p>
    </div>
  );
}
