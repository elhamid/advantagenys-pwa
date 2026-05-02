import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Hoisted mock for rate limiter
const { mockIsLimited } = vi.hoisted(() => ({
  mockIsLimited: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/rate-limit", () => ({
  createRateLimiter: vi.fn(() => ({
    isLimited: mockIsLimited,
    remaining: vi.fn().mockReturnValue(9),
    max: 10,
    windowMs: 60_000,
    label: "api/push/subscribe",
    reset: vi.fn(),
  })),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

import { POST } from "../push/subscribe/route";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validSubscription = {
  subscription: {
    endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
    keys: {
      p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8p8l930ds",
      auth: "tBHItJI5svbpC7htS1TA6A",
    },
  },
};

describe("POST /api/push/subscribe", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    vi.clearAllMocks();
    mockIsLimited.mockReturnValue(false);

    // Mock upstream fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "",
      json: async () => ({}),
    } as unknown as Response);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // -----------------------------------------------------------------------
  // 1. Valid subscription succeeds
  // -----------------------------------------------------------------------
  it("returns 200 with ok:true for a valid Web Push subscription", async () => {
    const res = await POST(makeRequest(validSubscription));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  // -----------------------------------------------------------------------
  // 2. Missing endpoint returns 400
  // -----------------------------------------------------------------------
  it("returns 400 when subscription endpoint is missing", async () => {
    const res = await POST(
      makeRequest({
        subscription: {
          keys: { p256dh: "abc", auth: "def" },
        },
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid subscription/i);
  });

  // -----------------------------------------------------------------------
  // 3. Missing keys.p256dh returns 400
  // -----------------------------------------------------------------------
  it("returns 400 when keys.p256dh is missing", async () => {
    const res = await POST(
      makeRequest({
        subscription: {
          endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
          keys: { auth: "tBHItJI5svbpC7htS1TA6A" },
        },
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid subscription/i);
  });

  // -----------------------------------------------------------------------
  // 4. Missing keys.auth returns 400
  // -----------------------------------------------------------------------
  it("returns 400 when keys.auth is missing", async () => {
    const res = await POST(
      makeRequest({
        subscription: {
          endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
          keys: { p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8p8l930ds" },
        },
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid subscription/i);
  });

  // -----------------------------------------------------------------------
  // 5. Missing subscription object returns 400
  // -----------------------------------------------------------------------
  it("returns 400 when subscription object is missing entirely", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/missing subscription/i);
  });

  // -----------------------------------------------------------------------
  // 6. Rate limiting works
  // -----------------------------------------------------------------------
  it("returns 429 when rate limit is exceeded", async () => {
    mockIsLimited.mockReturnValue(true);
    const res = await POST(makeRequest(validSubscription));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/too many/i);
  });

  // -----------------------------------------------------------------------
  // 7. Invalid JSON returns 400
  // -----------------------------------------------------------------------
  it("returns 400 for invalid JSON body", async () => {
    const req = new NextRequest("http://localhost:3000/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid json/i);
  });

  // -----------------------------------------------------------------------
  // 8. Upstream failure is non-fatal — still returns 200
  // -----------------------------------------------------------------------
  it("returns 200 even when upstream fetch fails", async () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    global.fetch = vi.fn().mockRejectedValue(new Error("network error"));

    const res = await POST(makeRequest(validSubscription));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);

    consoleWarnSpy.mockRestore();
  });
});
