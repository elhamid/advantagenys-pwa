import { SlideShell, Eyebrow, IconTile, Rule, GOLD, BotIcon } from "./_shared";

const POINTS = [
  "Answers every customer — even at 2am — in their language.",
  "Like a receptionist, without the payroll.",
  "A real person always in the loop.",
];

export default function AISlide({ cycleCount: _c }: { cycleCount: number }) {
  return (
    <SlideShell>
      <div style={{ marginBottom: 32 }}>
        <IconTile size={108}>
          <BotIcon size={60} />
        </IconTile>
      </div>

      <Eyebrow>Your New Hire</Eyebrow>

      <h2
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: "#FFFFFF",
          textAlign: "center",
          margin: "20px 0 8px 0",
        }}
      >
        Meet your <span style={{ color: GOLD }}>AI assistant.</span>
      </h2>

      <div style={{ margin: "28px 0 40px 0" }}>
        <Rule width={110} />
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, maxWidth: 1100 }}>
        {POINTS.map((p) => (
          <li
            key={p}
            style={{
              fontSize: 34,
              color: "rgba(255,255,255,0.92)",
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 26,
              justifyContent: "center",
            }}
          >
            <span style={{ color: GOLD, fontSize: 28, flexShrink: 0 }}>{"✓"}</span>
            {p}
          </li>
        ))}
      </ul>

      <p style={{ fontSize: 26, color: "rgba(255,255,255,0.6)", marginTop: 44, textAlign: "center" }}>
        Part of the <span style={{ color: GOLD, fontWeight: 600 }}>Growth &amp; Commerce</span> plans.
      </p>
    </SlideShell>
  );
}
