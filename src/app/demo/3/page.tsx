"use client";

import { useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useInView,
} from "framer-motion";
import { PHONE, ADDRESS } from "@/lib/constants";

/* ─── palette ─── */
const C = {
  bg: "#0A0A0F",
  surface: "#141420",
  border: "#1E1E30",
  text: "#F0F0F5",
  muted: "#8888A0",
  accent: "#4F56E8",
  accentSoft: "#7B82FF",
  gold: "#D4970A",
  green: "#22C55E",
} as const;

/* ─── services data ─── */
const SERVICES_DATA = [
  {
    name: "Business Formation",
    description:
      "From concept to legally operating entity. We handle the paperwork so you focus on what matters.",
    bullets: [
      "LLC, Corporation, and Non-Profit formation",
      "EIN registration and operating agreements",
      "DBA filing and name availability search",
      "Registered agent services across all 50 states",
    ],
  },
  {
    name: "Licensing",
    description:
      "NYC licensing is a maze. We have walked every corridor for 20 years.",
    bullets: [
      "General contractor and home improvement licenses",
      "Restaurant, food service, and liquor permits",
      "Retail and wholesale dealer permits",
      "DOB, DOT, and SLA applications end to end",
    ],
  },
  {
    name: "Tax Services",
    description:
      "IRS Certified Acceptance Agent on staff. 2,250+ ITINs processed and counting.",
    bullets: [
      "ITIN applications (W-7) with certified review",
      "Business and personal tax preparation",
      "IRS representation and penalty abatement",
      "Quarterly estimated tax planning",
    ],
  },
  {
    name: "Insurance",
    description:
      "Licensed broker who shops every carrier so you never overpay for coverage.",
    bullets: [
      "General liability and professional liability",
      "Workers compensation and disability",
      "Commercial auto and umbrella policies",
      "Bonds for contractors and licensed trades",
    ],
  },
  {
    name: "Audit Defense",
    description:
      "When the state comes knocking, you want us in the room. Our fine reduction track record speaks for itself.",
    bullets: [
      "Workers compensation audit defense",
      "Sales tax audit representation",
      "Unemployment insurance audit support",
      "Fine reduction and penalty negotiation",
    ],
  },
  {
    name: "Financial Services",
    description:
      "Clean books, clear picture. The financial foundation every growing business needs.",
    bullets: [
      "Monthly and quarterly bookkeeping",
      "Financial statement preparation",
      "Cash flow analysis and forecasting",
      "Year-end closing and reconciliation",
    ],
  },
];

/* ─── stats ─── */
const STATS = [
  { number: "20+", label: "Years serving NYC businesses", icon: "chart" },
  { number: "2,250+", label: "ITINs successfully processed", icon: "shield" },
  { number: "$200M+", label: "In client revenue protected", icon: "trending" },
  { number: "38", label: "Services under one roof", icon: "grid" },
];

/* ─── marquee items ─── */
const MARQUEE_TOP = [
  "IRS Certified Acceptance Agent",
  "Licensed Insurance Broker",
  "20+ Years Experience",
  "Queens, NY",
  "Serving All Five Boroughs",
  "2,250+ ITINs Processed",
];
const MARQUEE_BOTTOM = [
  "LLC Formation",
  "Contractor Licensing",
  "Workers Comp Audit Defense",
  "Tax Preparation",
  "Fine Reduction",
  "Bookkeeping",
  "ITIN Applications",
  "Insurance Brokerage",
];

/* ─── stat icon SVGs ─── */
function StatIcon({ type }: { type: string }) {
  const props = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: C.accent,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (type) {
    case "chart":
      return (
        <svg {...props}>
          <rect x="3" y="12" width="4" height="9" rx="1" />
          <rect x="10" y="7" width="4" height="14" rx="1" />
          <rect x="17" y="3" width="4" height="18" rx="1" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 2l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V6l7-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "trending":
      return (
        <svg {...props}>
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      );
    case "grid":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    default:
      return null;
  }
}

/* ═══════════════════════════════════════════════════════════
   SECTION: Hero
   ═══════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: C.bg }}
    >
      {/* dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(${C.border} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          opacity: 0.3,
        }}
      />

      {/* radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(79,86,232,0.15), transparent 70%)",
        }}
      />

      {/* horizontal rules */}
      <div
        className="pointer-events-none absolute left-0 right-0"
        style={{ top: "30%", height: 1, background: C.border }}
      />
      <div
        className="pointer-events-none absolute left-0 right-0"
        style={{ top: "70%", height: 1, background: C.border }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        {/* label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-xs font-medium tracking-[0.2em]"
          style={{ color: C.gold, textTransform: "uppercase" as const }}
        >
          Advantage Services &middot; Est. 2004
        </motion.p>

        {/* headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
          style={{ color: C.text }}
        >
          Business Solutions That{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentSoft})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Actually
          </span>{" "}
          Work
        </motion.h1>

        {/* subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-base sm:text-lg"
          style={{ color: C.muted }}
        >
          Formation. Licensing. Tax. Insurance. Audit Defense. One firm, no
          runaround.
        </motion.p>

        {/* buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <a
            href={`tel:${PHONE.mainTel}`}
            className="inline-flex h-12 items-center justify-center rounded-lg px-8 text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{
              background: C.accent,
              boxShadow: `0 0 24px ${C.accent}66`,
            }}
          >
            Book a Call
          </a>
          <a
            href="#services"
            className="inline-flex h-12 items-center justify-center rounded-lg border px-8 text-sm font-semibold transition-colors hover:bg-white/5"
            style={{ borderColor: C.border, color: C.text }}
          >
            Our Services
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION: Horizontal-scroll Stats
   ═══════════════════════════════════════════════════════════ */
function StatsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["5%", "-55%"]);

  return (
    <section ref={containerRef} style={{ height: "300vh" }}>
      <div
        className="sticky top-0 flex h-screen items-center overflow-hidden"
        style={{ background: C.bg }}
      >
        {/* section label */}
        <div
          className="absolute left-6 top-12 text-xs font-medium tracking-[0.15em] sm:left-12"
          style={{ color: C.muted, textTransform: "uppercase" as const }}
        >
          The Numbers
        </div>

        <motion.div
          className="flex gap-6 pl-6 sm:gap-8 sm:pl-12"
          style={{ x, willChange: "transform" }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex w-[80vw] max-w-[420px] shrink-0 flex-col justify-between rounded-2xl border p-8 sm:w-[380px] sm:p-10"
              style={{
                background: C.surface,
                borderColor: C.border,
                minHeight: 280,
              }}
            >
              <StatIcon type={s.icon} />
              <div>
                <p
                  className="mt-6 text-5xl font-bold sm:text-7xl"
                  style={{ color: C.accent }}
                >
                  {s.number}
                </p>
                <p
                  className="mt-3 text-sm sm:text-base"
                  style={{ color: C.muted }}
                >
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION: Services Accordion
   ═══════════════════════════════════════════════════════════ */
function ServicesSection() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="services"
      ref={ref}
      className="relative py-24 sm:py-32"
      style={{ background: C.bg }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="mb-12 text-xs font-medium tracking-[0.15em]"
          style={{ color: C.muted, textTransform: "uppercase" as const }}
        >
          What We Do
        </motion.p>

        {/* ── desktop: side by side ── */}
        <div className="hidden gap-12 md:grid md:grid-cols-[1fr_1.4fr]">
          {/* names */}
          <div className="flex flex-col gap-2">
            {SERVICES_DATA.map((s, i) => (
              <button
                key={s.name}
                onClick={() => setActive(i)}
                className="group relative rounded-lg px-5 py-4 text-left text-2xl font-semibold transition-colors lg:text-3xl"
                style={{
                  color: active === i ? C.accent : C.muted,
                  background: active === i ? `${C.surface}` : "transparent",
                }}
              >
                {/* indicator bar */}
                {active === i && (
                  <motion.span
                    layoutId="service-indicator"
                    className="absolute left-0 top-0 h-full w-[3px] rounded-full"
                    style={{ background: C.accent }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {s.name}
              </button>
            ))}
          </div>

          {/* detail panel */}
          <div
            className="relative min-h-[340px] rounded-2xl border p-8 lg:p-10"
            style={{ background: C.surface, borderColor: C.border }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h3
                  className="text-2xl font-bold"
                  style={{ color: C.text }}
                >
                  {SERVICES_DATA[active].name}
                </h3>
                <p className="mt-4 text-base" style={{ color: C.muted }}>
                  {SERVICES_DATA[active].description}
                </p>
                <ul className="mt-6 space-y-3">
                  {SERVICES_DATA[active].bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3 text-sm"
                      style={{ color: C.text }}
                    >
                      <span
                        className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: C.accent }}
                      />
                      {b}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className="mt-8 inline-flex items-center gap-1 text-sm font-medium transition-colors hover:brightness-125"
                  style={{ color: C.accent }}
                >
                  Learn more
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── mobile: stacked accordion ── */}
        <div className="flex flex-col gap-2 md:hidden">
          {SERVICES_DATA.map((s, i) => {
            const open = active === i;
            return (
              <div
                key={s.name}
                className="rounded-xl border"
                style={{
                  borderColor: open ? C.accent + "44" : C.border,
                  background: open ? C.surface : "transparent",
                }}
              >
                <button
                  onClick={() => setActive(i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-lg font-semibold"
                  style={{ color: open ? C.accent : C.muted }}
                >
                  {s.name}
                  <span
                    className="text-xl transition-transform"
                    style={{
                      transform: open ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5">
                        <p
                          className="text-sm"
                          style={{ color: C.muted }}
                        >
                          {s.description}
                        </p>
                        <ul className="mt-4 space-y-2">
                          {s.bullets.map((b) => (
                            <li
                              key={b}
                              className="flex items-start gap-2 text-sm"
                              style={{ color: C.text }}
                            >
                              <span
                                className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{ background: C.accent }}
                              />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION: Marquee
   ═══════════════════════════════════════════════════════════ */
function Marquee() {
  const renderRow = (items: string[], duration: number, reverse = false) => {
    const doubled = [...items, ...items];
    return (
      <div className="relative flex overflow-hidden py-3">
        {/* fade edges */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
          style={{
            background: `linear-gradient(to right, ${C.surface}, transparent)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
          style={{
            background: `linear-gradient(to left, ${C.surface}, transparent)`,
          }}
        />
        <div
          className="flex shrink-0 gap-8"
          style={{
            animation: `marquee ${duration}s linear infinite${reverse ? " reverse" : ""}`,
            willChange: "transform",
          }}
        >
          {doubled.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="whitespace-nowrap text-sm font-medium"
              style={{ color: C.muted }}
            >
              {item}
              <span className="mx-4" style={{ color: C.border }}>
                &middot;
              </span>
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section
      className="border-y py-2"
      style={{ background: C.surface, borderColor: C.border }}
    >
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      {renderRow(MARQUEE_TOP, 35)}
      {renderRow(MARQUEE_BOTTOM, 28, true)}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION: Contact CTA with rotating glow border
   ═══════════════════════════════════════════════════════════ */
function ContactCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="contact"
      ref={ref}
      className="relative flex items-center justify-center py-32 sm:py-40"
      style={{ background: C.bg }}
    >
      <div className="mx-auto max-w-2xl px-6 text-center">
        {/* rotating glow border wrapper */}
        <div className="relative mx-auto inline-block rounded-2xl p-[2px]">
          {/* conic gradient border — animated with CSS @property */}
          <style>{`
            @property --glow-angle {
              syntax: '<angle>';
              initial-value: 0deg;
              inherits: false;
            }
            @keyframes glow-rotate {
              to { --glow-angle: 360deg; }
            }
            .glow-border {
              background: conic-gradient(
                from var(--glow-angle),
                ${C.accent},
                ${C.border} 40%,
                ${C.accent} 50%,
                ${C.border} 90%,
                ${C.accent}
              );
              animation: glow-rotate 4s linear infinite;
            }
          `}</style>
          <div className="glow-border rounded-2xl p-[2px]">
            <div
              className="rounded-2xl px-8 py-12 sm:px-14 sm:py-16"
              style={{ background: C.bg }}
            >
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7 }}
                className="text-3xl font-bold sm:text-4xl"
                style={{ color: C.text }}
              >
                One conversation could
                <br />
                change everything.
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 flex flex-col items-center gap-2 text-sm"
                style={{ color: C.muted }}
              >
                <a
                  href={`tel:${PHONE.mainTel}`}
                  className="transition-colors hover:text-white"
                >
                  {PHONE.main}
                </a>
                <a
                  href={PHONE.whatsappLink}
                  className="transition-colors hover:text-white"
                >
                  WhatsApp: {PHONE.whatsapp}
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
              >
                <a
                  href={`tel:${PHONE.mainTel}`}
                  className="inline-flex h-12 items-center justify-center rounded-lg px-8 text-sm font-semibold text-white transition-all hover:brightness-110"
                  style={{
                    background: C.accent,
                    boxShadow: `0 0 30px ${C.accent}55`,
                  }}
                >
                  Schedule a Free Consultation
                </a>
                <a
                  href={PHONE.whatsappLink}
                  className="inline-flex h-12 items-center justify-center rounded-lg border px-8 text-sm font-semibold transition-colors hover:bg-green-900/20"
                  style={{ borderColor: C.green, color: C.green }}
                >
                  WhatsApp Us
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION: Footer
   ═══════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer
      className="border-t py-8 text-center"
      style={{ background: C.bg, borderColor: C.border }}
    >
      <p className="text-xs" style={{ color: C.muted }}>
        &copy; 2026 Advantage Business Consulting LLC &middot; {ADDRESS.full}
      </p>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */
export default function DemoThreePage() {
  return (
    <main style={{ background: C.bg, color: C.text }}>
      <Hero />
      <StatsSection />
      <ServicesSection />
      <Marquee />
      <ContactCTA />
      <Footer />
    </main>
  );
}
