import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Get Found. Get Calls. Get Paid. | Websites + Google + AI — Advantage Services",
  description:
    "A modern website, your Google profile, and an AI that answers customers — set up for you, in your language. Built for small businesses and immigrant entrepreneurs in NYC. From $49/month. No contracts.",
};

/* ── Brand logos (inline SVG — no external image domains) ─────────────── */

function GoogleLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function MapPinLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#34A853" d="M12 2C7.6 2 4 5.6 4 10c0 5.2 6.5 11.4 7.3 12.1.4.4 1 .4 1.4 0C13.5 21.4 20 15.2 20 10c0-4.4-3.6-8-8-8z" />
      <circle cx="12" cy="10" r="3" fill="#fff" />
    </svg>
  );
}

function StripeLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 25" className={className} aria-hidden>
      <path
        fill="#635BFF"
        d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-8.1-2.9h4.28c0-1.85-1.06-2.62-2.1-2.62-1.06 0-2.18.78-2.18 2.62zm-12.84-6.18c-1.66 0-2.73.78-3.32 1.32l-.22-1.05h-3.73v19.05l4.24-.9.01-4.62c.61.44 1.51 1.07 3.01 1.07 3.04 0 5.81-2.45 5.81-7.84-.01-4.93-2.81-7.03-5.8-7.03zm-1.02 10.81c-1.01 0-1.6-.36-2.01-.8l-.03-6.32c.44-.49 1.05-.83 2.04-.83 1.56 0 2.64 1.75 2.64 3.96 0 2.26-1.06 4-2.64 4zM26.34 4.12l4.26-.91V0l-4.26.91v3.21zm0 1.36h4.26v14.27h-4.26V5.48zm-4.58 1.25l-.27-1.25h-3.66v14.27h4.24v-9.67c1-1.31 2.7-1.07 3.22-.88V5.48c-.55-.21-2.54-.59-3.53 1.25zm-8.52-4.8l-4.14.88-.02 13.6c0 2.51 1.89 4.36 4.4 4.36 1.39 0 2.41-.26 2.97-.56v-3.45c-.54.22-3.23 1-3.23-1.51V9.1h3.23V5.48h-3.23l.05-3.55zM4.24 9.82c0-.66.54-.92 1.44-.92 1.29 0 2.92.39 4.21 1.09V6c-1.41-.56-2.8-.78-4.21-.78C2.24 5.22 0 7.03 0 10.05c0 4.71 6.48 3.96 6.48 5.99 0 .78-.68 1.03-1.63 1.03-1.41 0-3.21-.58-4.63-1.36v4.05c1.58.68 3.18.97 4.63.97 3.54 0 5.94-1.75 5.94-4.81-.01-5.08-6.55-4.18-6.55-6.1z"
      />
    </svg>
  );
}

function WhatsAppLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#25D366"
        d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24z"
      />
      <path
        fill="#fff"
        d="M9.1 7.05c-.2-.45-.41-.46-.6-.47l-.51-.01c-.18 0-.46.07-.71.34s-.93.91-.93 2.22.95 2.58 1.08 2.76c.13.18 1.86 2.98 4.59 4.05 2.27.9 2.73.72 3.22.67.49-.04 1.58-.64 1.8-1.27.22-.62.22-1.16.16-1.27-.07-.11-.25-.18-.52-.31s-1.58-.78-1.83-.87c-.24-.09-.42-.13-.6.14-.18.27-.69.87-.85 1.05-.16.18-.31.2-.58.07-.27-.14-1.13-.42-2.15-1.33-.79-.71-1.33-1.58-1.49-1.85-.16-.27-.02-.42.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.59-1.46-.83-2z"
      />
    </svg>
  );
}

/* ── Data ─────────────────────────────────────────────────────────────── */

const tiers = [
  {
    name: "Foundation",
    tagline: "Get Found",
    price: "$49",
    period: "/mo",
    setup: "$199 one-time setup",
    blurb: "We put you on the map. A real website and a verified Google profile, so people find you.",
    aiLine: null as string | null,
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
    tagline: "Get Trusted",
    price: "$99",
    period: "/mo",
    setup: "$349 one-time setup",
    blurb: "Turn the people who find you into customers — and never miss a message again.",
    aiLine: "Your AI answers customers and captures every lead, 24/7 — in their language.",
    featured: true,
    cta: "Grow my business",
    features: [
      "Everything in Foundation, plus:",
      "AI assistant that answers every message, day and night",
      "Review booster — collect Google reviews in one tap",
      "Monthly Google post, done for you",
      "Facebook and Instagram page set up",
      "Email list and a monthly newsletter",
      "Simple monthly visibility report",
    ],
  },
  {
    name: "Commerce",
    tagline: "Get Paid",
    price: "$149",
    period: "/mo",
    setup: "$499 one-time setup",
    blurb: "Let customers book and pay right on your own site.",
    aiLine: "Your AI books the appointment and takes the deposit.",
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
    question: "Is the AI really like a real receptionist?",
    answer:
      "It answers every message in seconds, day or night, in your customer's language. It books appointments and captures leads — but a real person stays in the loop, so nothing important slips through. Like a receptionist, without the payroll.",
  },
  {
    question: "What is a PWA, and why does it matter?",
    answer:
      "A PWA (Progressive Web App) is a website that loads instantly and can be saved to a customer's phone like an app, with no app store needed. It feels faster and more professional than an ordinary website, which is how most of your customers already browse.",
  },
  {
    question: "Do I need to be technical?",
    answer:
      "No. We set up everything — the website, your Google profile, your social pages, and your AI assistant. You just tell us about your business, and we handle the rest.",
  },
  {
    question: "Can I really cancel anytime?",
    answer:
      "Yes. Everything is month to month with no contract. If it is not working for you, you can stop, with no penalty.",
  },
  {
    question: "Whose Stripe and ad account is it?",
    answer:
      "Yours. On the Commerce plan, payments go to your own Stripe account. When we run ads, the ad budget is billed directly to your own card in your own ad account — so it is always clear what you pay the ad platform versus what you pay Advantage.",
  },
];

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function WebPresencePage() {
  return (
    <>
      <JsonLd
        type="Service"
        serviceName="Web Presence and Local SEO"
        serviceDescription="Modern websites, Google Business Profile setup, an AI assistant that answers customers, reviews, and getting found online for small businesses and immigrant entrepreneurs in NYC. From $49/month, no contracts."
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

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--navy)] py-20 sm:py-24">
        {/* atmosphere */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.6]"
          style={{
            background:
              "radial-gradient(900px circle at 78% 8%, rgba(79,86,232,0.45), transparent 55%), radial-gradient(700px circle at 12% 95%, rgba(212,151,10,0.20), transparent 55%)",
          }}
          aria-hidden
        />
        <Container>
          <div className="relative">
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[var(--gold-bright)] mb-6">
              <span className="inline-block h-px w-8 bg-[var(--gold-bright)]" aria-hidden />
              Web Presence
            </p>

            <h1 className="text-[clamp(2.5rem,8vw,5.25rem)] font-extrabold leading-[0.95] tracking-tight text-white mb-6">
              Get found.
              <br />
              Get calls.
              <br />
              <span className="text-[var(--gold-bright)]">Get paid.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mb-8 leading-relaxed">
              A modern website, your Google profile, and an AI that answers
              customers — set up for you, in your language.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                href="/contact"
                size="lg"
                className="!bg-[var(--gold)] hover:!opacity-90 !text-white font-bold shadow-lg shadow-[rgba(212,151,10,0.35)]"
              >
                Get Found Online
              </Button>
              <Button
                href={PHONE.whatsappLink}
                size="lg"
                className="!bg-white/10 !border !border-white/25 !text-white hover:!bg-white/20 backdrop-blur-sm"
              >
                <WhatsAppLogo className="w-5 h-5 mr-2" />
                WhatsApp Us
              </Button>
            </div>

            {/* Billboard trust row — recognized on sight */}
            <div className="flex flex-col gap-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/45">
                Works with the tools your customers already trust
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-md">
                  <GoogleLogo className="w-5 h-5" />
                  <span className="text-sm font-semibold text-slate-800">Google</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-md">
                  <MapPinLogo className="w-5 h-5" />
                  <span className="text-sm font-semibold text-slate-800">Google Maps</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-md">
                  <StripeLogo className="h-4 w-auto" />
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-md">
                  <WhatsAppLogo className="w-5 h-5" />
                  <span className="text-sm font-semibold text-slate-800">WhatsApp</span>
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Local proof: the search moment ─────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <p className="flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)] mb-5">
              <span className="inline-block h-px w-7 bg-[var(--gold)]" aria-hidden />
              The moment that matters
              <span className="inline-block h-px w-7 bg-[var(--gold)]" aria-hidden />
            </p>

            {/* Search bar visual */}
            <div className="mx-auto mb-7 max-w-xl">
              <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-[var(--shadow-md)] text-left">
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <span className="text-base sm:text-lg text-[var(--text)] font-medium">
                  halal butcher near Jackson Heights
                </span>
                <span className="ml-auto h-5 w-px bg-[var(--text-muted)]/40 animate-pulse" aria-hidden />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4 leading-snug">
              Someone is searching for your business right now.
            </h2>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              We make sure they find <span className="font-semibold text-[var(--text)]">you</span> —
              not your competitor down the block.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Done-for-you strip ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[var(--navy)] text-white">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              You do nothing technical. We do all of it.
            </h2>
            <p className="text-white/70">
              Three steps. You only handle the first one.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "You tell us about your business",
                desc: "Your name, what you do, your phone number. A quick chat — in your language.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                ),
              },
              {
                step: "2",
                title: "We set up everything",
                desc: "Website, Google profile, reviews, social pages, and your AI assistant. All built for you.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden>
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                ),
              },
              {
                step: "3",
                title: "Customers find you",
                desc: "You show up on Google, the calls come in, and your AI answers them — even at 2am.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden>
                    <path d="M12 2C7.6 2 4 5.6 4 10c0 5.2 6.5 11.4 7.3 12.1.4.4 1 .4 1.4 0C13.5 21.4 20 15.2 20 10c0-4.4-3.6-8-8-8z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                ),
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] p-7"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gold)] text-[var(--navy)]">
                    {s.icon}
                  </span>
                  <span className="text-4xl font-extrabold text-white/15 tabular-nums">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── The Gap ────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)] mb-4">
              <span className="inline-block h-px w-7 bg-[var(--gold)]" aria-hidden />
              The Gap
              <span className="inline-block h-px w-7 bg-[var(--gold)]" aria-hidden />
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4">
              You exist. But can customers find you?
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Most small businesses lose customers before they ever make contact
              — not because of price or quality, but because they are invisible
              at the moment someone is searching.
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
                No one answers
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                A message at night or in another language goes unanswered — and
                the customer moves on before morning.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* ── Meet your AI assistant ─────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[var(--blue-bg)]">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: framing */}
            <div>
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)] mb-4">
                <span className="inline-block h-px w-7 bg-[var(--gold)]" aria-hidden />
                Included in Growth &amp; Commerce
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4 leading-tight">
                Meet your AI assistant.
                <br />
                <span className="text-[var(--gold)]">An employee you hired —</span> without the payroll.
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6 max-w-xl">
                It answers every message the moment it arrives, in your
                customer&apos;s language. It captures the lead, books the
                appointment, and never sleeps. A real person stays in the loop —
                the AI works for you, it does not replace you.
              </p>
              <ul className="space-y-3">
                {[
                  "Answers every message — even at 2am.",
                  "Replies in your customer's language.",
                  "Captures and books every lead, 24/7.",
                  "A real person always stays in the loop.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="flex-shrink-0 text-[var(--green)] mt-0.5" aria-hidden>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="text-[var(--text-secondary)] leading-relaxed pt-0.5">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: chat mock */}
            <div className="relative">
              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] overflow-hidden">
                <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--gold)] text-white font-bold">
                    A
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--surface)] bg-[var(--green)]" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">Your AI Assistant</p>
                    <p className="text-xs text-[var(--green)] font-medium">Online · replies in seconds</p>
                  </div>
                  <span className="ml-auto text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">2:14 AM</span>
                </div>
                <div className="space-y-3 p-5">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-[var(--blue-bg)] px-4 py-2.5 text-sm text-[var(--text)]">
                    ¿Están abiertos mañana? Necesito una cita.
                  </div>
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-[var(--gold)] px-4 py-2.5 text-sm text-white">
                    ¡Hola! Sí, abrimos a las 10 AM. Le reservé una cita a las 11. ¿Su nombre y teléfono, por favor?
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-[var(--blue-bg)] px-4 py-2.5 text-sm text-[var(--text)]">
                    Maria, 917-555-0142. Gracias!
                  </div>
                </div>
                <div className="border-t border-[var(--border)] bg-[var(--bg-section)] px-5 py-3 text-center text-xs text-[var(--text-muted)]">
                  Lead captured &amp; sent to your inbox — a real person reviews it.
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-3">
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
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  {t.blurb}
                </p>

                {t.aiLine && (
                  <div className="mb-5 flex items-start gap-2.5 rounded-[var(--radius)] border border-[var(--gold)]/30 bg-amber-50/60 px-3.5 py-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0 text-[var(--gold)] mt-0.5" aria-hidden>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <p className="text-sm font-semibold text-[var(--text)] leading-snug">
                      {t.aiLine}
                    </p>
                  </div>
                )}

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

      {/* ── Bundle / cross-sell ────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[var(--blue-bg)]">
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

      {/* ── Why us ─────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-3">
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

      {/* ── Add-ons ────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[var(--blue-bg)]">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-3">
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

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-10 text-center">
            Common Questions
          </h2>
          <div className="max-w-3xl mx-auto divide-y divide-[var(--border)]">
            {faqs.map((f) => (
              <div key={f.question} className="py-5 first:pt-0 last:pb-0">
                <h3 className="text-base font-semibold text-[var(--text)] mb-1.5">
                  {f.question}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[var(--navy)] text-white">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight">
              Get found. Get calls. <span className="text-[var(--gold-bright)]">Get paid.</span>
            </h2>
            <p className="text-white/75 mb-8 max-w-xl mx-auto">
              Book a free consultation. We will look at how customers find you
              today and put together the right plan — no obligation.
            </p>
            <p className="text-sm text-white/55 mb-5">
              {PHONE.main} &middot; Call or WhatsApp
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                href="/contact"
                size="lg"
                className="!bg-[var(--gold)] hover:!opacity-90 !text-white font-bold shadow-lg shadow-[rgba(212,151,10,0.35)]"
              >
                Free Consultation
              </Button>
              <Button
                href={`tel:${PHONE.mainTel}`}
                size="lg"
                className="!bg-white/10 !border !border-white/25 !text-white hover:!bg-white/20 backdrop-blur-sm"
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
