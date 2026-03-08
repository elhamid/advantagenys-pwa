"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  animate,
} from "framer-motion";
import clsx from "clsx";
import { PHONE, ADDRESS, SERVICES } from "@/lib/constants";

/* ─────────────────────────────────────────────
   ROLLING NUMBER COMPONENT
   Slot-machine style counter
   ───────────────────────────────────────────── */

function RollingNumber({
  value,
  suffix = "",
  label,
  delay = 0,
}: {
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const timeout = setTimeout(() => {
      const controls = animate(0, value, {
        duration: 1.8,
        ease: [0.32, 0.72, 0, 1],
        onUpdate(v) {
          setDisplay(Math.round(v));
        },
        onComplete() {
          setDone(true);
        },
      });
      return () => controls.stop();
    }, delay);
    return () => clearTimeout(timeout);
  }, [isInView, value, delay]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <div className="relative overflow-hidden">
        <motion.span
          className="block text-7xl sm:text-8xl md:text-9xl font-bold tracking-tighter"
          style={{ color: "var(--navy)" }}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: delay / 1000 }}
        >
          {display.toLocaleString()}
          {suffix}
        </motion.span>
      </div>
      <div className="relative">
        <span
          className="text-sm sm:text-base uppercase tracking-[0.2em] font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </span>
        <motion.div
          className="absolute -bottom-1 left-0 right-0 h-[2px]"
          style={{ background: "var(--gold)" }}
          initial={{ scaleX: 0 }}
          animate={done ? { scaleX: 1 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAGNETIC CARD COMPONENT
   Tilt toward cursor on hover
   ───────────────────────────────────────────── */

const SERVICE_ICONS: Record<string, string> = {
  "Business Formation": "M3 21V5a2 2 0 012-2h6l2 2h6a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  Licensing: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  "Tax Services": "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  Insurance: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  "Audit Defense": "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
  "Financial Services": "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
};

function MagneticCard({
  service,
  index,
}: {
  service: (typeof SERVICES)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), {
    stiffness: 200,
    damping: 20,
  });
  const [hovered, setHovered] = useState(false);

  const handleMouse = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left) / rect.width - 0.5);
      y.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [x, y]
  );

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setHovered(false);
  }, [x, y]);

  const iconPath = SERVICE_ICONS[service.name] || "";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      onMouseMove={handleMouse}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      className="group relative cursor-default"
    >
      <motion.div
        className="relative overflow-hidden rounded-xl p-8 h-full"
        style={{
          background: "var(--surface)",
          boxShadow: hovered
            ? "0 20px 40px rgba(0,0,0,0.12)"
            : "var(--shadow-card)",
          border: "1px solid var(--border)",
        }}
        animate={{ y: hovered ? -8 : 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Bottom border slide-in */}
        <motion.div
          className="absolute bottom-0 left-0 h-[3px]"
          style={{ background: "var(--blue-accent)" }}
          initial={{ width: 0 }}
          animate={{ width: hovered ? "100%" : 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />

        <div className="mb-5">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--blue-accent)" }}
          >
            <path d={iconPath} />
          </svg>
        </div>
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--text)" }}
        >
          {service.name}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {service.description}
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   TIMELINE STEP COMPONENT
   ───────────────────────────────────────────── */

const JOURNEY_STEPS = [
  { label: "Form", desc: "LLC, Corp, or Non-Profit" },
  { label: "License", desc: "Permits & compliance" },
  { label: "Insure", desc: "Coverage & protection" },
  { label: "Tax", desc: "ITIN, filing, strategy" },
  { label: "Defend", desc: "Audit representation" },
  { label: "Grow", desc: "Bookkeeping & analysis" },
];

function TimelineStep({
  step,
  index,
  total,
}: {
  step: (typeof JOURNEY_STEPS)[number];
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center relative"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
    >
      {/* Pulse node */}
      <div className="relative mb-4">
        <motion.div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm relative z-10"
          style={{ background: "var(--blue-accent)" }}
          animate={
            isInView
              ? {
                  boxShadow: [
                    "0 0 0 0px rgba(79,86,232,0.4)",
                    "0 0 0 12px rgba(79,86,232,0)",
                  ],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1,
            delay: index * 0.2,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </motion.div>
      </div>

      <span
        className="text-base font-semibold mb-1"
        style={{ color: "var(--navy)" }}
      >
        {step.label}
      </span>
      <span
        className="text-xs text-center"
        style={{ color: "var(--text-muted)" }}
      >
        {step.desc}
      </span>

      {/* Connector line (not on last) */}
      {index < total - 1 && (
        <motion.div
          className="hidden md:block absolute top-7 left-[calc(50%+28px)] h-[2px]"
          style={{
            background: "var(--blue-accent)",
            width: "calc(100% - 56px)",
            transformOrigin: "left",
          }}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: index * 0.12 + 0.3 }}
        />
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   SHIMMER BUTTON
   ───────────────────────────────────────────── */

function ShimmerButton({
  children,
  variant = "primary",
  href,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  href: string;
}) {
  const isPrimary = variant === "primary";
  return (
    <motion.a
      href={href}
      className={clsx(
        "relative overflow-hidden inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-base tracking-wide transition-colors",
        isPrimary ? "text-white" : "text-white/90 border border-white/20"
      )}
      style={{
        background: isPrimary ? "var(--blue-accent)" : "rgba(255,255,255,0.08)",
        willChange: "transform",
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Shimmer sweep */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 group-shimmer"
        style={{
          background:
            "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.3) 50%, transparent 80%)",
        }}
      />
      <style jsx>{`
        @keyframes shimmer-sweep {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        a:hover .group-shimmer {
          animation: shimmer-sweep 0.8s ease-out;
        }
      `}</style>
      {children}
    </motion.a>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────── */

export default function DemoPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Parallax text spread
  const leftX = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const rightX = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const lineWidth = useTransform(scrollYProgress, [0, 0.3], ["0%", "80%"]);
  const gridOpacity = useTransform(scrollYProgress, [0.05, 0.4], [0, 0.15]);

  // Scroll indicator
  const chevronY = useSpring(
    useTransform(scrollYProgress, [0, 0.15], [0, 30]),
    { stiffness: 100, damping: 20 }
  );
  const chevronOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <div className="relative overflow-x-hidden">
      {/* ═══════════════════════════════════════
          SECTION 1 — CINEMATIC HERO
          ═══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #1A3A5C 0%, #0B1829 100%)",
        }}
      >
        {/* Subtle grid pattern */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: gridOpacity,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        <motion.div
          className="relative z-10 text-center px-6"
          style={{ opacity: heroOpacity }}
        >
          {/* Split headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] mb-8">
            <motion.span
              className="inline-block"
              style={{ x: leftX, willChange: "transform" }}
            >
              Your Business.
            </motion.span>
            <br />
            <motion.span
              className="inline-block"
              style={{ x: rightX, willChange: "transform" }}
            >
              Our Expertise.
            </motion.span>
          </h1>

          {/* Gold line */}
          <motion.div
            className="h-[1px] mx-auto mb-8"
            style={{
              background: "var(--gold)",
              width: lineWidth,
              willChange: "width",
            }}
          />

          {/* Badge */}
          <motion.p
            className="text-sm sm:text-base tracking-[0.25em] uppercase font-medium"
            style={{ color: "rgba(255,255,255,0.5)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Est. 2004 &middot; {ADDRESS.city}, {ADDRESS.state}
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ y: chevronY, opacity: chevronOpacity }}
        >
          <span
            className="text-[10px] uppercase tracking-[0.3em]"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Scroll
          </span>
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.5"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M4 7l6 6 6-6" />
          </motion.svg>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2 — STATS COUNTER
          ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto w-full">
          <motion.p
            className="text-center text-sm uppercase tracking-[0.25em] mb-16 font-medium"
            style={{ color: "var(--text-muted)" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            The Numbers Behind the Trust
          </motion.p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            <RollingNumber value={20} suffix="+" label="Years" delay={0} />
            <RollingNumber value={2250} suffix="+" label="ITINs Processed" delay={200} />
            <RollingNumber value={38} suffix="" label="Services" delay={400} />
            <RollingNumber value={5} suffix="" label="Specialists" delay={600} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3 — SERVICE CARDS (MAGNETIC)
          ═══════════════════════════════════════ */}
      <section
        className="relative py-24 px-6"
        style={{ background: "var(--bg)" }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "var(--navy)" }}
            >
              Full-Spectrum Services
            </h2>
            <p
              className="text-base max-w-xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Every business need under one roof. From formation to ongoing
              compliance, we handle it all.
            </p>
          </motion.div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            style={{ perspective: "1200px" }}
          >
            {SERVICES.map((service, i) => (
              <MagneticCard key={service.name} service={service} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 4 — THE JOURNEY TIMELINE
          ═══════════════════════════════════════ */}
      <section className="relative py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "var(--navy)" }}
            >
              The Client Journey
            </h2>
            <p
              className="text-base max-w-lg mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              One relationship. Every milestone covered.
            </p>
          </motion.div>

          {/* Desktop horizontal / Mobile vertical */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-10 md:gap-4">
            {JOURNEY_STEPS.map((step, i) => (
              <TimelineStep
                key={step.label}
                step={step}
                index={i}
                total={JOURNEY_STEPS.length}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5 — CTA WITH PARTICLES
          ═══════════════════════════════════════ */}
      <section
        className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-24 px-6"
        style={{
          background: "linear-gradient(180deg, #0B1829 0%, #1A3A5C 100%)",
        }}
      >
        {/* Floating particles (pure CSS) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="particle-dot"
              style={
                {
                  "--x": `${5 + ((i * 37) % 90)}%`,
                  "--y": `${5 + ((i * 53) % 90)}%`,
                  "--dur": `${18 + (i % 7) * 4}s`,
                  "--delay": `${-(i * 1.3)}s`,
                  "--size": `${2 + (i % 3)}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <style jsx>{`
          .particle-dot {
            position: absolute;
            left: var(--x);
            top: var(--y);
            width: var(--size);
            height: var(--size);
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.15);
            animation: drift var(--dur) ease-in-out var(--delay) infinite alternate;
            will-change: transform;
          }
          @keyframes drift {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0.1;
            }
            50% {
              opacity: 0.35;
            }
            100% {
              transform: translate(30px, -40px) scale(1.5);
              opacity: 0.1;
            }
          }
        `}</style>

        <motion.div
          className="relative z-10 text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to talk?
          </h2>
          <p
            className="text-base sm:text-lg mb-12 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Twenty years of experience. One conversation to start.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <ShimmerButton href={`tel:${PHONE.mainTel}`} variant="primary">
              Call {PHONE.main}
            </ShimmerButton>
            <ShimmerButton href={PHONE.whatsappLink} variant="secondary">
              WhatsApp Us
            </ShimmerButton>
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <span>{ADDRESS.full}</span>
            <span className="hidden sm:inline">&middot;</span>
            <span>Mon - Sat, 9 AM - 7 PM ET</span>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
