"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
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
      <Container className="flex min-h-16 items-center justify-between gap-3 pt-[env(safe-area-inset-top)]">
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

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button size="sm" href="/contact">
            Get Started
          </Button>
        </div>

        {/* Mobile: logo only, no hamburger (BottomNav handles navigation) */}
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
