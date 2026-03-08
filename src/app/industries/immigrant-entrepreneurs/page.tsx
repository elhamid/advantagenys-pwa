import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Immigrant Entrepreneurs",
  description:
    "ITIN processing, LLC formation, EIN, licensing, tax, and insurance for immigrant entrepreneurs in NYC. IRS Certified Acceptance Agent. 2,250+ ITINs processed.",
};

const painPoints = [
  {
    title: "Language Barriers",
    description:
      "Confusing government forms in a second language. One misunderstanding can delay your application by months.",
  },
  {
    title: "Trust Deficit",
    description:
      "Too many have been burned by unlicensed preparers who take money and disappear. You need someone accountable.",
  },
  {
    title: "ITIN Confusion",
    description:
      "Many don't realize an ITIN qualifies you to form a business, get an EIN, and file taxes -- all legally.",
  },
  {
    title: "Document Anxiety",
    description:
      "The IRS requires original documents like passports. Mailing them is risky. You need an alternative.",
  },
];

const journey = [
  { step: "1", label: "ITIN", detail: "Application filed as IRS Certified Acceptance Agent" },
  { step: "2", label: "LLC Formation", detail: "Business entity filed with NYS" },
  { step: "3", label: "EIN", detail: "Federal tax ID obtained from IRS" },
  { step: "4", label: "Licenses", detail: "Retail, vendor, and trade permits secured" },
  { step: "5", label: "Sales Tax", detail: "Certificate of Authority and filing setup" },
  { step: "6", label: "Insurance", detail: "GL, Workers Comp, and property coverage" },
  { step: "7", label: "Ongoing Tax", detail: "Annual business and personal returns filed" },
];

const services = [
  "ITIN Application (W-7)",
  "LLC / Corp Formation",
  "EIN (Federal Tax ID)",
  "Retail & Vendor Licenses",
  "Sales Tax Certificate of Authority",
  "General Liability Insurance",
  "Workers Compensation Insurance",
  "Business & Personal Tax Preparation",
  "Bookkeeping",
  "IRS Representation",
];

const trustSignals = [
  {
    title: "IRS Certified Acceptance Agent",
    description:
      "We verify your documents on-site. You don't have to mail your original passport to the IRS.",
  },
  {
    title: "2,250+ ITINs Processed",
    description:
      "Two decades of experience navigating IRS requirements for immigrant business owners.",
  },
  {
    title: "Kedar Gupta -- 20+ Years",
    description:
      "Our lead tax preparer is an IRS Certified Acceptance Agent with over 20 years of direct experience.",
  },
];

export default function ImmigrantEntrepreneursPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 bg-[var(--blue-bg)]">
        <Container>
          <Badge variant="success" className="mb-4">IRS Certified Acceptance Agent</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
            2,250+ ITINs Processed
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mb-8">
            From ITIN application to LLC formation, licensing, insurance, and tax filing --
            we help immigrant entrepreneurs build legitimate businesses in NYC.
          </p>
          <Button href="/contact" size="lg">
            Get Your ITIN
          </Button>
        </Container>
      </section>

      {/* Pain Points */}
      <section className="py-16">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
            We Understand Your Challenges
          </h2>
          <p className="text-[var(--text-muted)] mb-10">
            Starting a business in a new country is hard enough. Paperwork shouldn&apos;t be the thing that stops you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {painPoints.map((point) => (
              <Card key={point.title} hover>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  {point.title}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  {point.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Service Journey */}
      <section className="py-16 bg-[var(--surface)]">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
            Your Path from ITIN to Operating Business
          </h2>
          <p className="text-[var(--text-muted)] mb-10">
            We guide you through every step. No surprises.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6">
            {journey.map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--blue-accent)] text-white flex items-center justify-center text-lg font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-[var(--text)] mb-1 text-sm">{item.label}</h3>
                <p className="text-xs text-[var(--text-muted)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* What's Included */}
      <section className="py-16">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
            What&apos;s Included
          </h2>
          <p className="text-[var(--text-muted)] mb-10">
            Everything from your first ID number to ongoing compliance.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 max-w-3xl">
            {services.map((service) => (
              <div key={service} className="flex items-center gap-3">
                <span className="text-[var(--green)] text-lg flex-shrink-0">&#10003;</span>
                <span className="text-[var(--text-secondary)]">{service}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-[var(--surface)]">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-10 text-center">
            Why Clients Trust Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustSignals.map((signal) => (
              <Card key={signal.title}>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  {signal.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {signal.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20">
        <Container className="text-center">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
            You Don&apos;t Have to Mail Your Original Documents
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
            As an IRS Certified Acceptance Agent, we verify your passport and
            documents on-site. Your originals never leave your hands.
          </p>
          <Button href="/contact" size="lg">
            Get Your ITIN
          </Button>
        </Container>
      </section>
    </>
  );
}
