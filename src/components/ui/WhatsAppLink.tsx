"use client";

import { useInAppBrowser, safeBlankTarget } from "@/hooks/useInAppBrowser";
import { whatsappClick } from "@/lib/analytics/events";

interface WhatsAppLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Anchor for WhatsApp (`wa.me/...`) links that stays same-tab when the user
 * is already inside a WhatsApp / IG / FB in-app browser — `target="_blank"`
 * inside those browsers opens a broken modal. On regular browsers it behaves
 * like a normal external link.
 */
export function WhatsAppLink({ href, className, children }: WhatsAppLinkProps) {
  const inAppBrowser = useInAppBrowser();
  return (
    <a
      href={href}
      target={safeBlankTarget(inAppBrowser)}
      rel="noopener noreferrer"
      className={className}
      onClick={() => whatsappClick()}
    >
      {children}
    </a>
  );
}
