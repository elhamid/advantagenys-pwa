import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Hoisted mocks
const { mockIsLimited } = vi.hoisted(() => ({
  mockIsLimited: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/rate-limit", () => ({
  createRateLimiter: vi.fn(() => ({
    isLimited: mockIsLimited,
    remaining: vi.fn().mockReturnValue(4),
    max: 5,
    windowMs: 60_000,
    label: "api/itin-submit",
    reset: vi.fn(),
  })),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

vi.mock("@/lib/itin-storage", () => ({
  uploadMultipleItinDocuments: vi.fn().mockResolvedValue({
    passport: null,
    selfie: null,
    signature: null,
  }),
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ messageId: "test" }),
    }),
  },
}));

import { POST } from "../itin-submit/route";

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value);
  }
  return fd;
}

function makeRequest(fields: Record<string, string>, searchParams = ""): NextRequest {
  const fd = makeFormData(fields);
  return new NextRequest(
    `http://localhost:3000/api/itin-submit${searchParams}`,
    {
      method: "POST",
      body: fd,
    }
  );
}

const validFields: Record<string, string> = {
  firstName: "Maria",
  lastName: "Lopez",
  middleName: "",
  dateOfBirth: "1990-03-05",
  countryOfBirth: "Mexico",
  cityOfBirth: "Mexico City",
  countryOfCitizenship: "Mexico",
  phone: "9295551234",
  email: "maria@example.com",
  city: "new_york",
  addressUsa: "123 Main St",
  aptNumber: "",
  zipCode: "10001",
  addressHomeCountry: "",
  homeCountry: "Mexico",
  homeCity: "Mexico City",
  homeAddress: "Calle Reforma 23",
  usEntryDate: "2022-01-15",
  companyName: "",
  amount: "35000",
  hasPassport: "true",
  passportNumber: "G12345678",
  passportExpiry: "2027-03-15",
  passportCountry: "Mexico",
  comment: "",
};

describe("POST /api/itin-submit", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    vi.clearAllMocks();
    mockIsLimited.mockReturnValue(false);

    // Mock fetch for webhook and JotForm calls
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "",
      json: async () => ({ content: { submissionID: "12345" } }),
    } as unknown as Response);

    // Ensure env vars are set
    process.env.PWA_WEBHOOK_SECRET = "test-secret";
    process.env.TASKBOARD_WEBHOOK_URL = "https://test-webhook.example.com";
    process.env.JOTFORM_API_KEY = "test-jotform-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // -----------------------------------------------------------------------
  // 1. Valid submission succeeds
  // -----------------------------------------------------------------------
  it("returns 200 with success:true for valid ITIN data", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Use unique phone to avoid duplicate guard
    const fields = { ...validFields, phone: "9295550001" };
    const res = await POST(makeRequest(fields));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    consoleSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // 2. Missing required fields return 400
  // -----------------------------------------------------------------------
  it("returns 400 when firstName is missing", async () => {
    const fields = { ...validFields, firstName: "", phone: "9295550010" };
    const res = await POST(makeRequest(fields));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/first name/i);
  });

  it("returns 400 when lastName is missing", async () => {
    const fields = { ...validFields, lastName: "  ", phone: "9295550011" };
    const res = await POST(makeRequest(fields));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/last name/i);
  });

  it("returns 400 when phone is too short", async () => {
    const fields = { ...validFields, phone: "123" };
    const res = await POST(makeRequest(fields));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/phone/i);
  });

  it("returns 400 when city is missing", async () => {
    const fields = { ...validFields, city: "", phone: "9295550012" };
    const res = await POST(makeRequest(fields));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/city/i);
  });

  // -----------------------------------------------------------------------
  // 3. Duplicate submission within window is rejected
  // -----------------------------------------------------------------------
  it("rejects duplicate submission within 30s window", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const uniquePhone = "9295550099";
    const fields = { ...validFields, phone: uniquePhone };

    // First submission should succeed
    const res1 = await POST(makeRequest(fields));
    expect(res1.status).toBe(200);

    // Second immediate submission with same phone should be rejected
    const res2 = await POST(makeRequest(fields));
    expect(res2.status).toBe(429);
    const body2 = await res2.json();
    expect(body2.error).toMatch(/duplicate/i);

    consoleSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // 4. Generic error message on server error (no internal details leaked)
  // -----------------------------------------------------------------------
  it("returns generic error message on unexpected server error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Create a request that will cause formData() to fail
    const req = new NextRequest("http://localhost:3000/api/itin-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ not: "form-data" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    // Should show user-friendly message, not internal details
    expect(body.error).toMatch(/please try again|call/i);
    // Should NOT leak internal error details
    expect(body.error).not.toMatch(/formData|TypeError|stack/i);

    consoleSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // 5. Rate limiting
  // -----------------------------------------------------------------------
  it("returns 429 when IP rate limit is exceeded", async () => {
    mockIsLimited.mockReturnValue(true);
    const res = await POST(makeRequest({ ...validFields, phone: "9295550020" }));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/too many/i);
  });
});
