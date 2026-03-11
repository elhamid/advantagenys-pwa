"use client";

import { useEffect } from "react";

/**
 * Registers the PWA service worker on mount.
 * Placed in the root layout so it runs once across the entire app.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => {
          // Non-fatal — site still works without SW
          console.warn("[SW] Registration failed:", err);
        });
    }
  }, []);

  return null;
}
