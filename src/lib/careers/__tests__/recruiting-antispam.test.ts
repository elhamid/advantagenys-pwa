import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applicantFingerprint,
  checkHoneypot,
  checkUrlReachable,
  HONEYPOT_FIELD,
  isDisposableEmail,
} from "../recruiting-antispam";

describe("honeypot", () => {
  it("uses a non-semantic name so browser autofill does not target it", () => {
    expect(HONEYPOT_FIELD).toBe("contact_ref_2");
    // Must not look like a known autofillable field (name/email/url/org/company).
    expect(HONEYPOT_FIELD).not.toMatch(/name|email|url|website|company|org|phone|address/i);
  });

  it("does not trip on empty/whitespace/null (real candidate leaves it blank)", () => {
    expect(checkHoneypot(null).tripped).toBe(false);
    expect(checkHoneypot("").tripped).toBe(false);
    expect(checkHoneypot("   ").tripped).toBe(false);
  });

  it("trips when filled (bot auto-fill)", () => {
    expect(checkHoneypot("https://spam.example").tripped).toBe(true);
  });
});

describe("duplicate fingerprint", () => {
  it("is stable across phone formatting and email case", () => {
    const a = applicantFingerprint("Priya@Example.com", "+91 98765 43210");
    const b = applicantFingerprint("priya@example.com", "9876543210");
    expect(a).toBe(b);
  });

  it("differs for a different applicant", () => {
    const a = applicantFingerprint("priya@example.com", "9876543210");
    const b = applicantFingerprint("other@example.com", "9876543210");
    expect(a).not.toBe(b);
  });
});

describe("disposable email", () => {
  it("flags a known throwaway domain", () => {
    expect(isDisposableEmail("test@mailinator.com")).toBe(true);
    expect(isDisposableEmail("test@yopmail.com")).toBe(true);
  });

  it("does not flag normal providers (real candidate not blocked)", () => {
    expect(isDisposableEmail("priya@gmail.com")).toBe(false);
    expect(isDisposableEmail("hire@company.co.in")).toBe(false);
  });
});

describe("dead-link check (best-effort, soft signal)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns reachable=true on a 200", async () => {
    global.fetch = vi.fn(async () => ({ status: 200 } as Response));
    const result = await checkUrlReachable("https://drive.google.com/file/x");
    expect(result.reachable).toBe(true);
    expect(result.checked).toBe(true);
  });

  it("treats 403/401 as reachable (host gates HEAD but resource exists)", async () => {
    global.fetch = vi.fn(async () => ({ status: 403 } as Response));
    const result = await checkUrlReachable("https://example.com/protected");
    expect(result.reachable).toBe(true);
  });

  it("treats 404 as unreachable", async () => {
    global.fetch = vi.fn(async () => ({ status: 404 } as Response));
    const result = await checkUrlReachable("https://example.com/gone");
    expect(result.reachable).toBe(false);
  });

  it("never throws on a network error; reports unreachable", async () => {
    global.fetch = vi.fn(async () => {
      throw new Error("network down");
    });
    const result = await checkUrlReachable("https://example.com/x");
    expect(result.reachable).toBe(false);
    expect(result.checked).toBe(true);
  });

  it("does not check non-http strings", async () => {
    const result = await checkUrlReachable("not a url");
    expect(result.checked).toBe(false);
    expect(result.reachable).toBe(false);
  });
});
