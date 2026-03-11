"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

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

const JOURNEY_STEPS = [
  "Form Your Business",
  "Get Licensed",
  "Get Insured",
  "File Your Taxes",
  "Defend Your Audits",
  "Grow",
];

function Timeline() {
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

export function JourneyTimeline() {
  return (
    <section className="bg-white py-14 md:py-20">
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
          <Timeline />
        </ScrollReveal>
      </div>
    </section>
  );
}
