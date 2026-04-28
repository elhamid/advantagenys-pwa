import type { Metadata } from "next";
import { GOOGLE_RATING } from "@/lib/reviews";
import { BookingFlow } from "./BookingFlow";

export const metadata: Metadata = {
  title: "Book a Free Consult — Advantage Business Consulting",
  description:
    "Pick a time that works for you. Tax, ITIN, business formation, licensing, insurance, and more — meet with a specialist in 30 minutes, free.",
  alternates: {
    canonical: "https://advantagenys.com/book",
  },
  openGraph: {
    title: "Book a Free Consult — Advantage Business Consulting",
    description:
      "Pick a time that works for you. Tax, ITIN, business formation, licensing, insurance, and more — meet with a specialist in 30 minutes, free.",
    url: "https://advantagenys.com/book",
  },
};

export default function BookPage() {
  return (
    <main id="main" className="min-h-screen bg-[var(--bg)]">
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="relative overflow-hidden py-14 md:py-20"
        style={{ background: "linear-gradient(135deg, #1A3A5C 0%, #4F56E8 100%)" }}
      >
        {/* Subtle geometric accent — no dependency */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-2xl px-5 text-center">
          {/* Trust badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="flex-shrink-0">
              <path d="M7 1.5L2 4v4.5c0 2.75 2.1 5.35 5 6 2.9-.65 5-3.25 5-6V4L7 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
              <path d="M5 7l1.5 1.5L9.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            IRS Certified Acceptance Agent · 20+ Years in Queens, NYC
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Book a Free Consultation
          </h1>
          <p className="mt-3 text-base text-white/80 max-w-lg mx-auto leading-relaxed">
            Tax returns, ITIN applications, LLC formation, insurance, audit defense — meet with a specialist in 30 minutes at no cost.
          </p>

          {/* Social proof strip */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/70">
            <span className="flex items-center gap-1.5">
              <span className="text-[#F9A825]">★★★★★</span>
              <span className="font-semibold text-white">{GOOGLE_RATING.rating}</span>
              <span>· {GOOGLE_RATING.totalReviews} Google reviews</span>
            </span>
            <span className="w-px h-3 bg-white/30" aria-hidden="true" />
            <span>Serving immigrants &amp; small businesses</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Flow card                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-2xl px-4 py-10 md:py-14">
        <div className="rounded-[var(--radius-xl)] bg-[var(--surface)] shadow-[var(--shadow-lg)] border border-[var(--border)] p-6 sm:p-8">
          <BookingFlow />
        </div>

        {/* Below-card reassurance */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--text-muted)]">
          <span>Prefer to call?</span>
          <a href="tel:+19299331396" className="font-medium text-[var(--blue-accent)] hover:underline underline-offset-2">
            (929) 933-1396
          </a>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <a
            href="https://wa.me/19299331396"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--blue-accent)] hover:underline underline-offset-2"
          >
            WhatsApp
          </a>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <a href="mailto:info@advantagenys.com" className="font-medium text-[var(--blue-accent)] hover:underline underline-offset-2">
            info@advantagenys.com
          </a>
        </div>
      </section>
    </main>
  );
}
