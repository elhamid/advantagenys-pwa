"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useUtmParams } from "@/hooks/useUtmParams";
import type { HomeImprovementLead } from "@/lib/leads/types";

const licenseTypes = [
  "Home Improvement Contractor",
  "General Contractor",
  "Plumber",
  "Electrician",
  "Other",
] as const;

interface HomeImprovementFormData {
  fullName: string;
  phone: string;
  email: string;
  businessName: string;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  licenseType: string;
  hasExistingLicense: string;
  licenseNumber: string;
  additionalNotes: string;
}

export function HomeImprovementForm() {
  const utm = useUtmParams();
  const [formData, setFormData] = useState<HomeImprovementFormData>({
    fullName: "",
    phone: "",
    email: "",
    businessName: "",
    businessAddress: "",
    city: "",
    state: "NY",
    zipCode: "",
    licenseType: "",
    hasExistingLicense: "",
    licenseNumber: "",
    additionalNotes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: HomeImprovementLead = {
      type: "home-improvement",
      source: "website-home-improvement",
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || undefined,
      businessName: formData.businessName || undefined,
      businessAddress: formData.businessAddress || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      zipCode: formData.zipCode || undefined,
      licenseType: formData.licenseType || undefined,
      hasExistingLicense: formData.hasExistingLicense || undefined,
      licenseNumber: formData.licenseNumber || undefined,
      additionalNotes: formData.additionalNotes || undefined,
      utm: Object.keys(utm).length > 0 ? utm : undefined,
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
          Your home improvement licensing application has been received. We&apos;ll review and contact you within 1 business day.
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

  return (
    <Card>
      <h2 className="text-xl font-bold text-[var(--text)] mb-6">
        Home Improvement Licensing Application
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="hiFullName" className="block text-sm font-medium text-[var(--text)] mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="hiFullName"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Your full name"
            className={inputClasses}
          />
        </div>

        {/* Phone & Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="hiPhone" className="block text-sm font-medium text-[var(--text)] mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="hiPhone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="(929) 000-0000"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="hiEmail" className="block text-sm font-medium text-[var(--text)] mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="hiEmail"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Business Name */}
        <div>
          <label htmlFor="hiBusinessName" className="block text-sm font-medium text-[var(--text)] mb-1">
            Business Name <span className="text-[var(--text-muted)]">(if applicable)</span>
          </label>
          <input
            type="text"
            id="hiBusinessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Your business name"
            className={inputClasses}
          />
        </div>

        {/* Business Address */}
        <div>
          <label htmlFor="hiBusinessAddress" className="block text-sm font-medium text-[var(--text)] mb-1">
            Business Address
          </label>
          <input
            type="text"
            id="hiBusinessAddress"
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleChange}
            placeholder="Street address"
            className={inputClasses}
          />
        </div>

        {/* City, State, ZIP Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="col-span-2 sm:col-span-2">
            <label htmlFor="hiCity" className="block text-sm font-medium text-[var(--text)] mb-1">
              City
            </label>
            <input
              type="text"
              id="hiCity"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="hiState" className="block text-sm font-medium text-[var(--text)] mb-1">
              State
            </label>
            <input
              type="text"
              id="hiState"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="NY"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="hiZipCode" className="block text-sm font-medium text-[var(--text)] mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              id="hiZipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="10001"
              className={inputClasses}
            />
          </div>
        </div>

        {/* License Type */}
        <div>
          <label htmlFor="hiLicenseType" className="block text-sm font-medium text-[var(--text)] mb-1">
            License Type <span className="text-red-500">*</span>
          </label>
          <select
            id="hiLicenseType"
            name="licenseType"
            required
            value={formData.licenseType}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Select license type</option>
            {licenseTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Existing License */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Do you have an existing license?
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasExistingLicense"
                value="yes"
                checked={formData.hasExistingLicense === "yes"}
                onChange={handleChange}
                className="w-4 h-4 accent-[var(--blue-accent)]"
              />
              <span className="text-sm text-[var(--text)]">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasExistingLicense"
                value="no"
                checked={formData.hasExistingLicense === "no"}
                onChange={handleChange}
                className="w-4 h-4 accent-[var(--blue-accent)]"
              />
              <span className="text-sm text-[var(--text)]">No</span>
            </label>
          </div>
        </div>

        {/* License Number (conditional) */}
        {formData.hasExistingLicense === "yes" && (
          <div>
            <label htmlFor="hiLicenseNumber" className="block text-sm font-medium text-[var(--text)] mb-1">
              License Number
            </label>
            <input
              type="text"
              id="hiLicenseNumber"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="Your existing license number"
              className={inputClasses}
            />
          </div>
        )}

        {/* Additional Notes */}
        <div>
          <label htmlFor="hiAdditionalNotes" className="block text-sm font-medium text-[var(--text)] mb-1">
            Additional Notes <span className="text-[var(--text-muted)]">(optional)</span>
          </label>
          <textarea
            id="hiAdditionalNotes"
            name="additionalNotes"
            rows={3}
            value={formData.additionalNotes}
            onChange={handleChange}
            placeholder="Anything else we should know..."
            className={inputClasses}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {/* Submit */}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit Application"}
        </Button>

        <p className="text-xs text-[var(--text-muted)] text-center">
          Your information is kept confidential and secure.
        </p>
      </form>
    </Card>
  );
}
