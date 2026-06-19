"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getShareAttributionFromLocation } from "@/lib/forms/share-attribution";
import { uppercaseFormData } from "@/lib/forms/uppercase";

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
  ownerName: string;
  phone: string;
  email: string;
  desiredBusinessName: string;
  businessType: string;
  ein: string;
  filingReceiptDate: string;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  natureOfBusiness: string;
  numberOfMembers: string;
  numberOfOwners: string;
  ownerAddress: string;
  ownerCity: string;
  ownerState: string;
  ownerZipCode: string;
  ownerSsnOrItin: string;
  ownerDateOfBirth: string;
  ownerTelephone: string;
  ownerCellPhone: string;
  additionalOwner2Name: string;
  additionalOwner2Address: string;
  additionalOwner2City: string;
  additionalOwner2State: string;
  additionalOwner2ZipCode: string;
  additionalOwner2SsnOrItin: string;
  additionalOwner2DateOfBirth: string;
  additionalOwner2Telephone: string;
  additionalOwner2CellPhone: string;
  additionalOwner3Name: string;
  additionalOwner3Address: string;
  additionalOwner3City: string;
  additionalOwner3State: string;
  additionalOwner3ZipCode: string;
  additionalOwner3SsnOrItin: string;
  additionalOwner3DateOfBirth: string;
  additionalOwner3Telephone: string;
  additionalOwner3CellPhone: string;
  meetingPreference: string;
  corporationAddress: string;
  corporationCity: string;
  corporationState: string;
  corporationZipCode: string;
  websiteSeoOptions: string;
  needEIN: string;
  needSalesTax: string;
  needPayroll: string;
  additionalNotes: string;
}

export function CorporateRegistrationForm() {
  const [formData, setFormData] = useState<CorporateRegistrationData>({
    ownerName: "",
    phone: "",
    email: "",
    desiredBusinessName: "",
    businessType: "",
    ein: "",
    filingReceiptDate: "",
    businessAddress: "",
    city: "",
    state: "NY",
    zipCode: "",
    natureOfBusiness: "",
    numberOfMembers: "",
    numberOfOwners: "1",
    ownerAddress: "",
    ownerCity: "",
    ownerState: "NY",
    ownerZipCode: "",
    ownerSsnOrItin: "",
    ownerDateOfBirth: "",
    ownerTelephone: "",
    ownerCellPhone: "",
    additionalOwner2Name: "",
    additionalOwner2Address: "",
    additionalOwner2City: "",
    additionalOwner2State: "NY",
    additionalOwner2ZipCode: "",
    additionalOwner2SsnOrItin: "",
    additionalOwner2DateOfBirth: "",
    additionalOwner2Telephone: "",
    additionalOwner2CellPhone: "",
    additionalOwner3Name: "",
    additionalOwner3Address: "",
    additionalOwner3City: "",
    additionalOwner3State: "NY",
    additionalOwner3ZipCode: "",
    additionalOwner3SsnOrItin: "",
    additionalOwner3DateOfBirth: "",
    additionalOwner3Telephone: "",
    additionalOwner3CellPhone: "",
    meetingPreference: "",
    corporationAddress: "",
    corporationCity: "",
    corporationState: "NY",
    corporationZipCode: "",
    websiteSeoOptions: "",
    needEIN: "",
    needSalesTax: "",
    needPayroll: "",
    additionalNotes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const normalizedFormData = uppercaseFormData(formData);
      const additionalOwners = [
        {
          name: normalizedFormData.additionalOwner2Name,
          address: normalizedFormData.additionalOwner2Address,
          city: normalizedFormData.additionalOwner2City,
          state: normalizedFormData.additionalOwner2State,
          zipCode: normalizedFormData.additionalOwner2ZipCode,
          ssnOrItin: normalizedFormData.additionalOwner2SsnOrItin,
          dateOfBirth: normalizedFormData.additionalOwner2DateOfBirth,
          telephone: normalizedFormData.additionalOwner2Telephone,
          cellPhone: normalizedFormData.additionalOwner2CellPhone,
        },
        {
          name: normalizedFormData.additionalOwner3Name,
          address: normalizedFormData.additionalOwner3Address,
          city: normalizedFormData.additionalOwner3City,
          state: normalizedFormData.additionalOwner3State,
          zipCode: normalizedFormData.additionalOwner3ZipCode,
          ssnOrItin: normalizedFormData.additionalOwner3SsnOrItin,
          dateOfBirth: normalizedFormData.additionalOwner3DateOfBirth,
          telephone: normalizedFormData.additionalOwner3Telephone,
          cellPhone: normalizedFormData.additionalOwner3CellPhone,
        },
      ].filter((owner) => Object.values(owner).some((value) => value.trim()));
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...normalizedFormData,
          fullName: normalizedFormData.ownerName,
          businessName: normalizedFormData.desiredBusinessName,
          numberOfOwners: Number(normalizedFormData.numberOfOwners || 1),
          additionalOwners: additionalOwners.length > 0 ? additionalOwners : undefined,
          services: ["Business Formation"],
          serviceType: "Business Formation",
          message: normalizedFormData.additionalNotes,
          type: "corporate-registration",
          source: "website-corporate-registration",
          ...getShareAttributionFromLocation(),
        }),
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
          Thank You, {formData.ownerName}!
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
    "w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-accent)] focus:border-transparent transition-all uppercase";

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
          <label htmlFor="ownerName" className="block text-sm font-medium text-[var(--text)] mb-1">
            Business Owner Full Name <span className="text-red-500">*</span>
          </label>
          <input translate="no"
            type="text"
            id="ownerName"
            required
            value={formData.ownerName}
            onChange={update("ownerName")}
            placeholder="Your full name"
            className={inputClasses}
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="corpPhone" className="block text-sm font-medium text-[var(--text)] mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input translate="no"
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
          <input translate="no"
            type="email"
            id="corpEmail"
            required
            value={formData.email}
            onChange={update("email")}
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ownerSsnOrItin" className="block text-sm font-medium text-[var(--text)] mb-1">
              Owner SSN / ITIN
            </label>
            <input translate="no"
              type="text"
              id="ownerSsnOrItin"
              value={formData.ownerSsnOrItin}
              onChange={update("ownerSsnOrItin")}
              placeholder="XXX-XX-XXXX"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="ownerDateOfBirth" className="block text-sm font-medium text-[var(--text)] mb-1">
              Owner Date of Birth
            </label>
            <input translate="no"
              type="date"
              id="ownerDateOfBirth"
              value={formData.ownerDateOfBirth}
              onChange={update("ownerDateOfBirth")}
              className={inputClasses}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ownerTelephone" className="block text-sm font-medium text-[var(--text)] mb-1">
              Owner Telephone
            </label>
            <input translate="no"
              type="tel"
              id="ownerTelephone"
              value={formData.ownerTelephone}
              onChange={update("ownerTelephone")}
              placeholder="(929) 000-0000"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="ownerCellPhone" className="block text-sm font-medium text-[var(--text)] mb-1">
              Owner Cell Phone
            </label>
            <input translate="no"
              type="tel"
              id="ownerCellPhone"
              value={formData.ownerCellPhone}
              onChange={update("ownerCellPhone")}
              placeholder="(929) 000-0000"
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label htmlFor="ownerAddress" className="block text-sm font-medium text-[var(--text)] mb-1">
            Owner Home Address
          </label>
          <input translate="no"
            type="text"
            id="ownerAddress"
            value={formData.ownerAddress}
            onChange={update("ownerAddress")}
            placeholder="Street address"
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="ownerCity" className="block text-sm font-medium text-[var(--text)] mb-1">
              Owner City
            </label>
            <input translate="no"
              type="text"
              id="ownerCity"
              value={formData.ownerCity}
              onChange={update("ownerCity")}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="ownerState" className="block text-sm font-medium text-[var(--text)] mb-1">
              Owner State
            </label>
            <input translate="no"
              type="text"
              id="ownerState"
              value={formData.ownerState}
              onChange={update("ownerState")}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="ownerZipCode" className="block text-sm font-medium text-[var(--text)] mb-1">
              Owner ZIP Code
            </label>
            <input translate="no"
              type="text"
              id="ownerZipCode"
              value={formData.ownerZipCode}
              onChange={update("ownerZipCode")}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Desired Business Name */}
        <div>
          <label htmlFor="desiredBusinessName" className="block text-sm font-medium text-[var(--text)] mb-1">
            Desired Business Name <span className="text-red-500">*</span>
          </label>
          <input translate="no"
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
          <select translate="no"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ein" className="block text-sm font-medium text-[var(--text)] mb-1">
              EIN (if already issued)
            </label>
            <input translate="no"
              type="text"
              id="ein"
              value={formData.ein}
              onChange={update("ein")}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="filingReceiptDate" className="block text-sm font-medium text-[var(--text)] mb-1">
              Filing Receipt Date
            </label>
            <input translate="no"
              type="date"
              id="filingReceiptDate"
              value={formData.filingReceiptDate}
              onChange={update("filingReceiptDate")}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="businessAddress" className="block text-sm font-medium text-[var(--text)] mb-1">
            Business Address
          </label>
          <input translate="no"
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
            <input translate="no"
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
            <input translate="no"
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
            <input translate="no"
              type="text"
              id="zipCode"
              value={formData.zipCode}
              onChange={update("zipCode")}
              placeholder="10001"
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label htmlFor="corporationAddress" className="block text-sm font-medium text-[var(--text)] mb-1">
            Corporation Mailing Address
          </label>
          <input translate="no"
            type="text"
            id="corporationAddress"
            value={formData.corporationAddress}
            onChange={update("corporationAddress")}
            placeholder="Street address"
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="corporationCity" className="block text-sm font-medium text-[var(--text)] mb-1">
              Corporation City
            </label>
            <input translate="no"
              type="text"
              id="corporationCity"
              value={formData.corporationCity}
              onChange={update("corporationCity")}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="corporationState" className="block text-sm font-medium text-[var(--text)] mb-1">
              Corporation State
            </label>
            <input translate="no"
              type="text"
              id="corporationState"
              value={formData.corporationState}
              onChange={update("corporationState")}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="corporationZipCode" className="block text-sm font-medium text-[var(--text)] mb-1">
              Corporation ZIP Code
            </label>
            <input translate="no"
              type="text"
              id="corporationZipCode"
              value={formData.corporationZipCode}
              onChange={update("corporationZipCode")}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Nature of Business */}
        <div>
          <label htmlFor="natureOfBusiness" className="block text-sm font-medium text-[var(--text)] mb-1">
            Nature of Business / Industry
          </label>
          <input translate="no"
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
          <input translate="no"
            type="number"
            id="numberOfMembers"
            min="1"
            value={formData.numberOfMembers}
            onChange={update("numberOfMembers")}
            placeholder="1"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="numberOfOwners" className="block text-sm font-medium text-[var(--text)] mb-1">
            Number of Owners
          </label>
          <input translate="no"
            type="number"
            id="numberOfOwners"
            min="1"
            max="3"
            value={formData.numberOfOwners}
            onChange={update("numberOfOwners")}
            placeholder="1"
            className={inputClasses}
          />
        </div>

        <div className="space-y-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-sm font-semibold text-[var(--text)]">Owner 2 (if applicable)</p>
          <div>
            <label htmlFor="additionalOwner2Name" className="block text-sm font-medium text-[var(--text)] mb-1">
              Full Name
            </label>
            <input translate="no"
              type="text"
              id="additionalOwner2Name"
              value={formData.additionalOwner2Name}
              onChange={update("additionalOwner2Name")}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="additionalOwner2Address" className="block text-sm font-medium text-[var(--text)] mb-1">
              Address
            </label>
            <input translate="no"
              type="text"
              id="additionalOwner2Address"
              value={formData.additionalOwner2Address}
              onChange={update("additionalOwner2Address")}
              className={inputClasses}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="additionalOwner2City" className="block text-sm font-medium text-[var(--text)] mb-1">
                City
              </label>
              <input translate="no"
                type="text"
                id="additionalOwner2City"
                value={formData.additionalOwner2City}
                onChange={update("additionalOwner2City")}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="additionalOwner2State" className="block text-sm font-medium text-[var(--text)] mb-1">
                State
              </label>
              <input translate="no"
                type="text"
                id="additionalOwner2State"
                value={formData.additionalOwner2State}
                onChange={update("additionalOwner2State")}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="additionalOwner2ZipCode" className="block text-sm font-medium text-[var(--text)] mb-1">
                ZIP Code
              </label>
              <input translate="no"
                type="text"
                id="additionalOwner2ZipCode"
                value={formData.additionalOwner2ZipCode}
                onChange={update("additionalOwner2ZipCode")}
                className={inputClasses}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="additionalOwner2SsnOrItin" className="block text-sm font-medium text-[var(--text)] mb-1">
                SSN / ITIN
              </label>
              <input translate="no"
                type="text"
                id="additionalOwner2SsnOrItin"
                value={formData.additionalOwner2SsnOrItin}
                onChange={update("additionalOwner2SsnOrItin")}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="additionalOwner2DateOfBirth" className="block text-sm font-medium text-[var(--text)] mb-1">
                Date of Birth
              </label>
              <input translate="no"
                type="date"
                id="additionalOwner2DateOfBirth"
                value={formData.additionalOwner2DateOfBirth}
                onChange={update("additionalOwner2DateOfBirth")}
                className={inputClasses}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="additionalOwner2Telephone" className="block text-sm font-medium text-[var(--text)] mb-1">
                Telephone
              </label>
              <input translate="no"
                type="tel"
                id="additionalOwner2Telephone"
                value={formData.additionalOwner2Telephone}
                onChange={update("additionalOwner2Telephone")}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="additionalOwner2CellPhone" className="block text-sm font-medium text-[var(--text)] mb-1">
                Cell Phone
              </label>
              <input translate="no"
                type="tel"
                id="additionalOwner2CellPhone"
                value={formData.additionalOwner2CellPhone}
                onChange={update("additionalOwner2CellPhone")}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-sm font-semibold text-[var(--text)]">Owner 3 (if applicable)</p>
          <div>
            <label htmlFor="additionalOwner3Name" className="block text-sm font-medium text-[var(--text)] mb-1">
              Full Name
            </label>
            <input translate="no"
              type="text"
              id="additionalOwner3Name"
              value={formData.additionalOwner3Name}
              onChange={update("additionalOwner3Name")}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="additionalOwner3Address" className="block text-sm font-medium text-[var(--text)] mb-1">
              Address
            </label>
            <input translate="no"
              type="text"
              id="additionalOwner3Address"
              value={formData.additionalOwner3Address}
              onChange={update("additionalOwner3Address")}
              className={inputClasses}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="additionalOwner3City" className="block text-sm font-medium text-[var(--text)] mb-1">
                City
              </label>
              <input translate="no"
                type="text"
                id="additionalOwner3City"
                value={formData.additionalOwner3City}
                onChange={update("additionalOwner3City")}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="additionalOwner3State" className="block text-sm font-medium text-[var(--text)] mb-1">
                State
              </label>
              <input translate="no"
                type="text"
                id="additionalOwner3State"
                value={formData.additionalOwner3State}
                onChange={update("additionalOwner3State")}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="additionalOwner3ZipCode" className="block text-sm font-medium text-[var(--text)] mb-1">
                ZIP Code
              </label>
              <input translate="no"
                type="text"
                id="additionalOwner3ZipCode"
                value={formData.additionalOwner3ZipCode}
                onChange={update("additionalOwner3ZipCode")}
                className={inputClasses}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="additionalOwner3SsnOrItin" className="block text-sm font-medium text-[var(--text)] mb-1">
                SSN / ITIN
              </label>
              <input translate="no"
                type="text"
                id="additionalOwner3SsnOrItin"
                value={formData.additionalOwner3SsnOrItin}
                onChange={update("additionalOwner3SsnOrItin")}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="additionalOwner3DateOfBirth" className="block text-sm font-medium text-[var(--text)] mb-1">
                Date of Birth
              </label>
              <input translate="no"
                type="date"
                id="additionalOwner3DateOfBirth"
                value={formData.additionalOwner3DateOfBirth}
                onChange={update("additionalOwner3DateOfBirth")}
                className={inputClasses}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="additionalOwner3Telephone" className="block text-sm font-medium text-[var(--text)] mb-1">
                Telephone
              </label>
              <input translate="no"
                type="tel"
                id="additionalOwner3Telephone"
                value={formData.additionalOwner3Telephone}
                onChange={update("additionalOwner3Telephone")}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="additionalOwner3CellPhone" className="block text-sm font-medium text-[var(--text)] mb-1">
                Cell Phone
              </label>
              <input translate="no"
                type="tel"
                id="additionalOwner3CellPhone"
                value={formData.additionalOwner3CellPhone}
                onChange={update("additionalOwner3CellPhone")}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="meetingPreference" className="block text-sm font-medium text-[var(--text)] mb-1">
            Meeting Preference
          </label>
          <input translate="no"
            type="text"
            id="meetingPreference"
            value={formData.meetingPreference}
            onChange={update("meetingPreference")}
            placeholder="Phone, office, WhatsApp, or email"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="websiteSeoOptions" className="block text-sm font-medium text-[var(--text)] mb-1">
            Website / SEO / Online Presence Requests
          </label>
          <textarea translate="no"
            id="websiteSeoOptions"
            rows={3}
            value={formData.websiteSeoOptions}
            onChange={update("websiteSeoOptions")}
            placeholder="Website, Google profile, domain, email, logo, or online presence needs"
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
                <input translate="no"
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
                <input translate="no"
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
                <input translate="no"
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
          <textarea translate="no"
            id="additionalNotes"
            rows={3}
            value={formData.additionalNotes}
            onChange={update("additionalNotes")}
            placeholder="Any additional information or questions..."
            className={inputClasses}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {/* Submit */}
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Registration"}
        </Button>

        <p className="text-xs text-[var(--text-muted)] text-center">
          We&apos;ll contact you within 1 business day to confirm your registration.
        </p>
      </form>
    </Card>
  );
}
