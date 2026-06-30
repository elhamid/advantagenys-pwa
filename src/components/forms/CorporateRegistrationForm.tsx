"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useFormSendIdParam, useSharedByParam, useUtmParams } from "@/hooks/useUtmParams";
import type { AdditionalOwner, CorporateRegistrationLead } from "@/lib/leads/types";
import { formStart, formSubmit } from "@/lib/analytics/events";
import { reportFormError, userFacingFormError } from "@/lib/error-reporting";
import { FormErrorMessage } from "@/components/ui/FormErrorMessage";
import { preventImplicitFormSubmit } from "./preventImplicitFormSubmit";

const businessTypes = [
  "LLC",
  "S-Corp",
  "C-Corp",
  "Non-Profit 501(c)(3)",
  "Sole Proprietorship",
  "Partnership",
] as const;

const yesNoOptions = ["Yes", "No", "Not Sure"] as const;

const ownerCountOptions = [1, 2, 3] as const;

const meetingOptions = ["Hamid", "Jay", "Kedar", "Zia", "Akram", "Not Sure"] as const;

const websiteSeoOptions = [
  "No website help needed",
  "Need a new website",
  "Need SEO / Google presence",
  "Need both website and SEO",
  "Not Sure",
] as const;

interface CorporateRegistrationData {
  fullName: string;
  phone: string;
  email: string;
  desiredBusinessName: string;
  businessType: string;
  ein: string;
  filingReceiptDate: string;
  natureOfBusiness: string;
  ownerAddress: string;
  ownerCity: string;
  ownerState: string;
  ownerZipCode: string;
  ownerSsnOrItin: string;
  ownerDateOfBirth: string;
  ownerTelephone: string;
  ownerCellPhone: string;
  numberOfMembers: string;
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

const emptyOwner: AdditionalOwner = {
  name: "",
  address: "",
  city: "",
  state: "NY",
  zipCode: "",
  ssnOrItin: "",
  dateOfBirth: "",
  telephone: "",
  cellPhone: "",
  phone: "",
};

export function CorporateRegistrationForm() {
  const utm = useUtmParams();
  const sharedBy = useSharedByParam();
  const formSendId = useFormSendIdParam();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [formData, setFormData] = useState<CorporateRegistrationData>({
    fullName: "",
    phone: "",
    email: "",
    desiredBusinessName: "",
    businessType: "",
    ein: "",
    filingReceiptDate: "",
    natureOfBusiness: "",
    ownerAddress: "",
    ownerCity: "",
    ownerState: "NY",
    ownerZipCode: "",
    ownerSsnOrItin: "",
    ownerDateOfBirth: "",
    ownerTelephone: "",
    ownerCellPhone: "",
    numberOfMembers: "",
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
  const [numberOfOwners, setNumberOfOwners] = useState<number>(1);
  const [additionalOwners, setAdditionalOwners] = useState<AdditionalOwner[]>([
    { ...emptyOwner },
    { ...emptyOwner },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const startedRef = useRef(false);

  function handleFirstFocus() {
    if (startedRef.current) return;
    startedRef.current = true;
    formStart("corporate-registration");
  }

  function updateOwner(index: number, field: keyof AdditionalOwner) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setAdditionalOwners((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: e.target.value };
        return updated;
      });
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Collect additional owners based on selection (owners beyond Owner 1)
    const ownersToSubmit: AdditionalOwner[] | undefined =
      numberOfOwners > 1
        ? additionalOwners
            .slice(0, numberOfOwners - 1)
            .filter((o) => Object.values(o).some((value) => typeof value === "string" && value.trim()))
        : undefined;
    const owner2 = ownersToSubmit?.[0];
    const owner3 = ownersToSubmit?.[1];

    const payload: CorporateRegistrationLead & { turnstileToken?: string } = {
      type: "corporate-registration",
      source: "website-corporate-registration",
      sharedBy: sharedBy || undefined,
      formSendId: formSendId || undefined,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || undefined,
      desiredBusinessName: formData.desiredBusinessName || undefined,
      businessType: formData.businessType || undefined,
      ein: formData.ein || undefined,
      filingReceiptDate: formData.filingReceiptDate || undefined,
      natureOfBusiness: formData.natureOfBusiness || undefined,
      ownerAddress: formData.ownerAddress || undefined,
      ownerCity: formData.ownerCity || undefined,
      ownerState: formData.ownerState || undefined,
      ownerZipCode: formData.ownerZipCode || undefined,
      ownerSsnOrItin: formData.ownerSsnOrItin || undefined,
      ownerDateOfBirth: formData.ownerDateOfBirth || undefined,
      ownerTelephone: formData.ownerTelephone || undefined,
      ownerCellPhone: formData.ownerCellPhone || undefined,
      numberOfMembers: formData.numberOfMembers || undefined,
      numberOfOwners,
      additionalOwners:
        ownersToSubmit && ownersToSubmit.length > 0 ? ownersToSubmit : undefined,
      additionalOwner2Name: owner2?.name || undefined,
      additionalOwner2Address: owner2?.address || undefined,
      additionalOwner2City: owner2?.city || undefined,
      additionalOwner2State: owner2?.state || undefined,
      additionalOwner2ZipCode: owner2?.zipCode || undefined,
      additionalOwner2SsnOrItin: owner2?.ssnOrItin || undefined,
      additionalOwner2DateOfBirth: owner2?.dateOfBirth || undefined,
      additionalOwner2Telephone: owner2?.telephone || undefined,
      additionalOwner2CellPhone: owner2?.cellPhone || owner2?.phone || undefined,
      additionalOwner3Name: owner3?.name || undefined,
      additionalOwner3Address: owner3?.address || undefined,
      additionalOwner3City: owner3?.city || undefined,
      additionalOwner3State: owner3?.state || undefined,
      additionalOwner3ZipCode: owner3?.zipCode || undefined,
      additionalOwner3SsnOrItin: owner3?.ssnOrItin || undefined,
      additionalOwner3DateOfBirth: owner3?.dateOfBirth || undefined,
      additionalOwner3Telephone: owner3?.telephone || undefined,
      additionalOwner3CellPhone: owner3?.cellPhone || owner3?.phone || undefined,
      meetingPreference: formData.meetingPreference || undefined,
      corporationAddress: formData.corporationAddress || undefined,
      corporationCity: formData.corporationCity || undefined,
      corporationState: formData.corporationState || undefined,
      corporationZipCode: formData.corporationZipCode || undefined,
      websiteSeoOptions: formData.websiteSeoOptions || undefined,
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

      formSubmit("corporate-registration");

      setSubmitted(true);
    } catch (err) {
      reportFormError("corporate-registration", err, formData as unknown as Record<string, unknown>);
      setError(userFacingFormError(err));
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
          Your corporation formation request has been received.
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

  /** How many additional-owner sections to show (0, 1, or 2). */
  const additionalOwnerCount = numberOfOwners - 1;

  return (
    <Card>
      <h2 className="text-xl font-bold text-[var(--text)] mb-6">
        Corporation Formation
      </h2>
      <form
        onSubmit={handleSubmit}
        onFocus={handleFirstFocus}
        onKeyDown={preventImplicitFormSubmit}
        className="space-y-5"
      >
        {/* Owner 1: Name */}
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

        {/* Owner 1: Phone */}
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

        {/* Owner 1 Address */}
        <div>
          <label htmlFor="ownerAddress" className="block text-sm font-medium text-[var(--text)] mb-1">
            Owner Address
          </label>
          <input
            type="text"
            id="ownerAddress"
            value={formData.ownerAddress}
            onChange={update("ownerAddress")}
            placeholder="Owner street address"
            className={inputClasses}
          />
        </div>

        {/* Owner 1 City / State / ZIP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="ownerCity" className="block text-sm font-medium text-[var(--text)] mb-1">
              Owner City
            </label>
            <input
              type="text"
              id="ownerCity"
              value={formData.ownerCity}
              onChange={update("ownerCity")}
              placeholder="City"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="ownerState" className="block text-sm font-medium text-[var(--text)] mb-1">
              Owner State
            </label>
            <input
              type="text"
              id="ownerState"
              value={formData.ownerState}
              onChange={update("ownerState")}
              placeholder="NY"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="ownerZipCode" className="block text-sm font-medium text-[var(--text)] mb-1">
              Owner ZIP Code
            </label>
            <input
              type="text"
              id="ownerZipCode"
              value={formData.ownerZipCode}
              onChange={update("ownerZipCode")}
              placeholder="10001"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Owner 1 Sensitive / Contact Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ownerSsnOrItin" className="block text-sm font-medium text-[var(--text)] mb-1">
              Owner SSN / ITIN
            </label>
            <input
              type="text"
              id="ownerSsnOrItin"
              value={formData.ownerSsnOrItin}
              onChange={update("ownerSsnOrItin")}
              placeholder="For filing use only"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="ownerDateOfBirth" className="block text-sm font-medium text-[var(--text)] mb-1">
              Owner Date of Birth
            </label>
            <input
              type="date"
              id="ownerDateOfBirth"
              value={formData.ownerDateOfBirth}
              onChange={update("ownerDateOfBirth")}
              className={inputClasses}
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">Use Month / Day / Year, not DD/MM/YYYY. Example: June 23, 2026.</p>
          </div>
          <div>
            <label htmlFor="ownerTelephone" className="block text-sm font-medium text-[var(--text)] mb-1">
              Owner Telephone
            </label>
            <input
              type="tel"
              id="ownerTelephone"
              value={formData.ownerTelephone}
              onChange={update("ownerTelephone")}
              placeholder="Office or home phone"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="ownerCellPhone" className="block text-sm font-medium text-[var(--text)] mb-1">
              Owner Cell Phone
            </label>
            <input
              type="tel"
              id="ownerCellPhone"
              value={formData.ownerCellPhone}
              onChange={update("ownerCellPhone")}
              placeholder="Mobile phone"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Number of Owners */}
        <div>
          <p className="block text-sm font-medium text-[var(--text)] mb-2">
            Number of Owners <span className="text-red-500">*</span>
          </p>
          <div className="flex gap-6">
            {ownerCountOptions.map((count) => (
              <label
                key={`owners-${count}`}
                className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]"
              >
                <input
                  type="radio"
                  name="numberOfOwners"
                  value={count}
                  checked={numberOfOwners === count}
                  onChange={() => setNumberOfOwners(count)}
                  className="text-[var(--blue-accent)] focus:ring-[var(--blue-accent)]"
                />
                {count}
              </label>
            ))}
          </div>
        </div>

        {/* Additional Owner Sections */}
        <AnimatePresence mode="sync">
          {Array.from({ length: additionalOwnerCount }, (_, i) => {
            const ownerNum = i + 2; // Owner 2 or Owner 3
            return (
              <motion.div
                key={`owner-${ownerNum}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-raised,var(--surface))] p-4 space-y-4">
                  <p className="text-sm font-semibold text-[var(--text)]">
                    Owner {ownerNum}
                  </p>
                  <div>
                    <label
                      htmlFor={`owner${ownerNum}Name`}
                      className="block text-sm font-medium text-[var(--text)] mb-1"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`owner${ownerNum}Name`}
                      required
                      value={additionalOwners[i].name}
                      onChange={updateOwner(i, "name")}
                      placeholder={`Owner ${ownerNum} full name`}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`owner${ownerNum}Address`}
                      className="block text-sm font-medium text-[var(--text)] mb-1"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id={`owner${ownerNum}Address`}
                      value={additionalOwners[i].address ?? ""}
                      onChange={updateOwner(i, "address")}
                      placeholder={`Owner ${ownerNum} street address`}
                      className={inputClasses}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor={`owner${ownerNum}City`}
                        className="block text-sm font-medium text-[var(--text)] mb-1"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id={`owner${ownerNum}City`}
                        value={additionalOwners[i].city ?? ""}
                        onChange={updateOwner(i, "city")}
                        placeholder="City"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`owner${ownerNum}State`}
                        className="block text-sm font-medium text-[var(--text)] mb-1"
                      >
                        State
                      </label>
                      <input
                        type="text"
                        id={`owner${ownerNum}State`}
                        value={additionalOwners[i].state ?? ""}
                        onChange={updateOwner(i, "state")}
                        placeholder="NY"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`owner${ownerNum}ZipCode`}
                        className="block text-sm font-medium text-[var(--text)] mb-1"
                      >
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id={`owner${ownerNum}ZipCode`}
                        value={additionalOwners[i].zipCode ?? ""}
                        onChange={updateOwner(i, "zipCode")}
                        placeholder="10001"
                        className={inputClasses}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor={`owner${ownerNum}SsnOrItin`}
                        className="block text-sm font-medium text-[var(--text)] mb-1"
                      >
                        SSN / ITIN
                      </label>
                      <input
                        type="text"
                        id={`owner${ownerNum}SsnOrItin`}
                        value={additionalOwners[i].ssnOrItin ?? ""}
                        onChange={updateOwner(i, "ssnOrItin")}
                        placeholder="For filing use only"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`owner${ownerNum}DateOfBirth`}
                        className="block text-sm font-medium text-[var(--text)] mb-1"
                      >
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        id={`owner${ownerNum}DateOfBirth`}
                        value={additionalOwners[i].dateOfBirth ?? ""}
                        onChange={updateOwner(i, "dateOfBirth")}
                        className={inputClasses}
                      />
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Use Month / Day / Year, not DD/MM/YYYY. Example: June 23, 2026.
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor={`owner${ownerNum}Telephone`}
                        className="block text-sm font-medium text-[var(--text)] mb-1"
                      >
                        Telephone
                      </label>
                      <input
                        type="tel"
                        id={`owner${ownerNum}Telephone`}
                        value={additionalOwners[i].telephone ?? ""}
                        onChange={updateOwner(i, "telephone")}
                        placeholder="Office or home phone"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`owner${ownerNum}CellPhone`}
                        className="block text-sm font-medium text-[var(--text)] mb-1"
                      >
                        Cell Phone
                      </label>
                      <input
                        type="tel"
                        id={`owner${ownerNum}CellPhone`}
                        value={additionalOwners[i].cellPhone ?? ""}
                        onChange={updateOwner(i, "cellPhone")}
                        placeholder="Mobile phone"
                        className={inputClasses}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

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

        {/* EIN / Filing Receipt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="corpEin" className="block text-sm font-medium text-[var(--text)] mb-1">
              EIN
            </label>
            <input
              type="text"
              id="corpEin"
              value={formData.ein}
              onChange={update("ein")}
              placeholder="Leave blank if not issued yet"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="filingReceiptDate" className="block text-sm font-medium text-[var(--text)] mb-1">
              Filing Receipt Date
            </label>
            <input
              type="date"
              id="filingReceiptDate"
              value={formData.filingReceiptDate}
              onChange={update("filingReceiptDate")}
              className={inputClasses}
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">Use Month / Day / Year, not DD/MM/YYYY. Example: June 23, 2026.</p>
          </div>
        </div>

        {/* Corporation Address */}
        <div>
          <label htmlFor="corporationAddress" className="block text-sm font-medium text-[var(--text)] mb-1">
            Corporation Address
          </label>
          <input
            type="text"
            id="corporationAddress"
            value={formData.corporationAddress}
            onChange={update("corporationAddress")}
            placeholder="Corporation street address"
            className={inputClasses}
          />
        </div>

        {/* Corporation City / State / ZIP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="corporationCity" className="block text-sm font-medium text-[var(--text)] mb-1">
              Corporation City
            </label>
            <input
              type="text"
              id="corporationCity"
              value={formData.corporationCity}
              onChange={update("corporationCity")}
              placeholder="City"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="corporationState" className="block text-sm font-medium text-[var(--text)] mb-1">
              Corporation State
            </label>
            <input
              type="text"
              id="corporationState"
              value={formData.corporationState}
              onChange={update("corporationState")}
              placeholder="NY"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="corporationZipCode" className="block text-sm font-medium text-[var(--text)] mb-1">
              Corporation ZIP Code
            </label>
            <input
              type="text"
              id="corporationZipCode"
              value={formData.corporationZipCode}
              onChange={update("corporationZipCode")}
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

        {/* Meeting Preference / Website SEO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="meetingPreference" className="block text-sm font-medium text-[var(--text)] mb-1">
              Who do you want to meet?
            </label>
            <select
              id="meetingPreference"
              value={formData.meetingPreference}
              onChange={update("meetingPreference")}
              className={inputClasses}
            >
              <option value="">Select person</option>
              {meetingOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="websiteSeoOptions" className="block text-sm font-medium text-[var(--text)] mb-1">
              Business Website & SEO Options
            </label>
            <select
              id="websiteSeoOptions"
              value={formData.websiteSeoOptions}
              onChange={update("websiteSeoOptions")}
              className={inputClasses}
            >
              <option value="">Select option</option>
              {websiteSeoOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
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
        {error && <FormErrorMessage error={error} />}

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
