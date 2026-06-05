import { SlideShell, Eyebrow, Rule, GOLD } from "./_shared";

export default function ITINSlide({ cycleCount: _c }: { cycleCount: number }) {
  return (
    <SlideShell padding="0 96px">
      <div style={{ display: "flex", alignItems: "center", gap: 88, maxWidth: 1500, width: "100%" }}>
        <div style={{ flex: 1 }}>
          <Eyebrow>Featured Service</Eyebrow>
          <h2 style={{ fontSize: 64, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.08, margin: "18px 0 28px 0" }}>
            Audit Defense
          </h2>
          <Rule width={72} />
          <div
            style={{
              display: "inline-block",
              backgroundColor: "rgba(249,168,37,0.1)",
              border: `1px solid ${GOLD}66`,
              borderRadius: 12,
              padding: "14px 28px",
              margin: "32px 0",
            }}
          >
            <p style={{ fontSize: 24, color: GOLD, fontWeight: 600, margin: 0 }}>IRS Certified Tax Preparer</p>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 8px 0" }}>
            {["Workers comp audit representation", "Sales tax audit defense", "Fine reduction & penalty abatement", "5,700+ tax clients served"].map((item) => (
              <li
                key={item}
                style={{ fontSize: 30, color: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", gap: 18, marginBottom: 22 }}
              >
                <span style={{ color: GOLD, fontSize: 26 }}>{"✓"}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: 360, height: 360, borderRadius: 20, overflow: "hidden", border: `2px solid ${GOLD}55`, boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>
            <img
              src="/images/team/kedar.jpg"
              alt="Kedar Gupta — IRS Certified Tax Preparer & Acceptance Agent"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 10%" }}
            />
          </div>
          <p style={{ textAlign: "center", marginTop: 22, fontSize: 26, color: "#FFFFFF", fontWeight: 700 }}>Kedar Gupta</p>
          <p style={{ textAlign: "center", fontSize: 22, color: "rgba(255,255,255,0.6)", margin: 0 }}>IRS Certified Tax Preparer</p>
        </div>
      </div>
    </SlideShell>
  );
}
