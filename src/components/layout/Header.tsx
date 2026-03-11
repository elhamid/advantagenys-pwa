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
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/88 backdrop-blur-xl supports-[backdrop-filter]:bg-white/72">
      <Container className="flex min-h-16 items-center justify-between gap-3 pt-[env(safe-area-inset-top)]">
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

        <div className="flex items-center gap-2 md:hidden">
          <a
            href={`tel:${PHONE.mainTel}`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            Call
          </a>

          <button
            className="p-2.5 -mr-1 rounded-xl text-[var(--text)] hover:bg-slate-50 active:scale-90 transition-all duration-200"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h12M4 17h8" />
            </svg>
          </button>
        </div>
      </Container>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} items={NAV_ITEMS} />
    </header>
  );
}
