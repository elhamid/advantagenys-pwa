"use client";

import { FormEvent, useState } from "react";
import { Container } from "@/components/ui/Container";
import type { RecruitingApplicationForReview } from "@/lib/careers/recruiting-review";

interface ReviewResponse {
  success: boolean;
  error?: string;
  scope?: "superadmin" | "jkh";
  applications?: RecruitingApplicationForReview[];
}

function fmtDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

// Score is now 0-100 from the deterministic qualification + defect-match rubric.
function scoreTone(score: number | null) {
  if (score === null) return "bg-slate-100 text-slate-700";
  if (score >= 70) return "bg-emerald-50 text-emerald-700";
  if (score >= 50) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

interface RubricBreakdown {
  defectsCaughtCount?: number;
  totalPlantedDefects?: number;
  qualified?: boolean;
  defectMatch?: { total?: number; keywordOnly?: string[] };
  signals?: { total?: number };
  gate?: { passed?: boolean; failures?: string[] };
}

function CandidateCard({ app }: { app: RecruitingApplicationForReview }) {
  const score = app.score === null ? null : Number(app.score);
  const candidate = app.candidate ?? {};
  const workSample = app.work_sample ?? {};
  const resume = app.resume ?? {};
  const proof = app.proof ?? {};
  const aiUse = app.ai_use ?? {};
  const breakdown = (app.score_breakdown ?? {}) as RubricBreakdown;
  const defectsCaught = breakdown.defectsCaughtCount ?? 0;
  const totalDefects = breakdown.totalPlantedDefects ?? 5;
  const qualified = breakdown.qualified === true;
  const defectPts = breakdown.defectMatch?.total;
  const signalPts = breakdown.signals?.total;
  const keywordOnlyCount = breakdown.defectMatch?.keywordOnly?.length ?? 0;
  const gateFailures = breakdown.gate?.failures ?? [];
  const resumeUrl = resume.signed_url ?? resume.url;
  const proofUrl = proof.signed_url ?? proof.recording_url ?? workSample.proof_recording_url ?? null;

  return (
    <article className="border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-[var(--text)]">{candidate.full_name ?? "Unnamed candidate"}</h2>
            <span className="border border-[var(--border)] bg-[var(--blue-bg)] px-2 py-1 text-xs font-bold text-[var(--deep-blue)]">
              {app.partner_tag}
            </span>
            <span className="border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--text-secondary)]">
              {app.status}
            </span>
          </div>
          <div className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            <span>{candidate.email}</span>
            <span className="mx-2 text-[var(--border)]">/</span>
            <span>{candidate.location}</span>
            <span className="mx-2 text-[var(--border)]">/</span>
            <span>{fmtDate(app.submitted_at)}</span>
          </div>
        </div>
        <div className={`min-w-28 px-3 py-2 text-center ${scoreTone(score)}`}>
          <div className="text-xs font-bold uppercase tracking-[0.08em]">{app.score_label ?? "unscored"}</div>
          <div className="mt-1 text-2xl font-black">{score === null ? "--" : score.toFixed(1)}</div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--text)]">{app.score_explanation}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`px-2 py-1 text-xs font-bold uppercase tracking-[0.06em] ${
            qualified ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {qualified ? "Qualified" : "Not qualified"}
        </span>
        <span className="border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs font-semibold text-[var(--text-secondary)]">
          Defects caught (with detail): {defectsCaught}/{totalDefects}
        </span>
        {keywordOnlyCount > 0 ? (
          <span className="bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
            Keyword-only mentions: {keywordOnlyCount} (no inspection detail)
          </span>
        ) : null}
        {typeof defectPts === "number" ? (
          <span className="border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs font-semibold text-[var(--text-secondary)]">
            Defect-match: {defectPts.toFixed(1)}/45
          </span>
        ) : null}
        {typeof signalPts === "number" ? (
          <span className="border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs font-semibold text-[var(--text-secondary)]">
            Signals: {signalPts.toFixed(1)}/55
          </span>
        ) : null}
        {gateFailures.length > 0 ? (
          <span className="bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
            Gate failed: {gateFailures.join(", ")}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">Work sample</h3>
          <p className="mt-2 line-clamp-4 text-sm leading-6 text-[var(--text-secondary)]">
            {workSample.issue_findings}
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--text)]">Fix first</p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{workSample.first_fix_reason}</p>
        </div>
        <div className="space-y-3">
          <div className="border border-[var(--border)] bg-[var(--bg)] p-3 text-sm">
            <div className="font-bold text-[var(--text)]">Resume</div>
            <div className="mt-2 break-all text-[var(--text-secondary)]">{resume.file_name ?? "No resume provided"}</div>
            <div className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
              {resume.uploaded ? "Storage linked" : resume.url ? "External link" : "Optional not provided"}
            </div>
            {resumeUrl ? (
              <a
                href={resumeUrl}
                className="mt-3 inline-flex min-h-9 items-center bg-[var(--blue-accent)] px-3 text-xs font-bold text-white"
                target="_blank"
                rel="noreferrer"
              >
                Open resume
              </a>
            ) : null}
          </div>

          <div className="border border-[var(--border)] bg-[var(--bg)] p-3 text-sm">
            <div className="font-bold text-[var(--text)]">Proof of inspection</div>
            <div className="mt-2 break-all text-[var(--text-secondary)]">
              {proof.file_name ?? (proofUrl ? "Recording link" : "No proof provided")}
            </div>
            <div className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
              {proof.uploaded ? "Storage linked" : proofUrl ? "External link" : "Missing"}
            </div>
            {proofUrl ? (
              <a
                href={proofUrl}
                className="mt-3 inline-flex min-h-9 items-center bg-[var(--blue-accent)] px-3 text-xs font-bold text-white"
                target="_blank"
                rel="noreferrer"
              >
                Open proof
              </a>
            ) : null}
            {app.verification_code ? (
              <div className="mt-3 text-xs text-[var(--text-muted)]">
                Code: <span className="font-bold text-[var(--text)]">{app.verification_code}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {aiUse.prompts ? (
        <div className="mt-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            AI prompts and self-correction
          </h3>
          <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">
            {aiUse.prompts}
          </p>
        </div>
      ) : null}
    </article>
  );
}

export function RecruitingReviewClient() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scope, setScope] = useState<"superadmin" | "jkh" | null>(null);
  const [applications, setApplications] = useState<RecruitingApplicationForReview[]>([]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/careers/product-engineering-associate/review", {
        headers: {
          "x-recruiting-review-token": token,
        },
      });
      const data = (await response.json()) as ReviewResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Review access failed.");
      }
      setApplications(data.applications ?? []);
      setScope(data.scope ?? null);
    } catch (loadError) {
      setScope(null);
      setApplications([]);
      setError(loadError instanceof Error ? loadError.message : "Review access failed.");
    } finally {
      setLoading(false);
    }
  }

  const average =
    applications.length === 0
      ? 0
      : applications.reduce((sum, app) => sum + Number(app.score ?? 0), 0) / applications.length;

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <Container className="py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                <span aria-hidden="true">Review</span>
                Internal beta recruiting funnel
              </div>
              <h1 className="mt-3 text-3xl font-bold text-[var(--text)]">
                Product Engineering Associate applicants
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Enter the internal review token to load candidate records. The token stays out of the URL.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[360px]">
              <label className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Review token
                <input
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  type="password"
                  autoComplete="off"
                  className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--blue-accent)]"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-11 items-center justify-center gap-2 bg-[var(--blue-accent)] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Loading" : "Unlock"}
                Load review
              </button>
            </form>
          </div>
          {error ? <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
        </Container>
      </section>

      {scope ? (
        <section className="border-b border-[var(--border)] bg-[var(--surface)]">
          <Container className="grid grid-cols-3 gap-2 py-4 text-center sm:max-w-xl">
            <div className="border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">Candidates</div>
              <div className="mt-1 text-2xl font-black text-[var(--text)]">{applications.length}</div>
            </div>
            <div className="border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">Avg score</div>
              <div className="mt-1 text-2xl font-black text-[var(--text)]">{average.toFixed(1)}</div>
            </div>
            <div className="border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">Scope</div>
              <div className="mt-1 text-2xl font-black uppercase text-[var(--text)]">{scope}</div>
            </div>
          </Container>
        </section>
      ) : null}

      <Container className="space-y-4 py-6">
        {scope && applications.length === 0 ? (
          <div className="border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-secondary)]">
            No applications are visible for this review scope.
          </div>
        ) : (
          applications.map((app) => <CandidateCard key={app.application_id} app={app} />)
        )}
      </Container>
    </main>
  );
}
