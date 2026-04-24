/**
 * Shared types, constants, and utility functions for ITIN form steps.
 * Extracted from ItinForm.tsx for the per-step split.
 */

export const CITIES = [
  { value: "new_york", label: "New York", icon: "🗽" },
  { value: "nashville", label: "Nashville", icon: "🎵" },
] as const;

export interface ItinData {
  // Step 0 — Passport Scan
  documentScan: File | null;
  passportCountry: string;
  // Step 1 — Personal
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  countryOfBirth: string;
  cityOfBirth: string;
  countryOfCitizenship: string;
  phone: string;
  email: string;
  companyName: string;
  // Step 2 — Location
  city: string;
  addressUsa: string;
  aptNumber: string;
  zipCode: string;
  addressHomeCountry: string; // street address (backward compat key)
  homeCountry: string;
  homeCity: string;
  homeAddress: string;
  usEntryDate: string;
  amount: string;
  // Step 3 — Selfie
  selfie: File | null;
  // Step 4 — Review & Sign
  signature: File | null;
  // Legacy (backward compat)
  hasPassport: boolean;
  passportNumber: string;
  passportExpiry: string;
  comment: string;
}

export const INITIAL: ItinData = {
  firstName: "",
  lastName: "",
  middleName: "",
  dateOfBirth: "",
  countryOfBirth: "",
  cityOfBirth: "",
  countryOfCitizenship: "",
  phone: "",
  email: "",
  companyName: "",
  city: "",
  addressUsa: "",
  aptNumber: "",
  zipCode: "",
  addressHomeCountry: "",
  homeCountry: "",
  homeCity: "",
  homeAddress: "",
  usEntryDate: "",
  amount: "",
  documentScan: null,
  passportCountry: "",
  selfie: null,
  signature: null,
  hasPassport: false,
  passportNumber: "",
  passportExpiry: "",
  comment: "",
};

export const STEPS = [
  { label: "Passport", shortLabel: "Scan" },
  { label: "Personal", shortLabel: "Info" },
  { label: "Location", shortLabel: "Location" },
  { label: "Review", shortLabel: "Sign" },
] as const;

/** Convert YYYY-MM-DD to MM/DD/YYYY for display */
export function formatDateUS(d: string): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return y && m && day ? `${m}/${day}/${y}` : d;
}

export interface StepProps {
  data: ItinData;
  errors: Partial<Record<keyof ItinData, string>>;
  update: <K extends keyof ItinData>(field: K, value: ItinData[K]) => void;
  companyLocked?: boolean;
  priorityCountry?: string;
}
