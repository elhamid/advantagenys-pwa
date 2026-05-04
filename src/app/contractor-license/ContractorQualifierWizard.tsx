"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
   Jurisdiction data (verified against official NYC/county government sources)
   ──────────────────────────────────────────────────────────────────────────── */

type JurisdictionKey = "nyc" | "nassau" | "suffolk" | "westchester" | "rockland" | "putnam" | "multiple";

interface JurisdictionInfo {
  label: string;
  hicAgency: string;
  hasGC: boolean;
  hicExperienceYears: number;
  hicExperienceProof: string;
  hicExam: boolean;
  hicExamDetail: string;
  /** GL insurance requirement (empty = not required by licensing body) */
  hicGLInsurance: string;
  hicFee: string;
  hicExtras: string[];
}

const JURISDICTIONS: Record<Exclude<JurisdictionKey, "multiple">, JurisdictionInfo> = {
  nyc: {
    label: "NYC (All 5 Boroughs)",
    hicAgency: "NYC Dept. of Consumer & Worker Protection (DCWP)",
    hasGC: true,
    hicExperienceYears: 0,
    hicExperienceProof: "",
    hicExam: true,
    hicExamDetail: "30 questions, 70% to pass, $50 exam fee",
    hicGLInsurance: "",
    hicFee: "$100 application fee (2-year license)",
    hicExtras: [
      "NYS Sales Tax ID (Certificate of Authority) — mandatory",
      "Workers’ Compensation insurance (or exemption certificate if no employees) — mandatory",
      "Surety bond ($20,000 naming DCWP) OR DCWP Trust Fund enrollment ($200) — mandatory",
      "Fingerprinting via IdentoGO for all owners with 10%+ ownership — mandatory",
      "EPA RRP certification — required if working on pre-1978 buildings (or signed affirmation it’s not needed)",
      "Business certificate or entity registration with New York State — required",
    ],
  },
  nassau: {
    label: "Nassau County",
    hicAgency: "Nassau County Office of Consumer Affairs",
    hasGC: false,
    hicExperienceYears: 5,
    hicExperienceProof: "W-2s or 1099s from construction work required as proof",
    hicExam: false,
    hicExamDetail: "",
    hicGLInsurance: "$250K/$500K bodily injury, $100K property damage — required",
    hicFee: "$650/2yr + $50 restitution fund",
    hicExtras: [
      "Workers’ Compensation insurance — mandatory",
    ],
  },
  suffolk: {
    label: "Suffolk County",
    hicAgency: "Suffolk County Dept. of Consumer Affairs",
    hasGC: false,
    hicExperienceYears: 0,
    hicExperienceProof: "",
    hicExam: true,
    hicExamDetail: "25-question written exam",
    hicGLInsurance: "$500K combined single limit — required",
    hicFee: "$200 application + $200 trust fund",
    hicExtras: [
      "Surety bond up to $100,000",
      "Workers’ Compensation insurance — mandatory",
    ],
  },
  westchester: {
    label: "Westchester County",
    hicAgency: "Westchester County Dept. of Consumer Protection",
    hasGC: false,
    hicExperienceYears: 5,
    hicExperienceProof: "5-year notarized personal work history required",
    hicExam: false,
    hicExamDetail: "",
    hicGLInsurance: "Amount set by Director — contact office for current requirement",
    hicFee: "$500/2yr",
    hicExtras: [
      "Workers’ Compensation insurance — mandatory",
    ],
  },
  rockland: {
    label: "Rockland County",
    hicAgency: "Rockland County Dept. of Consumer Protection",
    hasGC: false,
    hicExperienceYears: 0,
    hicExperienceProof: "",
    hicExam: true,
    hicExamDetail: "Written exam for A6/B6 General Contractor classification",
    hicGLInsurance: "Required (contact county for current minimums)",
    hicFee: "$325",
    hicExtras: [
      "A6/B6 GC classification is within the HIC license (not a separate license)",
    ],
  },
  putnam: {
    label: "Putnam County",
    hicAgency: "Putnam County Consumer Affairs",
    hasGC: false,
    hicExperienceYears: 0,
    hicExperienceProof: "",
    hicExam: false,
    hicExamDetail: "",
    hicGLInsurance: "$1M/$2M — required (highest among NY counties)",
    hicFee: "$250",
    hicExtras: [
      "$25,000 surety bond — required",
      "Workers’ Compensation insurance — mandatory",
    ],
  },
};

/** NYC GC (DOB) specific requirements */
const NYC_GC_REQUIREMENTS = [
  "General Liability insurance: $1M minimum per occurrence — mandatory",
  "Workers’ Compensation + Disability insurance — mandatory",
  "Financial solvency: $25K operating capital (bank statements) — mandatory",
  "5 years of general contracting experience — mandatory",
  "Background investigation (3–5 months processing)",
  "Fee: $300 for 3-year registration",
  "No exam required",
];

/* ──────────────────────────────────────────────────────────────────────────────
   Verdict logic
   ──────────────────────────────────────────────────────────────────────────── */

type Verdict = "ready" | "almost" | "not-yet";

function computeVerdict(a: Answers): Verdict {
  const hasEntity = a.entityStatus !== "" && a.entityStatus !== "none";
  const gcPath = a.scopeOfWork === "gc" || a.scopeOfWork === "both";
  const loc = a.workLocation as JurisdictionKey;

  // Experience check — jurisdiction-aware
  let hasExperience = true;
  if (gcPath) {
    hasExperience = a.experience === "5+";
  } else if (loc === "nassau" || loc === "westchester") {
    hasExperience = a.experience === "5+";
  }

  // GL insurance — only factor for GC path or counties that require it
  // NYC HIC: GL insurance NOT required by DCWP, so not a verdict factor
  let hasGLInsurance = true;
  if (gcPath) {
    hasGLInsurance = a.certifications.includes("insurance");
  } else if (loc !== "nyc" && loc !== "multiple") {
    const jInfo = loc in JURISDICTIONS ? JURISDICTIONS[loc as Exclude<JurisdictionKey, "multiple">] : null;
    if (jInfo && jInfo.hicGLInsurance) {
      hasGLInsurance = a.certifications.includes("insurance");
    }
  }

  const hasTimeline = a.timeline === "waiting" || a.timeline === "30days";

  const missingCount = [
    !hasEntity,
    !hasExperience,
    !hasGLInsurance,
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
   Helpers
   ──────────────────────────────────────────────────────────────────────────── */

function isNYC(loc: string): boolean {
  return loc === "nyc";
}

function getJurisdiction(loc: string): JurisdictionInfo | null {
  if (loc in JURISDICTIONS) return JURISDICTIONS[loc as Exclude<JurisdictionKey, "multiple">];
  return null;
}

function experienceStepTitle(loc: string, scope: string): string {
  const gcPath = scope === "gc" || scope === "both";
  if (gcPath) return "NYC GC registration requires 5 years of general contracting experience.";
  const j = getJurisdiction(loc);
  if (j && j.hicExperienceYears > 0) {
    return `${j.label} requires a minimum of ${j.hicExperienceYears} years of experience for HIC licensing.`;
  }
  if (loc === "multiple") {
    return "Some NY counties require minimum experience for HIC licensing. How much experience do you have?";
  }
  return "How many years of contracting experience do you have?";
}

function experienceStepSubtitle(loc: string, scope: string): string | undefined {
  const gcPath = scope === "gc" || scope === "both";
  if (gcPath) return "Documented experience in general contracting required.";
  if (loc === "nassau") return "W-2s or 1099s from construction work required as proof.";
  if (loc === "westchester") return "5-year notarized personal work history required.";
  if (isNYC(loc) && !gcPath) return "No minimum experience required by DCWP for HIC licensing.";
  return undefined;
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

  // GC only available in NYC
  const gcAvailable = isNYC(answers.workLocation);

  const scopeOptions = useMemo(() => {
    if (gcAvailable) {
      return [
        { value: "hic", label: "Residential repair / remodel (HIC license)" },
        { value: "gc", label: "New construction or structural (GC registration)" },
        { value: "both", label: "Both HIC + GC" },
      ];
    }
    return [
      { value: "hic", label: "Home Improvement Contractor (HIC) license" },
    ];
  }, [gcAvailable]);

  // Reset scope if user changes location and GC is no longer available
  useEffect(() => {
    if (!gcAvailable && (answers.scopeOfWork === "gc" || answers.scopeOfWork === "both")) {
      setAnswers((prev) => ({ ...prev, scopeOfWork: "hic" }));
    }
  }, [gcAvailable, answers.scopeOfWork]);

  const gcPath = answers.scopeOfWork === "gc" || answers.scopeOfWork === "both";

  // Certifications options — vary by path and location
  const certOptions = useMemo(() => {
    const glLabel = gcPath
      ? "General Liability insurance (mandatory for GC)"
      : answers.workLocation === "nyc"
        ? "General Liability insurance (not required by DCWP, but recommended)"
        : "General Liability insurance (required by county)";
    return [
      { value: "epa-rrp", label: "EPA RRP Certification (required for pre-1978 buildings)" },
      { value: "insurance", label: glLabel },
      { value: "workers-comp", label: "Workers’ Compensation (or exemption certificate)" },
      { value: "sales-tax", label: "NYS Sales Tax ID (Certificate of Authority)" },
      { value: "none", label: "None of the above" },
    ];
  }, [gcPath, answers.workLocation]);

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
            Find out what you need for your HIC or GC license in New York.
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
              {/* Step 0 — Location */}
              {step === 0 && (
                <StepCard title="Where will you work?">
                  <div className="space-y-3">
                    {[
                      { value: "nyc", label: "NYC (All 5 Boroughs)" },
                      { value: "nassau", label: "Nassau County" },
                      { value: "suffolk", label: "Suffolk County" },
                      { value: "westchester", label: "Westchester County" },
                      { value: "rockland", label: "Rockland County" },
                      { value: "putnam", label: "Putnam County" },
                      { value: "multiple", label: "Multiple NY counties" },
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

              {/* Step 1 — Scope of work (conditional on location) */}
              {step === 1 && (
                <StepCard
                  title="What's your scope of work?"
                  subtitle={!gcAvailable && answers.workLocation !== ""
                    ? answers.workLocation === "multiple"
                      ? "GC registration is only available in NYC. HIC licensing covers all NY counties."
                      : "Only HIC licensing is available in this county. GC registration is NYC only."
                    : undefined
                  }
                >
                  <div className="space-y-3">
                    {scopeOptions.map((opt) => (
                      <OptionButton
                        key={opt.value}
                        selected={answers.scopeOfWork === opt.value}
                        onClick={() => { update("scopeOfWork", opt.value); goNext(); }}
                      >
                        {opt.label}
                      </OptionButton>
                    ))}
                    {!gcAvailable && scopeOptions.length === 1 && (
                      <p className="text-xs text-[var(--text-muted)] mt-2">
                        There is no separate GC license outside NYC. Some counties (like Rockland) include GC classification within their HIC license.
                      </p>
                    )}
                  </div>
                </StepCard>
              )}

              {/* Step 2 — Business registration/certificate */}
              {step === 2 && (
                <StepCard title="Do you have a business certificate or entity registered with New York State?">
                  {answers.entityStatus === "none" ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-[var(--radius-lg)] bg-amber-50 border border-amber-200 text-sm text-amber-800">
                        <strong>Business registration is a prerequisite.</strong> Sole proprietors need a
                        Business/Assumed Name Certificate filed with the county. LLCs and Corporations
                        need their formation documents filed with New York State.
                        <div className="mt-3">
                          <Link
                            href="/services/business-formation"
                            className="inline-flex items-center gap-1 text-[var(--blue-accent)] font-semibold hover:underline"
                          >
                            Start your business registration &rarr;
                          </Link>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        You can still complete this qualifier to see the full list of requirements.
                      </p>
                      <button
                        type="button"
                        onClick={goNext}
                        className="w-full px-5 py-3 rounded-[var(--radius-lg)] border-2 border-[var(--blue-accent)] text-[var(--blue-accent)] font-semibold text-sm hover:bg-[var(--blue-pale)] transition-all"
                      >
                        See full requirements first
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[
                        { value: "none", label: "No — not yet registered" },
                        { value: "sole-prop", label: "Sole proprietorship (DBA/Business Certificate)" },
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

              {/* Step 3 — Experience (jurisdiction-aware) */}
              {step === 3 && (
                <StepCard
                  title={experienceStepTitle(answers.workLocation, answers.scopeOfWork)}
                  subtitle={experienceStepSubtitle(answers.workLocation, answers.scopeOfWork)}
                >
                  <div className="space-y-3">
                    {[
                      { value: "<1", label: "Less than 1 year" },
                      { value: "1-4", label: "1–4 years" },
                      { value: "5+", label: "5 or more years" },
                    ].map((opt) => {
                      const gcReq = (answers.scopeOfWork === "gc" || answers.scopeOfWork === "both") && opt.value !== "5+";
                      const countyReq = !gcPath
                        && (answers.workLocation === "nassau" || answers.workLocation === "westchester")
                        && opt.value !== "5+";

                      return (
                        <OptionButton
                          key={opt.value}
                          selected={answers.experience === opt.value}
                          onClick={() => { update("experience", opt.value); goNext(); }}
                        >
                          {opt.label}
                          {gcReq && (
                            <span className="ml-2 text-xs text-[var(--amber)] font-normal">
                              (GC requires 5+)
                            </span>
                          )}
                          {countyReq && (
                            <span className="ml-2 text-xs text-[var(--amber)] font-normal">
                              (county minimum: 5 years)
                            </span>
                          )}
                        </OptionButton>
                      );
                    })}
                  </div>
                </StepCard>
              )}

              {/* Step 4 — Certifications & documents */}
              {step === 4 && (
                <StepCard title="Which of these do you already have?" subtitle="Select all that apply">
                  <div className="space-y-3">
                    {certOptions.map((opt) => (
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

              {/* Step 5 — Timeline */}
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

              {/* Step 6 — Contact info */}
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
   Verdict screen — jurisdiction-aware
   ──────────────────────────────────────────────────────────────────────────── */

function VerdictScreen({ verdict, answers }: { verdict: Verdict; answers: Answers }) {
  const gcPath = answers.scopeOfWork === "gc" || answers.scopeOfWork === "both";
  const hicPath = answers.scopeOfWork === "hic" || answers.scopeOfWork === "both";
  const loc = answers.workLocation as JurisdictionKey;
  const j = getJurisdiction(loc);

  const licenseName = gcPath && !hicPath
    ? "General Contractor registration"
    : hicPath && !gcPath
      ? "Home Improvement Contractor license"
      : "HIC license + GC registration";

  const agencyName = gcPath && !hicPath
    ? "NYC Dept. of Buildings (DOB)"
    : j?.hicAgency ?? "the applicable licensing agency";

  const configs = {
    ready: {
      accent: "#16A34A",
      bg: "#F0FDF4",
      border: "#86EFAC",
      icon: "✓",
      label: "Ready to file",
      headline: `You’re eligible. Let’s get your ${licenseName} filed.`,
      body: `Based on your answers, you meet the key requirements for a ${licenseName} through ${agencyName}. Our team can start your application.`,
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
      body: `You’re close — you have most requirements covered for a ${licenseName}. Here’s what to address before filing:`,
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
      body: "You need a few foundations in place before applying. Review the full requirements below and come back once you’ve addressed them.",
      cta: "Register your business",
      ctaHref: "/services/business-formation",
      secondary: "Learn more about licensing",
    },
  };

  const cfg = configs[verdict];

  // Build gap checklist
  const gaps: string[] = [];
  if (answers.entityStatus === "none" || !answers.entityStatus) {
    gaps.push("Register a business entity (LLC, Corporation, or DBA) with New York State — required for all contractor licenses");
  }
  if (gcPath && answers.experience !== "5+") {
    gaps.push("GC registration requires 5+ years of documented general contracting experience");
  }
  if (!gcPath && (loc === "nassau" || loc === "westchester") && answers.experience !== "5+") {
    gaps.push(`${loc === "nassau" ? "Nassau County" : "Westchester County"} requires a minimum of 5 years of experience`);
  }
  if (gcPath && !answers.certifications.includes("insurance")) {
    gaps.push("Obtain General Liability insurance ($1M min per occurrence) — mandatory for GC registration");
  }
  if (!gcPath && loc !== "nyc" && loc !== "multiple") {
    if (j && j.hicGLInsurance && !answers.certifications.includes("insurance")) {
      gaps.push(`Obtain General Liability insurance (${j.hicGLInsurance.split(" —")[0]}) — required by ${j.label}`);
    }
  }
  if (!answers.certifications.includes("workers-comp")) {
    gaps.push("Workers’ Compensation insurance (or exemption certificate if no employees) — mandatory");
  }
  if (isNYC(loc) && !answers.certifications.includes("sales-tax")) {
    gaps.push("NYS Sales Tax ID (Certificate of Authority) — mandatory for NYC licensing");
  }

  // Jurisdiction-specific requirements list
  const requirements: string[] = [];
  if (hicPath && j) {
    requirements.push(`Issuing agency: ${j.hicAgency}`);
    if (j.hicExperienceYears > 0) {
      requirements.push(`Experience: ${j.hicExperienceYears} years minimum${j.hicExperienceProof ? ` (${j.hicExperienceProof})` : ""}`);
    } else if (isNYC(loc)) {
      requirements.push("Experience: No minimum required by DCWP");
    }
    if (j.hicExam) {
      requirements.push(`Exam: ${j.hicExamDetail}`);
    }
    if (j.hicGLInsurance) {
      requirements.push(`GL Insurance: ${j.hicGLInsurance}`);
    } else if (isNYC(loc)) {
      requirements.push("GL Insurance: Not required by DCWP (clients may require contractually)");
    }
    requirements.push(`Fee: ${j.hicFee}`);
    for (const extra of j.hicExtras) {
      requirements.push(extra);
    }
  }
  if (loc === "multiple") {
    requirements.push("Requirements vary by county — a specialist will review each jurisdiction with you");
    requirements.push("No reciprocity between any NY jurisdictions — separate applications required for each");
  }

  const gcRequirements: string[] = [];
  if (gcPath) {
    gcRequirements.push("NYC Dept. of Buildings (DOB) — GC Registration");
    for (const req of NYC_GC_REQUIREMENTS) {
      gcRequirements.push(req);
    }
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
                <span className="text-green-600">{"✓"}</span> Initial consultation to review your documents
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">{"✓"}</span> Application filing with {agencyName}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">{"✓"}</span> Insurance and bond coordination as needed
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Jurisdiction-specific requirements */}
      {requirements.length > 0 && (
        <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] shadow-[var(--shadow-md)] p-6 sm:p-8 mb-4">
          <h3 className="text-base font-bold text-[var(--text)] mb-3">
            {hicPath ? "HIC License Requirements" : "Requirements"}{j ? ` — ${j.label}` : ""}
          </h3>
          <ul className="space-y-2">
            {requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="mt-0.5 text-[var(--blue-accent)]">{"•"}</span>
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {gcRequirements.length > 0 && (
        <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] shadow-[var(--shadow-md)] p-6 sm:p-8 mb-4">
          <h3 className="text-base font-bold text-[var(--text)] mb-3">
            GC Registration Requirements — NYC DOB
          </h3>
          <ul className="space-y-2">
            {gcRequirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="mt-0.5 text-[var(--blue-accent)]">{"•"}</span>
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

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
