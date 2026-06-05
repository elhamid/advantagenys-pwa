import { SlideShell, Eyebrow, Rule, GOLD } from "./_shared";

export default function ZiaSpotlightSlide({ cycleCount: _c }: { cycleCount: number }) {
  return (
    <SlideShell padding="0 96px">
      <div style={{ display: "flex", alignItems: "center", gap: 88, maxWidth: 1500, width: "100%" }}>
        <div style={{ flex: 1 }}>
          <Eyebrow>Your Business Partner</Eyebrow>
          <h2 style={{ fontSize: 60, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.08, margin: "18px 0 28px 0" }}>
            Licensing &amp; Permits
          </h2>
          <Rule width={72} />
          <ul style={{ listStyle: "none", padding: 0, margin: "36px 0 40px 0" }}>
            {[
              "Contractor licensing & renewals",
              "Restaurant permits & compliance",
              "Retail & vendor licenses",
              "Full guidance through the licensing maze",
            ].map((item) => (
              <li
                key={item}
                style={{ fontSize: 30, color: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", gap: 18, marginBottom: 22 }}
              >
                <span style={{ color: GOLD, fontSize: 26 }}>{"✓"}</span>
                {item}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: 26, color: "rgba(255,255,255,0.6)", margin: 0, fontStyle: "italic" }}>
            &ldquo;We handle the permits so you can focus on your craft.&rdquo;
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: 360, height: 360, borderRadius: 20, overflow: "hidden", border: `2px solid ${GOLD}55`, boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>
            <img
              src="/images/team/zia.jpg"
              alt="Ziaur (Zia) Khan — Consultant"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 10%" }}
            />
          </div>
          <p style={{ textAlign: "center", marginTop: 22, fontSize: 26, color: "#FFFFFF", fontWeight: 700 }}>Ziaur (Zia) Khan</p>
          <p style={{ textAlign: "center", fontSize: 22, color: "rgba(255,255,255,0.6)", margin: 0 }}>Consultant</p>
        </div>
      </div>
    </SlideShell>
  );
}
