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
    label: "api/itin-voice",
    reset: vi.fn(),
  })),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

import { POST } from "../itin-voice/route";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/itin-voice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

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

describe("POST /api/itin-voice", () => {
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
      countryOfBirth: "Mexico",
      phone: "929-555-0123",
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.OPENROUTER_API_KEY;
    vi.restoreAllMocks();
  });

  // -----------------------------------------------------------------------
  // 1. Valid voice data succeeds
  // -----------------------------------------------------------------------
  it("returns success with extracted fields for valid transcript", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const res = await POST(
      makeRequest({
        transcript: "My name is Maria Lopez born on March 5th 1990 in Mexico",
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.fields).toBeDefined();
    expect(body.fields.firstName).toBe("Maria");
    expect(body.fields.lastName).toBe("Lopez");
    expect(body.confidence).toBeTruthy();

    consoleSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // 2. Missing required fields return error
  // -----------------------------------------------------------------------
  it("returns 400 when transcript is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/no transcript/i);
  });

  it("returns 400 when transcript is empty string", async () => {
    const res = await POST(makeRequest({ transcript: "" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("returns 400 when transcript is whitespace only", async () => {
    const res = await POST(makeRequest({ transcript: "   " }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("returns 400 when transcript exceeds 5000 characters", async () => {
    const res = await POST(makeRequest({ transcript: "x".repeat(5001) }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/maximum length/i);
  });

  // -----------------------------------------------------------------------
  // 3. Rate limiting works
  // -----------------------------------------------------------------------
  it("returns 429 when rate limit is exceeded", async () => {
    mockIsLimited.mockReturnValue(true);
    const res = await POST(makeRequest({ transcript: "test" }));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/too many/i);
  });

  // -----------------------------------------------------------------------
  // 4. Missing API key returns 500
  // -----------------------------------------------------------------------
  it("returns 500 when OPENROUTER_API_KEY is not set", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    delete process.env.OPENROUTER_API_KEY;

    const res = await POST(makeRequest({ transcript: "test transcript" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/not configured/i);

    consoleSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // 5. Invalid JSON body returns 400
  // -----------------------------------------------------------------------
  it("returns 400 for invalid JSON body", async () => {
    const req = new NextRequest("http://localhost:3000/api/itin-voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  // -----------------------------------------------------------------------
  // 6. OpenRouter failure returns 502
  // -----------------------------------------------------------------------
  it("returns 502 when OpenRouter returns non-ok status", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    } as unknown as Response);

    const res = await POST(makeRequest({ transcript: "test transcript" }));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toMatch(/unavailable/i);

    consoleSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // 7. Network error returns 502
  // -----------------------------------------------------------------------
  it("returns 502 when fetch throws", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error("network failure"));

    const res = await POST(makeRequest({ transcript: "test transcript" }));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toMatch(/failed to reach/i);

    consoleSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // 8. Confidence levels
  // -----------------------------------------------------------------------
  it("returns high confidence when 5+ fields extracted", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    global.fetch = mockOpenRouterSuccess({
      firstName: "Maria",
      lastName: "Lopez",
      dateOfBirth: "1990-03-05",
      countryOfBirth: "Mexico",
      phone: "929-555-0123",
    });

    const res = await POST(makeRequest({ transcript: "test" }));
    const body = await res.json();
    expect(body.confidence).toBe("high");

    consoleSpy.mockRestore();
  });

  it("returns medium confidence when 2-4 fields extracted", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    global.fetch = mockOpenRouterSuccess({
      firstName: "Maria",
      lastName: "Lopez",
    });

    const res = await POST(makeRequest({ transcript: "test" }));
    const body = await res.json();
    expect(body.confidence).toBe("medium");

    consoleSpy.mockRestore();
  });

  it("returns low confidence when 0-1 fields extracted", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    global.fetch = mockOpenRouterSuccess({
      firstName: "Maria",
    });

    const res = await POST(makeRequest({ transcript: "test" }));
    const body = await res.json();
    expect(body.confidence).toBe("low");

    consoleSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // 9. Accepts currentFields parameter
  // -----------------------------------------------------------------------
  it("accepts currentFields as additional context", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const res = await POST(
      makeRequest({
        transcript: "My phone is 929-555-0123",
        currentFields: { firstName: "Maria", lastName: "Lopez" },
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    consoleSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // 10. Only allowed fields are returned
  // -----------------------------------------------------------------------
  it("strips unknown fields from LLM response", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    global.fetch = mockOpenRouterSuccess({
      firstName: "Maria",
      unknownField: "should-be-stripped",
      anotherBadField: "also-stripped",
    } as Record<string, string>);

    const res = await POST(makeRequest({ transcript: "test" }));
    const body = await res.json();
    expect(body.fields.firstName).toBe("Maria");
    expect(body.fields.unknownField).toBeUndefined();
    expect(body.fields.anotherBadField).toBeUndefined();

    consoleSpy.mockRestore();
  });
});
