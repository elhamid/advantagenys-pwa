import { describe, expect, it } from "vitest";
import { CAREERS_ROLE_TITLE, type CareerApplicationPayload } from "../product-engineering-associate";
import {
  recruitingRecordFromPayload,
  type ProofStorageRecord,
  type ResumeStorageRecord,
} from "../recruiting-storage";

const payload: CareerApplicationPayload = {
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
  resumeFileName: "resume.pdf",
  resumeFileType: "application/pdf",
  resumeFileSize: 1024,
  compensation: {
    enteredCurrency: "INR",
    inrMonthly: 90000,
    usdMonthly: 940.34,
  },
  availability: "Two weeks",
  experienceSummary: "I have tested forms, dashboards, and small React pages.",
  surfaces: ["Forms", "Dashboards"],
  issueFindings:
    "Mobile and desktop review found form spacing, CTA copy, console warning, helper text, and heading wrap issues.",
  topIssueSteps: "Open the page on mobile, scroll to the form, tap the CTA, and compare the visible result.",
  firstFixReason: "I would fix the CTA first because it affects whether the user can continue.",
  smallImprovement: "I would tighten labels and make the next action clearer.",
  riskyQuestion: "Should I change only copy, or can I adjust behavior after verifying scope?",
  consoleNetworkNotes: "One console warning appeared; no failed network requests.",
  proofLinks: "https://drive.google.com/proof",
  proofRecordingUrl: "https://www.loom.com/share/proof",
  proofFileName: "proof.png",
  proofFileType: "image/png",
  proofFileSize: 2048,
  verificationCode: "PEA-AB12CD",
  aiUseDisclosure: "yes",
  aiUseNotes: "I used AI to organize notes, then verified the page manually.",
  aiPrompts:
    "Prompt: 'list usability issues on this quote form'. The AI claimed the phone field validated input; I checked and it accepted letters, so I corrected that.",
};

describe("recruiting storage mapping", () => {
  it("builds a reusable recruiting record with JKH tag, score, and resume storage linkage", () => {
    const resume: ResumeStorageRecord = {
      uploaded: true,
      fileName: "resume.pdf",
      fileType: "application/pdf",
      fileSize: 1024,
      path: "junior_product_engineering_associate/JKH/app-test/priya-shah-resume.pdf",
    };

    const proof: ProofStorageRecord = {
      uploaded: true,
      fileName: "proof.png",
      fileType: "image/png",
      fileSize: 2048,
      path: "junior_product_engineering_associate/JKH/app-test/priya-shah-proof.png",
    };

    const record = recruitingRecordFromPayload(
      payload,
      {
        total: 8.4,
        label: "strong",
        explanation: "Detailed product review with reviewer-ready proof.",
        breakdown: {
          workSampleDetail: 9,
          reproductionClarity: 8,
          prioritization: 8,
          judgment: 8,
          proofDiscipline: 9,
          toolTransparency: 8,
        },
      },
      resume,
      proof
    );

    expect(record.hiring_lane).toBe("junior_product_engineering_associate");
    expect(record.partner_tag).toBe("JKH");
    expect(record.score).toBe(8.4);
    expect(record.score_explanation).toMatch(/proof/i);
    expect(record.resume).toEqual(
      expect.objectContaining({
        storage_path: resume.path,
        signed_url: null,
        uploaded: true,
      })
    );
    expect(record.proof).toEqual(
      expect.objectContaining({
        storage_path: proof.path,
        signed_url: null,
        uploaded: true,
      })
    );
    expect(record.verification_code).toBe("PEA-AB12CD");
  });
});
