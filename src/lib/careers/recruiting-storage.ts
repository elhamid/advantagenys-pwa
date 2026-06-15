import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CareerApplicationPayload, CareerApplicationScore } from "./product-engineering-associate";

export const RECRUITING_TABLE = "recruiting_applications";
export const RECRUITING_RESUME_BUCKET = "recruiting-resumes";
export const RECRUITING_PROOF_BUCKET = "recruiting-proof";

export interface ResumeStorageRecord {
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  path?: string;
  uploaded: boolean;
  error?: string;
}

export interface ProofStorageRecord {
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  path?: string;
  uploaded: boolean;
  error?: string;
}

export interface RecruitingStorageResult {
  supabaseOk: boolean;
  resume: ResumeStorageRecord;
  proof: ProofStorageRecord;
  error?: string;
}

let cachedClient: SupabaseClient | null | undefined;

export function getRecruitingSupabase(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.TASKBOARD_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.TASKBOARD_SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    cachedClient = null;
    return null;
  }

  cachedClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return cachedClient;
}

export function resetRecruitingSupabaseForTests() {
  cachedClient = undefined;
}

function safePathPart(value: string): string {
  const safe = value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return safe.slice(0, 80) || "unknown";
}

// Map validated MIME types to a known-safe extension. The storage key must
// never reuse a raw, attacker-controlled filename extension.
const MIME_EXTENSION: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

// Derive the extension from the validated MIME type. If the MIME is unknown,
// fall back to a strictly sanitized extension from the filename (alphanumeric
// only, capped) so no odd/injected segments enter the storage key.
export function safeExtension(file: File): string {
  const fromMime = MIME_EXTENSION[file.type];
  if (fromMime) return fromMime;

  const rawExt = file.name.includes(".") ? file.name.split(".").pop() ?? "" : "";
  const sanitized = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  return sanitized || "bin";
}

function resumePath(payload: CareerApplicationPayload, file: File): string {
  const ext = safeExtension(file);
  return `${payload.hiringLane}/${payload.partnerTag}/${payload.applicationId}/${safePathPart(payload.fullName)}-resume.${ext}`;
}

function proofPath(payload: CareerApplicationPayload, file: File): string {
  const ext = safeExtension(file);
  return `${payload.hiringLane}/${payload.partnerTag}/${payload.applicationId}/${safePathPart(payload.fullName)}-proof.${ext}`;
}

async function uploadProof(
  supabase: SupabaseClient,
  payload: CareerApplicationPayload,
  proofFile: File | null
): Promise<ProofStorageRecord> {
  if (!proofFile || proofFile.size === 0) {
    return {
      uploaded: false,
      fileName: payload.proofFileName,
      fileType: payload.proofFileType,
      fileSize: payload.proofFileSize,
    };
  }

  const path = proofPath(payload, proofFile);
  const { error } = await supabase.storage.from(RECRUITING_PROOF_BUCKET).upload(path, proofFile, {
    contentType: proofFile.type,
    upsert: false,
  });

  if (error) throw new Error(`Proof upload failed: ${error.message}`);

  return {
    uploaded: true,
    fileName: proofFile.name,
    fileType: proofFile.type,
    fileSize: proofFile.size,
    path,
  };
}

async function uploadResume(
  supabase: SupabaseClient,
  payload: CareerApplicationPayload,
  resumeFile: File | null
): Promise<ResumeStorageRecord> {
  if (!resumeFile || resumeFile.size === 0) {
    return {
      uploaded: false,
      fileName: payload.resumeFileName,
      fileType: payload.resumeFileType,
      fileSize: payload.resumeFileSize,
    };
  }

  const path = resumePath(payload, resumeFile);
  const { error } = await supabase.storage.from(RECRUITING_RESUME_BUCKET).upload(path, resumeFile, {
    contentType: resumeFile.type,
    upsert: false,
  });

  if (error) throw new Error(`Resume upload failed: ${error.message}`);

  return {
    uploaded: true,
    fileName: resumeFile.name,
    fileType: resumeFile.type,
    fileSize: resumeFile.size,
    path,
  };
}

export function recruitingRecordFromPayload(
  payload: CareerApplicationPayload,
  score: CareerApplicationScore,
  resume: ResumeStorageRecord,
  proof: ProofStorageRecord
) {
  return {
    application_id: payload.applicationId,
    role: payload.role,
    hiring_lane: payload.hiringLane,
    referral_code: payload.referralCode ?? null,
    partner_tag: payload.partnerTag,
    status: "new",
    score: score.total,
    score_label: score.label,
    score_explanation: score.explanation,
    score_breakdown: score.breakdown,
    candidate: {
      full_name: payload.fullName,
      email: payload.email,
      whatsapp: payload.whatsapp,
      location: payload.location,
      linkedin: payload.linkedin ?? null,
      portfolio: payload.portfolio ?? null,
    },
    resume: {
      url: payload.resumeUrl ?? null,
      file_name: resume.fileName ?? payload.resumeFileName ?? null,
      file_type: resume.fileType ?? payload.resumeFileType ?? null,
      file_size: resume.fileSize ?? payload.resumeFileSize ?? null,
      storage_path: resume.path ?? null,
      signed_url: null,
      uploaded: resume.uploaded,
    },
    proof: {
      recording_url: payload.proofRecordingUrl ?? null,
      file_name: proof.fileName ?? payload.proofFileName ?? null,
      file_type: proof.fileType ?? payload.proofFileType ?? null,
      file_size: proof.fileSize ?? payload.proofFileSize ?? null,
      storage_path: proof.path ?? null,
      signed_url: null,
      uploaded: proof.uploaded,
    },
    verification_code: payload.verificationCode ?? null,
    compensation: payload.compensation,
    work_sample: {
      surfaces: payload.surfaces,
      experience_summary: payload.experienceSummary,
      issue_findings: payload.issueFindings,
      top_issue_steps: payload.topIssueSteps,
      first_fix_reason: payload.firstFixReason,
      small_improvement: payload.smallImprovement,
      risky_question: payload.riskyQuestion,
      console_network_notes: payload.consoleNetworkNotes,
      proof_links: payload.proofLinks ?? null,
      proof_recording_url: payload.proofRecordingUrl ?? null,
    },
    ai_use: {
      disclosure: payload.aiUseDisclosure,
      notes: payload.aiUseNotes,
      prompts: payload.aiPrompts,
    },
    raw_payload: payload,
    submitted_at: payload.submittedAt,
  };
}

export async function storeRecruitingApplication(
  payload: CareerApplicationPayload,
  score: CareerApplicationScore,
  resumeFile: File | null,
  proofFile: File | null = null
): Promise<RecruitingStorageResult> {
  const supabase = getRecruitingSupabase();
  if (!supabase) {
    return {
      supabaseOk: false,
      resume: { uploaded: false },
      proof: { uploaded: false },
      error: "Supabase is not configured.",
    };
  }

  let resume: ResumeStorageRecord;

  try {
    resume = await uploadResume(supabase, payload, resumeFile);
  } catch (error) {
    resume = {
      uploaded: false,
      fileName: payload.resumeFileName,
      fileType: payload.resumeFileType,
      fileSize: payload.resumeFileSize,
      error: error instanceof Error ? error.message : "Resume upload failed.",
    };
  }

  let proof: ProofStorageRecord;

  try {
    proof = await uploadProof(supabase, payload, proofFile);
  } catch (error) {
    proof = {
      uploaded: false,
      fileName: payload.proofFileName,
      fileType: payload.proofFileType,
      fileSize: payload.proofFileSize,
      error: error instanceof Error ? error.message : "Proof upload failed.",
    };
  }

  // Fail closed: if the candidate's only proof artifact is a file upload and
  // that upload failed, the submission must NOT succeed with lost/orphaned
  // proof. A validated recording/link URL is the only acceptable fallback.
  const hasUrlProofArtifact =
    Boolean(payload.proofRecordingUrl) || Boolean(payload.proofLinks);
  const proofFileProvided = Boolean(proofFile && proofFile.size > 0);
  if (proofFileProvided && !proof.uploaded && !hasUrlProofArtifact) {
    return {
      supabaseOk: false,
      resume,
      proof,
      error:
        proof.error ??
        "Proof file upload failed and no alternative proof link was provided.",
    };
  }

  try {
    const record = recruitingRecordFromPayload(payload, score, resume, proof);
    const { error } = await supabase.from(RECRUITING_TABLE).insert(record);

    if (error) throw new Error(`Recruiting record insert failed: ${error.message}`);

    return { supabaseOk: true, resume, proof };
  } catch (error) {
    return {
      supabaseOk: false,
      resume: { uploaded: false },
      proof: { uploaded: false },
      error: error instanceof Error ? error.message : "Recruiting application could not be stored.",
    };
  }
}
