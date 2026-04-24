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
  title: "Audit Defense in Queens, NYC | Advantage Services",
  description:
    "Workers comp audit defense, sales tax audit representation, and fine reduction in Queens, NYC. Unemployment insurance audit defense for NYC businesses. Advantage Services.",
  alternates: { canonical: makeCanonical("/services/audit-defense") },
};

const auditTypes = [
  {
    name: "Workers Compensation Audit Defense",
    urgency: "high",
    description:
      "Workers comp insurance carriers audit businesses annually to verify payroll classifications and amounts. Misclassifications, unreported subcontractors, and payroll discrepancies can result in massive additional premiums — sometimes tens of thousands of dollars. We review the audit findings, challenge incorrect classifications, and negotiate reductions.",
    targets: "Contractors, restaurants, cleaning companies, any business with employees",
    whatWeDo: [
      "Review audit findings and identify overcharges",
      "Challenge incorrect employee classifications",
      "Document subcontractor relationships with proper certificates",
      "Negotiate premium reductions with the carrier",
      "Represent you in disputes and appeals",
      "Prevent future audit problems with proper record-keeping",
    ],
  },
  {
    name: "Unemployment Insurance (UI) Audit Defense",
    urgency: "high",
    description:
      "The NYS Department of Labor audits businesses to verify proper classification of workers. If the DOL determines your independent contractors are actually employees, you face back-owed unemployment taxes, penalties, and interest — potentially years of liability. We defend your classifications and negotiate settlements.",
    targets: "Businesses using independent contractors or 1099 workers",
    whatWeDo: [
      "Review DOL audit notice and findings",
      "Analyze worker classification under NYS standards",
      "Prepare documentation supporting contractor status",
      "Represent you in DOL hearings",
      "Negotiate penalty reduction and payment plans",
      "Restructure contractor relationships to prevent future issues",
    ],
  },
  {
    name: "Sales Tax Audit + Fine Reduction",
    urgency: "high",
    description:
      "NYS Department of Taxation and Finance sales tax audits can go back three years or more. Auditors use statistical sampling and industry benchmarks to estimate unreported sales. Penalties include interest, civil penalties (up to 25%), and potential fraud penalties. We challenge their methodology and fight to reduce the assessment.",
    targets: "Delis, gas stations, restaurants, retail businesses",
    whatWeDo: [
      "Review audit assessment and methodology",
      "Challenge statistical sampling and estimation methods",
      "Provide documentation to reduce estimated liability",
      "Negotiate penalty and interest abatement",
      "Represent you at conciliation conferences and hearings",
      "Set up installment agreements if balance is owed",
    ],
  },
];

const urgentSteps = [
  {
    title: "Do Not Ignore It",
    description:
      "Audit notices have deadlines. Ignoring them results in default assessments — the government assumes worst-case numbers and you lose your right to dispute.",
  },
  {
    title: "Do Not Respond Without Help",
    description:
      "Anything you say or submit can be used against you. Well-meaning but incorrect responses often make the situation worse. Let us handle communications.",
  },
  {
    title: "Call Us Immediately",
    description:
      "Bring us the notice. We will assess the situation, explain your options, and begin building your defense. Time matters — the sooner we start, the more leverage we have.",
  },
];

export default async function AuditDefensePage() {
  const faqs = await getServiceFAQs("audit");
  return (
    <>
      <JsonLd
        type="Service"
        serviceName="Audit Defense & Fine Reduction"
        serviceDescription="Workers comp audit defense, sales tax audit representation, unemployment insurance audit defense, and fine reduction for NYC businesses."
        serviceUrl="https://advantagenys.com/services/audit-defense"
      />
      <JsonLd
        type="BreadcrumbList"
        items={[
          { name: "Home", url: "https://advantagenys.com" },
          { name: "Services", url: "https://advantagenys.com/services" },
          { name: "Audit Defense", url: "https://advantagenys.com/services/audit-defense" },
        ]}
      />
      {/* Hero */}
      <section className="py-20 bg-[var(--blue-bg)]">
        <Container>
          <Badge variant="warning" className="mb-4">
            High-Value Differentiator
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-6 max-w-3xl">
            Audit Defense and Fine Reduction
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mb-4">
            What other firms will not touch.
          </p>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mb-8">
            Workers comp audits, sales tax audits, unemployment insurance
            audits — these can threaten the survival of your business. We have
            the experience to fight back, challenge incorrect findings, and
            reduce fines by thousands.
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-3">{PHONE.main} &middot; Call or WhatsApp</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button href={`tel:${PHONE.mainTel}`} size="lg">
              Call Now
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Request Urgent Consultation
            </Button>
          </div>
        </Container>
      </section>

      {/* Urgent Notice */}
      <section className="py-16">
        <Container>
          <Card className="border-2 border-[var(--gold)]">
            <div className="text-center mb-8">
              <Badge variant="error" className="mb-3">
                Received an Audit Notice?
              </Badge>
              <h2 className="text-2xl font-bold text-[var(--text)]">
                What to Do If You Receive an Audit Notice
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {urgentSteps.map((step, index) => (
                <div key={step.title}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--blue-accent)] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-[var(--text)]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] ml-11">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-sm text-[var(--text-muted)] mb-3">{PHONE.main}</p>
              <Button href={`tel:${PHONE.mainTel}`}>
                Call Now
              </Button>
            </div>
          </Card>
        </Container>
      </section>

      {/* Audit Types */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">
            Audit Defense Services
          </h2>
          <div className="space-y-8">
            {auditTypes.map((audit) => (
              <Card key={audit.name}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-bold text-[var(--text)]">
                    {audit.name}
                  </h3>
                </div>
                <p className="text-[var(--text-secondary)] mb-4">
                  {audit.description}
                </p>
                <p className="text-sm font-medium text-[var(--blue-accent)] mb-4">
                  Common targets: {audit.targets}
                </p>
                <p className="text-sm font-semibold text-[var(--text)] mb-2">
                  What we do:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {audit.whatWeDo.map((item) => (
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

      {/* Target Verticals */}
      <section className="py-16">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-4 text-center">
            Industries We Defend
          </h2>
          <p className="text-[var(--text-secondary)] text-center max-w-2xl mx-auto mb-10">
            These industries face the highest audit rates in New York. If you
            operate in one of them, you need a team that knows what auditors
            look for.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-[var(--blue-accent)]">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Delis & Bodegas
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Cash-heavy businesses are the top target for sales tax audits.
                Auditors use markup analysis and observation tests to estimate
                unreported sales. We challenge their methodology with your
                actual records.
              </p>
            </Card>
            <Card className="border-l-4 border-l-[var(--blue-accent)]">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Gas Stations
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Gas station audits focus on fuel tax, sales tax on convenience
                store items, and workers comp classifications. The combination
                of multiple tax types makes these audits particularly complex
                and high-stakes.
              </p>
            </Card>
            <Card className="border-l-4 border-l-[var(--blue-accent)]">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Restaurants
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Restaurants face workers comp audits (high employee turnover and
                misclassification), sales tax audits (tip reporting, catering),
                and UI audits (delivery driver classification). We have
                defended hundreds of restaurant owners.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Why Advantage */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">
            Why Businesses Choose Us for Audit Defense
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                We Take What Others Refuse
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Most accounting firms and insurance agencies will not touch
                audit defense. It is complex, time-consuming, and adversarial.
                We specialize in it.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Full-Picture Approach
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Because we handle your insurance, tax, and payroll, we already
                have the records and context needed to build a strong defense.
                No scrambling to reconstruct years of data.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Results-Driven
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                We do not just respond to audits — we fight them. We challenge
                methodologies, dispute classifications, and negotiate
                aggressively. The goal is always to reduce your exposure.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Prevention Built In
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                After resolving your audit, we restructure your record-keeping
                and classifications to prevent the same issues from recurring.
                Better records mean lower audit risk.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Cross-sell */}
      <section className="py-16">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6 text-center">
            Related Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link href="/services/insurance/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Insurance
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Workers comp and general liability coverage from a broker who
                  will defend you when the audit comes.
                </p>
              </Card>
            </Link>
            <Link href="/services/tax-services/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Tax Services
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Proper tax filing reduces audit risk. Our tax team keeps your
                  records audit-ready year-round.
                </p>
              </Card>
            </Link>
            <Link href="/services/business-formation/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Business Formation
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  The right entity structure can reduce your audit exposure.
                  Start with proper setup.
                </p>
              </Card>
            </Link>
          </div>
        </Container>
      </section>

      <PerServiceReviews segment="audit_defense" />

      {/* CTA */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
              Facing an Audit? Do Not Wait.
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Every day you delay reduces your options. Call us now for an
              urgent consultation. We will review your notice and tell you
              exactly where you stand.
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-3">{PHONE.main} &middot; Call or WhatsApp</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href={`tel:${PHONE.mainTel}`} size="lg">
                Call Now
              </Button>
              <Button href={PHONE.whatsappLink} variant="secondary" size="lg">
                WhatsApp Us
              </Button>
            </div>
          </div>
          {faqs.length > 0 && <FAQSection faqs={faqs} />}
        </Container>
      </section>
    </>
  );
}
