"use client";

import { useRef, useState } from "react";
import {
  CAREERS_ROLE_TITLE,
  WORK_SAMPLE_URL,
} from "@/lib/careers/product-engineering-associate";

// Hidden anti-spam honeypot field name. Kept inline (not imported from the
// recruiting-antispam module) so this client component never pulls node:crypto
// into the browser bundle. Must match HONEYPOT_FIELD on the server. Name is
// deliberately non-semantic so browser autofill does not target it. On the
// server a filled value is a SOFT flag-for-review signal, never a hard reject.
const HONEYPOT_FIELD = "contact_ref_2";
const MAX_DIRECT_UPLOAD_BYTES = 3.5 * 1024 * 1024;

const surfaceOptions = [
  "Client-facing pages",
  "Forms",
  "Dashboards",
  "Internal tools",
  "Browser console/network checks",
  "Small frontend/content fixes",
];

function fileSizeLabel(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function oversizedUploadMessage(file: File, label: string): string | null {
  if (file.size <= MAX_DIRECT_UPLOAD_BYTES) return null;
  return `${label} is too large (${fileSizeLabel(file.size)}). Upload a file 3.5 MB or smaller, or use a link instead.`;
}

export function ProductEngineeringAssociateForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [resumeName, setResumeName] = useState("");
  const [proofName, setProofName] = useState("");
  const [proofRecordingUrl, setProofRecordingUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [applicationId, setApplicationId] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;

    const resumeInput = formRef.current.elements.namedItem("resume") as HTMLInputElement | null;
    const resumeUrlInput = formRef.current.elements.namedItem("resumeUrl") as HTMLInputElement | null;
    const hasResumeFile = Boolean(resumeInput?.files && resumeInput.files.length > 0);
    const hasResumeLink = Boolean(resumeUrlInput?.value && resumeUrlInput.value.trim().length > 0);
    if (!hasResumeFile && !hasResumeLink) {
      setError("A resume is required: upload a PDF/DOC/DOCX file or paste a resume link.");
      setStatus("error");
      return;
    }
    if (resumeInput?.files?.[0]) {
      const message = oversizedUploadMessage(resumeInput.files[0], "Resume file");
      if (message) {
        setError(message);
        setStatus("error");
        return;
      }
    }

    const proofInput = formRef.current.elements.namedItem("proofScreenshot") as HTMLInputElement | null;
    const hasProofFile = Boolean(proofInput?.files && proofInput.files.length > 0);
    if (!hasProofFile && proofRecordingUrl.trim().length === 0) {
      setError(
        "Add proof of inspection: upload an annotated screenshot (mobile + desktop) or paste a screen-recording link."
      );
      setStatus("error");
      return;
    }
    if (proofInput?.files?.[0]) {
      const message = oversizedUploadMessage(proofInput.files[0], "Proof file");
      if (message) {
        setError(message);
        setStatus("error");
        return;
      }
    }

    setStatus("submitting");
    setError("");

    const formData = new FormData(formRef.current);

    try {
      const response = await fetch("/api/careers/product-engineering-associate", {
        method: "POST",
        body: formData,
      });
      const responseText = await response.text();
      let data: { success?: boolean; error?: string; applicationId?: string } = {};
      try {
        data = responseText ? (JSON.parse(responseText) as { success?: boolean; error?: string; applicationId?: string }) : {};
      } catch {
        data = {};
      }
      if (!response.ok || !data.success) {
        if (response.status === 413) {
          throw new Error("The uploaded file is too large. Upload a file 3.5 MB or smaller, or use a link instead.");
        }
        throw new Error(data.error || responseText.trim().slice(0, 200) || "Application could not be submitted.");
      }
      setApplicationId(data.applicationId ?? "");
      setStatus("success");
      formRef.current.reset();
      setResumeName("");
      setProofName("");
      setProofRecordingUrl("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Application could not be submitted.");
      setStatus("error");
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-md)] sm:p-6 lg:p-8"
    >
      {status === "success" ? (
        <div className="flex min-h-[420px] flex-col justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--green)] text-lg font-black text-white" aria-hidden="true">
            OK
          </div>
          <h2 className="mt-5 text-2xl font-bold text-[var(--text)]">Application received</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            We recorded your application for {CAREERS_ROLE_TITLE}. Selected candidates may receive
            a follow-up review or interview request from the Advantage team.
          </p>
          <p className="mt-5 text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Application ID: {applicationId}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Honeypot: hidden from humans and assistive tech, off-screen, not
              tabbable, with a non-semantic name + autoComplete="new-password" so
              browser autofill / password managers skip it. A filled value is a
              SOFT flag-for-review signal on the server, NEVER a hard reject, so a
              legit candidate is never blocked even if their browser fills it.
              The shared ?ref= link's normal candidate never sees this field. */}
          <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden" style={{ position: "absolute", left: "-9999px" }}>
            <input
              type="text"
              name={HONEYPOT_FIELD}
              tabIndex={-1}
              autoComplete="new-password"
              aria-hidden="true"
            />
          </div>

          <section>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-[var(--text)]">Candidate details</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Keep this practical. Resume plus proof from the work sample matter more than long cover letters.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-[var(--text)]">
                Full name
                <input name="fullName" required className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                Email
                <input name="email" type="email" required className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                WhatsApp or phone
                <input name="whatsapp" required className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                City and country
                <input name="location" required placeholder="Bengaluru, India" className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                Availability
                <input name="availability" required placeholder="Immediate, 2 weeks, after notice period" className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)] sm:col-span-2">
                LinkedIn
                <input name="linkedin" type="url" placeholder="https://linkedin.com/in/..." className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)] sm:col-span-2">
                GitHub, portfolio, or work link
                <input name="portfolio" type="url" placeholder="https://..." className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text)]">Resume</h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="flex min-h-32 cursor-pointer flex-col justify-center border border-dashed border-[var(--border)] bg-[var(--bg)] px-4 py-5 text-sm font-semibold text-[var(--text)] hover:border-[var(--blue-accent)]">
                <span className="flex items-center gap-2">
                  <span className="text-[var(--blue-accent)]" aria-hidden="true">Upload</span>
                  Resume file
                </span>
                <span className="mt-2 text-xs font-normal text-[var(--text-secondary)]">
                  Required (file or link below). PDF, DOC, or DOCX. Max 3.5 MB.
                </span>
                <span className="mt-3 text-xs text-[var(--text-muted)]">{resumeName || "No file selected"}</span>
                <input
                  name="resume"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="sr-only"
                  onChange={(event) => setResumeName(event.currentTarget.files?.[0]?.name ?? "")}
                />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                Resume link
                <input name="resumeUrl" type="url" placeholder="https://drive.google.com/..." className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
                <span className="mt-2 block text-xs font-normal text-[var(--text-secondary)]">
                  Use this instead of a file if upload is inconvenient. A resume file or link is required.
                </span>
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text)]">Product work sample</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Open the sanitized exercise at <a href={WORK_SAMPLE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--blue-accent)] underline-offset-4 hover:underline">{WORK_SAMPLE_URL}</a> and run the mini flow on both a phone and a desktop. Complete a submission and read every screen carefully. We are not telling you how many issues exist.
            </p>

            <label className="mt-5 block text-sm font-semibold text-[var(--text)]">
              Experience summary
              <textarea name="experienceSummary" required rows={4} className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
            </label>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold text-[var(--text)]">Product surfaces you can work with</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {surfaceOptions.map((option) => (
                  <label key={option} className="flex min-h-11 items-center gap-3 border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-secondary)]">
                    <input name="surfaces" type="checkbox" value={option} className="h-4 w-4 accent-[var(--blue-accent)]" />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-5 grid gap-4">
              <label className="block text-sm font-semibold text-[var(--text)]">
                Inspect the flow on a phone and on a desktop. List every issue you find. (We are not telling you how many.)
                <textarea name="issueFindings" required rows={6} className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                Pick the issue that matters most to someone trying to get a quote. Write exact reproduction steps: device, what you tapped, what you expected, what actually happened.
                <textarea name="topIssueSteps" required rows={5} className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                This flow drives most of our inbound leads. Which issue would you fix FIRST, and what would you deliberately NOT touch yet — and why?
                <textarea name="firstFixReason" required rows={4} className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                Name one small, safe improvement you could ship without asking anyone.
                <textarea name="smallImprovement" required rows={3} className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                Name one change you would NOT make without checking first, and the exact question you would ask before doing it.
                <textarea name="riskyQuestion" required rows={3} className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                Browser console or network errors noticed
                <textarea name="consoleNetworkNotes" required rows={3} className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text)]">Proof of inspection</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Required. Provide at least one artifact: annotated screenshots covering mobile and
              desktop, or a short screen recording. The role is testing flows with proof, so proof is part of the bar.
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="flex min-h-32 cursor-pointer flex-col justify-center border border-dashed border-[var(--border)] bg-[var(--bg)] px-4 py-5 text-sm font-semibold text-[var(--text)] hover:border-[var(--blue-accent)]">
                <span className="flex items-center gap-2">
                  <span className="text-[var(--blue-accent)]" aria-hidden="true">Upload</span>
                  Annotated screenshots (mobile + desktop)
                </span>
                <span className="mt-2 text-xs font-normal text-[var(--text-secondary)]">
                  PNG, JPG, WEBP, or PDF. Max 3.5 MB.
                </span>
                <span className="mt-3 text-xs text-[var(--text-muted)]">{proofName || "No file selected"}</span>
                <input
                  name="proofScreenshot"
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
                  className="sr-only"
                  onChange={(event) => setProofName(event.currentTarget.files?.[0]?.name ?? "")}
                />
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                Or a screen recording link
                <input
                  name="proofRecordingUrl"
                  type="url"
                  value={proofRecordingUrl}
                  onChange={(event) => setProofRecordingUrl(event.target.value)}
                  placeholder="https://www.loom.com/share/... or Drive link"
                  className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]"
                />
                <span className="mt-2 block text-xs font-normal text-[var(--text-secondary)]">
                  Loom, Drive, Dropbox, or similar. At least one artifact (file or link) is required.
                </span>
              </label>
            </div>
            <label className="mt-4 block text-sm font-semibold text-[var(--text)]">
              Additional proof links (optional)
              <textarea name="proofLinks" rows={2} placeholder="Any extra screenshot or recording links." className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
            </label>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text)]">AI/tool usage</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              AI is allowed — proof still matters. Showing what your tools got wrong, and how you caught it, is a positive signal.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
              <label className="block text-sm font-semibold text-[var(--text)]">
                Did you use AI/tools?
                <select name="aiUseDisclosure" required className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]">
                  <option value="yes">Yes</option>
                  <option value="light">Lightly</option>
                  <option value="no">No</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-[var(--text)]">
                What did you use, and what did you verify yourself?
                <textarea name="aiUseNotes" required rows={4} className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
              </label>
            </div>
            <label className="mt-4 block text-sm font-semibold text-[var(--text)]">
              Paste the actual AI prompt(s) you used for this exercise, and describe one thing the AI got wrong that you caught and corrected.
              <textarea name="aiPrompts" required rows={5} placeholder="Paste your prompt(s), then explain the mistake you caught and how you fixed it." className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]" />
            </label>
          </section>

          {status === "error" && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[var(--blue-accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--blue-vibrant)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {status === "submitting" ? (
              "Submitting"
            ) : (
              "Submit application"
            )}
          </button>
        </div>
      )}
    </form>
  );
}
