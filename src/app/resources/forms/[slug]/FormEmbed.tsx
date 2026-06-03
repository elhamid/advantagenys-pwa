"use client";

import { useEffect, useRef } from "react";
import type { FormConfig } from "@/lib/forms";

interface FormEmbedProps {
  form: FormConfig;
}

const PASSTHROUGH_PARAMS = [
  "shared_by",
  "utm_source",
  "utm_medium",
  "utm_campaign",
] as const;

function withPassthroughParams(embedUrl: string | undefined): string | undefined {
  if (!embedUrl || typeof window === "undefined") return embedUrl;

  const sourceParams = new URLSearchParams(window.location.search);
  const url = new URL(embedUrl);

  for (const key of PASSTHROUGH_PARAMS) {
    const value = sourceParams.get(key)?.trim();
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

export function FormEmbed({ form }: FormEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedSrc = withPassthroughParams(form.embedUrl);

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
        src={embedSrc}
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
