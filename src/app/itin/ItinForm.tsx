"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Lazy-load capture components — they're heavy (camera APIs, canvas processing)
const DocumentScanner = dynamic(() => import("./DocumentScanner"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 bg-[#0F1B2D] flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  ),
});
const SelfieCapture = dynamic(() => import("./SelfieCapture"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 bg-[#0F1B2D] flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  ),
});
const SignaturePad = dynamic(() => import("./SignaturePad"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 bg-[#0F1B2D] flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  ),
});

/* ═══════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════ */

const CITIES = [
  { value: "new_york", label: "New York", icon: "🗽" },
  { value: "nashville", label: "Nashville", icon: "🎵" },
] as const;

const DEFAULT_EMPLOYER = "Tropical Stars Inc.";

interface ItinData {
  // Step 1
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  companyName: string;
  // Step 2
  city: string;
  addressUsa: string;
  addressHomeCountry: string;
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
  companyName: DEFAULT_EMPLOYER,
  city: "",
  addressUsa: "",
  addressHomeCountry: "",
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
   Keyboard-aware bottom offset (iPad/mobile)
   ═══════════════════════════════════════════════ */

function useKeyboardHeight() {
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return;

    function onResize() {
      // When keyboard opens, visualViewport.height shrinks.
      // The difference = keyboard height.
      const diff = window.innerHeight - (vv?.height ?? window.innerHeight);
      setKbHeight(diff > 50 ? diff : 0); // ignore tiny resizes
    }

    vv.addEventListener("resize", onResize);
    // NOTE: scroll listener removed — causes false positive keyboard detection
    // when iPad Safari address bar hides/shows
    return () => {
      vv.removeEventListener("resize", onResize);
    };
  }, []);

  return kbHeight;
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
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  // Preview URLs for captured files
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [sigPreview, setSigPreview] = useState<string | null>(null);

  // Refs for object URL cleanup on unmount
  const docPreviewRef = useRef<string | null>(null);
  const selfiePreviewRef = useRef<string | null>(null);
  const sigPreviewRef = useRef<string | null>(null);

  // Slide animation state
  const [displayStep, setDisplayStep] = useState(0);
  const [animPhase, setAnimPhase] = useState<"idle" | "exit" | "enter">("idle");
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");

  // Track iPad/mobile keyboard height so Continue button stays visible
  const kbHeight = useKeyboardHeight();
  const formRef = useRef<HTMLDivElement>(null);

  // Ref for focusing first input after step transition
  const stepContentRef = useRef<HTMLDivElement>(null);

  // Revoke all object URLs on unmount
  useEffect(() => {
    return () => {
      if (docPreviewRef.current) URL.revokeObjectURL(docPreviewRef.current);
      if (selfiePreviewRef.current) URL.revokeObjectURL(selfiePreviewRef.current);
      if (sigPreviewRef.current) URL.revokeObjectURL(sigPreviewRef.current);
    };
  }, []);

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
      const url = createPreviewUrl(file);
      if (docPreviewRef.current) URL.revokeObjectURL(docPreviewRef.current);
      docPreviewRef.current = url;
      setDocPreview(url);
      setShowDocScanner(false);
    },
    [update, createPreviewUrl]
  );

  const handleSelfieCapture = useCallback(
    (file: File) => {
      update("selfie", file);
      const url = createPreviewUrl(file);
      if (selfiePreviewRef.current) URL.revokeObjectURL(selfiePreviewRef.current);
      selfiePreviewRef.current = url;
      setSelfiePreview(url);
      setShowSelfieCapture(false);
    },
    [update, createPreviewUrl]
  );

  const handleSignatureSave = useCallback(
    (file: File) => {
      update("signature", file);
      const url = createPreviewUrl(file);
      if (sigPreviewRef.current) URL.revokeObjectURL(sigPreviewRef.current);
      sigPreviewRef.current = url;
      setSigPreview(url);
      setShowSignaturePad(false);
    },
    [update, createPreviewUrl]
  );

  const clearDoc = useCallback(() => {
    update("documentScan", null);
    update("hasPassport", false);
    if (docPreviewRef.current) {
      URL.revokeObjectURL(docPreviewRef.current);
      docPreviewRef.current = null;
    }
    setDocPreview(null);
  }, [update]);

  const clearSelfie = useCallback(() => {
    update("selfie", null);
    if (selfiePreviewRef.current) {
      URL.revokeObjectURL(selfiePreviewRef.current);
      selfiePreviewRef.current = null;
    }
    setSelfiePreview(null);
  }, [update]);

  const clearSignature = useCallback(() => {
    update("signature", null);
    if (sigPreviewRef.current) {
      URL.revokeObjectURL(sigPreviewRef.current);
      sigPreviewRef.current = null;
    }
    setSigPreview(null);
  }, [update]);

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

  // Focus first input of new step after transition
  function focusFirstInput() {
    requestAnimationFrame(() => {
      if (!stepContentRef.current) return;
      const focusable = stepContentRef.current.querySelector<HTMLElement>(
        'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])'
      );
      focusable?.focus();
    });
  }

  function transitionToStep(target: number) {
    if (animPhase !== "idle" || target === step) return;
    setSlideDirection(target > step ? "left" : "right");
    // Phase 1: exit animation on current step
    setAnimPhase("exit");
    setTimeout(() => {
      // Phase 2: switch step, begin enter animation
      setStep(target);
      setDisplayStep(target);
      setAnimPhase("enter");
      setTimeout(() => {
        // Phase 3: animation complete
        setAnimPhase("idle");
        focusFirstInput();
      }, 300);
    }, 250);
  }

  function nextStep() {
    if (validateStep(step)) {
      // No auto-open behavior — user controls camera via CTA buttons
      transitionToStep(Math.min(step + 1, STEPS.length - 1));
    }
  }

  function prevStep() {
    transitionToStep(Math.max(step - 1, 0));
  }

  // ─── Submit ───

  async function handleSubmit() {
    if (submitting) return;
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

  // Compute animation classes for step content
  const getStepAnimClass = () => {
    if (animPhase === "exit") {
      return slideDirection === "left"
        ? "opacity-0 -translate-x-5"
        : "opacity-0 translate-x-5";
    }
    if (animPhase === "enter") {
      return slideDirection === "left"
        ? "opacity-0 translate-x-5"
        : "opacity-0 -translate-x-5";
    }
    return "opacity-100 translate-x-0";
  };

  return (
    <>
      <div ref={formRef} className="flex-1 flex flex-col px-4 sm:px-6 md:px-12 lg:px-24 max-w-3xl mx-auto w-full relative">
        {/* ─── Progress Indicator ─── */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => {
                  if (i < step) transitionToStep(i);
                }}
                className="flex flex-col items-center gap-1.5 group"
                disabled={i > step}
                aria-label={`Step ${i + 1}: ${s.label}${completedSteps.has(i) ? ' (completed)' : ''}`}
              >
                {/* Step circle — 44px min for Apple HIG */}
                <div
                  className={`
                    w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center
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
                    text-xs font-medium transition-colors duration-200
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

        {/* ─── Scrollable Form Content ─── */}
        <div
          ref={stepContentRef}
          aria-live="polite"
          className={`
            flex-1 overflow-y-auto pb-20 transition-all duration-250 ease-out
            ${getStepAnimClass()}
          `}
        >
          {displayStep === 0 && (
            <StepPersonal data={data} errors={errors} update={update} />
          )}
          {displayStep === 1 && (
            <StepLocation data={data} errors={errors} update={update} />
          )}
          {displayStep === 2 && (
            <StepDocument
              data={data}
              docPreview={docPreview}
              onOpenScanner={() => setShowDocScanner(true)}
              onClear={clearDoc}
            />
          )}
          {displayStep === 3 && (
            <StepSelfie
              data={data}
              selfiePreview={selfiePreview}
              onOpenCamera={() => setShowSelfieCapture(true)}
              onClear={clearSelfie}
            />
          )}
          {displayStep === 4 && (
            <StepReview
              data={data}
              errors={errors}
              docPreview={docPreview}
              selfiePreview={selfiePreview}
              sigPreview={sigPreview}
              onOpenSignaturePad={() => setShowSignaturePad(true)}
              onClearSignature={clearSignature}
            />
          )}
        </div>

        {/* ─── Submit Error ─── */}
        {submitError && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-2 mb-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{submitError}</span>
          </div>
        )}

        {/* ─── Keyboard Dismiss Button ─── */}
        {kbHeight > 0 && (
          <div
            className="fixed left-0 right-0 z-30 flex justify-end px-4 sm:px-6 md:px-12 lg:px-24 transition-[bottom] duration-200 ease-out"
            style={{ bottom: `${kbHeight}px` }}
          >
            <button
              type="button"
              onClick={() => (document.activeElement as HTMLElement)?.blur()}
              className="
                mb-1 px-4 py-2 rounded-lg text-xs font-semibold
                bg-white/10 backdrop-blur-sm text-white/70
                hover:bg-white/20 hover:text-white
                active:scale-[0.97] transition-all duration-150
              "
            >
              Done
            </button>
          </div>
        )}

        {/* ─── Fixed Bottom Navigation — follows keyboard ─── */}
        <div
          className="fixed left-0 right-0 z-20 px-4 sm:px-6 md:px-12 lg:px-24 pt-3 pb-4 transition-[bottom] duration-200 ease-out"
          style={{
            bottom: kbHeight > 0 ? `${kbHeight}px` : "0px",
            paddingBottom: kbHeight > 0 ? undefined : "max(1rem, env(safe-area-inset-bottom))",
          }}
        >
          {/* Gradient backdrop — blends into the dark background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1B2D] via-[#0F1B2D]/98 to-transparent pointer-events-none" />

          <div className="relative flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={prevStep}
                className="
                  flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold
                  bg-white/5 text-white/60
                  hover:bg-white/10 hover:text-white/80
                  active:scale-[0.97] transition-all duration-200
                  min-h-[48px]
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
                  min-h-[48px]
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
                transition-all duration-200 active:scale-[0.98]
                min-h-[48px]
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
                  Continue
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Full-screen Overlays ─── */}
      {showDocScanner && (
        <DocumentScanner
          onCapture={handleDocCapture}
          onClose={() => {
            setShowDocScanner(false);
            // Stay on current step — do NOT auto-advance
          }}
          label="Scan Passport / ID"
        />
      )}

      {showSelfieCapture && (
        <SelfieCapture
          onCapture={handleSelfieCapture}
          onClose={() => {
            setShowSelfieCapture(false);
            // Stay on current step — do NOT auto-advance
          }}
        />
      )}

      {showSignaturePad && (
        <SignaturePad
          onSign={handleSignatureSave}
          onClose={() => setShowSignaturePad(false)}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════
   Shared UI Primitives
   ═══════════════════════════════════════════════ */

function Label({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-white/70 mb-1.5">
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
  large,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "email" | "text" | "decimal";
  autoComplete?: string;
  large?: boolean;
  id?: string;
}) {
  return (
    <>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className={`
          w-full px-4 py-3.5 rounded-xl
          ${large ? "text-lg" : "text-base"}
          bg-white/[0.07] border
          text-white placeholder-white/25
          focus:outline-none focus:border-[#4F56E8] focus:ring-1 focus:ring-[#4F56E8]/30
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
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="
        w-full px-4 py-3.5 rounded-xl text-lg tracking-wide resize-none
        bg-white/[0.07] border border-white/10
        text-white placeholder-white/25
        focus:outline-none focus:border-[#4F56E8] focus:ring-1 focus:ring-[#4F56E8]/30
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
   Employer Badge (Tropical Stars default)
   ═══════════════════════════════════════════════ */

function EmployerBadge({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div>
        <Label htmlFor="itin-company">Company / Employer</Label>
        <div className="flex gap-2">
          <Input
            id="itin-company"
            value={value}
            onChange={onChange}
            placeholder="Company name"
            autoComplete="organization"
          />
          <button
            type="button"
            onClick={() => {
              if (!value.trim()) onChange(DEFAULT_EMPLOYER);
              setEditing(false);
            }}
            className="
              shrink-0 px-4 py-3.5 rounded-xl text-sm font-medium
              bg-white/5 border border-white/10 text-white/60
              hover:bg-white/10 hover:text-white/80
              active:scale-[0.97] transition-all duration-200
              min-h-[48px]
            "
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label>Company / Employer</Label>
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10">
        {/* Company icon */}
        <div className="w-9 h-9 rounded-lg bg-[#4F56E8]/15 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-[#818CF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-white/80 text-base font-semibold block truncate">{value}</span>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="
            shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            text-white/40 hover:text-white/70 hover:bg-white/5
            transition-all duration-200
          "
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Change
        </button>
      </div>
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
    <div className="space-y-3">
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

      {/* Employer badge — moved to Step 1 */}
      <EmployerBadge
        value={data.companyName}
        onChange={(v) => update("companyName", v)}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required htmlFor="itin-firstName">First Name</Label>
          <Input
            id="itin-firstName"
            value={data.firstName}
            onChange={(v) => update("firstName", v)}
            error={errors.firstName}
            placeholder="Juan"
            autoComplete="given-name"
          />
        </div>
        <div>
          <Label required htmlFor="itin-lastName">Last Name</Label>
          <Input
            id="itin-lastName"
            value={data.lastName}
            onChange={(v) => update("lastName", v)}
            error={errors.lastName}
            placeholder="Garcia"
            autoComplete="family-name"
          />
        </div>
      </div>

      <div>
        <Label required htmlFor="itin-phone">Phone Number</Label>
        <Input
          id="itin-phone"
          value={data.phone}
          onChange={(v) => update("phone", v)}
          error={errors.phone}
          placeholder="(929) 555-0123"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          large
        />
      </div>

      <div>
        <Label htmlFor="itin-email">Email</Label>
        <Input
          id="itin-email"
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
      <div className="flex items-center gap-2 pt-1 text-white/25 text-xs">
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
    <div className="space-y-3">
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
                min-h-[48px]
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
        <Label htmlFor="itin-addressUsa">US Address</Label>
        <Input
          id="itin-addressUsa"
          value={data.addressUsa}
          onChange={(v) => update("addressUsa", v)}
          placeholder="Street, City, State, ZIP"
          autoComplete="street-address"
          large
        />
      </div>

      <div>
        <Label htmlFor="itin-addressHomeCountry">Home Country Address</Label>
        <TextArea
          id="itin-addressHomeCountry"
          value={data.addressHomeCountry}
          onChange={(v) => update("addressHomeCountry", v)}
          placeholder="Full address in your home country"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="itin-amount">Annual Earnings ($)</Label>
        <Input
          id="itin-amount"
          value={data.amount}
          onChange={(v) => update("amount", v)}
          placeholder="0.00"
          inputMode="decimal"
          large
        />
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
                min-h-[48px]
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
                min-h-[48px]
              "
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* ─── Scan Prompt — manual trigger, no auto-open ─── */
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
                min-h-[48px]
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
                min-h-[48px]
              "
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* ─── Capture Prompt — manual trigger, no auto-open ─── */
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
  onOpenSignaturePad,
  onClearSignature,
}: {
  data: ItinData;
  errors: Partial<Record<keyof ItinData, string>>;
  docPreview: string | null;
  selfiePreview: string | null;
  sigPreview: string | null;
  onOpenSignaturePad: () => void;
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
            <ReviewField label="Employer" value={data.companyName || "Not provided"} muted={!data.companyName} />
          </div>
        </div>

        {/* Location & Work */}
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider mb-3">
            Location & Employment
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewField label="City" value={cityLabel} />
            <ReviewField
              label="Annual Earnings"
              value={data.amount ? `$${data.amount}` : "Not provided"}
              muted={!data.amount}
            />
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

      {/* Signature Section — toggle pattern like cameras */}
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
          /* Signed preview with retake */
          <div className="space-y-3">
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
            <button
              type="button"
              onClick={onOpenSignaturePad}
              className="
                w-full flex items-center justify-center gap-2
                px-4 py-3 rounded-xl text-sm font-semibold
                bg-white/5 border border-white/10 text-white/60
                hover:bg-white/10 hover:text-white/80
                active:scale-[0.97] transition-all duration-200
                min-h-[48px]
              "
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake Signature
            </button>
          </div>
        ) : (
          /* Tap to Sign CTA — opens overlay */
          <div>
            <button
              type="button"
              onClick={onOpenSignaturePad}
              className="
                w-full py-10 rounded-2xl border-2 border-dashed border-[#4F56E8]/30
                bg-[#4F56E8]/5 hover:bg-[#4F56E8]/10
                flex flex-col items-center gap-3
                transition-all duration-200 active:scale-[0.98]
                group
              "
            >
              <div className="w-14 h-14 rounded-2xl bg-[#4F56E8]/20 flex items-center justify-center group-hover:bg-[#4F56E8]/30 transition-colors">
                <svg className="w-7 h-7 text-[#818CF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <div className="text-center">
                <span className="text-base font-semibold text-white/80 block">
                  Tap to Sign
                </span>
                <span className="text-sm text-white/40 mt-1 block">
                  Draw your signature with finger or stylus
                </span>
              </div>
            </button>
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
