import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tax Services",
  description:
    "Business and personal tax preparation, ITIN processing by IRS Certified Acceptance Agent, payroll and sales tax services, and IRS representation for NYC businesses.",
};

const taxServices = [
  {
    name: "Individual Income Tax Filing",
    description:
      "Personal tax preparation for W-2 employees, freelancers, self-employed individuals, and gig workers. We maximize deductions, ensure accuracy, and file on time. Includes federal and state returns.",
    details: [
      "Federal and NY State returns",
      "Schedule C for self-employment",
      "Rental income reporting",
      "Investment and capital gains",
      "Multi-state filing",
    ],
  },
  {
    name: "Corporation Tax Preparation",
    description:
      "C-Corp (Form 1120) and S-Corp (Form 1120-S) tax preparation. We handle estimated payments, shareholder distributions, officer compensation, and multi-state compliance.",
    details: [
      "Form 1120 (C-Corp) / 1120-S (S-Corp)",
      "Quarterly estimated tax calculations",
      "NYS corporate tax (CT-3/CT-4)",
      "Officer reasonable compensation analysis",
      "Year-end tax planning",
    ],
  },
  {
    name: "Partnership & LLC Tax Returns",
    description:
      "Partnership returns (Form 1065) and K-1 preparation for multi-member LLCs. We ensure proper allocation of income, deductions, and credits among partners.",
    details: [
      "Form 1065 partnership return",
      "Schedule K-1 for each partner",
      "NYS IT-204 partnership filing",
      "Guaranteed payment reporting",
      "Partner basis tracking",
    ],
  },
  {
    name: "Payroll Tax Services",
    description:
      "Quarterly and annual payroll tax filings including Forms 941, 940, W-2s, and 1099s. We handle federal, state, and local payroll tax compliance so you avoid penalties.",
    details: [
      "Quarterly Form 941 filing",
      "Annual Form 940 (FUTA)",
      "W-2 and 1099 preparation",
      "NYS-45 quarterly filing",
      "Payroll tax penalty resolution",
    ],
  },
  {
    name: "Sales Tax Handling",
    description:
      "Monthly, quarterly, or annual sales tax return filing with NYS. We reconcile your records, calculate tax due, and file on time. Includes sales tax audit support.",
    details: [
      "NYS sales tax return filing",
      "Sales tax reconciliation",
      "Multi-jurisdiction compliance",
      "Exemption certificate management",
      "Audit support if needed",
    ],
  },
  {
    name: "IRS Representation",
    description:
      "Received a letter from the IRS? We represent you. Our team handles IRS notices, audits, payment plans, offer in compromise, and penalty abatement. You do not need to speak to the IRS directly.",
    details: [
      "IRS notice response",
      "Audit representation",
      "Installment payment plans",
      "Offer in Compromise evaluation",
      "Penalty and interest abatement",
    ],
  },
];

export default function TaxServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 bg-[var(--blue-bg)]">
        <Container>
          <Badge className="mb-4">Tax Services</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-6 max-w-3xl">
            Tax Preparation and Compliance for Individuals and Businesses
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mb-8">
            From individual returns to complex corporate filings, IRS
            representation to ITIN processing — our team of experienced tax
            professionals handles it all. IRS Certified Acceptance Agent on
            staff.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button href="/contact" size="lg">
              Schedule Tax Consultation
            </Button>
            <Button href={`tel:${PHONE.mainTel}`} variant="outline" size="lg">
              Call {PHONE.main}
            </Button>
          </div>
        </Container>
      </section>

      {/* ITIN Highlight */}
      <section className="py-16">
        <Container>
          <Link href="/services/tax-services/itin-tax-id/">
            <Card hover className="border-2 border-[var(--blue-accent)] relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="success">IRS Certified Acceptance Agent</Badge>
                    <Badge>2,250+ ITINs Processed</Badge>
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
                    ITIN / Tax ID Services
                  </h2>
                  <p className="text-[var(--text-secondary)] mb-4">
                    Need an Individual Taxpayer Identification Number? Our IRS
                    Certified Acceptance Agent verifies your documents on-site
                    — no need to mail your passport or original documents to
                    the IRS. Over 2,250 ITINs successfully processed.
                  </p>
                  <span className="text-[var(--blue-accent)] font-semibold">
                    Learn more about ITIN services &rarr;
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        </Container>
      </section>

      {/* Tax Services Grid */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">
            Tax Services
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {taxServices.map((service) => (
              <Card key={service.name}>
                <h3 className="text-xl font-bold text-[var(--text)] mb-3">
                  {service.name}
                </h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  {service.description}
                </p>
                <ul className="space-y-1">
                  {service.details.map((detail) => (
                    <li
                      key={detail}
                      className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
                    >
                      <span className="text-[var(--green)] mt-0.5">&#10003;</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Why choose us */}
      <section className="py-16">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">
            Why Businesses Choose Our Tax Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Year-Round Availability
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                We are not a seasonal pop-up. Our team is available year-round
                for tax planning, estimated payments, and IRS issues.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Cross-Service Insight
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Because we handle your formation, insurance, and licensing, we
                already know your business — no re-explaining every April.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Multilingual Staff
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Our team speaks Hindi, Urdu, Bengali, Spanish, and English. We
                serve the diverse small business community of Queens and beyond.
              </p>
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
                  Facing a workers comp, sales tax, or UI audit? We fight to
                  reduce fines and protect your business.
                </p>
              </Card>
            </Link>
            <Link href="/services/business-formation/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Business Formation
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Entity structure affects your tax bill. We help you choose the
                  right setup from day one.
                </p>
              </Card>
            </Link>
            <Link href="/services/insurance/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Insurance
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Business insurance premiums are tax-deductible. We coordinate
                  your coverage with your tax strategy.
                </p>
              </Card>
            </Link>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
              Get Your Taxes Done Right
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Whether you need a simple personal return or complex corporate
              filing, we are here to help. Free initial consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/contact" size="lg">
                Book Tax Appointment
              </Button>
              <Button href={PHONE.whatsappLink} variant="secondary" size="lg">
                WhatsApp Us
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
