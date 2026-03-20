"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { PHONE, ADDRESS, HOURS, SERVICES, SEGMENTS } from "@/lib/constants";
import { GOOGLE_RATING, REVIEWS } from "@/lib/reviews";

/* ─── Animation helpers ─── */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE },
});

function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Count-up hook ─── */

function useCountUp(target: number, suffix = "", decimals = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 1600;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(parseFloat((eased * target).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, decimals]);

  return { ref, display: `${value}${suffix}` };
}

/* ─── Star rendering ─── */

function Stars({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={i <= Math.round(rating) ? "var(--gold)" : "var(--border)"}
        >
          <path d="M10 1.12l2.47 5.01 5.53.8-4 3.9.94 5.5L10 13.77l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.12z" />
        </svg>
      ))}
    </span>
  );
}

/* ─── Service icon SVGs ─── */

const SERVICE_ICONS: Record<string, ReactNode> = {
  building: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  ),
  "id-card": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M14 10h4M14 14h2" />
    </svg>
  ),
  "file-invoice-dollar": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M12 18v-6M9 15h6" />
    </svg>
  ),
  "shield-halved": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 2v20" />
    </svg>
  ),
  "scale-balanced": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 7l4 8h0a4 4 0 008 0h0l4-8" />
      <path d="M7 15a4 4 0 01-4 0M21 15a4 4 0 01-4 0" />
      <circle cx="12" cy="3" r="1" />
    </svg>
  ),
  "chart-line": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 2 5-8" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════
   DEMO 4 — "Premium Local" Landing Page
   Real data. Real reviews. Real images. No fabrication.
   ═══════════════════════════════════════════════════════ */

export default function Demo4() {
  return (
    <main className="overflow-x-hidden" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <HeroSection />
      <TrustBar />
      <ServicesGrid />
      <ReviewsSection />
      <IndustriesSection />
      <NeighborhoodSection />
      <CTASection />
    </main>
  );
}

/* ─── Section 1: Hero ─── */

function HeroSection() {
  return (
    <section
      className="relative min-h-[85vh] flex items-center"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 70% 20%, rgba(79,86,232,0.03) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 20% 80%, rgba(79,86,232,0.02) 0%, transparent 60%),
          var(--bg)
        `,
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-0">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left — Text (60%) */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <motion.div
              {...fadeUp(0)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{
                background: "rgba(212,151,10,0.08)",
                color: "var(--gold)",
                border: "1px solid rgba(212,151,10,0.15)",
              }}
            >
              <span style={{ color: "var(--gold)" }}>&#9670;</span>
              Est. 2004 &middot; Cambria Heights, NY
            </motion.div>

            <motion.h1
              {...fadeUp(0.15)}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
              style={{ color: "var(--text)", fontFamily: "var(--font-heading)" }}
            >
              Your Business Deserves
              <br />a Real Partner
            </motion.h1>

            <motion.p
              {...fadeUp(0.3)}
              className="text-lg lg:text-xl leading-relaxed mb-8 max-w-xl"
              style={{ color: "var(--text-secondary)" }}
            >
              Formation. Licensing. Tax. Insurance. Audit Defense.
              <br className="hidden sm:block" />
              One firm that knows your name.
            </motion.p>

            <motion.div
              {...fadeUp(0.4)}
              className="flex items-center gap-3 mb-8"
            >
              <Stars rating={GOOGLE_RATING.rating} size={20} />
              <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {GOOGLE_RATING.rating}/5
              </span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                from {GOOGLE_RATING.totalReviews} reviews
              </span>
            </motion.div>

            <motion.div {...fadeUp(0.5)} className="flex flex-wrap gap-4">
              <a
                href={`tel:${PHONE.mainTel}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                style={{ background: "var(--blue-accent)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.6.68 2.34a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.74-1.25a2 2 0 012.11-.45c.74.32 1.53.55 2.34.68A2 2 0 0122 16.92z" />
                </svg>
                Talk to a Specialist
              </a>
              <a
                href="#services"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-md"
                style={{
                  border: "1.5px solid var(--border)",
                  color: "var(--text)",
                  background: "var(--surface)",
                }}
              >
                Browse Services
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17l9.2-9.2M17 17V8H8" />
                </svg>
              </a>
            </motion.div>
          </div>

          {/* Right — Image (40%) */}
          <motion.div
            className="lg:col-span-2 order-1 lg:order-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          >
            <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-lg)" }}>
              <Image
                src="/images/hero-team.png"
                alt="The Advantage Services team"
                width={640}
                height={480}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 2: Trust Bar ─── */

function TrustBar() {
  const ratingCounter = useCountUp(GOOGLE_RATING.rating, "", 1);
  const reviewsCounter = useCountUp(GOOGLE_RATING.totalReviews, "");
  const yearsCounter = useCountUp(20, "+");
  // REAL: 38 services from SERVICE_CATALOG.md
  const servicesCounter = useCountUp(38, "");

  const stats = [
    { counter: ratingCounter, label: "Google Rating", icon: "\u2605" },
    { counter: reviewsCounter, label: "Google Reviews", icon: null },
    { counter: yearsCounter, label: "Years in Business", icon: null },
    { counter: servicesCounter, label: "Services Offered", icon: null },
  ];

  return (
    <section
      className="py-6"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center py-4 lg:py-2"
              style={{
                borderRight: i < stats.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <span
                ref={stat.counter.ref}
                className="text-3xl lg:text-4xl font-bold tabular-nums"
                style={{ color: "var(--text)", fontFamily: "var(--font-heading)" }}
              >
                {stat.icon && (
                  <span style={{ color: "var(--gold)", marginRight: 2 }}>{stat.icon}</span>
                )}
                {stat.counter.display}
              </span>
              <span className="text-xs font-medium mt-1 tracking-wide uppercase" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 3: Services Grid ─── */

function ServicesGrid() {
  return (
    <section id="services" className="py-24 lg:py-32" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Everything Your Business Needs
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              From formation to tax season and everything in between &mdash; one partner for every stage.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => (
            <ScrollReveal key={service.name} delay={i * 0.08}>
              <a
                href={service.href}
                className="group block p-6 rounded-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-card)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  e.currentTarget.style.borderBottomColor = "var(--blue-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-card)";
                  e.currentTarget.style.borderBottomColor = "var(--border)";
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: "var(--blue-pale)", color: "var(--blue-accent)" }}
                >
                  {SERVICE_ICONS[service.icon] || (
                    <span className="text-lg font-bold">{service.name[0]}</span>
                  )}
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {service.name}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                  {service.description}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-sm font-medium transition-all duration-300 group-hover:gap-2"
                  style={{ color: "var(--blue-accent)" }}
                >
                  Learn more
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 4: Real Google Reviews ─── */

function ReviewsSection() {
  return (
    <section className="py-24 lg:py-32" style={{ background: "var(--surface)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              What Our Clients Say
            </h2>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              <Stars rating={GOOGLE_RATING.rating} />{" "}
              <span className="ml-2">
                {GOOGLE_RATING.rating} out of 5 stars &middot; {GOOGLE_RATING.totalReviews} reviews on{" "}
                <a
                  href={GOOGLE_RATING.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 transition-colors duration-200"
                  style={{ color: "var(--blue-accent)" }}
                >
                  Google
                </a>
              </span>
            </p>
          </div>
        </ScrollReveal>

        {/* First 3 reviews in 3-column grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {REVIEWS.slice(0, 3).map((review, i) => (
            <ScrollReveal key={review.name} delay={i * 0.1}>
              <ReviewCard review={review} />
            </ScrollReveal>
          ))}
        </div>

        {/* Remaining 2 reviews in 2-column grid, centered */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {REVIEWS.slice(3).map((review, i) => (
            <ScrollReveal key={review.name} delay={(i + 3) * 0.1}>
              <ReviewCard review={review} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({
  review,
}: {
  review: (typeof REVIEWS)[number];
}) {
  return (
    <div
      className="p-6 rounded-xl h-full flex flex-col"
      style={{
        background: "var(--bg)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: "var(--blue-accent)" }}
        >
          {review.name[0]}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
            {review.name}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {review.date}
          </p>
        </div>
      </div>
      <Stars rating={review.rating} size={14} />
      <p
        className="mt-3 text-sm leading-relaxed flex-1"
        style={{ color: "var(--text-secondary)" }}
      >
        &ldquo;{review.text}&rdquo;
      </p>
    </div>
  );
}

/* ─── Section 5: Industries We Serve ─── */

function IndustriesSection() {
  return (
    <section className="py-24 lg:py-32" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Image */}
          <ScrollReveal>
            <div className="relative rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-lg)" }}>
              <Image
                src="/images/contractor-handshake.png"
                alt="Contractor handshake representing business partnership"
                width={640}
                height={480}
                className="w-full h-auto object-cover"
              />
            </div>
          </ScrollReveal>

          {/* Right — Segments */}
          <div>
            <ScrollReveal>
              <h2
                className="text-3xl lg:text-4xl font-bold mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Industries We Serve
              </h2>
              <p className="text-lg mb-10" style={{ color: "var(--text-secondary)" }}>
                We specialize in the industries NYC runs on.
              </p>
            </ScrollReveal>

            <div className="space-y-6">
              {SEGMENTS.map((seg, i) => (
                <ScrollReveal key={seg.name} delay={i * 0.12}>
                  <a
                    href={seg.href}
                    className="group block p-5 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      boxShadow: "var(--shadow-card)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "var(--shadow-card)";
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className="text-lg font-semibold"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {seg.name}
                      </h3>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-1 transition-transform duration-300 group-hover:translate-x-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                    <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                      {seg.tagline}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {seg.journey.split(" -> ").map((step) => (
                        <span
                          key={step}
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{
                            background: "var(--blue-pale)",
                            color: "var(--blue-accent)",
                          }}
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                  </a>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 6: Our Neighborhood ─── */

function NeighborhoodSection() {
  return (
    <section className="relative">
      <div className="relative w-full h-[480px] lg:h-[540px]">
        <Image
          src="/images/cambria-heights.png"
          alt="Cambria Heights, Queens neighborhood"
          fill
          className="object-cover"
        />
        {/* Dark gradient overlay from bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)",
          }}
        />
        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-16 w-full">
            <ScrollReveal>
              <h2
                className="text-3xl lg:text-4xl font-bold text-white mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Proudly Serving NYC from
                <br />
                Cambria Heights, Queens
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="grid sm:grid-cols-2 gap-8 max-w-2xl">
                {/* Address */}
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-2">
                    Visit Us
                  </p>
                  <a
                    href={ADDRESS.googleMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-lg leading-relaxed hover:underline underline-offset-4"
                  >
                    {ADDRESS.street}
                    <br />
                    {ADDRESS.city}, {ADDRESS.state} {ADDRESS.zip}
                  </a>
                </div>

                {/* Hours */}
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-2">
                    Hours
                  </p>
                  <p className="text-white text-lg leading-relaxed">
                    {HOURS.days}
                    <br />
                    {HOURS.time} {HOURS.timezone}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 7: CTA ─── */

function CTASection() {
  return (
    <section
      className="py-24 lg:py-32"
      style={{ background: "var(--gradient-primary)" }}
    >
      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2
            className="text-3xl lg:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ready to Get Started?
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.7)" }}>
            Free consultation. No obligation. Real people, not chatbots.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            <a
              href={`tel:${PHONE.mainTel}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              style={{
                background: "white",
                color: "var(--blue-accent)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.6.68 2.34a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.74-1.25a2 2 0 012.11-.45c.74.32 1.53.55 2.34.68A2 2 0 0122 16.92z" />
              </svg>
              Schedule a Call
            </a>
            <a
              href={PHONE.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              style={{ border: "1.5px solid rgba(255,255,255,0.4)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Us
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            <a href={`tel:${PHONE.mainTel}`} className="hover:text-white transition-colors">
              {PHONE.main}
            </a>
            <span className="hidden sm:inline">&middot;</span>
            <a href={PHONE.whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              WhatsApp: {PHONE.whatsapp}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
