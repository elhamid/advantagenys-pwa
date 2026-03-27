"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: string;
}

export class ItinErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message || "Unknown error" };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ITIN] Render crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
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
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <h1 style={{ fontSize: 24, marginBottom: 12 }}>Form Error</h1>
            <p style={{ color: "#8899aa", fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>
              The form encountered an error. This can happen when your browser translates the page.
            </p>
            <p style={{ color: "#667788", fontSize: 12, marginBottom: 24 }}>
              Try disabling translation or use a different browser.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: "" });
                  window.location.reload();
                }}
                style={{ background: "#4F56E8", color: "#fff", border: "none", padding: "14px 32px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" }}
              >
                Reload Page
              </button>
              <a href="/legacy/itin" style={{ color: "#10B981", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                Use simplified form instead
              </a>
              <a href="tel:9292929230" style={{ color: "#818CF8", fontSize: 14, textDecoration: "none" }}>
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
