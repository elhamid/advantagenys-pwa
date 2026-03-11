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
        transform: hidden ? "translateY(-100%)" : undefined,
      }}
    >
      <Container className="flex min-h-14 md:min-h-16 items-center justify-between gap-3 py-2 md:py-0 pt-[env(safe-area-inset-top)]">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight" style={{ color: "var(--blue-accent)" }}>
            Advantage
          </span>
          <span className="text-xl font-bold tracking-tight" style={{ color: "var(--navy)" }}>
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
        </nav>

        {/* Desktop CTA — single "Get Started" button */}
        <div className="hidden md:flex items-center">
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full bg-[var(--blue-accent)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile: compact "Get Started" button (BottomNav handles main navigation) */}
        <div className="flex md:hidden">
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full bg-[var(--blue-accent)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Get Started
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
