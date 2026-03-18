"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const businessTypes = [
  "LLC",
  "S-Corp",
  "C-Corp",
  "Sole Proprietorship",
  "Partnership",
  "Non-Profit",
] as const;

const revenueRanges = [
  "Under $100K",
  "$100K-$250K",
  "$250K-$500K",
  "$500K-$1M",
  "Over $1M",
] as const;

const insuranceTypes = [
  "General Liability",
  "Workers' Compensation",
  "Disability",
  "Commercial Auto",
  "Professional Liability",
  "Property Insurance",
] as const;

interface InsuranceFormData {
  fullName: string;
  phone: string;
  email: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  industryTrade: string;
  numberOfEmployees: string;
  annualRevenue: string;
  insuranceTypesNeeded: string[];
  currentProvider: string;
  policyExpiration: string;
  notes: string;
}

export function InsuranceForm() {
  const [formData, setFormData] = useState<InsuranceFormData>({
    fullName: "",
    phone: "",
    email: "",
    businessName: "",
    businessType: "",
    businessAddress: "",
    city: "",
    state: "NY",
    zipCode: "",
    industryTrade: "",
    numberOfEmployees: "",
    annualRevenue: "",
    insuranceTypesNeeded: [],
    currentProvider: "",
    policyExpiration: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleInsuranceTypeToggle(type: string) {
    setFormData((prev) => ({
      ...prev,
      insuranceTypesNeeded: prev.insuranceTypesNeeded.includes(type)
        ? prev.insuranceTypesNeeded.filter((t) => t !== type)
        : [...prev.insuranceTypesNeeded, type],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type: "insurance" }),
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
          We&apos;ll review your insurance needs and contact you within 1 business day.
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
        Insurance Intake Form
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="insuranceFullName" className="block text-sm font-medium text-[var(--text)] mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="insuranceFullName"
            required
            value={formData.fullName}
            onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
            placeholder="Your full name"
            className={inputClasses}
          />
        </div>

        {/* Phone & Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="insurancePhone" className="block text-sm font-medium text-[var(--text)] mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="insurancePhone"
              required
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="(929) 000-0000"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="insuranceEmail" className="block text-sm font-medium text-[var(--text)] mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="insuranceEmail"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="you@example.com"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Business Name & Type Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="insuranceBusinessName" className="block text-sm font-medium text-[var(--text)] mb-1">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="insuranceBusinessName"
              required
              value={formData.businessName}
              onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
              placeholder="Your business name"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="insuranceBusinessType" className="block text-sm font-medium text-[var(--text)] mb-1">
              Business Type
            </label>
            <select
              id="insuranceBusinessType"
              value={formData.businessType}
              onChange={(e) => setFormData((prev) => ({ ...prev, businessType: e.target.value }))}
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
        </div>

        {/* Business Address */}
        <div>
          <label htmlFor="insuranceAddress" className="block text-sm font-medium text-[var(--text)] mb-1">
            Business Address
          </label>
          <input
            type="text"
            id="insuranceAddress"
            value={formData.businessAddress}
            onChange={(e) => setFormData((prev) => ({ ...prev, businessAddress: e.target.value }))}
            placeholder="Street address"
            className={inputClasses}
          />
        </div>

        {/* City, State, ZIP Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="col-span-2 sm:col-span-2">
            <label htmlFor="insuranceCity" className="block text-sm font-medium text-[var(--text)] mb-1">
              City
            </label>
            <input
              type="text"
              id="insuranceCity"
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="City"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="insuranceState" className="block text-sm font-medium text-[var(--text)] mb-1">
              State
            </label>
            <input
              type="text"
              id="insuranceState"
              value={formData.state}
              onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
              placeholder="NY"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="insuranceZip" className="block text-sm font-medium text-[var(--text)] mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              id="insuranceZip"
              value={formData.zipCode}
              onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
              placeholder="10001"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Industry & Employees Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="insuranceIndustry" className="block text-sm font-medium text-[var(--text)] mb-1">
              Industry / Trade
            </label>
            <input
              type="text"
              id="insuranceIndustry"
              value={formData.industryTrade}
              onChange={(e) => setFormData((prev) => ({ ...prev, industryTrade: e.target.value }))}
              placeholder='e.g., "General Contractor", "Restaurant"'
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="insuranceEmployees" className="block text-sm font-medium text-[var(--text)] mb-1">
              Number of Employees
            </label>
            <input
              type="number"
              id="insuranceEmployees"
              min="0"
              value={formData.numberOfEmployees}
              onChange={(e) => setFormData((prev) => ({ ...prev, numberOfEmployees: e.target.value }))}
              placeholder="0"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Annual Revenue */}
        <div>
          <label htmlFor="insuranceRevenue" className="block text-sm font-medium text-[var(--text)] mb-1">
            Annual Revenue
          </label>
          <select
            id="insuranceRevenue"
            value={formData.annualRevenue}
            onChange={(e) => setFormData((prev) => ({ ...prev, annualRevenue: e.target.value }))}
            className={inputClasses}
          >
            <option value="">Select revenue range</option>
            {revenueRanges.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>

        {/* Insurance Types Needed */}
        <div>
          <p className="block text-sm font-medium text-[var(--text)] mb-2">
            Insurance Types Needed
          </p>
          <div className="grid grid-cols-2 gap-2">
            {insuranceTypes.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]"
              >
                <input
                  type="checkbox"
                  checked={formData.insuranceTypesNeeded.includes(type)}
                  onChange={() => handleInsuranceTypeToggle(type)}
                  className="rounded border-[var(--border)] text-[var(--blue-accent)] focus:ring-[var(--blue-accent)]"
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Current Provider & Policy Expiration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="insuranceProvider" className="block text-sm font-medium text-[var(--text)] mb-1">
              Current Insurance Provider <span className="text-[var(--text-muted)]">(optional)</span>
            </label>
            <input
              type="text"
              id="insuranceProvider"
              value={formData.currentProvider}
              onChange={(e) => setFormData((prev) => ({ ...prev, currentProvider: e.target.value }))}
              placeholder="Current provider name"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="insurancePolicyExpiry" className="block text-sm font-medium text-[var(--text)] mb-1">
              Policy Expiration Date <span className="text-[var(--text-muted)]">(optional)</span>
            </label>
            <input
              type="date"
              id="insurancePolicyExpiry"
              value={formData.policyExpiration}
              onChange={(e) => setFormData((prev) => ({ ...prev, policyExpiration: e.target.value }))}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="insuranceNotes" className="block text-sm font-medium text-[var(--text)] mb-1">
            Additional Notes <span className="text-[var(--text-muted)]">(optional)</span>
          </label>
          <textarea
            id="insuranceNotes"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional details about your insurance needs..."
            className={inputClasses}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {/* Submit */}
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Insurance Request"}
        </Button>

        <p className="text-xs text-[var(--text-muted)] text-center">
          We&apos;ll review your information and contact you within 1 business day.
        </p>
      </form>
    </Card>
  );
}
