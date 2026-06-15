import { describe, expect, it } from "vitest";
import {
  CAREERS_ROLE_TITLE,
  VERIFICATION_PLACEHOLDER,
  convertInrToUsd,
  convertUsdToInr,
  deriveVerificationCode,
  scoreCareerApplication,
  validateApplicationPayload,
  validateProof,
  validateResume,
  type CareerApplicationPayload,
} from "../product-engineering-associate";

function validPayload(overrides: Partial<CareerApplicationPayload> = {}): CareerApplicationPayload {
  return {
    applicationId: "app-test",
    submittedAt: "2026-06-08T00:00:00.000Z",
    role: CAREERS_ROLE_TITLE,
    hiringLane: "junior_product_engineering_associate",
    referralCode: "partner-a",
    partnerTag: "JKH",
    fullName: "Priya Shah",
    email: "priya@example.com",
    whatsapp: "+91 98765 43210",
    location: "Ahmedabad, India",
    linkedin: "https://linkedin.com/in/priya",
    portfolio: "https://github.com/priya",
    resumeFileName: "resume.pdf",
    resumeFileType: "application/pdf",
    resumeFileSize: 1024,
    compensation: {
      enteredCurrency: "INR",
      inrMonthly: 90000,
      usdMonthly: 940.34,
      usdInrRate: 95.71,
      rateDate: "2026-06-08",
    },
    availability: "Two weeks",
    experienceSummary: "I have tested forms, dashboards, and small React pages.",
    surfaces: ["Forms", "Dashboards"],
    issueFindings:
      "1. Mobile spacing is tight. 2. CTA label is unclear. 3. Form field lacks helper text. 4. Console has a warning. 5. Desktop heading wraps oddly.",
    topIssueSteps: "Open the page on mobile, scroll to the form, tap the CTA, and compare the visible result.",
    firstFixReason: "I would fix the CTA first because it affects whether the user can continue.",
    smallImprovement: "I would tighten the form labels and make the next action clearer.",
    riskyQuestion: "Should I change only copy, or can I adjust form behavior too?",
    consoleNetworkNotes: "One console warning appeared; no failed network requests.",
    proofLinks: "https://drive.google.com/example",
    proofRecordingUrl: "https://www.loom.com/share/example",
    proofFileName: "proof.png",
    proofFileType: "image/png",
    proofFileSize: 2048,
    verificationCode: deriveVerificationCode("partner-a"),
    aiUseDisclosure: "yes",
    aiUseNotes: "I used AI to organize notes, then verified the page manually on mobile and desktop.",
    aiPrompts:
      "Prompt: 'find usability issues on this quote form'. The AI assumed the phone field validated input; I checked and it accepted letters, so I corrected that claim.",
    ...overrides,
  };
}

describe("product engineering associate careers helpers", () => {
  it("converts expected monthly compensation both ways", () => {
    expect(convertUsdToInr(1000, 95.71)).toBe(95710);
    expect(convertInrToUsd(95710, 95.71)).toBe(1000);
  });

  it("accepts a complete application payload", () => {
    expect(validateApplicationPayload(validPayload())).toEqual({ valid: true });
  });

  it("allows submission without resume proof", () => {
    const result = validateApplicationPayload(
      validPayload({
        resumeFileName: undefined,
        resumeFileType: undefined,
        resumeFileSize: undefined,
        resumeUrl: undefined,
      })
    );
    expect(result).toEqual({ valid: true });
  });

  it("derives a stable verification code from a ref token", () => {
    const code = deriveVerificationCode("edbd1234");
    expect(code).toMatch(/^PEA-[A-Z0-9]{6}$/);
    expect(deriveVerificationCode("edbd1234")).toBe(code);
    expect(deriveVerificationCode("EDBD1234")).toBe(code);
    expect(deriveVerificationCode("other-ref")).not.toBe(code);
  });

  it("uses the placeholder verification code when no ref is present", () => {
    expect(deriveVerificationCode(null)).toBe(VERIFICATION_PLACEHOLDER);
    expect(deriveVerificationCode("")).toBe(VERIFICATION_PLACEHOLDER);
    expect(deriveVerificationCode("   ")).toBe(VERIFICATION_PLACEHOLDER);
  });

  it("requires at least one proof-of-inspection artifact", () => {
    const result = validateApplicationPayload(
      validPayload({
        proofLinks: undefined,
        proofRecordingUrl: undefined,
        proofFileName: undefined,
        proofFileType: undefined,
        proofFileSize: undefined,
      })
    );
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/proof of inspection/i);
  });

  it("accepts a proof file artifact alone", () => {
    const result = validateApplicationPayload(
      validPayload({
        proofLinks: undefined,
        proofRecordingUrl: undefined,
        proofFileName: "proof.png",
        proofFileType: "image/png",
        proofFileSize: 2048,
      })
    );
    expect(result).toEqual({ valid: true });
  });

  it("rejects a missing verification code", () => {
    const result = validateApplicationPayload(validPayload({ verificationCode: undefined }));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/verification code is required/i);
  });

  it("rejects a verification code that does not match the ref token", () => {
    const result = validateApplicationPayload(validPayload({ verificationCode: "PEA-WRONG1" }));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/verification code does not match/i);
  });

  it("accepts the placeholder verification code for a no-ref application", () => {
    const result = validateApplicationPayload(
      validPayload({
        referralCode: undefined,
        verificationCode: VERIFICATION_PLACEHOLDER,
      })
    );
    expect(result).toEqual({ valid: true });
  });

  it("rejects a raw non-URL proofLinks value as the only artifact", () => {
    const result = validateApplicationPayload(
      validPayload({
        proofLinks: "I looked at it on my phone",
        proofRecordingUrl: undefined,
        proofFileName: undefined,
        proofFileType: undefined,
        proofFileSize: undefined,
      })
    );
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/proof links must start with/i);
  });

  it("accepts a validated proofLinks URL as the only artifact", () => {
    const result = validateApplicationPayload(
      validPayload({
        proofLinks: "https://drive.google.com/example",
        proofRecordingUrl: undefined,
        proofFileName: undefined,
        proofFileType: undefined,
        proofFileSize: undefined,
      })
    );
    expect(result).toEqual({ valid: true });
  });

  it("requires the AI prompts disclosure", () => {
    const result = validateApplicationPayload(validPayload({ aiPrompts: "" }));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/aiPrompts/i);
  });

  it("validates proof file type and size", () => {
    const png = new File(["proof"], "proof.png", { type: "image/png" });
    expect(validateProof(png)).toEqual({ valid: true });

    const exe = new File(["bad"], "proof.exe", { type: "application/x-msdownload" });
    expect(validateProof(exe).valid).toBe(false);
  });

  it("rejects thin work-sample issue findings", () => {
    const result = validateApplicationPayload(validPayload({ issueFindings: "Looks fine." }));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/issue findings/i);
  });

  it("validates resume type and size", () => {
    const pdf = new File(["resume"], "resume.pdf", { type: "application/pdf" });
    expect(validateResume(pdf)).toEqual({ valid: true });

    const png = new File(["bad"], "resume.png", { type: "image/png" });
    expect(validateResume(png).valid).toBe(false);
  });

  it("scores a detailed product review with reviewer-readable explanation", () => {
    const score = scoreCareerApplication(validPayload());

    expect(score.total).toBeGreaterThan(6);
    expect(score.label).toEqual(expect.any(String));
    expect(score.explanation).toMatch(/review|proof|detail|prioritization/i);
    expect(score.breakdown).toEqual(
      expect.objectContaining({
        workSampleDetail: expect.any(Number),
        reproductionClarity: expect.any(Number),
        prioritization: expect.any(Number),
        judgment: expect.any(Number),
        proofDiscipline: expect.any(Number),
        toolTransparency: expect.any(Number),
      })
    );
  });
});
