import {
  SlideShell,
  Eyebrow,
  IconTile,
  GOLD,
  BuildingIcon,
  LicenseIcon,
  TaxIcon,
} from "./_shared";

const FEATURED = [
  { key: "Business Formation", Icon: BuildingIcon, bullets: ["LLC, Corporation, Non-Profit", "State & federal filing", "EIN registration"] },
  { key: "Licensing", Icon: LicenseIcon, bullets: ["Contractor licensing", "Restaurant permits", "Retail & vendor licenses"] },
  { key: "Tax Services", Icon: TaxIcon, bullets: ["Business & personal tax", "Payroll tax filing", "IRS representation"] },
];

export default function ServicesSlideA({ cycleCount: _c }: { cycleCount: number }) {
  return (
    <SlideShell>
      <Eyebrow>Our Services</Eyebrow>
      <h2 style={{ fontSize: 60, fontWeight: 800, color: "#FFFFFF", margin: "20px 0 64px 0" }}>
        Start &amp; Grow Your Business
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 44, maxWidth: 1500, width: "100%" }}>
        {FEATURED.map(({ key, Icon, bullets }) => (
          <div
            key={key}
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 24,
              padding: 44,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.3)",
            }}
          >
            <IconTile>
              <Icon size={48} />
            </IconTile>
            <h3 style={{ fontSize: 34, fontWeight: 700, color: "#FFFFFF", margin: "24px 0 20px 0" }}>{key}</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {bullets.map((b) => (
                <li
                  key={b}
                  style={{ fontSize: 26, color: "rgba(255,255,255,0.82)", display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}
                >
                  <span style={{ color: GOLD, marginTop: 8, flexShrink: 0, fontSize: 14 }}>{"●"}</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SlideShell>
  );
}
