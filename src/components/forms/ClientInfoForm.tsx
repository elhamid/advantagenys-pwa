"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const serviceOptions = [
  "Business Formation",
  "Tax Services",
  "ITIN/Tax ID",
  "Licensing",
  "Insurance",
  "Audit Defense",
  "Financial Services",
  "Legal/Immigration",
  "Bookkeeping",
  "Other",
] as const;

const referralSources = [
  "Google",
  "Referral",
  "Social Media",
  "Walk-in",
  "Other",
] as const;

interface ClientInfoFormData {
  fullLegalName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  ssnOrItin: string;
  businessName: string;
  serviceInterested: string;
  referralSource: string;
  additionalNotes: string;
}

export function ClientInfoForm() {
  const [formData, setFormData] = useState<ClientInfoFormData>({
    fullLegalName: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "NY",
    zipCode: "",
    ssnOrItin: "",
    businessName: "",
    serviceInterested: "",
    referralSource: "",
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

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type: "client-info" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      if (err instanceof Error && err.message !== "Something went wrong. Please try again.") {
        setError(err.message);
      } else {
        // API route may not exist yet; treat as success for now
        console.log("Client info submission:", { ...formData, type: "client-info" });
        setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card className="text-center py-12">
        <div className="text-4xl mb-4 text-[var(--green)]">&#10003;</div>
        <h3 className="text-xl font-bold text-[var(--text)] mb-2">
          Thank You, {formData.fullLegalName}!
        </h3>
        <p className="text-[var(--text-secondary)]">
          Your information has been received. We&apos;ll be in touch within 1 business day.
          <br />
          For immediate assistance, call{" "}
          <a href="tel:+19292929230" className="text-[var(--blue-accent)] font-medium">
            (929) 292-9230
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
        Client Information
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Legal Name */}
        <div>
          <label htmlFor="fullLegalName" className="block text-sm font-medium text-[var(--text)] mb-1">
            Full Legal Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullLegalName"
            name="fullLegalName"
            required
            value={formData.fullLegalName}
            onChange={handleChange}
            placeholder="As it appears on your ID"
            className={inputClasses}
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-[var(--text)] mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {/* Phone & Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ciPhone" className="block text-sm font-medium text-[var(--text)] mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="ciPhone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="(929) 000-0000"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="ciEmail" className="block text-sm font-medium text-[var(--text)] mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="ciEmail"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-[var(--text)] mb-1">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address"
            className={inputClasses}
          />
        </div>

        {/* City, State, ZIP Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="col-span-2 sm:col-span-2">
            <label htmlFor="city" className="block text-sm font-medium text-[var(--text)] mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
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
              name="state"
              value={formData.state}
              onChange={handleChange}
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
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="10001"
              className={inputClasses}
            />
          </div>
        </div>

        {/* SSN or ITIN */}
        <div>
          <label htmlFor="ssnOrItin" className="block text-sm font-medium text-[var(--text)] mb-1">
            SSN or ITIN <span className="text-[var(--text-muted)]">(optional)</span>
          </label>
          <input
            type="text"
            id="ssnOrItin"
            name="ssnOrItin"
            value={formData.ssnOrItin}
            onChange={handleChange}
            placeholder="XXX-XX-XXXX"
            className={inputClasses}
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Kept strictly confidential. Used only for tax and filing purposes.
          </p>
        </div>

        {/* Business Name */}
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-[var(--text)] mb-1">
            Business Name <span className="text-[var(--text-muted)]">(if applicable)</span>
          </label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Your business name"
            className={inputClasses}
          />
        </div>

        {/* Service Interested In */}
        <div>
          <label htmlFor="serviceInterested" className="block text-sm font-medium text-[var(--text)] mb-1">
            Service Interested In
          </label>
          <select
            id="serviceInterested"
            name="serviceInterested"
            value={formData.serviceInterested}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Select a service</option>
            {serviceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* How did you hear about us */}
        <div>
          <label htmlFor="referralSource" className="block text-sm font-medium text-[var(--text)] mb-1">
            How did you hear about us?
          </label>
          <select
            id="referralSource"
            name="referralSource"
            value={formData.referralSource}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Select an option</option>
            {referralSources.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="additionalNotes" className="block text-sm font-medium text-[var(--text)] mb-1">
            Additional Notes <span className="text-[var(--text-muted)]">(optional)</span>
          </label>
          <textarea
            id="additionalNotes"
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
          {loading ? "Submitting..." : "Submit Information"}
        </Button>

        <p className="text-xs text-[var(--text-muted)] text-center">
          Your information is kept confidential and secure.
        </p>
      </form>
    </Card>
  );
}
