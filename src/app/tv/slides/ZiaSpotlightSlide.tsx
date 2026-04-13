const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

export default function ZiaSpotlightSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        background: 'linear-gradient(135deg, #4F56E8 0%, #1E293B 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 80px',
        fontFamily: FONT,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 80, maxWidth: 1400, width: '100%' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: 4, color: '#F9A825', marginBottom: 16 }}>
            Your Business Partner
          </p>
          <h2 style={{ fontSize: 48, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1, margin: '0 0 24px 0' }}>
            Formation &amp; Consulting
          </h2>
          <div style={{ width: 60, height: 3, backgroundColor: '#F9A825', borderRadius: 9999, marginBottom: 32 }} />
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0' }}>
            {[
              "LLC, Corporation & Non-Profit formation",
              "Business tax & payroll services",
              "Licensing guidance for all industries",
              "One-on-one business consulting",
            ].map((item) => (
              <li
                key={item}
                style={{
                  fontSize: 24,
                  color: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <span style={{ color: '#F9A825', fontSize: 20 }}>{"\u2713"}</span>
                {item}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)', margin: 0, fontStyle: 'italic' }}>
            &ldquo;From formation to payroll &mdash; we walk with you every step.&rdquo;
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              width: 300,
              height: 300,
              borderRadius: 16,
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.1)',
            }}
          >
            <img
              src="/images/team/zia.jpg"
              alt="Ziaur (Zia) Khan — Consultant"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 10%' }}
            />
          </div>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 18, color: '#FFFFFF', fontWeight: 600 }}>Ziaur (Zia) Khan</p>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Consultant</p>
        </div>
      </div>
    </div>
  );
}
