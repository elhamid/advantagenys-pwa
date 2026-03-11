"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PHONE, SERVICES } from "@/lib/constants";
import { MobileNav } from "./MobileNav";

const NAV_ITEMS = [
  { label: "Services", href: "/services", children: SERVICES },
  { label: "Industries", href: "/industries/contractors" },
  { label: "About", href: "/about" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)]">
      <Container className="flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight" style={{ color: "var(--blue-accent)" }}>
            Advantage
          </span>
          <span className="text-xl font-bold tracking-tight" style={{ color: "var(--navy)" }}>
            Services
          </span>
        </Link>

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

        <div className="hidden md:flex items-center gap-3">
          <a
            href={`tel:${PHONE.mainTel}`}
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--blue-accent)] transition-colors"
          >
            {PHONE.main}
          </a>
          <Button size="sm" href="/contact">
            Get Started
          </Button>
        </div>

        <button
          className="md:hidden p-2.5 -mr-1 rounded-xl text-[var(--text)] hover:bg-slate-50 active:scale-90 transition-all duration-200"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h12M4 17h8" />
          </svg>
        </button>
      </Container>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} items={NAV_ITEMS} />
    </header>
  );
}
