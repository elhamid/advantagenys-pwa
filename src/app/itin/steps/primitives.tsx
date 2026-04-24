"use client";

/**
 * Shared UI primitives for ITIN form steps.
 * Extracted from ItinForm.tsx — do not import ItinForm from here.
 */

import React from "react";

export function Label({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-white/70 mb-1.5">
      {children}
      {required && <span className="text-[#818CF8] ml-0.5">*</span>}
    </label>
  );
}

export function Input({
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  large,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "email" | "text" | "decimal";
  autoComplete?: string;
  large?: boolean;
  id?: string;
}) {
  return (
    <>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => {
          setTimeout(() => {
            e.target.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 350);
        }}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        translate="no"
        className={`
          w-full px-4 py-3.5 rounded-xl
          ${large ? "text-lg" : "text-base"}
          bg-white/[0.07] border
          text-white placeholder-white/25
          focus:outline-none focus:border-[#4F56E8] focus:ring-1 focus:ring-[#4F56E8]/30
          transition-all duration-200
          ${error ? "border-red-400/50 ring-1 ring-red-400/20" : "border-white/10"}
        `}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </>
  );
}

export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{title}</h2>
      <p className="text-white/40 text-sm">{subtitle}</p>
    </div>
  );
}

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex-1 border-t border-white/10" />
      <span className="text-white/30 text-xs uppercase tracking-widest font-medium">{label}</span>
      <div className="flex-1 border-t border-white/10" />
    </div>
  );
}

export function ReviewField({
  label,
  value,
  muted = false,
  fullWidth = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <span className="text-white/30 text-xs">{label}</span>
      <p className={`text-sm ${muted ? "text-white/25 italic" : "text-white/80"}`}>{value}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Country Select
   ───────────────────────────────────────────── */

const FIRST_COUNTRY = "Jamaica";

const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile",
  "China", "Colombia", "Comoros", "Congo (DRC)", "Congo (Republic)",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea",
  "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland",
  "France", "Gabon", "Gambia", "Georgia", "Germany",
  "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
  "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica",
  "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
  "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia",
  "Norway", "Oman", "Pakistan", "Palau", "Palestine",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa",
  "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden",
  "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

const COUNTRY_OPTIONS = (() => {
  const rest = ALL_COUNTRIES.filter((c) => c !== FIRST_COUNTRY);
  return { first: FIRST_COUNTRY, rest };
})();

export function CountrySelect({
  value,
  onChange,
  id,
  required,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        translate="no"
        onFocus={(e) => {
          setTimeout(() => {
            e.target.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 350);
        }}
        required={required}
        className={`
          w-full px-4 py-3.5 rounded-xl text-base appearance-none
          bg-white/[0.07] border
          text-white
          focus:outline-none focus:border-[#4F56E8] focus:ring-1 focus:ring-[#4F56E8]/30
          transition-all duration-200
          ${!value ? "text-white/25" : ""}
          ${error ? "border-red-400/50 ring-1 ring-red-400/20" : "border-white/10"}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.3)' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
          paddingRight: "2.5rem",
        }}
      >
        <option value="" disabled className="bg-[#0F1B2D] text-white/40">
          Select country...
        </option>
        <option value={COUNTRY_OPTIONS.first} className="bg-[#0F1B2D] text-white font-semibold">
          {COUNTRY_OPTIONS.first}
        </option>
        <option disabled className="bg-[#0F1B2D] text-white/20">──────────</option>
        {COUNTRY_OPTIONS.rest.map((c) => (
          <option key={c} value={c} className="bg-[#0F1B2D] text-white">
            {c}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </>
  );
}

/* ─────────────────────────────────────────────
   Employer Badge
   ───────────────────────────────────────────── */

export function EmployerBadge({
  value,
  onChange,
  locked,
}: {
  value: string;
  onChange: (v: string) => void;
  locked: boolean;
}) {
  if (locked && value) {
    return (
      <div>
        <Label>Company / Employer</Label>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10">
          <div className="w-9 h-9 rounded-lg bg-[#4F56E8]/15 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#818CF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-white/80 text-base font-semibold block truncate">{value}</span>
          </div>
          <svg className="w-4 h-4 text-white/20 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor="itin-company">Company / Employer (optional)</Label>
      <Input
        id="itin-company"
        value={value}
        onChange={onChange}
        placeholder="Enter company name (if applicable)"
        autoComplete="organization"
      />
    </div>
  );
}
