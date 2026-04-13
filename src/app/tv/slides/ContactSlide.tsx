import { ADDRESS, PHONE, HOURS } from "@/lib/constants";

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

export default function ContactSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#0A0F1A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 64px',
        fontFamily: FONT,
      }}
    >
      <p style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: 4, color: '#F9A825', marginBottom: 24 }}>
        Advantage Services
      </p>
      <h2 style={{ fontSize: 48, fontWeight: 700, color: '#FFFFFF', marginBottom: 56, margin: '0 0 56px 0' }}>
        We&apos;re Here For You
      </h2>
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: '48px 64px',
          maxWidth: 800,
          width: '100%',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: 3, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
              Visit Us
            </p>
            <p style={{ fontSize: 26, color: '#FFFFFF', margin: 0 }}>{ADDRESS.full}</p>
          </div>
          <div style={{ width: 60, height: 2, backgroundColor: 'rgba(249,168,37,0.3)', margin: '0 auto 32px auto' }} />
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: 3, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
              Call Us
            </p>
            <p style={{ fontSize: 30, color: '#FFFFFF', fontWeight: 600, margin: 0 }}>{PHONE.main}</p>
          </div>
          <div style={{ width: 60, height: 2, backgroundColor: 'rgba(249,168,37,0.3)', margin: '0 auto 32px auto' }} />
          <div>
            <p style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: 3, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
              Office Hours
            </p>
            <p style={{ fontSize: 26, color: '#FFFFFF', margin: 0 }}>{HOURS.days}</p>
            <p style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              {HOURS.time} {HOURS.timezone}
            </p>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 80, height: 80, backgroundColor: '#FFFFFF', borderRadius: 8, padding: 4 }}>
          <img
            src="/images/qr-advantagenys.png"
            alt="Scan to visit advantagenys.com"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', margin: 0 }}>advantagenys.com</p>
      </div>
    </div>
  );
}
