import { describe, expect, it } from "vitest";
import {
  CAREERS_ROLE_TITLE,
  VERIFICATION_PLACEHOLDER,
  deriveVerificationCode,
  scoreCareerApplication,
  validateApplicationPayload,
  validateProof,
  validateResume,
  type CareerApplicationPayload,
} from "../product-engineering-associate";
import {
  computeRecruitingScore,
  gateResult,
  scoreDefectMatch,
  PLANTED_DEFECTS,
  TOTAL_PLANTED_DEFECTS,
} from "../recruiting-scoring";

// A candidate who genuinely inspected the sample and caught real planted defects:
// channel mismatch, no phone validation, below-fold submit, prefilled referral,
// non-wrapping long link. Plus reproduction steps + impact prioritization.
function strongFindings() {
  return {
    issueFindings:
      "On mobile the submit button is pushed below the fold because the service cards stack tall, and the selected service is never echoed near submit. The phone field has no validation and accepts letters. The confirmation says it will email a quote even though the scenario promised WhatsApp — a channel mismatch. The referral code is prefilled (JKH-2026) and editable. On desktop the long reference link does not wrap and widens the layout, causing horizontal scroll.",
    topIssueSteps:
      "Step 1: open the page on an iPhone at 390px in Safari. Step 2: tap into the phone field and type letters. Expected: validation error. Actual: it accepts garbage and still submits. Step 3: scroll — the submit button is below the fold.",
    firstFixReason:
      "I would fix the phone validation first because invalid phone numbers break our ability to follow up on every lead, which directly hurts conversion. I would NOT touch the referral prefill yet without checking why it is seeded.",
    riskyQuestion:
      "I would not change the referral code behavior without asking first: is the prefilled JKH-2026 intentional attribution? I would confirm scope before editing it.",
    consoleNetworkNotes: "No console errors, but the form submits with no network request to a backend.",
  };
}

function validPayload(overrides: Partial<CareerApplicationPayload> = {}): CareerApplicationPayload {
  const findings = strongFindings();
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
    availability: "Two weeks",
    experienceSummary: "I have tested forms, dashboards, and small React pages on real devices.",
    surfaces: ["Forms", "Dashboards"],
    issueFindings: findings.issueFindings,
    topIssueSteps: findings.topIssueSteps,
    firstFixReason: findings.firstFixReason,
    smallImprovement: "I would add an aria-label to the submit button and confirm the selected service near it.",
    riskyQuestion: findings.riskyQuestion,
    consoleNetworkNotes: findings.consoleNetworkNotes,
    proofLinks: "https://drive.google.com/example",
    proofRecordingUrl: "https://www.loom.com/share/example",
    proofFileName: "proof.png",
    proofFileType: "image/png",
    proofFileSize: 2048,
    verificationCode: deriveVerificationCode("partner-a"),
    aiUseDisclosure: "yes",
    aiUseNotes: "I used AI to organize notes, then verified the page manually on mobile and desktop.",
    aiPrompts:
      "Prompt: 'find usability issues on this quote form'. The AI assumed the phone field validated input; I checked and it accepted letters, so I corrected that claim and verified it myself.",
    ...overrides,
  };
}

describe("validateApplicationPayload", () => {
  it("accepts a complete application payload", () => {
    expect(validateApplicationPayload(validPayload())).toEqual({ valid: true });
  });

  it("requires a resume file or link (resume is no longer optional)", () => {
    const result = validateApplicationPayload(
      validPayload({
        resumeFileName: undefined,
        resumeFileType: undefined,
        resumeFileSize: undefined,
        resumeUrl: undefined,
      })
    );
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/resume is required/i);
  });

  it("accepts a resume provided as a link only", () => {
    const result = validateApplicationPayload(
      validPayload({
        resumeFileName: undefined,
        resumeFileType: undefined,
        resumeFileSize: undefined,
        resumeUrl: "https://drive.google.com/resume",
      })
    );
    expect(result).toEqual({ valid: true });
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

  it("accepts an application via the open shared link with no/arbitrary verification code", () => {
    expect(validateApplicationPayload(validPayload({ verificationCode: undefined }))).toEqual({ valid: true });
    expect(validateApplicationPayload(validPayload({ verificationCode: "PEA-WRONG1" }))).toEqual({ valid: true });
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

  it("rejects thin work-sample issue findings", () => {
    const result = validateApplicationPayload(validPayload({ issueFindings: "Looks fine." }));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/issue findings/i);
  });

  it("validates proof file type and size", () => {
    const png = new File(["proof"], "proof.png", { type: "image/png" });
    expect(validateProof(png)).toEqual({ valid: true });
    const exe = new File(["bad"], "proof.exe", { type: "application/x-msdownload" });
    expect(validateProof(exe).valid).toBe(false);
  });

  it("validates resume type and size", () => {
    const pdf = new File(["resume"], "resume.pdf", { type: "application/pdf" });
    expect(validateResume(pdf)).toEqual({ valid: true });
    const png = new File(["bad"], "resume.png", { type: "image/png" });
    expect(validateResume(png).valid).toBe(false);
  });
});

describe("deriveVerificationCode (unchanged informational helper)", () => {
  it("derives a stable code from a ref token", () => {
    const code = deriveVerificationCode("edbd1234");
    expect(code).toMatch(/^PEA-[A-Z0-9]{6}$/);
    expect(deriveVerificationCode("EDBD1234")).toBe(code);
    expect(deriveVerificationCode("other-ref")).not.toBe(code);
  });

  it("uses the placeholder when no ref is present", () => {
    expect(deriveVerificationCode(null)).toBe(VERIFICATION_PLACEHOLDER);
    expect(deriveVerificationCode("")).toBe(VERIFICATION_PLACEHOLDER);
  });
});

describe("hard gates", () => {
  it("passes when email, phone, proof, resume, and AI honesty are all present", () => {
    const gate = gateResult(validPayload());
    expect(gate.passed).toBe(true);
    expect(gate.failures).toHaveLength(0);
  });

  it("fails when there is no resume", () => {
    const gate = gateResult(validPayload({ resumeFileName: undefined, resumeUrl: undefined }));
    expect(gate.passed).toBe(false);
    expect(gate.failures).toContain("no_resume");
  });

  it("fails when AI is disclosed as used but no prompt is pasted", () => {
    const gate = gateResult(validPayload({ aiUseDisclosure: "yes", aiPrompts: "" }));
    expect(gate.passed).toBe(false);
    expect(gate.failures).toContain("ai_disclosure_incomplete");
  });

  it("fails on an invalid phone", () => {
    const gate = gateResult(validPayload({ whatsapp: "abc" }));
    expect(gate.passed).toBe(false);
    expect(gate.failures).toContain("invalid_phone");
  });
});

describe("defect-match scoring against the planted sample defects", () => {
  it("catches the real planted defects from genuine findings", () => {
    const result = scoreDefectMatch(validPayload());
    expect(result.caughtCount).toBeGreaterThanOrEqual(4);
    // All five planted-defect ids are known to the rubric.
    expect(PLANTED_DEFECTS).toHaveLength(TOTAL_PLANTED_DEFECTS);
    expect(result.caught).toEqual(expect.arrayContaining(["phone_validation", "channel_mismatch"]));
    expect(result.reproductionPoints).toBeGreaterThan(0);
    expect(result.prioritizationPoints).toBeGreaterThan(0);
  });

  it("scores near zero defects for buzzword padding with no real findings", () => {
    const padded =
      "This is a great product. Mobile and desktop look modern. The form and cta and console and network are present. I reviewed everything carefully and it is high quality work with attention to detail.";
    const result = scoreDefectMatch(
      validPayload({
        issueFindings: padded,
        topIssueSteps: padded,
        firstFixReason: padded,
        riskyQuestion: padded,
        consoleNetworkNotes: padded,
      })
    );
    expect(result.caughtCount).toBeLessThanOrEqual(1);
  });
});

describe("computeRecruitingScore tiers (0-100, deterministic)", () => {
  it("returns a strong tier and qualified=true for a genuine, complete submission", () => {
    const score = computeRecruitingScore(validPayload());
    expect(score.total).toBeGreaterThanOrEqual(70);
    expect(score.label).toBe("strong");
    expect(score.breakdown.qualified).toBe(true);
    expect(score.breakdown.defectsCaughtCount).toBeGreaterThanOrEqual(3);
    expect(score.breakdown.llm).toBeNull();
  });

  it("caps a gate-failing submission to weak even with detailed text", () => {
    const score = computeRecruitingScore(validPayload({ resumeFileName: undefined, resumeUrl: undefined }));
    expect(score.label).toBe("weak");
    expect(score.total).toBeLessThanOrEqual(49);
    expect(score.breakdown.qualified).toBe(false);
    expect(score.explanation).toMatch(/hard gate/i);
  });

  it("downgrades a dead resume link via the signal context", () => {
    const reachable = computeRecruitingScore(
      validPayload({ resumeFileName: undefined, resumeUrl: "https://drive.google.com/resume" }),
      { resumeReachable: true }
    );
    const dead = computeRecruitingScore(
      validPayload({ resumeFileName: undefined, resumeUrl: "https://drive.google.com/resume" }),
      { resumeReachable: false }
    );
    expect(dead.total).toBeLessThan(reachable.total);
  });

  it("exposes a structured breakdown for the review UI", () => {
    const score = computeRecruitingScore(validPayload());
    expect(score.breakdown).toEqual(
      expect.objectContaining({
        gate: expect.any(Object),
        defectMatch: expect.any(Object),
        signals: expect.any(Object),
        defectsCaught: expect.any(Array),
        totalPlantedDefects: TOTAL_PLANTED_DEFECTS,
        qualified: expect.any(Boolean),
      })
    );
  });

  it("is exported as scoreCareerApplication for the route", () => {
    expect(scoreCareerApplication(validPayload()).total).toBe(computeRecruitingScore(validPayload()).total);
  });
});
