import { REVIEWS, GOOGLE_RATING } from "@/lib/reviews";
import { SlideShell, GOLD } from "./_shared";

export default function ReviewSlide({ cycleCount }: { cycleCount: number }) {
  const review = REVIEWS[cycleCount % REVIEWS.length];

  return (
    <SlideShell padding="0 96px">
      <div style={{ fontSize: 140, lineHeight: 1, color: "rgba(249,168,37,0.35)", fontFamily: "Georgia, serif", marginBottom: -24 }}>
        &ldquo;
      </div>
      <blockquote
        style={{
          fontSize: 40,
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: 1100,
          margin: "0 0 44px 0",
          padding: 0,
          border: "none",
          fontWeight: 500,
        }}
      >
        {review.text}
      </blockquote>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF", margin: 0 }}>{review.name}</p>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
        <p style={{ fontSize: 24, color: "rgba(255,255,255,0.6)", margin: 0 }}>{review.date}</p>
      </div>
      <div style={{ fontSize: 38, color: GOLD, marginBottom: 32 }}>{"★".repeat(review.rating)}</div>
      <div
        style={{
          border: `1px solid ${GOLD}55`,
          borderRadius: 9999,
          padding: "14px 36px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "rgba(249,168,37,0.06)",
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 700, color: "#FFFFFF" }}>{GOOGLE_RATING.rating}</span>
        <span style={{ fontSize: 22, color: GOLD }}>★</span>
        <span style={{ fontSize: 22, color: "rgba(255,255,255,0.7)" }}>Google Reviews</span>
      </div>
    </SlideShell>
  );
}
