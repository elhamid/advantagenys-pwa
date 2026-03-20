import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Free Business Tools | Advantage Services",
  description:
    "Free calculators and assessments for entrepreneurs in Queens, NYC. Tax savings estimator, business readiness checker, ITIN eligibility.",
  openGraph: {
    title: "Free Business Tools | Advantage Services",
    description:
      "Free calculators and assessments for entrepreneurs in Queens, NYC.",
    url: "https://advantagenys.com/tools",
  },
};

const tools = [
  {
    title: "Tax Savings Estimator",
    description:
      "Find out how much you could save with the right business structure and tax strategy.",
    href: "/tools/tax-savings-estimator",
    icon: "\u{1F4B0}",
    badge: "Most Popular",
  },
  {
    title: "Business Readiness Checker",
    description:
      "Are you ready to register your business? Take this 5-question assessment.",
    href: "/tools/business-readiness-checker",
    icon: "\u2705",
    badge: null,
  },
  {
    title: "ITIN Eligibility Checker",
    description:
      "Check if you qualify for an Individual Taxpayer Identification Number.",
    href: "/tools/itin-eligibility-checker",
    icon: "\u{1F194}",
    badge: "IRS Certified",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Free Business Tools",
  description:
    "Free calculators and assessments for entrepreneurs in Queens, NYC.",
  url: "https://advantagenys.com/tools",
  mainEntity: tools.map((tool) => ({
    "@type": "WebApplication",
    name: tool.title,
    description: tool.description,
    url: `https://advantagenys.com${tool.href}`,
    applicationCategory: "BusinessApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  })),
};

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="py-20 bg-[var(--blue-bg)]">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4">100% Free</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-6">
              Free Business Tools
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Quick calculators and assessments to help you make smarter
              decisions about your business. No signup required to start.
            </p>
          </div>
        </Container>
      </section>

      {/* Tools Grid */}
      <section className="py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="block group">
                <Card hover className="h-full flex flex-col">
                  <div className="text-4xl mb-4">{tool.icon}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-[var(--text)] group-hover:text-[var(--blue-accent)] transition-colors">
                      {tool.title}
                    </h2>
                    {tool.badge && <Badge>{tool.badge}</Badge>}
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm flex-1">
                    {tool.description}
                  </p>
                  <div className="mt-4 text-[var(--blue-accent)] font-semibold text-sm">
                    Start free &rarr;
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Trust bar */}
      <section className="py-12 bg-[var(--blue-bg)]">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[var(--text-secondary)] text-sm">
              These tools provide general estimates based on common scenarios.
              For personalized advice tailored to your specific situation,{" "}
              <Link
                href="/contact"
                className="text-[var(--blue-accent)] font-semibold hover:underline"
              >
                schedule a free consultation
              </Link>{" "}
              with our team.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
