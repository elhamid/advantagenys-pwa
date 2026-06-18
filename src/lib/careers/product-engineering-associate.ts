export const CAREERS_ROLE_PATH = "/careers/product-engineering-associate";

export const CAREERS_ROLE_TITLE = "Junior Product Engineering Associate";

export const WORK_SAMPLE_URL = `${CAREERS_ROLE_PATH}/sample`;

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export const MAX_PROOF_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const ACCEPTED_PROOF_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const VERIFICATION_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const VERIFICATION_PLACEHOLDER = "PEA-OPEN";

/**
 * Deterministically derive a short, candidate-visible verification code from
 * the per-candidate ref token. Same ref always yields the same code, so the
 * sample page and the application form agree without any backend round-trip.
 */
export function deriveVerificationCode(ref: string | null | undefined): string {
  const normalized = (ref ?? "").trim().toLowerCase();
  if (!normalized) return VERIFICATION_PLACEHOLDER;

  let hash = 2166136261;
  for (let i = 0; i < normalized.length; i += 1) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  let value = hash >>> 0;
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += VERIFICATION_ALPHABET[value % VERIFICATION_ALPHABET.length];
    value = Math.floor(value / VERIFICATION_ALPHABET.length);
    if (value === 0) value = (hash >>> 0) + i + 1;
  }
  return `PEA-${code}`;
}

export type AiUseDisclosure = "yes" | "light" | "no";
export type EnteredCompensationCurrency = "INR" | "USD";

export interface CompensationExpectation {
  enteredCurrency: EnteredCompensationCurrency;
  inrMonthly?: number;
  usdMonthly?: number;
  usdInrRate?: number;
  rateDate?: string;
}

export interface CareerApplicationPayload {
  applicationId: string;
  submittedAt: string;
  role: typeof CAREERS_ROLE_TITLE;
  hiringLane: "junior_product_engineering_associate";
  referralCode?: string;
  partnerTag: "JKH";
  fullName: string;
  email: string;
  whatsapp: string;
  location: string;
  linkedin?: string;
  portfolio?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  resumeFileType?: string;
  resumeFileSize?: number;
  compensation?: CompensationExpectation;
  availability: string;
  experienceSummary: string;
  surfaces: string[];
  verificationCode?: string;
  issueFindings: string;
  topIssueSteps: string;
  firstFixReason: string;
  smallImprovement: string;
  riskyQuestion: string;
  consoleNetworkNotes: string;
  proofLinks?: string;
  proofRecordingUrl?: string;
  proofFileName?: string;
  proofFileType?: string;
  proofFileSize?: number;
  aiUseDisclosure: AiUseDisclosure;
  aiUseNotes: string;
  aiPrompts: string;
}

export interface CareerApplicationScore {
  total: number;
  label: string;
  explanation: string;
  breakdown: {
    workSampleDetail: number;
    reproductionClarity: number;
    prioritization: number;
    judgment: number;
    proofDiscipline: number;
    toolTransparency: number;
  };
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;

export function cleanText(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseMoney(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.round(parsed * 100) / 100;
}

export function convertUsdToInr(usd: number, rate: number): number {
  return Math.round(usd * rate);
}

export function convertInrToUsd(inr: number, rate: number): number {
  return Math.round((inr / rate) * 100) / 100;
}

export function validateResume(file: File | null): ValidationResult {
  if (!file || file.size === 0) return { valid: true };
  if (file.size > MAX_RESUME_BYTES) {
    return { valid: false, error: "Resume file must be 5 MB or smaller." };
  }
  if (!ACCEPTED_RESUME_TYPES.has(file.type)) {
    return {
      valid: false,
      error: "Resume must be a PDF, DOC, or DOCX file.",
    };
  }
  return { valid: true };
}

export function validateProof(file: File | null): ValidationResult {
  if (!file || file.size === 0) return { valid: true };
  if (file.size > MAX_PROOF_BYTES) {
    return { valid: false, error: "Proof file must be 10 MB or smaller." };
  }
  if (!ACCEPTED_PROOF_TYPES.has(file.type)) {
    return {
      valid: false,
      error: "Proof must be a PNG, JPG, WEBP, or PDF screenshot file.",
    };
  }
  return { valid: true };
}

export function validateApplicationPayload(payload: CareerApplicationPayload): ValidationResult {
  const required: Array<[string, string]> = [
    ["fullName", payload.fullName],
    ["email", payload.email],
    ["whatsapp", payload.whatsapp],
    ["location", payload.location],
    ["availability", payload.availability],
    ["experienceSummary", payload.experienceSummary],
    ["issueFindings", payload.issueFindings],
    ["topIssueSteps", payload.topIssueSteps],
    ["firstFixReason", payload.firstFixReason],
    ["smallImprovement", payload.smallImprovement],
    ["riskyQuestion", payload.riskyQuestion],
    ["consoleNetworkNotes", payload.consoleNetworkNotes],
    ["aiUseNotes", payload.aiUseNotes],
    ["aiPrompts", payload.aiPrompts],
  ];

  const missing = required.find(([, value]) => !value || value.trim().length < 2);
  if (missing) return { valid: false, error: `${missing[0]} is required.` };

  if (!EMAIL_RE.test(payload.email)) {
    return { valid: false, error: "A valid email address is required." };
  }

  if (payload.whatsapp.replace(/\D/g, "").length < 7) {
    return { valid: false, error: "A valid WhatsApp or phone number is required." };
  }

  if (payload.resumeUrl && !URL_RE.test(payload.resumeUrl)) {
    return { valid: false, error: "Resume link must start with http:// or https://." };
  }

  if (payload.linkedin && !URL_RE.test(payload.linkedin)) {
    return { valid: false, error: "LinkedIn must be a valid URL." };
  }

  if (payload.portfolio && !URL_RE.test(payload.portfolio)) {
    return { valid: false, error: "Portfolio/GitHub must be a valid URL." };
  }

  if (!["yes", "light", "no"].includes(payload.aiUseDisclosure)) {
    return { valid: false, error: "AI/tool usage disclosure is required." };
  }

  if (payload.surfaces.length === 0) {
    return { valid: false, error: "Select at least one product surface you can work with." };
  }

  // Verification-code gate removed: this is an open, shared application link.
  // Any candidate with the link can submit; each submission creates a new record.
  // The verificationCode field (if present) is recorded as informational only.

  if (payload.issueFindings.length < 80) {
    return {
      valid: false,
      error: "Issue findings should include enough detail to show your review.",
    };
  }

  if (payload.proofRecordingUrl && !URL_RE.test(payload.proofRecordingUrl)) {
    return { valid: false, error: "Proof recording link must start with http:// or https://." };
  }

  if (payload.proofLinks && !URL_RE.test(payload.proofLinks)) {
    return {
      valid: false,
      error: "Proof links must start with http:// or https://.",
    };
  }

  // A required proof artifact is satisfied ONLY by a validated recording/link URL
  // or a proof file upload — a raw, non-URL proofLinks string does NOT count.
  const hasProofArtifact =
    Boolean(payload.proofRecordingUrl) ||
    Boolean(payload.proofFileName) ||
    (Boolean(payload.proofLinks) && URL_RE.test(payload.proofLinks as string));
  if (!hasProofArtifact) {
    return {
      valid: false,
      error:
        "Proof of inspection is required. Upload an annotated screenshot or paste a screen-recording link (mobile + desktop).",
    };
  }

  return { valid: true };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value * 10) / 10));
}

function scoreTextLength(value: string, thresholds: [number, number, number]): number {
  const length = value.trim().length;
  if (length >= thresholds[2]) return 10;
  if (length >= thresholds[1]) return 7.5;
  if (length >= thresholds[0]) return 5;
  return 2.5;
}

function keywordBonus(value: string, keywords: string[]): number {
  const lower = value.toLowerCase();
  return keywords.reduce((score, keyword) => score + (lower.includes(keyword) ? 0.5 : 0), 0);
}

export function scoreCareerApplication(payload: CareerApplicationPayload): CareerApplicationScore {
  const workSampleDetail = clampScore(
    scoreTextLength(payload.issueFindings, [120, 240, 420]) +
      keywordBonus(payload.issueFindings, ["mobile", "desktop", "console", "network", "form", "cta"])
  );
  const reproductionClarity = clampScore(
    scoreTextLength(payload.topIssueSteps, [80, 150, 260]) +
      keywordBonus(payload.topIssueSteps, ["open", "click", "scroll", "submit", "expected", "actual"])
  );
  const prioritization = clampScore(
    scoreTextLength(payload.firstFixReason, [70, 140, 240]) +
      keywordBonus(payload.firstFixReason, ["because", "user", "risk", "conversion", "continue"])
  );
  const judgment = clampScore(
    (scoreTextLength(payload.riskyQuestion, [50, 100, 180]) +
      scoreTextLength(payload.smallImprovement, [50, 100, 180])) /
      2 +
      keywordBonus(`${payload.riskyQuestion} ${payload.smallImprovement}`, ["before", "safe", "small", "verify", "scope"])
  );
  const hasProofArtifact = Boolean(payload.proofFileName) || Boolean(payload.proofRecordingUrl);
  const proofDiscipline = clampScore(
    scoreTextLength(payload.consoleNetworkNotes, [45, 90, 160]) +
      (hasProofArtifact ? 2 : 0) +
      (payload.proofLinks ? 1 : 0) +
      (payload.surfaces.length >= 2 ? 1 : 0)
  );
  const toolTransparency = clampScore(
    (scoreTextLength(payload.aiUseNotes, [50, 100, 180]) +
      scoreTextLength(payload.aiPrompts, [40, 120, 240])) /
      2 +
      keywordBonus(payload.aiPrompts, ["prompt", "wrong", "corrected", "caught", "fixed", "verified"]) +
      (payload.aiUseDisclosure === "yes" || payload.aiUseDisclosure === "light" ? 0.5 : 0)
  );

  const total = clampScore(
    workSampleDetail * 0.24 +
      reproductionClarity * 0.18 +
      prioritization * 0.18 +
      judgment * 0.16 +
      proofDiscipline * 0.14 +
      toolTransparency * 0.1
  );

  const label = total >= 8.2 ? "strong" : total >= 6.8 ? "promising" : total >= 5.4 ? "needs review" : "weak";
  const explanation =
    total >= 8.2
      ? "Detailed product review with clear reproduction steps, practical prioritization, and reviewer-ready proof."
      : total >= 6.8
        ? "Promising application with enough detail for review; strongest candidates should show concrete proof and sharper prioritization."
        : total >= 5.4
          ? "Readable but needs manual review for detail, proof quality, or prioritization before advancing."
          : "Thin work sample. The reviewer should look for missing proof, vague reproduction steps, or weak risk judgment.";

  return {
    total,
    label,
    explanation,
    breakdown: {
      workSampleDetail,
      reproductionClarity,
      prioritization,
      judgment,
      proofDiscipline,
      toolTransparency,
    },
  };
}
