"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";

// Lazy-load capture components — they're heavy (camera APIs, canvas processing)
const DocumentScanner = dynamic(() => import("./DocumentScanner"), { ssr: false });
const SelfieCapture = dynamic(() => import("./SelfieCapture"), { ssr: false });
const SignaturePad = dynamic(() => import("./SignaturePad"), { ssr: false });

/* ═══════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════ */

const CITIES = [
  { value: "new_york", label: "New York", icon: "🗽" },
  { value: "nashville", label: "Nashville", icon: "🎵" },
] as const;

interface ItinData {
  // Step 1
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  // Step 2
  city: string;
  addressUsa: string;
  addressHomeCountry: string;
  companyName: string;
  amount: string;
  // Step 3
  documentScan: File | null;
  // Step 4
  selfie: File | null;
  // Step 5
  signature: File | null;
  // Legacy (backward compat)
  hasPassport: boolean;
  passportNumber: string;
  passportExpiry: string;
  comment: string;
}

const INITIAL: ItinData = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  city: "",
  addressUsa: "",
  addressHomeCountry: "",
  companyName: "",
  amount: "",
  documentScan: null,
  selfie: null,
  signature: null,
  hasPassport: false,
  passportNumber: "",
  passportExpiry: "",
  comment: "",
};

const STEPS = [
  { label: "Personal", shortLabel: "Info" },
  { label: "Location", shortLabel: "Location" },
  { label: "Document", shortLabel: "Scan" },
  { label: "Photo", shortLabel: "Selfie" },
  { label: "Review", shortLabel: "Sign" },
] as const;

interface Props {
  onSuccess: () => void;
}

/* ═══════════════════════════════════════════════
   Main Form Component
   ═══════════════════════════════════════════════ */

export function ItinForm({ onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ItinData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof ItinData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Capture overlay states
  const [showDocScanner, setShowDocScanner] = useState(false);
  const [showSelfieCapture, setShowSelfieCapture] = useState(false);

  // Preview URLs for captured files
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [sigPreview, setSigPreview] = useState<string | null>(null);

  // Direction for slide animation
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");
  const [animating, setAnimating] = useState(false);

  const update = useCallback(
    <K extends keyof ItinData>(field: K, value: ItinData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  // ─── File Preview Helpers ───

  const createPreviewUrl = useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);

  const handleDocCapture = useCallback(
    (file: File) => {
      update("documentScan", file);
      update("hasPassport", true);
      setDocPreview(createPreviewUrl(file));
      setShowDocScanner(false);
    },
    [update, createPreviewUrl]
  );

  const handleSelfieCapture = useCallback(
    (file: File) => {
      update("selfie", file);
      setSelfiePreview(createPreviewUrl(file));
      setShowSelfieCapture(false);
    },
    [update, createPreviewUrl]
  );

  const handleSignatureSave = useCallback(
    (file: File) => {
      update("signature", file);
      setSigPreview(createPreviewUrl(file));
    },
    [update, createPreviewUrl]
  );

  const clearDoc = useCallback(() => {
    update("documentScan", null);
    update("hasPassport", false);
    if (docPreview) URL.revokeObjectURL(docPreview);
    setDocPreview(null);
  }, [update, docPreview]);

  const clearSelfie = useCallback(() => {
    update("selfie", null);
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setSelfiePreview(null);
  }, [update, selfiePreview]);

  const clearSignature = useCallback(() => {
    update("signature", null);
    if (sigPreview) URL.revokeObjectURL(sigPreview);
    setSigPreview(null);
  }, [update, sigPreview]);

  // ─── Validation ───

  function validateStep(s: number): boolean {
    const errs: Partial<Record<keyof ItinData, string>> = {};

    if (s === 0) {
      if (!data.firstName.trim()) errs.firstName = "First name is required";
      if (!data.lastName.trim()) errs.lastName = "Last name is required";
      if (!data.phone.trim() || data.phone.replace(/\D/g, "").length < 7)
        errs.phone = "Valid phone number is required";
    }

    if (s === 1) {
      if (!data.city) errs.city = "Please select appointment city";
    }

    // Steps 2 (document) and 3 (selfie) are optional — skip allowed

    if (s === 4) {
      if (!data.signature) errs.signature = "Signature is required to submit";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function transitionToStep(target: number) {
    if (animating || target === step) return;
    setSlideDirection(target > step ? "left" : "right");
    setAnimating(true);
    // Allow brief animation frame before switching
    requestAnimationFrame(() => {
      setStep(target);
      setTimeout(() => setAnimating(false), 350);
    });
  }

  function nextStep() {
    if (validateStep(step)) {
      // For document scan step, auto-open scanner if no document yet
      if (step === 2 && !data.documentScan && !showDocScanner) {
        setShowDocScanner(true);
        return;
      }
      // For selfie step, auto-open camera if no selfie yet
      if (step === 3 && !data.selfie && !showSelfieCapture) {
        setShowSelfieCapture(true);
        return;
      }
      transitionToStep(Math.min(step + 1, STEPS.length - 1));
    }
  }

  function prevStep() {
    transitionToStep(Math.max(step - 1, 0));
  }

  // ─── Submit ───

  async function handleSubmit() {
    if (!validateStep(step)) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = new FormData();
      payload.append("firstName", data.firstName.trim());
      payload.append("lastName", data.lastName.trim());
      payload.append("phone", data.phone.trim());
      payload.append("email", data.email.trim());
      payload.append("city", data.city);
      payload.append("addressUsa", data.addressUsa.trim());
      payload.append("addressHomeCountry", data.addressHomeCountry.trim());
      payload.append("companyName", data.companyName.trim());
      payload.append("amount", data.amount.trim());
      payload.append("hasPassport", String(!!data.documentScan));
      payload.append("passportNumber", data.passportNumber.trim());
      payload.append("passportExpiry", data.passportExpiry);
      payload.append("comment", data.comment.trim());

      if (data.documentScan) {
        payload.append("documentScan", data.documentScan);
      }
      if (data.selfie) {
        payload.append("selfie", data.selfie);
      }
      if (data.signature) {
        payload.append("signature", data.signature);
      }

      const res = await fetch("/api/itin-submit", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || `Server error (${res.status})`);
      }

      onSuccess();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isLast = step === STEPS.length - 1;

  // Completed steps for progress indicator
  const completedSteps = useMemo(() => {
    const completed = new Set<number>();
    if (data.firstName && data.lastName && data.phone) completed.add(0);
    if (data.city) completed.add(1);
    if (data.documentScan) completed.add(2);
    if (data.selfie) completed.add(3);
    if (data.signature) completed.add(4);
    return completed;
  }, [data.firstName, data.lastName, data.phone, data.city, data.documentScan, data.selfie, data.signature]);

  return (
    <>
      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-12 lg:px-24 pb-6 max-w-3xl mx-auto w-full">
        {/* ─── Progress Indicator ─── */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => {
                  if (i < step) transitionToStep(i);
                }}
                className="flex flex-col items-center gap-1.5 group"
                disabled={i > step}
              >
                {/* Step circle */}
                <div
                  className={`
                    w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center
                    text-xs font-bold transition-all duration-300
                    ${
                      i === step
                        ? "bg-[#4F56E8] text-white ring-2 ring-[#4F56E8]/30 ring-offset-2 ring-offset-[#0F1B2D]"
                        : completedSteps.has(i)
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/5 text-white/25 border border-white/10"
                    }
                    ${i < step ? "cursor-pointer group-hover:bg-white/10" : ""}
                  `}
                >
                  {completedSteps.has(i) && i !== step ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {/* Step label */}
                <span
                  className={`
                    text-[10px] sm:text-xs font-medium transition-colors duration-200
                    ${i === step ? "text-[#818CF8]" : i < step ? "text-white/40" : "text-white/20"}
                  `}
                >
                  {s.label}
                </span>
              </button>
            ))}
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#4F56E8] to-[#818CF8] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* ─── Form Content ─── */}
        <div
          className={`
            flex-1 overflow-y-auto transition-all duration-300 ease-out
            ${animating
              ? slideDirection === "left"
                ? "opacity-0 translate-x-4"
                : "opacity-0 -translate-x-4"
              : "opacity-100 translate-x-0"
            }
          `}
        >
          {step === 0 && (
            <StepPersonal data={data} errors={errors} update={update} />
          )}
          {step === 1 && (
            <StepLocation data={data} errors={errors} update={update} />
          )}
          {step === 2 && (
            <StepDocument
              data={data}
              docPreview={docPreview}
              onOpenScanner={() => setShowDocScanner(true)}
              onClear={clearDoc}
            />
          )}
          {step === 3 && (
            <StepSelfie
              data={data}
              selfiePreview={selfiePreview}
              onOpenCamera={() => setShowSelfieCapture(true)}
              onClear={clearSelfie}
            />
          )}
          {step === 4 && (
            <StepReview
              data={data}
              errors={errors}
              docPreview={docPreview}
              selfiePreview={selfiePreview}
              sigPreview={sigPreview}
              onSaveSignature={handleSignatureSave}
              onClearSignature={clearSignature}
            />
          )}
        </div>

        {/* ─── Submit Error ─── */}
        {submitError && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{submitError}</span>
          </div>
        )}

        {/* ─── Navigation ─── */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
          {step > 0 && (
            <button
              onClick={prevStep}
              className="
                flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold
                bg-white/5 text-white/60
                hover:bg-white/10 hover:text-white/80
                active:scale-[0.97] transition-all duration-200
              "
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Back
            </button>
          )}

          {/* Skip button for optional steps (3 & 4) */}
          {(step === 2 || step === 3) && (
            <button
              onClick={() => transitionToStep(step + 1)}
              className="
                px-5 py-3.5 rounded-xl text-sm font-medium
                text-white/40 hover:text-white/60
                transition-all duration-200
              "
            >
              Skip
            </button>
          )}

          <button
            onClick={isLast ? handleSubmit : nextStep}
            disabled={submitting}
            className={`
              flex-1 px-6 py-3.5 rounded-xl text-sm font-bold
              transition-all duration-200 active:scale-[0.97]
              ${
                submitting
                  ? "bg-[#4F56E8]/50 text-white/50 cursor-wait"
                  : "bg-[#4F56E8] text-white hover:bg-[#5B63F0] shadow-[0_0_30px_rgba(79,86,232,0.25)]"
              }
            `}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : isLast ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Submit Application
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {step === 2
                  ? data.documentScan
                    ? "Continue"
                    : "Scan Document"
                  : step === 3
                  ? data.selfie
                    ? "Continue"
                    : "Take Photo"
                  : "Continue"}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── Full-screen Overlays ─── */}
      {showDocScanner && (
        <DocumentScanner
          onCapture={handleDocCapture}
          onClose={() => {
            setShowDocScanner(false);
            // If they captured a doc, advance to next step
            if (data.documentScan) {
              transitionToStep(3);
            }
          }}
          label="Scan Passport / ID"
        />
      )}

      {showSelfieCapture && (
        <SelfieCapture
          onCapture={handleSelfieCapture}
          onClose={() => {
            setShowSelfieCapture(false);
            if (data.selfie) {
              transitionToStep(4);
            }
          }}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════
   Shared UI Primitives
   ═══════════════════════════════════════════════ */

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-white/60 mb-1.5">
      {children}
      {required && <span className="text-[#818CF8] ml-0.5">*</span>}
    </label>
  );
}

function Input({
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "email" | "text" | "decimal";
  autoComplete?: string;
}) {
  return (
    <>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className={`
          w-full px-4 py-3.5 rounded-xl text-base
          bg-white/[0.07] border
          text-white placeholder-white/25
          focus:outline-none focus:ring-2 focus:ring-[#4F56E8]/50 focus:border-[#4F56E8]/50
          transition-all duration-200
          ${error ? "border-red-400/50 ring-1 ring-red-400/20" : "border-white/10"}
        `}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="
        w-full px-4 py-3.5 rounded-xl text-base resize-none
        bg-white/[0.07] border border-white/10
        text-white placeholder-white/25
        focus:outline-none focus:ring-2 focus:ring-[#4F56E8]/50 focus:border-[#4F56E8]/50
        transition-all duration-200
      "
    />
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{title}</h2>
      <p className="text-white/40 text-sm">{subtitle}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Step 1 — Personal Info
   ═══════════════════════════════════════════════ */

interface StepProps {
  data: ItinData;
  errors: Partial<Record<keyof ItinData, string>>;
  update: <K extends keyof ItinData>(field: K, value: ItinData[K]) => void;
}

function StepPersonal({ data, errors, update }: StepProps) {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Personal Information"
        subtitle="Basic contact details for your ITIN application."
      />

      {/* IRS badge */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#4F56E8]/10 border border-[#4F56E8]/20">
        <svg className="w-5 h-5 text-[#818CF8] shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-[#818CF8] text-sm font-medium">
          IRS Certified Acceptance Agent — documents verified on-site
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>First Name</Label>
          <Input
            value={data.firstName}
            onChange={(v) => update("firstName", v)}
            error={errors.firstName}
            placeholder="Juan"
            autoComplete="given-name"
          />
        </div>
        <div>
          <Label required>Last Name</Label>
          <Input
            value={data.lastName}
            onChange={(v) => update("lastName", v)}
            error={errors.lastName}
            placeholder="Garcia"
            autoComplete="family-name"
          />
        </div>
      </div>

      <div>
        <Label required>Phone Number</Label>
        <Input
          value={data.phone}
          onChange={(v) => update("phone", v)}
          error={errors.phone}
          placeholder="(929) 555-0123"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
      </div>

      <div>
        <Label>Email</Label>
        <Input
          value={data.email}
          onChange={(v) => update("email", v)}
          error={errors.email}
          placeholder="email@example.com"
          type="email"
          inputMode="email"
          autoComplete="email"
        />
      </div>

      {/* Trust note */}
      <div className="flex items-center gap-2 pt-2 text-white/25 text-xs">
        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>Your information is encrypted and handled securely.</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Step 2 — Location & Work
   ═══════════════════════════════════════════════ */

function StepLocation({ data, errors, update }: StepProps) {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Location & Employment"
        subtitle="Where you'll attend and your work details."
      />

      {/* City selector — big touch-friendly tiles */}
      <div>
        <Label required>Appointment City</Label>
        <div className="grid grid-cols-2 gap-3 mt-1">
          {CITIES.map((city) => (
            <button
              key={city.value}
              type="button"
              onClick={() => update("city", city.value)}
              className={`
                py-5 px-4 rounded-xl text-base font-semibold text-center
                transition-all duration-200 active:scale-[0.97]
                ${
                  data.city === city.value
                    ? "bg-[#4F56E8] text-white border-2 border-[#818CF8] shadow-[0_0_20px_rgba(79,86,232,0.3)]"
                    : "bg-white/[0.07] text-white/60 border-2 border-transparent hover:bg-white/10 hover:text-white/80"
                }
              `}
            >
              <span className="text-2xl block mb-1">{city.icon}</span>
              {city.label}
            </button>
          ))}
        </div>
        {errors.city && <p className="mt-1 text-xs text-red-400">{errors.city}</p>}
      </div>

      <div>
        <Label>US Address</Label>
        <TextArea
          value={data.addressUsa}
          onChange={(v) => update("addressUsa", v)}
          placeholder="Street, City, State, ZIP"
          rows={2}
        />
      </div>

      <div>
        <Label>Home Country Address</Label>
        <TextArea
          value={data.addressHomeCountry}
          onChange={(v) => update("addressHomeCountry", v)}
          placeholder="Full address in your home country"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Company / Employer</Label>
          <Input
            value={data.companyName}
            onChange={(v) => update("companyName", v)}
            placeholder="Company name"
          />
        </div>
        <div>
          <Label>Annual Earnings ($)</Label>
          <Input
            value={data.amount}
            onChange={(v) => update("amount", v)}
            placeholder="0.00"
            inputMode="decimal"
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Step 3 — Document Scan
   ═══════════════════════════════════════════════ */

function StepDocument({
  data,
  docPreview,
  onOpenScanner,
  onClear,
}: {
  data: ItinData;
  docPreview: string | null;
  onOpenScanner: () => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Document Scan"
        subtitle="Scan your passport or government-issued ID for verification."
      />

      {data.documentScan && docPreview ? (
        /* ─── Captured Preview ─── */
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={docPreview}
              alt="Scanned document preview"
              className="w-full h-56 sm:h-64 object-cover"
            />
            {/* Success badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Document Captured
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onOpenScanner}
              className="
                flex-1 flex items-center justify-center gap-2
                px-4 py-3 rounded-xl text-sm font-semibold
                bg-white/5 border border-white/10 text-white/60
                hover:bg-white/10 hover:text-white/80
                active:scale-[0.97] transition-all duration-200
              "
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake
            </button>
            <button
              type="button"
              onClick={onClear}
              className="
                px-4 py-3 rounded-xl text-sm font-medium
                text-red-400/60 hover:text-red-400
                transition-all duration-200
              "
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* ─── Scan Prompt ─── */
        <div className="space-y-4">
          <button
            type="button"
            onClick={onOpenScanner}
            className="
              w-full py-12 rounded-2xl border-2 border-dashed border-[#4F56E8]/30
              bg-[#4F56E8]/5 hover:bg-[#4F56E8]/10
              flex flex-col items-center gap-4
              transition-all duration-200 active:scale-[0.98]
              group
            "
          >
            <div className="w-16 h-16 rounded-2xl bg-[#4F56E8]/20 flex items-center justify-center group-hover:bg-[#4F56E8]/30 transition-colors">
              <svg className="w-8 h-8 text-[#818CF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <div className="text-center">
              <span className="text-base font-semibold text-white/80 block">
                Tap to Scan Document
              </span>
              <span className="text-sm text-white/40 mt-1 block">
                Passport, driver&apos;s license, or national ID
              </span>
            </div>
          </button>

          <p className="text-center text-white/25 text-xs">
            You can also skip this step and bring your documents in person.
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Step 4 — Selfie Verification
   ═══════════════════════════════════════════════ */

function StepSelfie({
  data,
  selfiePreview,
  onOpenCamera,
  onClear,
}: {
  data: ItinData;
  selfiePreview: string | null;
  onOpenCamera: () => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Photo Verification"
        subtitle="Take a clear photo of yourself for identity verification."
      />

      {data.selfie && selfiePreview ? (
        /* ─── Captured Preview ─── */
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 max-w-[280px] mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selfiePreview}
              alt="Selfie preview"
              className="w-full aspect-[3/4] object-cover"
            />
            {/* Success badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Photo Captured
            </div>
          </div>

          <div className="flex gap-3 max-w-[280px] mx-auto">
            <button
              type="button"
              onClick={onOpenCamera}
              className="
                flex-1 flex items-center justify-center gap-2
                px-4 py-3 rounded-xl text-sm font-semibold
                bg-white/5 border border-white/10 text-white/60
                hover:bg-white/10 hover:text-white/80
                active:scale-[0.97] transition-all duration-200
              "
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake
            </button>
            <button
              type="button"
              onClick={onClear}
              className="
                px-4 py-3 rounded-xl text-sm font-medium
                text-red-400/60 hover:text-red-400
                transition-all duration-200
              "
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* ─── Capture Prompt ─── */
        <div className="space-y-4">
          <button
            type="button"
            onClick={onOpenCamera}
            className="
              w-full py-12 rounded-2xl border-2 border-dashed border-[#4F56E8]/30
              bg-[#4F56E8]/5 hover:bg-[#4F56E8]/10
              flex flex-col items-center gap-4
              transition-all duration-200 active:scale-[0.98]
              group
            "
          >
            <div className="w-16 h-16 rounded-full bg-[#4F56E8]/20 flex items-center justify-center group-hover:bg-[#4F56E8]/30 transition-colors">
              <svg className="w-8 h-8 text-[#818CF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div className="text-center">
              <span className="text-base font-semibold text-white/80 block">
                Tap to Take Photo
              </span>
              <span className="text-sm text-white/40 mt-1 block">
                Look directly at the camera, face centered
              </span>
            </div>
          </button>

          <p className="text-center text-white/25 text-xs">
            Your photo helps verify your identity. You can skip and provide it in person.
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Step 5 — Review & Sign
   ═══════════════════════════════════════════════ */

function StepReview({
  data,
  errors,
  docPreview,
  selfiePreview,
  sigPreview,
  onSaveSignature,
  onClearSignature,
}: {
  data: ItinData;
  errors: Partial<Record<keyof ItinData, string>>;
  docPreview: string | null;
  selfiePreview: string | null;
  sigPreview: string | null;
  onSaveSignature: (file: File) => void;
  onClearSignature: () => void;
}) {
  const cityLabel = CITIES.find((c) => c.value === data.city)?.label || data.city;

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Review & Sign"
        subtitle="Verify your information and sign to submit your application."
      />

      {/* Summary Card */}
      <div className="rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden">
        {/* Personal Info */}
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider mb-3">
            Personal Information
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewField label="Name" value={`${data.firstName} ${data.lastName}`} />
            <ReviewField label="Phone" value={data.phone} />
            <ReviewField label="Email" value={data.email || "Not provided"} muted={!data.email} />
          </div>
        </div>

        {/* Location & Work */}
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider mb-3">
            Location & Employment
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewField label="City" value={cityLabel} />
            <ReviewField label="Company" value={data.companyName || "Not provided"} muted={!data.companyName} />
            <ReviewField
              label="US Address"
              value={data.addressUsa || "Not provided"}
              muted={!data.addressUsa}
              fullWidth
            />
            <ReviewField
              label="Home Address"
              value={data.addressHomeCountry || "Not provided"}
              muted={!data.addressHomeCountry}
              fullWidth
            />
            <ReviewField
              label="Annual Earnings"
              value={data.amount ? `$${data.amount}` : "Not provided"}
              muted={!data.amount}
            />
          </div>
        </div>

        {/* Documents */}
        <div className="px-5 py-4">
          <h3 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider mb-3">
            Documents
          </h3>
          <div className="flex gap-4">
            {/* Document thumbnail */}
            <div className="text-center">
              {docPreview ? (
                <div className="w-20 h-14 rounded-lg overflow-hidden border border-white/10 mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={docPreview} alt="Document" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-14 rounded-lg border border-dashed border-white/15 bg-white/[0.03] flex items-center justify-center mb-1">
                  <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
              )}
              <span className={`text-[10px] ${docPreview ? "text-emerald-400" : "text-white/25"}`}>
                {docPreview ? "Scanned" : "Not scanned"}
              </span>
            </div>

            {/* Selfie thumbnail */}
            <div className="text-center">
              {selfiePreview ? (
                <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 mb-1 mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full border border-dashed border-white/15 bg-white/[0.03] flex items-center justify-center mb-1 mx-auto">
                  <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              )}
              <span className={`text-[10px] ${selfiePreview ? "text-emerald-400" : "text-white/25"}`}>
                {selfiePreview ? "Captured" : "No photo"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label required>Signature</Label>
          {data.signature && (
            <button
              type="button"
              onClick={onClearSignature}
              className="text-xs text-white/30 hover:text-red-400 transition-colors"
            >
              Clear signature
            </button>
          )}
        </div>

        {data.signature && sigPreview ? (
          /* Signed preview */
          <div className="rounded-xl border border-emerald-500/20 bg-white/[0.04] p-3">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400 text-xs font-semibold">Signed</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sigPreview}
              alt="Your signature"
              className="w-full h-24 object-contain rounded-lg bg-white"
            />
          </div>
        ) : (
          /* Signature pad inline */
          <div>
            <SignaturePad
              onSign={onSaveSignature}
              onClose={() => {
                /* no-op: pad is always visible on review step */
              }}
            />
            {errors.signature && (
              <p className="mt-2 text-xs text-red-400">{errors.signature}</p>
            )}
          </div>
        )}
      </div>

      {/* Legal consent */}
      <div className="rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3">
        <p className="text-white/30 text-xs leading-relaxed">
          By signing and submitting this application, I certify that the information provided
          is true and accurate to the best of my knowledge. I authorize Advantage Services, as an
          IRS Certified Acceptance Agent, to process my ITIN application and verify my
          identification documents.
        </p>
      </div>
    </div>
  );
}

/* ─── Review field helper ─── */

function ReviewField({
  label,
  value,
  muted = false,
  fullWidth = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <span className="text-white/30 text-xs">{label}</span>
      <p className={`text-sm ${muted ? "text-white/25 italic" : "text-white/80"}`}>{value}</p>
    </div>
  );
}
