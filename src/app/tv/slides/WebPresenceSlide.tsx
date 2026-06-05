import {
  SlideShell,
  Eyebrow,
  GOLD,
  GoogleMark,
  MapPinMark,
  StripeMark,
  WhatsAppMark,
} from "./_shared";

const LOGOS = [
  { Mark: GoogleMark, label: "Google" },
  { Mark: MapPinMark, label: "Google Maps" },
  { Mark: StripeMark, label: "Stripe" },
  { Mark: WhatsAppMark, label: "WhatsApp" },
];

export default function WebPresenceSlide({ cycleCount: _c }: { cycleCount: number }) {
  return (
    <SlideShell>
      <Eyebrow>Web Presence</Eyebrow>

      <h2
        style={{
          fontSize: 96,
          fontWeight: 800,
          color: "#FFFFFF",
          lineHeight: 1.05,
          textAlign: "center",
          margin: "28px 0 0 0",
        }}
      >
        Get found.
        <br />
        Get calls.
        <br />
        <span style={{ color: GOLD }}>Get paid.</span>
      </h2>

      <p
        style={{
          fontSize: 30,
          color: "rgba(255,255,255,0.85)",
          textAlign: "center",
          maxWidth: 1100,
          lineHeight: 1.4,
          marginTop: 36,
        }}
      >
        A modern website + your Google profile + an AI that answers customers —
        set up for you, in your language.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 56, marginTop: 56 }}>
        {LOGOS.map(({ Mark, label }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Mark size={54} />
            </div>
            <span style={{ fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{label}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 52,
          border: `1px solid ${GOLD}66`,
          borderRadius: 9999,
          padding: "16px 44px",
          background: "rgba(249,168,37,0.08)",
        }}
      >
        <p style={{ fontSize: 28, color: "#FFFFFF", fontWeight: 600, margin: 0 }}>
          From <span style={{ color: GOLD }}>$49/mo</span> · no contracts.
        </p>
      </div>
    </SlideShell>
  );
}
