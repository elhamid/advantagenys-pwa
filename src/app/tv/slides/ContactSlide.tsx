import { ADDRESS, PHONE, HOURS } from "@/lib/constants";
import { SlideShell, Eyebrow, GOLD } from "./_shared";

export default function ContactSlide({ cycleCount: _c }: { cycleCount: number }) {
  return (
    <SlideShell padding="0 80px">
      <Eyebrow>Advantage Services</Eyebrow>
      <h2 style={{ fontSize: 60, fontWeight: 800, color: "#FFFFFF", margin: "20px 0 48px 0" }}>
        We&apos;re Here For You
      </h2>
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 24,
          padding: "48px 72px",
          maxWidth: 860,
          width: "100%",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 22, textTransform: "uppercase", letterSpacing: 4, color: GOLD, marginBottom: 10, fontWeight: 700 }}>
              Visit Us
            </p>
            <p style={{ fontSize: 32, color: "#FFFFFF", margin: 0 }}>{ADDRESS.full}</p>
          </div>
          <div style={{ width: 72, height: 2, backgroundColor: "rgba(249,168,37,0.4)", margin: "0 auto 32px auto" }} />
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 22, textTransform: "uppercase", letterSpacing: 4, color: GOLD, marginBottom: 10, fontWeight: 700 }}>
              Call Us
            </p>
            <p style={{ fontSize: 40, color: "#FFFFFF", fontWeight: 700, margin: 0 }}>{PHONE.main}</p>
          </div>
          <div style={{ width: 72, height: 2, backgroundColor: "rgba(249,168,37,0.4)", margin: "0 auto 32px auto" }} />
          <div>
            <p style={{ fontSize: 22, textTransform: "uppercase", letterSpacing: 4, color: GOLD, marginBottom: 10, fontWeight: 700 }}>
              Office Hours
            </p>
            <p style={{ fontSize: 32, color: "#FFFFFF", margin: 0 }}>{HOURS.days}</p>
            <p style={{ fontSize: 28, color: "rgba(255,255,255,0.78)", marginTop: 6 }}>
              {HOURS.time} {HOURS.timezone}
            </p>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 96, height: 96, backgroundColor: "#FFFFFF", borderRadius: 12, padding: 6 }}>
          <img src="/images/qr-advantagenys.png" alt="Scan to visit advantagenys.com" style={{ width: "100%", height: "100%" }} />
        </div>
        <p style={{ fontSize: 24, color: "rgba(255,255,255,0.7)", margin: 0 }}>advantagenys.com</p>
      </div>
    </SlideShell>
  );
}
