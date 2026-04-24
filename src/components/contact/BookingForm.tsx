"use client";

import { useEffect, useRef, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useUtmParams } from "@/hooks/useUtmParams";
import type { BookingLead } from "@/lib/leads/types";
import { bookingSubmit, formStart } from "@/lib/analytics/events";

const serviceTypes = [
  "Tax",
  "ITIN",
  "Formation",
  "Insurance",
  "Consulting",
  "Other",
] as const;

const PREFERRED_WINDOWS = [
  "Mornings",
  "Afternoons",
  "Evenings",
  "Weekends",
] as const;

interface BookingFormData {
  fullName: string;
  phone: string;
  email: string;
  serviceType: string;
  preferredWindow: string[];
  description: string;
}

export function BookingForm({
  defaultService,
  onServiceChange,
}: {
  defaultService?: string;
  onServiceChange?: (service: string) => void;
}) {
  const utm = useUtmParams();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: "",
    phone: "",
    email: "",
    serviceType: defaultService ?? "",
    preferredWindow: [],
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const startedRef = useRef(false);

  // Sync incoming defaultService changes into formData (two-way binding with parent pill picker)
  useEffect(() => {
    if (defaultService !== undefined) {
      setFormData((prev) => ({ ...prev, serviceType: defaultService }));
    }
  }, [defaultService]);

  function handleFirstFocus() {
    if (startedRef.current) return;
    startedRef.current = true;
    formStart("booking");
  }

  function togglePreferredWindow(window: string) {
    setFormData((prev) => {
      const exists = prev.preferredWindow.includes(window);
      return {
        ...prev,
        preferredWindow: exists
          ? prev.preferredWindow.filter((w) => w !== window)
          : [...prev.preferredWindow, window],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: BookingLead & { turnstileToken?: string } = {
      type: "booking",
      source: "advantagenys.com_book_appointment",
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || undefined,
      serviceType: formData.serviceType || undefined,
      preferredWindow: formData.preferredWindow.length > 0 ? formData.preferredWindow : undefined,
      wantsAppointment: true,
      description: formData.description || undefined,
      utm: Object.keys(utm).length > 0 ? utm : undefined,
      turnstileToken: turnstileToken || undefined,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      bookingSubmit();
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card className="text-center py-12">
        <div className="text-4xl mb-4 text-[var(--green)]">&#10003;</div>
        <h3 className="text-xl font-bold text-[var(--text)] mb-2">
          Thanks, {formData.fullName}!
        </h3>
        <p className="text-[var(--text-secondary)]">
          Jay or Kedar will reach out within 24 hours to confirm your time.
          <br />
          For immediate help, call{" "}
          <a href="tel:+19299331396" className="text-[var(--blue-accent)] font-medium">
            (929) 933-1396
          </a>
          .
        </p>
      </Card>
    );
  }

  const inputClasses =
    "w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-accent)] focus:border-transparent transition-all";

  const missingTurnstileInProd =
    !turnstileSiteKey &&
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  return (
    <Card>
      <h2 className="text-xl font-bold text-[var(--text)] mb-6">
        Book an Appointment
      </h2>
      <form onSubmit={handleSubmit} onFocus={handleFirstFocus} className="space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="bookingName" className="block text-sm font-medium text-[var(--text)] mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="bookingName"
            required
            value={formData.fullName}
            onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
            placeholder="Your full name"
            className={inputClasses}
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="bookingPhone" className="block text-sm font-medium text-[var(--text)] mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="bookingPhone"
            required
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="(929) 000-0000"
            className={inputClasses}
          />
        </div>

        {/* Email — optional */}
        <div>
          <label htmlFor="bookingEmail" className="block text-sm font-medium text-[var(--text)] mb-1">
            Email <span className="text-[var(--text-muted)]">(optional)</span>
          </label>
          <input
            type="email"
            id="bookingEmail"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>

        {/* Service Type */}
        <div>
          <label htmlFor="serviceType" className="block text-sm font-medium text-[var(--text)] mb-1">
            Service Type <span className="text-red-500">*</span>
          </label>
          <select
            id="serviceType"
            required
            value={formData.serviceType}
            onChange={(e) => {
              const next = e.target.value;
              setFormData((prev) => ({ ...prev, serviceType: next }));
              onServiceChange?.(next);
            }}
            className={inputClasses}
          >
            <option value="">Select a service</option>
            {serviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Preferred Window chips */}
        <div>
          <p className="block text-sm font-medium text-[var(--text)] mb-2">
            Preferred Time <span className="text-[var(--text-muted)]">(select all that apply)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {PREFERRED_WINDOWS.map((window) => {
              const active = formData.preferredWindow.includes(window);
              return (
                <button
                  key={window}
                  type="button"
                  onClick={() => togglePreferredWindow(window)}
                  aria-pressed={active}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    active
                      ? "border-[var(--blue-accent)] bg-[var(--blue-accent)] text-white"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--blue-accent)] hover:text-[var(--blue-accent)]"
                  }`}
                >
                  {window}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="bookingDescription" className="block text-sm font-medium text-[var(--text)] mb-1">
            Brief Description <span className="text-[var(--text-muted)]">(optional)</span>
          </label>
          <textarea
            id="bookingDescription"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Tell us what you'd like to discuss..."
            className={inputClasses}
          />
        </div>

        {/* Turnstile — render only when site key is configured */}
        {turnstileSiteKey && (
          <Turnstile
            siteKey={turnstileSiteKey}
            onSuccess={(token) => setTurnstileToken(token)}
            options={{ size: "invisible" }}
          />
        )}

        {/* Missing-config warning */}
        {missingTurnstileInProd && (
          <p className="text-sm text-red-500 text-center">
            Verification service is not configured. Please call{" "}
            <a href="tel:+19299331396" className="underline font-medium">
              (929) 933-1396
            </a>{" "}
            to reach us directly.
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading || missingTurnstileInProd}
        >
          {loading ? "Submitting..." : "Book Appointment"}
        </Button>

        <p className="text-xs text-[var(--text-muted)] text-center">
          Jay or Kedar will reach out within 24 hours to confirm your time.
        </p>
      </form>
    </Card>
  );
}
