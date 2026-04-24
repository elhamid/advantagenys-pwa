import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSection } from "@/components/seo/FAQSection";
import { PerServiceReviews } from "@/components/home/PerServiceReviews";
import { getServiceFAQs } from "@/lib/chat/get-faqs";
import { makeCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Business Insurance in Queens, NYC | Advantage Services",
  description:
    "Business insurance for Queens, NYC small businesses. General liability, workers compensation, and disability insurance. Licensed broker with competitive rates. Advantage Services.",
  alternates: { canonical: makeCanonical("/services/insurance") },
};

const insuranceTypes = [
  {
    name: "General Liability Insurance",
    description:
      "Protects your business against claims of bodily injury, property damage, and personal injury. Required by most commercial leases, contracts, and licensing agencies. We shop multiple carriers to find competitive rates for your industry.",
    whoNeeds: "Every business — especially contractors, restaurants, and retail stores",
    covers: [
      "Bodily injury to third parties",
      "Property damage claims",
      "Personal and advertising injury",
      "Medical payments",
      "Legal defense costs",
    ],
  },
  {
    name: "Workers Compensation Insurance",
    description:
      "New York State requires workers compensation coverage for virtually all employers — even those with just one employee. This policy covers medical expenses and lost wages if an employee is injured on the job. Failure to carry workers comp is a criminal offense in New York.",
    whoNeeds: "Any business with employees (required by NYS law)",
    covers: [
      "Employee medical expenses from work injuries",
      "Lost wages during recovery",
      "Disability benefits",
      "Death benefits",
      "Employer legal defense",
    ],
  },
  {
    name: "Disability Insurance (DBL)",
    description:
      "New York State Disability Benefits Law requires employers to provide disability insurance covering off-the-job injuries and illnesses. This is separate from workers compensation and covers situations where employees cannot work due to non-work-related conditions.",
    whoNeeds: "Any business with employees (required by NYS law)",
    covers: [
      "Off-the-job injury or illness",
      "Pregnancy-related disability",
      "Partial wage replacement",
      "Up to 26 weeks of benefits",
      "Paid Family Leave (PFL) integration",
    ],
  },
];

const PAGE_FAQS = [
  {
    question: "Is workers compensation insurance required in New York State?",
    answer:
      "Yes. New York State requires virtually all employers — including those with just one employee — to carry workers compensation insurance. Failure to maintain coverage is a criminal offense and can result in fines, stop-work orders, and personal liability for any workplace injuries. Coverage must be in place before your first employee starts work.",
  },
  {
    question: "What is the difference between workers compensation and disability insurance in NY?",
    answer:
      "Workers compensation covers employees who are injured or become ill because of their job — on-the-job incidents. New York State Disability Benefits Law (DBL) is a separate requirement that covers employees who cannot work due to off-the-job injuries or illnesses, including pregnancy-related conditions. Both are required by state law for businesses with employees, and both need to be in place separately.",
  },
  {
    question: "Do I need general liability insurance if I already have workers comp?",
    answer:
      "Yes. Workers compensation only covers your employees. General liability insurance protects your business against third-party claims — bodily injury to a customer or visitor, property damage you cause, and advertising injury. Most commercial leases, contracts, and licensing agencies require proof of general liability coverage. The two policies serve completely different purposes.",
  },
  {
    question: "How much does business insurance typically cost for a small business in NYC?",
    answer:
      "Rates vary significantly by industry, employee count, annual payroll, and claims history. A general liability policy for a low-risk retail business may be relatively affordable annually, while contractors or restaurants with higher exposure will pay more. Workers comp rates are calculated per $100 of payroll and vary by employee classification code. We shop multiple carriers to find competitive rates for your specific industry and profile.",
  },
  {
    question: "What makes Advantage different from buying insurance online?",
    answer:
      "When you buy insurance online, you are on your own when audit time comes. We provide your coverage and defend you when the workers comp carrier audits your payroll classifications. Because we also handle your payroll, tax records, and business filings, we already have the documentation needed to challenge overcharges. That combination of coverage plus audit defense is something direct insurers and online brokers do not offer.",
  },
];

export default async function InsurancePage() {
  const dbFaqs = await getServiceFAQs("insurance");
  const faqs = dbFaqs.length > 0 ? dbFaqs : PAGE_FAQS;
  return (
    <>
      <JsonLd
        type="Service"
        serviceName="Business Insurance"
        serviceDescription="Business insurance for NYC small businesses. General liability, workers compensation, and disability insurance. Licensed broker with competitive rates."
        serviceUrl="https://advantagenys.com/services/insurance"
      />
      <JsonLd
        type="BreadcrumbList"
        items={[
          { name: "Home", url: "https://advantagenys.com" },
          { name: "Services", url: "https://advantagenys.com/services" },
          { name: "Insurance", url: "https://advantagenys.com/services/insurance" },
        ]}
      />
      {/* Hero */}
      <section className="py-20 bg-[var(--blue-bg)]">
        <Container>
          <Badge className="mb-4">Licensed Insurance Broker</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-6 max-w-3xl">
            Business Insurance That Protects What You Have Built
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mb-8">
            As a licensed insurance broker, we shop multiple carriers to find
            the right coverage at competitive rates. General liability, workers
            compensation, and disability — the policies every New York business
            needs.
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-3">{PHONE.main} &middot; Call or WhatsApp</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button href="/contact" size="lg">
              Get a Quote
            </Button>
            <Button href={PHONE.whatsappLink} variant="outline" size="lg">
              WhatsApp Us
            </Button>
          </div>
        </Container>
      </section>

      {/* Why insurance through us */}
      <section className="py-16">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">
            Why Get Insurance Through Advantage?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Broker, Not Agent
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                An insurance agent represents one company. A broker represents
                you. We compare policies across multiple carriers to find the
                best coverage and price for your situation.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Bundled with Compliance
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                We handle your licensing, formation, and tax — so we know
                exactly what coverage your business requires. No gaps, no
                over-insuring.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Audit Support
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                When your workers comp audit arrives, we do not disappear. Our
                audit defense team fights to reduce overcharges and penalties.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Insurance Types */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">
            Coverage We Provide
          </h2>
          <div className="space-y-8">
            {insuranceTypes.map((insurance) => (
              <Card key={insurance.name}>
                <h3 className="text-xl font-bold text-[var(--text)] mb-3">
                  {insurance.name}
                </h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  {insurance.description}
                </p>
                <p className="text-sm font-medium text-[var(--blue-accent)] mb-4">
                  Who needs it: {insurance.whoNeeds}
                </p>
                <p className="text-sm font-semibold text-[var(--text)] mb-2">
                  What it covers:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {insurance.covers.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
                    >
                      <span className="text-[var(--green)] mt-0.5">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* NYS Requirements */}
      <section className="py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--text)] mb-6 text-center">
              New York State Requirements
            </h2>
            <Card className="border-2 border-[var(--gold)]">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
                If you have employees in New York, you must carry:
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge variant="warning">Required</Badge>
                  <div>
                    <p className="font-medium text-[var(--text)]">
                      Workers Compensation Insurance
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Failure to carry workers comp is a criminal misdemeanor in
                      New York. Penalties include fines of $2,000 per 10-day
                      period of non-compliance and potential jail time.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="warning">Required</Badge>
                  <div>
                    <p className="font-medium text-[var(--text)]">
                      Disability Benefits (DBL)
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Required for all employers with one or more employees.
                      Covers off-the-job injuries and illnesses, including
                      pregnancy-related disability.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge>Recommended</Badge>
                  <div>
                    <p className="font-medium text-[var(--text)]">
                      General Liability Insurance
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Not legally required in all cases, but required by most
                      commercial leases, contracts, and licensing agencies.
                      Effectively mandatory for operating businesses.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Cross-sell */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6 text-center">
            Related Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link href="/services/audit-defense/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Audit Defense
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Workers comp audit overcharges? We fight to reduce fines and
                  get money back.
                </p>
              </Card>
            </Link>
            <Link href="/services/licensing/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Licensing
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Most licenses require proof of insurance. We handle both
                  together.
                </p>
              </Card>
            </Link>
            <Link href="/services/business-formation/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Business Formation
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Starting a new business? We set up your entity and insurance
                  in one visit.
                </p>
              </Card>
            </Link>
          </div>
        </Container>
      </section>

      <PerServiceReviews segment="insurance" />

      {/* CTA */}
      <section className="py-16">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
              Get the Right Coverage at the Right Price
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Tell us about your business and we will shop multiple carriers for
              competitive quotes. Free consultation, no obligation.
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-3">{PHONE.main} &middot; Call or WhatsApp</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/contact" size="lg">
                Get Insurance Quote
              </Button>
              <Button href={PHONE.whatsappLink} variant="secondary" size="lg">
                WhatsApp Us
              </Button>
            </div>
          </div>
          <FAQSection faqs={faqs} title="Frequently asked questions" />
        </Container>
      </section>
    </>
  );
}
