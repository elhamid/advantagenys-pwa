import { headers } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import {
  getRecruitingSupabase,
  RECRUITING_PROOF_BUCKET,
  RECRUITING_RESUME_BUCKET,
  RECRUITING_TABLE,
} from "./recruiting-storage";

export type RecruitingReviewScope = "superadmin" | "jkh";

export interface RecruitingApplicationForReview {
  application_id: string;
  submitted_at: string;
  role: string;
  hiring_lane: string;
  referral_code: string | null;
  partner_tag: string;
  status: string;
  score: number | null;
  score_label: string | null;
  score_explanation: string | null;
  // Structured deterministic rubric breakdown (gate / defectMatch / signals /
  // defectsCaught / qualified). Kept loose here; the review UI reads the fields
  // it renders defensively.
  score_breakdown: Record<string, unknown>;
  candidate: {
    full_name?: string;
    email?: string;
    whatsapp?: string;
    location?: string;
    linkedin?: string | null;
    portfolio?: string | null;
  };
  resume: {
    url?: string | null;
    file_name?: string | null;
    file_type?: string | null;
    file_size?: number | null;
    storage_path?: string | null;
    signed_url?: string | null;
    uploaded?: boolean;
  };
  proof?: {
    recording_url?: string | null;
    file_name?: string | null;
    file_type?: string | null;
    file_size?: number | null;
    storage_path?: string | null;
    signed_url?: string | null;
    uploaded?: boolean;
  };
  verification_code?: string | null;
  work_sample: {
    surfaces?: string[];
    experience_summary?: string;
    issue_findings?: string;
    top_issue_steps?: string;
    first_fix_reason?: string;
    small_improvement?: string;
    risky_question?: string;
    console_network_notes?: string;
    proof_links?: string | null;
    proof_recording_url?: string | null;
  };
  ai_use: {
    disclosure?: string;
    notes?: string;
    prompts?: string;
  };
}

export interface RecruitingAccess {
  allowed: boolean;
  scope?: RecruitingReviewScope;
  reason?: string;
}

function tokenMatches(candidate: string, expected: string | undefined): boolean {
  if (!expected) return false;
  const left = Buffer.from(candidate);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function resolveRecruitingAccess(token: string | null | undefined): RecruitingAccess {
  const normalized = token?.trim();
  if (!normalized) return { allowed: false, reason: "Review token required." };

  if (tokenMatches(normalized, process.env.RECRUITING_SUPERADMIN_TOKEN)) {
    return { allowed: true, scope: "superadmin" };
  }

  if (tokenMatches(normalized, process.env.RECRUITING_JKH_TOKEN)) {
    return { allowed: true, scope: "jkh" };
  }

  return { allowed: false, reason: "Review token is invalid." };
}

export async function resolveRecruitingAccessFromRequest(): Promise<RecruitingAccess> {
  const headerStore = await headers();
  return resolveRecruitingAccess(headerStore.get("x-recruiting-review-token"));
}

export async function listRecruitingApplications(
  access: RecruitingAccess
): Promise<RecruitingApplicationForReview[]> {
  if (!access.allowed || !access.scope) return [];

  const supabase = getRecruitingSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  let query = supabase
    .from(RECRUITING_TABLE)
    .select(
      "application_id,submitted_at,role,hiring_lane,referral_code,partner_tag,status,score,score_label,score_explanation,score_breakdown,candidate,resume,proof,verification_code,work_sample,ai_use"
    )
    .order("submitted_at", { ascending: false })
    .limit(50);

  if (access.scope === "jkh") {
    query = query.eq("partner_tag", "JKH");
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const applications = (data ?? []) as RecruitingApplicationForReview[];
  return Promise.all(
    applications.map(async (application) => {
      let next = application;

      const resumePath = application.resume?.storage_path;
      if (resumePath) {
        const { data: signedData, error: signedError } = await supabase.storage
          .from(RECRUITING_RESUME_BUCKET)
          .createSignedUrl(resumePath, 60 * 60);
        next = {
          ...next,
          resume: {
            ...next.resume,
            signed_url: signedError ? null : signedData.signedUrl,
          },
        };
      }

      const proofPath = application.proof?.storage_path;
      if (proofPath) {
        const { data: signedData, error: signedError } = await supabase.storage
          .from(RECRUITING_PROOF_BUCKET)
          .createSignedUrl(proofPath, 60 * 60);
        next = {
          ...next,
          proof: {
            ...next.proof,
            signed_url: signedError ? null : signedData.signedUrl,
          },
        };
      }

      return next;
    })
  );
}
