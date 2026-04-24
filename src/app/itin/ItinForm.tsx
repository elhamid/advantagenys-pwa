"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Lazy-load heavy capture components
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

// Lazy-load step components
const StepPassport = dynamic(
  () => import("./steps/StepPassport").then((m) => ({ default: m.StepPassport })),
  {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center"><span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>,
  }
);
const StepPersonal = dynamic(
  () => import("./steps/StepPersonal").then((m) => ({ default: m.StepPersonal })),
  {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center"><span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>,
  }
);
const StepLocation = dynamic(
  () => import("./steps/StepLocation").then((m) => ({ default: m.StepLocation })),
  {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center"><span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>,
  }
);
const StepReview = dynamic(
  () => import("./steps/StepReview").then((m) => ({ default: m.StepReview })),
  {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center"><span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>,
  }
);

import { type ItinData, INITIAL, STEPS } from "./steps/types";
import { I94Lookup } from "./I94Lookup";

/* ═══════════════════════════════════════════════
   Keyboard-aware bottom offset (iPad/mobile)
   ═══════════════════════════════════════════════ */

function useKeyboardHeight() {
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return;

    function onResize() {
      const diff = window.innerHeight - (vv?.height ?? window.innerHeight);
      setKbHeight(diff > 50 ? diff : 0);
    }

    vv.addEventListener("resize", onResize);
    return () => {
      vv.removeEventListener("resize", onResize);
    };
  }, []);

  return kbHeight;
}

/* ═══════════════════════════════════════════════
   Main Form Orchestrator
   ═══════════════════════════════════════════════ */

interface Props {
  onSuccess: () => void;
  testMode?: boolean;
  companyName?: string;
}

const COMPANY_PRIORITY_COUNTRIES: Record<string, string> = {
  "Tropical Stars Inc.": "Jamaica",
};

export function ItinForm({ onSuccess, testMode = false, companyName }: Props) {
  const priorityCountry = companyName ? (COMPANY_PRIORITY_COUNTRIES[companyName] ?? undefined) : undefined;
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
  const _kbHeight = useKeyboardHeight();
  void _kbHeight; // retained for potential future layout offset use
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
    if (data.city) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const distNY = Math.sqrt((latitude - 40.7) ** 2 + (longitude + 74.0) ** 2);
        const distNash = Math.sqrt((latitude - 36.16) ** 2 + (longitude + 86.78) ** 2);
        if (distNY < 2) {
          update("city", "new_york");
        } else if (distNash < 2) {
          update("city", "nashville");
        }
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
                if (applied.countryOfBirth && !applied.homeCountry) {
                  update("homeCountry", applied.countryOfBirth as never);
                  applied.homeCountry = applied.countryOfBirth;
                }
                if (applied.countryOfBirth && !applied.countryOfCitizenship) {
                  update("countryOfCitizenship", applied.countryOfBirth as never);
                  applied.countryOfCitizenship = applied.countryOfBirth;
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
        reader.onerror = () => { setOcrStatus("failed"); };
        reader.readAsDataURL(file);
      } catch {
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
    setAnimPhase("exit");
    setTimeout(() => {
      setStep(target);
      setDisplayStep(target);
      setAnimPhase("enter");
      setTimeout(() => {
        setAnimPhase("idle");
        focusFirstInput();
      }, 300);
    }, 250);
  }

  function nextStep() {
    if (validateStep(step)) {
      transitionToStep(Math.min(step + 1, STEPS.length - 1));
    }
  }

  function prevStep() {
    transitionToStep(Math.max(step - 1, 0));
  }

  async function handleSubmit() {
    if (submitting) return;
    if (!validateStep(step)) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = new FormData();
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
      payload.append("aptNumber", up(data.aptNumber));
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

      if (data.documentScan) payload.append("documentScan", data.documentScan);
      if (data.selfie) payload.append("selfie", data.selfie);
      if (data.signature) payload.append("signature", data.signature);

      const submitUrl = testMode ? "/api/itin-submit?test=1" : "/api/itin-submit";
      const res = await fetch(submitUrl, { method: "POST", body: payload });

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

  const completedSteps = useMemo(() => {
    const completed = new Set<number>();
    if (data.documentScan) completed.add(0);
    if (data.firstName && data.lastName && data.phone) completed.add(1);
    if (data.city) completed.add(2);
    if (data.signature) completed.add(3);
    return completed;
  }, [data.documentScan, data.firstName, data.lastName, data.phone, data.city, data.signature]);

  const getStepAnimClass = () => {
    if (animPhase === "exit") {
      return slideDirection === "left" ? "opacity-0 -translate-x-5" : "opacity-0 translate-x-5";
    }
    if (animPhase === "enter") {
      return slideDirection === "left" ? "opacity-0 translate-x-5" : "opacity-0 -translate-x-5";
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
                onClick={() => { if (i < step) transitionToStep(i); }}
                className="flex flex-col items-center gap-1.5 group"
                disabled={i > step}
                aria-label={`Step ${i + 1}: ${s.label}${completedSteps.has(i) ? " (completed)" : ""}`}
              >
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
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#4F56E8] to-[#818CF8] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* AVA Voice — available on personal + location steps */}
        {(step === 1 || step === 2) && (
          <div className="flex flex-col items-center mb-5">
            <button
              type="button"
              onClick={() => setShowVoiceFill(true)}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)] active:scale-[0.93] transition-all duration-200 mb-2"
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
          className={`overflow-y-auto pb-4 transition-all duration-250 ease-out ${getStepAnimClass()}`}
        >
          {displayStep === 0 && (
            <StepPassport
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
              priorityCountry={priorityCountry}
            />
          )}
          {displayStep === 2 && (
            <StepLocation
              data={data}
              errors={errors}
              update={update}
              onShowI94={() => setShowI94Lookup(true)}
              priorityCountry={priorityCountry}
            />
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
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 active:scale-[0.97] transition-all duration-200 min-h-[48px]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Back
              </button>
            )}

            {step === 0 && (
              <button
                onClick={() => transitionToStep(step + 1)}
                className="px-5 py-3.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/60 transition-all duration-200 min-h-[48px]"
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
          onClose={() => setShowDocScanner(false)}
          label="Scan Passport / ID"
        />
      )}
      {showSelfieCapture && (
        <SelfieCapture
          onCapture={handleSelfieCapture}
          onClose={() => setShowSelfieCapture(false)}
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
