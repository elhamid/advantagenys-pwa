"use client";

import { Label, ReviewField, SectionHeader } from "./primitives";
import { CITIES, formatDateUS } from "./types";
import type { ItinData } from "./types";

interface StepReviewProps {
  data: ItinData;
  errors: Partial<Record<keyof ItinData, string>>;
  docPreview: string | null;
  sigPreview: string | null;
  onOpenSignaturePad: () => void;
  onClearSignature: () => void;
}

export function StepReview({
  data,
  errors,
  docPreview,
  sigPreview,
  onOpenSignaturePad,
  onClearSignature,
}: StepReviewProps) {
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
          <h3 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider mb-3">Personal Information</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewField label="Name" value={[data.firstName, data.middleName, data.lastName].filter(Boolean).join(" ")} />
            <ReviewField label="Date of Birth" value={formatDateUS(data.dateOfBirth) || "Not provided"} muted={!data.dateOfBirth} />
            <ReviewField label="Birth City" value={data.cityOfBirth || "Not provided"} muted={!data.cityOfBirth} />
            <ReviewField label="Birth Country" value={data.countryOfBirth || "Not provided"} muted={!data.countryOfBirth} />
            <ReviewField label="Citizenship" value={data.countryOfCitizenship || "Not provided"} muted={!data.countryOfCitizenship} />
          </div>
        </div>
        {/* Contact */}
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider mb-3">Contact</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewField label="Phone" value={data.phone} />
            <ReviewField label="Email" value={data.email || "Not provided"} muted={!data.email} />
            <ReviewField label="Employer" value={data.companyName || "Not provided"} muted={!data.companyName} />
          </div>
        </div>
        {/* Location */}
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider mb-3">Location</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewField label="Appointment City" value={cityLabel} />
            <ReviewField label="US Entry Date" value={formatDateUS(data.usEntryDate) || "Not provided"} muted={!data.usEntryDate} />
            <ReviewField
              label="U.S. Address"
              value={`${data.addressUsa || "Not provided"}${data.aptNumber ? `, ${data.aptNumber}` : ""}${data.zipCode ? ` ${data.zipCode}` : ""}`}
              muted={!data.addressUsa}
              fullWidth
            />
          </div>
        </div>
        {/* Home Country */}
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider mb-3">Home Country</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewField label="Country" value={data.homeCountry || "Not provided"} muted={!data.homeCountry} />
            <ReviewField label="City" value={data.homeCity || "Not provided"} muted={!data.homeCity} />
            <ReviewField label="Address" value={data.homeAddress || "Not provided"} muted={!data.homeAddress} fullWidth />
            <ReviewField label="Annual Earnings" value={data.amount ? `$${data.amount}` : "Not provided"} muted={!data.amount} />
          </div>
        </div>
        {/* Passport */}
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider mb-3">Passport</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <ReviewField label="Number" value={data.passportNumber || "Not provided"} muted={!data.passportNumber} />
            <ReviewField label="Expiry" value={formatDateUS(data.passportExpiry) || "Not provided"} muted={!data.passportExpiry} />
            <ReviewField label="Issuing Country" value={data.passportCountry || "Not provided"} muted={!data.passportCountry} />
          </div>
        </div>
        {/* Documents */}
        <div className="px-5 py-4">
          <h3 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider mb-3">Documents</h3>
          <div className="flex gap-4">
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

      {/* Signature Section */}
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
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-500/20 bg-white/[0.04] p-3">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-400 text-xs font-semibold">Signed</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sigPreview} alt="Your signature" className="w-full h-24 object-contain rounded-lg bg-white" />
            </div>
            <button
              type="button"
              onClick={onOpenSignaturePad}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 active:scale-[0.97] transition-all duration-200 min-h-[48px]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake Signature
            </button>
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={onOpenSignaturePad}
              className="w-full py-10 rounded-2xl border-2 border-dashed border-[#4F56E8]/30 bg-[#4F56E8]/5 hover:bg-[#4F56E8]/10 flex flex-col items-center gap-3 transition-all duration-200 active:scale-[0.98] group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#4F56E8]/20 flex items-center justify-center group-hover:bg-[#4F56E8]/30 transition-colors">
                <svg className="w-7 h-7 text-[#818CF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <div className="text-center">
                <span className="text-base font-semibold text-white/80 block">Tap to Sign</span>
                <span className="text-sm text-white/40 mt-1 block">Draw your signature with finger or stylus</span>
              </div>
            </button>
            {errors.signature && <p className="mt-2 text-xs text-red-400">{errors.signature}</p>}
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
