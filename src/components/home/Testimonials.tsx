"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { REVIEWS } from "@/lib/reviews";

// Real Google Reviews — Palmyre (business/licensing/insurance), Delacia (tax),
// Oshane (immigration). Unattributed quotes were removed for ads-compliance.
const REVIEW_NAMES = ["Palmyre Seraphin", "Delacia P.", "Oshane Hinds"] as const;
const TESTIMONIALS = REVIEW_NAMES
  .map((name) => REVIEWS.find((r) => r.name === name))
  .filter((r): r is (typeof REVIEWS)[number] => Boolean(r))
  .map((r) => ({
    quote: r.text,
    name: r.name,
    location: r.date,
  }));

const AUTOPLAY_MS = 4000;
const RESUME_MS = 8000;

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();

  const pauseAutoplay = useCallback(() => {
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), RESUME_MS);
  }, []);

  // Auto-rotate on mobile (the carousel is only visible on mobile)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  return (
    <section className="py-20 bg-[var(--blue-bg)]">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text)]">
            Trusted by NYC Businesses
          </h2>
        </div>

        {/* Desktop: static 3-column grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name}>
              <blockquote className="text-[var(--text)] leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="text-sm font-semibold text-[var(--text)]">{t.name}</div>
              <div className="text-xs text-[var(--text-muted)]">{t.location}</div>
            </Card>
          ))}
        </div>

        {/* Mobile: rotating carousel with fade transition */}
        <div
          className="md:hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
            resumeTimerRef.current = setTimeout(() => setIsPaused(false), RESUME_MS);
          }}
          onTouchStart={pauseAutoplay}
        >
          <div className="relative min-h-[180px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={reduceMotion ? false : { opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }}
              >
                <Card>
                  <blockquote className="text-[var(--text)] leading-relaxed mb-4">
                    &ldquo;{TESTIMONIALS[activeIndex].quote}&rdquo;
                  </blockquote>
                  <div className="text-sm font-semibold text-[var(--text)]">
                    {TESTIMONIALS[activeIndex].name}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {TESTIMONIALS[activeIndex].location}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-3 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveIndex(i); pauseAutoplay(); }}
                aria-label={`Go to testimonial ${i + 1}`}
                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    activeIndex === i ? "var(--accent, #4F56E8)" : "rgba(255,255,255,0.25)",
                  transform: activeIndex === i ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
