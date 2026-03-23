"use client";

import { useState, useCallback, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════
   Web Speech API type stubs
   ═══════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */

/** Text-only subset of ItinData that the voice assistant can fill. */
interface VoiceFields {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  countryOfBirth?: string;
  cityOfBirth?: string;
  countryOfCitizenship?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  city?: string;
  addressUsa?: string;
  homeCountry?: string;
  homeCity?: string;
  homeAddress?: string;
  usEntryDate?: string;
  amount?: string;
  passportNumber?: string;
  passportExpiry?: string;
  passportCountry?: string;
}

/** Maps VoiceFields keys to human-readable labels for the results screen. */
const FIELD_LABELS: Record<keyof VoiceFields, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  middleName: "Middle Name",
  dateOfBirth: "Date of Birth",
  countryOfBirth: "Country of Birth",
  cityOfBirth: "City of Birth",
  countryOfCitizenship: "Citizenship",
  phone: "Phone",
  email: "Email",
  companyName: "Company / Employer",
  city: "City (Office)",
  addressUsa: "US Address",
  homeCountry: "Home Country",
  homeCity: "Home City",
  homeAddress: "Home Address",
  usEntryDate: "US Entry Date",
  amount: "Amount",
  passportNumber: "Passport Number",
  passportExpiry: "Passport Expiry",
  passportCountry: "Passport Country",
};

/** Fields we highlight as important (amber warning when missing). */
const PRIORITY_FIELDS: (keyof VoiceFields)[] = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "phone",
  "countryOfBirth",
  "countryOfCitizenship",
  "addressUsa",
  "passportNumber",
];

/** All fillable field keys in display order. */
const ALL_FIELDS = Object.keys(FIELD_LABELS) as (keyof VoiceFields)[];

/* ═══════════════════════════════════════════════
   Props
   ═══════════════════════════════════════════════ */

interface VoiceFillProps {
  currentData: Record<string, unknown>;
  onFill: (fields: Partial<VoiceFields>) => void;
  onClose: () => void;
}

/* ═══════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════ */

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */

type VoiceState = "ready" | "listening" | "processing" | "results" | "unavailable";

export default function VoiceFill({ currentData, onFill, onClose }: VoiceFillProps) {
  const [state, setState] = useState<VoiceState>(() =>
    getSpeechRecognition() ? "ready" : "unavailable"
  );
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [extractedFields, setExtractedFields] = useState<VoiceFields>({});
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptRef = useRef(""); // keeps in sync without re-renders
  const statusRef = useRef<HTMLDivElement>(null);

  // Mount animation
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  /* ─── Close ─── */

  const handleClose = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    onClose();
  }, [onClose]);

  /* ─── Start Listening ─── */

  const startListening = useCallback(() => {
    setError(null);
    setInterimText("");

    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) {
      setState("unavailable");
      return;
    }

    // Stop any prior instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

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

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError(
          "Microphone access was denied. Please allow microphone access in your browser settings and try again."
        );
        setState("ready");
      } else if (event.error === "no-speech") {
        // User was silent — not a fatal error, stay listening
      } else if (event.error === "aborted") {
        // Intentional abort — do nothing
      } else {
        setError(`Speech recognition error: ${event.error}. Please try again.`);
        setState("ready");
      }
    };

    recognition.onend = () => {
      // Only auto-process if we were actively listening (not aborted for close/restart)
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
      try {
        recognitionRef.current.stop(); // triggers onend → processTranscript
      } catch {
        // ignore
      }
    }
  }, []);

  /* ─── Process Transcript via API ─── */

  const processTranscript = useCallback(
    async (text: string) => {
      setState("processing");
      setError(null);

      // Build context: which fields are already filled
      const alreadyFilled: string[] = [];
      for (const key of ALL_FIELDS) {
        const val = currentData[key];
        if (typeof val === "string" && val.trim().length > 0) {
          alreadyFilled.push(key);
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

        if (!response.ok) {
          throw new Error(`Server error (${response.status})`);
        }

        const data = await response.json();
        const fields: VoiceFields = data.fields || {};

        // Merge with previously extracted fields (new overrides old)
        setExtractedFields((prev) => {
          const merged = { ...prev };
          for (const [key, value] of Object.entries(fields)) {
            if (typeof value === "string" && value.trim().length > 0) {
              merged[key as keyof VoiceFields] = value;
            }
          }
          return merged;
        });

        setState("results");
      } catch {
        setError("Could not process your speech. Please try again or fill in manually.");
        setState("ready");
      }
    },
    [currentData]
  );

  /* ─── Fill Form ─── */

  const handleFillForm = useCallback(() => {
    // Only send fields that have actual values
    const toFill: Partial<VoiceFields> = {};
    for (const [key, value] of Object.entries(extractedFields)) {
      if (typeof value === "string" && value.trim().length > 0) {
        toFill[key as keyof VoiceFields] = value;
      }
    }
    onFill(toFill);
    handleClose();
  }, [extractedFields, onFill, handleClose]);

  /* ─── Speak Again ─── */

  const handleSpeakAgain = useCallback(() => {
    setInterimText("");
    setTranscript("");
    startListening();
  }, [startListening]);

  /* ─── Announce state changes for screen readers ─── */

  const statusMessage =
    state === "listening"
      ? "Listening. Speak now."
      : state === "processing"
        ? "Processing your speech."
        : state === "results"
          ? `Found ${Object.keys(extractedFields).filter((k) => extractedFields[k as keyof VoiceFields]).length} fields.`
          : "";

  /* ─── Computed: fields breakdown for results ─── */

  const filledKeys = ALL_FIELDS.filter((k) => {
    const extracted = extractedFields[k];
    return typeof extracted === "string" && extracted.trim().length > 0;
  });

  const missingPriority = PRIORITY_FIELDS.filter((k) => !filledKeys.includes(k));

  /* ═══════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════ */

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AVA Voice Assistant"
      className={`
        fixed inset-0 z-50 bg-[#0F1B2D] flex flex-col
        transition-all duration-300 ease-out
        ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}
      `}
    >
      {/* Screen reader status */}
      <div ref={statusRef} aria-live="polite" className="sr-only">
        {statusMessage}
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#4F56E8]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#818CF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-white/70">
            AVA Voice Assistant
          </span>
        </div>
        <button
          onClick={handleClose}
          aria-label="Close voice assistant"
          className="
            w-10 h-10 rounded-full flex items-center justify-center
            bg-white/10 text-white/60
            hover:bg-white/15 hover:text-white/80
            active:scale-95 transition-all duration-200
          "
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 overflow-y-auto">
        {/* ── State: Unavailable ── */}
        {state === "unavailable" && <UnavailableView onClose={handleClose} />}

        {/* ── State: Ready ── */}
        {state === "ready" && (
          <ReadyView onStart={startListening} error={error} onClearError={() => setError(null)} />
        )}

        {/* ── State: Listening ── */}
        {state === "listening" && (
          <ListeningView
            transcript={transcript}
            interimText={interimText}
            onStop={stopListening}
          />
        )}

        {/* ── State: Processing ── */}
        {state === "processing" && <ProcessingView transcript={transcript} />}

        {/* ── State: Results ── */}
        {state === "results" && (
          <ResultsView
            extractedFields={extractedFields}
            filledKeys={filledKeys}
            missingPriority={missingPriority}
            onSpeakAgain={handleSpeakAgain}
            onFillForm={handleFillForm}
          />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Sub-views
   ═══════════════════════════════════════════════ */

/* ── Unavailable ── */

function UnavailableView({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center max-w-sm">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
          <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-white mb-3">Voice Input Not Available</h2>
      <p className="text-white/50 text-sm leading-relaxed mb-8">
        Voice input is not available on this device. Please fill out the form manually using the on-screen keyboard.
      </p>
      <button
        onClick={onClose}
        className="
          px-8 py-3 rounded-xl
          bg-white/10 text-white/70 font-semibold text-base
          hover:bg-white/15 hover:text-white/90 active:scale-[0.97]
          transition-all duration-200
        "
      >
        Close
      </button>
    </div>
  );
}

/* ── Ready ── */

function ReadyView({
  onStart,
  error,
  onClearError,
}: {
  onStart: () => void;
  error: string | null;
  onClearError: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center max-w-md">
      {/* Error banner */}
      {error && (
        <div className="w-full mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-400 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p className="text-red-400/90 text-sm text-left leading-relaxed flex-1">{error}</p>
            <button
              onClick={onClearError}
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

      {/* Mic button */}
      <button
        onClick={onStart}
        aria-label="Start voice input"
        className="
          group w-20 h-20 rounded-full mb-6
          bg-[#4F56E8] flex items-center justify-center
          shadow-[0_0_40px_rgba(79,86,232,0.3)]
          hover:shadow-[0_0_60px_rgba(79,86,232,0.4)]
          hover:bg-[#5B63F0]
          active:scale-[0.93]
          transition-all duration-300
        "
      >
        <svg
          className="w-9 h-9 text-white group-hover:scale-110 transition-transform duration-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      </button>

      <h2 className="text-2xl font-bold text-white mb-3">
        Tap the microphone and tell us about yourself
      </h2>
      <p className="text-white/50 text-base leading-relaxed mb-8">
        Say your name, date of birth, where you&apos;re from, address, and any other details
      </p>

      {/* What AVA can fill */}
      <div className="w-full px-4 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-3">
          AVA can fill
        </p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {[
            "Name",
            "Date of Birth",
            "Country",
            "City",
            "Phone",
            "Email",
            "Address",
            "Passport Info",
            "Entry Date",
          ].map((label) => (
            <span
              key={label}
              className="px-2.5 py-1 rounded-full bg-white/[0.05] text-white/40 text-xs font-medium"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Listening ── */

function ListeningView({
  transcript,
  interimText,
  onStop,
}: {
  transcript: string;
  interimText: string;
  onStop: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center max-w-lg w-full">
      {/* Pulsing mic with rings */}
      <div className="relative mb-8">
        {/* Pulse rings */}
        <span className="absolute inset-0 rounded-full bg-[#4F56E8]/20 animate-ping" style={{ animationDuration: "2s" }} />
        <span className="absolute inset-0 rounded-full bg-[#4F56E8]/15 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.4s" }} />
        <span className="absolute inset-0 rounded-full bg-[#4F56E8]/10 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.8s" }} />

        <button
          onClick={onStop}
          aria-label="Stop listening"
          className="
            relative z-10 w-20 h-20 rounded-full
            bg-[#4F56E8] flex items-center justify-center
            shadow-[0_0_50px_rgba(79,86,232,0.5)]
            active:scale-[0.93]
            transition-transform duration-200
          "
        >
          <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>
      </div>

      {/* Listening indicator */}
      <div className="flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        <span className="text-sm font-medium text-white/60">Listening...</span>
      </div>

      {/* Transcript */}
      <div className="w-full min-h-[120px] max-h-[300px] overflow-y-auto px-2 mb-8">
        {(transcript || interimText) ? (
          <p className="text-xl leading-relaxed">
            <span className="text-white">{transcript}</span>
            {interimText && (
              <span className="text-white/50">{transcript ? " " : ""}{interimText}</span>
            )}
          </p>
        ) : (
          <p className="text-white/30 text-lg italic">Speak now...</p>
        )}
      </div>

      {/* Stop instruction */}
      <p className="text-white/30 text-sm">Tap the microphone to stop</p>

      {/* Pulse ring animation handled by Tailwind animate-ping */}
    </div>
  );
}

/* ── Processing ── */

function ProcessingView({ transcript }: { transcript: string }) {
  return (
    <div className="flex flex-col items-center text-center max-w-lg w-full">
      {/* Spinner */}
      <div className="mb-6">
        <span className="block w-12 h-12 border-[3px] border-white/20 border-t-[#4F56E8] rounded-full animate-spin" />
      </div>

      <h2 className="text-xl font-bold text-white mb-2">AVA is reading your information...</h2>
      <p className="text-white/40 text-sm mb-8">Extracting details from your speech</p>

      {/* Transcript preview */}
      {transcript && (
        <div className="w-full max-h-[200px] overflow-y-auto px-4 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-white/50 text-sm leading-relaxed text-left">&ldquo;{transcript}&rdquo;</p>
        </div>
      )}
    </div>
  );
}

/* ── Results ── */

function ResultsView({
  extractedFields,
  filledKeys,
  missingPriority,
  onSpeakAgain,
  onFillForm,
}: {
  extractedFields: VoiceFields;
  filledKeys: (keyof VoiceFields)[];
  missingPriority: (keyof VoiceFields)[];
  onSpeakAgain: () => void;
  onFillForm: () => void;
}) {
  return (
    <div className="flex flex-col items-center w-full max-w-2xl">
      {/* Summary */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            {filledKeys.length} {filledKeys.length === 1 ? "field" : "fields"} detected
          </h2>
          {missingPriority.length > 0 && (
            <p className="text-amber-400/70 text-xs font-medium">
              {missingPriority.length} important {missingPriority.length === 1 ? "field" : "fields"} not detected
            </p>
          )}
        </div>
      </div>

      {/* Fields grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 max-h-[400px] overflow-y-auto pr-1">
        {ALL_FIELDS.map((key) => {
          const value = extractedFields[key];
          const isFilled = typeof value === "string" && value.trim().length > 0;
          const isPriority = PRIORITY_FIELDS.includes(key);
          const isMissingPriority = isPriority && !isFilled;

          return (
            <div
              key={key}
              className={`
                px-4 py-3 rounded-xl border
                ${
                  isFilled
                    ? "bg-white/[0.04] border-white/[0.08]"
                    : isMissingPriority
                      ? "bg-amber-500/[0.04] border-amber-500/10"
                      : "bg-white/[0.02] border-white/[0.04]"
                }
              `}
            >
              <div className="flex items-start gap-2.5">
                {/* Icon */}
                <div className="shrink-0 mt-0.5">
                  {isFilled ? (
                    <svg
                      className="w-4 h-4 text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isMissingPriority ? (
                    <svg
                      className="w-4 h-4 text-amber-400/70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-white/20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                  )}
                </div>

                {/* Label + Value */}
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-xs font-medium mb-0.5">{FIELD_LABELS[key]}</p>
                  {isFilled ? (
                    <p className="text-white font-medium text-sm truncate">{value}</p>
                  ) : isMissingPriority ? (
                    <p className="text-white/30 text-sm italic">Not detected</p>
                  ) : (
                    <p className="text-white/20 text-sm">--</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit hint */}
      <p className="text-white/30 text-xs mb-6">You can edit any field after filling</p>

      {/* CTAs */}
      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={onSpeakAgain}
          className="
            flex-1 py-3.5 rounded-xl
            bg-white/10 text-white/70 font-semibold text-base
            hover:bg-white/15 hover:text-white/90 active:scale-[0.97]
            transition-all duration-200
          "
        >
          Speak Again
        </button>
        <button
          onClick={onFillForm}
          className="
            flex-1 py-3.5 rounded-xl
            bg-[#4F56E8] text-white font-semibold text-base
            shadow-[0_0_30px_rgba(79,86,232,0.25)]
            hover:bg-[#5B63F0] hover:shadow-[0_0_40px_rgba(79,86,232,0.35)]
            active:scale-[0.97]
            transition-all duration-200
          "
        >
          Fill Form
        </button>
      </div>
    </div>
  );
}
