"use client";

import { useState } from "react";

interface BookingContactFormProps {
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
  isInertMode: boolean;
  /** Label for the selected service (shown in inert mode copy) */
  serviceLabel?: string;
}

const inputClasses =
  "w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-accent)] focus:border-transparent transition-all";

export function BookingContactForm({
  onSubmit,
  loading,
  error,
  isInertMode,
  serviceLabel,
}: BookingContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function touch(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  const nameError = touched.name && !name.trim() ? "Name is required." : null;
  const emailError =
    touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? "Enter a valid email address."
      : null;
  const phoneError =
    touched.phone && phone.trim().length < 10
      ? "Enter a valid phone number."
      : null;

  const isValid =
    name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    phone.trim().length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Touch all fields to surface errors
    setTouched({ name: true, email: true, phone: true });
    if (!isValid) return;
    await onSubmit({ name, email, phone, notes });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {isInertMode && (
        <div className="rounded-[var(--radius)] bg-[var(--teal-bg)] border border-[var(--teal)]/20 px-4 py-3">
          <p className="text-sm text-[var(--teal)] font-medium">
            {serviceLabel
              ? `${serviceLabel} consult request`
              : "Consult request"}{" "}
            — we will reach out within 24 hours to confirm your time.
          </p>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="bc-name" className="block text-sm font-medium text-[var(--text)] mb-1.5">
          Full Name <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="bc-name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => touch("name")}
          placeholder="Your full name"
          aria-invalid={!!nameError}
          aria-describedby={nameError ? "bc-name-error" : undefined}
          className={`${inputClasses} ${nameError ? "border-red-400 focus:ring-red-400" : ""}`}
        />
        {nameError && (
          <p id="bc-name-error" className="mt-1 text-xs text-red-500">
            {nameError}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="bc-email" className="block text-sm font-medium text-[var(--text)] mb-1.5">
          Email <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="bc-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => touch("email")}
          placeholder="you@example.com"
          aria-invalid={!!emailError}
          aria-describedby={emailError ? "bc-email-error" : undefined}
          className={`${inputClasses} ${emailError ? "border-red-400 focus:ring-red-400" : ""}`}
        />
        {emailError && (
          <p id="bc-email-error" className="mt-1 text-xs text-red-500">
            {emailError}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="bc-phone" className="block text-sm font-medium text-[var(--text)] mb-1.5">
          Phone <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="bc-phone"
          type="tel"
          required
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => touch("phone")}
          placeholder="(929) 000-0000"
          aria-invalid={!!phoneError}
          aria-describedby={phoneError ? "bc-phone-error" : undefined}
          className={`${inputClasses} ${phoneError ? "border-red-400 focus:ring-red-400" : ""}`}
        />
        {phoneError && (
          <p id="bc-phone-error" className="mt-1 text-xs text-red-500">
            {phoneError}
          </p>
        )}
      </div>

      {/* Notes — optional */}
      <div>
        <label htmlFor="bc-notes" className="block text-sm font-medium text-[var(--text)] mb-1.5">
          Notes{" "}
          <span className="text-[var(--text-muted)] font-normal">(optional)</span>
        </label>
        <textarea
          id="bc-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything you would like us to know before the call..."
          className={inputClasses}
        />
      </div>

      {/* API error */}
      {error && (
        <p className="rounded-[var(--radius)] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--blue-accent)] px-6 py-3.5 text-sm font-bold text-white shadow-[var(--shadow-md)] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            Confirming...
          </>
        ) : isInertMode ? (
          "Request Appointment"
        ) : (
          "Confirm Booking"
        )}
      </button>

      <p className="text-xs text-[var(--text-muted)] text-center">
        Free 30-minute consult. No obligation. All information is confidential.
      </p>
    </form>
  );
}
