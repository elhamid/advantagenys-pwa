"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { uppercaseFormData } from "@/lib/forms/uppercase";

const filingStatusOptions = [
  "Single",
  "Married filing jointly",
  "Married filing separately (MFS)",
  "Head of household (HOH)",
  "Qualifying surviving spouse (QSS)",
] as const;

const yesNoOptions = ["Yes", "No"] as const;

const businessTypeOptions = [
  "Construction Business",
  "Taxi/Truck/Cab Business",
  "Other Business",
] as const;

type Step = 1 | 2 | 3 | 4 | 5;
const TOTAL_STEPS = 5;

interface TaxReturnData {
  // Step 1: Filer info
  firstName: string;
  lastName: string;
  socialSecurity: string;
  occupation: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  addressStreet: string;
  addressStreet2: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  filingYear: string;
  filingStatus: string;
  // Spouse
  spouseFirstName: string;
  spouseLastName: string;
  spouseSocialSecurity: string;
  spouseOccupation: string;
  spouseDateOfBirth: string;
  spouseEmail: string;
  spousePhone: string;
  // Step 2: Dependents & childcare
  hasDependents: string;
  dependentsInfo: string;
  hasMarketplaceInsurance: string;
  childcareProviderName: string;
  childcareAmountPaid: string;
  childcareProviderAddress: string;
  childcareProviderSSNOrEIN: string;
  // Step 3: Income & credits
  hasVirtualCurrencyIncome: string;
  hasForeignBankAccount: string;
  hasRentalProperty: string;
  collegeExpenses: string;
  // EIC questions
  eicQualifying: string;
  eicHomeInUS: string;
  eicChildrenMarried: string;
  eicOtherClaimDependent: string;
  eicOtherClaimingEIC: string;
  eicTiebreakerApplied: string;
  eicReducedOrDisallowed: string;
  eicAdditionalNote: string;
  // Step 4: Deductions
  itemizedDeductionsPriorYear: string;
  nysRefundNotice: string;
  mortgagePremiumInsurance: string;
  mortgageInterest: string;
  realEstateTaxes: string;
  medicalInsurance: string;
  doctorsCoPays: string;
  prescriptions: string;
  eyeglassesContacts: string;
  medicalSupplies: string;
  medicalTravel: string;
  otherMedicalExpenses: string;
  // Business
  businessName: string;
  businessEIN: string;
  businessAddress: string;
  totalSalesOrRevenue: string;
  businessType: string;
  businessMiles: string;
  personalMiles: string;
  totalMiles: string;
  // Step 5: Bank & signature
  bankRoutingNumber: string;
  bankAccountNumber: string;
  additionalNotes: string;
}

const initialData: TaxReturnData = {
  firstName: "", lastName: "", socialSecurity: "", occupation: "",
  dateOfBirth: "", email: "", phone: "",
  addressStreet: "", addressStreet2: "", addressCity: "", addressState: "", addressZip: "",
  filingYear: "", filingStatus: "",
  spouseFirstName: "", spouseLastName: "", spouseSocialSecurity: "",
  spouseOccupation: "", spouseDateOfBirth: "", spouseEmail: "", spousePhone: "",
  hasDependents: "", dependentsInfo: "", hasMarketplaceInsurance: "",
  childcareProviderName: "", childcareAmountPaid: "",
  childcareProviderAddress: "", childcareProviderSSNOrEIN: "",
  hasVirtualCurrencyIncome: "", hasForeignBankAccount: "",
  hasRentalProperty: "", collegeExpenses: "",
  eicQualifying: "", eicHomeInUS: "", eicChildrenMarried: "",
  eicOtherClaimDependent: "", eicOtherClaimingEIC: "",
  eicTiebreakerApplied: "", eicReducedOrDisallowed: "", eicAdditionalNote: "",
  itemizedDeductionsPriorYear: "", nysRefundNotice: "",
  mortgagePremiumInsurance: "", mortgageInterest: "", realEstateTaxes: "",
  medicalInsurance: "", doctorsCoPays: "", prescriptions: "",
  eyeglassesContacts: "", medicalSupplies: "", medicalTravel: "",
  otherMedicalExpenses: "",
  businessName: "", businessEIN: "", businessAddress: "",
  totalSalesOrRevenue: "", businessType: "", businessMiles: "",
  personalMiles: "", totalMiles: "",
  bankRoutingNumber: "", bankAccountNumber: "", additionalNotes: "",
};

export function TaxReturnForm() {
  const [formData, setFormData] = useState<TaxReturnData>({ ...initialData });
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  function update(field: keyof TaxReturnData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function nextStep() { if (step < TOTAL_STEPS) setStep((step + 1) as Step); }
  function prevStep() { if (step > 1) setStep((step - 1) as Step); }

  const showSpouse = formData.filingStatus === "Married filing jointly";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!termsAccepted) {
      setError("Please accept the terms and conditions before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(" ");

    const payload = {
      type: "tax-return",
      fullName: fullName || formData.firstName || "Taxpayer",
      phone: formData.phone,
      email: formData.email || undefined,
      filingYear: formData.filingYear || undefined,
      filingStatus: formData.filingStatus || undefined,
      socialSecurity: formData.socialSecurity || undefined,
      occupation: formData.occupation || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      address: formData.addressStreet || undefined,
      city: formData.addressCity || undefined,
      state: formData.addressState || undefined,
      zipCode: formData.addressZip || undefined,
      spouseName: [formData.spouseFirstName, formData.spouseLastName].filter(Boolean).join(" ") || undefined,
      spouseSocialSecurity: formData.spouseSocialSecurity || undefined,
      spouseOccupation: formData.spouseOccupation || undefined,
      spouseDateOfBirth: formData.spouseDateOfBirth || undefined,
      spouseEmail: formData.spouseEmail || undefined,
      spousePhone: formData.spousePhone || undefined,
      hasDependents: formData.hasDependents || undefined,
      dependentsInfo: formData.dependentsInfo || undefined,
      childcareProviderName: formData.childcareProviderName || undefined,
      childcareAmountPaid: formData.childcareAmountPaid || undefined,
      childcareProviderAddress: formData.childcareProviderAddress || undefined,
      childcareProviderSSNOrEIN: formData.childcareProviderSSNOrEIN || undefined,
      hasMarketplaceInsurance: formData.hasMarketplaceInsurance || undefined,
      hasVirtualCurrencyIncome: formData.hasVirtualCurrencyIncome || undefined,
      hasForeignBankAccount: formData.hasForeignBankAccount || undefined,
      hasRentalProperty: formData.hasRentalProperty || undefined,
      itemizedDeductionsPriorYear: formData.itemizedDeductionsPriorYear || undefined,
      nysRefundNotice: formData.nysRefundNotice || undefined,
      mortgagePremiumInsurance: formData.mortgagePremiumInsurance || undefined,
      mortgageInterest: formData.mortgageInterest || undefined,
      realEstateTaxes: formData.realEstateTaxes || undefined,
      medicalInsurance: formData.medicalInsurance || undefined,
      doctorsCoPays: formData.doctorsCoPays || undefined,
      prescriptions: formData.prescriptions || undefined,
      eyeglassesContacts: formData.eyeglassesContacts || undefined,
      medicalSupplies: formData.medicalSupplies || undefined,
      medicalTravel: formData.medicalTravel || undefined,
      otherMedicalExpenses: formData.otherMedicalExpenses || undefined,
      businessName: formData.businessName || undefined,
      businessEIN: formData.businessEIN || undefined,
      businessAddress: formData.businessAddress || undefined,
      totalSalesOrRevenue: formData.totalSalesOrRevenue || undefined,
      businessType: formData.businessType || undefined,
      bankRoutingNumber: formData.bankRoutingNumber || undefined,
      bankAccountNumber: formData.bankAccountNumber || undefined,
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
          Thank You, {[formData.firstName, formData.lastName].filter(Boolean).join(" ")}!
        </h3>
        <p className="text-[var(--text-secondary)]">
          Your tax return questionnaire has been received.
          <br />
          Please book an appointment with one of our expert tax advisors, or call{" "}
          <a href="tel:+19299331396" className="text-[var(--blue-accent)] font-medium">(929) 933-1396</a>.
        </p>
      </Card>
    );
  }

  const inputClasses =
    "w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-accent)] focus:border-transparent transition-all uppercase";

  const sectionTitle = (text: string) => (
    <h3 className="text-lg font-semibold text-[var(--text)] pt-2 pb-1 border-b border-[var(--border)]">{text}</h3>
  );

  const radioQuestion = (label: string, name: string, field: keyof TaxReturnData) => (
    <div>
      <p className="block text-sm font-medium text-[var(--text)] mb-2">{label}</p>
      <div className="flex gap-6">
        {yesNoOptions.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
            <input translate="no" type="radio" name={name} value={opt} checked={formData[field] === opt} onChange={update(field)} className="text-[var(--blue-accent)] focus:ring-[var(--blue-accent)]" />
            {opt}
          </label>
        ))}
      </div>
    </div>
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
      <h2 className="text-xl font-bold text-[var(--text)] mb-1">Tax Return Questionnaire</h2>
      <p className="text-sm text-[var(--text-muted)] mb-1">Advantage Business Consulting LLC</p>
      <p className="text-sm text-[var(--text-secondary)] mb-4">Step {step} of {TOTAL_STEPS}</p>
      {stepIndicator}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ===== STEP 1: Filer Information ===== */}
        {step === 1 && (
          <>
            {sectionTitle("Filing Information")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Filing Tax for Year</label>
                <input translate="no" type="text" value={formData.filingYear} onChange={update("filingYear")} placeholder="e.g. 2025" className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Filing Status <span className="text-red-500">*</span>
                </label>
                <select translate="no" required value={formData.filingStatus} onChange={update("filingStatus")} className={inputClasses}>
                  <option value="">Select filing status</option>
                  {filingStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {sectionTitle("Taxpayer Information")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input translate="no" type="text" required value={formData.firstName} onChange={update("firstName")} placeholder="First name" className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input translate="no" type="text" required value={formData.lastName} onChange={update("lastName")} placeholder="Last name" className={inputClasses} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Social Security # <span className="text-red-500">*</span>
                </label>
                <input translate="no" type="text" required value={formData.socialSecurity} onChange={update("socialSecurity")} placeholder="Input only numbers (999223333)" maxLength={9} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Occupation <span className="text-red-500">*</span>
                </label>
                <input translate="no" type="text" required value={formData.occupation} onChange={update("occupation")} className={inputClasses} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input translate="no" type="date" required value={formData.dateOfBirth} onChange={update("dateOfBirth")} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input translate="no" type="email" required value={formData.email} onChange={update("email")} placeholder="you@example.com" className={inputClasses} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">
                Cell Phone <span className="text-red-500">*</span>
              </label>
              <input translate="no" type="tel" required value={formData.phone} onChange={update("phone")} placeholder="(929) 000-0000" className={inputClasses} />
            </div>

            {sectionTitle("Address")}
            <input translate="no" type="text" required value={formData.addressStreet} onChange={update("addressStreet")} placeholder="Street address" className={inputClasses} />
            <input translate="no" type="text" value={formData.addressStreet2} onChange={update("addressStreet2")} placeholder="Apt #" className={inputClasses} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input translate="no" type="text" required value={formData.addressCity} onChange={update("addressCity")} placeholder="City" className={inputClasses} />
              <input translate="no" type="text" required value={formData.addressState} onChange={update("addressState")} placeholder="State" className={inputClasses} />
              <input translate="no" type="text" required value={formData.addressZip} onChange={update("addressZip")} placeholder="ZIP Code" className={inputClasses} />
            </div>

            {/* Spouse — only if married filing jointly */}
            {showSpouse && (
              <>
                {sectionTitle("Spouse Information")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input translate="no" type="text" value={formData.spouseFirstName} onChange={update("spouseFirstName")} placeholder="Spouse first name" className={inputClasses} />
                  <input translate="no" type="text" value={formData.spouseLastName} onChange={update("spouseLastName")} placeholder="Spouse last name" className={inputClasses} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">Spouse SSN</label>
                    <input translate="no" type="text" value={formData.spouseSocialSecurity} onChange={update("spouseSocialSecurity")} placeholder="Input only numbers" maxLength={9} className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">Spouse Occupation</label>
                    <input translate="no" type="text" value={formData.spouseOccupation} onChange={update("spouseOccupation")} className={inputClasses} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">Spouse DOB</label>
                    <input translate="no" type="date" value={formData.spouseDateOfBirth} onChange={update("spouseDateOfBirth")} className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">Spouse Email</label>
                    <input translate="no" type="email" value={formData.spouseEmail} onChange={update("spouseEmail")} className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">Spouse Phone</label>
                    <input translate="no" type="tel" value={formData.spousePhone} onChange={update("spousePhone")} className={inputClasses} />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ===== STEP 2: Dependents & Childcare ===== */}
        {step === 2 && (
          <>
            {sectionTitle("Dependents")}
            <p className="text-sm text-[var(--text-muted)]">
              Children under 19 or full-time students under 24 years of age. Members of your
              household who make under $2,500/year and you provide more than half the support.
            </p>
            {radioQuestion("Do you have dependents?", "hasDependents", "hasDependents")}
            {formData.hasDependents === "Yes" && (
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  List dependents (Name, DOB, SSN, Relation, Months lived with you)
                </label>
                <textarea translate="no" rows={4} value={formData.dependentsInfo} onChange={update("dependentsInfo")} placeholder="Child 1: John Doe, 01/15/2010, 123-45-6789, Son, 12 months&#10;Child 2: ..." className={inputClasses} />
              </div>
            )}

            {radioQuestion("Did the taxpayer, spouse, or dependent receive insurance through Marketplace?", "hasMarketplaceInsurance", "hasMarketplaceInsurance")}

            {sectionTitle("Childcare Services")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Name of Child Care Provider</label>
                <input translate="no" type="text" value={formData.childcareProviderName} onChange={update("childcareProviderName")} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Amount Paid</label>
                <input translate="no" type="text" value={formData.childcareAmountPaid} onChange={update("childcareAmountPaid")} placeholder="$" className={inputClasses} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Address of Provider</label>
                <input translate="no" type="text" value={formData.childcareProviderAddress} onChange={update("childcareProviderAddress")} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">SSN or EIN of Provider</label>
                <input translate="no" type="text" value={formData.childcareProviderSSNOrEIN} onChange={update("childcareProviderSSNOrEIN")} className={inputClasses} />
              </div>
            </div>

            {sectionTitle("Earned Income Credit (EIC) & Child Tax Credit (CTC)")}
            {radioQuestion("Were you/spouse the qualifying person of someone else for EIC?", "eicQualifying", "eicQualifying")}
            {radioQuestion("Was your home in the US for more than half of the filing year?", "eicHomeInUS", "eicHomeInUS")}
            {radioQuestion("Are any of the children listed above married?", "eicChildrenMarried", "eicChildrenMarried")}
            {radioQuestion("Can anyone else claim this child as a dependent?", "eicOtherClaimDependent", "eicOtherClaimDependent")}
            {radioQuestion("Is the other person claiming the EIC on the child?", "eicOtherClaimingEIC", "eicOtherClaimingEIC")}
            {radioQuestion("If tiebreaker rules applied, would the child be treated as your qualifying child?", "eicTiebreakerApplied", "eicTiebreakerApplied")}
            {radioQuestion("Was your EIC reduced or disallowed for any reason?", "eicReducedOrDisallowed", "eicReducedOrDisallowed")}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Additional Note</label>
              <textarea translate="no" rows={2} value={formData.eicAdditionalNote} onChange={update("eicAdditionalNote")} className={inputClasses} />
            </div>
          </>
        )}

        {/* ===== STEP 3: Income & Other ===== */}
        {step === 3 && (
          <>
            {sectionTitle("Additional Income Questions")}
            {radioQuestion("Any virtual currency income (Bitcoin, etc.)?", "hasVirtualCurrencyIncome", "hasVirtualCurrencyIncome")}
            {radioQuestion("Do you have foreign bank accounts?", "hasForeignBankAccount", "hasForeignBankAccount")}
            {formData.hasForeignBankAccount === "Yes" && (
              <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-[var(--radius)]">
                Foreign bank accounts must be reported to the US Treasury, IRS, and New York State.
              </p>
            )}
            {radioQuestion("Do you have income from rental property?", "hasRentalProperty", "hasRentalProperty")}

            {sectionTitle("College Expenses")}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Books and Supplies Expenses</label>
              <input translate="no" type="text" value={formData.collegeExpenses} onChange={update("collegeExpenses")} placeholder="$" className={inputClasses} />
            </div>

            {sectionTitle("Business Information (Sole Proprietorship / Single Member LLC)")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Business Name</label>
                <input translate="no" type="text" value={formData.businessName} onChange={update("businessName")} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Business Tax ID (EIN)</label>
                <input translate="no" type="text" value={formData.businessEIN} onChange={update("businessEIN")} className={inputClasses} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Business Address</label>
              <input translate="no" type="text" value={formData.businessAddress} onChange={update("businessAddress")} className={inputClasses} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Total Sales or Revenue</label>
              <input translate="no" type="text" value={formData.totalSalesOrRevenue} onChange={update("totalSalesOrRevenue")} placeholder="$" className={inputClasses} />
            </div>
            <div>
              <p className="block text-sm font-medium text-[var(--text)] mb-2">Type of Business</p>
              <div className="flex flex-wrap gap-4">
                {businessTypeOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
                    <input translate="no" type="radio" name="businessType" value={opt} checked={formData.businessType === opt} onChange={update("businessType")} className="text-[var(--blue-accent)] focus:ring-[var(--blue-accent)]" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {sectionTitle("Auto Expenses (If Charge Per Mileage)")}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Business Miles</label>
                <input translate="no" type="text" value={formData.businessMiles} onChange={update("businessMiles")} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Personal Miles</label>
                <input translate="no" type="text" value={formData.personalMiles} onChange={update("personalMiles")} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Total Miles</label>
                <input translate="no" type="text" value={formData.totalMiles} onChange={update("totalMiles")} className={inputClasses} />
              </div>
            </div>
          </>
        )}

        {/* ===== STEP 4: Deductions ===== */}
        {step === 4 && (
          <>
            {sectionTitle("Itemized Deductions (Schedule A)")}
            {radioQuestion("Did you itemize deductions in previous year?", "itemizedPrior", "itemizedDeductionsPriorYear")}
            {radioQuestion("Do you receive NYS Dept. of Finance Refund Notice (1099G)?", "nysRefund", "nysRefundNotice")}

            {sectionTitle("Home Expenses (Personal Use)")}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Mortgage Premium Insurance</label>
                <input translate="no" type="text" value={formData.mortgagePremiumInsurance} onChange={update("mortgagePremiumInsurance")} placeholder="$" className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Mortgage Interest</label>
                <input translate="no" type="text" value={formData.mortgageInterest} onChange={update("mortgageInterest")} placeholder="$" className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Real Estate Taxes</label>
                <input translate="no" type="text" value={formData.realEstateTaxes} onChange={update("realEstateTaxes")} placeholder="$" className={inputClasses} />
              </div>
            </div>

            {sectionTitle("Medical Expenses")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Medical Insurance</label>
                <input translate="no" type="text" value={formData.medicalInsurance} onChange={update("medicalInsurance")} placeholder="$" className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Doctors Co-Pays</label>
                <input translate="no" type="text" value={formData.doctorsCoPays} onChange={update("doctorsCoPays")} placeholder="$" className={inputClasses} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Prescriptions</label>
                <input translate="no" type="text" value={formData.prescriptions} onChange={update("prescriptions")} placeholder="$" className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Eyeglasses / Contacts</label>
                <input translate="no" type="text" value={formData.eyeglassesContacts} onChange={update("eyeglassesContacts")} placeholder="$" className={inputClasses} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Medical Supplies</label>
                <input translate="no" type="text" value={formData.medicalSupplies} onChange={update("medicalSupplies")} placeholder="$" className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Medical Travel</label>
                <input translate="no" type="text" value={formData.medicalTravel} onChange={update("medicalTravel")} placeholder="$" className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Other Medical Expenses</label>
                <input translate="no" type="text" value={formData.otherMedicalExpenses} onChange={update("otherMedicalExpenses")} placeholder="$" className={inputClasses} />
              </div>
            </div>
          </>
        )}

        {/* ===== STEP 5: Bank Info & Submit ===== */}
        {step === 5 && (
          <>
            {sectionTitle("Refund Direct Deposit Information")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Bank Routing # <span className="text-red-500">*</span>
                </label>
                <input translate="no" type="text" required value={formData.bankRoutingNumber} onChange={update("bankRoutingNumber")} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Bank Account # <span className="text-red-500">*</span>
                </label>
                <input translate="no" type="text" required value={formData.bankAccountNumber} onChange={update("bankAccountNumber")} className={inputClasses} />
              </div>
            </div>

            {sectionTitle("Additional Notes")}
            <textarea translate="no" rows={3} value={formData.additionalNotes} onChange={update("additionalNotes")} placeholder="Any additional information..." className={inputClasses} />

            <div className="rounded-[var(--radius)] bg-amber-50 p-4 text-xs text-amber-900 space-y-2">
              <p className="font-semibold">Important Notice</p>
              <p>
                If you are self-employed and claiming the earned income credit, you may be asked by the
                government to show proof of income before your refund is released. Keep good records
                including bank accounts, ledgers, and client lists.
              </p>
              <p>
                The information provided in this document is true and accurate, to the best of the
                taxpayer&apos;s knowledge. Deliberate misstatements included in income tax forms are tax
                fraud and a federal crime.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input translate="no"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 rounded border-[var(--border)] text-[var(--blue-accent)] focus:ring-[var(--blue-accent)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">
                I&apos;ve read and accept the terms and conditions. The information I provided is true
                and accurate to the best of my knowledge.
              </span>
            </label>
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
            <Button type="submit" size="lg" className="flex-1" disabled={submitting || !termsAccepted}>
              {submitting ? "Submitting..." : "Submit Questionnaire"}
            </Button>
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)] text-center">
          After submitting, please book an appointment with one of our expert tax advisors.
        </p>
      </form>
    </Card>
  );
}
