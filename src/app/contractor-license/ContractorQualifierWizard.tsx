"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUtmParams } from "@/hooks/useUtmParams";
import Link from "next/link";

/* ──────────────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────────────── */

interface Answers {
  workLocation: string;
  scopeOfWork: string;
  entityStatus: string;
  experience: string;
  certifications: string[];
  timeline: string;
  // Contact (step 7)
  fullName: string;
  phone: string;
  email: string;
  preferredLanguage: string;
}

const INITIAL_ANSWERS: Answers = {
  workLocation: "",
  scopeOfWork: "",
  entityStatus: "",
  experience: "",
  certifications: [],
  timeline: "",
  fullName: "",
  phone: "",
  email: "",
  preferredLanguage: "en",
};

const STORAGE_KEY = "contractor-qualifier-answers";

/* ──────────────────────────────────────────────────────────────────────────────
   Verdict logic
   ──────────────────────────────────────────────────────────────────────────── */

type Verdict = "ready" | "almost" | "not-yet";

function computeVerdict(a: Answers): Verdict {
  const hasEntity = a.entityStatus !== "" && a.entityStatus !== "none";
  const gcPath = a.scopeOfWork === "gc" || a.scopeOfWork === "both";
  const hasExperience =
    gcPath ? a.experience === "5+" : a.experience !== "" && a.experience !== "<1";
  const hasCerts = a.certifications.includes("insurance");
  const hasTimeline = a.timeline === "waiting" || a.timeline === "30days";

  const missingCount = [
    !hasEntity,
    !hasExperience,
    !hasCerts,
    !hasTimeline,
  ].filter(Boolean).length;

  if (missingCount === 0) return "ready";
  if (missingCount <= 2) return "almost";
  return "not-yet";
}

/* ──────────────────────────────────────────────────────────────────────────────
   Step definitions
   ──────────────────────────────────────────────────────────────────────────── */

const TOTAL_STEPS = 7; // steps 0–6 (0-indexed), step 7 = verdict

/* ──────────────────────────────────────────────────────────────────────────────
   Motion variants
   ──────────────────────────────────────────────────────────────────────────── */

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -48 : 48,
    opacity: 0,
  }),
};

const transition = { duration: 0.24, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

/* ──────────────────────────────────────────────────────────────────────────────
   Sub-components
   ──────────────────────────────────────────────────────────────────────────── */

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-[var(--radius-lg)] border-2 transition-all duration-[var(--transition)] font-medium text-sm active:scale-[0.98] ${
        selected
          ? "border-[var(--blue-accent)] bg-[var(--blue-pale)] text-[var(--blue-accent)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--blue-soft)]"
      }`}
    >
      {children}
    </button>
  );
}

function MultiOptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-[var(--radius-lg)] border-2 transition-all duration-[var(--transition)] font-medium text-sm active:scale-[0.98] flex items-center gap-3 ${
        selected
          ? "border-[var(--blue-accent)] bg-[var(--blue-pale)] text-[var(--blue-accent)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--blue-soft)]"
      }`}
    >
      <span
        className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center ${
          selected ? "border-[var(--blue-accent)] bg-[var(--blue-accent)]" : "border-[var(--border)]"
        }`}
      >
        {selected && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
            <path d="M2 6l3 3 5-5" />
          </svg>
        )}
      </span>
      {children}
    </button>
  );
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-[var(--text)]">
        {label} {required && <span className="text-[var(--red)]">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-sm outline-none focus:border-[var(--blue-accent)] focus:ring-2 focus:ring-[var(--blue-accent)]/20 transition-colors placeholder:text-[var(--text-muted)]"
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   Main Wizard
   ──────────────────────────────────────────────────────────────────────────── */

export function ContractorQualifierWizard() {
  const utm = useUtmParams();

  const [answers, setAnswers] = useState<Answers>(() => {
    if (typeof sessionStorage === "undefined") return INITIAL_ANSWERS;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Answers) : INITIAL_ANSWERS;
    } catch {
      return INITIAL_ANSWERS;
    }
  });

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Answers, string>>>({});
  const topRef = useRef<HTMLDivElement>(null);

  // Persist to sessionStorage on change
  useEffect(() => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    }
  }, [answers]);

  const update = useCallback(<K extends keyof Answers>(field: K, value: Answers[K]) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const toggleCert = useCallback((cert: string) => {
    setAnswers((prev) => {
      const certs = prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert];
      return { ...prev, certifications: certs };
    });
  }, []);

  function goNext() {
    setDirection(1);
    setStep((s) => s + 1);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit() {
    const errors: Partial<Record<keyof Answers, string>> = {};
    if (!answers.fullName.trim()) errors.fullName = "Name is required";
    if (!answers.phone.trim()) errors.phone = "Phone is required";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const v = computeVerdict(answers);
    setVerdict(v);

    const payload = {
      type: "contractor-qualifier",
      source: "contractor-qualifier",
      fullName: answers.fullName,
      phone: answers.phone,
      email: answers.email || undefined,
      workLocation: answers.workLocation,
      scopeOfWork: answers.scopeOfWork,
      entityStatus: answers.entityStatus,
      experience: answers.experience,
      certifications: answers.certifications,
      timeline: answers.timeline,
      verdict: v,
      preferredLanguage: answers.preferredLanguage,
      utm,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        console.warn("[ContractorQualifier] API returned error:", json.error);
      }
    } catch (err) {
      console.error("[ContractorQualifier] Submit error:", err);
    }

    // Clear session storage after submit
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }

    setSubmitting(false);
    setDirection(1);
    setStep(TOTAL_STEPS); // verdict screen
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const progress = step < TOTAL_STEPS ? Math.round((step / TOTAL_STEPS) * 100) : 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--blue-bg)] to-[var(--bg)] py-16 px-4">
      <div ref={topRef} className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[var(--blue-pale)] text-[var(--blue-accent)] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            ~2 minutes
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-2">
            Contractor License Qualifier
          </h1>
          <p className="text-[var(--text-secondary)] text-sm max-w-sm mx-auto">
            Answer 7 quick questions to see if you&apos;re ready for a NYC HIC or GC license.
          </p>
        </div>

        {/* Progress bar */}
        {step < TOTAL_STEPS && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1.5">
              <span>Step {step + 1} of {TOTAL_STEPS}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--blue-accent)" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Step content */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              {step === 0 && (
                <StepCard title="Where will you work?">
                  <div className="space-y-3">
                    {[
                      { value: "nyc", label: "NYC 5 Boroughs" },
                      { value: "nassau", label: "Nassau County" },
                      { value: "suffolk", label: "Suffolk County" },
                      { value: "westchester", label: "Westchester" },
                      { value: "nj", label: "New Jersey" },
                      { value: "multiple", label: "Multiple jurisdictions" },
                    ].map((opt) => (
                      <OptionButton
                        key={opt.value}
                        selected={answers.workLocation === opt.value}
                        onClick={() => { update("workLocation", opt.value); goNext(); }}
                      >
                        {opt.label}
                      </OptionButton>
                    ))}
                  </div>
                </StepCard>
              )}

              {step === 1 && (
                <StepCard title="What's your scope of work?">
                  <div className="space-y-3">
                    {[
                      { value: "hic", label: "Residential repair / remodel (HIC path)" },
                      { value: "gc", label: "New construction or structural (GC path)" },
                      { value: "both", label: "Both" },
                    ].map((opt) => (
                      <OptionButton
                        key={opt.value}
                        selected={answers.scopeOfWork === opt.value}
                        onClick={() => { update("scopeOfWork", opt.value); goNext(); }}
                      >
                        {opt.label}
                      </OptionButton>
                    ))}
                  </div>
                </StepCard>
              )}

              {step === 2 && (
                <StepCard title="What's your business entity status?">
                  {answers.entityStatus === "none" ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-[var(--radius-lg)] bg-amber-50 border border-amber-200 text-sm text-amber-800">
                        <strong>No entity yet?</strong> Most contractor licenses require a registered
                        business. We can form your LLC or Corporation quickly and bundle it with your
                        license application.
                        <div className="mt-3">
                          <Link
                            href="/services/business-formation"
                            className="inline-flex items-center gap-1 text-[var(--blue-accent)] font-semibold hover:underline"
                          >
                            Learn about business formation &rarr;
                          </Link>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={goNext}
                        className="w-full px-5 py-3 rounded-[var(--radius-lg)] border-2 border-[var(--blue-accent)] text-[var(--blue-accent)] font-semibold text-sm hover:bg-[var(--blue-pale)] transition-all"
                      >
                        Continue anyway
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[
                        { value: "none", label: "No entity yet" },
                        { value: "sole-prop", label: "Sole proprietorship" },
                        { value: "llc", label: "LLC" },
                        { value: "corp", label: "Corporation" },
                      ].map((opt) => (
                        <OptionButton
                          key={opt.value}
                          selected={answers.entityStatus === opt.value}
                          onClick={() => {
                            update("entityStatus", opt.value);
                            if (opt.value !== "none") goNext();
                          }}
                        >
                          {opt.label}
                        </OptionButton>
                      ))}
                    </div>
                  )}
                </StepCard>
              )}

              {step === 3 && (
                <StepCard title="How many years of trade experience do you have?">
                  <div className="space-y-3">
                    {[
                      { value: "<1", label: "Less than 1 year" },
                      { value: "1-4", label: "1–4 years" },
                      { value: "5+", label: "5 or more years" },
                    ].map((opt) => (
                      <OptionButton
                        key={opt.value}
                        selected={answers.experience === opt.value}
                        onClick={() => { update("experience", opt.value); goNext(); }}
                      >
                        {opt.label}
                        {(answers.scopeOfWork === "gc" || answers.scopeOfWork === "both") && opt.value !== "5+" && (
                          <span className="ml-2 text-xs text-[var(--amber)] font-normal">
                            (GC path requires 5+)
                          </span>
                        )}
                      </OptionButton>
                    ))}
                  </div>
                </StepCard>
              )}

              {step === 4 && (
                <StepCard title="What certifications do you have?" subtitle="Select all that apply">
                  <div className="space-y-3">
                    {[
                      { value: "epa-rrp", label: "EPA RRP Certification (lead paint)" },
                      { value: "epa-lead", label: "EPA Lead Certification" },
                      { value: "insurance", label: "General liability insurance" },
                      { value: "none", label: "None of the above" },
                    ].map((opt) => (
                      <MultiOptionButton
                        key={opt.value}
                        selected={answers.certifications.includes(opt.value)}
                        onClick={() => toggleCert(opt.value)}
                      >
                        {opt.label}
                      </MultiOptionButton>
                    ))}
                  </div>
                  <NavButton
                    disabled={answers.certifications.length === 0}
                    onClick={goNext}
                  >
                    Continue
                  </NavButton>
                </StepCard>
              )}

              {step === 5 && (
                <StepCard title="What's your timeline?">
                  <div className="space-y-3">
                    {[
                      { value: "waiting", label: "I have a job waiting — need license ASAP" },
                      { value: "30days", label: "Next 30 days" },
                      { value: "exploring", label: "Just exploring for now" },
                    ].map((opt) => (
                      <OptionButton
                        key={opt.value}
                        selected={answers.timeline === opt.value}
                        onClick={() => { update("timeline", opt.value); goNext(); }}
                      >
                        {opt.label}
                      </OptionButton>
                    ))}
                  </div>
                </StepCard>
              )}

              {step === 6 && (
                <StepCard title="Last step — how can we reach you?">
                  <div className="space-y-4">
                    <InputField
                      label="Full name"
                      value={answers.fullName}
                      onChange={(v) => update("fullName", v)}
                      placeholder="Your name"
                      required
                    />
                    {formErrors.fullName && (
                      <p className="text-xs text-[var(--red)] -mt-2">{formErrors.fullName}</p>
                    )}
                    <InputField
                      label="Phone"
                      type="tel"
                      value={answers.phone}
                      onChange={(v) => update("phone", v)}
                      placeholder="(929) 000-0000"
                      required
                    />
                    {formErrors.phone && (
                      <p className="text-xs text-[var(--red)] -mt-2">{formErrors.phone}</p>
                    )}
                    <InputField
                      label="Email (optional)"
                      type="email"
                      value={answers.email}
                      onChange={(v) => update("email", v)}
                      placeholder="you@example.com"
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[var(--text)]">
                        Preferred language
                      </label>
                      <div className="flex gap-3">
                        {[
                          { value: "en", label: "English" },
                          { value: "es", label: "Español" },
                        ].map((lang) => (
                          <button
                            key={lang.value}
                            type="button"
                            onClick={() => update("preferredLanguage", lang.value)}
                            className={`flex-1 py-2.5 rounded-[var(--radius)] border-2 text-sm font-medium transition-all ${
                              answers.preferredLanguage === lang.value
                                ? "border-[var(--blue-accent)] bg-[var(--blue-pale)] text-[var(--blue-accent)]"
                                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--blue-soft)]"
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {submitError && (
                      <p className="text-xs text-[var(--red)]">{submitError}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full py-4 rounded-[var(--radius-lg)] text-white font-semibold text-base transition-all active:scale-[0.98] disabled:opacity-60"
                      style={{ background: "var(--blue-accent)" }}
                    >
                      {submitting ? "Checking eligibility…" : "See my results"}
                    </button>
                    <p className="text-xs text-[var(--text-muted)] text-center">
                      We&apos;ll follow up with a personalized plan. No spam, ever.
                    </p>
                  </div>
                </StepCard>
              )}

              {step === TOTAL_STEPS && verdict && (
                <VerdictScreen verdict={verdict} answers={answers} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Back button */}
        {step > 0 && step < TOTAL_STEPS && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={goBack}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors inline-flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   Step card wrapper
   ──────────────────────────────────────────────────────────────────────────── */

function StepCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] shadow-[var(--shadow-md)] p-6 sm:p-8">
      <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-[var(--text-muted)] mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}

function NavButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-4 w-full py-3.5 rounded-[var(--radius-lg)] text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40"
      style={{ background: "var(--blue-accent)" }}
    >
      {children}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   Verdict screen
   ──────────────────────────────────────────────────────────────────────────── */

function VerdictScreen({ verdict, answers }: { verdict: Verdict; answers: Answers }) {
  const gcPath = answers.scopeOfWork === "gc" || answers.scopeOfWork === "both";

  const configs = {
    ready: {
      accent: "#16A34A",
      bg: "#F0FDF4",
      border: "#86EFAC",
      icon: "✓",
      label: "Ready to file",
      headline: "You're eligible. Let's get your license filed.",
      body: `Based on your answers, you meet the key requirements for a NYC ${gcPath ? "General Contractor" : "Home Improvement Contractor"} license. Our team can start your application right away.`,
      cta: "Book your consultation",
      ctaHref: "/contact",
      secondary: null,
    },
    almost: {
      accent: "#D97706",
      bg: "#FFFBEB",
      border: "#FCD34D",
      icon: "~",
      label: "Almost there",
      headline: "A few gaps to close first.",
      body: "You're close — you have most requirements covered. Here's what to address before filing:",
      cta: "Talk to a licensing specialist",
      ctaHref: "/contact",
      secondary: null,
    },
    "not-yet": {
      accent: "#64748B",
      bg: "#F8FAFC",
      border: "#CBD5E1",
      icon: "○",
      label: "Not yet eligible",
      headline: "Not quite ready — but we can get you there.",
      body: "You need a few foundations in place before applying. Save this page and come back once you've addressed the checklist below.",
      cta: "Start your business entity",
      ctaHref: "/services/business-formation",
      secondary: "Learn more about licensing",
    },
  };

  const cfg = configs[verdict];

  // Build gap checklist for almost / not-yet
  const gaps: string[] = [];
  if (answers.entityStatus === "none" || !answers.entityStatus) {
    gaps.push("Form a business entity (LLC or Corporation) — required for most licenses");
  }
  const gcPathCheck = answers.scopeOfWork === "gc" || answers.scopeOfWork === "both";
  if (gcPathCheck && answers.experience !== "5+") {
    gaps.push("GC path requires 5+ years of documented experience");
  }
  if (!gcPathCheck && answers.experience === "<1") {
    gaps.push("HIC path requires at least 1 year of trade experience");
  }
  if (!answers.certifications.includes("insurance")) {
    gaps.push("Obtain general liability insurance — required by NYC DCA");
  }
  if (answers.certifications.length === 0 || answers.certifications[0] === "none") {
    gaps.push("Consider EPA RRP certification if working in pre-1978 buildings");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Verdict badge */}
      <div
        className="rounded-[var(--radius-xl)] p-6 sm:p-8 mb-4 border-2"
        style={{ background: cfg.bg, borderColor: cfg.border }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ background: cfg.accent }}
          >
            {cfg.icon}
          </span>
          <span
            className="text-sm font-bold px-3 py-1 rounded-full"
            style={{ color: cfg.accent, background: cfg.bg }}
          >
            {cfg.label}
          </span>
        </div>
        <h2 className="text-xl font-bold text-[var(--text)] mb-2">{cfg.headline}</h2>
        <p className="text-sm text-[var(--text-secondary)]">{cfg.body}</p>

        {verdict !== "ready" && gaps.length > 0 && (
          <ul className="mt-4 space-y-2">
            {gaps.map((gap, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="mt-0.5 text-[var(--amber)]">&#9650;</span>
                {gap}
              </li>
            ))}
          </ul>
        )}

        {verdict === "ready" && (
          <div className="mt-4 p-3 rounded-[var(--radius)] bg-white/60 text-sm">
            <p className="font-semibold text-[var(--text)] mb-1">What to expect:</p>
            <ul className="space-y-1 text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Initial consultation to review your documents
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Application filing with NYC DCA
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Insurance coordination (if needed)
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* CTAs */}
      <a
        href={cfg.ctaHref}
        className="block w-full text-center py-4 rounded-[var(--radius-lg)] text-white font-semibold text-base transition-all active:scale-[0.98] mb-3"
        style={{ background: "var(--blue-accent)" }}
      >
        {cfg.cta}
      </a>
      {cfg.secondary && (
        <Link
          href="/services/licensing"
          className="block w-full text-center py-3.5 rounded-[var(--radius-lg)] border-2 border-[var(--border)] text-[var(--text-secondary)] font-semibold text-sm hover:border-[var(--blue-accent)] hover:text-[var(--blue-accent)] transition-all"
        >
          {cfg.secondary}
        </Link>
      )}

      <p className="text-xs text-center text-[var(--text-muted)] mt-4">
        A specialist will follow up at {answers.phone}.{" "}
        {answers.preferredLanguage === "es" ? "Hablamos español." : "We speak English and Spanish."}
      </p>
    </motion.div>
  );
}
