"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";

/* ---------- types ---------- */
type FilingStatus = "individual" | "sole-prop" | "llc" | "s-corp" | "c-corp";
type RevenueRange = "under-50k" | "50k-100k" | "100k-250k" | "250k-500k" | "500k-plus";
type DeductionAwareness = "yes" | "no" | "not-sure";

interface LeadForm {
  fullName: string;
  phone: string;
  email: string;
}

/* ---------- option configs ---------- */
const filingOptions: { value: FilingStatus; label: string }[] = [
  { value: "individual", label: "Individual (W-2 / 1099)" },
  { value: "sole-prop", label: "Sole Proprietor" },
  { value: "llc", label: "LLC" },
  { value: "s-corp", label: "S-Corporation" },
  { value: "c-corp", label: "C-Corporation" },
];

const revenueOptions: { value: RevenueRange; label: string; midpoint: number }[] = [
  { value: "under-50k", label: "Under $50,000", midpoint: 30000 },
  { value: "50k-100k", label: "$50,000 \u2013 $100,000", midpoint: 75000 },
  { value: "100k-250k", label: "$100,000 \u2013 $250,000", midpoint: 175000 },
  { value: "250k-500k", label: "$250,000 \u2013 $500,000", midpoint: 375000 },
  { value: "500k-plus", label: "$500,000+", midpoint: 650000 },
];

const deductionOptions: { value: DeductionAwareness; label: string }[] = [
  { value: "yes", label: "Yes \u2014 I track and claim deductions" },
  { value: "no", label: "No \u2014 I don\u2019t claim any" },
  { value: "not-sure", label: "Not sure" },
];

/* ---------- savings calculator ---------- */
function calculateSavings(
  filing: FilingStatus,
  revenue: RevenueRange,
  deductions: DeductionAwareness
) {
  const revOpt = revenueOptions.find((r) => r.value === revenue)!;
  const income = revOpt.midpoint;

  let lowPct = 0;
  let highPct = 0;
  let recommendation = "";
  const tips: string[] = [];

  // Structure upgrade savings
  if (filing === "individual" || filing === "sole-prop") {
    lowPct = 0.05;
    highPct = 0.15;
    recommendation = "Forming an LLC could protect your personal assets and open up tax deductions.";
    tips.push("LLC formation separates personal and business liability");
    tips.push("Pass-through taxation avoids double taxation");

    if (income > 50000) {
      lowPct = 0.1;
      highPct = 0.25;
      recommendation =
        "At your revenue level, an S-Corp election could significantly reduce self-employment tax.";
      tips.push("S-Corp lets you split income between salary and distributions");
      tips.push("Distributions are not subject to self-employment tax (15.3%)");
    }
  } else if (filing === "llc") {
    if (income > 50000) {
      lowPct = 0.1;
      highPct = 0.25;
      recommendation =
        "Your LLC may benefit from an S-Corp election to reduce self-employment tax.";
      tips.push("S-Corp election can save 10-25% on self-employment taxes");
    } else {
      lowPct = 0.03;
      highPct = 0.08;
      recommendation =
        "Your LLC structure is solid. We can optimize your deductions strategy.";
    }
    tips.push("Ensure you\u2019re maximizing home office and vehicle deductions");
  } else if (filing === "s-corp") {
    lowPct = 0.02;
    highPct = 0.08;
    recommendation =
      "Your S-Corp structure is tax-efficient. We can fine-tune your salary-to-distribution ratio.";
    tips.push("Optimizing reasonable salary splits can save thousands");
    tips.push("Retirement plan contributions reduce taxable income");
  } else {
    lowPct = 0.02;
    highPct = 0.06;
    recommendation =
      "C-Corps have unique tax planning opportunities we can explore.";
    tips.push("Qualified Small Business Stock (QSBS) exclusion");
    tips.push("Section 199A deduction planning");
  }

  // Additional deduction savings
  if (deductions === "no" || deductions === "not-sure") {
    lowPct += 0.05;
    highPct += 0.1;
    tips.push("You may be missing common deductions: home office, vehicle, equipment, meals");
    tips.push("Proper bookkeeping could uncover thousands in overlooked deductions");
  }

  const lowSavings = Math.round(income * lowPct);
  const highSavings = Math.round(income * highPct);

  return { lowSavings, highSavings, recommendation, tips };
}

/* ---------- JSON-LD ---------- */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tax Savings Estimator",
  description:
    "Free tax savings calculator for small businesses in Queens, NYC. Estimate potential savings from LLC, S-Corp, and deduction optimization.",
  url: "https://advantagenys.com/tools/tax-savings-estimator",
  applicationCategory: "BusinessApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: {
    "@type": "LocalBusiness",
    name: "Advantage Services",
    address: {
      "@type": "PostalAddress",
      streetAddress: "229-14 Linden Blvd",
      addressLocality: "Cambria Heights",
      addressRegion: "NY",
      postalCode: "11411",
    },
  },
};

/* ---------- component ---------- */
export default function TaxSavingsEstimator() {
  const [step, setStep] = useState(1);
  const [filing, setFiling] = useState<FilingStatus | null>(null);
  const [revenue, setRevenue] = useState<RevenueRange | null>(null);
  const [deductions, setDeductions] = useState<DeductionAwareness | null>(null);
  const [leadForm, setLeadForm] = useState<LeadForm>({ fullName: "", phone: "", email: "" });
  const [captured, setCaptured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 3;

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: leadForm.fullName,
          phone: leadForm.phone,
          email: leadForm.email,
          source: "tax-estimator",
          serviceType: "tax",
          message: `Tax Estimator: ${filing}, revenue ${revenue}, deductions awareness: ${deductions}`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong.");
      }
      setCaptured(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const results =
    filing && revenue && deductions
      ? calculateSavings(filing, revenue, deductions)
      : null;

  const inputClasses =
    "w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-accent)] focus:border-transparent transition-all";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-20 bg-[var(--blue-bg)]">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Link
              href="/tools"
              className="text-sm text-[var(--blue-accent)] hover:underline mb-4 inline-block"
            >
              &larr; All Tools
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-4">
              Tax Savings Estimator
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Answer 3 quick questions to see how much you could save with the
              right business structure and tax strategy.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="max-w-2xl mx-auto">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-[var(--text-muted)] mb-2">
                <span>Step {Math.min(step, totalSteps)} of {totalSteps}</span>
                <span>{Math.round((Math.min(step, totalSteps) / totalSteps) * 100)}%</span>
              </div>
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--blue-accent)] rounded-full transition-all duration-500"
                  style={{ width: `${(Math.min(step, totalSteps) / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Step 1: Filing Status */}
            {step === 1 && (
              <Card>
                <h2 className="text-xl font-bold text-[var(--text)] mb-2">
                  What is your current filing status?
                </h2>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  Select the structure that best describes how you file taxes today.
                </p>
                <div className="space-y-3">
                  {filingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setFiling(opt.value); setStep(2); }}
                      className={`w-full text-left px-5 py-4 rounded-[var(--radius-lg)] border-2 transition-all cursor-pointer ${
                        filing === opt.value
                          ? "border-[var(--blue-accent)] bg-[var(--blue-bg)]"
                          : "border-[var(--border)] hover:border-[var(--blue-soft)] hover:bg-[var(--blue-bg)]/50"
                      }`}
                    >
                      <span className="font-medium text-[var(--text)]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Step 2: Revenue */}
            {step === 2 && (
              <Card>
                <h2 className="text-xl font-bold text-[var(--text)] mb-2">
                  What is your approximate annual revenue?
                </h2>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  This helps us estimate your potential tax savings.
                </p>
                <div className="space-y-3">
                  {revenueOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setRevenue(opt.value); setStep(3); }}
                      className={`w-full text-left px-5 py-4 rounded-[var(--radius-lg)] border-2 transition-all cursor-pointer ${
                        revenue === opt.value
                          ? "border-[var(--blue-accent)] bg-[var(--blue-bg)]"
                          : "border-[var(--border)] hover:border-[var(--blue-soft)] hover:bg-[var(--blue-bg)]/50"
                      }`}
                    >
                      <span className="font-medium text-[var(--text)]">{opt.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="mt-4 text-sm text-[var(--text-muted)] hover:text-[var(--blue-accent)] cursor-pointer"
                >
                  &larr; Back
                </button>
              </Card>
            )}

            {/* Step 3: Deductions */}
            {step === 3 && (
              <Card>
                <h2 className="text-xl font-bold text-[var(--text)] mb-2">
                  Do you currently track and claim business deductions?
                </h2>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  Deductions like home office, vehicle, equipment, and meals can significantly reduce your tax bill.
                </p>
                <div className="space-y-3">
                  {deductionOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setDeductions(opt.value); setStep(4); }}
                      className={`w-full text-left px-5 py-4 rounded-[var(--radius-lg)] border-2 transition-all cursor-pointer ${
                        deductions === opt.value
                          ? "border-[var(--blue-accent)] bg-[var(--blue-bg)]"
                          : "border-[var(--border)] hover:border-[var(--blue-soft)] hover:bg-[var(--blue-bg)]/50"
                      }`}
                    >
                      <span className="font-medium text-[var(--text)]">{opt.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="mt-4 text-sm text-[var(--text-muted)] hover:text-[var(--blue-accent)] cursor-pointer"
                >
                  &larr; Back
                </button>
              </Card>
            )}

            {/* Step 4: Lead Gate or Results */}
            {step === 4 && results && !captured && (
              <Card>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">{"\u{1F4B0}"}</div>
                  <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
                    Your Estimated Savings
                  </h2>
                  <div className="text-4xl font-bold text-[var(--green)] mb-1">
                    ${results.lowSavings.toLocaleString()} &ndash; ${results.highSavings.toLocaleString()}
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">potential annual savings</p>
                </div>

                <div className="bg-[var(--blue-bg)] rounded-[var(--radius-lg)] p-4 mb-6">
                  <p className="text-sm text-[var(--text-secondary)] text-center">
                    Enter your details to get your personalized tax savings report
                    with specific recommendations for your situation.
                  </p>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-[var(--text)] mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      required
                      value={leadForm.fullName}
                      onChange={(e) => setLeadForm((p) => ({ ...p, fullName: e.target.value }))}
                      placeholder="Your full name"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-[var(--text)] mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="(929) 000-0000"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-1">
                      Email <span className="text-[var(--text-muted)]">(optional)</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
                      className={inputClasses}
                    />
                  </div>

                  {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? "Sending..." : "Get My Full Report"}
                  </Button>
                </form>

                <button
                  onClick={() => setStep(3)}
                  className="mt-4 text-sm text-[var(--text-muted)] hover:text-[var(--blue-accent)] cursor-pointer block mx-auto"
                >
                  &larr; Back
                </button>
              </Card>
            )}

            {/* Full Results (after capture) */}
            {step === 4 && results && captured && (
              <div className="space-y-6">
                <Card>
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">{"\u{1F389}"}</div>
                    <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
                      Your Tax Savings Report
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">
                      Thank you, {leadForm.fullName}! Here are your results.
                    </p>
                  </div>

                  <div className="bg-[var(--blue-bg)] rounded-[var(--radius-lg)] p-6 mb-6 text-center">
                    <p className="text-sm text-[var(--text-muted)] mb-1">Estimated Annual Savings</p>
                    <div className="text-4xl font-bold text-[var(--green)]">
                      ${results.lowSavings.toLocaleString()} &ndash; ${results.highSavings.toLocaleString()}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-[var(--text)] mb-2">Our Recommendation</h3>
                    <p className="text-[var(--text-secondary)]">{results.recommendation}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[var(--text)] mb-3">Key Opportunities</h3>
                    <ul className="space-y-2">
                      {results.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                          <span className="text-[var(--green)] mt-0.5 shrink-0">{"\u2713"}</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>

                <Card className="text-center">
                  <h3 className="text-lg font-bold text-[var(--text)] mb-2">
                    Ready to Start Saving?
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Book a free consultation and we will create a personalized
                    tax strategy for your business.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button href="/contact" size="md">
                      Book Free Consultation
                    </Button>
                    <Button href={`tel:${PHONE.mainTel}`} variant="outline" size="md">
                      Call {PHONE.main}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
