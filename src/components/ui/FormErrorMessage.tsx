"use client";

import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL, CONTACT_EMAIL, CONTACT_EMAIL_HREF } from "@/lib/contact-info";

/**
 * User-facing form error message with clickable contact fallback.
 * Shows the raw error + "If this issue persists..." with phone and email links.
 */
export function FormErrorMessage({ error }: { error: string }) {
  // Split off the fallback suffix if present (so we can render links)
  const fallbackPrefix = "If this issue persists, please call us at";
  const idx = error.indexOf(fallbackPrefix);

  if (idx === -1) {
    // No fallback suffix -- just render the raw error
    return (
      <p className="text-sm text-red-500 text-center" role="alert">
        {error}
      </p>
    );
  }

  const mainError = error.slice(0, idx).trim();

  return (
    <div className="text-sm text-red-500 text-center space-y-1" role="alert">
      <p>{mainError}</p>
      <p>
        If this issue persists, please call us at{" "}
        <a href={`tel:${CONTACT_PHONE_TEL}`} className="underline font-medium">
          {CONTACT_PHONE_DISPLAY}
        </a>{" "}
        or email{" "}
        <a href={CONTACT_EMAIL_HREF} className="underline font-medium">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}
