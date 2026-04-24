"use client";

import Link from "next/link";

interface IntakeCard {
  title: string;
  copy: string;
  time: string;
  href: string;
  accent: string;
  accentBg: string;
  accentText: string;
  icon: React.ReactNode;
}

const CARDS: IntakeCard[] = [
  {
    title: "Get Your ITIN",
    copy: "Apply for your Individual Tax ID Number. Takes about 10 minutes.",
    time: "~10 min",
    href: "/itin",
    accent: "#059669",
    accentBg: "#ECFDF5",
    accentText: "#065F46",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h5M7 12h8M7 16h5" />
      </svg>
    ),
  },
  {
    title: "Contractor License Qualifier",
    copy: "See if you qualify for NYC HIC or GC license. 2 minutes.",
    time: "~2 min",
    href: "/contractor-license",
    accent: "#D97706",
    accentBg: "#FFFBEB",
    accentText: "#92400E",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    title: "Business Formation",
    copy: "Form your LLC or Corporation. We handle the paperwork.",
    time: "~5 min",
    href: "/services/business-formation",
    accent: "#2563EB",
    accentBg: "#EFF6FF",
    accentText: "#1E40AF",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    title: "Tax Return Questionnaire",
    copy: "File your taxes with confidence.",
    time: "~8 min",
    href: "/resources/forms/tax-return-questionnaire",
    accent: "#1E293B",
    accentBg: "#F1F5F9",
    accentText: "#0F172A",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
];

export function FeaturedIntakeRail() {
  return (
    <section className="mb-12">
      <h2 className="text-lg font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-5 px-0.5">
        Start here
      </h2>
      {/* Desktop: 4-column row | Tablet: 2x2 | Mobile: vertical stack */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CARDS.map((card) => (
          <FeaturedCard key={card.href} card={card} />
        ))}
      </div>
    </section>
  );
}

function FeaturedCard({ card }: { card: IntakeCard }) {
  return (
    <Link
      href={card.href}
      className="group relative flex flex-col rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-0.5 min-h-[180px]"
    >
      {/* Accent ribbon */}
      <div
        className="h-1.5 w-full shrink-0"
        style={{ background: card.accent }}
        aria-hidden="true"
      />

      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: card.accentBg, color: card.accent }}
        >
          {card.icon}
        </div>

        {/* Text */}
        <div className="flex-1">
          <h3
            className="font-bold text-[var(--text)] mb-1 leading-snug"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.15rem)" }}
          >
            {card.title}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {card.copy}
          </p>
        </div>

        {/* Time signal + arrow */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: card.accentBg, color: card.accentText }}
          >
            {card.time}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[var(--text-muted)] group-hover:text-[var(--blue-accent)] group-hover:translate-x-0.5 transition-all"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
