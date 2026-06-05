import type { CSSProperties, ReactNode } from "react";

/**
 * Shared kiosk design system — billboard / airport-board aesthetic.
 * Deep navy gradient backgrounds, gold accents, big glanceable type, inline SVG only.
 * Every /tv slide draws from this so the whole loop reads as ONE premium system.
 */

export const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

// Brand palette (matches the web-presence hero family)
export const NAVY = {
  base: "#0F172A",
  deep: "#0A0F1A",
  slate: "#1E293B",
  blue: "#1A3A5C",
};
export const GOLD = "#F9A825";
export const GOLD_SOFT = "rgba(249,168,37,0.4)";
export const INDIGO = "#4F56E8";

// Primary backdrop gradient — used by nearly every slide.
export const BG_GRADIENT =
  "linear-gradient(135deg, #1A3A5C 0%, #0F172A 58%, #1E293B 100%)";

// Subtle atmosphere: a cool indigo glow top-right, a warm gold glow bottom-left.
export const ATMOSPHERE =
  "radial-gradient(900px circle at 82% 6%, rgba(79,86,232,0.28), transparent 56%), radial-gradient(720px circle at 8% 96%, rgba(249,168,37,0.16), transparent 56%)";

/** Faint dot-grid texture for depth — pure CSS, no assets. */
export const DOT_TEXTURE: CSSProperties = {
  backgroundImage:
    "radial-gradient(rgba(255,255,255,0.05) 1.5px, transparent 1.5px)",
  backgroundSize: "44px 44px",
};

/**
 * SlideShell — the full-bleed kiosk frame every slide sits in.
 * Layers: gradient base → atmosphere glow → dot texture → content.
 */
export function SlideShell({
  children,
  align = "center",
  justify = "center",
  padding = "0 96px",
  background = BG_GRADIENT,
  style,
}: {
  children: ReactNode;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  padding?: string;
  background?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        background,
        fontFamily: FONT,
        ...style,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: ATMOSPHERE }} />
      <div style={{ position: "absolute", inset: 0, ...DOT_TEXTURE }} />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: align,
          justifyContent: justify,
          padding,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Gold uppercase eyebrow label — readable from across the room. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontSize: 24,
        textTransform: "uppercase",
        letterSpacing: 6,
        color: GOLD,
        fontWeight: 700,
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

/** Gold underline rule. */
export function Rule({ width = 96 }: { width?: number }) {
  return (
    <div
      style={{
        width,
        height: 4,
        backgroundColor: GOLD,
        borderRadius: 9999,
      }}
    />
  );
}

/**
 * IconTile — a gold-on-navy rounded square holding an inline SVG glyph.
 * Replaces the old emoji icons.
 */
export function IconTile({
  children,
  size = 88,
}: {
  children: ReactNode;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 20,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(155deg, rgba(249,168,37,0.20), rgba(249,168,37,0.06))",
        border: "1px solid rgba(249,168,37,0.45)",
        boxShadow: "0 12px 30px rgba(0,0,0,0.30)",
      }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Inline SVG icon set — gold stroke, consistent 1.8 weight, 48px default.
 * No emoji, no external URLs.
 * ------------------------------------------------------------------------- */

type IconProps = { size?: number; color?: string };
const base = (size: number, color: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: color,
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function BuildingIcon({ size = 48, color = GOLD }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M3 21h18" />
      <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
      <path d="M15 21v-7h4v7" />
      <path d="M8 7h2M8 11h2M8 15h2" />
    </svg>
  );
}

export function LicenseIcon({ size = 48, color = GOLD }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="11" r="2" />
      <path d="M6 16c.5-1.3 3.5-1.3 4 0" />
      <path d="M14 9h4M14 12h4M14 15h2" />
    </svg>
  );
}

export function TaxIcon({ size = 48, color = GOLD }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8" />
      <path d="M9 11.5l6 6M15 11.5l-6 6" />
      <path d="M8 20h8" />
    </svg>
  );
}

export function ShieldIcon({ size = 48, color = GOLD }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function ScaleIcon({ size = 48, color = GOLD }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M12 3v18" />
      <path d="M7 21h10" />
      <path d="M5 7h14" />
      <path d="M5 7l-2.5 6a3 3 0 0 0 5 0L5 7z" />
      <path d="M19 7l-2.5 6a3 3 0 0 0 5 0L19 7z" />
    </svg>
  );
}

export function ChartIcon({ size = 48, color = GOLD }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M4 4v16h16" />
      <path d="M7 15l3-4 3 3 4-6" />
      <path d="M17 8h0.01" />
    </svg>
  );
}

export function GlobeIcon({ size = 48, color = GOLD }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </svg>
  );
}

export function BotIcon({ size = 48, color = GOLD }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <rect x="4" y="8" width="16" height="11" rx="3" />
      <path d="M12 8V4" />
      <circle cx="12" cy="3" r="1.4" />
      <circle cx="9" cy="13" r="1.1" fill={color} stroke="none" />
      <circle cx="15" cy="13" r="1.1" fill={color} stroke="none" />
      <path d="M9 16.5h6" />
      <path d="M4 12H2.5M20 12h1.5" />
    </svg>
  );
}

/* --- Brand logos (recognizable, single-color gold marks) --- */

export function GoogleMark({ size = 44 }: { size?: number }) {
  // Simplified single-color "G" so it reads from distance on dark navy.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M21 12.2c0-.7-.06-1.2-.18-1.74H12v3.3h5.1a4.4 4.4 0 0 1-1.9 2.86v2.37h3.06C19.96 17.4 21 15.06 21 12.2z"
        fill="#F9A825"
      />
      <path
        d="M12 21c2.57 0 4.73-.85 6.3-2.3l-3.06-2.37c-.85.57-1.94.9-3.24.9-2.49 0-4.6-1.68-5.35-3.94H3.46v2.45A9 9 0 0 0 12 21z"
        fill="#fff"
      />
      <path
        d="M6.65 13.29A5.4 5.4 0 0 1 6.65 10.7V8.25H3.46a9 9 0 0 0 0 7.5l3.19-2.46z"
        fill="rgba(255,255,255,0.55)"
      />
      <path
        d="M12 6.58c1.4 0 2.66.48 3.65 1.43l2.72-2.72A9 9 0 0 0 3.46 8.25l3.19 2.46C7.4 8.26 9.5 6.58 12 6.58z"
        fill="#F9A825"
      />
    </svg>
  );
}

export function MapPinMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2c-3.9 0-7 3.1-7 7 0 5 7 13 7 13s7-8 7-13c0-3.9-3.1-7-7-7z"
        fill="#1A3A5C"
        stroke="#F9A825"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="9" r="2.6" fill="#F9A825" />
    </svg>
  );
}

export function StripeMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="3" fill="#1A3A5C" stroke="#F9A825" strokeWidth="1.4" />
      <path
        d="M9.4 14.2c0 1 .9 1.6 2.3 1.6 1.5 0 2.5-.7 2.5-2 0-1.2-.9-1.6-2.2-2-.9-.3-1.2-.5-1.2-.9 0-.3.3-.6.9-.6.7 0 1.2.3 1.3.9l1.8-.3c-.2-1.1-1.1-1.8-2.6-1.8-1.4 0-2.5.7-2.5 1.9 0 1.2.9 1.6 2.1 2 .9.3 1.3.5 1.3.9 0 .4-.4.6-1 .6-.8 0-1.2-.4-1.3-1l-1.7.2z"
        fill="#F9A825"
      />
    </svg>
  );
}

export function WhatsAppMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#1A3A5C" stroke="#F9A825" strokeWidth="1.4" />
      <path
        d="M12 6.5a5.5 5.5 0 0 0-4.7 8.3L6.5 18l3.3-.85A5.5 5.5 0 1 0 12 6.5z"
        fill="none"
        stroke="#F9A825"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M9.7 9.6c.15-.4.3-.4.45-.4h.4c.13 0 .3 0 .43.34.16.4.55 1.36.6 1.46.05.1.08.22.02.34-.06.13-.1.2-.2.32-.1.12-.2.26-.3.35-.1.1-.2.2-.08.4.12.2.55.9 1.18 1.46.8.7 1.48.92 1.7 1.02.2.1.32.08.44-.05.12-.13.5-.6.64-.8.13-.2.27-.17.45-.1.18.06 1.13.53 1.32.63.2.1.32.14.37.22.05.08.05.48-.12.94-.16.46-.95.9-1.32.92-.37.03-.72.16-2.42-.5-2.05-.8-3.32-2.9-3.42-3.04-.1-.13-.82-1.1-.82-2.1 0-1 .53-1.5.72-1.7z"
        fill="#F9A825"
      />
    </svg>
  );
}
