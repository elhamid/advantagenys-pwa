"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SERVICES } from "@/lib/constants";
import { MobileNav } from "./MobileNav";

const NAV_ITEMS = [
  { label: "Services", href: "/services", children: SERVICES },
  { label: "Industries", href: "/industries/contractors" },
  { label: "About", href: "/about" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

// ITIN gets its own highlighted nav entry — separate from NAV_ITEMS so it can be styled distinctly
const ITIN_NAV = { label: "ITIN", href: "/itin" };

interface HeaderProps {
  mobileNavOpen?: boolean;
  onMobileNavOpen?: () => void;
  onMobileNavClose?: () => void;
}

export function Header({
  mobileNavOpen = false,
  onMobileNavOpen,
  onMobileNavClose,
}: HeaderProps) {
  // Scroll-aware hide/show on mobile
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY;
      // Only collapse after user scrolls past 80px to avoid hiding on page load
      if (currentY > 80) {
        // Hide on scroll DOWN (currentY > lastScrollY = moving down), show on scroll UP
        setHidden(currentY > lastScrollY.current);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/88 backdrop-blur-xl supports-[backdrop-filter]:bg-white/72 md:translate-y-0 transition-transform duration-300"
      style={{
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
      }}
    >
      <Container className="flex min-h-14 md:min-h-16 items-center justify-between gap-3 py-2 md:py-0 pt-[env(safe-area-inset-top)]">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: "var(--blue-accent)" }}>
            Advantage
          </span>
          <span className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: "var(--navy)" }}>
            Services
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--blue-accent)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
          {/* ITIN — highlighted pill in nav */}
          <Link
            href={ITIN_NAV.href}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide text-emerald-700 transition-all duration-200 hover:text-white hover:shadow-[0_0_14px_rgba(5,150,105,0.35)]"
            style={{
              background: "linear-gradient(135deg, rgba(209,250,229,1) 0%, rgba(167,243,208,1) 100%)",
              border: "1px solid rgba(52,211,153,0.5)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "linear-gradient(135deg, #059669 0%, #0d9488 100%)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "linear-gradient(135deg, rgba(209,250,229,1) 0%, rgba(167,243,208,1) 100%)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(52,211,153,0.5)";
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M12 2L4 6v5c0 5.25 3.5 10.15 8 11.5C16.5 21.15 20 16.25 20 11V6l-8-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            ITIN
          </Link>
        </nav>

        {/* Desktop CTA — single "Book Free Consult" button */}
        <div className="hidden md:flex items-center">
          <Link
            href="/book"
            className="inline-flex items-center rounded-full bg-[var(--blue-accent)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Book Free Consult
          </Link>
        </div>

        {/* Mobile: compact "Book" button (BottomNav handles main navigation) */}
        <div className="flex md:hidden">
          <Link
            href="/book"
            className="inline-flex items-center rounded-full bg-[var(--blue-accent)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Book
          </Link>
        </div>
      </Container>

      {/* MobileNav — controlled from outside (BottomNav "More" button) */}
      <MobileNav
        open={mobileNavOpen}
        onClose={onMobileNavClose ?? (() => {})}
        items={NAV_ITEMS}
      />
    </header>
  );
}
