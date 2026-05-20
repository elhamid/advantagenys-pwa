"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { uppercaseFormData } from "@/lib/forms/uppercase";

const genderOptions = ["Male", "Female"] as const;
const ethnicityOptions = ["Hispanic or Latino", "Not Hispanic or Latino"] as const;
const raceOptions = ["Black or African American", "White", "Asian", "American Indian/Native"] as const;
const hairColorOptions = ["Black", "Brown", "Blonde", "Grey", "White", "Bald"] as const;
const eyeColorOptions = ["Black", "Brown", "Hazel", "Maroon", "Unknown"] as const;
const yesNoOptions = ["Yes", "No"] as const;
const adoptionOptions = ["Born Biological", "Adopted"] as const;

type Step = 1 | 2 | 3 | 4 | 5;
const TOTAL_STEPS = 5;

interface BeneficiaryData {
  // Step 1: Personal info
  firstName: string;
  middleName: string;
  lastName: string;
  otherNameUsed: string;
  birthdate: string;
  countryOfBirth: string;
  cityOfBirth: string;
  gender: string;
  ethnicity: string;
  race: string;
  height: string;
  weight: string;
  hairColor: string;
  eyeColor: string;
  socialSecurity: string;
  phone: string;
  email: string;
  homeStreet: string;
  homeStreet2: string;
  homeCity: string;
  homeState: string;
  homeZip: string;
  mailingStreet: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  // Step 2: Arrival & Marital
  placeOfLastArrival: string;
  passportOrTravelDocNumber: string;
  countryIssuedPassport: string;
  nonimmigrationVisaNumber: string;
  dateVisaIssued: string;
  countryOfVisaIssuance: string;
  currentMaritalStatus: string;
  dateOfMarriage: string;
  placeOfMarriage: string;
  prevSpouseFirstName: string;
  prevSpouseMiddleName: string;
  prevSpouseLastName: string;
  prevSpousePlaceOfMarriage: string;
  prevSpouseDateOfTermination: string;
  prevSpousePlaceOfTermination: string;
  // Step 3: Parents
  fatherFirstName: string;
  fatherMiddleName: string;
  fatherLastName: string;
  fatherDateOfBirth: string;
  fatherCityOfBirth: string;
  fatherCountryOfBirth: string;
  fatherCountryOfResidency: string;
  motherFirstName: string;
  motherMiddleName: string;
  motherLastName: string;
  motherDateOfBirth: string;
  motherCityOfBirth: string;
  motherCountryOfBirth: string;
  motherCountryOfResidency: string;
  // Step 4: Children
  child1Type: string;
  child1Gender: string;
  child1FirstName: string;
  child1MiddleName: string;
  child1LastName: string;
  child1DateOfBirth: string;
  child1OtherName: string;
  child1CountryOfBirth: string;
  child1CityOfBirth: string;
  child1SSN: string;
  child1USCitizen: string;
  child2Type: string;
  child2Gender: string;
  child2FirstName: string;
  child2MiddleName: string;
  child2LastName: string;
  child2DateOfBirth: string;
  child2OtherName: string;
  child2CountryOfBirth: string;
  child2CityOfBirth: string;
  child2SSN: string;
  child2USCitizen: string;
  child3Type: string;
  child3Gender: string;
  child3FirstName: string;
  child3MiddleName: string;
  child3LastName: string;
  child3DateOfBirth: string;
  child3OtherName: string;
  child3CountryOfBirth: string;
  child3CityOfBirth: string;
  child3SSN: string;
  child3USCitizen: string;
  // Step 5: History
  pastAddresses: string;
  pastEmployment: string;
  lastAddressOutsideUS: string;
  additionalNotes: string;
}

const initialData: BeneficiaryData = {
  firstName: "", middleName: "", lastName: "",
  otherNameUsed: "", birthdate: "", countryOfBirth: "", cityOfBirth: "",
  gender: "", ethnicity: "", race: "", height: "", weight: "",
  hairColor: "", eyeColor: "", socialSecurity: "",
  phone: "", email: "",
  homeStreet: "", homeStreet2: "", homeCity: "", homeState: "", homeZip: "",
  mailingStreet: "", mailingCity: "", mailingState: "", mailingZip: "",
  placeOfLastArrival: "", passportOrTravelDocNumber: "", countryIssuedPassport: "",
  nonimmigrationVisaNumber: "", dateVisaIssued: "", countryOfVisaIssuance: "",
  currentMaritalStatus: "", dateOfMarriage: "", placeOfMarriage: "",
  prevSpouseFirstName: "", prevSpouseMiddleName: "", prevSpouseLastName: "",
  prevSpousePlaceOfMarriage: "", prevSpouseDateOfTermination: "",
  prevSpousePlaceOfTermination: "",
  fatherFirstName: "", fatherMiddleName: "", fatherLastName: "",
  fatherDateOfBirth: "", fatherCityOfBirth: "", fatherCountryOfBirth: "",
  fatherCountryOfResidency: "",
  motherFirstName: "", motherMiddleName: "", motherLastName: "",
  motherDateOfBirth: "", motherCityOfBirth: "", motherCountryOfBirth: "",
  motherCountryOfResidency: "",
  child1Type: "", child1Gender: "", child1FirstName: "", child1MiddleName: "",
  child1LastName: "", child1DateOfBirth: "", child1OtherName: "",
  child1CountryOfBirth: "", child1CityOfBirth: "", child1SSN: "", child1USCitizen: "",
  child2Type: "", child2Gender: "", child2FirstName: "", child2MiddleName: "",
  child2LastName: "", child2DateOfBirth: "", child2OtherName: "",
  child2CountryOfBirth: "", child2CityOfBirth: "", child2SSN: "", child2USCitizen: "",
  child3Type: "", child3Gender: "", child3FirstName: "", child3MiddleName: "",
  child3LastName: "", child3DateOfBirth: "", child3OtherName: "",
  child3CountryOfBirth: "", child3CityOfBirth: "", child3SSN: "", child3USCitizen: "",
  pastAddresses: "", pastEmployment: "", lastAddressOutsideUS: "", additionalNotes: "",
};

function joinName(...parts: string[]): string {
  return parts.filter(Boolean).join(" ");
}

export function ImmigrationBeneficiaryForm() {
  const [formData, setFormData] = useState<BeneficiaryData>({ ...initialData });
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof BeneficiaryData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function nextStep() { if (step < TOTAL_STEPS) setStep((step + 1) as Step); }
  function prevStep() { if (step > 1) setStep((step - 1) as Step); }

  function buildChildrenInfo(): string {
    const children: string[] = [];
    for (const n of [1, 2, 3] as const) {
      const prefix = `child${n}` as const;
      const first = formData[`${prefix}FirstName`];
      const last = formData[`${prefix}LastName`];
      if (!first && !last) continue;
      children.push(
        [
          `Child ${n}: ${joinName(first, formData[`${prefix}MiddleName`], last)}`,
          formData[`${prefix}Type`] && `Type: ${formData[`${prefix}Type`]}`,
          formData[`${prefix}Gender`] && `Gender: ${formData[`${prefix}Gender`]}`,
          formData[`${prefix}DateOfBirth`] && `DOB: ${formData[`${prefix}DateOfBirth`]}`,
          formData[`${prefix}CountryOfBirth`] && `Country: ${formData[`${prefix}CountryOfBirth`]}`,
          formData[`${prefix}CityOfBirth`] && `City: ${formData[`${prefix}CityOfBirth`]}`,
          formData[`${prefix}OtherName`] && `Other name: ${formData[`${prefix}OtherName`]}`,
          formData[`${prefix}SSN`] && `SSN: ${formData[`${prefix}SSN`]}`,
          formData[`${prefix}USCitizen`] && `US Citizen: ${formData[`${prefix}USCitizen`]}`,
        ].filter(Boolean).join("; ")
      );
    }
    return children.join("\n");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fullName = joinName(formData.firstName, formData.middleName, formData.lastName);
    const homeAddr = [formData.homeStreet, formData.homeStreet2, formData.homeCity, formData.homeState, formData.homeZip].filter(Boolean).join(", ");
    const mailAddr = [formData.mailingStreet, formData.mailingCity, formData.mailingState, formData.mailingZip].filter(Boolean).join(", ");

    const payload = {
      type: "immigration-beneficiary",
      fullName: fullName || formData.firstName || "Beneficiary",
      phone: formData.phone,
      email: formData.email || undefined,
      otherNameUsed: formData.otherNameUsed || undefined,
      birthdate: formData.birthdate || undefined,
      countryOfBirth: formData.countryOfBirth || undefined,
      cityOfBirth: formData.cityOfBirth || undefined,
      gender: formData.gender || undefined,
      ethnicity: formData.ethnicity || undefined,
      race: formData.race || undefined,
      height: formData.height || undefined,
      weight: formData.weight || undefined,
      hairColor: formData.hairColor || undefined,
      eyeColor: formData.eyeColor || undefined,
      socialSecurity: formData.socialSecurity || undefined,
      homeAddress: homeAddr || undefined,
      mailingAddress: mailAddr || undefined,
      placeOfLastArrival: formData.placeOfLastArrival || undefined,
      passportOrTravelDocNumber: formData.passportOrTravelDocNumber || undefined,
      countryIssuedPassport: formData.countryIssuedPassport || undefined,
      nonimmigrationVisaNumber: formData.nonimmigrationVisaNumber || undefined,
      dateVisaIssued: formData.dateVisaIssued || undefined,
      countryOfVisaIssuance: formData.countryOfVisaIssuance || undefined,
      currentMaritalStatus: formData.currentMaritalStatus || undefined,
      dateOfMarriage: formData.dateOfMarriage || undefined,
      placeOfMarriage: formData.placeOfMarriage || undefined,
      previousSpouseName: joinName(formData.prevSpouseFirstName, formData.prevSpouseMiddleName, formData.prevSpouseLastName) || undefined,
      previousSpousePlaceOfMarriage: formData.prevSpousePlaceOfMarriage || undefined,
      previousSpouseDateOfTermination: formData.prevSpouseDateOfTermination || undefined,
      previousSpousePlaceOfTermination: formData.prevSpousePlaceOfTermination || undefined,
      fatherFullName: joinName(formData.fatherFirstName, formData.fatherMiddleName, formData.fatherLastName) || undefined,
      fatherDateOfBirth: formData.fatherDateOfBirth || undefined,
      fatherCityOfBirth: formData.fatherCityOfBirth || undefined,
      fatherCountryOfBirth: formData.fatherCountryOfBirth || undefined,
      fatherCountryOfResidency: formData.fatherCountryOfResidency || undefined,
      motherFullName: joinName(formData.motherFirstName, formData.motherMiddleName, formData.motherLastName) || undefined,
      motherDateOfBirth: formData.motherDateOfBirth || undefined,
      motherCityOfBirth: formData.motherCityOfBirth || undefined,
      motherCountryOfBirth: formData.motherCountryOfBirth || undefined,
      motherCountryOfResidency: formData.motherCountryOfResidency || undefined,
      childrenInfo: buildChildrenInfo() || undefined,
      pastAddresses: formData.pastAddresses || undefined,
      pastEmployment: formData.pastEmployment || undefined,
      lastAddressOutsideUS: formData.lastAddressOutsideUS || undefined,
      additionalNotes: formData.additionalNotes || undefined,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uppercaseFormData(payload)),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card className="text-center py-12">
        <div className="text-4xl mb-4 text-[var(--green)]">&#10003;</div>
        <h3 className="text-xl font-bold text-[var(--text)] mb-2">
          Thank You, {joinName(formData.firstName, formData.lastName)}!
        </h3>
        <p className="text-[var(--text-secondary)]">
          Your immigration beneficiary form has been received.
          <br />
          We&apos;ll contact you within 1 business day. For immediate assistance, call{" "}
          <a href="tel:+19299331396" className="text-[var(--blue-accent)] font-medium">(929) 933-1396</a>.
        </p>
        <p className="text-sm text-[var(--text-muted)] mt-4">
          Please bring the following documents: copy of marriage certificate, divorce decrees (if any),
          birth certificate, copy of visa, country passport, entry stamp or I-94, 6 passport photos,
          and a medical form from an immigration doctor.
        </p>
      </Card>
    );
  }

  const inputClasses =
    "w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-accent)] focus:border-transparent transition-all uppercase";

  const sectionTitle = (text: string) => (
    <h3 className="text-lg font-semibold text-[var(--text)] pt-2 pb-1 border-b border-[var(--border)]">{text}</h3>
  );

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div key={i} className={`h-2 rounded-full transition-all ${i + 1 === step ? "w-8 bg-[var(--blue-accent)]" : i + 1 < step ? "w-6 bg-[var(--green)]" : "w-6 bg-[var(--border)]"}`} />
      ))}
    </div>
  );

  return (
    <Card className="notranslate">
      <h2 className="text-xl font-bold text-[var(--text)] mb-1">Immigration Form for Beneficiary</h2>
      <p className="text-sm text-[var(--text-muted)] mb-1">For the person getting the Green Card</p>
      <p className="text-sm text-[var(--text-secondary)] mb-4">Step {step} of {TOTAL_STEPS}</p>
      {stepIndicator}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ===== STEP 1: Personal Information ===== */}
        {step === 1 && (
          <>
            {sectionTitle("Personal Information")}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="benFirstName" className="block text-sm font-medium text-[var(--text)] mb-1">First Name <span className="text-red-500">*</span></label>
                <input translate="no" type="text" id="benFirstName" required value={formData.firstName} onChange={update("firstName")} placeholder="First name" className={inputClasses} />
              </div>
              <div>
                <label htmlFor="benMiddleName" className="block text-sm font-medium text-[var(--text)] mb-1">Middle Name</label>
                <input translate="no" type="text" id="benMiddleName" value={formData.middleName} onChange={update("middleName")} placeholder="Middle name" className={inputClasses} />
              </div>
              <div>
                <label htmlFor="benLastName" className="block text-sm font-medium text-[var(--text)] mb-1">Last Name <span className="text-red-500">*</span></label>
                <input translate="no" type="text" id="benLastName" required value={formData.lastName} onChange={update("lastName")} placeholder="Last name" className={inputClasses} />
              </div>
            </div>
            <div>
              <label htmlFor="benOtherName" className="block text-sm font-medium text-[var(--text)] mb-1">Other Name Used</label>
              <input translate="no" type="text" id="benOtherName" value={formData.otherNameUsed} onChange={update("otherNameUsed")} placeholder="Maiden name, aliases, etc." className={inputClasses} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="benBirthdate" className="block text-sm font-medium text-[var(--text)] mb-1">Birthdate</label>
                <input translate="no" type="date" id="benBirthdate" value={formData.birthdate} onChange={update("birthdate")} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Gender</label>
                <div className="flex gap-6 mt-2">
                  {genderOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
                      <input translate="no" type="radio" name="benGender" value={opt} checked={formData.gender === opt} onChange={update("gender")} className="text-[var(--blue-accent)] focus:ring-[var(--blue-accent)]" />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Country of Birth</label>
                <input translate="no" type="text" value={formData.countryOfBirth} onChange={update("countryOfBirth")} placeholder="Country" className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">City of Birth</label>
                <input translate="no" type="text" value={formData.cityOfBirth} onChange={update("cityOfBirth")} placeholder="City" className={inputClasses} />
              </div>
            </div>
            <div>
              <p className="block text-sm font-medium text-[var(--text)] mb-2">Ethnicity</p>
              <div className="flex flex-wrap gap-4">
                {ethnicityOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
                    <input translate="no" type="radio" name="benEthnicity" value={opt} checked={formData.ethnicity === opt} onChange={update("ethnicity")} className="text-[var(--blue-accent)] focus:ring-[var(--blue-accent)]" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="block text-sm font-medium text-[var(--text)] mb-2">Race</p>
              <div className="flex flex-wrap gap-4">
                {raceOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
                    <input translate="no" type="radio" name="benRace" value={opt} checked={formData.race === opt} onChange={update("race")} className="text-[var(--blue-accent)] focus:ring-[var(--blue-accent)]" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Height</label>
                <input translate="no" type="text" value={formData.height} onChange={update("height")} placeholder="e.g. 5 ft 8 in" className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Weight</label>
                <input translate="no" type="text" value={formData.weight} onChange={update("weight")} placeholder="e.g. 160 lbs" className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Hair Color</label>
                <select translate="no" value={formData.hairColor} onChange={update("hairColor")} className={inputClasses}>
                  <option value="">Select</option>
                  {hairColorOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Eye Color</label>
                <select translate="no" value={formData.eyeColor} onChange={update("eyeColor")} className={inputClasses}>
                  <option value="">Select</option>
                  {eyeColorOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Social Security Number</label>
              <input translate="no" type="text" value={formData.socialSecurity} onChange={update("socialSecurity")} placeholder="###-##-####" maxLength={11} className={inputClasses} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="benPhone" className="block text-sm font-medium text-[var(--text)] mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input translate="no" type="tel" id="benPhone" required value={formData.phone} onChange={update("phone")} placeholder="(929) 000-0000" className={inputClasses} />
              </div>
              <div>
                <label htmlFor="benEmail" className="block text-sm font-medium text-[var(--text)] mb-1">Email <span className="text-red-500">*</span></label>
                <input translate="no" type="email" id="benEmail" required value={formData.email} onChange={update("email")} placeholder="you@example.com" className={inputClasses} />
              </div>
            </div>

            {sectionTitle("Home Address")}
            <input translate="no" type="text" value={formData.homeStreet} onChange={update("homeStreet")} placeholder="Street address" className={inputClasses} />
            <input translate="no" type="text" value={formData.homeStreet2} onChange={update("homeStreet2")} placeholder="Apt, Suite, Unit" className={inputClasses} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input translate="no" type="text" value={formData.homeCity} onChange={update("homeCity")} placeholder="City" className={inputClasses} />
              <input translate="no" type="text" value={formData.homeState} onChange={update("homeState")} placeholder="State" className={inputClasses} />
              <input translate="no" type="text" value={formData.homeZip} onChange={update("homeZip")} placeholder="ZIP Code" className={inputClasses} />
            </div>

            {sectionTitle("Mailing Address (only if different)")}
            <input translate="no" type="text" value={formData.mailingStreet} onChange={update("mailingStreet")} placeholder="Street address" className={inputClasses} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input translate="no" type="text" value={formData.mailingCity} onChange={update("mailingCity")} placeholder="City" className={inputClasses} />
              <input translate="no" type="text" value={formData.mailingState} onChange={update("mailingState")} placeholder="State" className={inputClasses} />
              <input translate="no" type="text" value={formData.mailingZip} onChange={update("mailingZip")} placeholder="ZIP" className={inputClasses} />
            </div>
          </>
        )}

        {/* ===== STEP 2: Arrival & Marital ===== */}
        {step === 2 && (
          <>
            {sectionTitle("U.S. Arrival Information")}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Place of Last Arrival in the U.S. (City & State)</label>
              <input translate="no" type="text" value={formData.placeOfLastArrival} onChange={update("placeOfLastArrival")} placeholder="City & State" className={inputClasses} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Passport/Travel Document Number</label>
                <input translate="no" type="text" value={formData.passportOrTravelDocNumber} onChange={update("passportOrTravelDocNumber")} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Country that Issued Passport</label>
                <input translate="no" type="text" value={formData.countryIssuedPassport} onChange={update("countryIssuedPassport")} className={inputClasses} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Nonimmigration Visa #</label>
                <input translate="no" type="text" value={formData.nonimmigrationVisaNumber} onChange={update("nonimmigrationVisaNumber")} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Date Visa Issued</label>
                <input translate="no" type="date" value={formData.dateVisaIssued} onChange={update("dateVisaIssued")} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Country of Visa Issuance</label>
                <input translate="no" type="text" value={formData.countryOfVisaIssuance} onChange={update("countryOfVisaIssuance")} className={inputClasses} />
              </div>
            </div>

            {sectionTitle("Marital Information")}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Current Marital Status</label>
              <input translate="no" type="text" value={formData.currentMaritalStatus} onChange={update("currentMaritalStatus")} placeholder="Married, Single, Widower" className={inputClasses} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Date of Marriage</label>
                <input translate="no" type="date" value={formData.dateOfMarriage} onChange={update("dateOfMarriage")} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Place of Marriage</label>
                <input translate="no" type="text" value={formData.placeOfMarriage} onChange={update("placeOfMarriage")} placeholder="City & State" className={inputClasses} />
              </div>
            </div>

            {sectionTitle("Previous Spouse (if any)")}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input translate="no" type="text" value={formData.prevSpouseFirstName} onChange={update("prevSpouseFirstName")} placeholder="First name" className={inputClasses} />
              <input translate="no" type="text" value={formData.prevSpouseMiddleName} onChange={update("prevSpouseMiddleName")} placeholder="Middle name" className={inputClasses} />
              <input translate="no" type="text" value={formData.prevSpouseLastName} onChange={update("prevSpouseLastName")} placeholder="Last name" className={inputClasses} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input translate="no" type="text" value={formData.prevSpousePlaceOfMarriage} onChange={update("prevSpousePlaceOfMarriage")} placeholder="Place of marriage" className={inputClasses} />
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Date of Termination</label>
                <input translate="no" type="date" value={formData.prevSpouseDateOfTermination} onChange={update("prevSpouseDateOfTermination")} className={inputClasses} />
              </div>
              <input translate="no" type="text" value={formData.prevSpousePlaceOfTermination} onChange={update("prevSpousePlaceOfTermination")} placeholder="Place of termination" className={inputClasses} />
            </div>
          </>
        )}

        {/* ===== STEP 3: Parents ===== */}
        {step === 3 && (
          <>
            {sectionTitle("Father's Information")}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input translate="no" type="text" value={formData.fatherFirstName} onChange={update("fatherFirstName")} placeholder="First name" className={inputClasses} />
              <input translate="no" type="text" value={formData.fatherMiddleName} onChange={update("fatherMiddleName")} placeholder="Middle name" className={inputClasses} />
              <input translate="no" type="text" value={formData.fatherLastName} onChange={update("fatherLastName")} placeholder="Last name" className={inputClasses} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Date of Birth</label>
                <input translate="no" type="date" value={formData.fatherDateOfBirth} onChange={update("fatherDateOfBirth")} className={inputClasses} />
              </div>
              <input translate="no" type="text" value={formData.fatherCityOfBirth} onChange={update("fatherCityOfBirth")} placeholder="City of birth" className={inputClasses} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input translate="no" type="text" value={formData.fatherCountryOfBirth} onChange={update("fatherCountryOfBirth")} placeholder="Country of birth" className={inputClasses} />
              <input translate="no" type="text" value={formData.fatherCountryOfResidency} onChange={update("fatherCountryOfResidency")} placeholder="Country of residency (if living)" className={inputClasses} />
            </div>

            {sectionTitle("Mother's Information")}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input translate="no" type="text" value={formData.motherFirstName} onChange={update("motherFirstName")} placeholder="First name" className={inputClasses} />
              <input translate="no" type="text" value={formData.motherMiddleName} onChange={update("motherMiddleName")} placeholder="Middle name" className={inputClasses} />
              <input translate="no" type="text" value={formData.motherLastName} onChange={update("motherLastName")} placeholder="Last name" className={inputClasses} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Date of Birth</label>
                <input translate="no" type="date" value={formData.motherDateOfBirth} onChange={update("motherDateOfBirth")} className={inputClasses} />
              </div>
              <input translate="no" type="text" value={formData.motherCityOfBirth} onChange={update("motherCityOfBirth")} placeholder="City of birth" className={inputClasses} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input translate="no" type="text" value={formData.motherCountryOfBirth} onChange={update("motherCountryOfBirth")} placeholder="Country of birth" className={inputClasses} />
              <input translate="no" type="text" value={formData.motherCountryOfResidency} onChange={update("motherCountryOfResidency")} placeholder="Country of residency (if living)" className={inputClasses} />
            </div>
          </>
        )}

        {/* ===== STEP 4: Children ===== */}
        {step === 4 && (
          <>
            {sectionTitle("Children Information")}
            <p className="text-sm text-[var(--text-muted)]">List up to 3 biological or adopted children. Leave blank if none.</p>
            {([1, 2, 3] as const).map((n) => {
              const prefix = `child${n}` as const;
              return (
                <div key={n} className="rounded-[var(--radius)] border border-[var(--border)] p-4 space-y-3">
                  <p className="text-sm font-semibold text-[var(--text)]">Child {n}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">Biological / Adopted</label>
                      <div className="flex gap-4">
                        {adoptionOptions.map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
                            <input translate="no" type="radio" name={`${prefix}Type`} value={opt} checked={formData[`${prefix}Type`] === opt} onChange={update(`${prefix}Type`)} className="text-[var(--blue-accent)] focus:ring-[var(--blue-accent)]" />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">Gender</label>
                      <div className="flex gap-4">
                        {genderOptions.map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
                            <input translate="no" type="radio" name={`${prefix}Gender`} value={opt} checked={formData[`${prefix}Gender`] === opt} onChange={update(`${prefix}Gender`)} className="text-[var(--blue-accent)] focus:ring-[var(--blue-accent)]" />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input translate="no" type="text" value={formData[`${prefix}FirstName`]} onChange={update(`${prefix}FirstName`)} placeholder="First name" className={inputClasses} />
                    <input translate="no" type="text" value={formData[`${prefix}MiddleName`]} onChange={update(`${prefix}MiddleName`)} placeholder="Middle name" className={inputClasses} />
                    <input translate="no" type="text" value={formData[`${prefix}LastName`]} onChange={update(`${prefix}LastName`)} placeholder="Last name" className={inputClasses} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">Date of Birth</label>
                      <input translate="no" type="date" value={formData[`${prefix}DateOfBirth`]} onChange={update(`${prefix}DateOfBirth`)} className={inputClasses} />
                    </div>
                    <input translate="no" type="text" value={formData[`${prefix}CountryOfBirth`]} onChange={update(`${prefix}CountryOfBirth`)} placeholder="Country of birth" className={inputClasses} />
                    <input translate="no" type="text" value={formData[`${prefix}CityOfBirth`]} onChange={update(`${prefix}CityOfBirth`)} placeholder="City of birth" className={inputClasses} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input translate="no" type="text" value={formData[`${prefix}OtherName`]} onChange={update(`${prefix}OtherName`)} placeholder="Other name used" className={inputClasses} />
                    <input translate="no" type="text" value={formData[`${prefix}SSN`]} onChange={update(`${prefix}SSN`)} placeholder="SSN" className={inputClasses} />
                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-1">U.S. Citizen?</label>
                      <div className="flex gap-4 mt-1">
                        {yesNoOptions.map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
                            <input translate="no" type="radio" name={`${prefix}USCitizen`} value={opt} checked={formData[`${prefix}USCitizen`] === opt} onChange={update(`${prefix}USCitizen`)} className="text-[var(--blue-accent)] focus:ring-[var(--blue-accent)]" />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ===== STEP 5: History & Notes ===== */}
        {step === 5 && (
          <>
            {sectionTitle("Past 5 Years - Addresses")}
            <textarea translate="no" rows={4} value={formData.pastAddresses} onChange={update("pastAddresses")} placeholder="Address 1: Street, City, State, Dates&#10;Address 2: ..." className={inputClasses} />

            {sectionTitle("Past 5 Years - Employment/Studies")}
            <textarea translate="no" rows={4} value={formData.pastEmployment} onChange={update("pastEmployment")} placeholder="Employer/School 1: Name, Address, Dates&#10;Employer/School 2: ..." className={inputClasses} />

            {sectionTitle("Last Physical Address Outside the U.S.")}
            <input translate="no" type="text" value={formData.lastAddressOutsideUS} onChange={update("lastAddressOutsideUS")} placeholder="Street, City, Country" className={inputClasses} />

            {sectionTitle("Additional Notes")}
            <textarea translate="no" rows={3} value={formData.additionalNotes} onChange={update("additionalNotes")} placeholder="Any additional information..." className={inputClasses} />

            <div className="rounded-[var(--radius)] bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">Please bring the following documents to your appointment:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Copy of marriage certificate</li>
                <li>Copy of divorce decrees (if any)</li>
                <li>Copy of birth certificate</li>
                <li>Copy of visa</li>
                <li>Copy of your country passport</li>
                <li>Copy of entry stamp or I-94 form</li>
                <li>6 passport photos</li>
                <li>Medical form by immigration doctor</li>
              </ol>
            </div>
          </>
        )}

        {/* Navigation */}
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <div className="flex gap-3">
          {step > 1 && (
            <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={prevStep}>Back</Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button type="button" size="lg" className="flex-1" onClick={nextStep}>Next</Button>
          ) : (
            <Button type="submit" size="lg" className="flex-1" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Form"}
            </Button>
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)] text-center">
          After submitting, you can book an appointment online or call us at (929) 933-1396.
        </p>
      </form>
    </Card>
  );
}
