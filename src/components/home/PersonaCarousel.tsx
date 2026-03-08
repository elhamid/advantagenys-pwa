"use client";

import { useRef, useState, useCallback, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

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
   PERSONA PANEL
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
   PERSONA CAROUSEL (exported)
   ═══════════════════════════════════════════════════════════════ */

export function PersonaCarousel() {
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

      {/* Bottom padding for desktop */}
      <div className="hidden lg:block h-16" />
    </section>
  );
}
