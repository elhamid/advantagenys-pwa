"use client";

import { useEffect, useRef } from "react";
import type { FormConfig } from "@/lib/forms";
import { useInAppBrowser, safeBlankTarget } from "@/hooks/useInAppBrowser";

interface FormEmbedProps {
  form: FormConfig;
}

export function FormEmbed({ form }: FormEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inAppBrowser = useInAppBrowser();

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

  const rawFormUrl = form.embedUrl;

  return (
    <>
      {/* In-app-browser fallback — JotForm embeds break camera, file upload,
          and sometimes submit silently inside WhatsApp/Instagram/FB. Show a
          prominent button that deep-links to the system browser. */}
      {inAppBrowser && rawFormUrl && (
        <div className="mb-4 rounded-[var(--radius-lg)] border border-amber-300 bg-amber-50 p-4 text-sm">
          <p className="mb-3 font-semibold text-amber-900">
            This form may not work inside WhatsApp/Instagram/Facebook.
          </p>
          <p className="mb-3 text-amber-900">
            For the best experience (camera, uploads, signatures), open it in
            your full browser.
          </p>
          <a
            href={rawFormUrl}
            target={safeBlankTarget(inAppBrowser)}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
          >
            Open form in full browser
            <span aria-hidden>&rarr;</span>
          </a>
        </div>
      )}

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
    </>
  );
}
