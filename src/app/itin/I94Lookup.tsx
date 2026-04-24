"use client";

import { useState } from "react";
import type { ItinData } from "./steps/types";
import { formatDateUS } from "./steps/types";

export function I94Lookup({ data, onClose }: { data: ItinData; onClose: () => void }) {
  const fields = [
    { label: "First Name", value: data.firstName.toUpperCase() },
    { label: "Last Name", value: data.lastName.toUpperCase() },
    { label: "Birth Date", value: formatDateUS(data.dateOfBirth) },
    { label: "Passport Number", value: data.passportNumber.toUpperCase() },
    { label: "Country", value: (data.countryOfBirth || data.passportCountry).toUpperCase() },
  ].filter((f) => f.value);

  const [copied, setCopied] = useState<string | null>(null);

  const copyField = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyAll = () => {
    const text = fields.map((f) => `${f.label}: ${f.value}`).join("\n");
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

        <a
          href="https://i94.cbp.dhs.gov/search/history-search"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#4F56E8] text-white font-semibold text-sm hover:bg-[#5B63F0] active:scale-[0.97] transition-all duration-200 shadow-[0_0_20px_rgba(79,86,232,0.2)]"
        >
          Open I-94 Website
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
