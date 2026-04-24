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
  title: "Immigration & Legal Services in Queens, NYC | Advantage Services",
  description:
    "Immigration petitions, citizenship applications, divorce filings, and ITIN registration in Queens, NYC. Bilingual staff, IRS Certified Acceptance Agent. Advantage Services.",
  alternates: { canonical: makeCanonical("/services/legal") },
};

const legalServices = [
  {
    name: "ITIN Registration",
    description:
      "As an IRS Certified Acceptance Agent, we process Individual Taxpayer Identification Number (ITIN) applications on-site. No need to mail your original passport to the IRS — we certify your documents in person and submit your application directly. Contractors, self-employed individuals, and immigrant workers rely on us to get their ITIN fast.",
    whoItHelps: "Individuals without a Social Security Number who need to file taxes — including contractors and self-employed immigrants",
    includes: [
      "IRS Form W-7 preparation",
      "Passport and document certification (no mailing originals)",
      "Application submission to the IRS",
      "Status tracking and follow-up",
      "Renewal of expiring ITINs",
    ],
    cta: {
      label: "Start ITIN Application",
      href: "/resources/forms/itin-registration-form/",
    },
    featured: true,
  },
  {
    name: "Immigration Petitions (I-130)",
    description:
      "Family-based immigration petitions to help you sponsor relatives for lawful permanent residence in the United States. We prepare and file Form I-130 (Petition for Alien Relative) and guide you through every step of the process — from document gathering to USCIS submission and follow-up.",
    whoItHelps: "U.S. citizens and permanent residents sponsoring family members",
    includes: [
      "Form I-130 preparation and filing",
      "Supporting document checklist and review",
      "Translation of foreign documents",
      "USCIS correspondence and follow-up",
      "Case status tracking",
    ],
  },
  {
    name: "Citizenship Applications",
    description:
      "Naturalization assistance for lawful permanent residents ready to become U.S. citizens. We help you determine eligibility, prepare Form N-400, compile required documentation, and prepare for the citizenship interview and civics test.",
    whoItHelps: "Lawful permanent residents eligible for naturalization",
    includes: [
      "Eligibility assessment",
      "Form N-400 preparation and filing",
      "Document compilation and review",
      "Interview and civics test preparation",
      "USCIS correspondence handling",
    ],
  },
  {
    name: "Divorce Applications",
    description:
      "We assist with the preparation and filing of divorce applications in New York State. Our team helps you navigate the paperwork, understand your options, and move through the process as smoothly as possible. We work with bilingual clients who need guidance in their preferred language.",
    whoItHelps: "Individuals seeking divorce in New York State",
    includes: [
      "Divorce petition preparation",
      "Document gathering and organization",
      "Court filing assistance",
      "Process guidance in your preferred language",
      "Referral to attorneys when needed",
    ],
  },
];

const PAGE_FAQS = [
  {
    question: "What is an ITIN and why do I need one?",
    answer:
      "An Individual Taxpayer Identification Number (ITIN) is a tax processing number issued by the IRS for individuals who are not eligible for a Social Security Number. If you earn income in the United States as an immigrant, contractor, or self-employed worker without an SSN, you need an ITIN to file your federal tax return. As an IRS Certified Acceptance Agent, we verify your identity documents in person — so you do not need to mail your original passport to the IRS.",
  },
  {
    question: "What is the difference between an immigration petition and a citizenship application?",
    answer:
      "An immigration petition (Form I-130) is filed by a US citizen or permanent resident to sponsor a qualifying relative for lawful permanent residence — a green card. A citizenship application (Form N-400) is filed by someone who already holds a green card and meets the residency and eligibility requirements to become a US citizen. They are separate processes with different eligibility criteria. We assist with both.",
  },
  {
    question: "Can Advantage handle my divorce filing in New York?",
    answer:
      "We assist with the preparation and filing of divorce paperwork in New York State. Our team helps you gather required documents, understand your options, and navigate the filing process. For matters involving contested assets, custody disputes, or complex legal issues, we refer you to licensed attorneys. We work with bilingual clients and provide guidance in your preferred language.",
  },
  {
    question: "How long does an ITIN application take?",
    answer:
      "ITIN processing times at the IRS vary, but applications submitted through a Certified Acceptance Agent are generally processed faster than applications mailed directly by individuals. The IRS typically issues ITINs within several weeks of receiving a complete application. We track your application status and follow up with the IRS if there are delays.",
  },
  {
    question: "Do you offer services in languages other than English?",
    answer:
      "Yes. Our team includes bilingual staff and we regularly assist clients in Spanish, Bengali, Hindi, Urdu, and other languages spoken in the Queens community. Immigration, legal, and tax matters are stressful enough without a language barrier — we make sure you fully understand every step of the process.",
  },
];

export default async function LegalServicesPage() {
  const dbFaqs = await getServiceFAQs("legal");
  const faqs = dbFaqs.length > 0 ? dbFaqs : PAGE_FAQS;
  return (
    <>
      <JsonLd
        type="Service"
        serviceName="Immigration & Legal Services"
        serviceDescription="Immigration petitions, citizenship applications, divorce filings, and ITIN registration. Bilingual staff, IRS Certified Acceptance Agent, and 20+ years of experience serving immigrant entrepreneurs and families."
        serviceUrl="https://advantagenys.com/services/legal"
      />
      <JsonLd
        type="BreadcrumbList"
        items={[
          { name: "Home", url: "https://advantagenys.com" },
          { name: "Services", url: "https://advantagenys.com/services" },
          { name: "Immigration & Legal Services", url: "https://advantagenys.com/services/legal" },
        ]}
      />
      {/* Hero */}
      <section className="py-20 bg-[var(--blue-bg)]">
        <Container>
          <Badge className="mb-4">Immigration & Legal Services</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-6 max-w-3xl">
            Legal Support for Immigrant Entrepreneurs and Families
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mb-8">
            Immigration petitions, citizenship applications, divorce filings,
            and ITIN registration — all handled by bilingual professionals with
            20+ years of experience serving New York&apos;s immigrant communities.
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-3">{PHONE.main} &middot; Call or WhatsApp</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button href="/contact" size="lg">
              Schedule a Free Consultation
            </Button>
            <Button href={PHONE.whatsappLink} variant="outline" size="lg">
              WhatsApp Us
            </Button>
          </div>
        </Container>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">
            Why Choose Advantage for Immigration & Legal Services?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                IRS Certified Acceptance Agent
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                We are authorized by the IRS to certify identification documents
                for ITIN applications. No need to mail your original passport —
                we handle everything in person.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Bilingual Staff
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Our team speaks your language. We provide guidance and document
                preparation in English, Spanish, Hindi, Bengali, and Urdu so
                nothing gets lost in translation.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                20+ Years of Experience
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Since 2005, we have helped thousands of immigrant entrepreneurs
                and families navigate legal processes in New York. We know what
                works and what to avoid.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Service Cards */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">
            Our Immigration & Legal Services
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {legalServices.map((service) => (
              <Card
                key={service.name}
                className={`flex flex-col${"featured" in service && service.featured ? " ring-2 ring-[var(--blue-accent)] relative" : ""}`}
              >
                {"featured" in service && service.featured && (
                  <span className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-[var(--blue-accent)] text-white text-xs font-bold uppercase tracking-wide">
                    Most Requested
                  </span>
                )}
                <h3 className="text-xl font-bold text-[var(--text)] mb-3">
                  {service.name}
                </h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  {service.description}
                </p>
                <p className="text-sm font-medium text-[var(--blue-accent)] mb-4">
                  Who it helps: {service.whoItHelps}
                </p>
                <div className="mt-auto">
                  <p className="text-sm font-semibold text-[var(--text)] mb-2">
                    What is included:
                  </p>
                  <ul className="space-y-1">
                    {service.includes.map((item) => (
                      <li
                        key={item}
                        className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
                      >
                        <span className="text-[var(--green)] mt-0.5">&#10003;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  {"cta" in service && service.cta && (
                    <div className="mt-4">
                      <Button href={service.cta.href} size="sm" variant="outline">
                        {service.cta.label}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
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
            <Link href="/services/tax-services/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Tax Services
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Personal and business tax preparation, IRS representation, and
                  ITIN tax filing.
                </p>
              </Card>
            </Link>
            <Link href="/services/business-formation/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Business Formation
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Ready to start a business? We set up your LLC or Corporation
                  and handle all filings.
                </p>
              </Card>
            </Link>
            <Link href="/services/licensing/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Licensing
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Business licenses and permits for contractors, restaurants, and
                  retail operations.
                </p>
              </Card>
            </Link>
          </div>
        </Container>
      </section>

      <PerServiceReviews segment="immigration" />

      {/* CTA */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
              Schedule a Free Consultation
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Whether you need help with immigration, citizenship, divorce, or
              ITIN registration — our bilingual team is ready to assist. Call us
              or visit our office today.
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-3">{PHONE.main} &middot; Call or WhatsApp</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/contact" size="lg">
                Contact Us
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
