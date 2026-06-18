import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const storageMock = vi.hoisted(() => ({
  storeRecruitingApplication: vi.fn(),
  fingerprintExists: vi.fn(),
  isRecruitingSupabaseConfigured: vi.fn(),
}));

vi.mock("@/lib/careers/recruiting-storage", () => storageMock);

import { POST, _testing } from "../route";
import { deriveVerificationCode } from "@/lib/careers/product-engineering-associate";
import { HONEYPOT_FIELD } from "@/lib/careers/recruiting-antispam";

function buildFormData(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const fields: Record<string, string> = {
    fullName: "Priya Shah",
    email: "priya@example.com",
    whatsapp: "+91 98765 43210",
    location: "Ahmedabad, India",
    referralCode: "partner-a",
    availability: "Two weeks",
    resumeUrl: "https://drive.google.com/resume",
    experienceSummary: "I have tested forms, dashboards, and small React pages on real devices.",
    issueFindings:
      "On mobile the submit is below the fold and the selected service is not echoed. The phone field has no validation and accepts letters. The confirmation says email but the scenario promised WhatsApp — channel mismatch. The referral code is prefilled and editable. On desktop the long link does not wrap and widens the layout.",
    topIssueSteps:
      "Step 1: open on an iPhone at 390px. Step 2: type letters in the phone field. Expected: a validation error. Actual: it accepts garbage and submits. Step 3: scroll, the submit is below the fold.",
    firstFixReason:
      "I would fix the phone validation first because invalid numbers break follow-up on every lead and hurt conversion. I would not touch the prefilled referral yet.",
    smallImprovement: "I would add an aria-label to the submit button and echo the selected service.",
    riskyQuestion: "I would not change the referral prefill without asking whether it is intentional attribution; I would confirm scope first.",
    consoleNetworkNotes: "No console errors, but the form submits with no network request.",
    proofLinks: "https://drive.google.com/proof",
    proofRecordingUrl: "https://www.loom.com/share/proof",
    verificationCode: deriveVerificationCode("partner-a"),
    aiUseDisclosure: "yes",
    aiUseNotes: "I used AI to organize notes, then verified the page manually on mobile and desktop.",
    aiPrompts:
      "Prompt: 'find usability issues on this quote form'. The AI claimed the phone field validated input; I caught that it accepted letters and corrected it.",
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
    storageMock.storeRecruitingApplication.mockReset();
    storageMock.fingerprintExists.mockReset();
    storageMock.isRecruitingSupabaseConfigured.mockReset();
    process.env.CAREERS_WEBHOOK_URL = "https://careers-webhook.example.com";
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;
    delete process.env.EMAIL_TO;
    storageMock.isRecruitingSupabaseConfigured.mockReturnValue(true);
    storageMock.fingerprintExists.mockResolvedValue(false);
    storageMock.storeRecruitingApplication.mockResolvedValue({
      supabaseOk: true,
      resume: { uploaded: false },
      proof: { uploaded: false },
    });
    // Dead-link HEAD checks + webhook fetch.
    global.fetch = vi.fn(async () => ({ ok: true, status: 200 } as Response));
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
    expect(body.delivery.persisted).toBe(true);
    expect(body.delivery.supabase).toBe(true);
    expect(body.delivery.webhook).toBe(true);
    expect(body.delivery.localOnly).toBe(false);
    expect(storageMock.storeRecruitingApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        hiringLane: "junior_product_engineering_associate",
        partnerTag: "JKH",
        fullName: "Priya Shah",
      }),
      expect.objectContaining({
        total: expect.any(Number),
        label: expect.any(String),
        explanation: expect.any(String),
      }),
      null,
      null
    );
  });

  it("requires a resume (file or link)", async () => {
    const response = await POST(makeRequest(buildFormData({ resumeUrl: "" })));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/resume is required/i);
  });

  it("rejects unsupported resume file types", async () => {
    const formData = buildFormData({ resumeUrl: "" });
    formData.set("resume", new File(["image"], "resume.png", { type: "image/png" }));

    const response = await POST(makeRequest(formData));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/pdf, doc, or docx/i);
  });

  it("rejects when the honeypot field is filled (bot)", async () => {
    const formData = buildFormData();
    formData.set(HONEYPOT_FIELD, "http://spam.example");
    const response = await POST(makeRequest(formData));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(storageMock.storeRecruitingApplication).not.toHaveBeenCalled();
  });

  it("rejects a disposable email domain", async () => {
    const response = await POST(makeRequest(buildFormData({ email: "throwaway@mailinator.com" })));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/permanent email/i);
  });

  it("rejects an exact duplicate (same email+phone fingerprint)", async () => {
    storageMock.fingerprintExists.mockResolvedValue(true);
    const response = await POST(makeRequest(buildFormData()));
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error).toMatch(/already have an application/i);
    expect(storageMock.storeRecruitingApplication).not.toHaveBeenCalled();
  });

  it("allows a first-time candidate even if the dedupe check errors", async () => {
    storageMock.fingerprintExists.mockRejectedValue(new Error("db down"));
    const response = await POST(makeRequest(buildFormData()));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("accepts the open shared link with an arbitrary or missing verification code", async () => {
    const arbitrary = await POST(makeRequest(buildFormData({ verificationCode: "PEA-WRONG1" })));
    expect(arbitrary.status).toBe(200);
    _testing.applicationLimiter.reset();
    const missing = await POST(makeRequest(buildFormData({ verificationCode: "", email: "second@example.com" })));
    expect(missing.status).toBe(200);
  });

  it("fails LOUD in production when Supabase is not configured at all", async () => {
    vi.stubEnv("NODE_ENV", "production");
    storageMock.isRecruitingSupabaseConfigured.mockReturnValue(false);
    const response = await POST(makeRequest(buildFormData()));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(storageMock.storeRecruitingApplication).not.toHaveBeenCalled();
  });

  it("fails when the proof file upload fails and there is no fallback link", async () => {
    vi.stubEnv("NODE_ENV", "production");
    storageMock.storeRecruitingApplication.mockResolvedValue({
      supabaseOk: false,
      resume: { uploaded: false },
      proof: { uploaded: false, error: "Proof upload failed: network error" },
      error: "Proof file upload failed and no alternative proof link was provided.",
    });

    const formData = buildFormData({ proofLinks: "", proofRecordingUrl: "" });
    formData.set("proofScreenshot", new File(["proof"], "proof.png", { type: "image/png" }));

    const response = await POST(makeRequest(formData));
    expect(response.status).toBe(502);
  });

  it("fails in production when Supabase storage fails", async () => {
    vi.stubEnv("NODE_ENV", "production");
    storageMock.storeRecruitingApplication.mockResolvedValue({
      supabaseOk: false,
      resume: { uploaded: false },
      proof: { uploaded: false },
      error: "insert failed",
    });

    const response = await POST(makeRequest(buildFormData()));
    expect(response.status).toBe(502);
  });
});
