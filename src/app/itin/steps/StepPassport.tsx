"use client";

import { SectionHeader } from "./primitives";
import type { ItinData } from "./types";

interface StepPassportProps {
  data: ItinData;
  errors: Partial<Record<keyof ItinData, string>>;
  update: <K extends keyof ItinData>(field: K, value: ItinData[K]) => void;
  docPreview: string | null;
  onOpenScanner: () => void;
  onClear: () => void;
  ocrStatus: "idle" | "processing" | "success" | "failed";
  ocrFields: Record<string, string> | null;
}

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

export function StepPassport({
  data,
  docPreview,
  onOpenScanner,
  onClear,
  ocrStatus,
  ocrFields,
}: StepPassportProps) {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Scan Your Passport"
        subtitle="Place your passport face-down and scan it. We'll fill in your details automatically."
      />

      {data.documentScan && docPreview ? (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={docPreview}
              alt="Scanned document preview"
              className="w-full h-56 sm:h-64 object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Document Captured
            </div>
          </div>

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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 active:scale-[0.97] transition-all duration-200 min-h-[48px]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake
            </button>
            <button
              type="button"
              onClick={onClear}
              className="px-4 py-3 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 transition-all duration-200 min-h-[48px]"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={onOpenScanner}
            className="w-full py-12 rounded-2xl border-2 border-dashed border-[#4F56E8]/30 bg-[#4F56E8]/5 hover:bg-[#4F56E8]/10 flex flex-col items-center gap-4 transition-all duration-200 active:scale-[0.98] group"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#4F56E8]/20 flex items-center justify-center group-hover:bg-[#4F56E8]/30 transition-colors">
              <svg className="w-8 h-8 text-[#818CF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <div className="text-center">
              <span className="text-base font-semibold text-white/80 block">Tap to Scan Passport</span>
              <span className="text-sm text-white/40 mt-1 block">We&apos;ll auto-fill your details from the scan</span>
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
