import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Business Licensing in Queens, NYC | Advantage Services",
  description:
    "Business licensing and permit services in Queens, NYC for contractors, restaurants, delis, and retail businesses. HIC, liquor, food, and specialty licenses. Advantage Services.",
};

const licenses = [
  {
    name: "Home Improvement Contractor (HIC) License",
    description:
      "Required by NYC Consumer Affairs for anyone performing home improvement work over $200 in New York City. Includes renovations, painting, plumbing, electrical, roofing, and general remodeling. Failure to obtain this license can result in fines up to $2,500 per violation.",
    requirements: [
      "Completed application with NYC DCA",
      "Proof of general liability insurance",
      "Workers compensation and disability insurance",
      "Home improvement salesperson registration",
      "Background check and fingerprinting",
    ],
  },
  {
    name: "General Contractor License",
    description:
      "For commercial and large-scale construction projects. General contractors coordinate subcontractors, pull building permits, and oversee job sites. Licensing requirements vary by municipality and project scope.",
    requirements: [
      "Business entity formation",
      "General liability insurance (minimum coverage varies)",
      "Workers compensation insurance",
      "Bonding (where required)",
      "Safety training certifications (OSHA)",
    ],
  },
  {
    name: "Restaurant / Deli License",
    description:
      "Opening a restaurant or deli in NYC requires multiple overlapping permits from the Department of Health, Department of Buildings, Fire Department, and more. We manage the full application stack so you can focus on your menu.",
    requirements: [
      "Food Service Establishment Permit (DOH)",
      "Certificate of Occupancy or Letter of No Objection",
      "Food Protection Certificate",
      "Fire Department permits (if applicable)",
      "Sidewalk cafe license (if applicable)",
    ],
  },
  {
    name: "Food, Cigarette, Lottery, EBT & WIC",
    description:
      "Retail stores, bodegas, and grocery stores need a stack of specialty licenses to sell regulated products. Each has its own application process, inspections, and renewal timeline. We handle them as a bundle.",
    requirements: [
      "Food Store License (NYC DCA)",
      "Cigarette Retail Dealer License",
      "NYS Lottery Retailer application",
      "SNAP/EBT retailer authorization (USDA)",
      "WIC vendor application (NYS DOH)",
    ],
  },
  {
    name: "Liquor License",
    description:
      "New York State Liquor Authority (SLA) licenses are among the most complex and time-consuming permits to obtain. The process involves community board notification, a 30-day posting period, and detailed application review. We guide you through every step.",
    requirements: [
      "SLA application (On-Premises or Off-Premises)",
      "Community Board notification and 30-day posting",
      "500-foot rule compliance (churches, schools)",
      "Premises diagram and lease documentation",
      "Background check for all principals",
    ],
  },
];

export default function LicensingPage() {
  return (
    <>
      <JsonLd
        type="Service"
        serviceName="Business Licensing & Permits"
        serviceDescription="Business licensing and permit services for contractors, restaurants, delis, and retail businesses in NYC. Home improvement, general contractor, liquor, food, and specialty licenses."
        serviceUrl="https://advantagenys.com/services/licensing"
      />
      <JsonLd
        type="BreadcrumbList"
        items={[
          { name: "Home", url: "https://advantagenys.com" },
          { name: "Services", url: "https://advantagenys.com/services" },
          { name: "Licensing & Permits", url: "https://advantagenys.com/services/licensing" },
        ]}
      />
      {/* Hero */}
      <section className="py-20 bg-[var(--blue-bg)]">
        <Container>
          <Badge className="mb-4">Licensing & Permits</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-6 max-w-3xl">
            We Navigate the Licensing Maze So You Do Not Have To
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mb-8">
            NYC has some of the most complex licensing requirements in the
            country. Multiple agencies, overlapping jurisdictions, and
            regulations that change frequently. We have been guiding businesses
            through the process since 2005.
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-3">{PHONE.main} &middot; Call or WhatsApp</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button href="/contact" size="lg">
              Get Licensed
            </Button>
            <Button href={PHONE.whatsappLink} variant="outline" size="lg">
              WhatsApp Us
            </Button>
          </div>
        </Container>
      </section>

      {/* Why licensing matters */}
      <section className="py-16">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
              Why Proper Licensing Matters
            </h2>
            <p className="text-[var(--text-secondary)]">
              Operating without the required licenses exposes you to fines,
              forced closure, and personal liability. In NYC, a single
              unlicensed contractor violation can mean $2,500 in penalties.
              Restaurants found operating without permits face immediate
              shutdown. We make sure you are fully compliant before you open
              your doors.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Avoid Fines
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                NYC enforcement is aggressive. We ensure every license and
                permit is in place before you start operating.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Save Time
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                We know which forms to file, which agencies to contact, and how
                to avoid common delays that cost weeks or months.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Stay Current
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Licenses expire and regulations change. We track your renewal
                dates and notify you before deadlines hit.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* License Types */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">
            Licenses We Handle
          </h2>
          <div className="space-y-8">
            {licenses.map((license) => (
              <Card key={license.name}>
                <h3 className="text-xl font-bold text-[var(--text)] mb-3">
                  {license.name}
                </h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  {license.description}
                </p>
                <p className="text-sm font-semibold text-[var(--text)] mb-2">
                  What we handle:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {license.requirements.map((req) => (
                    <li
                      key={req}
                      className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
                    >
                      <span className="text-[var(--green)] mt-0.5">&#10003;</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Industry segments */}
      <section className="py-16">
        <Container>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6 text-center">
            Industries We Specialize In
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link href="/industries/contractors/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Contractors
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  HIC license, general contractor, insurance requirements — the
                  full compliance package.
                </p>
              </Card>
            </Link>
            <Link href="/industries/restaurants/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Restaurants & Delis
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  DOH permits, liquor license, food handler certification, and
                  ongoing compliance.
                </p>
              </Card>
            </Link>
            <Link href="/services/insurance/">
              <Card hover>
                <h3 className="font-semibold text-[var(--text)] mb-1">
                  Insurance &rarr;
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Most licenses require proof of insurance. We bundle licensing
                  with insurance for a seamless process.
                </p>
              </Card>
            </Link>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
              Need a License? Let Us Handle It.
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Tell us your business type and we will identify every license and
              permit you need. Free consultation, no obligation.
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
        </Container>
      </section>
    </>
  );
}
