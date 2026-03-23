"use client";

import { useState, useCallback, useEffect, useRef } from "react";

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
}

const STEP_FIELDS: Record<number, FieldDef[]> = {
  0: [
    { key: "firstName", label: "First Name", prompt: "your first name" },
    { key: "lastName", label: "Last Name", prompt: "your last name" },
    { key: "middleName", label: "Middle Name", prompt: "your middle name if you have one" },
    { key: "dateOfBirth", label: "Date of Birth", prompt: "your date of birth" },
    { key: "cityOfBirth", label: "Birth City", prompt: "the city you were born in" },
    { key: "countryOfBirth", label: "Birth Country", prompt: "the country you were born in" },
    { key: "countryOfCitizenship", label: "Citizenship", prompt: "your country of citizenship" },
    { key: "phone", label: "Phone", prompt: "your phone number" },
    { key: "email", label: "Email", prompt: "your email address" },
  ],
  1: [
    { key: "city", label: "Appointment City", prompt: "New York or Nashville" },
    { key: "addressUsa", label: "US Address", prompt: "your US address" },
    { key: "usEntryDate", label: "Entry Date", prompt: "when you entered the US" },
    { key: "homeCountry", label: "Home Country", prompt: "your home country" },
    { key: "homeCity", label: "Home City", prompt: "your home city" },
    { key: "homeAddress", label: "Home Address", prompt: "your home address" },
    { key: "amount", label: "Annual Earnings", prompt: "your annual earnings" },
  ],
  2: [
    { key: "passportNumber", label: "Passport Number", prompt: "your passport number" },
    { key: "passportExpiry", label: "Passport Expiry", prompt: "your passport expiry date" },
    { key: "passportCountry", label: "Issuing Country", prompt: "the country that issued your passport" },
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

/** Build the natural-language prompt from unfilled fields */
function buildPrompt(fields: FieldDef[], currentData: Record<string, unknown>, extracted: Record<string, string>): string {
  const unfilled = fields.filter(
    (f) => !isFilled(currentData[f.key]) && !isFilled(extracted[f.key])
  );
  if (unfilled.length === 0) return "All fields captured!";
  if (unfilled.length === 1) return `Tell me ${unfilled[0].prompt}`;
  const last = unfilled[unfilled.length - 1];
  const rest = unfilled.slice(0, -1);
  return `Tell me ${rest.map((f) => f.prompt).join(", ")}, and ${last.prompt}`;
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
  const [flashKeys, setFlashKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const recognitionRef = useRef<SpeechRec | null>(null);
  const transcriptRef = useRef("");

  // Mount animation
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* noop */ }
        recognitionRef.current = null;
      }
    };
  }, []);

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
        setError("Microphone access was denied. Please allow microphone access in your browser settings.");
        setState("ready");
      } else if (event.error === "no-speech") {
        // silent — stay listening
      } else if (event.error === "aborted") {
        // intentional
      } else {
        setError(`Speech recognition error: ${event.error}. Please try again.`);
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
          setError("We didn't hear anything. Please speak clearly and try again.");
          setState("ready");
        }
      }
    };

    recognitionRef.current = recognition;
    setState("listening");

    try {
      recognition.start();
    } catch {
      setError("Could not start speech recognition. Please try again.");
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

        // Trigger flash animation for newly filled fields
        const newFlash = new Set(Object.keys(validFields));
        setFlashKeys(newFlash);
        setTimeout(() => setFlashKeys(new Set()), 1200);

        // Merge with previous extractions
        setExtracted((prev) => ({ ...prev, ...validFields }));
        setState("done");
      } catch {
        setError("Could not process your speech. Please try again or fill in manually.");
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

  /* ─── Computed ─── */

  const allStepFilled = fields.length > 0 && fields.every(
    (f) => isFilled(currentData[f.key]) || isFilled(extracted[f.key])
  );

  const promptText = buildPrompt(fields, currentData, extracted);

  const subtitle =
    state === "listening"
      ? "I'm listening..."
      : state === "processing"
        ? "Let me fill that in..."
        : allStepFilled
          ? "All fields captured!"
          : "Tap the mic and tell me...";

  const hasExtracted = Object.keys(extracted).length > 0;

  /* ═══════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════ */

  // No voice fields for this step
  if (fields.length === 0) {
    return null;
  }

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
            Voice input is not available on this device. Please fill out the form manually.
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
            : ""}
      </div>

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#4F56E8]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#818CF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-semibold tracking-wide text-white/70 block">
              AVA Voice Assistant
            </span>
            <span className="text-xs text-white/30">{subtitle}</span>
          </div>
        </div>
        <button
          onClick={handleClose}
          aria-label="Close voice assistant"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80 active:scale-[0.95] transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* ── Prompt sentence ── */}
      <div className="px-5 pb-3 shrink-0">
        <p className={`text-sm leading-relaxed ${allStepFilled ? "text-emerald-400" : "text-white/50"}`}>
          {promptText}
        </p>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="px-5 pb-3 shrink-0">
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-red-400/90 text-sm text-left leading-relaxed flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400/50 hover:text-red-400/80 transition-colors shrink-0"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Field List (karaoke guide) ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-3">
        <div className="bg-white/[0.03] rounded-xl overflow-hidden">
          {fields.map((f, i) => {
            const manualValue = currentData[f.key];
            const extractedValue = extracted[f.key];
            const hasManual = isFilled(manualValue);
            const hasExtractedVal = isFilled(extractedValue);
            const filled = hasManual || hasExtractedVal;
            const displayValue = hasExtractedVal ? extractedValue : hasManual ? String(manualValue) : null;
            const isFlashing = flashKeys.has(f.key);

            return (
              <div
                key={f.key}
                className={`
                  px-4 py-3 flex items-center justify-between gap-3
                  ${i < fields.length - 1 ? "border-b border-white/5" : ""}
                  transition-colors duration-1000 ease-out
                `}
                style={isFlashing ? { backgroundColor: "rgba(16, 185, 129, 0.1)" } : undefined}
              >
                {/* Left: label */}
                <span className={`text-sm font-medium ${filled ? "text-white/70" : "text-white/40"}`}>
                  {f.label}
                </span>

                {/* Right: status */}
                <div className="flex items-center gap-2 min-w-0">
                  {filled ? (
                    <>
                      <span
                        className={`text-sm truncate max-w-[180px] ${hasExtractedVal ? "text-white font-medium" : "text-white/60"}`}
                      >
                        {displayValue}
                      </span>
                      {hasExtractedVal ? (
                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </>
                  ) : (
                    <span className="text-white/20 text-sm">&mdash;</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Transcript area (between field list and mic) ── */}
      {(state === "listening" || state === "processing") && (transcript || interimText) && (
        <div className="px-5 pb-2 shrink-0">
          <div className="px-4 py-3 rounded-xl bg-white/[0.03] max-h-[100px] overflow-y-auto">
            <p className="text-sm leading-relaxed">
              <span className="text-white">{transcript}</span>
              {interimText && (
                <span className="text-white/40">{transcript ? " " : ""}{interimText}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* ── Bottom: Mic + Actions ── */}
      <div className="shrink-0 pb-8 pt-4 flex flex-col items-center gap-4 px-5">
        {/* Mic button */}
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

          {/* Processing spinner replaces mic */}
          {state === "processing" ? (
            <div className="w-[72px] h-[72px] flex items-center justify-center">
              <span className="block w-12 h-12 border-[3px] border-white/20 border-t-[#4F56E8] rounded-full animate-spin" />
            </div>
          ) : (
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
          )}
        </div>

        {/* Mic label */}
        <p className="text-white/30 text-xs">
          {state === "listening"
            ? "Tap to stop"
            : state === "processing"
              ? "Processing..."
              : "Tap to start"
          }
        </p>

        {/* Listening indicator dot */}
        {state === "listening" && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs font-medium text-white/50">Listening</span>
          </div>
        )}

        {/* Action buttons — show after extraction */}
        {(state === "done" || (state === "ready" && hasExtracted)) && (
          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={handleSpeakAgain}
              className="flex-1 py-3 rounded-xl bg-white/10 text-white/70 font-semibold text-sm hover:bg-white/15 hover:text-white/90 active:scale-[0.97] transition-all duration-200"
            >
              Speak Again
            </button>
            <button
              onClick={handleDone}
              className="flex-1 py-3 rounded-xl bg-[#4F56E8] text-white font-semibold text-sm shadow-[0_0_30px_rgba(79,86,232,0.25)] hover:bg-[#5B63F0] hover:shadow-[0_0_40px_rgba(79,86,232,0.35)] active:scale-[0.97] transition-all duration-200"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
