import { ADDRESS } from "@/lib/constants";
import { FONT, GOLD, Rule } from "./_shared";

export default function HeroSlide({ cycleCount: _c }: { cycleCount: number }) {
  return (
    <div style={{ position: "relative", height: "100%", width: "100%", fontFamily: FONT, overflow: "hidden" }}>
      <img
        src="/images/office-exterior-hd.jpg"
        alt="Advantage Services Office"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* Navy wash to unify the photo with the rest of the loop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(26,58,92,0.78) 0%, rgba(15,23,42,0.86) 60%, rgba(10,15,26,0.92) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(900px circle at 80% 8%, rgba(79,86,232,0.30), transparent 56%), radial-gradient(720px circle at 10% 96%, rgba(249,168,37,0.18), transparent 56%)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 10,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        <p style={{ fontSize: 26, textTransform: "uppercase", letterSpacing: 8, color: GOLD, fontWeight: 700, marginBottom: 28 }}>
          Welcome To
        </p>
        <h1 style={{ fontSize: 96, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.04, margin: "0 0 32px 0" }}>
          Advantage Services
        </h1>
        <Rule width={110} />
        <p style={{ fontSize: 38, color: "rgba(255,255,255,0.92)", fontWeight: 600, maxWidth: 1000, lineHeight: 1.3, marginTop: 36 }}>
          One stop for everything your business needs — start, grow, and get found.
        </p>
        <div
          style={{
            marginTop: 52,
            border: `1px solid ${GOLD}66`,
            borderRadius: 18,
            padding: "18px 46px",
            background: "rgba(249,168,37,0.06)",
          }}
        >
          <p style={{ fontSize: 26, color: "rgba(255,255,255,0.92)", margin: 0 }}>20+ Years Serving NYC Small Businesses</p>
        </div>
        <p style={{ position: "absolute", bottom: 52, fontSize: 24, color: "rgba(255,255,255,0.6)" }}>{ADDRESS.full}</p>
      </div>
    </div>
  );
}
