"use client";

import type { FormConfig } from "@/lib/forms";
import { useInAppBrowser, safeBlankTarget } from "@/hooks/useInAppBrowser";

interface FormEmbedProps {
  form: FormConfig;
}

const PASSTHROUGH_PARAMS = [
  "shared_by",
  "sharedBy",
  "send_id",
  "form_send_id",
  "formSendId",
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
    if (value) url.searchParams.set(key, value);
  }

  return url.toString();
}

export function FormEmbed({ form }: FormEmbedProps) {
  const inAppBrowser = useInAppBrowser();

  const rawFormUrl = withPassthroughParams(form.embedUrl);

  if (form.platform === "jotform") {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
        <p className="text-base font-semibold text-[var(--text)]">This legacy form is no longer embedded here.</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Please use the secure Advantage form link from our team, or call (929) 933-1396 if you need help.
        </p>
      </div>
    );
  }

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
        className="rounded-[var(--radius-lg)] overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-md)]"
      >
        <iframe
          title={form.title}
          src={rawFormUrl ?? form.embedUrl}
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
