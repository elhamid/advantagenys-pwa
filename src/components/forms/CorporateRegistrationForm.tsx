"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useUtmParams } from "@/hooks/useUtmParams";
import type { CorporateRegistrationLead } from "@/lib/leads/types";

const businessTypes = [
  "LLC",
  "S-Corp",
  "C-Corp",
  "Non-Profit 501(c)(3)",
  "Sole Proprietorship",
  "Partnership",
] as const;

const yesNoOptions = ["Yes", "No", "Not Sure"] as const;

interface CorporateRegistrationData {
  fullName: string;
  phone: string;
  email: string;
  desiredBusinessName: string;
  businessType: string;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  natureOfBusiness: string;
  numberOfMembers: string;
  needEIN: string;
  needSalesTax: string;
  needPayroll: string;
  additionalNotes: string;
}

export function CorporateRegistrationForm() {
  const utm = useUtmParams();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [formData, setFormData] = useState<CorporateRegistrationData>({
    fullName: "",
    phone: "",
    email: "",
    desiredBusinessName: "",
    businessType: "",
    businessAddress: "",
    city: "",
    state: "NY",
    zipCode: "",
    natureOfBusiness: "",
    numberOfMembers: "",
    needEIN: "",
    needSalesTax: "",
    needPayroll: "",
    additionalNotes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: CorporateRegistrationLead & { turnstileToken?: string } = {
      type: "corporate-registration",
      source: "website-corporate-registration",
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || undefined,
      desiredBusinessName: formData.desiredBusinessName || undefined,
      businessType: formData.businessType || undefined,
      businessAddress: formData.businessAddress || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      zipCode: formData.zipCode || undefined,
      natureOfBusiness: formData.natureOfBusiness || undefined,
      numberOfMembers: formData.numberOfMembers || undefined,
      needEIN: formData.needEIN || undefined,
      needSalesTax: formData.needSalesTax || undefined,
      needPayroll: formData.needPayroll || undefined,
      additionalNotes: formData.additionalNotes || undefined,
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
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
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
          Your corporate registration request has been received.
          <br />
          We&apos;ll contact you within 1 business day. For immediate assistance, call{" "}
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

  // If Turnstile site key is missing in production, disable the form and
  // surface a clear error. Prevents silent lead loss from misconfigured envs.
  const missingTurnstileInProd =
    !turnstileSiteKey &&
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  function update(field: keyof CorporateRegistrationData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-[var(--text)] mb-6">
        Corporate Registration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Owner Name */}
        <div>
          <label htmlFor="corpFullName" className="block text-sm font-medium text-[var(--text)] mb-1">
            Business Owner Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="corpFullName"
            required
            value={formData.fullName}
            onChange={update("fullName")}
            placeholder="Your full name"
            className={inputClasses}
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="corpPhone" className="block text-sm font-medium text-[var(--text)] mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="corpPhone"
            required
            value={formData.phone}
            onChange={update("phone")}
            placeholder="(929) 000-0000"
            className={inputClasses}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="corpEmail" className="block text-sm font-medium text-[var(--text)] mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="corpEmail"
            required
            value={formData.email}
            onChange={update("email")}
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>

        {/* Desired Business Name */}
        <div>
          <label htmlFor="desiredBusinessName" className="block text-sm font-medium text-[var(--text)] mb-1">
            Desired Business Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="desiredBusinessName"
            required
            value={formData.desiredBusinessName}
            onChange={update("desiredBusinessName")}
            placeholder="Your desired business name"
            className={inputClasses}
          />
        </div>

        {/* Business Type */}
        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-[var(--text)] mb-1">
            Business Type
          </label>
          <select
            id="businessType"
            value={formData.businessType}
            onChange={update("businessType")}
            className={inputClasses}
          >
            <option value="">Select business type</option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="businessAddress" className="block text-sm font-medium text-[var(--text)] mb-1">
            Business Address
          </label>
          <input
            type="text"
            id="businessAddress"
            value={formData.businessAddress}
            onChange={update("businessAddress")}
            placeholder="Street address"
            className={inputClasses}
          />
        </div>

        {/* City / State / ZIP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-[var(--text)] mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={update("city")}
              placeholder="City"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-[var(--text)] mb-1">
              State
            </label>
            <input
              type="text"
              id="state"
              value={formData.state}
              onChange={update("state")}
              placeholder="NY"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-[var(--text)] mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              id="zipCode"
              value={formData.zipCode}
              onChange={update("zipCode")}
              placeholder="10001"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Nature of Business */}
        <div>
          <label htmlFor="natureOfBusiness" className="block text-sm font-medium text-[var(--text)] mb-1">
            Nature of Business / Industry
          </label>
          <input
            type="text"
            id="natureOfBusiness"
            value={formData.natureOfBusiness}
            onChange={update("natureOfBusiness")}
            placeholder="e.g. Restaurant, Construction, Consulting"
            className={inputClasses}
          />
        </div>

        {/* Number of Partners/Members */}
        <div>
          <label htmlFor="numberOfMembers" className="block text-sm font-medium text-[var(--text)] mb-1">
            Number of Partners/Members
          </label>
          <input
            type="number"
            id="numberOfMembers"
            min="1"
            value={formData.numberOfMembers}
            onChange={update("numberOfMembers")}
            placeholder="1"
            className={inputClasses}
          />
        </div>

        {/* EIN */}
        <div>
          <p className="block text-sm font-medium text-[var(--text)] mb-2">
            Do you need an EIN?
          </p>
          <div className="flex gap-6">
            {yesNoOptions.map((option) => (
              <label key={`ein-${option}`} className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
                <input
                  type="radio"
                  name="needEIN"
                  value={option}
                  checked={formData.needEIN === option}
                  onChange={update("needEIN")}
                  className="text-[var(--blue-accent)] focus:ring-[var(--blue-accent)]"
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Sales Tax Registration */}
        <div>
          <p className="block text-sm font-medium text-[var(--text)] mb-2">
            Do you need Sales Tax Registration?
          </p>
          <div className="flex gap-6">
            {yesNoOptions.map((option) => (
              <label key={`sales-${option}`} className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
                <input
                  type="radio"
                  name="needSalesTax"
                  value={option}
                  checked={formData.needSalesTax === option}
                  onChange={update("needSalesTax")}
                  className="text-[var(--blue-accent)] focus:ring-[var(--blue-accent)]"
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Payroll Registration */}
        <div>
          <p className="block text-sm font-medium text-[var(--text)] mb-2">
            Do you need Payroll Registration?
          </p>
          <div className="flex gap-6">
            {yesNoOptions.map((option) => (
              <label key={`payroll-${option}`} className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
                <input
                  type="radio"
                  name="needPayroll"
                  value={option}
                  checked={formData.needPayroll === option}
                  onChange={update("needPayroll")}
                  className="text-[var(--blue-accent)] focus:ring-[var(--blue-accent)]"
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="additionalNotes" className="block text-sm font-medium text-[var(--text)] mb-1">
            Additional Notes <span className="text-[var(--text-muted)]">(optional)</span>
          </label>
          <textarea
            id="additionalNotes"
            rows={3}
            value={formData.additionalNotes}
            onChange={update("additionalNotes")}
            placeholder="Any additional information or questions..."
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

        {/* Missing-config warning — blocks submit + surfaces the problem */}
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
          disabled={submitting || missingTurnstileInProd}
        >
          {submitting ? "Submitting..." : "Submit Registration"}
        </Button>

        <p className="text-xs text-[var(--text-muted)] text-center">
          We&apos;ll contact you within 1 business day to confirm your registration.
        </p>
      </form>
    </Card>
  );
}
