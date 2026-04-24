"use client";

import { Label, Input, CountrySelect, EmployerBadge } from "./primitives";
import type { StepProps } from "./types";

/** Format raw digits as (XXX) XXX-XXXX for display */
function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export function StepPersonal({ data, errors, update, companyLocked = false, priorityCountry }: StepProps) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Personal Information</h2>
        <p className="text-white/40 text-sm">W-7 application details for your ITIN.</p>
      </div>

      {/* IRS badge */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#4F56E8]/10 border border-[#4F56E8]/20">
        <svg className="w-5 h-5 text-[#818CF8] shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-[#818CF8] text-sm font-medium">
          IRS Certified Acceptance Agent — documents verified on-site
        </span>
      </div>

      <EmployerBadge
        value={data.companyName}
        onChange={(v) => update("companyName", v)}
        locked={companyLocked}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required htmlFor="itin-firstName">First Name</Label>
          <Input
            id="itin-firstName"
            value={data.firstName}
            onChange={(v) => update("firstName", v)}
            error={errors.firstName}
            placeholder="Kemar"
            autoComplete="given-name"
          />
        </div>
        <div>
          <Label required htmlFor="itin-lastName">Last Name</Label>
          <Input
            id="itin-lastName"
            value={data.lastName}
            onChange={(v) => update("lastName", v)}
            error={errors.lastName}
            placeholder="Campbell"
            autoComplete="family-name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="itin-middleName">Middle Name</Label>
        <Input
          id="itin-middleName"
          value={data.middleName}
          onChange={(v) => update("middleName", v)}
          placeholder="Optional"
          autoComplete="additional-name"
        />
      </div>

      <div>
        <Label required htmlFor="itin-dob">Date of Birth</Label>
        <Input
          id="itin-dob"
          value={data.dateOfBirth}
          onChange={(v) => update("dateOfBirth", v)}
          error={errors.dateOfBirth}
          type="date"
        />
      </div>

      <div>
        <Label required htmlFor="itin-cityOfBirth">City / Town of Birth</Label>
        <Input
          id="itin-cityOfBirth"
          value={data.cityOfBirth}
          onChange={(v) => update("cityOfBirth", v)}
          error={errors.cityOfBirth}
          placeholder="Kingston"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required htmlFor="itin-countryOfBirth">Country of Birth</Label>
          <CountrySelect
            id="itin-countryOfBirth"
            value={data.countryOfBirth}
            onChange={(v) => update("countryOfBirth", v)}
            required
            error={errors.countryOfBirth}
            priorityCountry={priorityCountry}
          />
        </div>
        <div>
          <Label required htmlFor="itin-countryOfCitizenship">Country of Citizenship</Label>
          <CountrySelect
            id="itin-countryOfCitizenship"
            value={data.countryOfCitizenship}
            onChange={(v) => update("countryOfCitizenship", v)}
            required
            error={errors.countryOfCitizenship}
            priorityCountry={priorityCountry}
          />
        </div>
      </div>

      <div>
        <Label required htmlFor="itin-phone">Phone Number</Label>
        <Input
          id="itin-phone"
          value={formatPhoneDisplay(data.phone)}
          onChange={(v) => update("phone", v.replace(/\D/g, "").slice(0, 10))}
          error={errors.phone}
          placeholder="(555) 666-7777"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          large
        />
      </div>

      <div>
        <Label required htmlFor="itin-email">Email</Label>
        <Input
          id="itin-email"
          value={data.email}
          onChange={(v) => update("email", v)}
          error={errors.email}
          placeholder="email@example.com"
          type="email"
          inputMode="email"
          autoComplete="email"
        />
      </div>

      <div className="flex items-center gap-2 pt-1 text-white/25 text-xs">
        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>Your information is encrypted and handled securely.</span>
      </div>
    </div>
  );
}
