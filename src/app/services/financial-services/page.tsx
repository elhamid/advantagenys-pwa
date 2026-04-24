import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSection } from "@/components/seo/FAQSection";
import { getServiceFAQs } from "@/lib/chat/get-faqs";
import { makeCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Financial Services in Queens, NYC | Advantage Services",
  description:
    "Bookkeeping, financial statements, and business analysis for Queens, NYC small businesses. Keep your books clean and your finances in order. Advantage Services.",
  alternates: { canonical: makeCanonical("/services/financial-services") },
};

const services = [
  {
    name: "Bookkeeping",
    description:
      "Monthly transaction recording and reconciliation. We keep your books accurate and up-to-date so you always know where your business stands.",
    includes: [
      "Monthly transaction categorization",
      "Bank & credit card reconciliation",
      "Accounts payable & receivable tracking",
      "Monthly financial summaries",
    ],
    handledBy: "Akram, Riaz",
  },
  {
    name: "Financial Statements",
    description:
      "Professional balance sheets, income statements, and cash flow reports. Essential for loan applications, investor presentations, and business planning.",
    includes: [
      "Balance sheet preparation",
      "Income statement (P&L)",
      "Cash flow statements",
      "Year-end financial packages",
    ],
    handledBy: "Akram",
  },
  {
    name: "Business Analysis",
    description:
      "Financial health assessment and strategic recommendations. We analyze your numbers to find opportunities for growth and cost savings.",
    includes: [
      "Profitability analysis",
      "Cash flow forecasting",
      "Expense optimization review",
      "Growth planning recommendations",
    ],
    handledBy: "Kedar, Akram",
  },
];

const PAGE_FAQS = [
  {
    question: "What is bookkeeping and why does my small business need it?",
    answer:
      "Bookkeeping is the systematic recording of all financial transactions — income, expenses, payments, and receipts — in your business. Accurate books are the foundation of everything else: tax preparation, loan applications, financial planning, and understanding whether your business is actually profitable. Without current books, you are flying blind. We handle monthly transaction recording and reconciliation so you always have an accurate picture.",
  },
  {
    question: "What is the difference between bookkeeping and accounting?",
    answer:
      "Bookkeeping is the ongoing recording of daily transactions. Accounting involves analyzing, interpreting, and reporting on that data — financial statements, tax returns, audits, and business analysis. Many small businesses need both. We provide bookkeeping and financial statement preparation, and our tax team works with the same records to prepare your business returns, so there is no translation layer between your bookkeeper and your accountant.",
  },
  {
    question: "When do I need a financial statement for my business?",
    answer:
      "Financial statements — balance sheets, income statements, and cash flow reports — are required for bank loans and SBA financing, landlord applications for commercial leases, investors and partners who want to understand the business, and year-end tax preparation. We prepare professional statements from your bookkeeping records whenever you need them.",
  },
  {
    question: "How often should a small business reconcile its books?",
    answer:
      "Monthly reconciliation is the standard for most small businesses. Letting books go unreconciled for a quarter or longer makes errors harder to catch and creates significant work at tax time. We reconcile your bank and credit card accounts monthly so discrepancies are caught early and your records are always current.",
  },
  {
    question: "Can you help me understand where my business is losing money?",
    answer:
      "Yes. Our business analysis service reviews your financials to identify areas of underperformance — expenses running high relative to revenue, margins shrinking in certain product lines, or cash flow timing issues. We provide plain-language recommendations, not just numbers, so you can act on the findings.",
  },
];

export default async function FinancialServicesPage() {
  const dbFaqs = await getServiceFAQs("bookkeeping");
  const faqs = dbFaqs.length > 0 ? dbFaqs : PAGE_FAQS;
  return (
    <>
      <JsonLd
        type="Service"
        serviceName="Financial Services"
        serviceDescription="Bookkeeping, financial statements, and business analysis for NYC small businesses. Keep your books clean and your finances in order."
        serviceUrl="https://advantagenys.com/services/financial-services"
      />
      <JsonLd
        type="BreadcrumbList"
        items={[
          { name: "Home", url: "https://advantagenys.com" },
          { name: "Services", url: "https://advantagenys.com/services" },
          { name: "Financial Services", url: "https://advantagenys.com/services/financial-services" },
        ]}
      />
      <section className="py-20 bg-[var(--blue-bg)]">
        <Container>
          <Badge className="mb-4">Financial Services</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-6">
            Keep Your Books Clean, Your Finances Clear
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mb-8">
            Accurate bookkeeping and financial reporting are the foundation of
            every successful business. We handle the numbers so you can focus on
            growing your business.
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-3">{PHONE.main} &middot; Call or WhatsApp</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button href="/contact" size="lg">
              Get Started
            </Button>
            <Button href={PHONE.whatsappLink} variant="outline" size="lg">
              WhatsApp Us
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="space-y-8">
            {services.map((service) => (
              <Card key={service.name}>
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
                      {service.name}
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-4">
                      {service.description}
                    </p>
                    <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                      What&apos;s Included
                    </h3>
                    <ul className="space-y-1">
                      {service.includes.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
                        >
                          <span className="text-[var(--green)]">&#10003;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">
                    Handled by: {service.handledBy}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-4 text-center">
            Related Services
          </h2>
          <p className="text-[var(--text-secondary)] text-center mb-8 max-w-xl mx-auto">
            Financial services work best alongside our full suite of business
            solutions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Tax Services
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                Clean books make tax season painless. Your bookkeeper and tax
                preparer work together.
              </p>
              <Button href="/services/tax-services/" variant="outline" size="sm">
                Learn More
              </Button>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Audit Defense
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                Proper records are your best defense. We prepare documentation
                that withstands scrutiny.
              </p>
              <Button href="/services/audit-defense/" variant="outline" size="sm">
                Learn More
              </Button>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Business Formation
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                Starting a new business? Set up your books right from day one
                with proper entity structuring.
              </p>
              <Button href="/services/business-formation/" variant="outline" size="sm">
                Learn More
              </Button>
            </Card>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
              Ready to Get Your Books in Order?
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Schedule a free consultation. We&apos;ll review your current
              setup and recommend the right level of service.
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-3">{PHONE.main} &middot; Call or WhatsApp</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/contact" size="lg">
                Free Consultation
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
