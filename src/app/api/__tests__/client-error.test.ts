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
    label: "api/client-error",
    reset: vi.fn(),
  })),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

import { POST } from "../client-error/route";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/client-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/client-error", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLimited.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 with ok:true for valid error data", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(
      makeRequest({
        message: "Something went wrong",
        stack: "Error: Something went wrong\n  at Component.tsx:42",
        url: "https://advantagenys.com/services/tax",
        component: "TaxPage",
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
    consoleSpy.mockRestore();
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockIsLimited.mockReturnValue(true);
    const res = await POST(makeRequest({ message: "error" }));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/too many/i);
  });

  it("caps message at 1000 characters", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const longMessage = "x".repeat(2000);
    const res = await POST(makeRequest({ message: longMessage }));
    expect(res.status).toBe(200);
    const loggedJson = JSON.parse((consoleSpy.mock.calls[0] as unknown[])[1] as string);
    expect(loggedJson.message.length).toBe(1000);
    consoleSpy.mockRestore();
  });

  it("caps stack at 1000 characters", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const longStack = "s".repeat(2000);
    const res = await POST(makeRequest({ message: "err", stack: longStack }));
    expect(res.status).toBe(200);
    const loggedJson = JSON.parse((consoleSpy.mock.calls[0] as unknown[])[1] as string);
    expect(loggedJson.stack.length).toBe(1000);
    consoleSpy.mockRestore();
  });

  it("caps url at 500 characters", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const longUrl = "u".repeat(1000);
    const res = await POST(makeRequest({ message: "err", url: longUrl }));
    expect(res.status).toBe(200);
    const loggedJson = JSON.parse((consoleSpy.mock.calls[0] as unknown[])[1] as string);
    expect(loggedJson.url.length).toBe(500);
    consoleSpy.mockRestore();
  });

  it("caps component at 200 characters", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const longComp = "c".repeat(400);
    const res = await POST(makeRequest({ message: "err", component: longComp }));
    expect(res.status).toBe(200);
    const loggedJson = JSON.parse((consoleSpy.mock.calls[0] as unknown[])[1] as string);
    expect(loggedJson.component.length).toBe(200);
    consoleSpy.mockRestore();
  });

  it("returns 400 when body is not valid JSON", async () => {
    const req = new NextRequest("http://localhost:3000/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  it("handles non-string field values gracefully (defaults to empty)", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(makeRequest({ message: 123, stack: null, url: undefined, component: { obj: true } }));
    expect(res.status).toBe(200);
    const loggedJson = JSON.parse((consoleSpy.mock.calls[0] as unknown[])[1] as string);
    expect(loggedJson.message).toBe("");
    consoleSpy.mockRestore();
  });

  it("returns 200 with empty body object", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(200);
    consoleSpy.mockRestore();
  });
});
