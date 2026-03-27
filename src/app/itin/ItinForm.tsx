"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import AddressAutocomplete from "./AddressAutocomplete";

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
const VoiceFill = dynamic(() => import("./VoiceFill"), {
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

interface ItinData {
  // Step 0 — Passport Scan
  documentScan: File | null;
  passportCountry: string;
  // Step 1 — Personal
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  countryOfBirth: string;
  cityOfBirth: string;
  countryOfCitizenship: string;
  phone: string;
  email: string;
  companyName: string;
  // Step 2 — Location
  city: string;
  addressUsa: string;
  zipCode: string;
  addressHomeCountry: string; // street address (backward compat key)
  homeCountry: string;
  homeCity: string;
  homeAddress: string;
  usEntryDate: string;
  amount: string;
  // Step 3 — Selfie
  selfie: File | null;
  // Step 4 — Review & Sign
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
  middleName: "",
  dateOfBirth: "",
  countryOfBirth: "",
  cityOfBirth: "",
  countryOfCitizenship: "",
  phone: "",
  email: "",
  companyName: "",
  city: "",
  addressUsa: "",
  zipCode: "",
  addressHomeCountry: "",
  homeCountry: "",
  homeCity: "",
  homeAddress: "",
  usEntryDate: "",
  amount: "",
  documentScan: null,
  passportCountry: "",
  selfie: null,
  signature: null,
  hasPassport: false,
  passportNumber: "",
  passportExpiry: "",
  comment: "",
};

const STEPS = [
  { label: "Passport", shortLabel: "Scan" },
  { label: "Personal", shortLabel: "Info" },
  { label: "Location", shortLabel: "Location" },
  { label: "Review", shortLabel: "Sign" },
] as const;

/** Convert YYYY-MM-DD to MM/DD/YYYY for display */
function formatDateUS(d: string): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return y && m && day ? `${m}/${day}/${y}` : d;
}

/** Format raw digits as (XXX) XXX-XXXX for display */
function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

interface Props {
  onSuccess: () => void;
  testMode?: boolean;
  companyName?: string;
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

export function ItinForm({ onSuccess, testMode = false, companyName }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ItinData>(() => ({
    ...INITIAL,
    companyName: companyName || "",
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof ItinData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Capture overlay states
  const [showDocScanner, setShowDocScanner] = useState(false);
  const [showSelfieCapture, setShowSelfieCapture] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showVoiceFill, setShowVoiceFill] = useState(false);
  const [showI94Lookup, setShowI94Lookup] = useState(false);

  // Preview URLs for captured files
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [sigPreview, setSigPreview] = useState<string | null>(null);

  // OCR status for passport auto-fill
  const [ocrStatus, setOcrStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [ocrFields, setOcrFields] = useState<Record<string, string> | null>(null);

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

  // Auto-detect appointment city via GPS
  useEffect(() => {
    if (data.city) return; // already set
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Nashville area: ~36.1N, ~-86.8W
        // New York area: ~40.7N, ~-74.0W
        // Simple distance check — within ~100 miles
        const distNY = Math.sqrt((latitude - 40.7) ** 2 + (longitude + 74.0) ** 2);
        const distNash = Math.sqrt((latitude - 36.16) ** 2 + (longitude + 86.78) ** 2);
        if (distNY < 2) {
          update("city", "new_york");
        } else if (distNash < 2) {
          update("city", "nashville");
        }
        // If neither, leave it for manual selection
      },
      () => { /* silently ignore GPS denial */ },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    async (file: File) => {
      update("documentScan", file);
      update("hasPassport", true);
      const url = createPreviewUrl(file);
      if (docPreviewRef.current) URL.revokeObjectURL(docPreviewRef.current);
      docPreviewRef.current = url;
      setDocPreview(url);
      setShowDocScanner(false);

      // Trigger passport OCR — convert file to base64 data URL
      setOcrStatus("processing");
      setOcrFields(null);
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          try {
            const res = await fetch("/api/passport-ocr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: dataUrl }),
            });
            if (res.ok) {
              const responseData = await res.json();
              if (responseData.success && responseData.fields) {
                const fields = responseData.fields as Record<string, string>;
                const applied: Record<string, string> = {};
                for (const [key, value] of Object.entries(fields)) {
                  if (value && key in INITIAL) {
                    update(key as keyof ItinData, value as never);
                    applied[key] = value;
                  }
                }
                setOcrFields(applied);
                setOcrStatus("success");
              } else {
                setOcrStatus("failed");
              }
            } else {
              setOcrStatus("failed");
            }
          } catch {
            setOcrStatus("failed");
          }
        };
        reader.onerror = () => {
          setOcrStatus("failed");
        };
        reader.readAsDataURL(file);
      } catch {
        // OCR is best-effort — form still works without it
        console.warn("[passport-ocr] Failed, continuing without auto-fill");
        setOcrStatus("failed");
      }
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
    setOcrStatus("idle");
    setOcrFields(null);
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

  const handleVoiceFill = useCallback((fields: Partial<ItinData>) => {
    Object.entries(fields).forEach(([key, value]) => {
      if (value && key in INITIAL) {
        update(key as keyof ItinData, value as ItinData[keyof ItinData]);
      }
    });
    setShowVoiceFill(false);
  }, [update]);

  // ─── Validation ───

  function validateStep(s: number): boolean {
    const errs: Partial<Record<keyof ItinData, string>> = {};

    // Step 0: Passport scan — no required fields (scanning encouraged, not mandatory)

    if (s === 1) {
      if (!data.firstName.trim()) errs.firstName = "First name is required";
      if (!data.lastName.trim()) errs.lastName = "Last name is required";
      if (!data.dateOfBirth) errs.dateOfBirth = "Date of birth is required";
      if (!data.countryOfBirth) errs.countryOfBirth = "Country of birth is required";
      if (!data.cityOfBirth.trim()) errs.cityOfBirth = "City of birth is required";
      if (!data.countryOfCitizenship) errs.countryOfCitizenship = "Country of citizenship is required";
      if (!data.phone.trim() || data.phone.replace(/\D/g, "").length < 7)
        errs.phone = "Valid phone number is required";
      if (!data.email.trim() || !data.email.includes("@"))
        errs.email = "Valid email is required";
    }

    if (s === 2) {
      if (!data.city) errs.city = "Please select appointment city";
      if (!data.zipCode.trim()) errs.zipCode = "ZIP code is required";
      if (!data.usEntryDate) errs.usEntryDate = "US entry date is required";
      if (!data.homeCountry) errs.homeCountry = "Home country is required";
      if (!data.homeCity.trim()) errs.homeCity = "Home city is required";
      if (!data.homeAddress.trim()) errs.homeAddress = "Home address is required";
    }

    if (s === 3) {
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
      // All text uppercase for TaxWise compatibility
      const up = (s: string) => s.trim().toUpperCase();
      payload.append("firstName", up(data.firstName));
      payload.append("lastName", up(data.lastName));
      payload.append("middleName", up(data.middleName));
      payload.append("dateOfBirth", data.dateOfBirth);
      payload.append("countryOfBirth", up(data.countryOfBirth));
      payload.append("cityOfBirth", up(data.cityOfBirth));
      payload.append("countryOfCitizenship", up(data.countryOfCitizenship));
      payload.append("phone", data.phone.trim());
      payload.append("email", data.email.trim().toLowerCase());
      payload.append("city", data.city);
      payload.append("addressUsa", up(data.addressUsa));
      payload.append("zipCode", data.zipCode.trim());
      payload.append("addressHomeCountry", up(data.addressHomeCountry));
      payload.append("homeCountry", up(data.homeCountry));
      payload.append("homeCity", up(data.homeCity));
      payload.append("homeAddress", up(data.homeAddress));
      payload.append("usEntryDate", data.usEntryDate);
      payload.append("companyName", up(data.companyName));
      payload.append("amount", data.amount.trim());
      payload.append("hasPassport", String(!!data.documentScan));
      payload.append("passportNumber", up(data.passportNumber));
      payload.append("passportExpiry", data.passportExpiry);
      payload.append("passportCountry", up(data.passportCountry));
      payload.append("comment", up(data.comment));

      if (data.documentScan) {
        payload.append("documentScan", data.documentScan);
      }
      if (data.selfie) {
        payload.append("selfie", data.selfie);
      }
      if (data.signature) {
        payload.append("signature", data.signature);
      }

      const submitUrl = testMode ? "/api/itin-submit?test=1" : "/api/itin-submit";
      const res = await fetch(submitUrl, {
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
    if (data.documentScan) completed.add(0);
    if (data.firstName && data.lastName && data.phone) completed.add(1);
    if (data.city) completed.add(2);
    if (data.signature) completed.add(3);
    return completed;
  }, [data.documentScan, data.firstName, data.lastName, data.phone, data.city, data.signature]);

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

        {/* AVA Voice — available on all steps */}
        {(step === 1 || step === 2) && (
          <div className="flex flex-col items-center mb-5">
            <button
              type="button"
              onClick={() => setShowVoiceFill(true)}
              className="
                w-20 h-20 rounded-full
                bg-gradient-to-br from-emerald-500 to-teal-600
                flex items-center justify-center
                shadow-[0_0_40px_rgba(16,185,129,0.3)]
                hover:shadow-[0_0_60px_rgba(16,185,129,0.4)]
                active:scale-[0.93] transition-all duration-200
                mb-2
              "
            >
              <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <span className="text-white font-bold text-base">Speak to Fill</span>
            <span className="text-white/35 text-xs">with AVA voice assistant</span>
          </div>
        )}

        {/* ─── Scrollable Form Content ─── */}
        <div
          ref={stepContentRef}
          aria-live="polite"
          className={`
            overflow-y-auto pb-4 transition-all duration-250 ease-out
            ${getStepAnimClass()}
          `}
        >
          {displayStep === 0 && (
            <StepDocument
              data={data}
              errors={errors}
              update={update}
              docPreview={docPreview}
              onOpenScanner={() => setShowDocScanner(true)}
              onClear={clearDoc}
              ocrStatus={ocrStatus}
              ocrFields={ocrFields}
            />
          )}
          {displayStep === 1 && (
            <StepPersonal
              data={data}
              errors={errors}
              update={update}
              companyLocked={!!companyName}
            />
          )}
          {displayStep === 2 && (
            <StepLocation data={data} errors={errors} update={update} onShowI94={() => setShowI94Lookup(true)} />
          )}
          {displayStep === 3 && (
            <StepReview
              data={data}
              errors={errors}
              docPreview={docPreview}
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

        {/* ─── Bottom Navigation ─── */}
        <div className="shrink-0 pt-3 pb-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>

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

            {/* Skip button — only passport scan step */}
            {step === 0 && (
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

      {showVoiceFill && (
        <VoiceFill
          step={step}
          currentData={{ ...data }}
          onFill={handleVoiceFill}
          onClose={() => setShowVoiceFill(false)}
        />
      )}

      {showI94Lookup && (
        <I94Lookup data={data} onClose={() => setShowI94Lookup(false)} />
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
        onFocus={(e) => {
          // Scroll input into view after keyboard opens on iPad
          setTimeout(() => {
            e.target.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 350);
        }}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        translate="no"
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
      onFocus={(e) => {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 350);
      }}
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

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex-1 border-t border-white/10" />
      <span className="text-white/30 text-xs uppercase tracking-widest font-medium">{label}</span>
      <div className="flex-1 border-t border-white/10" />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Country Select — reusable dropdown
   ═══════════════════════════════════════════════ */

const FIRST_COUNTRY = "Jamaica";

const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile",
  "China", "Colombia", "Comoros", "Congo (DRC)", "Congo (Republic)",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea",
  "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland",
  "France", "Gabon", "Gambia", "Georgia", "Germany",
  "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
  "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica",
  "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
  "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia",
  "Norway", "Oman", "Pakistan", "Palau", "Palestine",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa",
  "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden",
  "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

// Jamaica first, then all countries alphabetically (no duplicates)
const COUNTRY_OPTIONS = (() => {
  const rest = ALL_COUNTRIES.filter((c) => c !== FIRST_COUNTRY);
  return { first: FIRST_COUNTRY, rest };
})();

function CountrySelect({
  value,
  onChange,
  id,
  required,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        translate="no"
        onFocus={(e) => {
          setTimeout(() => {
            e.target.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 350);
        }}
        required={required}
        className={`
          w-full px-4 py-3.5 rounded-xl text-base appearance-none
          bg-white/[0.07] border
          text-white
          focus:outline-none focus:border-[#4F56E8] focus:ring-1 focus:ring-[#4F56E8]/30
          transition-all duration-200
          ${!value ? "text-white/25" : ""}
          ${error ? "border-red-400/50 ring-1 ring-red-400/20" : "border-white/10"}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.3)' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
          paddingRight: "2.5rem",
        }}
      >
        <option value="" disabled className="bg-[#0F1B2D] text-white/40">
          Select country...
        </option>
        <option value={COUNTRY_OPTIONS.first} className="bg-[#0F1B2D] text-white font-semibold">
          {COUNTRY_OPTIONS.first}
        </option>
        <option disabled className="bg-[#0F1B2D] text-white/20">──────────</option>
        {COUNTRY_OPTIONS.rest.map((c) => (
          <option key={c} value={c} className="bg-[#0F1B2D] text-white">
            {c}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </>
  );
}

/* ═══════════════════════════════════════════════
   Employer Badge (Tropical Stars default)
   ═══════════════════════════════════════════════ */

function EmployerBadge({
  value,
  onChange,
  locked,
}: {
  value: string;
  onChange: (v: string) => void;
  locked: boolean;
}) {
  // Locked badge — company was selected on the welcome screen
  if (locked && value) {
    return (
      <div>
        <Label>Company / Employer</Label>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10">
          <div className="w-9 h-9 rounded-lg bg-[#4F56E8]/15 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#818CF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-white/80 text-base font-semibold block truncate">{value}</span>
          </div>
          <svg className="w-4 h-4 text-white/20 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
      </div>
    );
  }

  // Editable text field — individual applicant path
  return (
    <div>
      <Label htmlFor="itin-company">Company / Employer (optional)</Label>
      <Input
        id="itin-company"
        value={value}
        onChange={onChange}
        placeholder="Enter company name (if applicable)"
        autoComplete="organization"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Step 1 — Personal Info (renders at displayStep 1)
   ═══════════════════════════════════════════════ */

interface StepProps {
  data: ItinData;
  errors: Partial<Record<keyof ItinData, string>>;
  update: <K extends keyof ItinData>(field: K, value: ItinData[K]) => void;
  companyLocked?: boolean;
}

function StepPersonal({ data, errors, update, companyLocked = false }: StepProps) {
  return (
    <div className="space-y-3">
      <SectionHeader
        title="Personal Information"
        subtitle="W-7 application details for your ITIN."
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

      {/* Employer badge */}
      <EmployerBadge
        value={data.companyName}
        onChange={(v) => update("companyName", v)}
        locked={companyLocked}
      />

      {/* Row 1: First / Last name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required htmlFor="itin-firstName">First Name</Label>
          <Input
            id="itin-firstName"
            value={data.firstName}
            onChange={(v) => update("firstName", v)}
            error={errors.firstName}
            placeholder="Kemar"
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
            placeholder="Campbell"
            autoComplete="family-name"
          />
        </div>
      </div>

      {/* Row 2: Middle Name */}
      <div>
        <Label htmlFor="itin-middleName">Middle Name</Label>
        <Input
          id="itin-middleName"
          value={data.middleName}
          onChange={(v) => update("middleName", v)}
          placeholder="Optional"
          autoComplete="additional-name"
        />
      </div>

      <div>
        <Label required htmlFor="itin-dob">Date of Birth</Label>
        <Input
          id="itin-dob"
          value={data.dateOfBirth}
          onChange={(v) => update("dateOfBirth", v)}
          error={errors.dateOfBirth}
          type="date"
        />
      </div>

      <div>
        <Label required htmlFor="itin-cityOfBirth">City / Town of Birth</Label>
        <Input
          id="itin-cityOfBirth"
          value={data.cityOfBirth}
          onChange={(v) => update("cityOfBirth", v)}
          error={errors.cityOfBirth}
          placeholder="Kingston"
        />
      </div>

      {/* Row 4: Country of Birth | Country of Citizenship */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required htmlFor="itin-countryOfBirth">Country of Birth</Label>
          <CountrySelect
            id="itin-countryOfBirth"
            value={data.countryOfBirth}
            onChange={(v) => update("countryOfBirth", v)}
            required
            error={errors.countryOfBirth}
          />
        </div>
        <div>
          <Label required htmlFor="itin-countryOfCitizenship">Country of Citizenship</Label>
          <CountrySelect
            id="itin-countryOfCitizenship"
            value={data.countryOfCitizenship}
            onChange={(v) => update("countryOfCitizenship", v)}
            required
            error={errors.countryOfCitizenship}
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <Label required htmlFor="itin-phone">Phone Number</Label>
        <Input
          id="itin-phone"
          value={formatPhoneDisplay(data.phone)}
          onChange={(v) => update("phone", v.replace(/\D/g, "").slice(0, 10))}
          error={errors.phone}
          placeholder="(555) 666-7777"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          large
        />
      </div>

      {/* Email */}
      <div>
        <Label required htmlFor="itin-email">Email</Label>
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
   I-94 Entry Date Lookup Modal
   ═══════════════════════════════════════════════ */

function I94Lookup({ data, onClose }: { data: ItinData; onClose: () => void }) {
  const fields = [
    { label: "First Name", value: data.firstName.toUpperCase() },
    { label: "Last Name", value: data.lastName.toUpperCase() },
    {
      label: "Birth Date",
      value: formatDateUS(data.dateOfBirth),
    },
    { label: "Passport Number", value: data.passportNumber.toUpperCase() },
    {
      label: "Country",
      value: (data.countryOfBirth || data.passportCountry).toUpperCase(),
    },
  ].filter((f) => f.value);

  const [copied, setCopied] = useState<string | null>(null);

  const copyField = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyAll = () => {
    const text = fields.map(f => `${f.label}: ${f.value}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied("ALL");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl bg-[#1A2D45] border border-white/10 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white text-center mb-1">Look Up Entry Date</h3>
        <p className="text-white/40 text-xs text-center mb-4">
          Tap &quot;Copy All&quot; then paste each field on the I-94 site
        </p>

        {/* Copy All button */}
        <button
          onClick={copyAll}
          className={`w-full mb-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            copied === "ALL"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-white/10 text-white/70 border border-white/10 hover:bg-white/15"
          }`}
        >
          {copied === "ALL" ? "✓ Copied to clipboard" : "Copy All Fields"}
        </button>

        {/* Copyable fields */}
        <div className="space-y-2 mb-5">
          {fields.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10"
            >
              <span className="text-white/40 text-xs w-24 shrink-0">{f.label}</span>
              <span className="text-white font-semibold text-sm flex-1 truncate">{f.value}</span>
              <button
                onClick={() => copyField(f.value, f.label)}
                className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 text-white/60 hover:bg-white/20 hover:text-white active:scale-[0.95] transition-all"
              >
                {copied === f.label ? "✓" : "Copy"}
              </button>
            </div>
          ))}
        </div>

        {/* Open CBP site */}
        <a
          href="https://i94.cbp.dhs.gov/search/history-search"
          target="_blank"
          rel="noopener noreferrer"
          className="
            w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
            bg-[#4F56E8] text-white font-semibold text-sm
            hover:bg-[#5B63F0] active:scale-[0.97] transition-all duration-200
            shadow-[0_0_20px_rgba(79,86,232,0.2)]
          "
        >
          Open I-94 Website
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 rounded-xl text-white/40 text-sm font-medium hover:text-white/60 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Step 2 — Location & Work (renders at displayStep 2)
   ═══════════════════════════════════════════════ */

function StepLocation({ data, errors, update, onShowI94 }: StepProps & { onShowI94?: () => void }) {
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

      {/* US Address with autocomplete */}
      <div>
        <Label required htmlFor="itin-addressUsa">U.S. Address (Street, City, State)</Label>
        <AddressAutocomplete
          id="itin-addressUsa"
          value={data.addressUsa}
          onChange={(v) => update("addressUsa", v)}
          placeholder="123 Main St, City, State"
        />
      </div>

      {/* ZIP + Entry Date side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required htmlFor="itin-zipCode">ZIP</Label>
          <Input
            id="itin-zipCode"
            value={data.zipCode}
            onChange={(v) => update("zipCode", v)}
            error={errors.zipCode}
            placeholder="11004"
            inputMode="numeric"
            autoComplete="postal-code"
          />
        </div>
        <div>
          <Label required htmlFor="itin-usEntryDate">Entry Date</Label>
          <Input
            id="itin-usEntryDate"
            value={data.usEntryDate}
            onChange={(v) => update("usEntryDate", v)}
            error={errors.usEntryDate}
            type="date"
          />
          {onShowI94 && (
            <button
              type="button"
              onClick={onShowI94}
              className="
                mt-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold
                bg-[#4F56E8]/10 border border-[#4F56E8]/25 text-[#818CF8]
                hover:bg-[#4F56E8]/20 hover:text-white
                active:scale-[0.97] transition-all duration-200
                flex items-center justify-center gap-2
              "
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Look Up Entry Date (I-94)
            </button>
          )}
        </div>
      </div>

      <SectionDivider label="Home Country Information" />

      {/* Home Country | Home City */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required htmlFor="itin-homeCountry">Home Country</Label>
          <CountrySelect
            id="itin-homeCountry"
            value={data.homeCountry}
            onChange={(v) => update("homeCountry", v)}
            required
            error={errors.homeCountry}
          />
        </div>
        <div>
          <Label required htmlFor="itin-homeCity">Home City</Label>
          <Input
            id="itin-homeCity"
            value={data.homeCity}
            onChange={(v) => update("homeCity", v)}
            error={errors.homeCity}
            placeholder="e.g. Kingston"
          />
        </div>
      </div>

      {/* Home Address (street) — wired to addressHomeCountry for backward compat */}
      <div>
        <Label required htmlFor="itin-homeAddress">Home Address (non-US)</Label>
        <Input
          id="itin-homeAddress"
          value={data.homeAddress}
          onChange={(v) => {
            update("homeAddress", v);
            update("addressHomeCountry", v);
          }}
          placeholder="Street address in your home country"
        />
      </div>

      {/* Annual Earnings */}
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
   Step 0 — Passport Scan (renders at displayStep 0)
   ═══════════════════════════════════════════════ */

function StepDocument({
  data,
  docPreview,
  onOpenScanner,
  onClear,
  ocrStatus,
  ocrFields,
}: {
  data: ItinData;
  errors: Partial<Record<keyof ItinData, string>>;
  update: <K extends keyof ItinData>(field: K, value: ItinData[K]) => void;
  docPreview: string | null;
  onOpenScanner: () => void;
  onClear: () => void;
  ocrStatus: "idle" | "processing" | "success" | "failed";
  ocrFields: Record<string, string> | null;
}) {
  const OCR_FIELD_LABELS: Record<string, string> = {
    firstName: "First Name",
    lastName: "Last Name",
    middleName: "Middle Name",
    dateOfBirth: "Date of Birth",
    passportNumber: "Passport Number",
    passportExpiry: "Passport Expiry",
    passportCountry: "Issuing Country",
    countryOfCitizenship: "Citizenship",
    countryOfBirth: "Country of Birth",
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Scan Your Passport"
        subtitle="Place your passport face-down and scan it. We'll fill in your details automatically."
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

          {/* ─── OCR Status Indicator ─── */}
          {ocrStatus === "processing" && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#4F56E8]/10 border border-[#4F56E8]/20">
              <span className="w-4 h-4 border-2 border-[#818CF8] border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="text-[#818CF8] text-sm font-medium">Reading passport...</span>
            </div>
          )}
          {ocrStatus === "success" && ocrFields && Object.keys(ocrFields).length > 0 && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-400 text-sm font-semibold">Passport data extracted</span>
              </div>
              <div className="space-y-1">
                {Object.entries(ocrFields).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span className="text-white/40">{OCR_FIELD_LABELS[key] || key}:</span>
                    <span className="text-white/70 font-medium">{value}</span>
                    <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}
          {ocrStatus === "failed" && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-amber-400 text-sm font-medium">Could not read passport -- you can proceed anyway</span>
            </div>
          )}

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
                Tap to Scan Passport
              </span>
              <span className="text-sm text-white/40 mt-1 block">
                We&apos;ll auto-fill your details from the scan
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
   Step 3 — Selfie Verification (renders at displayStep 3)
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
        title="Passport Photo"
        subtitle="Take a passport-style photo: face the camera, neutral expression, eyes open"
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
                Take Passport Photo
              </span>
              <span className="text-sm text-white/40 mt-1 block">
                White background preferred, no glasses or head coverings
              </span>
            </div>
          </button>

          <p className="text-center text-white/25 text-xs">
            2x2 inch passport-style photo required for IRS W-7. You can skip and provide it in person.
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Step 4 — Review & Sign (renders at displayStep 4)
   ═══════════════════════════════════════════════ */

function StepReview({
  data,
  errors,
  docPreview,
  sigPreview,
  onOpenSignaturePad,
  onClearSignature,
}: {
  data: ItinData;
  errors: Partial<Record<keyof ItinData, string>>;
  docPreview: string | null;
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
            <ReviewField
              label="Name"
              value={[data.firstName, data.middleName, data.lastName].filter(Boolean).join(" ")}
            />
            <ReviewField label="Date of Birth" value={formatDateUS(data.dateOfBirth) || "Not provided"} muted={!data.dateOfBirth} />
            <ReviewField label="Birth City" value={data.cityOfBirth || "Not provided"} muted={!data.cityOfBirth} />
            <ReviewField label="Birth Country" value={data.countryOfBirth || "Not provided"} muted={!data.countryOfBirth} />
            <ReviewField label="Citizenship" value={data.countryOfCitizenship || "Not provided"} muted={!data.countryOfCitizenship} />
          </div>
        </div>

        {/* Contact */}
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider mb-3">
            Contact
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewField label="Phone" value={data.phone} />
            <ReviewField label="Email" value={data.email || "Not provided"} muted={!data.email} />
            <ReviewField label="Employer" value={data.companyName || "Not provided"} muted={!data.companyName} />
          </div>
        </div>

        {/* Location */}
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider mb-3">
            Location
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewField label="Appointment City" value={cityLabel} />
            <ReviewField
              label="US Entry Date"
              value={formatDateUS(data.usEntryDate) || "Not provided"}
              muted={!data.usEntryDate}
            />
            <ReviewField
              label="U.S. Address"
              value={`${data.addressUsa || "Not provided"}${data.zipCode ? ` ${data.zipCode}` : ""}`}
              muted={!data.addressUsa}
              fullWidth
            />
          </div>
        </div>

        {/* Home Country */}
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider mb-3">
            Home Country
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewField label="Country" value={data.homeCountry || "Not provided"} muted={!data.homeCountry} />
            <ReviewField label="City" value={data.homeCity || "Not provided"} muted={!data.homeCity} />
            <ReviewField
              label="Address"
              value={data.homeAddress || "Not provided"}
              muted={!data.homeAddress}
              fullWidth
            />
            <ReviewField
              label="Annual Earnings"
              value={data.amount ? `$${data.amount}` : "Not provided"}
              muted={!data.amount}
            />
          </div>
        </div>

        {/* Passport */}
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider mb-3">
            Passport
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewField label="Number" value={data.passportNumber || "Not provided"} muted={!data.passportNumber} />
            <ReviewField label="Expiry" value={formatDateUS(data.passportExpiry) || "Not provided"} muted={!data.passportExpiry} />
            <ReviewField label="Issuing Country" value={data.passportCountry || "Not provided"} muted={!data.passportCountry} />
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
