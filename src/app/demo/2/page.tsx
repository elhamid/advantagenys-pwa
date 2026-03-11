"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { PHONE } from "@/lib/constants";

/* ─────────────────────────── CSS Custom Properties ─────────────────────────── */

const CSS_VARS = `
  :root {
    --navy: #0A1628;
    --navy-light: #162035;
    --blue-accent: #2563EB;
    --blue-accent-light: #3B82F6;
    --gold: #D4970A;
    --gold-light: #F5C842;
    --surface: #FFFFFF;
    --bg: #F8FAFC;
    --border: #E2E8F0;
    --text: #0F172A;
    --text-muted: #64748B;
    --green: #25D366;
  }
`;

/* ─────────────────────────── Animations Keyframes ──────────────────────────── */

const KEYFRAMES = `
  @keyframes gradientMesh {
    0%, 100% {
      background-position: 0% 50%, 50% 80%, 100% 20%;
    }
    25% {
      background-position: 30% 20%, 80% 50%, 20% 80%;
    }
    50% {
      background-position: 60% 80%, 20% 30%, 80% 60%;
    }
    75% {
      background-position: 80% 40%, 40% 70%, 50% 30%;
    }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%) rotate(15deg); }
    100% { transform: translateX(200%) rotate(15deg); }
  }

  @keyframes pulse-ring {
    0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
    100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
  }

  @keyframes countUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

/* ──────────────────────────── Noise SVG Texture ────────────────────────────── */

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ────────────────────────────── Data Constants ─────────────────────────────── */

const STATS = [
  { label: "Years", value: 20, suffix: "+", width: 85 },
  { label: "ITINs Processed", value: 2250, suffix: "+", width: 92 },
  { label: "Services", value: 38, suffix: "", width: 76 },
  { label: "NYC Local", value: 100, suffix: "%", width: 100 },
];

const SERVICES_WHEEL = [
  { label: "Formation", angle: 0 },
  { label: "Licensing", angle: 60 },
  { label: "Insurance", angle: 120 },
  { label: "Tax", angle: 180 },
  { label: "Audit", angle: 240 },
  { label: "Financial", angle: 300 },
];

const TESTIMONIALS = [
  {
    quote:
      "They handled everything from my LLC to my first insurance policy. One firm, no runaround.",
    author: "Maria G.",
    business: "Restaurant Owner, Queens",
  },
  {
    quote:
      "Got my ITIN in weeks, not months. Kedar knew exactly what the IRS needed. Lifesaver.",
    author: "Rajesh P.",
    business: "Contractor, Brooklyn",
  },
  {
    quote:
      "When I got a sales tax audit notice, I panicked. They resolved it and cut the fine by 60%.",
    author: "David L.",
    business: "Retail Shop, Manhattan",
  },
];

const JOURNEY_STEPS = [
  { label: "Form", detail: "LLC, Corp, or Non-Profit formation with EIN" },
  { label: "License", detail: "All NYC and NYS permits and licenses" },
  { label: "Insure", detail: "Liability, workers comp, disability coverage" },
  { label: "Tax", detail: "ITIN, business & personal tax preparation" },
  { label: "Defend", detail: "Audit defense with fine reduction expertise" },
];

/* ────────────────────────────── Utility Hooks ──────────────────────────────── */

function useCountUp(end: number, duration = 2000, inView: boolean) {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!inView || hasRun.current) return;
    hasRun.current = true;
    const steps = 60;
    const increment = end / steps;
    const stepDuration = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);
    return () => clearInterval(timer);
  }, [end, duration, inView]);

  return count;
}

/* ────────────────────────── Cell Wrapper Component ─────────────────────────── */

function BentoCell({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={
        isInView
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 0, scale: 0.95, y: 20 }
      }
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -4,
        boxShadow:
          "0 20px 40px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.03)",
      }}
      className={`rounded-2xl bg-white border border-[var(--border)] shadow-sm overflow-hidden transition-shadow duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────── Cell 1: Hero ───────────────────────────────────── */

function HeroCell() {
  const title = "One Firm. Every Solution.";

  return (
    <BentoCell
      className="col-span-1 row-span-2 md:col-span-2 md:row-span-2 relative min-h-[360px] md:min-h-[420px]"
      delay={0}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(37, 99, 235, 0.10) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(10, 22, 40, 0.08) 0%, transparent 55%),
            radial-gradient(ellipse at 50% 80%, rgba(212, 151, 10, 0.05) 0%, transparent 50%)
          `,
          backgroundSize: "200% 200%, 200% 200%, 200% 200%",
          animation: "gradientMesh 12s ease-in-out infinite",
        }}
      />
      <div className="relative z-10 flex flex-col justify-center h-full p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--navy)] mb-4 leading-[1.1]">
          {title.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.3 + i * 0.02,
                ease: "easeOut",
              }}
              className="inline-block"
              style={{ whiteSpace: char === " " ? "pre" : undefined }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="text-lg md:text-xl text-[var(--text-muted)] max-w-md"
        >
          Business consulting for NYC&apos;s entrepreneurs
        </motion.p>
      </div>
    </BentoCell>
  );
}

/* ─────────────────────────── Cell 2: Stats ──────────────────────────────────── */

function StatItem({
  stat,
  inView,
  delay,
}: {
  stat: (typeof STATS)[number];
  inView: boolean;
  delay: number;
}) {
  const count = useCountUp(stat.value, 2000, inView);

  return (
    <div className="flex-1 min-w-[120px]">
      <div className="text-2xl md:text-3xl font-bold text-[var(--navy)] tabular-nums">
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <div className="text-sm text-[var(--text-muted)] mt-1 mb-2">
        {stat.label}
      </div>
      <div className="h-1 rounded-full bg-[var(--border)] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${stat.width}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
          className="h-full rounded-full bg-[var(--blue-accent)]"
        />
      </div>
    </div>
  );
}

function StatsCell() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <BentoCell
      className="col-span-1 md:col-span-2 row-span-1"
      delay={0.1}
    >
      <div ref={ref} className="p-6 md:p-8">
        <div className="flex flex-wrap gap-6 md:gap-8">
          {STATS.map((stat, i) => (
            <StatItem
              key={stat.label}
              stat={stat}
              inView={isInView}
              delay={i * 0.15}
            />
          ))}
        </div>
      </div>
    </BentoCell>
  );
}

/* ──────────────────────── Cell 3: Service Wheel ────────────────────────────── */

function ServiceWheel() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const handleHover = useCallback((index: number | null) => {
    setHoveredIndex(index);
    if (index !== null) {
      setRotation((prev) => prev + 8);
    }
  }, []);

  const radius = 90;

  return (
    <BentoCell
      className="col-span-1 row-span-1 md:row-span-2"
      delay={0.2}
    >
      <div className="p-6 h-full flex flex-col items-center justify-center min-h-[320px]">
        <div className="relative w-[240px] h-[240px]">
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {SERVICES_WHEEL.map((service, i) => {
              const rad = (service.angle * Math.PI) / 180;
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;
              const isHovered = hoveredIndex === i;

              return (
                <motion.div
                  key={service.label}
                  animate={{
                    scale: isHovered ? 1.2 : 1,
                    rotate: -rotation,
                  }}
                  transition={{ duration: 0.3 }}
                  onMouseEnter={() => handleHover(i)}
                  onMouseLeave={() => handleHover(null)}
                  className="absolute flex items-center justify-center cursor-pointer"
                  style={{
                    left: `calc(50% + ${x}px - 32px)`,
                    top: `calc(50% + ${y}px - 32px)`,
                    width: 64,
                    height: 64,
                  }}
                >
                  <div
                    className={`
                      w-full h-full rounded-xl flex items-center justify-center text-xs font-semibold
                      transition-colors duration-200 text-center leading-tight px-1
                      ${
                        isHovered
                          ? "bg-[var(--blue-accent)] text-white shadow-lg"
                          : "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
                      }
                    `}
                  >
                    {service.label}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(37,99,235,0.2)",
                  "0 0 0 12px rgba(37,99,235,0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-[var(--navy)] flex items-center justify-center"
            >
              <span className="text-white text-xs font-bold text-center leading-tight">
                Full
                <br />
                Service
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </BentoCell>
  );
}

/* ──────────────────────── Cell 4: Trust Badge ──────────────────────────────── */

function TrustBadge() {
  return (
    <BentoCell className="col-span-1 row-span-1" delay={0.25}>
      <div
        className="relative p-6 h-full flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          border: "1.5px solid var(--gold)",
          borderRadius: "1rem",
          boxShadow: "0 0 20px -4px rgba(212, 151, 10, 0.15)",
        }}
      >
        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ overflow: "hidden" }}
        >
          <div
            className="absolute top-0 left-0 w-[60%] h-full"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
              animation: "shimmer 3s infinite",
            }}
          />
        </div>

        {/* Badge icon */}
        <div className="relative z-10">
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            className="mx-auto mb-3"
          >
            <circle
              cx="28"
              cy="28"
              r="26"
              stroke="var(--gold)"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="28" cy="28" r="20" fill="var(--gold)" opacity="0.12" />
            <path
              d="M28 14l3.5 7.5L40 23l-6 5.5L35.5 37 28 33l-7.5 4L22 28.5l-6-5.5 8.5-1.5L28 14z"
              fill="var(--gold)"
            />
          </svg>
          <p className="text-sm font-bold text-[var(--navy)]">
            IRS Certified
            <br />
            Acceptance Agent
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Authorized ITIN Processing
          </p>
        </div>
      </div>
    </BentoCell>
  );
}

/* ─────────────────────── Cell 5: Testimonials ──────────────────────────────── */

function TestimonialsCell() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <BentoCell className="col-span-1 md:col-span-2 row-span-1" delay={0.15}>
      <div className="relative p-6 md:p-8 min-h-[180px] flex flex-col justify-between">
        {/* Background quote mark */}
        <div
          className="absolute top-4 left-6 text-8xl font-serif leading-none pointer-events-none select-none"
          style={{ color: "rgba(37, 99, 235, 0.08)" }}
        >
          &ldquo;
        </div>

        <div className="relative z-10 flex-1 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-base md:text-lg text-[var(--text)] leading-relaxed mb-4 italic">
                &ldquo;{TESTIMONIALS[activeIndex].quote}&rdquo;
              </p>
              <p className="text-sm font-semibold text-[var(--navy)]">
                {TESTIMONIALS[activeIndex].author}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {TESTIMONIALS[activeIndex].business}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex gap-2 mt-4">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${
                  i === activeIndex
                    ? "bg-[var(--blue-accent)] w-6"
                    : "bg-[var(--border)] hover:bg-[var(--text-muted)]"
                }
              `}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </BentoCell>
  );
}

/* ──────────────────────── Cell 6: Journey Map ──────────────────────────────── */

function JourneyMap() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <BentoCell className="col-span-1 md:col-span-2 row-span-1" delay={0.2}>
      <div ref={ref} className="p-6 md:p-8">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-5">
          Your Business Journey
        </p>
        <div className="flex flex-wrap items-center gap-2 md:gap-0">
          {JOURNEY_STEPS.map((step, i) => (
            <div
              key={step.label}
              className="flex items-center relative"
              onMouseEnter={() => setHoveredStep(i)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              {/* Step pill */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={
                  isInView
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.8 }
                }
                transition={{
                  duration: 0.4,
                  delay: i * 0.12,
                  ease: "easeOut",
                }}
                className={`
                  relative px-4 py-2 rounded-full text-sm font-medium cursor-default
                  transition-all duration-300 border
                  ${
                    hoveredStep === i
                      ? "bg-[var(--blue-accent)] text-white border-[var(--blue-accent)] shadow-md"
                      : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                  }
                `}
                style={
                  hoveredStep === i
                    ? {
                        animation: "pulse-ring 1.5s infinite",
                      }
                    : undefined
                }
              >
                {step.label}

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredStep === i && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-[var(--navy)] text-white text-xs rounded-lg shadow-lg z-20 pointer-events-none"
                    >
                      {step.detail}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--navy)] rotate-45 -mt-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Connector line */}
              {i < JOURNEY_STEPS.length - 1 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: 32 } : { width: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.12 + 0.2,
                    ease: "easeOut",
                  }}
                  className="hidden md:block h-[2px] bg-[var(--border)] mx-1 flex-shrink-0"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </BentoCell>
  );
}

/* ─────────────────────────── Cell 7: CTA ───────────────────────────────────── */

function CTACell() {
  return (
    <BentoCell
      className="col-span-1 md:col-span-4 row-span-1"
      delay={0.25}
    >
      <div
        className="relative p-8 md:p-12 text-center overflow-hidden"
        style={{ background: "var(--navy)" }}
      >
        {/* Noise overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: NOISE_SVG,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
          }}
        />

        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
            Let&apos;s build your business together.
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            {PHONE.main} &middot; Cambria Heights, NY
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.a
              href={`tel:${PHONE.mainTel}`}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-colors duration-200"
              style={{ background: "var(--blue-accent)" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" />
              </svg>
              Schedule a Call
            </motion.a>

            <motion.a
              href={PHONE.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors duration-200 border-2"
              style={{
                borderColor: "var(--green)",
                color: "var(--green)",
                background: "transparent",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.47 14.38c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.66.15-.2.29-.76.95-.93 1.14-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.7-1.61-1.99-.17-.29-.02-.45.13-.59.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.58-.9-2.17-.24-.56-.48-.49-.66-.5h-.56c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.43 0 1.44 1.05 2.83 1.2 3.02.15.2 2.06 3.14 4.98 4.41.7.3 1.24.48 1.66.61.7.22 1.33.19 1.83.12.56-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.27-.2-.56-.34zM12.05 21.5c-1.8 0-3.56-.48-5.1-1.4l-.37-.22-3.8 1 1.02-3.72-.24-.38A9.44 9.44 0 012.5 12.05C2.5 6.8 6.8 2.5 12.05 2.5c2.55 0 4.95 1 6.76 2.8a9.5 9.5 0 012.8 6.75c0 5.25-4.3 9.55-9.56 9.55zM12.05.5C5.7.5.5 5.7.5 12.05c0 2.04.53 4.03 1.54 5.78L.5 23.5l5.8-1.52A11.46 11.46 0 0012.05 23.5c6.35 0 11.55-5.2 11.55-11.55S18.4.5 12.05.5z" />
              </svg>
              WhatsApp
            </motion.a>
          </div>
        </div>
      </div>
    </BentoCell>
  );
}

/* ─────────────────────────── Navigation Bar ─────────────────────────────────── */

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "var(--navy)" }}
          >
            A
          </div>
          <span className="text-sm font-semibold text-[var(--navy)] tracking-tight">
            Advantage Services
          </span>
        </div>
        <a
          href={`tel:${PHONE.mainTel}`}
          className="text-sm font-medium text-[var(--blue-accent)] hover:text-[var(--navy)] transition-colors duration-200"
        >
          Contact
        </a>
      </div>
    </nav>
  );
}

/* ═══════════════════════════ Main Page ══════════════════════════════════════ */

export default function BentoDemoPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS_VARS + KEYFRAMES }} />
      <div
        className="min-h-screen"
        style={{ background: "var(--bg)", color: "var(--text)" }}
      >
        <NavBar />

        <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
            {/* Row 1-2: Hero (2x2) + Stats (2x1) stacked with Service Wheel (1x2) + Trust Badge (1x1) */}
            <HeroCell />
            <StatsCell />
            <ServiceWheel />
            <TrustBadge />

            {/* Row 3: Testimonials (2x1) + Journey (2x1) */}
            <TestimonialsCell />
            <JourneyMap />

            {/* Row 4: Full-width CTA */}
            <CTACell />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] py-6">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
            <span>Advantage Business Consulting LLC</span>
            <span>{PHONE.main}</span>
          </div>
        </footer>
      </div>
    </>
  );
}
