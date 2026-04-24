import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUtmParams } from "../useUtmParams";

const STORAGE_KEY = "advantage.utm";

function setUrl(search: string) {
  // jsdom rejects replaceState with a different origin; use a relative URL
  // so the origin stays whatever jsdom initialized it to.
  const url = search ? `/?${search}` : "/";
  window.history.replaceState({}, "", url);
}

function setReferrer(value: string) {
  Object.defineProperty(document, "referrer", {
    configurable: true,
    get: () => value,
  });
}

describe("useUtmParams", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    setUrl("");
    setReferrer("");
  });

  afterEach(() => {
    window.sessionStorage.clear();
    setUrl("");
    setReferrer("");
    vi.restoreAllMocks();
  });

  it("captures utm_* params from a first-visit URL and persists them to sessionStorage", () => {
    setUrl("utm_source=google&utm_medium=cpc&utm_campaign=spring");

    const { result } = renderHook(() => useUtmParams());

    expect(result.current).toMatchObject({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "spring",
    });

    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}");
    expect(stored).toMatchObject({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "spring",
    });
  });

  it("falls back to sessionStorage when the current URL has no utm params", () => {
    // Simulate prior landing capture already in storage.
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "spring",
      })
    );

    // Current URL (e.g. /contact) has no utm params.
    setUrl("");

    const { result } = renderHook(() => useUtmParams());

    expect(result.current).toMatchObject({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "spring",
    });
  });

  it("lets a later URL with new utm params override sessionStorage", () => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "spring",
      })
    );

    setUrl("utm_source=facebook&utm_medium=social&utm_campaign=summer");

    const { result } = renderHook(() => useUtmParams());

    expect(result.current).toMatchObject({
      utm_source: "facebook",
      utm_medium: "social",
      utm_campaign: "summer",
    });

    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}");
    expect(stored).toMatchObject({
      utm_source: "facebook",
      utm_medium: "social",
      utm_campaign: "summer",
    });
  });

  it("normalizes document.referrer to hostname-only", () => {
    setReferrer("https://nysconsultants.com/some/path?query=1");
    setUrl("utm_source=referral");

    const { result } = renderHook(() => useUtmParams());

    expect(result.current.referrer).toBe("nysconsultants.com");
  });
});
