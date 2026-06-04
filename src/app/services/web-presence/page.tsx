import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Get Your Business Found Online | Websites & Google Setup — Advantage Services",
  description:
    "A fast, modern website in your language, plus Google Business Profile setup, reviews, and getting found online. Built for small businesses and immigrant entrepreneurs in NYC. From $49/month. No contracts.",
};

const tiers = [
  {
    name: "Foundation",
    tagline: "Get Found",
    price: "$49",
    period: "/mo",
    setup: "$199 one-time setup",
    blurb: "Everything you need to exist online and show up when people search for you.",
    featured: false,
    cta: "Start here",
    features: [
      "Professional website that installs like an app (PWA)",
      "Built in your language + English",
      "Google Business Profile set up and verified",
      "Click-to-call, directions, and hours",
      "Contact form straight to your inbox",
      "Found by Google and AI assistants",
      "Hosting, security, and updates included",
      "Light text edits each quarter",
    ],
  },
  {
    name: "Growth",
    tagline: "Get Found + Get Trusted",
    price: "$99",
    period: "/mo",
    setup: "$349 one-time setup",
    blurb: "Turn the people who find you into customers, with reviews and a steady presence.",
    featured: true,
    cta: "Grow my business",
    features: [
      "Everything in Foundation, plus:",
      "Review booster — collect Google reviews in one tap",
      "Monthly Google post, done for you",
      "Facebook and Instagram page set up",
      "Email list and a monthly newsletter",
      "Fresh photos with AI-generated images",
      "Simple monthly visibility report",
    ],
  },
  {
    name: "Commerce",
    tagline: "Get Paid",
    price: "$149",
    period: "/mo",
    setup: "$499 one-time setup",
    blurb: "Take bookings and payments right on your own site.",
    featured: false,
    cta: "Sell online",
    features: [
      "Everything in Growth, plus:",
      "Online booking, deposits, and payments (Stripe)",
      "Secure checkout — money goes to your own account",
      "Service menu or product pages",
      "Latest AI and Google SEO tuning, kept current",
      "Priority support",
    ],
  },
];

const addOns = [
  { name: "Ad campaign setup", note: "one-time", desc: "Google or Facebook ads built for you. You fund your own ad budget on your own card." },
  { name: "Online payments setup", note: "one-time", desc: "Secure Stripe checkout connected to your own account." },
  { name: "Extra language", note: "add-on", desc: "Reach more of your community." },
  { name: "AI photo and branding pack", note: "one-time", desc: "Custom images and a simple logo." },
  { name: "Extra pages or menu", note: "add-on", desc: "Services, gallery, or a full menu." },
  { name: "Managed advertising", note: "monthly", desc: "We run and tune your ads each month." },
];

const trust = [
  { title: "No contracts", desc: "Month to month. Cancel anytime — no lock-in and no fine print." },
  { title: "Honest, flat pricing", desc: "You always know exactly what you pay and what you get." },
  { title: "In your language", desc: "Your site speaks to your community and to English-speaking customers." },
  { title: "Found by Google and AI", desc: "Optimized for Google Maps and the new AI search assistants people now use." },
];

const faqs = [
  {
    question: "Why do I need more than a Facebook page?",
    answer:
      "A Facebook page is rented space you do not control, and it rarely shows up when someone searches Google for your service. Your own website plus a verified Google Business Profile is what puts you on the map — literally — when a customer is looking for you.",
  },
  {
    question: "What is a PWA, and why does it matter?",
    answer:
      "A PWA (Progressive Web App) is a website that loads instantly and can be saved to a customer's phone like an app, with no app store needed. It feels faster and more professional than an ordinary website, which is how most of your customers already browse.",
  },
  {
    question: "Do I need to be technical?",
    answer:
      "No. We set up everything — the website, your Google profile, and your social pages. You just tell us about your business, and we handle the rest.",
  },
  {
    question: "Can I really cancel anytime?",
    answer:
      "Yes. Everything is month to month with no contract. If it is not working for you, you can stop, with no penalty.",
  },
  {
    question: "Do you take a cut of my sales?",
    answer:
      "On the Commerce plan, payments go to your own account through Stripe. A small platform fee may apply per transaction, and it is always disclosed up front — never hidden.",
  },
  {
    question: "How do advertising charges work?",
    answer:
      "We set up your Google or Facebook ads, but the ad budget is billed directly to your own card in your own ad account. You see those charges separately from us, so it is always clear what you pay the ad platform versus what you pay Advantage.",
  },
];

export default function WebPresencePage() {
  return (
    <>
      <JsonLd
        type="Service"
        serviceName="Web Presence and Local SEO"
        serviceDescription="Modern websites, Google Business Profile setup, reviews, and getting found online for small businesses and immigrant entrepreneurs in NYC. From $49/month, no contracts."
        serviceUrl="https://advantagenys.com/services/web-presence"
      />
      <JsonLd
        type="BreadcrumbList"
        items={[
          { name: "Home", url: "https://advantagenys.com" },
          { name: "Services", url: "https://advantagenys.com/services" },
          { name: "Web Presence", url: "https://advantagenys.com/services/web-presence" },
        ]}
      />
      <JsonLd type="FAQPage" faqs={faqs} />

      {/* Hero */}
      <section className="py-20 bg-[var(--blue-bg)]">
        <Container>
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)] mb-4">
            <span className="inline-block h-px w-7 bg-[var(--gold)]" aria-hidden />
            Web Presence
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-6 max-w-3xl">
            Get Your Business Found Online
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mb-8">
            A fast, modern website — in your language — that helps customers find
            you on Google, trust you, and reach you. We set up everything: the
            site, your Google profile, and your reviews. No tech skills, no
            contracts, cancel anytime.
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-3">
            {PHONE.main} &middot; Call or WhatsApp
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button href="/contact" size="lg">
              Get Found Online
            </Button>
            <Button href={PHONE.whatsappLink} variant="outline" size="lg">
              WhatsApp Us
            </Button>
          </div>
        </Container>
      </section>

      {/* The Gap */}
      <section className="py-16">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <p className="flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)] mb-4">
              <span className="inline-block h-px w-7 bg-[var(--gold)]" aria-hidden />
              The Gap
              <span className="inline-block h-px w-7 bg-[var(--gold)]" aria-hidden />
            </p>
            <h2 className="text-3xl font-bold text-[var(--text)] mb-5">
              You exist. But can customers find you?
            </h2>
            <p className="text-[var(--text-secondary)] mb-10">
              Most small businesses lose customers before they ever make contact
              — not because of price or quality, but because they are invisible
              at the moment someone is searching. Here is where that happens.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Not on the map
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                When someone searches your service nearby, you do not appear on
                Google Maps — so the call goes to a competitor who does.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Nothing to trust
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                No website and no reviews means a new customer has no way to
                judge whether you are real, professional, and worth a call.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                Hard to reach
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                A phone number buried in a social post is friction. People tap
                away before they ever reach you.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
              Simple plans. Grow when you are ready.
            </h2>
            <p className="text-[var(--text-secondary)]">
              Start affordable and add more only when it pays off. Every plan is
              month to month, with no contract.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {tiers.map((t) => (
              <Card
                key={t.name}
                className={
                  t.featured
                    ? "flex flex-col border-2 border-[var(--blue-accent)] shadow-[var(--shadow-lg)] lg:-translate-y-3"
                    : "flex flex-col"
                }
              >
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--blue-accent)]">
                    {t.name}
                  </h3>
                  {t.featured && <Badge>Most popular</Badge>}
                </div>
                <p className="text-xl font-bold text-[var(--text)] mb-4">
                  {t.tagline}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[var(--text)]">
                    {t.price}
                  </span>
                  <span className="text-[var(--text-muted)] font-medium">
                    {t.period}
                  </span>
                </div>
                <p className="text-sm text-[var(--gold)] font-semibold mt-1 mb-4">
                  {t.setup}
                </p>
                <p className="text-[var(--text-secondary)] text-sm mb-5">
                  {t.blurb}
                </p>
                <ul className="space-y-2 mb-7">
                  {t.features.map((f, i) => {
                    const isHead = i === 0 && f.endsWith("plus:");
                    return (
                      <li
                        key={f}
                        className={
                          isHead
                            ? "text-xs font-semibold uppercase tracking-wide text-[var(--text)] pt-1"
                            : "text-sm text-[var(--text-secondary)] flex items-start gap-2"
                        }
                      >
                        {!isHead && (
                          <span className="text-[var(--green)] mt-0.5">
                            &#10003;
                          </span>
                        )}
                        {f}
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-auto">
                  <Button
                    href="/contact"
                    variant={t.featured ? "primary" : "outline"}
                    className="w-full"
                  >
                    {t.cta}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-[var(--text-muted)] mt-8">
            Month to month. No contracts. Cancel anytime. Prices in USD.
          </p>

          {/* Bundle discount callout */}
          <div className="mt-8 max-w-2xl mx-auto rounded-[var(--radius-lg)] border border-[var(--gold)]/40 bg-amber-50/50 px-6 py-4 flex items-start gap-3">
            <span className="flex-shrink-0 text-[var(--gold)] mt-0.5" aria-hidden>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </span>
            <p className="text-sm text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text)]">Bundle &amp; save —</span>{" "}
              Save $50 on setup when you bundle Web Presence with any other Advantage service — formation, tax, licensing, or insurance.
            </p>
          </div>
        </Container>
      </section>

      {/* Bundle / cross-sell */}
      <section className="py-16">
        <Container>
          <Card className="bg-[var(--gradient-primary)] border-0 text-white">
            <div className="max-w-3xl">
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold-bright)] mb-4">
                <span className="inline-block h-px w-7 bg-[var(--gold-bright)]" aria-hidden />
                Starting a business?
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Form it, build it, and get found — all under one roof.
              </h2>
              <p className="text-white/85 mb-6">
                Most new owners stitch together a filing service, a web
                freelancer, and a marketing person who never talk to each other.
                We do all of it together: set up your LLC, build your website,
                and put you on Google — one team that already knows your
                business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button href="/services/business-formation/" variant="secondary">
                  Business Formation
                </Button>
                <Button
                  href="/industries/immigrant-entrepreneurs/"
                  variant="secondary"
                >
                  For Immigrant Entrepreneurs
                </Button>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      {/* Why us */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
              Why Advantage
            </h2>
            <p className="text-[var(--text-secondary)]">
              Backed by a firm that has set up 1,700+ businesses and serves
              5,700+ tax clients across NYC.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trust.map((item) => (
              <Card key={item.title}>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Add-ons */}
      <section className="py-16">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
              Add what you need, when you need it
            </h2>
            <p className="text-[var(--text-secondary)]">
              Start simple. Bolt on extras only when you are ready — and only pay
              for the effort it takes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {addOns.map((a) => (
              <Card key={a.name}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-[var(--text)]">{a.name}</h3>
                  <span className="text-xs font-semibold text-[var(--gold)] whitespace-nowrap uppercase tracking-wide">
                    {a.note}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{a.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* AI Add-on */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="rounded-[var(--radius-xl)] border border-[var(--gold)]/30 bg-[var(--surface)] shadow-[var(--shadow-md)] overflow-hidden">
              <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, var(--gold) 0%, var(--gold-bright) 100%)" }} />
              <div className="p-8 sm:p-10">
                <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)] mb-4">
                  <span className="inline-block h-px w-7 bg-[var(--gold)]" aria-hidden />
                  Optional add-on
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4 leading-tight">
                  AI Assistant — done for you
                </h2>
                <p className="text-[var(--text-secondary)] leading-relaxed mb-6 max-w-xl">
                  An AI-assisted chat for your website that greets customers in their own language and captures leads around the clock — set up and managed by us, with a real person always in the loop. It removes the language and after-hours barriers without replacing the personal touch your customers trust.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Greets and answers in your customer’s language",
                    "Captures and routes leads 24/7",
                    "A real person stays in the loop — AI amplifies, never replaces",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="flex-shrink-0 text-[var(--gold)] mt-0.5" aria-hidden>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-sm text-[var(--text-secondary)] leading-relaxed pt-0.5">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button href="/contact" variant="outline">
                  Talk to us about AI
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-[var(--blue-bg)]">
        <Container>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">
            Common Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            {faqs.map((f) => (
              <div key={f.question}>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  {f.question}
                </h3>
                <p className="text-[var(--text-secondary)]">{f.answer}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
              Ready to be found?
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Book a free consultation. We will look at how customers find you
              today and put together the right plan — no obligation.
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-3">
              {PHONE.main} &middot; Call or WhatsApp
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/contact" size="lg">
                Free Consultation
              </Button>
              <Button
                href={`tel:${PHONE.mainTel}`}
                variant="outline"
                size="lg"
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
