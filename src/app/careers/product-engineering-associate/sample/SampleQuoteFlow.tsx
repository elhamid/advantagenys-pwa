"use client";

import { useState } from "react";

/**
 * Sanitized recruiting exercise — NOT a client deliverable.
 *
 * This is a deliberately imperfect mini "local service quote flow" used to test
 * whether a candidate actually inspects a product surface on real devices.
 * The rough edges below are intentional and are part of the exercise. Do not
 * "fix" them: they are the thing being evaluated. They are never labelled as
 * issues in the candidate-facing UI.
 */

const SERVICES = [
  { id: "licensing", label: "Licensing help", blurb: "Permits, registrations, renewals." },
  { id: "bookkeeping", label: "Bookkeeping", blurb: "Monthly books and reconciliation." },
  { id: "payroll", label: "Payroll setup", blurb: "Onboarding and run cycles." },
  { id: "tax", label: "Tax filing", blurb: "Quarterly and annual filings." },
];

// Intentionally pre-filled, editable, and styled identically to optional fields.
const PREFILLED_REFERRAL = "JKH-2026";

export function SampleQuoteFlow() {
  const [service, setService] = useState<string>("licensing");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [referral, setReferral] = useState(PREFILLED_REFERRAL);
  const [proofLink, setProofLink] = useState(
    "https://drive.google.com/file/d/1aBcD3FgH4iJkL5mN6oP7qR8sT9uV0wX1yZ-sample-reference-attachment-export/view?usp=sharing"
  );
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // No phone validation on purpose — accepts anything, including letters.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--green)] text-lg font-black text-white" aria-hidden="true">
          OK
        </div>
        <h3 className="mt-4 text-2xl font-bold text-[var(--text)]">Request received</h3>
        {/* Intentional channel mismatch: scenario promised WhatsApp, this says email. */}
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          Thanks{name ? `, ${name}` : ""}. Our team will email you a quote shortly. Watch your
          inbox for next steps.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-5 inline-flex min-h-11 items-center bg-[var(--blue-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--blue-vibrant)]"
        >
          Start over
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:p-6"
    >
      <div className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
        Get a free quote
      </div>
      <h3 className="mt-1 text-xl font-bold text-[var(--text)]">Tell us what you need</h3>

      {/* A tall stack of service cards pushes the submit button below the fold on a
          phone, and the selected service is never echoed near the submit button. */}
      <fieldset className="mt-4">
        <legend className="text-sm font-semibold text-[var(--text)]">Choose a service</legend>
        <div className="mt-3 grid gap-3">
          {SERVICES.map((option) => {
            const active = service === option.id;
            return (
              <label
                key={option.id}
                className={`flex min-h-20 cursor-pointer flex-col justify-center border px-4 py-4 text-sm ${
                  active
                    ? "border-[var(--blue-accent)] bg-[var(--blue-bg)]"
                    : "border-[var(--border)] bg-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="sample-service"
                    value={option.id}
                    checked={active}
                    onChange={() => setService(option.id)}
                    className="h-4 w-4 accent-[var(--blue-accent)]"
                  />
                  <span className="font-bold text-[var(--text)]">{option.label}</span>
                </span>
                <span className="mt-2 pl-7 text-xs leading-5 text-[var(--text-secondary)]">
                  {option.blurb}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4">
        <label className="block text-sm font-semibold text-[var(--text)]">
          Your name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]"
          />
        </label>

        {/* No validation: this accepts letters/garbage and still submits. */}
        <label className="block text-sm font-semibold text-[var(--text)]">
          Phone number
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="We will follow up here"
            className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]"
          />
        </label>

        {/* Prefilled, editable, styled identically to optional fields. */}
        <label className="block text-sm font-semibold text-[var(--text)]">
          Referral code
          <input
            value={referral}
            onChange={(event) => setReferral(event.target.value)}
            className="mt-2 w-full border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]"
          />
        </label>

        {/* Long link with no wrapping rules: widens the form at desktop width. */}
        <label className="block text-sm font-semibold text-[var(--text)]">
          Reference link (optional)
          <input
            value={proofLink}
            onChange={(event) => setProofLink(event.target.value)}
            className="mt-2 w-full whitespace-nowrap border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--blue-accent)]"
          />
          <span className="mt-2 block whitespace-nowrap text-xs text-[var(--text-secondary)]">
            {proofLink}
          </span>
        </label>
      </div>

      <button
        type="submit"
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-[var(--blue-accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--blue-vibrant)] sm:w-auto"
      >
        Request my quote
      </button>
    </form>
  );
}
