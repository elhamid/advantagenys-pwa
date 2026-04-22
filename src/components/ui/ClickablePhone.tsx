"use client";

import type { ReactNode } from "react";
import { phoneClick } from "@/lib/analytics/events";

interface ClickablePhoneProps {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}

/**
 * `tel:` anchor that fires a `phoneClick` analytics event.
 * Use in place of `<a href="tel:...">` anywhere we want to measure call intent.
 */
export function ClickablePhone({
  href,
  className,
  children,
  ariaLabel,
}: ClickablePhoneProps) {
  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={() => phoneClick()}
    >
      {children}
    </a>
  );
}
