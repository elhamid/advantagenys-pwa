"use client";

import { useState, useEffect } from "react";
import type { UtmParams } from "@/lib/leads/types";

function captureFromWindow(): UtmParams {
  if (typeof window === "undefined") return {};

  try {
    const params = new URLSearchParams(window.location.search);
    const captured: UtmParams = {};

    const utm_source = params.get("utm_source")?.trim();
    const utm_medium = params.get("utm_medium")?.trim();
    const utm_campaign = params.get("utm_campaign")?.trim();
    const utm_term = params.get("utm_term")?.trim();
    const utm_content = params.get("utm_content")?.trim();

    if (utm_source) captured.utm_source = utm_source;
    if (utm_medium) captured.utm_medium = utm_medium;
    if (utm_campaign) captured.utm_campaign = utm_campaign;
    if (utm_term) captured.utm_term = utm_term;
    if (utm_content) captured.utm_content = utm_content;

    const referrer = document.referrer?.trim();
    if (referrer) captured.referrer = referrer;

    return captured;
  } catch {
    return {};
  }
}

/**
 * Captures UTM attribution params from `location.search` and `document.referrer`
 * at form-mount time. Stable across re-renders.
 *
 * Returns an empty object on the server / before hydration, then re-captures
 * after mount so the client snapshot wins.
 */
export function useUtmParams(): UtmParams {
  // Lazy initializer avoids running on server.
  const [utm, setUtm] = useState<UtmParams>(() =>
    typeof window === "undefined" ? {} : captureFromWindow()
  );

  useEffect(() => {
    // Re-capture post-hydration to cover the case where the initial state was
    // empty (SSR render). Only update if snapshot differs.
    const next = captureFromWindow();
    if (Object.keys(next).length > 0 && Object.keys(utm).length === 0) {
      setUtm(next);
    }
    // Mount-time capture only; deps intentionally empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return utm;
}
