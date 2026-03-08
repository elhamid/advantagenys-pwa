"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";

interface NavItem {
  label: string;
  href: string;
}

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
}

export function MobileNav({ open, onClose, items }: MobileNavProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-72 bg-[var(--surface)] shadow-[var(--shadow-lg)] p-6 flex flex-col">
        <div className="flex justify-end mb-8">
          <button onClick={onClose} aria-label="Close menu" className="p-2 text-[var(--text)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="text-lg font-medium text-[var(--text)] hover:text-[var(--blue-accent)] transition-colors py-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <a
            href={`tel:${PHONE.mainTel}`}
            className="text-center text-sm font-medium text-[var(--text-secondary)]"
          >
            Call {PHONE.main}
          </a>
          <a
            href={PHONE.whatsappLink}
            className="text-center text-sm font-medium text-[var(--green)]"
          >
            WhatsApp Us
          </a>
          <Button href="/contact" className="w-full text-center">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
