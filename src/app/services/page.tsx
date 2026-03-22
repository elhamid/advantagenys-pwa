import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Services",
  description:
    "ITIN registration, business formation, licensing, tax, insurance, and audit defense services for NYC small businesses. IRS Certified Acceptance Agent on staff.",
};

const serviceCategories = [
  {
    name: "ITIN Registration",
    href: "/resources/forms/itin-registration-form/",
    badge: "IRS Certified",
    description:
      "Individual Taxpayer Identification Number processing by our IRS Certified Acceptance Agent. We certify your documents on-site — no mailing your original passport to the IRS. Fast turnaround for contractors, self-employed individuals, and immigrant workers.",
    services: [
      "IRS Form W-7 Preparation",
      "Passport Certification (On-Site)",
      "Application Submission to IRS",
      "ITIN Renewal",
      "Status Tracking",
    ],
  },
  {
    name: "Business Formation",
    href: "/services/business-formation/",
    badge: "Most Popular",
    description:
      "LLC, C-Corp, S-Corp, and Non-Profit formation. We handle Articles of Organization, EIN applications, operating agreements, and registered agent service so you can focus on running your business.",
    services: [
      "LLC Formation",
      "C-Corporation",
      "S-Corporation",
      "Non-Profit 501(c)(3)",
      "Sales Tax Registration",
      "Payroll Registration",
    ],
  },
  {
    name: "Licensing & Permits",
    href: "/services/licensing/",
    badge: null,
    description:
      "NYC licensing is complex. We navigate the maze of city, state, and federal requirements for contractors, restaurants, delis, and retail businesses.",
    services: [
      "Home Improvement Contractor",
      "General Contractor",
      "Restaurant & Deli",
      "Food, Cigarette, Lottery, EBT, WIC",
      "Liquor License",
    ],
  },
  {
    name: "Tax Services",
    href: "/services/tax-services/",
    badge: "IRS Certified",
    description:
      "Individual and business tax preparation, ITIN processing by our IRS Certified Acceptance Agent, payroll and sales tax services, and IRS representation.",
    services: [
      "Individual Income Tax",
      "Corporation Tax",
      "Partnership & LLC Tax",
      "Payroll Tax",
      "Sales Tax",
      "ITIN Tax ID",
      "IRS Representation",
    ],
  },
  {
    name: "Insurance",
    href: "/services/insurance/",
    badge: null,
    description:
      "Licensed insurance broker with competitive rates. General liability, workers compensation, and disability insurance tailored for small businesses.",
    services: [
      "General Liability",
      "Workers Compensation",
      "Disability Insurance",
    ],
  },
  {
    name: "Audit Defense",
    href: "/services/audit-defense/",
    badge: "High Value",
    description:
      "What other firms won't touch. Workers comp audits, sales tax audits, unemployment insurance audits, and fine reduction. We fight to minimize your exposure.",
    services: [
      "Workers Comp Audit Defense",
      "Sales Tax Audit + Fine Reduction",
      "Unemployment Insurance Audits",
    ],
  },
  {
    name: "Immigration & Legal Services",
    href: "/services/legal/",
    badge: null,
    description:
      "Immigration petitions, citizenship applications, ITIN registration, and family law. Our legal team specializes in helping immigrant entrepreneurs and their families navigate the U.S. legal system.",
    services: [
      "Immigration (I-130 Petition)",
      "Citizenship (N-400)",
      "ITIN Registration",
      "Divorce & Family Law",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 bg-[var(--blue-bg)]">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4">Full-Service Business Consulting</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-6">
              Every Service Your Business Needs. One Firm.
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              From the day you form your business to ongoing tax filing,
              licensing, insurance, and audit defense — Advantage handles it
              all. No referrals, no runaround. One team that knows your
              business inside and out.
            </p>
          </div>
        </Container>
      </section>

      {/* Service Categories */}
      <section className="py-16">
        <Container>
          <div className="space-y-8">
            {serviceCategories.map((category) => (
              <Link key={category.name} href={category.href} className="block">
                <Card hover className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-2xl font-bold text-[var(--text)]">
                        {category.name}
                      </h2>
                      {category.badge && (
                        <Badge variant={category.badge === "High Value" ? "warning" : "default"}>
                          {category.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[var(--text-secondary)] mb-4">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.services.map((service) => (
                        <span
                          key={service}
                          className="text-xs px-2 py-1 rounded-full bg-[var(--blue-bg)] text-[var(--text-muted)]"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center text-[var(--blue-accent)] font-semibold whitespace-nowrap">
                    Learn more &rarr;
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Cross-sell value prop */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
              The Advantage of One Firm
            </h2>
            <p className="text-[var(--text-secondary)]">
              Most small businesses juggle three or four different providers for
              formation, licensing, tax, and insurance. That means repeating
              yourself, lost paperwork, and nobody looking at the full picture.
              We do.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Cross-Service Awareness
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Your tax preparer knows your insurance policy. Your licensing
                specialist knows your entity structure. Nothing falls through
                the cracks.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                One Point of Contact
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Call one number, walk into one office. We route your question to
                the right specialist and follow up until it is resolved.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Proactive Compliance
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                We track deadlines across all your services — license renewals,
                tax filings, insurance audits — so you never get caught off
                guard.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
              Not Sure Where to Start?
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Call us for a free consultation. We will assess what your
              business needs and build a plan — no obligation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/contact" size="lg">
                Free Consultation
              </Button>
              <Button href={`tel:${PHONE.mainTel}`} variant="outline" size="lg">
                Call {PHONE.main}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
