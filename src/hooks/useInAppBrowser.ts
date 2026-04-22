"use client";

import { useState, useEffect } from "react";

function detectInApp(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    /WhatsApp/i.test(ua) ||
    /Instagram/i.test(ua) ||
    /FBAN|FBAV|FB_IAB|FBIOS/i.test(ua) ||
    /Messenger/i.test(ua) ||
    /TikTok|BytedanceWebview/i.test(ua)
  );
}

/**
 * Detects WhatsApp, Instagram, Facebook, Messenger, and TikTok in-app
 * browsers via User-Agent. Those browsers handle `target="_blank"` poorly
 * (open inside the app's modal; cookies, camera, and JotForm embeds often
 * break) — callers should skip `target="_blank"` and optionally render a
 * "Open in your full browser" fallback.
 *
 * Returns `false` during SSR, then resolves to the real detection after
 * hydration. Lazy initializer keeps the post-hydration value stable.
 */
export function useInAppBrowser(): boolean {
  const [inApp, setInApp] = useState<boolean>(() =>
    typeof navigator === "undefined" ? false : detectInApp()
  );

  useEffect(() => {
    // One re-check after mount — covers the SSR case where the initial state
    // was `false`.
    const detected = detectInApp();
    if (detected !== inApp) setInApp(detected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return inApp;
}

/**
 * Convenience for link components: given the current in-app state, returns
 * either `"_blank"` (desktop / normal browser) or `undefined` (in-app —
 * same-tab is safer because `_blank` inside WhatsApp opens a modal that
 * breaks cookies + camera).
 */
export function safeBlankTarget(inAppBrowser: boolean): "_blank" | undefined {
  return inAppBrowser ? undefined : "_blank";
}
