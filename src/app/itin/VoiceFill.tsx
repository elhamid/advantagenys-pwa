"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";

/* ═══════════════════════════════════════════════
   Web Speech API — use `any` to avoid Turbopack
   choking on custom interfaces
   ═══════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRec = any;

/* ═══════════════════════════════════════════════
   Step-to-Fields Mapping (karaoke guide)
   ═══════════════════════════════════════════════ */

interface FieldDef {
  key: string;
  label: string;
  prompt: string;
  hint: string;
}

const STEP_FIELDS: Record<number, FieldDef[]> = {
  0: [
    { key: "firstName", label: "First Name", prompt: "your first name", hint: "e.g. Kemar" },
    { key: "lastName", label: "Last Name", prompt: "your last name", hint: "e.g. Campbell" },
    { key: "middleName", label: "Middle Name", prompt: "your middle name if you have one", hint: "e.g. Anthony" },
    { key: "dateOfBirth", label: "Date of Birth", prompt: "your date of birth", hint: "e.g. March 5, 1990" },
    { key: "cityOfBirth", label: "Birth City", prompt: "the city you were born in", hint: "e.g. Kingston" },
    { key: "countryOfBirth", label: "Birth Country", prompt: "the country you were born in", hint: "e.g. Jamaica" },
    { key: "countryOfCitizenship", label: "Citizenship", prompt: "your country of citizenship", hint: "e.g. Jamaica" },
    { key: "phone", label: "Phone", prompt: "your phone number", hint: "e.g. 929-555-0123" },
    { key: "email", label: "Email", prompt: "your email address", hint: "e.g. kemar@email.com" },
  ],
  1: [
    { key: "city", label: "Appointment City", prompt: "New York or Nashville", hint: "New York or Nashville" },
    { key: "addressUsa", label: "US Address", prompt: "your US address", hint: "e.g. 123 Main St, Brooklyn" },
    { key: "usEntryDate", label: "Entry Date", prompt: "when you entered the US", hint: "e.g. January 2023" },
    { key: "homeCountry", label: "Home Country", prompt: "your home country", hint: "e.g. Mexico" },
    { key: "homeCity", label: "Home City", prompt: "your home city", hint: "e.g. Guadalajara" },
    { key: "homeAddress", label: "Home Address", prompt: "your home address", hint: "e.g. Calle 5 #200" },
    { key: "amount", label: "Annual Earnings", prompt: "your annual earnings", hint: "e.g. $35,000" },
  ],
  2: [
    { key: "passportNumber", label: "Passport Number", prompt: "your passport number", hint: "e.g. AB1234567" },
    { key: "passportExpiry", label: "Passport Expiry", prompt: "your passport expiry date", hint: "e.g. Dec 2028" },
    { key: "passportCountry", label: "Issuing Country", prompt: "the country that issued your passport", hint: "e.g. Jamaica" },
  ],
  3: [],
  4: [],
};

/* ═══════════════════════════════════════════════
   Props
   ═══════════════════════════════════════════════ */

interface VoiceFillProps {
  step: number;
  currentData: Record<string, unknown>;
  onFill: (fields: Record<string, string>) => void;
  onClose: () => void;
}

/* ═══════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════ */

function getSpeechRecognition(): (new () => SpeechRec) | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/** Check if a field has a non-empty string value */
function isFilled(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

type VoiceState = "ready" | "listening" | "processing" | "done" | "unavailable";

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */

export default function VoiceFill({ step, currentData, onFill, onClose }: VoiceFillProps) {
  const fields = STEP_FIELDS[step] ?? [];

  const [state, setState] = useState<VoiceState>(() =>
    fields.length === 0 ? "unavailable" : getSpeechRecognition() ? "ready" : "unavailable"
  );
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [extracted, setExtracted] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  /* ─── Karaoke auto-cycle state ─── */
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [cyclePhase, setCyclePhase] = useState<"visible" | "fading">("visible");

  const recognitionRef = useRef<SpeechRec | null>(null);
  const transcriptRef = useRef("");

  /* ─── Derived: unfilled / filled fields ─── */
  const unfilledFields = useMemo(
    () => fields.filter((f) => !isFilled(currentData[f.key]) && !isFilled(extracted[f.key])),
    [fields, currentData, extracted]
  );

  const filledFields = useMemo(
    () => fields.filter((f) => isFilled(currentData[f.key]) || isFilled(extracted[f.key])),
    [fields, currentData, extracted]
  );

  const allStepFilled = fields.length > 0 && unfilledFields.length === 0;
  const hasExtracted = Object.keys(extracted).length > 0;

  /* ─── Get display value for a field ─── */
  const getDisplayValue = useCallback(
    (f: FieldDef): string | null => {
      const ext = extracted[f.key];
      if (isFilled(ext)) return ext;
      const manual = currentData[f.key];
      if (isFilled(manual)) return String(manual);
      return null;
    },
    [extracted, currentData]
  );

  /* ─── Mount animation ─── */
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  /* ─── Escape key ─── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Cleanup on unmount ─── */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* noop */ }
        recognitionRef.current = null;
      }
    };
  }, []);

  /* ─── Karaoke auto-cycle ─── */
  useEffect(() => {
    if ((state !== "ready" && state !== "listening") || unfilledFields.length === 0) return;

    // Reset to valid index when unfilled fields change
    setHighlightIndex(0);
    setCyclePhase("visible");

    const interval = setInterval(() => {
      // Start fade out
      setCyclePhase("fading");

      // After fade out, switch field and fade in
      setTimeout(() => {
        setHighlightIndex((prev) => (prev + 1) % unfilledFields.length);
        setCyclePhase("visible");
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, [state, unfilledFields.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Current karaoke field ─── */
  const currentKaraokeField =
    state === "ready" && unfilledFields.length > 0
      ? unfilledFields[highlightIndex % unfilledFields.length]
      : null;

  /* ─── Close ─── */
  const handleClose = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* noop */ }
      recognitionRef.current = null;
    }
    onClose();
  }, [onClose]);

  /* ─── Start Listening ─── */
  const startListening = useCallback(() => {
    setError(null);
    setInterimText("");
    setTranscript("");
    transcriptRef.current = "";

    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setState("unavailable");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* noop */ }
    }

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalParts = "";
      let interimParts = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalParts += result[0].transcript;
        } else {
          interimParts += result[0].transcript;
        }
      }
      transcriptRef.current = finalParts;
      setTranscript(finalParts);
      setInterimText(interimParts);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone access denied. Allow mic in browser settings.");
        setState("ready");
      } else if (event.error === "no-speech") {
        // silent — stay listening
      } else if (event.error === "aborted") {
        // intentional
      } else {
        setError(`Speech error: ${event.error}. Try again.`);
        setState("ready");
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
        const finalTranscript = transcriptRef.current.trim();
        if (finalTranscript.length > 0) {
          processTranscript(finalTranscript);
        } else {
          setError("Didn\u2019t catch that. Speak clearly and try again.");
          setState("ready");
        }
      }
    };

    recognitionRef.current = recognition;
    setState("listening");

    try {
      recognition.start();
    } catch {
      setError("Could not start. Try again.");
      setState("ready");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Stop Listening ─── */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* noop */ }
    }
  }, []);

  /* ─── Toggle mic ─── */
  const toggleMic = useCallback(() => {
    if (state === "listening") {
      stopListening();
    } else {
      startListening();
    }
  }, [state, stopListening, startListening]);

  /* ─── Process Transcript ─── */
  const processTranscript = useCallback(
    async (text: string) => {
      setState("processing");
      setError(null);

      const alreadyFilled: string[] = [];
      for (const f of fields) {
        if (isFilled(currentData[f.key]) || isFilled(extracted[f.key])) {
          alreadyFilled.push(f.key);
        }
      }

      try {
        const response = await fetch("/api/itin-voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: text,
            alreadyFilled,
          }),
        });

        if (!response.ok) throw new Error(`Server error (${response.status})`);

        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newFields: Record<string, string> = data.fields || {};

        // Filter to only keys in current step
        const stepKeys = new Set(fields.map((f) => f.key));
        const validFields: Record<string, string> = {};
        for (const [key, value] of Object.entries(newFields)) {
          if (stepKeys.has(key) && typeof value === "string" && value.trim().length > 0) {
            validFields[key] = value;
          }
        }

        // Merge with previous extractions
        setExtracted((prev) => ({ ...prev, ...validFields }));
        setState("done");
      } catch {
        setError("Could not process speech. Try again or fill manually.");
        setState("ready");
      }
    },
    [currentData, extracted, fields]
  );

  /* ─── Apply and Close ─── */
  const handleDone = useCallback(() => {
    const toFill: Record<string, string> = {};
    for (const [key, value] of Object.entries(extracted)) {
      if (typeof value === "string" && value.trim().length > 0) {
        toFill[key] = value;
      }
    }
    onFill(toFill);
    handleClose();
  }, [extracted, onFill, handleClose]);

  /* ─── Speak Again ─── */
  const handleSpeakAgain = useCallback(() => {
    setTranscript("");
    setInterimText("");
    startListening();
  }, [startListening]);

  /* ═══════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════ */

  // No voice fields for this step
  if (fields.length === 0) return null;

  // Voice not available
  if (state === "unavailable") {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="AVA Voice Assistant"
        className={`
          fixed inset-0 z-50 bg-[#0F1B2D] flex flex-col items-center justify-center
          transition-all duration-300 ease-out
          ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"}
        `}
      >
        <div className="flex flex-col items-center text-center max-w-sm px-6">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Voice Not Available</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Voice input is not available on this device.
          </p>
          <button
            onClick={handleClose}
            className="px-8 py-3 rounded-xl bg-white/10 text-white/70 font-semibold text-base hover:bg-white/15 active:scale-[0.95] transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AVA Voice Assistant"
      className={`
        fixed inset-0 z-50 bg-[#0F1B2D] flex flex-col
        transition-all duration-300 ease-out
        ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"}
      `}
    >
      {/* Screen reader status */}
      <div aria-live="polite" className="sr-only">
        {state === "listening"
          ? "Listening. Speak now."
          : state === "processing"
            ? "Processing your speech."
            : currentKaraokeField
              ? `Current field: ${currentKaraokeField.label}`
              : ""}
      </div>

      {/* ── Header (compact) ── */}
      <header className="flex items-center justify-between px-5 py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#4F56E8]/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#818CF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-white/60">
            AVA Voice
          </span>
        </div>
        <button
          onClick={handleClose}
          aria-label="Close voice assistant"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80 active:scale-[0.95] transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* ── Error banner ── */}
      {error && (
        <div className="px-5 pb-2 shrink-0">
          <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-red-400/90 text-xs flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400/50 hover:text-red-400/80 transition-colors shrink-0"
              aria-label="Dismiss error"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 min-h-0">

        {/* === READY STATE: Karaoke teleprompter === */}
        {state === "ready" && !allStepFilled && currentKaraokeField && (
          <div className="flex flex-col items-center text-center w-full">
            {/* Big cycling label */}
            <div
              aria-live="polite"
              className="mb-2"
              style={{
                minHeight: "80px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <h2
                className="text-4xl font-bold text-white"
                style={{
                  opacity: cyclePhase === "visible" ? 1 : 0,
                  transform: cyclePhase === "visible" ? "translateY(0)" : "translateY(-20px)",
                  transition: "opacity 300ms ease-out, transform 300ms ease-out",
                }}
              >
                {currentKaraokeField.label}
              </h2>
              <p
                className="text-base text-white/30 mt-1.5"
                style={{
                  opacity: cyclePhase === "visible" ? 1 : 0,
                  transform: cyclePhase === "visible" ? "translateY(0)" : "translateY(-20px)",
                  transition: "opacity 300ms ease-out, transform 300ms ease-out",
                  transitionDelay: "50ms",
                }}
              >
                {currentKaraokeField.hint}
              </p>
            </div>

            {/* Dot progress track */}
            <div className="flex items-center gap-2 mt-6">
              {fields.map((f) => {
                const filled = isFilled(currentData[f.key]) || isFilled(extracted[f.key]);
                const isCurrent = currentKaraokeField.key === f.key;

                return (
                  <div
                    key={f.key}
                    className="transition-all duration-300"
                    style={{
                      width: isCurrent ? "24px" : "8px",
                      height: "8px",
                      borderRadius: "4px",
                      backgroundColor: filled
                        ? "#10B981"
                        : isCurrent
                          ? "#818CF8"
                          : "rgba(255,255,255,0.15)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* === READY STATE: All filled === */}
        {state === "ready" && allStepFilled && (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">All captured</h2>
            <p className="text-sm text-white/40">Tap Done to apply</p>
          </div>
        )}

        {/* === LISTENING STATE: Keep karaoke highlight + transcript === */}
        {state === "listening" && (
          <div className="flex flex-col items-center text-center w-full">
            {/* Big cycling label — keeps guiding while listening */}
            {currentKaraokeField ? (
            <div
              className="mb-2"
              style={{
                minHeight: "80px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <h2
                className="text-4xl font-bold text-white"
                style={{
                  opacity: cyclePhase === "visible" ? 1 : 0,
                  transform: cyclePhase === "visible" ? "translateY(0)" : "translateY(-20px)",
                  transition: "opacity 300ms ease-out, transform 300ms ease-out",
                }}
              >
                {currentKaraokeField.label}
              </h2>
              <p
                className="text-base text-white/30 mt-1.5"
                style={{
                  opacity: cyclePhase === "visible" ? 1 : 0,
                  transform: cyclePhase === "visible" ? "translateY(0)" : "translateY(-20px)",
                  transition: "opacity 300ms ease-out, transform 300ms ease-out",
                  transitionDelay: "50ms",
                }}
              >
                {currentKaraokeField.hint}
              </p>
            </div>
            ) : (
              <div className="mb-2" style={{ minHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <h2 className="text-2xl font-bold text-white/60">Keep speaking...</h2>
              </div>
            )}

            {/* Dot progress track */}
            <div className="flex items-center gap-2 mt-4 mb-6">
              {fields.map((f) => {
                const filled = isFilled(currentData[f.key]) || isFilled(extracted[f.key]);
                const isCurrent = currentKaraokeField?.key === f.key;
                return (
                  <div
                    key={f.key}
                    className="transition-all duration-300"
                    style={{
                      width: isCurrent ? "24px" : "8px",
                      height: "8px",
                      borderRadius: "4px",
                      backgroundColor: filled
                        ? "#10B981"
                        : isCurrent
                          ? "#818CF8"
                          : "rgba(255,255,255,0.15)",
                    }}
                  />
                );
              })}
            </div>

            {/* Listening indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-sm font-medium text-white/50">Listening...</span>
            </div>

            {/* Live transcript */}
            {(transcript || interimText) && (
              <div className="w-full max-w-sm px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <p className="text-sm leading-relaxed text-center">
                  <span className="text-white">{transcript}</span>
                  {interimText && (
                    <span className="text-white/35">{transcript ? " " : ""}{interimText}</span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* === PROCESSING STATE: Spinner === */}
        {state === "processing" && (
          <div className="flex flex-col items-center">
            <span className="block w-14 h-14 border-[3px] border-white/10 border-t-[#4F56E8] rounded-full animate-spin mb-4" />
            <p className="text-sm text-white/40">Processing...</p>
          </div>
        )}

        {/* === DONE STATE: Large readable results === */}
        {state === "done" && (
          <div className="flex flex-col w-full max-w-md mx-auto overflow-y-auto">
            {/* Filled fields — large, readable */}
            {filledFields.length > 0 && (
              <div className="rounded-xl bg-white/[0.03] overflow-hidden mb-4">
                {filledFields.map((f, i) => {
                  const val = getDisplayValue(f);
                  return (
                    <div
                      key={f.key}
                      className={`flex items-center gap-3 px-5 py-3.5 ${i < filledFields.length - 1 ? "border-b border-white/5" : ""}`}
                    >
                      <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/50 text-sm shrink-0">{f.label}</span>
                      <span className="text-white font-semibold text-base ml-auto text-right">{val}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Unfilled fields — clearly visible */}
            {unfilledFields.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                {unfilledFields.map((f) => (
                  <span
                    key={f.key}
                    className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-sm font-medium text-amber-400/80"
                    style={{ animation: "gentle-pulse 2s ease-in-out infinite" }}
                  >
                    {f.label}
                  </span>
                ))}
              </div>
            )}

            {/* Summary */}
            <p className="text-sm text-white/30 text-center">
              {filledFields.length} of {fields.length} captured
            </p>
          </div>
        )}
      </div>

      {/* ── Bottom: Mic + Actions ── */}
      <div className="shrink-0 pb-8 pt-4 flex flex-col items-center gap-4 px-5">

        {/* Mic button — hidden during processing */}
        {state !== "processing" && (
          <>
            <div className="relative">
              {/* Pulse rings when listening */}
              {state === "listening" && (
                <>
                  <span
                    className="absolute inset-0 rounded-full bg-[#4F56E8]/20 animate-ping"
                    style={{ animationDuration: "2s" }}
                  />
                  <span
                    className="absolute inset-0 rounded-full bg-[#4F56E8]/15 animate-ping"
                    style={{ animationDuration: "2s", animationDelay: "0.4s" }}
                  />
                  <span
                    className="absolute inset-0 rounded-full bg-[#4F56E8]/10 animate-ping"
                    style={{ animationDuration: "2s", animationDelay: "0.8s" }}
                  />
                </>
              )}
              <button
                onClick={toggleMic}
                aria-label={state === "listening" ? "Stop listening" : "Start voice input"}
                className={`
                  relative z-10 w-[72px] h-[72px] rounded-full flex items-center justify-center
                  bg-[#4F56E8] active:scale-[0.95] transition-all duration-200
                  ${state === "listening"
                    ? "shadow-[0_0_50px_rgba(79,86,232,0.5)]"
                    : "shadow-[0_0_40px_rgba(79,86,232,0.3)] hover:shadow-[0_0_60px_rgba(79,86,232,0.4)] hover:bg-[#5B63F0]"
                  }
                `}
              >
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>

            {/* Mic label */}
            <p className="text-white/25 text-xs">
              {state === "listening" ? "Tap to stop" : "Tap to start"}
            </p>
          </>
        )}

        {/* Processing spinner (replaces mic) */}
        {state === "processing" && (
          <div className="w-[72px] h-[72px] flex items-center justify-center">
            <span className="block w-12 h-12 border-[3px] border-white/20 border-t-[#4F56E8] rounded-full animate-spin" />
          </div>
        )}

        {/* Action buttons — show after extraction */}
        {(state === "done" || (state === "ready" && hasExtracted)) && (
          <div className="flex gap-3 w-full max-w-xs">
            {unfilledFields.length > 0 && (
              <button
                onClick={handleSpeakAgain}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white/70 font-semibold text-sm hover:bg-white/15 hover:text-white/90 active:scale-[0.97] transition-all duration-200"
              >
                Speak Again
              </button>
            )}
            <button
              onClick={handleDone}
              className="flex-1 py-3 rounded-xl bg-[#4F56E8] text-white font-semibold text-sm shadow-[0_0_30px_rgba(79,86,232,0.25)] hover:bg-[#5B63F0] hover:shadow-[0_0_40px_rgba(79,86,232,0.35)] active:scale-[0.97] transition-all duration-200"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* Keyframe for gentle pulse on unfilled pills */}
      <style>{`
        @keyframes gentle-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
