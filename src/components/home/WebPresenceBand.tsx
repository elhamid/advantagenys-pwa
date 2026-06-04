"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? false : { opacity: 0, y: 24 };
  const animate = reduceMotion ? {} : isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 };
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ type: "spring", stiffness: 260, damping: 25, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const PROOF_POINTS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
        <path d="M9 6h6M9 10h6M9 14h4" />
      </svg>
    ),
    text: "Installable web app (PWA) — not a generic template.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
      </svg>
    ),
    text: "Get found on Google — Business Profile, reviews, and local SEO, done for you.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 2L4 6v5c0 5.25 3.5 10.15 8 11.5C16.5 21.15 20 16.25 20 11V6l-8-4z" />
      </svg>
    ),
    text: "You own everything — your Google, your payments straight to your Stripe, your data. No contracts.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    text: "Optional: an AI assistant that greets customers in their language — set up by us, with a human always in the loop.",
  },
];

export function WebPresenceBand() {
  return (
    <section className="py-14 sm:py-16 bg-[var(--bg-section)]">
      <Container>
        <div className="rounded-[var(--radius-xl)] border border-[var(--gold)] bg-[var(--surface)] shadow-[0_0_0_3px_rgba(212,151,10,0.1),var(--shadow-lg)] overflow-hidden">
          {/* Gold accent bar at top */}
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, var(--gold) 0%, var(--gold-bright) 100%)" }} />

          <div className="p-8 sm:p-10 lg:p-12">
            <div className="lg:flex lg:items-start lg:gap-12">
              {/* Left: copy */}
              <div className="flex-1">
                <ScrollReveal>
                  <Badge variant="warning" className="mb-4">
                    New · Web Presence
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-3 leading-tight">
                    More than a website.{" "}
                    <span style={{ color: "var(--gold)" }}>A web app that works for you.</span>
                  </h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed mb-6 max-w-xl">
                    Anyone can generate a page. We get you found on Google, fill your reviews, and get you paid — built and run for you, in your language.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={0.1}>
                  <ul className="space-y-3 mb-8">
                    {PROOF_POINTS.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="flex-shrink-0 w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center mt-0.5"
                          style={{ background: "rgba(212,151,10,0.08)", color: "var(--gold)" }}
                        >
                          {point.icon}
                        </span>
                        <span className="text-sm text-[var(--text-secondary)] leading-relaxed pt-1">
                          {point.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </ScrollReveal>
              </div>

              {/* Right: outcome + CTA */}
              <ScrollReveal delay={0.15} className="lg:w-64 lg:flex-shrink-0">
                <div className="rounded-[var(--radius-lg)] border border-[var(--gold)]/30 bg-amber-50/50 p-6 text-center">
                  <p
                    className="text-lg font-bold mb-1"
                    style={{ color: "var(--gold)" }}
                  >
                    Get found. Get reviews. Get paid.
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mb-5">From $49/mo · no contracts · in your language</p>
                  <Button
                    href="/services/web-presence/"
                    size="md"
                    className="w-full !bg-[var(--gold)] hover:!opacity-90 !text-white font-bold shadow-md shadow-[rgba(212,151,10,0.3)]"
                  >
                    See Web Presence →
                  </Button>
                  <Link
                    href="/book"
                    className="mt-3 block text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors duration-150"
                  >
                    or book a free consult
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
