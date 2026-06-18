import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CAREERS_ROLE_TITLE,
  type CareerApplicationPayload,
  type CareerApplicationScore,
} from "../product-engineering-associate";
import {
  recruitingRecordFromPayload,
  resetRecruitingSupabaseForTests,
  safeExtension,
  storeRecruitingApplication,
  type ProofStorageRecord,
  type ResumeStorageRecord,
} from "../recruiting-storage";

// New deterministic-rubric score shape (0-100 total, structured breakdown).
function makeScore(total: number, label: CareerApplicationScore["label"] = "strong"): CareerApplicationScore {
  return {
    total,
    label,
    explanation: "Detailed product review with reviewer-ready proof.",
    breakdown: {
      gate: {
        passed: true,
        failures: [],
        checks: {
          validEmail: true,
          validPhone: true,
          hasProofArtifact: true,
          hasResume: true,
          aiHonestyAnswered: true,
        },
      },
      defectMatch: {
        caught: ["phone_validation", "channel_mismatch", "nonwrapping_link"],
        caughtCount: 3,
        defectPoints: 18,
        reproductionPoints: 8,
        prioritizationPoints: 3,
        restraintPoints: 2,
        total: 31,
      },
      signals: {
        completeness: 12,
        resumeReachable: 10,
        artifactReachable: 10,
        availability: 5,
        surfaces: 4,
        validProfileUrl: 6,
        aiHonesty: 6,
        total: 53,
      },
      defectsCaught: ["phone_validation", "channel_mismatch", "nonwrapping_link"],
      defectsCaughtCount: 3,
      totalPlantedDefects: 5,
      qualified: true,
      llm: null,
    },
  };
}

const strongScore = makeScore(82);

const supabaseMock = vi.hoisted(() => ({
  uploadResult: { error: null as { message: string } | null },
  insertResult: { error: null as { message: string } | null },
  createClient: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: vi.fn(async () => supabaseMock.uploadResult),
      }),
    },
    from: () => ({
      insert: vi.fn(async () => supabaseMock.insertResult),
    }),
  }),
}));

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

    const record = recruitingRecordFromPayload(payload, strongScore, resume, proof);

    expect(record.hiring_lane).toBe("junior_product_engineering_associate");
    expect(record.partner_tag).toBe("JKH");
    expect(record.score).toBe(82);
    expect(record.score_explanation).toMatch(/proof/i);
    // Anti-spam dedupe key is persisted; compensation is no longer written.
    expect(record.applicant_fingerprint).toEqual(expect.any(String));
    expect((record as Record<string, unknown>).compensation).toBeUndefined();
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

describe("storage key extension derivation", () => {
  it("derives the extension from the validated MIME type, not the raw filename", () => {
    const png = new File(["x"], "screenshot.HEIC.png.exe", { type: "image/png" });
    expect(safeExtension(png)).toBe("png");

    const jpeg = new File(["x"], "no-extension", { type: "image/jpeg" });
    expect(safeExtension(jpeg)).toBe("jpg");

    const pdf = new File(["x"], "résumé.pdf", { type: "application/pdf" });
    expect(safeExtension(pdf)).toBe("pdf");
  });

  it("strictly sanitizes the filename extension when the MIME type is unknown", () => {
    const odd = new File(["x"], "weird.../..%2e%2e/payload.p h p", { type: "application/octet-stream" });
    expect(safeExtension(odd)).toMatch(/^[a-z0-9]{1,8}$/);
  });
});

describe("storeRecruitingApplication fail-closed proof handling", () => {
  afterEach(() => {
    resetRecruitingSupabaseForTests();
    vi.unstubAllEnvs();
    supabaseMock.uploadResult = { error: null };
    supabaseMock.insertResult = { error: null };
  });

  function configureSupabaseEnv() {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key");
    resetRecruitingSupabaseForTests();
  }

  const score = makeScore(80);

  it("fails closed when the only proof artifact is a file upload that fails", async () => {
    configureSupabaseEnv();
    supabaseMock.uploadResult = { error: { message: "network error" } };

    const proofFile = new File(["proof"], "proof.png", { type: "image/png" });
    const result = await storeRecruitingApplication(
      { ...payload, proofRecordingUrl: undefined, proofLinks: undefined },
      score,
      null,
      proofFile
    );

    expect(result.supabaseOk).toBe(false);
    expect(result.proof.uploaded).toBe(false);
    expect(result.error).toMatch(/proof/i);
  });

  it("still succeeds when proof file upload fails but a recording link is present", async () => {
    configureSupabaseEnv();
    supabaseMock.uploadResult = { error: { message: "network error" } };

    const proofFile = new File(["proof"], "proof.png", { type: "image/png" });
    const result = await storeRecruitingApplication(
      { ...payload, proofRecordingUrl: "https://www.loom.com/share/proof", proofLinks: undefined },
      score,
      null,
      proofFile
    );

    expect(result.supabaseOk).toBe(true);
    expect(result.proof.uploaded).toBe(false);
  });
});
