import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";
import { makeCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Services",
  description:
    "ITIN registration, business formation, licensing, tax, insurance, and audit defense services for NYC small businesses. IRS Certified Acceptance Agent on staff.",
  alternates: { canonical: makeCanonical("/services") },
};

// Inline SVG icons keyed to SERVICES icon slugs — no new libraries
function ServiceIcon({ slug }: { slug: string }) {
  const icons: Record<string, React.ReactNode> = {
    "id-badge": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <circle cx="9" cy="12" r="2.5" />
        <path d="M15 9h3M15 12h3M15 15h3" />
      </svg>
    ),
    "building": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M3 21h18M6 21V7l6-4 6 4v14M10 21v-4h4v4" />
      </svg>
    ),
    "id-card": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M8 10h.01M8 14h.01M12 10h4M12 14h4" />
      </svg>
    ),
    "file-invoice-dollar": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="11" x2="12" y2="17" />
        <path d="M10 13c0-.8.9-1.5 2-1.5s2 .7 2 1.5-.9 1.5-2 1.5-2 .7-2 1.5.9 1.5 2 1.5 2-.7 2-1.5" />
      </svg>
    ),
    "shield-halved": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 2L4 6v5c0 5.25 3.5 10.15 8 11.5C16.5 21.15 20 16.25 20 11V6l-8-4z" />
      </svg>
    ),
    "scale-balanced": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 3v18M5 3l7 14 7-14M3 17h4M17 17h4" />
      </svg>
    ),
    "chart-line": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polyline points="3 17 7 12 11 14 15 9 19 6" />
        <line x1="3" y1="21" x2="21" y2="21" />
        <line x1="3" y1="3" x2="3" y2="21" />
      </svg>
    ),
    "gavel": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M14.5 3.5l6 6-9 9-6-6 9-9z" />
        <path d="M3 21l5.5-5.5" />
      </svg>
    ),
  };
  return (
    <>{icons[slug] ?? icons["building"]}</>
  );
}

interface ServiceCard {
  name: string;
  href: string;
  badge: string | null;
  description: string;
  services: string[];
  icon: string;
}

const serviceCards: ServiceCard[] = [
  {
    name: "ITIN Registration",
    href: "/resources/forms/itin-registration-form/",
    badge: "IRS Certified",
    description:
      "We certify your documents on-site — no mailing your original passport to the IRS. Fast turnaround for contractors, self-employed, and immigrant workers.",
    services: ["Form W-7 Preparation", "Passport Certification", "IRS Submission", "ITIN Renewal"],
    icon: "id-badge",
  },
  {
    name: "Business Formation",
    href: "/services/business-formation/",
    badge: "Most Popular",
    description:
      "LLC, C-Corp, S-Corp, and Non-Profit formation. Articles of Organization, EIN, operating agreements, and registered agent — done right the first time.",
    services: ["LLC Formation", "C-Corp / S-Corp", "Non-Profit 501(c)(3)", "EIN & Sales Tax Reg."],
    icon: "building",
  },
  {
    name: "Licensing & Permits",
    href: "/services/licensing/",
    badge: null,
    description:
      "NYC licensing is complex. We navigate the maze of city, state, and federal requirements for contractors, restaurants, and retail businesses.",
    services: ["Home Improvement Contractor", "Restaurant & Deli", "Food, Liquor, WIC/EBT", "General Contractor"],
    icon: "id-card",
  },
  {
    name: "Tax Services",
    href: "/services/tax-services/",
    badge: "IRS Certified",
    description:
      "Individual and business tax preparation, payroll and sales tax filings, and IRS representation — all under one roof.",
    services: ["Personal & Business Tax", "Payroll Tax", "Sales Tax", "IRS Representation"],
    icon: "file-invoice-dollar",
  },
  {
    name: "Insurance",
    href: "/services/insurance/",
    badge: null,
    description:
      "Licensed insurance broker with competitive rates. General liability, workers comp, and disability insurance tailored for small businesses.",
    services: ["General Liability", "Workers Compensation", "Disability Insurance"],
    icon: "shield-halved",
  },
  {
    name: "Audit Defense",
    href: "/services/audit-defense/",
    badge: "High Value",
    description:
      "What other firms won't touch. Workers comp audits, sales tax audits, unemployment insurance audits, and fine reduction.",
    services: ["Workers Comp Audit", "Sales Tax Audit", "Fine Reduction", "UI Audits"],
    icon: "scale-balanced",
  },
  {
    name: "Financial Services",
    href: "/services/financial-services/",
    badge: null,
    description:
      "Bookkeeping, financial statements, and analysis so you always know where your business stands.",
    services: ["Bookkeeping", "Financial Statements", "Cash Flow Analysis"],
    icon: "chart-line",
  },
  {
    name: "Immigration & Legal",
    href: "/services/legal/",
    badge: null,
    description:
      "Immigration petitions, citizenship applications, ITIN registration, and family law for immigrant entrepreneurs and their families.",
    services: ["I-130 Petition", "Citizenship (N-400)", "ITIN Registration", "Family Law"],
    icon: "gavel",
  },
];

const badgeVariant = (badge: string | null): "default" | "warning" =>
  badge === "High Value" ? "warning" : "default";

export default function ServicesPage() {
  return (
    <>
      {/* Page header */}
      <section className="py-16 sm:py-20 bg-[var(--blue-bg)]">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4">Full-Service Business Consulting</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-5 leading-tight">
              Every Service Your Business Needs.
              <br />
              <span className="text-[var(--blue-accent)]">One Firm.</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Formation to ongoing compliance — Advantage handles it all. No referrals,
              no runaround. One team that knows your business inside and out.
            </p>
          </div>
        </Container>
      </section>

      {/* Card grid */}
      <section className="py-14 sm:py-16">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviceCards.map((card) => (
              <div
                key={card.name}
                className="group flex flex-col rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] transition-all duration-[var(--transition)] hover:shadow-[var(--shadow-md)] hover:-translate-y-1"
              >
                {/* Card header */}
                <div className="p-5 pb-4 flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--blue-bg)] text-[var(--blue-accent)] flex items-center justify-center">
                      <ServiceIcon slug={card.icon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-[var(--text)] leading-snug">
                          {card.name}
                        </h2>
                        {card.badge && (
                          <Badge variant={badgeVariant(card.badge)} className="text-[11px]">
                            {card.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                    {card.description}
                  </p>

                  {/* Service tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {card.services.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--blue-bg)] text-[var(--text-muted)]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dual CTA footer */}
                <div className="px-5 pb-5 pt-3 border-t border-[var(--border)] flex items-center gap-2 mt-auto">
                  <Link
                    href={card.href}
                    className="flex-1 text-center text-sm font-semibold text-[var(--blue-accent)] hover:text-[var(--blue-vibrant)] transition-colors duration-150 py-2 active:scale-[0.97]"
                  >
                    Learn more →
                  </Link>
                  <div className="w-px h-5 bg-[var(--border)]" />
                  <Link
                    href="/book"
                    className="flex-1 text-center text-sm font-semibold text-white bg-[var(--blue-accent)] rounded-[var(--radius-sm)] px-3 py-2 hover:bg-[var(--blue-vibrant)] transition-colors duration-150 active:scale-[0.97] min-h-[44px] flex items-center justify-center"
                  >
                    Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Cross-sell value prop */}
      <section className="py-14 bg-[var(--blue-bg)]">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
              The Advantage of One Firm
            </h2>
            <p className="text-[var(--text-secondary)]">
              Most small businesses juggle three or four different providers for
              formation, licensing, tax, and insurance. That means repeating
              yourself, lost paperwork, and nobody looking at the full picture. We do.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "Cross-Service Awareness",
                body: "Your tax preparer knows your insurance policy. Your licensing specialist knows your entity structure. Nothing falls through the cracks.",
              },
              {
                title: "One Point of Contact",
                body: "Call one number, walk into one office. We route your question to the right specialist and follow up until it is resolved.",
              },
              {
                title: "Proactive Compliance",
                body: "We track deadlines across all your services — license renewals, tax filings, insurance audits — so you never get caught off guard.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] p-5 shadow-[var(--shadow-card)]"
              >
                <h3 className="text-base font-bold text-[var(--text)] mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Stragglers CTA */}
      <section className="py-16">
        <Container>
          <div
            className="rounded-[var(--radius-xl)] p-8 sm:p-10 text-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Not sure which service you need?
            </h2>
            <p className="text-white/75 mb-8 max-w-lg mx-auto text-base">
              Book a free consult and we will point you to the right one. No obligation — just clarity.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                href="/book"
                size="lg"
                className="!bg-white !text-[#4F56E8] hover:!bg-white/90 font-bold shadow-lg shadow-black/15 active:scale-[0.97]"
              >
                Book a Free Consultation
              </Button>
              <Button
                href={`tel:${PHONE.mainTel}`}
                variant="outline"
                size="lg"
                className="!border-white !text-white hover:!bg-white/10 active:scale-[0.97]"
              >
                Call {PHONE.main}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
