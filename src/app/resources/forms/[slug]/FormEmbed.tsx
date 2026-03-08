"use client";

import { useEffect, useRef } from "react";
import type { FormConfig } from "@/lib/forms";

interface FormEmbedProps {
  form: FormConfig;
}

export function FormEmbed({ form }: FormEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (form.platform !== "jotform") return;

    // Load JotForm embed handler for auto-resizing
    const script = document.createElement("script");
    script.src = "https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js";
    script.async = true;
    script.onload = () => {
      // JotForm handler auto-detects iframes after script loads
      if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).jotformEmbedHandler) {
        (window as unknown as Record<string, (...args: unknown[]) => void>).jotformEmbedHandler(
          `iframe[id="JotFormIFrame-${form.id}"]`,
          "https://form.jotform.com/"
        );
      }
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [form.id, form.platform]);

  return (
    <div
      ref={containerRef}
      className="rounded-[var(--radius-lg)] overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-md)]"
    >
      <iframe
        id={form.platform === "jotform" ? `JotFormIFrame-${form.id}` : undefined}
        title={form.title}
        src={form.embedUrl}
        style={{
          width: "100%",
          minHeight: "600px",
          height: "100%",
          border: "none",
        }}
        allow="geolocation; microphone; camera; fullscreen; payment"
        allowFullScreen
      />
    </div>
  );
}
