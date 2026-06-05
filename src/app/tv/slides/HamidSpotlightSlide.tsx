import { SlideShell, Eyebrow, Rule, GOLD } from "./_shared";

export default function HamidSpotlightSlide({ cycleCount: _c }: { cycleCount: number }) {
  return (
    <SlideShell padding="0 96px">
      <div style={{ display: "flex", alignItems: "center", gap: 88, maxWidth: 1500, width: "100%" }}>
        <div style={{ flex: 1 }}>
          <Eyebrow>Innovation &amp; Growth</Eyebrow>
          <h2 style={{ fontSize: 60, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.08, margin: "18px 0 28px 0" }}>
            Technology &amp; AI
          </h2>
          <Rule width={72} />
          <ul style={{ listStyle: "none", padding: 0, margin: "36px 0 40px 0" }}>
            {[
              "AI-powered client intake & processing",
              "Digital-first business solutions",
              "Strategic business development",
              "Modern tech for traditional services",
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
            &ldquo;Bringing modern technology to make your business journey seamless.&rdquo;
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: 360, height: 360, borderRadius: 20, overflow: "hidden", border: `2px solid ${GOLD}55`, boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>
            <img
              src="/images/team/hamid-v11.png"
              alt="Hamid Elsevar — Growth Operator"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 10%" }}
            />
          </div>
          <p style={{ textAlign: "center", marginTop: 22, fontSize: 26, color: "#FFFFFF", fontWeight: 700 }}>Hamid Elsevar</p>
          <p style={{ textAlign: "center", fontSize: 22, color: "rgba(255,255,255,0.6)", margin: 0 }}>Growth Operator</p>
        </div>
      </div>
    </SlideShell>
  );
}
