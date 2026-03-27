"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  retryCount: number;
}

/**
 * Error boundary for the ITIN form.
 *
 * Browser translation (Chrome, Samsung) can crash React by modifying DOM nodes.
 * This boundary catches the crash and auto-retries once (translation may settle
 * after initial render). On second crash, shows manual recovery options.
 */
export class ItinErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ITIN] Render crash:", error.message);

    // Report to server so we can see client errors in Vercel logs
    fetch("/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack?.slice(0, 500),
        url: typeof window !== "undefined" ? window.location.href : "",
        component: errorInfo.componentStack?.slice(0, 500),
      }),
    }).catch(() => {});

    // Auto-retry once — translation DOM mutations often settle after first render
    if (this.state.retryCount < 1) {
      setTimeout(() => {
        this.setState((prev) => ({ hasError: false, retryCount: prev.retryCount + 1 }));
      }, 500);
    }
  }

  render() {
    if (this.state.hasError && this.state.retryCount >= 1) {
      // Second crash — show recovery. Use inline styles only (React may be unstable)
      return (
        <div style={{
          background: "#0F1B2D",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}>
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#9888;&#65039;</div>
            <h1 style={{ fontSize: 22, marginBottom: 12 }}>Unable to Load Form</h1>
            <p style={{ color: "#8899aa", fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>
              Your browser&apos;s auto-translation may be interfering with the form.
            </p>
            <p style={{ color: "#667788", fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
              Please try: <strong style={{ color: "#aabbcc" }}>disable translation for this site</strong> in your browser settings, then reload.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <button
                onClick={() => window.location.reload()}
                style={{ background: "#4F56E8", color: "#fff", border: "none", padding: "14px 40px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", maxWidth: 280 }}
              >
                Reload Page
              </button>
              <a
                href="tel:9292929230"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10B981", padding: "14px 40px", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none", width: "100%", maxWidth: 280, display: "block", textAlign: "center" }}
              >
                Call (929) 292-9230
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
