"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRec = any;

/* ═══════════════════════════════════════════════
   Step-to-Fields Mapping
   ═══════════════════════════════════════════════ */

interface FieldDef {
  key: string;
  label: string;
  prompt: string;
  hint: string;
  optional?: boolean;
}

const STEP_FIELDS: Record<number, FieldDef[]> = {
  0: [
    { key: "firstName", label: "First Name", prompt: "your first name", hint: "e.g. Kemar" },
    { key: "lastName", label: "Last Name", prompt: "your last name", hint: "e.g. Campbell" },
    { key: "middleName", label: "Middle Name", prompt: "your middle name if you have one", hint: "e.g. Anthony", optional: true },
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

function hasValue(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

type VoiceState = "idle" | "listening" | "processing";

/* ═══════════════════════════════════════════════
   Real-time client-side extraction
   Runs on EVERY interim result — instant feedback
   ═══════════════════════════════════════════════ */

function extractFromTranscript(text: string, currentFieldKey?: string, alreadyExtracted?: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  const already = alreadyExtracted || {};

  // ── Context-aware: if we know what field is highlighted, be aggressive ──
  // Just grab the first meaningful words the user says for that field
  if (currentFieldKey) {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const lastWords = words.slice(-3).join(" "); // last few words spoken
    const allWords = words.join(" ");

    if (currentFieldKey === "firstName" && !already.firstName && words.length >= 1) {
      // First word(s) they say = first name
      const nameWords = words.filter(w => /^[A-Z]/i.test(w) && !/^(my|name|is|i'm|i|am|the|a|an)$/i.test(w));
      if (nameWords.length > 0) result.firstName = nameWords[0].charAt(0).toUpperCase() + nameWords[0].slice(1).toLowerCase();
    }
    if (currentFieldKey === "lastName" && !already.lastName && words.length >= 1) {
      const nameWords = words.filter(w => /^[A-Z]/i.test(w) && !/^(my|name|is|i'm|i|am|the|a|an|last)$/i.test(w));
      if (nameWords.length > 0) {
        const w = nameWords[nameWords.length - 1];
        result.lastName = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      }
    }
    if (currentFieldKey === "middleName" && !already.middleName) {
      if (/(?:no|none|skip|don't|dont|n\/a|nope)/i.test(allWords)) {
        result.middleName = "N/A";
      } else {
        const nameWords = words.filter(w => /^[A-Z]/i.test(w) && !/^(my|name|is|middle|i|the|a)$/i.test(w));
        if (nameWords.length > 0) result.middleName = nameWords[0].charAt(0).toUpperCase() + nameWords[0].slice(1).toLowerCase();
      }
    }
    if (currentFieldKey === "dateOfBirth" && !already.dateOfBirth) {
      // Any date-like text
      const dateMatch = allWords.match(/(\w+\s+\d{1,2}(?:st|nd|rd|th)?\s*,?\s*\d{4}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i);
      if (dateMatch) result.dateOfBirth = dateMatch[1];
    }
    if (currentFieldKey === "cityOfBirth" && !already.cityOfBirth) {
      const cityWords = words.filter(w => /^[A-Z]/i.test(w) && !/^(city|town|born|in|is|the|of|my)$/i.test(w));
      if (cityWords.length > 0) result.cityOfBirth = cityWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
    if ((currentFieldKey === "countryOfBirth" || currentFieldKey === "countryOfCitizenship") && !already[currentFieldKey]) {
      const countryWords = words.filter(w => /^[A-Z]/i.test(w) && !/^(country|from|born|in|is|the|of|my|citizen|citizenship)$/i.test(w));
      if (countryWords.length > 0) result[currentFieldKey] = countryWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
    if (currentFieldKey === "phone" && !already.phone) {
      const phoneMatch = allWords.match(/[\d][\d\s\-()]{5,}/);
      if (phoneMatch) result.phone = phoneMatch[0].trim();
    }
    if (currentFieldKey === "email" && !already.email) {
      const emailMatch = allWords.match(/[\w.+-]+@[\w.-]+\.\w{2,}/i);
      if (emailMatch) result.email = emailMatch[0].toLowerCase();
      // Also spoken: "kemar at gmail dot com"
      const spokenEmail = allWords.match(/([\w.+-]+)\s+at\s+([\w.-]+)\s+dot\s+(\w{2,})/i);
      if (spokenEmail) result.email = `${spokenEmail[1]}@${spokenEmail[2]}.${spokenEmail[3]}`.toLowerCase();
    }
    if (currentFieldKey === "addressUsa" && !already.addressUsa) {
      // Any substantial text with a number = likely address
      if (/\d/.test(allWords) && words.length >= 3) result.addressUsa = allWords;
    }
    if (currentFieldKey === "amount" && !already.amount) {
      const numMatch = allWords.match(/[\d,]+/);
      if (numMatch) result.amount = numMatch[0].replace(/,/g, "");
    }
    if (currentFieldKey === "city" && !already.city) {
      if (/new\s*york|nyc/i.test(allWords)) result.city = "new_york";
      if (/nashville/i.test(allWords)) result.city = "nashville";
    }
    if (currentFieldKey === "homeCountry" && !already.homeCountry) {
      const countryWords = words.filter(w => /^[A-Z]/i.test(w) && !/^(country|home|my|is|the|of)$/i.test(w));
      if (countryWords.length > 0) result.homeCountry = countryWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
    if (currentFieldKey === "homeCity" && !already.homeCity) {
      const cityWords = words.filter(w => /^[A-Z]/i.test(w) && !/^(city|home|my|is|the|of)$/i.test(w));
      if (cityWords.length > 0) result.homeCity = cityWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
    if (currentFieldKey === "homeAddress" && !already.homeAddress) {
      if (words.length >= 2) result.homeAddress = allWords;
    }
    if (currentFieldKey === "passportNumber" && !already.passportNumber) {
      const passMatch = allWords.match(/[A-Z0-9]{5,}/i);
      if (passMatch) result.passportNumber = passMatch[0].toUpperCase();
    }
    if (currentFieldKey === "passportExpiry" && !already.passportExpiry) {
      const dateMatch = allWords.match(/(\w+\s+\d{1,2}(?:st|nd|rd|th)?\s*,?\s*\d{4}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i);
      if (dateMatch) result.passportExpiry = dateMatch[1];
    }
    if (currentFieldKey === "passportCountry" && !already.passportCountry) {
      const countryWords = words.filter(w => /^[A-Z]/i.test(w) && !/^(country|passport|issued|by|is|the|of|my)$/i.test(w));
      if (countryWords.length > 0) result.passportCountry = countryWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
    if (currentFieldKey === "usEntryDate" && !already.usEntryDate) {
      const dateMatch = allWords.match(/(\w+\s+\d{1,2}(?:st|nd|rd|th)?\s*,?\s*\d{4}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i);
      if (dateMatch) result.usEntryDate = dateMatch[1];
    }
  }

  // Name patterns — flexible: "my name is X Y", "I'm X Y Z", "call me X"
  // Also handles "my name is Mary Jane Watson" (first=Mary Jane, last=Watson)
  const nameIntro = text.match(/(?:my name is|i'm|i am|name's|call me)\s+(.+?)(?:\.|,|and\s+(?:i|my)|born|from|i was|$)/i);
  if (nameIntro) {
    const parts = nameIntro[1].trim().split(/\s+/).filter(p => p.length > 0);
    if (parts.length === 2) {
      result.firstName = parts[0];
      result.lastName = parts[1];
    } else if (parts.length === 3) {
      result.firstName = parts[0];
      result.middleName = parts[1];
      result.lastName = parts[2];
    } else if (parts.length > 3) {
      // Four+ parts: first two = first name, last = last name, middle = rest
      result.firstName = parts.slice(0, 2).join(" ");
      result.lastName = parts[parts.length - 1];
      if (parts.length > 3) result.middleName = parts.slice(2, -1).join(" ");
    } else if (parts.length === 1) {
      result.firstName = parts[0];
    }
  }

  // "first name X"
  const firstMatch = text.match(/first\s*name\s+(?:is\s+)?([A-Z][a-z]+)/i);
  if (firstMatch) result.firstName = firstMatch[1];

  // "last name X"
  const lastMatch = text.match(/last\s*name\s+(?:is\s+)?([A-Z][a-z]+)/i);
  if (lastMatch) result.lastName = lastMatch[1];

  // "middle name X" or "no middle name" / "skip middle" / "don't have a middle name"
  if (/(?:no|don't have|skip|none)\s+(?:a\s+)?middle/i.test(text)) {
    result.middleName = "N/A";
  } else {
    const middleMatch = text.match(/middle\s*name\s+(?:is\s+)?([A-Z][a-z]+)/i);
    if (middleMatch) result.middleName = middleMatch[1];
  }

  // Date of birth: "born on March 5 1990" or "date of birth is March 5th 1990" etc
  const dobMatch = text.match(/(?:born|birth|birthday|date of birth)\s+(?:on\s+)?(?:is\s+)?(.+?\d{4})/i);
  if (dobMatch) result.dateOfBirth = dobMatch[1].trim();

  // "born in Kingston" or "birth city is Kingston"
  const birthCityMatch = text.match(/(?:born in|birth city\s+(?:is\s+)?)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
  if (birthCityMatch) result.cityOfBirth = birthCityMatch[1].trim();

  // Country: "from Jamaica" or "country is Jamaica" or "citizen of Jamaica"
  const countryMatch = text.match(/(?:from|country\s+(?:is\s+)?|citizen(?:ship)?\s+(?:is\s+)?(?:of\s+)?)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
  if (countryMatch) {
    const place = countryMatch[1].trim();
    if (!result.countryOfBirth) result.countryOfBirth = place;
    if (!result.countryOfCitizenship) result.countryOfCitizenship = place;
  }

  // "birth country is X" specifically
  const birthCountryMatch = text.match(/birth\s+country\s+(?:is\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
  if (birthCountryMatch) result.countryOfBirth = birthCountryMatch[1].trim();

  // "citizenship is X" specifically
  const citizenshipMatch = text.match(/citizenship\s+(?:is\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
  if (citizenshipMatch) result.countryOfCitizenship = citizenshipMatch[1].trim();

  // Phone: any sequence of 10+ digits
  const phoneMatch = text.match(/\d[\d\s\-()]{8,}\d/);
  if (phoneMatch) result.phone = phoneMatch[0];

  // Email: standard email pattern
  const emailMatch = text.match(/[\w.+-]+\s*(?:@|at)\s*[\w.-]+\s*(?:\.|dot)\s*\w{2,}/i);
  if (emailMatch) {
    // Normalize spoken "at" and "dot"
    result.email = emailMatch[0]
      .replace(/\s*at\s*/gi, "@")
      .replace(/\s*dot\s*/gi, ".")
      .replace(/\s/g, "")
      .toLowerCase();
  }
  // Also try standard email regex
  const emailDirect = text.match(/[\w.+-]+@[\w.-]+\.\w{2,}/i);
  if (emailDirect) result.email = emailDirect[0].toLowerCase();

  // Passport number: alphanumeric 6-12 chars
  const passportMatch = text.match(/passport\s+(?:number\s+(?:is\s+)?)?([A-Z0-9]{6,12})/i);
  if (passportMatch) result.passportNumber = passportMatch[1].toUpperCase();

  // Amount / earnings
  const amountMatch = text.match(/(?:earn|make|salary|income|amount)\s+(?:is\s+)?(?:about\s+)?\$?([\d,]+)/i);
  if (amountMatch) result.amount = amountMatch[1].replace(/,/g, "");

  // Address patterns: "I live at..." or "my address is..."
  const addressMatch = text.match(/(?:live at|address is|staying at)\s+(.+?)(?:\.|$)/i);
  if (addressMatch) result.addressUsa = addressMatch[1].trim();

  // "New York" or "Nashville" for appointment city
  if (/new\s*york|nyc/i.test(text)) result.city = "new_york";
  if (/nashville/i.test(text)) result.city = "nashville";

  return result;
}

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */

export default function VoiceFill({ step, currentData, onFill, onClose }: VoiceFillProps) {
  const fields = STEP_FIELDS[step] ?? [];

  const [state, setState] = useState<VoiceState>(() =>
    fields.length === 0 ? "idle" : "idle"
  );
  const [available] = useState(() => !!getSpeechRecognition());
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [extracted, setExtracted] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const recognitionRef = useRef<SpeechRec | null>(null);
  const transcriptRef = useRef("");
  const fieldListRef = useRef<HTMLDivElement>(null);
  const extractedRef = useRef<Record<string, string>>({});
  const currentFieldIndexRef = useRef(0);

  /* ─── Merged data: currentData + extracted (extracted wins) ─── */
  const mergedData = useMemo(() => {
    const merged: Record<string, string> = {};
    for (const f of fields) {
      const ext = extracted[f.key];
      if (hasValue(ext)) {
        merged[f.key] = ext;
      } else if (hasValue(currentData[f.key])) {
        merged[f.key] = String(currentData[f.key]);
      }
    }
    return merged;
  }, [fields, currentData, extracted]);

  /* ─── First unfilled field index ─── */
  const currentFieldIndex = useMemo(() => {
    for (let i = 0; i < fields.length; i++) {
      if (!hasValue(mergedData[fields[i].key])) return i;
    }
    return -1; // all filled
  }, [fields, mergedData]);

  const hasAnyExtracted = Object.keys(extracted).length > 0;
  const allFilled = currentFieldIndex === -1 && fields.length > 0;

  // Keep refs in sync for use inside speech callback closures
  extractedRef.current = extracted;
  currentFieldIndexRef.current = currentFieldIndex;

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

  /* ─── Auto-scroll to current field ─── */
  useEffect(() => {
    if (currentFieldIndex < 0 || !fieldListRef.current) return;
    const container = fieldListRef.current;
    const row = container.children[currentFieldIndex] as HTMLElement | undefined;
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentFieldIndex]);

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
      setTranscript(finalParts);
      setInterimText(interimParts);

      // Real-time client-side extraction — context-aware based on current highlighted field
      const fullText = finalParts + " " + interimParts;
      const cfIdx = currentFieldIndexRef.current;
      const cfKey = cfIdx >= 0 ? fields[cfIdx]?.key : undefined;
      const clientExtracted = extractFromTranscript(fullText, cfKey, extractedRef.current);
      if (Object.keys(clientExtracted).length > 0) {
        setExtracted((prev) => ({ ...prev, ...clientExtracted }));
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone access denied. Allow mic in browser settings.");
        setState("idle");
      } else if (event.error === "no-speech") {
        // silent — stay listening
      } else if (event.error === "aborted") {
        // intentional
      } else {
        setError(`Speech error: ${event.error}. Try again.`);
        setState("idle");
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
        const finalTranscript = transcriptRef.current.trim();
        if (finalTranscript.length > 0) {
          processTranscript(finalTranscript);
        } else {
          setState("idle");
        }
      }
    };

    recognitionRef.current = recognition;
    setState("listening");

    try {
      recognition.start();
    } catch {
      setError("Could not start. Try again.");
      setState("idle");
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

  /* ─── Process Transcript (LLM refinement) ─── */
  const processTranscript = useCallback(
    async (text: string) => {
      setState("processing");
      setError(null);

      try {
        const response = await fetch("/api/itin-voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: text,
            currentFields: extracted,
          }),
        });

        if (!response.ok) throw new Error(`Server error (${response.status})`);

        const data = await response.json();
        const newFields: Record<string, string> = data.fields || {};

        // Filter to only keys in current step
        const stepKeys = new Set(fields.map((f) => f.key));
        const validFields: Record<string, string> = {};
        for (const [key, value] of Object.entries(newFields)) {
          if (stepKeys.has(key) && typeof value === "string" && value.trim().length > 0) {
            validFields[key] = value;
          }
        }

        // LLM results override client-side matches (more accurate)
        setExtracted((prev) => ({ ...prev, ...validFields }));
      } catch {
        // Client-side extraction already applied — just note the error
        setError("LLM refinement failed. Results may need manual correction.");
      }

      setState("idle");
    },
    [extracted, fields]
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

  /* ═══════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════ */

  // No voice fields for this step
  if (fields.length === 0) return null;

  // Voice not available
  if (!available) {
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
            Voice input is not supported on this device or browser.
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
            : currentFieldIndex >= 0
              ? `Current field: ${fields[currentFieldIndex].label}`
              : "All fields filled."}
      </div>

      {/* ── Header ── */}
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

      {/* ── Field List (always visible) ── */}
      <div
        ref={fieldListRef}
        className="flex-1 overflow-y-auto px-2 min-h-0"
      >
        {fields.map((f, i) => {
          const value = mergedData[f.key];
          const filled = hasValue(value);
          const isCurrent = i === currentFieldIndex;

          /* Current unfilled field = HUGE karaoke highlight */
          if (isCurrent) {
            return (
              <div
                key={f.key}
                className="flex flex-col items-center justify-center px-5 py-6 mx-1 mb-2 rounded-2xl bg-white/[0.06] transition-all duration-300"
              >
                <span className="text-3xl sm:text-4xl font-bold text-white mb-1 tracking-tight">
                  {f.label}
                </span>
                <span className="text-base text-white/25 italic">{f.hint}</span>
              </div>
            );
          }

          return (
            <div
              key={f.key}
              className="flex items-center px-4 py-2.5 mx-1 rounded-xl mb-0.5 transition-all duration-300"
            >
              {/* Check or number */}
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-3">
                {filled ? (
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={`text-xs font-bold ${isCurrent ? "text-[#818CF8]" : "text-white/15"}`}>
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-sm font-medium shrink-0 transition-colors duration-300 ${
                filled ? "text-white/40" : "text-white/20"
              }`}>
                {f.label}
                {f.optional && !filled && (
                  <span className="text-xs text-white/15 ml-1.5 font-normal italic">optional</span>
                )}
              </span>

              {/* Dotted line spacer */}
              <div className={`flex-1 mx-3 border-b border-dotted transition-colors duration-300 ${
                filled ? "border-white/5" : isCurrent ? "border-white/15" : "border-white/5"
              }`} />

              {/* Value or placeholder */}
              <span className={`text-sm text-right shrink-0 max-w-[50%] truncate transition-all duration-300 ${
                filled ? "text-white font-semibold" : "text-transparent"
              }`}>
                {filled ? value : ""}
              </span>
            </div>
          );
        })}

        {/* All filled message */}
        {allFilled && (
          <div className="flex items-center justify-center gap-2 py-4 mt-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-semibold text-emerald-400">All fields captured</span>
          </div>
        )}
      </div>

      {/* ── Bottom section ── */}
      <div className="shrink-0 pb-8 pt-3 flex flex-col items-center gap-3 px-5">

        {/* Live transcript line */}
        <div className="text-center px-5 py-1 text-sm text-white/40 italic truncate w-full max-w-md min-h-[24px]">
          {(transcript || interimText) ? (
            <>
              &ldquo;
              <span className="text-white/50">{transcript}</span>
              {interimText && (
                <span className="text-white/25">{transcript ? " " : ""}{interimText}</span>
              )}
              &rdquo;
            </>
          ) : state === "processing" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="block w-3.5 h-3.5 border-2 border-white/10 border-t-[#818CF8] rounded-full animate-spin" />
              <span className="text-white/30">Refining...</span>
            </span>
          ) : null}
        </div>

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
            </>
          )}
          <button
            onClick={toggleMic}
            disabled={state === "processing"}
            aria-label={state === "listening" ? "Stop listening" : "Start voice input"}
            className={`
              relative z-10 w-[72px] h-[72px] rounded-full flex items-center justify-center
              active:scale-[0.95] transition-all duration-200
              ${state === "processing"
                ? "bg-white/10 cursor-not-allowed"
                : state === "listening"
                  ? "bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]"
                  : "bg-[#4F56E8] shadow-[0_0_40px_rgba(79,86,232,0.3)] hover:shadow-[0_0_60px_rgba(79,86,232,0.4)] hover:bg-[#5B63F0]"
              }
            `}
          >
            {state === "processing" ? (
              <span className="block w-7 h-7 border-[2.5px] border-white/20 border-t-white/60 rounded-full animate-spin" />
            ) : state === "listening" ? (
              /* Stop icon (square) */
              <div className="w-6 h-6 rounded-sm bg-white" />
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </div>

        {/* Mic label */}
        <p className="text-white/25 text-xs">
          {state === "listening"
            ? "Tap to stop"
            : state === "processing"
              ? "Processing..."
              : "Tap to start"}
        </p>

        {/* Done button — appears when any field has been filled by voice */}
        {hasAnyExtracted && state !== "listening" && state !== "processing" && (
          <button
            onClick={handleDone}
            className="w-full max-w-xs py-3.5 rounded-xl bg-[#4F56E8] text-white font-semibold text-base shadow-[0_0_30px_rgba(79,86,232,0.25)] hover:bg-[#5B63F0] hover:shadow-[0_0_40px_rgba(79,86,232,0.35)] active:scale-[0.97] transition-all duration-200"
          >
            Done
          </button>
        )}
      </div>

      {/* Keyframe for gentle-pulse */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gentle-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}} />
    </div>
  );
}
