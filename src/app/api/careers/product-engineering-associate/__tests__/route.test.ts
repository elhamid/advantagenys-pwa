import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const storageMock = vi.hoisted(() => ({
  storeRecruitingApplication: vi.fn(),
}));

vi.mock("@/lib/careers/recruiting-storage", () => storageMock);

import { POST, _testing } from "../route";

function buildFormData(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const fields = {
    fullName: "Priya Shah",
    email: "priya@example.com",
    whatsapp: "+91 98765 43210",
    location: "Ahmedabad, India",
    referralCode: "partner-a",
    availability: "Two weeks",
    resumeUrl: "https://drive.google.com/resume",
    compensationInr: "90000",
    compensationUsd: "940.34",
    enteredCurrency: "INR",
    usdInrRate: "95.71",
    rateDate: "2026-06-08",
    experienceSummary: "I have tested forms, dashboards, and small React pages.",
    issueFindings:
      "1. Mobile spacing is tight. 2. CTA label is unclear. 3. Form field lacks helper text. 4. Console has a warning. 5. Desktop heading wraps oddly.",
    topIssueSteps: "Open the page on mobile, scroll to the form, tap the CTA, and compare the visible result.",
    firstFixReason: "I would fix the CTA first because it affects whether the user can continue.",
    smallImprovement: "I would tighten the form labels and make the next action clearer.",
    riskyQuestion: "Should I change only copy, or can I adjust form behavior too?",
    consoleNetworkNotes: "One console warning appeared; no failed network requests.",
    proofLinks: "https://drive.google.com/proof",
    aiUseDisclosure: "yes",
    aiUseNotes: "I used AI to organize notes, then verified the page manually on mobile and desktop.",
    ...overrides,
  };

  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  data.append("surfaces", "Forms");
  data.append("surfaces", "Dashboards");
  return data;
}

function makeRequest(formData: FormData): NextRequest {
  return new NextRequest("http://localhost:3000/api/careers/product-engineering-associate", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/careers/product-engineering-associate", () => {
  beforeEach(() => {
    _testing.applicationLimiter.reset();
    process.env.CAREERS_WEBHOOK_URL = "https://careers-webhook.example.com";
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;
    delete process.env.EMAIL_TO;
    storageMock.storeRecruitingApplication.mockResolvedValue({
      supabaseOk: true,
      resume: { uploaded: false },
    });
    global.fetch = vi.fn(async () => ({ ok: true } as Response));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    delete process.env.CAREERS_WEBHOOK_URL;
  });

  it("accepts a valid application, stores it, and forwards a careers record", async () => {
    const response = await POST(makeRequest(buildFormData()));
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.applicationId).toEqual(expect.any(String));
    expect(body.score).toBeUndefined();
    expect(body.delivery.supabase).toBe(true);
    expect(body.delivery.webhook).toBe(true);
    expect(storageMock.storeRecruitingApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        hiringLane: "junior_product_engineering_associate",
        partnerTag: "JKH",
        fullName: "Priya Shah",
      }),
      expect.objectContaining({
        total: expect.any(Number),
        explanation: expect.any(String),
      }),
      null
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://careers-webhook.example.com",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("accepts applications without resume file or link", async () => {
    const response = await POST(makeRequest(buildFormData({ resumeUrl: "" })));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("rejects unsupported resume file types", async () => {
    const formData = buildFormData({ resumeUrl: "" });
    formData.set("resume", new File(["image"], "resume.png", { type: "image/png" }));

    const response = await POST(makeRequest(formData));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/pdf, doc, or docx/i);
  });

  it("fails in production when Supabase storage fails", async () => {
    vi.stubEnv("NODE_ENV", "production");
    storageMock.storeRecruitingApplication.mockResolvedValue({
      supabaseOk: false,
      resume: { uploaded: false },
      error: "insert failed",
    });

    const response = await POST(makeRequest(buildFormData()));
    expect(response.status).toBe(502);
  });
});
