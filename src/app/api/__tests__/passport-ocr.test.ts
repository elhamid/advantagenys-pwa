import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Hoisted mock for rate limiter
const { mockIsLimited } = vi.hoisted(() => ({
  mockIsLimited: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/rate-limit", () => ({
  createRateLimiter: vi.fn(() => ({
    isLimited: mockIsLimited,
    remaining: vi.fn().mockReturnValue(4),
    max: 5,
    windowMs: 60_000,
    label: "api/passport-ocr",
    reset: vi.fn(),
  })),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

import { POST } from "../passport-ocr/route";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/passport-ocr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Minimal valid base64 image data URL
const validImageDataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

function mockOpenRouterSuccess(fields: Record<string, string>) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      choices: [
        {
          message: {
            content: JSON.stringify(fields),
          },
        },
      ],
    }),
  } as unknown as Response);
}

describe("POST /api/passport-ocr", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    vi.clearAllMocks();
    mockIsLimited.mockReturnValue(false);
    process.env.OPENROUTER_API_KEY = "test-or-key";

    global.fetch = mockOpenRouterSuccess({
      firstName: "Maria",
      lastName: "Lopez",
      dateOfBirth: "1990-03-05",
      passportNumber: "G12345678",
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.OPENROUTER_API_KEY;
    vi.restoreAllMocks();
  });

  // -----------------------------------------------------------------------
  // 1. Valid base64 image data succeeds
  // -----------------------------------------------------------------------
  it("returns success with extracted fields for valid image data", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const res = await POST(makeRequest({ image: validImageDataUrl }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.fields).toBeDefined();
    expect(body.fields.firstName).toBe("Maria");
    expect(body.fields.lastName).toBe("Lopez");
    expect(body.fields.passportNumber).toBe("G12345678");

    consoleSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // 2. Missing/empty image data returns error
  // -----------------------------------------------------------------------
  it("returns 400 when image is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/no image/i);
  });

  it("returns 400 when image is empty string", async () => {
    const res = await POST(makeRequest({ image: "" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("returns 400 when image is not a string", async () => {
    const res = await POST(makeRequest({ image: 12345 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  // -----------------------------------------------------------------------
  // 3. Invalid image format returns 400
  // -----------------------------------------------------------------------
  it("returns 400 when image is not a valid data URL", async () => {
    const res = await POST(makeRequest({ image: "not-a-data-url" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/invalid image format/i);
  });

  // -----------------------------------------------------------------------
  // 4. Rate limiting works
  // -----------------------------------------------------------------------
  it("returns 429 when rate limit is exceeded", async () => {
    mockIsLimited.mockReturnValue(true);
    const res = await POST(makeRequest({ image: validImageDataUrl }));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/too many/i);
  });

  // -----------------------------------------------------------------------
  // 5. Missing API key returns 500
  // -----------------------------------------------------------------------
  it("returns 500 when OPENROUTER_API_KEY is not set", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    delete process.env.OPENROUTER_API_KEY;

    const res = await POST(makeRequest({ image: validImageDataUrl }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/not configured/i);

    consoleSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // 6. Response shape matches expected OCR output
  // -----------------------------------------------------------------------
  it("response only includes allowed fields, stripping unknown keys", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    global.fetch = mockOpenRouterSuccess({
      firstName: "Maria",
      lastName: "Lopez",
      unknownField: "should-be-stripped",
      dangerousField: "<script>alert(1)</script>",
    } as Record<string, string>);

    const res = await POST(makeRequest({ image: validImageDataUrl }));
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.fields.firstName).toBe("Maria");
    expect(body.fields.lastName).toBe("Lopez");
    expect(body.fields.unknownField).toBeUndefined();
    // dangerousField is not in ALLOWED_FIELDS, so it should be stripped
    expect(body.fields.dangerousField).toBeUndefined();

    consoleSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // 7. OpenRouter failure returns 502
  // -----------------------------------------------------------------------
  it("returns 502 when OpenRouter returns non-ok status", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    } as unknown as Response);

    const res = await POST(makeRequest({ image: validImageDataUrl }));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toMatch(/unavailable/i);

    consoleSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // 8. Network error returns 502
  // -----------------------------------------------------------------------
  it("returns 502 when fetch throws", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("network failure"));

    const res = await POST(makeRequest({ image: validImageDataUrl }));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toMatch(/failed to reach/i);

    consoleSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // 9. Invalid JSON body returns 400
  // -----------------------------------------------------------------------
  it("returns 400 for invalid JSON body", async () => {
    const req = new NextRequest("http://localhost:3000/api/passport-ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  // -----------------------------------------------------------------------
  // 10. Image too large returns 400
  // -----------------------------------------------------------------------
  it("returns 400 when image exceeds max size", async () => {
    // 15MB + 1 byte
    const hugeImage = "data:image/jpeg;base64," + "A".repeat(15 * 1024 * 1024 + 1);
    const res = await POST(makeRequest({ image: hugeImage }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/too large/i);
  });
});
