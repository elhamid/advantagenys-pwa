"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ background: "#0F1B2D", color: "#fff", fontFamily: "system-ui, sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>Something went wrong</h1>
        <p style={{ color: "#8899aa", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          We hit an unexpected error. Please try again or call us directly.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <button
            onClick={reset}
            style={{ background: "#4F56E8", color: "#fff", border: "none", padding: "14px 32px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >
            Try Again
          </button>
          <a href="tel:9292929230" style={{ color: "#10B981", fontSize: 16, fontWeight: 600, textDecoration: "none" }}>
            Call (929) 292-9230
          </a>
          <a href="/legacy" style={{ color: "#818CF8", fontSize: 13, textDecoration: "none", marginTop: 8 }}>
            Use simplified site instead
          </a>
        </div>
      </div>
    </div>
  );
}
