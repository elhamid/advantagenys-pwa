import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { makeCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Restaurant Business Services in Queens, NYC | Advantage Services",
  description:
    "Business services for restaurants in Queens, NYC. Health permits, liquor license, fire dept, sales tax, workers comp, and insurance. Advantage Services.",
  alternates: { canonical: makeCanonical("/industries/restaurants") },
};

const painPoints = [
  {
    title: "Permit Maze",
    description:
      "Health department, liquor authority, fire department, signage -- each agency has its own timeline and paperwork.",
  },
  {
    title: "Liquor License Timeline",
    description:
      "The SLA process can take 3-6 months. Miss one step and you're back to square one while paying rent on an empty space.",
  },
  {
    title: "Workers Comp Requirement",
    description:
      "New York requires workers comp from day one, even for a single employee. Operating without it risks fines and shutdown.",
  },
  {
    title: "Sales Tax Confusion",
    description:
      "Prepared food, catering, delivery, alcohol -- each has different tax treatment. Getting it wrong means audit exposure.",
  },
];

const journey = [
  { step: "1", label: "LLC Formation", detail: "Entity structured for liability protection" },
  { step: "2", label: "Restaurant Permits", detail: "Health, fire, signage, and DCA filed" },
  { step: "3", label: "Liquor License", detail: "SLA application managed start to finish" },
  { step: "4", label: "Sales Tax Cert", detail: "Certificate of Authority and filing setup" },
  { step: "5", label: "Insurance", detail: "GL, Workers Comp, and property coverage bound" },
  { step: "6", label: "Ongoing Tax", detail: "Quarterly sales tax and annual returns filed" },
];

const services = [
  "LLC / Corp Formation",
  "Health Department Permit",
  "Fire Department Permit",
  "DCA Registration",
  "Signage Permit",
  "SLA Liquor License Application",
  "Sales Tax Certificate of Authority",
  "General Liability Insurance",
  "Workers Compensation Insurance",
  "Disability Insurance",
  "Quarterly Sales Tax Filing",
  "Business & Personal Tax Preparation",
  "Bookkeeping",
  "Workers Comp Audit Defense",
];

export default function RestaurantsPage() {
  return (
    <>
      <JsonLd
        type="Service"
        serviceName="Restaurant Business Services"
        serviceDescription="Business services for restaurants in NYC. Health permits, liquor license, fire dept, sales tax, workers comp, and insurance."
        serviceUrl="https://advantagenys.com/industries/restaurants"
      />
      <JsonLd
        type="BreadcrumbList"
        items={[
          { name: "Home", url: "https://advantagenys.com" },
          { name: "Industries", url: "https://advantagenys.com/industries" },
          { name: "Restaurants", url: "https://advantagenys.com/industries/restaurants" },
        ]}
      />
      {/* Hero */}
      <section className="py-20 bg-[var(--blue-bg)]">
        <Container>
          <Badge className="mb-4">For NYC Restaurants</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
            All Permits. One Partner.
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mb-8">
            Health permits, liquor license, fire department, insurance, and tax compliance --
            we handle the entire paperwork stack so you can focus on your kitchen.
          </p>
          <Button href="/contact" size="lg">
            Start Your Restaurant
          </Button>
        </Container>
      </section>

      {/* Pain Points */}
      <section className="py-16">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
            What Keeps Restaurant Owners Up at Night
          </h2>
          <p className="text-[var(--text-muted)] mb-10">
            Opening a restaurant in NYC is one of the hardest things to do on paper. We make it simple.
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
            Your Path from Lease to Launch
          </h2>
          <p className="text-[var(--text-muted)] mb-10">
            Most clients are fully permitted in 60-90 days.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6">
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
            Everything you need from formation to first service.
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
              <p className="text-3xl font-bold text-[var(--blue-accent)]">60-90 Days</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Average time to full permits</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--blue-accent)]">All Agencies</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Health, SLA, Fire, DCA handled</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--blue-accent)]">One Invoice</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Formation + permits + insurance + tax</p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20">
        <Container className="text-center">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
            Ready to Open Your Restaurant?
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
            Most clients are fully permitted in 60-90 days. Let us handle the
            paperwork while you build your menu.
          </p>
          <Button href="/contact" size="lg">
            Start Your Restaurant
          </Button>
        </Container>
      </section>
    </>
  );
}
