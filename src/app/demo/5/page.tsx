"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PHONE, ADDRESS, HOURS, STATS, TEAM } from "@/lib/constants";
import { GOOGLE_RATING, REVIEWS } from "@/lib/reviews";

const TEAM_PHOTOS: Record<string, string> = {
  Jay: "/images/team/jay-v2.jpg",
  Kedar: "/images/team/kedar.jpg",
  Zia: "/images/team/zia.jpg",
  Akram: "/images/team/akram.jpg",
  Riaz: "/images/team/riaz-v7.jpg",
  Hamid: "/images/team/hamid-v13.jpg",
};

/* ═══════════════════════════════════════════════════════════════
   ANIMATION PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

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
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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
          const duration = 1800;
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
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, decimals]);

  return { ref, display: `${value}${suffix}` };
}

/* ═══════════════════════════════════════════════════════════════
   PERSONA DATA
   ═══════════════════════════════════════════════════════════════ */

interface Persona {
  label: string;
  image: string;
  imageAlt: string;
  quote: string;
  solution: string;
  services: string[];
  ctaLabel: string;
  ctaHref: string;
}

const PERSONAS: Persona[] = [
  {
    label: "THE CONTRACTOR",
    image: "/images/persona-contractor-hd.jpg",
    imageAlt: "Contractor at a Brooklyn renovation site",
    quote: "I just want to build. Not fight with paperwork.",
    solution:
      "We get you licensed, insured, and compliant \u2014 so you never have to think about it. HIC license, general contractor permits, workers comp, GL insurance, quarterly tax. One firm handles it all.",
    services: [
      "Home Improvement License",
      "Workers Comp",
      "General Liability",
      "Tax Prep",
      "Audit Defense",
    ],
    ctaLabel: "See Marco\u2019s Journey",
    ctaHref: "/industries/contractors",
  },
  {
    label: "THE RESTAURANT OWNER",
    image: "/images/persona-restaurant-hd.jpg",
    imageAlt: "Restaurant owner at her new restaurant",
    quote: "I dreamed of a restaurant. Not a permit nightmare.",
    solution:
      "Health permits, liquor license, fire department, signage, sales tax, workers comp \u2014 most clients are fully permitted in 60\u201390 days. You focus on the menu. We handle the maze.",
    services: [
      "Restaurant Permits",
      "Liquor License",
      "LLC Formation",
      "Sales Tax",
      "Insurance",
    ],
    ctaLabel: "See Sofia\u2019s Journey",
    ctaHref: "/industries/restaurants",
  },
  {
    label: "THE IMMIGRANT ENTREPRENEUR",
    image: "/images/persona-entrepreneur-hd.jpg",
    imageAlt: "Entrepreneur at his convenience store",
    quote: "I\u2019ve been burned before. I need someone I can trust.",
    solution:
      "Kedar Gupta has processed over 2,250 ITINs as an IRS Certified Acceptance Agent. Your documents never leave our office. We\u2019ve helped thousands start their American business dream.",
    services: [
      "ITIN Application",
      "LLC Formation",
      "EIN",
      "Retail Licenses",
      "Tax Filing",
    ],
    ctaLabel: "See Raj\u2019s Journey",
    ctaHref: "/industries/immigrant-entrepreneurs",
  },
  {
    label: "THE AUDIT DEFENSE",
    image: "/images/team/consultation-kedar.jpg",
    imageAlt: "Kedar Gupta reviewing audit documents with a business owner",
    quote: "I got a letter from the state. I can\u2019t sleep.",
    solution:
      "We take the cases other firms won\u2019t touch. Workers comp audits, sales tax audits, unemployment audits \u2014 we fight the fines, negotiate settlements, and protect your business.",
    services: [
      "Workers Comp Audit",
      "Sales Tax Audit",
      "Fine Reduction",
      "IRS Representation",
    ],
    ctaLabel: "Learn About Audit Defense",
    ctaHref: "/services/audit-defense",
  },
  {
    label: "THE LICENSING EXPERT",
    image: "/images/team/story-zia-licensing.jpg",
    imageAlt: "Zia Khan helping a client with licensing paperwork at a government office",
    quote: "I don\u2019t know what forms I need. I just know I need to open.",
    solution:
      "Zia walks clients through every permit, every form, every office visit. From contractor licenses to restaurant permits to retail certificates \u2014 he\u2019s been through the process hundreds of times. You don\u2019t wait in line. We do.",
    services: [
      "Business Permits",
      "Contractor License",
      "DCA/DOB Filing",
      "Certificate of Occupancy",
      "Compliance",
    ],
    ctaLabel: "See How Zia Helps",
    ctaHref: "/services/licensing",
  },
  {
    label: "THE FULL-SERVICE CLIENT",
    image: "/images/team/story-jay-consulting-v2.jpg",
    imageAlt: "Jay Agrawal consulting with a high-profile business client",
    quote: "I need one partner who handles everything. A to Z.",
    solution:
      "Jay has spent 20+ years building a firm that does what others can\u2019t \u2014 formation, licensing, insurance, tax, audit defense, all under one roof. One call, one relationship, total peace of mind.",
    services: [
      "Business Formation",
      "Insurance",
      "Licensing",
      "Tax Strategy",
      "Ongoing Advisory",
    ],
    ctaLabel: "Talk to Jay",
    ctaHref: "/contact",
  },
  {
    label: "THE TAX REFUND",
    image: "/images/team/story-akram-taxes.jpg",
    imageAlt: "Akram Gaffor sharing good tax refund news with a happy couple",
    quote: "We owed money last year. We were scared to file again.",
    solution:
      "Akram found deductions their previous preparer missed \u2014 home office, vehicle, business meals, depreciation. Instead of owing, they got a refund that covered three months of rent. The right preparer changes everything.",
    services: [
      "Personal Tax",
      "Business Tax",
      "Deduction Optimization",
      "Prior Year Amendments",
      "Bookkeeping",
    ],
    ctaLabel: "Get Your Taxes Done Right",
    ctaHref: "/services/tax-services",
  },
  {
    label: "THE AI BREAKTHROUGH",
    image: "/images/team/story-hamid-ai.jpg",
    imageAlt: "Hamid Elsevar presenting AI business analytics to small business owners",
    quote: "We were drowning in busywork. Growing felt impossible.",
    solution:
      "Hamid built custom AI workflows that automated their invoicing, follow-ups, and client intake. What used to take 15 hours a week now takes 2. The owner finally had time for strategy instead of spreadsheets \u2014 and revenue jumped 40% in six months.",
    services: [
      "AI Workflow Automation",
      "Business Intelligence",
      "Process Optimization",
      "Digital Transformation",
      "Growth Strategy",
    ],
    ctaLabel: "Scale Your Operations",
    ctaHref: "/contact",
  },
  {
    label: "THE PATIENT LISTENER",
    image: "/images/team/story-riaz-taxes.jpg",
    imageAlt: "Riaz Khan patiently listening to a client's tax concerns",
    quote: "Nobody ever really listens. They just tell me what I owe.",
    solution:
      "Riaz sat with her for two hours. He went through every receipt, every question, every worry. By the end, she didn\u2019t just have her taxes done \u2014 she understood them. And for the first time in years, she felt in control of her finances.",
    services: [
      "Personal Tax",
      "Bookkeeping",
      "Tax Education",
      "Receipt Organization",
      "Year-Round Support",
    ],
    ctaLabel: "Work with Someone Who Listens",
    ctaHref: "/services/tax-services",
  },
];

/* ═══════════════════════════════════════════════════════════════
   JOURNEY STEPS
   ═══════════════════════════════════════════════════════════════ */

const JOURNEY_STEPS = [
  "Form Your Business",
  "Get Licensed",
  "Get Insured",
  "File Your Taxes",
  "Defend Your Audits",
  "Grow",
];

/* ═══════════════════════════════════════════════════════════════
   PERSONA PANEL COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function PersonaPanel({ persona, index }: { persona: Persona; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div
      ref={ref}
      className="flex flex-col lg:flex-row min-h-[600px] lg:min-h-[700px] w-full snap-start snap-always lg:w-screen flex-shrink-0"
    >
      {/* Image half */}
      <div className="relative w-full lg:w-1/2 h-[350px] lg:h-auto">
        <Image
          src={persona.image}
          alt={persona.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={index === 0}
        />
      </div>

      {/* Content half */}
      <div
        className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-12 lg:px-16 lg:py-16"
        style={{ backgroundColor: "#0A0F1A" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
        >
          <span
            className="text-xs font-semibold tracking-[0.25em] block mb-6"
            style={{ color: "#D4970A" }}
          >
            {persona.label}
          </span>
        </motion.div>

        <motion.blockquote
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
          className="text-2xl lg:text-3xl font-light italic text-white mb-8 leading-relaxed"
        >
          &ldquo;{persona.quote}&rdquo;
        </motion.blockquote>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
          className="w-10 h-px mb-8"
          style={{ backgroundColor: "#D4970A" }}
        />

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
          className="text-white/80 text-base lg:text-lg leading-relaxed mb-8"
        >
          {persona.solution}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {persona.services.map((service) => (
            <span
              key={service}
              className="text-sm px-3 py-1.5 rounded-full text-white"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}
            >
              {service}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, delay: 0.65, ease: EASE }}
        >
          <a
            href={persona.ctaHref}
            className="inline-flex items-center gap-2 text-white border border-blue-500 rounded-full px-6 py-3 text-sm font-medium hover:bg-blue-500/10 transition-colors duration-300"
          >
            {persona.ctaLabel}
            <span aria-hidden="true">&rarr;</span>
          </a>
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PERSONA CAROUSEL COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function PersonaCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const panelWidth = el.scrollWidth / PERSONAS.length;
    const idx = Math.round(scrollLeft / panelWidth);
    setActiveIndex(Math.min(idx, PERSONAS.length - 1));
  }, []);

  const scrollTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const panelWidth = el.scrollWidth / PERSONAS.length;
    el.scrollTo({ left: panelWidth * index, behavior: "smooth" });
  }, []);

  return (
    <div>
      {/* Desktop: horizontal scroll-snap */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="hidden lg:flex overflow-x-auto"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {PERSONAS.map((persona, i) => (
          <PersonaPanel key={persona.label} persona={persona} index={i} />
        ))}
      </div>

      {/* Desktop navigation dots */}
      <div className="hidden lg:flex justify-center gap-3 mt-8">
        {PERSONAS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to persona ${i + 1}`}
            className="w-2.5 h-2.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                activeIndex === i ? "#D4970A" : "rgba(255,255,255,0.25)",
              transform: activeIndex === i ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* Mobile: stacked vertically */}
      <div className="lg:hidden flex flex-col">
        {PERSONAS.map((persona, i) => (
          <PersonaPanel key={persona.label} persona={persona} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   JOURNEY TIMELINE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function TeamPhotoParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <div ref={ref} className="relative rounded-2xl overflow-hidden mb-16" style={{ aspectRatio: "987 / 550" }}>
      <motion.div className="absolute inset-[-10%]" style={{ y }}>
        <Image
          src="/images/team/team-group-v2.jpg"
          alt="The Advantage Services team — Jay, Kedar, Zia, Akram, Riaz, and Hamid"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 1200px"
        />
      </motion.div>
    </div>
  );
}

function JourneyTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto">
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-6 left-6 right-6 h-px bg-gray-200 overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: "0%" }}
            animate={isInView ? { width: "100%" } : { width: "0%" }}
            transition={{ duration: 2, delay: 0.3, ease: EASE }}
          />
        </div>

        {JOURNEY_STEPS.map((step, i) => (
          <motion.div
            key={step}
            className="flex flex-col items-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={
              isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.5, delay: 0.2 + i * 0.15, ease: EASE }}
          >
            <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center text-blue-600 font-semibold text-sm mb-3 shadow-sm">
              {i + 1}
            </div>
            <span className="text-sm text-gray-700 font-medium text-center max-w-[100px]">
              {step}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden flex flex-col items-start pl-6 relative">
        {/* Vertical connecting line */}
        <div className="absolute top-6 bottom-6 left-[30px] w-px bg-gray-200 overflow-hidden">
          <motion.div
            className="w-full bg-blue-500"
            initial={{ height: "0%" }}
            animate={isInView ? { height: "100%" } : { height: "0%" }}
            transition={{ duration: 2, delay: 0.3, ease: EASE }}
          />
        </div>

        {JOURNEY_STEPS.map((step, i) => (
          <motion.div
            key={step}
            className="flex items-center gap-4 relative z-10 mb-6 last:mb-0"
            initial={{ opacity: 0, x: -20 }}
            animate={
              isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
            }
            transition={{ duration: 0.5, delay: 0.2 + i * 0.15, ease: EASE }}
          >
            <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center text-blue-600 font-semibold text-sm shadow-sm flex-shrink-0">
              {i + 1}
            </div>
            <span className="text-base text-gray-700 font-medium">{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function Demo5Page() {
  const setups = useCountUp(STATS.businessSetups.count, "+");
  const taxClients = useCountUp(STATS.taxClients.count, "+");
  const licenses = useCountUp(STATS.businessLicenses.count, "+");
  const rating = useCountUp(GOOGLE_RATING.rating, "", 1);

  return (
    <main className="bg-white text-gray-900 overflow-x-hidden">
      {/* ─── Hero ─── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background image with slow zoom */}
        <div className="absolute inset-0 animate-[heroZoom_15s_ease-out_forwards]">
          <Image
            src="/images/office-hero-v3.jpg"
            alt="Advantage Business Consulting office in Cambria Heights"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: EASE }}
            className="text-sm tracking-[0.3em] text-white/60 mb-6 font-light"
          >
            ADVANTAGE SERVICES &middot; CAMBRIA HEIGHTS, NY
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
          >
            We handle the business
            <br />
            of your business.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: EASE }}
            className="text-xl sm:text-2xl text-white/80 font-light mt-4"
          >
            So you can handle everything else.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.6, ease: EASE }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <a
              href={`tel:${PHONE.mainTel}`}
              className="inline-flex items-center justify-center bg-white text-gray-900 font-semibold rounded-full px-8 py-4 text-sm hover:bg-gray-100 transition-colors duration-300 min-w-[220px]"
            >
              Talk to Someone Real
            </a>
            <a
              href="#personas"
              className="inline-flex items-center justify-center border border-white text-white font-semibold rounded-full px-8 py-4 text-sm hover:bg-white/10 transition-colors duration-300 min-w-[220px]"
            >
              See How We Help
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            className="w-px h-8 bg-white/40"
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </section>

      {/* ─── Persona Carousel ─── */}
      <section id="personas" className="py-16 lg:py-0" style={{ backgroundColor: "#0A0F1A" }}>
        <div className="lg:hidden px-6 pt-4 pb-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-white text-center">
              Your Story. Our Expertise.
            </h2>
            <p className="text-white/60 text-center mt-3 text-lg">
              Every business has a beginning. Here&apos;s how we help.
            </p>
          </ScrollReveal>
        </div>

        <div className="hidden lg:block py-16 text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-bold text-white">
              Your Story. Our Expertise.
            </h2>
            <p className="text-white/60 mt-3 text-lg">
              Every business has a beginning. Here&apos;s how we help.
            </p>
          </ScrollReveal>
        </div>

        <PersonaCarousel />

        {/* Bottom padding for desktop */}
        <div className="hidden lg:block h-16" />
      </section>

      {/* ─── The Numbers ─── */}
      <section className="py-20 bg-white">
        <ScrollReveal>
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
              {[
                { ref: setups.ref, display: setups.display, label: "Businesses Formed" },
                {
                  ref: taxClients.ref,
                  display: taxClients.display,
                  label: "Tax Clients Served",
                },
                {
                  ref: licenses.ref,
                  display: licenses.display,
                  label: "Licenses Obtained",
                },
                {
                  ref: rating.ref,
                  display: rating.display,
                  label: `Google (${GOOGLE_RATING.totalReviews} reviews)`,
                  suffix: "\u2605",
                  link: GOOGLE_RATING.mapsUrl,
                },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`text-center ${
                    i < 3
                      ? "md:border-r md:border-gray-200"
                      : ""
                  }`}
                >
                  <span
                    ref={stat.ref}
                    className="text-4xl lg:text-5xl font-bold text-gray-900"
                  >
                    {stat.display}
                    {stat.suffix && (
                      <span className="text-yellow-500 ml-1">
                        {stat.suffix}
                      </span>
                    )}
                  </span>
                  <span className="block text-sm text-gray-500 mt-2 font-medium">
                    {stat.link ? (
                      <a
                        href={stat.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors"
                      >
                        {stat.label}
                      </a>
                    ) : (
                      stat.label
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Reviews ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-14">
              Don&apos;t take our word for it.
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[REVIEWS[0], REVIEWS[1], REVIEWS[3]].map((review, i) => (
              <ScrollReveal key={review.name} delay={i * 0.12}>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full flex flex-col">
                  <span
                    className="text-5xl font-serif leading-none mb-4 block"
                    style={{ color: "rgba(59, 130, 246, 0.15)" }}
                  >
                    &ldquo;
                  </span>
                  <p className="text-gray-700 leading-relaxed flex-1 text-[15px]">
                    {review.text}
                  </p>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm">
                      {review.name}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {review.date}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <p className="text-center mt-10 text-gray-500 text-sm">
              <a
                href={GOOGLE_RATING.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                {GOOGLE_RATING.rating} out of 5 &middot;{" "}
                {GOOGLE_RATING.totalReviews} reviews on Google
              </a>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Meet the Team ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-4">
              The people behind the promise.
            </h2>
            <p className="text-center text-gray-500 max-w-2xl mx-auto mb-14 text-lg">
              20+ years of combined expertise. One team that knows your full picture.
            </p>
          </ScrollReveal>

          {/* Team group photo */}
          <ScrollReveal>
            <TeamPhotoParallax />
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
            {TEAM.map((member, i) => (
              <ScrollReveal key={member.name} delay={i * 0.08}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden mb-5 ring-2 ring-gray-100 shadow-lg">
                    <Image
                      src={TEAM_PHOTOS[member.name] || ""}
                      alt={member.fullName}
                      fill
                      className="object-cover"
                      sizes="320px"
                      quality={90}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {member.fullName}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    {member.role}
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                    {member.specialties.map((s) => (
                      <span
                        key={s}
                        className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Consultation scene */}
          <ScrollReveal delay={0.2}>
            <div className="mt-16 relative rounded-2xl overflow-hidden h-[300px] lg:h-[400px]">
              <Image
                src="/images/team/consultation-dual.jpg"
                alt="Kedar and Zia helping a client with licensing while Jay and Akram help a couple with taxes"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-white text-lg lg:text-xl font-light">
                  Every client gets our full attention. Every business gets our full team.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Journey: One Firm, Start to Finish ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-4">
              One Firm. Start to Finish.
            </h2>
            <p className="text-center text-gray-500 max-w-2xl mx-auto mb-14 text-lg">
              Most firms do one thing. We do everything &mdash; and each
              specialist knows your full picture.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <JourneyTimeline />
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="/images/office-hero-v3.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
              One conversation could
              <br />
              change everything.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p className="text-white/70 text-lg mt-5">
              Free consultation. No obligation. We pick up the phone.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <a
                href={`tel:${PHONE.mainTel}`}
                className="inline-flex items-center justify-center bg-white text-gray-900 font-semibold rounded-full px-8 py-4 text-sm hover:bg-gray-100 transition-colors duration-300 min-w-[220px]"
              >
                Call {PHONE.main}
              </a>
              <a
                href={PHONE.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-green-500 text-green-400 font-semibold rounded-full px-8 py-4 text-sm hover:bg-green-500/10 transition-colors duration-300 min-w-[220px]"
              >
                WhatsApp Us
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.35}>
            <div className="mt-10 text-white/50 text-sm space-y-1">
              <p>
                {HOURS.days} &middot; {HOURS.time} {HOURS.timezone}
              </p>
              <p>{ADDRESS.full}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Keyframe for hero zoom ─── */}
      <style jsx global>{`
        @keyframes heroZoom {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.05);
          }
        }
      `}</style>
    </main>
  );
}
