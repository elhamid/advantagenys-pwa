"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";
import { useUtmParams } from "@/hooks/useUtmParams";
import { toolComplete } from "@/lib/analytics/events";

/* ---------- flow types ---------- */
type Answer = "yes" | "no" | null;
type Outcome = "eligible" | "not-eligible-citizen" | "not-eligible-ssn" | "may-not-need" | null;

/* ---------- questions ---------- */
const questionFlow = [
  {
    id: "citizen",
    text: "Are you a US citizen or permanent resident (green card holder)?",
    helpText: "US citizens and permanent residents use their Social Security Number for taxes.",
    yesOutcome: "not-eligible-citizen" as Outcome,
    noOutcome: null as Outcome, // continue
  },
  {
    id: "tax-filing",
    text: "Do you need to file a US tax return or claim tax treaty benefits?",
    helpText: "Common reasons include earning income in the US, owning property, or having bank accounts.",
    yesOutcome: null as Outcome, // continue
    noOutcome: "may-not-need" as Outcome,
  },
  {
    id: "ssn",
    text: "Do you already have a Social Security Number (SSN)?",
    helpText: "If you have an SSN, you should use it for tax filing instead of an ITIN.",
    yesOutcome: "not-eligible-ssn" as Outcome,
    noOutcome: "eligible" as Outcome,
  },
];

/* ---------- outcome configs ---------- */
const outcomes: Record<string, { icon: string; title: string; description: string; color: string }> = {
  eligible: {
    icon: "\u2705",
    title: "You Likely Qualify for an ITIN!",
    description:
      "Based on your answers, you appear to be eligible for an Individual Taxpayer Identification Number. Our IRS Certified Acceptance Agent can help you apply quickly and correctly.",
    color: "var(--green)",
  },
  "not-eligible-citizen": {
    icon: "\u{1F4CB}",
    title: "You Don\u2019t Need an ITIN",
    description:
      "As a US citizen or permanent resident, you should use your Social Security Number (SSN) for tax filing. If you don\u2019t have an SSN, you may need to apply with the Social Security Administration first.",
    color: "var(--blue-accent)",
  },
  "not-eligible-ssn": {
    icon: "\u{1F4CB}",
    title: "Use Your SSN Instead",
    description:
      "Since you already have a Social Security Number, you should use it for your tax filing. ITINs are for people who need to file taxes but aren\u2019t eligible for an SSN.",
    color: "var(--blue-accent)",
  },
  "may-not-need": {
    icon: "\u{1F914}",
    title: "You May Not Need an ITIN Right Now",
    description:
      "ITINs are primarily for people who need to file US tax returns. However, there are other situations where an ITIN could be useful. Let us help determine your specific situation.",
    color: "var(--amber)",
  },
};

/* ---------- JSON-LD ---------- */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ITIN Eligibility Checker",
  description:
    "Free ITIN eligibility checker. Find out if you qualify for an Individual Taxpayer Identification Number. IRS Certified Acceptance Agent in Queens, NYC.",
  url: "https://advantagenys.com/tools/itin-eligibility-checker",
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
export default function ItinEligibilityChecker() {
  const utm = useUtmParams();
  const [currentQ, setCurrentQ] = useState(0);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [showGate, setShowGate] = useState(false);
  const [leadForm, setLeadForm] = useState({ fullName: "", phone: "" });
  const [captured, setCaptured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  const totalQuestions = questionFlow.length;

  function handleAnswer(value: "yes" | "no") {
    const q = questionFlow[currentQ];
    setAnswers((prev) => ({ ...prev, [q.id]: value }));

    const resultOutcome = value === "yes" ? q.yesOutcome : q.noOutcome;

    if (resultOutcome) {
      setOutcome(resultOutcome);
      setShowGate(true);
    } else if (currentQ < totalQuestions - 1) {
      setCurrentQ(currentQ + 1);
    }
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          source: "tool-itin-eligibility",
          fullName: leadForm.fullName,
          phone: leadForm.phone,
          message: `ITIN Eligibility: ${outcome}. Answers: ${JSON.stringify(answers)}`,
          utm: Object.keys(utm).length > 0 ? utm : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong.");
      }
      toolComplete("itin-eligibility-checker");
      setCaptured(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const result = outcome ? outcomes[outcome] : null;
  const answeredCount = Object.keys(answers).length;

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
              ITIN Eligibility Checker
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Answer a few quick questions to find out if you qualify for an
              Individual Taxpayer Identification Number.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-[var(--text-muted)] mb-2">
                <span>
                  Question {Math.min(currentQ + 1, totalQuestions)} of {totalQuestions}
                </span>
                <span>
                  {Math.round((Math.min(answeredCount, totalQuestions) / totalQuestions) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--blue-accent)] rounded-full transition-all duration-500"
                  style={{
                    width: `${(Math.min(answeredCount, totalQuestions) / totalQuestions) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Questions */}
            {!showGate && currentQ < totalQuestions && (
              <Card>
                <h2 className="text-xl font-bold text-[var(--text)] mb-2">
                  {questionFlow[currentQ].text}
                </h2>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  {questionFlow[currentQ].helpText}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAnswer("yes")}
                    className="px-6 py-4 rounded-[var(--radius-lg)] border-2 border-[var(--border)] hover:border-[var(--blue-accent)] hover:bg-[var(--blue-bg)] transition-all text-center cursor-pointer"
                  >
                    <span className="block text-2xl mb-1">Yes</span>
                    <span className="text-sm text-[var(--text-muted)]">That applies to me</span>
                  </button>
                  <button
                    onClick={() => handleAnswer("no")}
                    className="px-6 py-4 rounded-[var(--radius-lg)] border-2 border-[var(--border)] hover:border-[var(--blue-accent)] hover:bg-[var(--blue-bg)] transition-all text-center cursor-pointer"
                  >
                    <span className="block text-2xl mb-1">No</span>
                    <span className="text-sm text-[var(--text-muted)]">That does not apply</span>
                  </button>
                </div>
                {currentQ > 0 && (
                  <button
                    onClick={() => {
                      const prevQ = questionFlow[currentQ - 1];
                      setAnswers((prev) => {
                        const next = { ...prev };
                        delete next[prevQ.id];
                        return next;
                      });
                      setCurrentQ(currentQ - 1);
                    }}
                    className="mt-4 text-sm text-[var(--text-muted)] hover:text-[var(--blue-accent)] cursor-pointer"
                  >
                    &larr; Back
                  </button>
                )}
              </Card>
            )}

            {/* Lead Gate */}
            {showGate && !captured && result && (
              <Card>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">{result.icon}</div>
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{ color: result.color }}
                  >
                    {result.title}
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    {result.description}
                  </p>
                </div>

                {outcome === "eligible" || outcome === "may-not-need" ? (
                  <>
                    <div className="bg-[var(--blue-bg)] rounded-[var(--radius-lg)] p-4 mb-6">
                      <p className="text-sm text-[var(--text-secondary)] text-center">
                        Enter your details and our IRS Certified Acceptance Agent
                        will contact you for a free ITIN consultation.
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

                      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                        {submitting ? "Sending..." : "Get Free ITIN Consultation"}
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-[var(--text-secondary)] mb-4">
                        Still have questions? We can help determine the best path
                        for your situation.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button href="/contact" size="md">
                          Free Consultation
                        </Button>
                        <Button href={`tel:${PHONE.mainTel}`} variant="outline" size="md">
                          Call {PHONE.main}
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-[var(--border)] pt-4">
                      <p className="text-sm text-[var(--text-muted)] text-center">
                        Need help with other tax services?{" "}
                        <Link
                          href="/services/tax-services/"
                          className="text-[var(--blue-accent)] hover:underline"
                        >
                          View our tax services &rarr;
                        </Link>
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setOutcome(null);
                    setShowGate(false);
                    // Go back to the question that triggered the outcome
                    const lastQ = questionFlow[currentQ];
                    setAnswers((prev) => {
                      const next = { ...prev };
                      delete next[lastQ.id];
                      return next;
                    });
                  }}
                  className="mt-4 text-sm text-[var(--text-muted)] hover:text-[var(--blue-accent)] cursor-pointer block mx-auto"
                >
                  &larr; Change my answer
                </button>
              </Card>
            )}

            {/* Post-Capture (eligible / may-not-need) */}
            {captured && result && (
              <div className="space-y-6">
                <Card className="text-center">
                  <div className="text-5xl mb-3">{"\u{1F389}"}</div>
                  <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
                    Thank You, {leadForm.fullName}!
                  </h2>
                  <p className="text-[var(--text-secondary)] mb-6">
                    Our IRS Certified Acceptance Agent will contact you within 1
                    business day to discuss your ITIN application.
                  </p>

                  <div className="bg-[var(--blue-bg)] rounded-[var(--radius-lg)] p-6 mb-6 text-left">
                    <h3 className="font-semibold text-[var(--text)] mb-3">What to Expect</h3>
                    <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--blue-accent)] shrink-0">1.</span>
                        We will review your eligibility and documents needed
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--blue-accent)] shrink-0">2.</span>
                        As a Certified Acceptance Agent, we verify your identity documents in-office (no need to mail originals to the IRS)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--blue-accent)] shrink-0">3.</span>
                        We prepare and submit your W-7 application to the IRS
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--blue-accent)] shrink-0">4.</span>
                        Typical processing: 4-6 weeks after submission
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button href="/resources/forms/itin-registration-form/" size="md">
                      Start ITIN Application
                    </Button>
                    <Button href="/services/tax-services/" variant="outline" size="md">
                      All Tax Services
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
