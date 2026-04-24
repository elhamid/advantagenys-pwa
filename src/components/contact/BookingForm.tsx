"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { bookingSubmit } from "@/lib/analytics/events";

const serviceTypes = [
  "Tax",
  "ITIN",
  "Formation",
  "Insurance",
  "Consulting",
  "Other",
] as const;

const WINDOW_CHIPS = ["Mornings", "Afternoons", "Evenings", "Weekends"] as const;
type WindowChip = (typeof WINDOW_CHIPS)[number];

interface BookingFormData {
  fullName: string;
  phone: string;
  email: string;
  serviceType: string;
  preferredWindow: WindowChip[];
  description: string;
}

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function BookingForm({ defaultService }: { defaultService?: string } = {}) {
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

  // Fail-closed: block submit if the Turnstile key is missing in a non-localhost origin
  const missingTurnstileInProd =
    !turnstileSiteKey &&
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  function toggleWindow(chip: WindowChip) {
    setFormData((prev) => ({
      ...prev,
      preferredWindow: prev.preferredWindow.includes(chip)
        ? prev.preferredWindow.filter((w) => w !== chip)
        : [...prev.preferredWindow, chip],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          type: "booking",
          source: "advantagenys.com_book_appointment",
          wantsAppointment: true,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      bookingSubmit();
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      // DO NOT setSubmitted(true) here.
      // DO NOT fire bookingSubmit() here.
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card className="text-center py-12">
        <div className="text-4xl mb-4 text-[var(--green)]">&#10003;</div>
        <h3 className="text-xl font-bold text-[var(--text)] mb-2">
          Thanks, {formData.fullName} —
        </h3>
        <p className="text-[var(--text-secondary)]">
          Jay or Kedar will reach out within 24 hours to confirm your time.
        </p>
        <p className="text-[var(--text-secondary)] mt-3">
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

        {/* Email — optional */}
        <div>
          <label htmlFor="bookingEmail" className="block text-sm font-medium text-[var(--text)] mb-1">
            Email{" "}
            <span className="text-[var(--text-muted)] font-normal">(optional)</span>
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

        {/* Preferred Window — optional multi-select chips */}
        <div>
          <p className="block text-sm font-medium text-[var(--text)] mb-2">
            When works for you?{" "}
            <span className="text-[var(--text-muted)] font-normal">(optional)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {WINDOW_CHIPS.map((chip) => {
              const selected = formData.preferredWindow.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleWindow(chip)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                    selected
                      ? "border-[var(--blue-accent)] bg-[var(--blue-accent)] text-white"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--blue-accent)] hover:text-[var(--blue-accent)]"
                  }`}
                  aria-pressed={selected}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description — optional */}
        <div>
          <label htmlFor="bookingDescription" className="block text-sm font-medium text-[var(--text)] mb-1">
            Brief Description <span className="text-[var(--text-muted)] font-normal">(optional)</span>
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

        {/* Turnstile — rendered when a site key is available.
            In prod without a key, the fail-closed warning below blocks submission instead. */}
        {turnstileSiteKey && (
          <Turnstile
            siteKey={turnstileSiteKey}
            onSuccess={(token) => setTurnstileToken(token)}
            options={{ size: "invisible" }}
          />
        )}

        {/* Fail-closed warning when Turnstile key is missing in prod */}
        {missingTurnstileInProd && (
          <p className="text-sm text-amber-600 text-center">
            Online booking is temporarily unavailable. Please call us at{" "}
            <a href="tel:+19299331396" className="font-medium underline">
              (929) 933-1396
            </a>
            .
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
