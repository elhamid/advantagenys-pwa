import { ADDRESS } from "@/lib/constants";

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

export default function HeroSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', fontFamily: FONT }}>
      <img
        src="/images/office-exterior-hd.jpg"
        alt="Advantage Services Office"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(10,15,26,0.8), rgba(10,15,26,0.6), rgba(10,15,26,0.9))',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 64px',
        }}
      >
        <p style={{ fontSize: 18, textTransform: 'uppercase', letterSpacing: 4, color: '#F9A825', marginBottom: 24 }}>
          Welcome To
        </p>
        <h1 style={{ fontSize: 72, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1, marginBottom: 24, margin: '0 0 24px 0' }}>
          Advantage Services
        </h1>
        <div style={{ width: 80, height: 3, backgroundColor: '#F9A825', borderRadius: 9999, marginBottom: 32 }} />
        <p style={{ fontSize: 32, color: 'rgba(255,255,255,0.9)', fontWeight: 500, maxWidth: 900, lineHeight: 1.3 }}>
          One Stop Shop For All Business Solutions
        </p>
        <div style={{ marginTop: 48, border: '1px solid rgba(249,168,37,0.4)', borderRadius: 16, padding: '16px 40px' }}>
          <p style={{ fontSize: 22, color: 'rgba(255,255,255,0.8)' }}>20+ Years Serving NYC Small Businesses</p>
        </div>
        <p style={{ position: 'absolute', bottom: 48, fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>
          {ADDRESS.full}
        </p>
      </div>
    </div>
  );
}
