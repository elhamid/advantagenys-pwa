import { REVIEWS, GOOGLE_RATING } from "@/lib/reviews";

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

export default function ReviewSlide({ cycleCount }: { cycleCount: number }) {
  const review = REVIEWS[cycleCount % REVIEWS.length];

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
        padding: '0 80px',
        fontFamily: FONT,
      }}
    >
      <div style={{ fontSize: 120, lineHeight: 1, color: 'rgba(249,168,37,0.3)', fontFamily: 'Georgia, serif', marginBottom: -20 }}>
        &ldquo;
      </div>
      <blockquote
        style={{
          fontSize: 32,
          color: '#FFFFFF',
          textAlign: 'center',
          lineHeight: 1.6,
          maxWidth: 1000,
          marginBottom: 40,
          margin: '0 0 40px 0',
          padding: 0,
          border: 'none',
        }}
      >
        {review.text}
      </blockquote>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <p style={{ fontSize: 24, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{review.name}</p>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
        <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{review.date}</p>
      </div>
      <div style={{ fontSize: 32, color: '#F9A825', marginBottom: 32 }}>{"★".repeat(review.rating)}</div>
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>{GOOGLE_RATING.rating}</span>
        <span style={{ fontSize: 18, color: '#F9A825' }}>★</span>
        <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>Google Reviews</span>
      </div>
    </div>
  );
}
