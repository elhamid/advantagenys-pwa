"use client";

import { useState, useCallback, useEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRec = any;

/* ═══════════════════════════════════════════════
   Field definitions per step
   ═══════════════════════════════════════════════ */

interface FieldDef {
  key: string;
  label: string;
  optional?: boolean;
}

const STEP_FIELDS: Record<number, FieldDef[]> = {
  0: [], // Passport scan — no voice fields
  1: [   // Personal Info
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "middleName", label: "Middle Name", optional: true },
    { key: "dateOfBirth", label: "Date of Birth" },
    { key: "cityOfBirth", label: "Birth City" },
    { key: "countryOfBirth", label: "Birth Country" },
    { key: "countryOfCitizenship", label: "Citizenship" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email", optional: true },
  ],
  2: [   // Location & Work
    { key: "addressUsa", label: "US Address" },
    { key: "usEntryDate", label: "US Entry Date" },
    { key: "homeCountry", label: "Home Country" },
    { key: "homeCity", label: "Home City" },
    { key: "homeAddress", label: "Home Address (non-US)" },
    { key: "amount", label: "Annual Earnings ($)" },
  ],
  3: [], // Selfie
  4: [], // Review
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

/* ═══════════════════════════════════════════════
   Component

   SIMPLE DESIGN:
   - Top: field labels as pills (checked off after LLM extraction)
   - Middle: transcript box showing what they said
   - Bottom: mic button + Done

   User speaks freely. Sees their words appear.
   Taps stop. LLM extracts fields. Pills check off.
   Taps Done. Form fills.
   ═══════════════════════════════════════════════ */

type VoiceState = "idle" | "listening" | "processing" | "results";

export default function VoiceFill({ step, currentData, onFill, onClose }: VoiceFillProps) {
  const fields = STEP_FIELDS[step] ?? [];

  const [state, setState] = useState<VoiceState>("idle");
  const [available] = useState(() => !!getSpeechRecognition());
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [extracted, setExtracted] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const recognitionRef = useRef<SpeechRec | null>(null);
  const transcriptRef = useRef("");
  const interimRef = useRef(""); // track interim text for inclusion on stop
  const accumulatedRef = useRef("");
  const stoppedByUserRef = useRef(false);

  // No voice fields for this step
  if (fields.length === 0) return null;

  /* ─── Mount animation ─── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  /* ─── Escape key ─── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ─── Cleanup on unmount ─── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* noop */ }
      }
    };
  }, []);

  /* ─── Start Listening ─── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const startListening = useCallback(() => {
    setError(null);
    setTranscript("");
    setInterimText("");
    transcriptRef.current = "";
    accumulatedRef.current = "";
    stoppedByUserRef.current = false;

    const Ctor = getSpeechRecognition();
    if (!Ctor) return;

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
      interimRef.current = interimParts;
      const full = accumulatedRef.current + (accumulatedRef.current && finalParts ? " " : "") + finalParts;
      setTranscript(full);
      setInterimText(interimParts);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone access denied. Allow mic in browser settings.");
        setState("idle");
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(`Speech error: ${event.error}`);
        setState("idle");
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      // Include BOTH final and interim text — interim may contain words that
      // never became "final" before iOS Safari dropped the session
      const seg = (transcriptRef.current + " " + interimRef.current).trim();
      if (seg) {
        accumulatedRef.current = accumulatedRef.current ? accumulatedRef.current + " " + seg : seg;
      }
      interimRef.current = "";
      console.log("[AVA] onend — accumulated so far:", accumulatedRef.current);
      // Auto-restart unless user tapped stop
      if (!stoppedByUserRef.current) {
        transcriptRef.current = "";
        // Show accumulated text while restarting so user sees everything
        setTranscript(accumulatedRef.current);
        setInterimText("");
        try { recognition.start(); return; } catch { /* fall through */ }
      }
      recognitionRef.current = null;
      const fullText = accumulatedRef.current.trim();
      console.log("[AVA] Final transcript to process:", fullText);
      if (fullText) {
        processTranscript(fullText);
      } else {
        setState("idle");
      }
    };

    recognitionRef.current = recognition;
    setState("listening");
    try { recognition.start(); } catch {
      setError("Could not start mic.");
      setState("idle");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Stop Listening ─── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const stopListening = useCallback(() => {
    stoppedByUserRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* noop */ }
    }
  }, []);

  /* ─── Process via LLM ─── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const processTranscript = useCallback(async (text: string) => {
    setState("processing");
    console.log("[AVA] Sending transcript to LLM:", text);
    console.log("[AVA] Transcript length:", text.length, "words:", text.split(/\s+/).length);
    try {
      const res = await fetch("/api/itin-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, currentFields: extracted }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      console.log("[AVA] LLM response:", JSON.stringify(data));
      const newFields: Record<string, string> = data.fields || {};
      // Only keep fields for this step
      const stepKeys = new Set(fields.map(f => f.key));
      const valid: Record<string, string> = {};
      for (const [k, v] of Object.entries(newFields)) {
        if (stepKeys.has(k) && typeof v === "string" && v.trim()) valid[k] = v;
      }
      console.log("[AVA] Valid fields for step:", JSON.stringify(valid));
      setExtracted(prev => ({ ...prev, ...valid }));
      setState("results");
    } catch (err) {
      console.error("[AVA] Processing error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Processing failed: ${msg}. Try again or fill manually.`);
      setState("idle");
    }
  }, [extracted, fields]);

  /* ─── Done ─── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleDone = useCallback(() => {
    onFill(extracted);
    onClose();
  }, [extracted, onFill, onClose]);

  /* ─── Toggle mic ─── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const toggleMic = useCallback(() => {
    if (state === "listening") stopListening();
    else startListening();
  }, [state, stopListening, startListening]);

  /* ─── Which fields are filled ─── */
  const isFieldDone = (key: string) => {
    const ext = extracted[key];
    if (typeof ext === "string" && ext.trim()) return true;
    const cur = currentData[key];
    if (typeof cur === "string" && cur.trim()) return true;
    return false;
  };

  const filledCount = fields.filter(f => isFieldDone(f.key)).length;

  /* ═══════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════ */

  if (!available) {
    return (
      <div
        role="dialog" aria-modal="true"
        className={`fixed inset-0 z-50 bg-[#0F1B2D] flex items-center justify-center transition-all duration-300 ${mounted ? "opacity-100" : "opacity-0"}`}
      >
        <div className="text-center px-6">
          <p className="text-white/50 text-lg mb-6">Voice not available on this device</p>
          <button onClick={onClose} className="px-8 py-3 rounded-xl bg-white/10 text-white/70 font-semibold active:scale-[0.95] transition-all">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog" aria-modal="true"
      className={`fixed inset-0 z-50 bg-[#0F1B2D] flex flex-col transition-all duration-300 ${mounted ? "opacity-100" : "opacity-0"}`}
    >
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-3 shrink-0">
        <span className="text-sm font-semibold text-white/50">AVA Voice</span>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 text-white/60 hover:bg-white/15 active:scale-[0.95] transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* ── Field pills (top) — what they need to say ── */}
      <div className="px-4 pb-4 shrink-0">
        <div className="flex flex-wrap gap-2 justify-center">
          {fields.map(f => {
            const done = isFieldDone(f.key);
            const val = extracted[f.key];
            return (
              <div
                key={f.key}
                className={`
                  flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-500
                  ${done
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "bg-white/5 text-white/50 border border-white/10"
                  }
                `}
              >
                {done && (
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span>{f.label}</span>
                {done && val && (
                  <span className="text-emerald-300/70 text-xs ml-0.5 max-w-[100px] truncate">{val}</span>
                )}
                {f.optional && !done && (
                  <span className="text-white/20 text-xs italic">optional</span>
                )}
              </div>
            );
          })}
        </div>
        {state === "results" && (
          <p className="text-center text-sm text-white/30 mt-3">{filledCount} of {fields.length} fields captured</p>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="px-5 pb-3 shrink-0">
          <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400/80 text-sm text-center">
            {error}
          </div>
        </div>
      )}

      {/* ── Transcript box (middle) — what they said ── */}
      <div className="flex-1 px-5 pb-3 min-h-0 flex flex-col">
        <div className="flex-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 overflow-y-auto">
          {(transcript || interimText) ? (
            <p className="text-xl leading-relaxed">
              <span className="text-white/80">{transcript}</span>
              {interimText && (
                <span className="text-white/30">{transcript ? " " : ""}{interimText}</span>
              )}
            </p>
          ) : state === "processing" ? (
            <div className="flex items-center justify-center h-full gap-3">
              <span className="block w-5 h-5 border-2 border-white/10 border-t-[#818CF8] rounded-full animate-spin" />
              <span className="text-white/40">AVA is processing...</span>
            </div>
          ) : (
            <p className="text-white/15 text-lg italic text-center mt-8">
              {state === "listening" ? "Speak now — say your name, date of birth, where you're from..." : "Tap the microphone and speak freely"}
            </p>
          )}
        </div>
      </div>

      {/* ── Bottom: mic + actions ── */}
      <div className="shrink-0 pb-8 pt-3 flex flex-col items-center gap-3 px-5">
        {/* Mic button */}
        <div className="relative">
          {state === "listening" && (
            <>
              <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: "2s" }} />
              <span className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
            </>
          )}
          <button
            onClick={toggleMic}
            disabled={state === "processing"}
            className={`
              relative z-10 w-[72px] h-[72px] rounded-full flex items-center justify-center
              active:scale-[0.93] transition-all duration-200
              ${state === "processing"
                ? "bg-white/10 cursor-not-allowed"
                : state === "listening"
                  ? "bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]"
                  : "bg-[#4F56E8] shadow-[0_0_40px_rgba(79,86,232,0.3)] hover:bg-[#5B63F0]"
              }
            `}
          >
            {state === "processing" ? (
              <span className="block w-7 h-7 border-[2.5px] border-white/20 border-t-white/60 rounded-full animate-spin" />
            ) : state === "listening" ? (
              <div className="w-6 h-6 rounded-sm bg-white" />
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-white/25 text-xs">
          {state === "listening" ? "Tap to stop" : state === "processing" ? "Processing..." : "Tap to start"}
        </p>

        {/* Action buttons */}
        {(state === "results" || (state === "idle" && filledCount > 0)) && (
          <div className="flex gap-3 w-full max-w-sm">
            <button
              onClick={() => { setExtracted({}); setTranscript(""); setInterimText(""); setState("idle"); }}
              className="flex-1 py-3.5 rounded-xl bg-white/10 text-white/60 font-semibold text-sm hover:bg-white/15 active:scale-[0.97] transition-all"
            >
              Try Again
            </button>
            <button
              onClick={handleDone}
              className="flex-1 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:bg-emerald-500 active:scale-[0.97] transition-all"
            >
              Fill Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
