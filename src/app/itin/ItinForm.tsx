"use client";

import { useState, useRef, useCallback } from "react";

const CITIES = [
  { value: "new_york", label: "New York" },
  { value: "nashville", label: "Nashville" },
] as const;

interface ItinData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  addressUsa: string;
  addressHomeCountry: string;
  companyName: string;
  amount: string;
  hasPassport: boolean;
  passportNumber: string;
  passportExpiry: string;
  passportPhoto: File | null;
  comment: string;
}

const INITIAL: ItinData = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  city: "",
  addressUsa: "",
  addressHomeCountry: "",
  companyName: "Tropical Stars Inc.",
  amount: "",
  hasPassport: false,
  passportNumber: "",
  passportExpiry: "",
  passportPhoto: null,
  comment: "",
};

const STEPS = ["Personal Info", "Location & Work", "Passport & ID"] as const;

interface Props {
  onSuccess: () => void;
}

export function ItinForm({ onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ItinData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof ItinData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

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

  // ─── Validation ───
  function validateStep(s: number): boolean {
    const errs: Partial<Record<keyof ItinData, string>> = {};

    if (s === 0) {
      if (!data.firstName.trim()) errs.firstName = "First name is required";
      if (!data.lastName.trim()) errs.lastName = "Last name is required";
      if (!data.phone.trim() || data.phone.replace(/\D/g, "").length < 7)
        errs.phone = "Valid phone number is required";
    }

    if (s === 1) {
      if (!data.city) errs.city = "Please select appointment city";
    }

    // Step 2 (passport) has no required fields — passport is optional at intake

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  // ─── Submit ───
  async function handleSubmit() {
    if (!validateStep(step)) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = new FormData();
      payload.append("firstName", data.firstName.trim());
      payload.append("lastName", data.lastName.trim());
      payload.append("phone", data.phone.trim());
      payload.append("email", data.email.trim());
      payload.append("city", data.city);
      payload.append("addressUsa", data.addressUsa.trim());
      payload.append("addressHomeCountry", data.addressHomeCountry.trim());
      payload.append("companyName", data.companyName.trim());
      payload.append("amount", data.amount.trim());
      payload.append("hasPassport", String(data.hasPassport));
      payload.append("passportNumber", data.passportNumber.trim());
      payload.append("passportExpiry", data.passportExpiry);
      payload.append("comment", data.comment.trim());
      if (data.passportPhoto) {
        payload.append("passportPhoto", data.passportPhoto);
      }

      const res = await fetch("/api/itin-submit", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || `Server error (${res.status})`);
      }

      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isLast = step === STEPS.length - 1;

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-12 lg:px-24 pb-6 max-w-3xl mx-auto w-full">
      {/* Progress */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((label, i) => (
            <button
              key={label}
              onClick={() => {
                if (i < step) setStep(i);
              }}
              className={`
                text-xs sm:text-sm font-medium transition-colors duration-200
                ${i === step ? "text-[#818CF8]" : i < step ? "text-white/50 cursor-pointer hover:text-white/70" : "text-white/25"}
              `}
            >
              {label}
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

      {/* Form content */}
      <div className="flex-1 overflow-y-auto">
        {step === 0 && (
          <StepPersonal data={data} errors={errors} update={update} />
        )}
        {step === 1 && (
          <StepLocation data={data} errors={errors} update={update} />
        )}
        {step === 2 && (
          <StepPassport
            data={data}
            errors={errors}
            update={update}
            photoInputRef={photoInputRef}
          />
        )}
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          {submitError}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
        {step > 0 && (
          <button
            onClick={prevStep}
            className="
              px-6 py-3.5 rounded-xl text-sm font-semibold
              bg-white/5 text-white/60
              hover:bg-white/10 hover:text-white/80
              active:scale-[0.97] transition-all duration-200
            "
          >
            Back
          </button>
        )}

        <button
          onClick={isLast ? handleSubmit : nextStep}
          disabled={submitting}
          className={`
            flex-1 px-6 py-3.5 rounded-xl text-sm font-bold
            transition-all duration-200 active:scale-[0.97]
            ${submitting
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
            "Submit Application"
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
  );
}

/* ═══════════════════════════════════════════════
   Shared input components
   ═══════════════════════════════════════════════ */

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-white/60 mb-1.5">
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
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "email" | "text" | "decimal";
  autoComplete?: string;
}) {
  return (
    <>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className={`
          w-full px-4 py-3.5 rounded-xl text-base
          bg-white/[0.07] border
          text-white placeholder-white/25
          focus:outline-none focus:ring-2 focus:ring-[#4F56E8]/50 focus:border-[#4F56E8]/50
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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="
        w-full px-4 py-3.5 rounded-xl text-base resize-none
        bg-white/[0.07] border border-white/10
        text-white placeholder-white/25
        focus:outline-none focus:ring-2 focus:ring-[#4F56E8]/50 focus:border-[#4F56E8]/50
        transition-all duration-200
      "
    />
  );
}

/* ═══════════════════════════════════════════════
   Step 1 — Personal Info
   ═══════════════════════════════════════════════ */

interface StepProps {
  data: ItinData;
  errors: Partial<Record<keyof ItinData, string>>;
  update: <K extends keyof ItinData>(field: K, value: ItinData[K]) => void;
}

function StepPersonal({ data, errors, update }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Personal Information</h2>
        <p className="text-white/40 text-sm">Basic contact details for your ITIN application.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>First Name</Label>
          <Input
            value={data.firstName}
            onChange={(v) => update("firstName", v)}
            error={errors.firstName}
            placeholder="Juan"
            autoComplete="given-name"
          />
        </div>
        <div>
          <Label required>Last Name</Label>
          <Input
            value={data.lastName}
            onChange={(v) => update("lastName", v)}
            error={errors.lastName}
            placeholder="Garcia"
            autoComplete="family-name"
          />
        </div>
      </div>

      <div>
        <Label required>Phone Number</Label>
        <Input
          value={data.phone}
          onChange={(v) => update("phone", v)}
          error={errors.phone}
          placeholder="(929) 555-0123"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
      </div>

      <div>
        <Label>Email</Label>
        <Input
          value={data.email}
          onChange={(v) => update("email", v)}
          error={errors.email}
          placeholder="email@example.com"
          type="email"
          inputMode="email"
          autoComplete="email"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Step 2 — Location & Work
   ═══════════════════════════════════════════════ */

function StepLocation({ data, errors, update }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Location & Employment</h2>
        <p className="text-white/40 text-sm">Where you'll attend and your work details.</p>
      </div>

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
                py-4 px-4 rounded-xl text-base font-semibold text-center
                transition-all duration-200 active:scale-[0.97]
                ${
                  data.city === city.value
                    ? "bg-[#4F56E8] text-white border-2 border-[#818CF8] shadow-[0_0_20px_rgba(79,86,232,0.3)]"
                    : "bg-white/[0.07] text-white/60 border-2 border-transparent hover:bg-white/10 hover:text-white/80"
                }
              `}
            >
              {city.label}
            </button>
          ))}
        </div>
        {errors.city && <p className="mt-1 text-xs text-red-400">{errors.city}</p>}
      </div>

      <div>
        <Label>US Address</Label>
        <TextArea
          value={data.addressUsa}
          onChange={(v) => update("addressUsa", v)}
          placeholder="Street, City, State, ZIP"
          rows={2}
        />
      </div>

      <div>
        <Label>Home Country Address</Label>
        <TextArea
          value={data.addressHomeCountry}
          onChange={(v) => update("addressHomeCountry", v)}
          placeholder="Full address in your home country"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Company / Employer</Label>
          <Input
            value={data.companyName}
            onChange={(v) => update("companyName", v)}
            placeholder="Company name"
          />
        </div>
        <div>
          <Label>Annual Earnings ($)</Label>
          <Input
            value={data.amount}
            onChange={(v) => update("amount", v)}
            placeholder="0.00"
            inputMode="decimal"
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Step 3 — Passport & ID
   ═══════════════════════════════════════════════ */

function StepPassport({
  data,
  errors,
  update,
  photoInputRef,
}: StepProps & { photoInputRef: React.RefObject<HTMLInputElement | null> }) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    update("passportPhoto", file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Passport & Identification</h2>
        <p className="text-white/40 text-sm">
          If you have your passport, our agent will certify it on-site.
        </p>
      </div>

      {/* Has passport toggle */}
      <button
        type="button"
        onClick={() => update("hasPassport", !data.hasPassport)}
        className={`
          w-full flex items-center justify-between px-5 py-4 rounded-xl
          transition-all duration-200
          ${
            data.hasPassport
              ? "bg-[#4F56E8]/20 border-2 border-[#4F56E8]/40"
              : "bg-white/[0.07] border-2 border-transparent"
          }
        `}
      >
        <span className="text-base font-medium text-white/80">I have my passport with me</span>
        <div
          className={`
            w-12 h-7 rounded-full relative transition-colors duration-200
            ${data.hasPassport ? "bg-[#4F56E8]" : "bg-white/20"}
          `}
        >
          <div
            className={`
              absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md
              transition-transform duration-200
              ${data.hasPassport ? "translate-x-[22px]" : "translate-x-0.5"}
            `}
          />
        </div>
      </button>

      {data.hasPassport && (
        <div className="space-y-4 animate-[fadeSlide_0.3s_ease-out]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Passport Number</Label>
              <Input
                value={data.passportNumber}
                onChange={(v) => update("passportNumber", v)}
                error={errors.passportNumber}
                placeholder="AB1234567"
              />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={data.passportExpiry}
                onChange={(v) => update("passportExpiry", v)}
              />
            </div>
          </div>

          {/* Photo capture */}
          <div>
            <Label>Passport Photo</Label>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
              className="hidden"
            />

            {photoPreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Passport preview"
                  className="w-full h-48 object-cover rounded-xl border border-white/10"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    update("passportPhoto", null);
                    if (photoInputRef.current) photoInputRef.current.value = "";
                  }}
                  className="
                    absolute top-2 right-2 p-2 rounded-lg
                    bg-black/60 text-white/80 hover:text-white
                    backdrop-blur-sm transition-colors
                  "
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="
                  w-full py-8 rounded-xl border-2 border-dashed border-white/15
                  bg-white/[0.03] hover:bg-white/[0.06]
                  flex flex-col items-center gap-2
                  transition-all duration-200 active:scale-[0.98]
                "
              >
                <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                <span className="text-sm text-white/40 font-medium">
                  Tap to take photo or upload
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Comments */}
      <div>
        <Label>Additional Notes</Label>
        <TextArea
          value={data.comment}
          onChange={(v) => update("comment", v)}
          placeholder="Any special circumstances, questions, or notes..."
          rows={3}
        />
      </div>
    </div>
  );
}
