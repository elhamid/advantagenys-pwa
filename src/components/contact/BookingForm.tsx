"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useUtmParams } from "@/hooks/useUtmParams";
import type { BookingLead } from "@/lib/leads/types";

const serviceTypes = [
  "Business Formation",
  "Tax Services",
  "ITIN/Tax ID",
  "Licensing",
  "Insurance",
  "Audit Defense",
  "Financial Services",
  "Legal/Immigration",
  "Other",
] as const;

const timeSlots = [
  { value: "morning", label: "Morning (9 AM - 12 PM)" },
  { value: "afternoon", label: "Afternoon (12 PM - 3 PM)" },
  { value: "evening", label: "Evening (3 PM - 6 PM)" },
] as const;

interface BookingFormData {
  fullName: string;
  phone: string;
  email: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  description: string;
}

export function BookingForm() {
  const utm = useUtmParams();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: "",
    phone: "",
    email: "",
    serviceType: "",
    preferredDate: "",
    preferredTime: "",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: BookingLead & { turnstileToken?: string } = {
      type: "booking",
      source: "website-booking",
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || undefined,
      serviceType: formData.serviceType || undefined,
      preferredDate: formData.preferredDate || undefined,
      preferredTime: formData.preferredTime || undefined,
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
          Thank You, {formData.fullName}!
        </h3>
        <p className="text-[var(--text-secondary)]">
          We&apos;ll confirm your appointment within 24 hours.
          <br />
          For immediate assistance, call{" "}
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

  // Set min date to today
  const today = new Date().toISOString().split("T")[0];

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
      <form onSubmit={handleSubmit} className="space-y-5">
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

        {/* Email */}
        <div>
          <label htmlFor="bookingEmail" className="block text-sm font-medium text-[var(--text)] mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="bookingEmail"
            required
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
            onChange={(e) => setFormData((prev) => ({ ...prev, serviceType: e.target.value }))}
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

        {/* Date & Time Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Preferred Date */}
          <div>
            <label htmlFor="preferredDate" className="block text-sm font-medium text-[var(--text)] mb-1">
              Preferred Date
            </label>
            <input
              type="date"
              id="preferredDate"
              min={today}
              value={formData.preferredDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, preferredDate: e.target.value }))}
              className={inputClasses}
            />
          </div>

          {/* Preferred Time */}
          <div>
            <label htmlFor="preferredTime" className="block text-sm font-medium text-[var(--text)] mb-1">
              Preferred Time
            </label>
            <select
              id="preferredTime"
              value={formData.preferredTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, preferredTime: e.target.value }))}
              className={inputClasses}
            >
              <option value="">Select a time</option>
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
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
          We&apos;ll confirm your appointment within 24 hours.
        </p>
      </form>
    </Card>
  );
}
