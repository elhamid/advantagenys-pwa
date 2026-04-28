"use client";

/**
 * ContactChip — anchored chrome contact rail for the ChatPanel header.
 *
 * Lives in the header gradient bar, NOT in the message stream.
 * Three glass-pill actions: WhatsApp, Email, Phone.
 * Desktop: icon + micro-label. Mobile: icon-only.
 * Fade-in on first mount; snaps to visible if prefers-reduced-motion.
 * Reads all contact constants from contact-info.ts — zero prop dependency.
 */

import { useReducedMotion } from "framer-motion";
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  CONTACT_WHATSAPP_URL,
  CONTACT_EMAIL_HREF,
} from "@/lib/contact-info";

// Icon components — inline SVG, aria-hidden, consistent 14×14 viewport
function WhatsAppIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.94 6.94l1.52-1.52a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Individual glass-pill chip
// ---------------------------------------------------------------------------

interface ChipProps {
  href: string;
  ariaLabel: string;
  /** Shown on sm+ screens only */
  label: string;
  /** Tailwind + inline style for the glass tint */
  tintClass: string;
  tintStyle?: React.CSSProperties;
  icon: React.ReactNode;
  animationDelay: number;
  animate: boolean;
}

function Chip({
  href,
  ariaLabel,
  label,
  tintClass,
  tintStyle,
  icon,
  animationDelay,
  animate,
}: ChipProps) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={[
        // Layout
        "relative inline-flex items-center gap-1.5",
        // Size — 44px touch target vertically via min-h, horizontal via px
        "min-h-[44px] px-2.5 sm:px-3",
        // Shape
        "rounded-full",
        // Glass base — semi-transparent white tint over gradient
        "backdrop-blur-sm",
        tintClass,
        // Inner highlight stroke (embossed quality)
        "ring-1 ring-inset ring-white/20",
        // Typography
        "text-white",
        // Interactions
        "transition-all duration-150",
        "hover:ring-white/40 hover:brightness-110",
        "active:scale-95",
        // Focus ring — keyboard nav
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-transparent",
        // Fade-in animation class
        animate ? "contact-chip-enter" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...tintStyle,
        ...(animate
          ? ({
              "--chip-delay": `${animationDelay}ms`,
            } as React.CSSProperties)
          : {}),
      }}
    >
      {icon}
      {/* Label: hidden on mobile, visible on sm+ */}
      <span
        className="hidden sm:inline-block uppercase text-[9px] font-bold tracking-[0.08em] leading-none whitespace-nowrap"
        aria-hidden="true"
      >
        {label}
      </span>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Public component — no props, reads from contact-info constants
// ---------------------------------------------------------------------------

export function ContactChip() {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;

  return (
    <>
      {/* Animation keyframes — injected once via style tag */}
      {animate && (
        <style>{`
          @keyframes chipFadeIn {
            from { opacity: 0; transform: translateY(-4px) scale(0.92); }
            to   { opacity: 1; transform: translateY(0)   scale(1);    }
          }
          .contact-chip-enter {
            opacity: 0;
            animation: chipFadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            animation-delay: var(--chip-delay, 0ms);
          }
        `}</style>
      )}

      <div
        role="group"
        aria-label="Direct contact options"
        className="flex items-center gap-1.5 sm:gap-2"
      >
        {/* WhatsApp — forest glass */}
        <Chip
          href={CONTACT_WHATSAPP_URL}
          ariaLabel="Chat on WhatsApp"
          label="WhatsApp"
          tintClass="bg-white/10"
          tintStyle={{ backgroundColor: "rgba(37, 211, 102, 0.22)" }}
          icon={<WhatsAppIcon />}
          animationDelay={80}
          animate={animate}
        />

        {/* Email — indigo glass */}
        <Chip
          href={CONTACT_EMAIL_HREF}
          ariaLabel="Email us"
          label="Email"
          tintClass="bg-white/10"
          tintStyle={{ backgroundColor: "rgba(79, 86, 232, 0.35)" }}
          icon={<EmailIcon />}
          animationDelay={160}
          animate={animate}
        />

        {/* Phone — frost glass */}
        <Chip
          href={`tel:${CONTACT_PHONE_TEL}`}
          ariaLabel={`Call us at ${CONTACT_PHONE_DISPLAY}`}
          label="Call"
          tintClass="bg-white/[0.12]"
          icon={<PhoneIcon />}
          animationDelay={240}
          animate={animate}
        />
      </div>
    </>
  );
}
