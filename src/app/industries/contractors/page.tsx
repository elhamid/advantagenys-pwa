import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { makeCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contractor Business Services in Queens, NYC | Advantage Services",
  description:
    "Business services for contractors in Queens, NYC. HIC licensing, general contractor license, workers comp, GL insurance, and tax prep. Advantage Services.",
  alternates: { canonical: makeCanonical("/industries/contractors") },
};

const painPoints = [
  {
    title: "Licensing Maze",
    description:
      "NYC and NYS require different licenses for different trades. One wrong filing and you're working without coverage.",
  },
  {
    title: "Unpredictable Workers Comp Costs",
    description:
      "Annual audits, payroll reclassifications, and surprise premium hikes eat into your margins.",
  },
  {
    title: "Insurance Confusion",
    description:
      "General liability, workers comp, disability, commercial auto -- which policies do you actually need?",
  },
  {
    title: "Tax Estimation Guesswork",
    description:
      "Quarterly estimates are a moving target when your income fluctuates by season and project.",
  },
];

const journey = [
  { step: "1", label: "License", detail: "HIC or General Contractor license filed and tracked" },
  { step: "2", label: "Insurance", detail: "GL + Workers Comp policies bound and active" },
  { step: "3", label: "LLC Formation", detail: "Business entity structured for liability protection" },
  { step: "4", label: "Quarterly Tax", detail: "Estimated payments calculated and filed on time" },
  { step: "5", label: "Audit Prep", detail: "Workers comp audit documentation ready year-round" },
];

const services = [
  "Home Improvement Contractor (HIC) License",
  "General Contractor License",
  "Workers Compensation Insurance",
  "General Liability Insurance",
  "Disability Insurance",
  "LLC / Corp Formation",
  "Quarterly & Annual Tax Preparation",
  "Workers Comp Audit Defense",
  "Sales Tax Filing",
  "Bookkeeping",
];

export default function ContractorsPage() {
  return (
    <>
      <JsonLd
        type="Service"
        serviceName="Contractor Business Services"
        serviceDescription="Business services for contractors in NYC. HIC licensing, general contractor license, workers comp, GL insurance, and tax prep."
        serviceUrl="https://advantagenys.com/industries/contractors"
      />
      <JsonLd
        type="BreadcrumbList"
        items={[
          { name: "Home", url: "https://advantagenys.com" },
          { name: "Industries", url: "https://advantagenys.com/industries" },
          { name: "Contractors", url: "https://advantagenys.com/industries/contractors" },
        ]}
      />
      {/* Hero */}
      <section className="py-20 bg-[var(--blue-bg)]">
        <Container>
          <Badge className="mb-4">For NYC Contractors</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
            We Handle the Licensing Maze
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mb-8">
            From HIC licensing to workers comp and quarterly taxes -- everything a
            contractor needs to stay compliant, in one place.
          </p>
          <Button href="/contact" size="lg">
            Get Licensed Today
          </Button>
        </Container>
      </section>

      {/* Pain Points */}
      <section className="py-16">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
            What Keeps Contractors Up at Night
          </h2>
          <p className="text-[var(--text-muted)] mb-10">
            Sound familiar? We solve every one of these.
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
            Your Path to Full Compliance
          </h2>
          <p className="text-[var(--text-muted)] mb-10">
            We walk you through every step, in order.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {journey.map((item, i) => (
              <div key={item.label} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--blue-accent)] text-white flex items-center justify-center text-lg font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-[var(--text)] mb-1">{item.label}</h3>
                <p className="text-xs text-[var(--text-muted)]">{item.detail}</p>
                {i < journey.length - 1 && (
                  <span className="hidden lg:block text-[var(--text-muted)] text-2xl mt-2 absolute translate-x-[72px]">
                    &rarr;
                  </span>
                )}
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
            We handle all of this. Here&apos;s the package.
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

      {/* Social Proof */}
      <section className="py-16 bg-[var(--surface)]">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-[var(--blue-accent)]">20+</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Years serving NYC contractors</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--blue-accent)]">Licensed</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Insurance broker on staff</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--blue-accent)]">One-Stop</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">License + insurance + tax under one roof</p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20">
        <Container className="text-center">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
            Ready to Get Compliant?
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
            Stop juggling paperwork. We handle licensing, insurance, and tax so
            you can focus on the job site.
          </p>
          <Button href="/contact" size="lg">
            Get Licensed Today
          </Button>
        </Container>
      </section>
    </>
  );
}
