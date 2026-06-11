import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CareerApplicationPayload, CareerApplicationScore } from "./product-engineering-associate";

export const RECRUITING_TABLE = "recruiting_applications";
export const RECRUITING_RESUME_BUCKET = "recruiting-resumes";

export interface ResumeStorageRecord {
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

function resumePath(payload: CareerApplicationPayload, file: File): string {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  return `${payload.hiringLane}/${payload.partnerTag}/${payload.applicationId}/${safePathPart(payload.fullName)}-resume.${ext}`;
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
  resume: ResumeStorageRecord
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
    },
    ai_use: {
      disclosure: payload.aiUseDisclosure,
      notes: payload.aiUseNotes,
    },
    raw_payload: payload,
    submitted_at: payload.submittedAt,
  };
}

export async function storeRecruitingApplication(
  payload: CareerApplicationPayload,
  score: CareerApplicationScore,
  resumeFile: File | null
): Promise<RecruitingStorageResult> {
  const supabase = getRecruitingSupabase();
  if (!supabase) {
    return {
      supabaseOk: false,
      resume: { uploaded: false },
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

  try {
    const record = recruitingRecordFromPayload(payload, score, resume);
    const { error } = await supabase.from(RECRUITING_TABLE).insert(record);

    if (error) throw new Error(`Recruiting record insert failed: ${error.message}`);

    return { supabaseOk: true, resume };
  } catch (error) {
    return {
      supabaseOk: false,
      resume: { uploaded: false },
      error: error instanceof Error ? error.message : "Recruiting application could not be stored.",
    };
  }
}
