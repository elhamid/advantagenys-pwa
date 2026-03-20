import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSection } from "@/components/seo/FAQSection";
import { getServiceFAQs } from "@/lib/chat/get-faqs";

export const metadata: Metadata = {
  title: "Business Formation in Queens, NYC | Advantage Services",
  description:
    "LLC, Corporation, and Non-Profit formation services in Queens, NYC. Fast filing, registered agent service, EIN application, and operating agreements. Advantage Services.",
};

const formations = [
  {
    name: "LLC Formation",
    description:
      "The most popular structure for small businesses. A Limited Liability Company protects your personal assets while offering flexible tax treatment. We handle Articles of Organization, Operating Agreement, EIN application, and publication requirements.",
    best: "Solo owners, partnerships, and most small businesses",
    includes: [
      "Articles of Organization filed with NY DOS",
      "Operating Agreement drafted",
      "EIN (Tax ID) application",
      "Publication requirement guidance",
      "Registered Agent service",
    ],
  },
  {
    name: "C-Corporation",
    description:
      "The standard corporate structure for businesses planning to raise investment, issue stock, or scale aggressively. C-Corps face double taxation but offer unlimited growth potential and credibility with investors.",
    best: "Growth-oriented businesses seeking investment",
    includes: [
      "Certificate of Incorporation filed with NY DOS",
      "Corporate Bylaws drafted",
      "EIN application",
      "Initial Board Resolutions",
      "Stock certificate templates",
    ],
  },
  {
    name: "S-Corporation",
    description:
      "An S-Corp election lets you keep the liability protection of a corporation while passing income through to your personal return — avoiding double taxation. Ideal for profitable businesses looking to save on self-employment tax.",
    best: "Profitable businesses wanting to reduce self-employment tax",
    includes: [
      "Entity formation (LLC or Corp)",
      "IRS Form 2553 S-Election filing",
      "EIN application",
      "Payroll registration setup",
      "Reasonable salary guidance",
    ],
  },
  {
    name: "Non-Profit 501(c)(3)",
    description:
      "Form a tax-exempt organization for charitable, educational, or religious purposes. We handle both the state incorporation and the IRS 501(c)(3) application — a process most firms outsource or refuse entirely.",
    best: "Charitable, educational, and religious organizations",
    includes: [
      "Certificate of Incorporation (non-profit)",
      "IRS Form 1023 / 1023-EZ preparation",
      "Bylaws and Conflict of Interest Policy",
      "EIN application",
      "State charitable registration",
    ],
  },
  {
    name: "Sales Tax Registration",
    description:
      "If you sell taxable goods or services in New York, you need a Certificate of Authority before making your first sale. We register you with the NYS Department of Taxation and Finance and set up your filing schedule.",
    best: "Any business selling taxable goods or services",
    includes: [
      "NYS Certificate of Authority application",
      "Filing schedule setup (monthly, quarterly, annual)",
      "Sales tax compliance guidance",
      "Multi-jurisdiction registration if needed",
    ],
  },
  {
    name: "Payroll Registration",
    description:
      "Hiring employees requires registration with federal and state agencies. We handle IRS employer registration, NYS withholding tax, NYS unemployment insurance, and workers comp/disability compliance.",
    best: "Any business hiring its first employee",
    includes: [
      "IRS employer registration (Form SS-4)",
      "NYS Withholding Tax registration",
      "NYS Unemployment Insurance registration",
      "Workers Comp & Disability compliance guidance",
    ],
  },
];

const steps = [
  {
    step: "1",
    title: "Free Consultation",
    description:
      "We discuss your business goals and recommend the right entity structure. No obligation.",
  },
  {
    step: "2",
    title: "Document Preparation",
    description:
      "We prepare all formation documents, operating agreements, and government applications.",
  },
  {
    step: "3",
    title: "Filing & Registration",
    description:
      "We file with New York State, apply for your EIN, and handle publication requirements.",
  },
  {
    step: "4",
    title: "Ready to Operate",
    description:
      "You receive your complete formation package. We set you up with tax, insurance, and licensing as needed.",
  },
];

export default async function BusinessFormationPage() {
  const faqs = await getServiceFAQs("formation");
  return (
    <>
      <JsonLd
        type="Service"
        serviceName="Business Formation"
        serviceDescription="LLC, Corporation, and Non-Profit formation services in New York. Fast filing, registered agent service, EIN application, and operating agreements included."
        serviceUrl="https://advantagenys.com/services/business-formation"
      />
      <JsonLd
        type="BreadcrumbList"
        items={[
          { name: "Home", url: "https://advantagenys.com" },
          { name: "Services", url: "https://advantagenys.com/services" },
          { name: "Business Formation", url: "https://advantagenys.com/services/business-formation" },
        ]}
      />
      {/* Hero */}
      <section className="py-20 bg-[var(--blue-bg)]">
        <Container>
          <Badge className="mb-4">Business Formation</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-6 max-w-3xl">
            Start Your Business the Right Way
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mb-8">
            LLC, Corporation, S-Corp, or Non-Profit — we handle the entire
            formation process from entity selection to EIN, operating
            agreements, and compliance. Serving New York businesses since 2005.
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-3">{PHONE.main} &middot; Call or WhatsApp</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button href="/contact" size="lg">
              Start Your Business
            </Button>
            <Button href={PHONE.whatsappLink} variant="outline" size="lg">
              WhatsApp Us
            </Button>
          </div>
        </Container>
      </section>

      {/* Process Steps */}
      <section className="py-16">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--blue-accent)] text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Service Cards */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">
            Formation Services
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {formations.map((f) => (
              <Card key={f.name} className="flex flex-col">
                <h3 className="text-xl font-bold text-[var(--text)] mb-3">
                  {f.name}
                </h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  {f.description}
                </p>
                <p className="text-sm font-medium text-[var(--blue-accent)] mb-4">
                  Best for: {f.best}
                </p>
                <div className="mt-auto">
                  <p className="text-sm font-semibold text-[var(--text)] mb-2">
                    What is included:
                  </p>
                  <ul className="space-y-1">
                    {f.includes.map((item) => (
                      <li
                        key={item}
                        className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
                      >
                        <span className="text-[var(--green)] mt-0.5">&#10003;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">
            Common Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                LLC or Corporation — which is right for me?
              </h3>
              <p className="text-[var(--text-secondary)]">
                Most small businesses benefit from an LLC due to its simplicity,
                asset protection, and flexible taxation. If you plan to seek
                outside investment or issue stock, a Corporation may be the
                better fit. We walk you through the tradeoffs in your free
                consultation.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                How long does formation take in New York?
              </h3>
              <p className="text-[var(--text-secondary)]">
                Standard processing with the NY Department of State takes 7-10
                business days. Expedited processing (24-hour and same-day) is
                available for an additional state fee. We submit your filing as
                soon as documents are signed.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                What is the New York publication requirement?
              </h3>
              <p className="text-[var(--text-secondary)]">
                New York requires LLCs to publish a notice of formation in two
                newspapers (one daily, one weekly) in the county of formation
                for six consecutive weeks. We guide you through the process and
                connect you with cost-effective publication options.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Do I need a registered agent?
              </h3>
              <p className="text-[var(--text-secondary)]">
                Yes. Every NY business entity must designate a registered agent
                to receive legal and tax documents. We provide registered agent
                service as part of our formation package.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Cross-sell */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6 text-center">
            After Formation: What Comes Next
          </h2>
          <p className="text-[var(--text-secondary)] text-center max-w-2xl mx-auto mb-10">
            Forming your business is step one. We help you with everything that
            follows — all under one roof.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link href="/services/licensing/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Licensing & Permits
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Get the licenses your industry requires before you open for
                  business.
                </p>
              </Card>
            </Link>
            <Link href="/services/insurance/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Insurance
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  General liability, workers comp, and disability — required for
                  most businesses.
                </p>
              </Card>
            </Link>
            <Link href="/services/tax-services/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Tax Services
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Business tax preparation, payroll setup, and ongoing
                  compliance.
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
              Ready to Form Your Business?
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Schedule a free consultation. We will recommend the right
              structure and handle the entire process.
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
          {faqs.length > 0 && <FAQSection faqs={faqs} />}
        </Container>
      </section>
    </>
  );
}
