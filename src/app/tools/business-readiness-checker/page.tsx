"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";
import { useUtmParams } from "@/hooks/useUtmParams";
import { toolComplete } from "@/lib/analytics/events";

/* ---------- questions ---------- */
const questions = [
  {
    id: "entity",
    text: "Do you have a registered business entity (LLC, Corp, etc.)?",
    helpText: "A registered entity separates your personal assets from business liability.",
    servicePage: "/services/business-formation/",
    serviceLabel: "Business Formation",
    gapLabel: "Register your business entity (LLC or Corp)",
  },
  {
    id: "ein",
    text: "Do you have an EIN (Employer Identification Number)?",
    helpText: "An EIN is required for hiring employees, opening business bank accounts, and filing taxes.",
    servicePage: "/services/business-formation/",
    serviceLabel: "EIN Application",
    gapLabel: "Apply for an EIN from the IRS",
  },
  {
    id: "insurance",
    text: "Do you have business insurance (general liability)?",
    helpText: "General liability insurance protects your business from lawsuits and claims.",
    servicePage: "/services/insurance/",
    serviceLabel: "Business Insurance",
    gapLabel: "Get general liability insurance",
  },
  {
    id: "salestax",
    text: "Are you registered for sales tax (if applicable)?",
    helpText: "Most businesses selling goods or certain services in NY must collect sales tax.",
    servicePage: "/services/tax-services/",
    serviceLabel: "Sales Tax Registration",
    gapLabel: "Register for NY sales tax",
  },
  {
    id: "bankaccount",
    text: "Do you have a separate business bank account?",
    helpText: "Mixing personal and business finances can expose your personal assets to business debts.",
    servicePage: "/services/business-formation/",
    serviceLabel: "Business Setup",
    gapLabel: "Open a dedicated business bank account",
  },
];

/* ---------- scoring ---------- */
type Level = "getting-started" | "almost-there" | "well-prepared";

function getLevel(score: number): { level: Level; label: string; color: string; description: string } {
  if (score <= 1) {
    return {
      level: "getting-started",
      label: "Getting Started",
      color: "var(--red)",
      description: "You have major gaps that could expose you to legal and financial risk. The good news: we can fix everything in one visit.",
    };
  }
  if (score <= 3) {
    return {
      level: "almost-there",
      label: "Almost There",
      color: "var(--amber)",
      description: "You have some key items covered but a few important gaps remain. Let us help you close them.",
    };
  }
  return {
    level: "well-prepared",
    label: "Well Prepared",
    color: "var(--green)",
    description: "You are in great shape! You may have minor optimizations or compliance items to address.",
  };
}

/* ---------- JSON-LD ---------- */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Business Readiness Checker",
  description:
    "Free 5-question assessment to check if your business is properly registered, insured, and compliant in Queens, NYC.",
  url: "https://advantagenys.com/tools/business-readiness-checker",
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
export default function BusinessReadinessChecker() {
  const utm = useUtmParams();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [showGate, setShowGate] = useState(false);
  const [leadForm, setLeadForm] = useState({ fullName: "", phone: "" });
  const [captured, setCaptured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = questions.length;
  const allAnswered = Object.keys(answers).length === totalQuestions;
  const score = Object.values(answers).filter(Boolean).length;

  function handleAnswer(value: boolean) {
    const q = questions[currentQ];
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    if (currentQ < totalQuestions - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowGate(true);
    }
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const gaps = questions.filter((q) => !answers[q.id]).map((q) => q.gapLabel);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          source: "tool-biz-readiness",
          fullName: leadForm.fullName,
          phone: leadForm.phone,
          message: `Business Readiness Score: ${score}/${totalQuestions}. Gaps: ${gaps.join(", ") || "None"}`,
          utm: Object.keys(utm).length > 0 ? utm : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong.");
      }
      toolComplete("business-readiness-checker");
      setCaptured(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const result = allAnswered ? getLevel(score) : null;
  const gaps = questions.filter((q) => !answers[q.id]);

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
              Business Readiness Checker
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Answer 5 quick yes-or-no questions to see if your business is
              properly set up for success.
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
                <span>
                  Question {Math.min(currentQ + 1, totalQuestions)} of {totalQuestions}
                </span>
                <span>
                  {Math.round(
                    (Math.min(Object.keys(answers).length, totalQuestions) / totalQuestions) * 100
                  )}
                  %
                </span>
              </div>
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--blue-accent)] rounded-full transition-all duration-500"
                  style={{
                    width: `${(Math.min(Object.keys(answers).length, totalQuestions) / totalQuestions) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Questions */}
            {!showGate && currentQ < totalQuestions && (
              <Card>
                <h2 className="text-xl font-bold text-[var(--text)] mb-2">
                  {questions[currentQ].text}
                </h2>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  {questions[currentQ].helpText}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAnswer(true)}
                    className="px-6 py-4 rounded-[var(--radius-lg)] border-2 border-[var(--border)] hover:border-[var(--green)] hover:bg-green-50 transition-all text-center cursor-pointer"
                  >
                    <span className="block text-2xl mb-1">{"\u2705"}</span>
                    <span className="font-semibold text-[var(--text)]">Yes</span>
                  </button>
                  <button
                    onClick={() => handleAnswer(false)}
                    className="px-6 py-4 rounded-[var(--radius-lg)] border-2 border-[var(--border)] hover:border-[var(--red)] hover:bg-red-50 transition-all text-center cursor-pointer"
                  >
                    <span className="block text-2xl mb-1">{"\u274C"}</span>
                    <span className="font-semibold text-[var(--text)]">No</span>
                  </button>
                </div>
                {currentQ > 0 && (
                  <button
                    onClick={() => setCurrentQ(currentQ - 1)}
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
                  <div className="text-5xl mb-3">
                    {result.level === "well-prepared"
                      ? "\u{1F31F}"
                      : result.level === "almost-there"
                      ? "\u{1F4CB}"
                      : "\u{1F6A8}"}
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--text)] mb-1">
                    Score: {score} / {totalQuestions}
                  </h2>
                  <p className="font-semibold" style={{ color: result.color }}>
                    {result.label}
                  </p>
                </div>

                <div className="bg-[var(--blue-bg)] rounded-[var(--radius-lg)] p-4 mb-6">
                  <p className="text-sm text-[var(--text-secondary)] text-center">
                    Enter your name and phone number to see your personalized
                    checklist with action items.
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
                    {submitting ? "Sending..." : "See My Checklist"}
                  </Button>
                </form>
              </Card>
            )}

            {/* Full Results */}
            {captured && result && (
              <div className="space-y-6">
                <Card>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[var(--text)] mb-1">
                      Your Business Readiness Report
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">
                      Thank you, {leadForm.fullName}!
                    </p>
                  </div>

                  {/* Score */}
                  <div className="bg-[var(--blue-bg)] rounded-[var(--radius-lg)] p-6 mb-6 text-center">
                    <div className="text-5xl font-bold mb-1" style={{ color: result.color }}>
                      {score}/{totalQuestions}
                    </div>
                    <p className="font-semibold text-lg" style={{ color: result.color }}>
                      {result.label}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      {result.description}
                    </p>
                  </div>

                  {/* Checklist */}
                  <div>
                    <h3 className="font-semibold text-[var(--text)] mb-3">Your Checklist</h3>
                    <ul className="space-y-3">
                      {questions.map((q) => {
                        const passed = answers[q.id];
                        return (
                          <li
                            key={q.id}
                            className={`flex items-start gap-3 p-3 rounded-[var(--radius)] ${
                              passed ? "bg-green-50" : "bg-red-50"
                            }`}
                          >
                            <span className="text-lg shrink-0 mt-0.5">
                              {passed ? "\u2705" : "\u274C"}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[var(--text)]">{q.text}</p>
                              {!passed && (
                                <Link
                                  href={q.servicePage}
                                  className="text-xs text-[var(--blue-accent)] hover:underline mt-1 inline-block"
                                >
                                  Fix this: {q.serviceLabel} &rarr;
                                </Link>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </Card>

                {gaps.length > 0 && (
                  <Card className="text-center">
                    <h3 className="text-lg font-bold text-[var(--text)] mb-2">
                      We Can Fix {gaps.length === 1 ? "This" : "All of These"} for You
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      Our team handles entity formation, EIN applications,
                      insurance, and tax registration every day. One visit and
                      you are fully set up.
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
                )}

                {gaps.length === 0 && (
                  <Card className="text-center">
                    <h3 className="text-lg font-bold text-[var(--text)] mb-2">
                      You are All Set!
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      Your business fundamentals are solid. Want to make sure
                      your taxes are optimized too?
                    </p>
                    <Button href="/tools/tax-savings-estimator" size="md">
                      Try the Tax Savings Estimator &rarr;
                    </Button>
                  </Card>
                )}
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
