"use client";

import { useState, useEffect } from "react";
import type { UtmParams } from "@/lib/leads/types";

const STORAGE_KEY = "advantage.utm";

/**
 * The subset of utm fields (+ referrer) captured from URL / storage.
 * Referrer is normalized to hostname-only (e.g. "nysconsultants.com") so
 * downstream attribution is clean.
 */
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

function normalizeReferrer(rawReferrer: string | undefined | null): string | undefined {
  if (!rawReferrer) return undefined;
  const trimmed = rawReferrer.trim();
  if (!trimmed) return undefined;
  try {
    // Drop protocol + path — keep host only.
    return new URL(trimmed).hostname || undefined;
  } catch {
    // If the string wasn't a valid URL, fall back to the trimmed value so we
    // don't lose attribution signal for edge cases.
    return trimmed || undefined;
  }
}

function captureFromUrl(): UtmParams {
  if (typeof window === "undefined") return {};

  try {
    const params = new URLSearchParams(window.location.search);
    const captured: UtmParams = {};

    for (const key of UTM_KEYS) {
      const value = params.get(key)?.trim();
      if (value) (captured as Record<string, string>)[key] = value;
    }

    const referrer = normalizeReferrer(document.referrer);
    if (referrer) captured.referrer = referrer;

    return captured;
  } catch {
    return {};
  }
}

function hasUtmFields(utm: UtmParams): boolean {
  return UTM_KEYS.some((key) => Boolean(utm[key]));
}

function readFromStorage(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as UtmParams;
    }
    return {};
  } catch {
    return {};
  }
}

function writeToStorage(utm: UtmParams): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
  } catch {
    // sessionStorage can throw in private mode / quota overflow — silently
    // drop; attribution is best-effort.
  }
}

/**
 * Resolves the utm snapshot to use for this mount.
 *
 * Priority:
 * 1. If the current URL carries any utm_* params, treat it as the authoritative
 *    capture — persist to sessionStorage and return it.
 * 2. Otherwise, fall back to whatever is already in sessionStorage (e.g. the
 *    user landed on `/` with utms, then navigated to `/contact`).
 * 3. If nothing is in storage either, return the URL-derived object (which
 *    may still carry a referrer-only attribution).
 */
function resolveUtm(): UtmParams {
  const fromUrl = captureFromUrl();

  if (hasUtmFields(fromUrl)) {
    writeToStorage(fromUrl);
    return fromUrl;
  }

  const fromStorage = readFromStorage();
  if (hasUtmFields(fromStorage)) {
    return fromStorage;
  }

  // Neither URL nor storage has utm fields. Return URL-derived object so the
  // referrer (if any) still makes it onto the payload.
  return fromUrl;
}

/**
 * Captures UTM attribution params from `location.search` and
 * `document.referrer` at form-mount time, with sessionStorage persistence so
 * attribution survives internal navigation (landing on `/` with utms, then
 * submitting from `/contact`).
 *
 * Returns an empty object on the server / before hydration, then re-resolves
 * after mount so the client snapshot wins.
 */
export function useUtmParams(): UtmParams {
  // Lazy initializer avoids running on server.
  const [utm, setUtm] = useState<UtmParams>(() =>
    typeof window === "undefined" ? {} : resolveUtm()
  );

  useEffect(() => {
    // Re-resolve post-hydration — covers the SSR case where the initial state
    // was empty. We also re-run resolveUtm so any new URL utms refresh storage.
    const next = resolveUtm();
    const currentKeys = Object.keys(utm);
    const nextKeys = Object.keys(next);
    // Cheap shallow compare — avoid re-render when nothing changed.
    const changed =
      currentKeys.length !== nextKeys.length ||
      nextKeys.some((k) => (utm as Record<string, string>)[k] !== (next as Record<string, string>)[k]);
    if (changed) setUtm(next);
    // Mount-time capture only; deps intentionally empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return utm;
}
