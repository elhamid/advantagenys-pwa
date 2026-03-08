"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const businessTypes = [
  "Contractor",
  "Restaurant",
  "Retail/Convenience",
  "Professional Services",
  "Other",
] as const;

const serviceOptions = [
  "Business Formation",
  "Licensing",
  "Tax Services",
  "Insurance",
  "Audit Defense",
  "ITIN",
  "Other",
] as const;

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  businessType: string;
  services: string[];
  message: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    email: "",
    businessType: "",
    services: [],
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleServiceToggle(service: string) {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Contact form submission:", formData);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="text-center py-12">
        <div className="text-4xl mb-4 text-[var(--green)]">&#10003;</div>
        <h3 className="text-xl font-bold text-[var(--text)] mb-2">
          Thank You, {formData.fullName}!
        </h3>
        <p className="text-[var(--text-secondary)]">
          We&apos;ll call you back within 1 business day.
        </p>
      </Card>
    );
  }

  const inputClasses =
    "w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-accent)] focus:border-transparent transition-all";

  return (
    <Card>
      <h2 className="text-xl font-bold text-[var(--text)] mb-6">
        Request a Free Consultation
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-[var(--text)] mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            required
            value={formData.fullName}
            onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
            placeholder="Your full name"
            className={inputClasses}
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[var(--text)] mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="(929) 000-0000"
            className={inputClasses}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-1">
            Email <span className="text-[var(--text-muted)]">(optional)</span>
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="you@example.com"
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
            onChange={(e) => setFormData((prev) => ({ ...prev, businessType: e.target.value }))}
            className={inputClasses}
          >
            <option value="">Select your business type</option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Services Interested In */}
        <div>
          <p className="block text-sm font-medium text-[var(--text)] mb-2">
            Services Interested In
          </p>
          <div className="grid grid-cols-2 gap-2">
            {serviceOptions.map((service) => (
              <label
                key={service}
                className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]"
              >
                <input
                  type="checkbox"
                  checked={formData.services.includes(service)}
                  onChange={() => handleServiceToggle(service)}
                  className="rounded border-[var(--border)] text-[var(--blue-accent)] focus:ring-[var(--blue-accent)]"
                />
                {service}
              </label>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-[var(--text)] mb-1">
            Brief Message
          </label>
          <textarea
            id="message"
            rows={3}
            value={formData.message}
            onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="Tell us a bit about what you need..."
            className={inputClasses}
          />
        </div>

        {/* Submit */}
        <Button type="submit" size="lg" className="w-full">
          Request Free Consultation
        </Button>

        <p className="text-xs text-[var(--text-muted)] text-center">
          We&apos;ll call you back within 1 business day.
        </p>
      </form>
    </Card>
  );
}
