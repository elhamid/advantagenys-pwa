const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

const SERVICE_ICONS: Record<string, string> = {
  "Insurance": "\u{1F6E1}\uFE0F",
  "Audit Defense": "\u2696\uFE0F",
  "Financial Services": "\u{1F4CA}",
};

const FEATURED = [
  { key: "Insurance", bullets: ["General liability", "Workers compensation", "Disability insurance"] },
  { key: "Audit Defense", bullets: ["Workers comp audits", "Sales tax audits", "Fine reduction services"] },
  { key: "Financial Services", bullets: ["Bookkeeping", "Financial statements", "Business analysis"] },
];

export default function ServicesSlideB({ cycleCount }: { cycleCount: number }) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 64px',
        fontFamily: FONT,
      }}
    >
      <p style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: 4, color: '#4F56E8', marginBottom: 16 }}>
        Our Services
      </p>
      <h2 style={{ fontSize: 44, fontWeight: 700, color: '#1E293B', marginBottom: 64, margin: '0 0 64px 0' }}>
        Protect &amp; Manage Your Business
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 40,
          maxWidth: 1400,
          width: '100%',
        }}
      >
        {FEATURED.map((service) => (
          <div
            key={service.key}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 40,
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>{SERVICE_ICONS[service.key]}</div>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: '#1E293B', marginBottom: 16, margin: '0 0 16px 0' }}>
              {service.key}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {service.bullets.map((b) => (
                <li
                  key={b}
                  style={{
                    fontSize: 20,
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <span style={{ color: '#4F56E8', marginTop: 4, flexShrink: 0 }}>{"\u25CF"}</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
