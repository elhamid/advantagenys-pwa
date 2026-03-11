"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface BottomNavProps {
  onOpenMore: () => void;
}

const NAV_ITEMS = [
  {
    label: "Home",
    href: "/",
    exact: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    label: "Services",
    href: "/services",
    exact: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    label: "Forms",
    href: "/resources",
    exact: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: "Contact",
    href: "/contact",
    exact: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
  },
] as const;

const MORE_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
  </svg>
);

export function BottomNav({ onOpenMore }: BottomNavProps) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean): boolean {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(226,232,240,0.8)",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center justify-around px-1 pt-2 pb-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.label} href={item.href} className="flex-1">
              <motion.div
                className="relative flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl"
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <span
                  style={{
                    color: active ? "var(--blue-accent)" : "#94a3b8",
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[10px] font-semibold tracking-tight leading-none"
                  style={{
                    color: active ? "var(--blue-accent)" : "#94a3b8",
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-2 w-5 h-0.5 rounded-full"
                    style={{ background: "var(--blue-accent)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}

        {/* More button */}
        <motion.button
          className="flex-1 flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl"
          style={{ color: "#94a3b8" }}
          onClick={onOpenMore}
          aria-label="Open menu"
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
          <span style={{ color: "#94a3b8" }}>{MORE_ICON}</span>
          <span className="text-[10px] font-semibold tracking-tight leading-none" style={{ color: "#94a3b8" }}>
            More
          </span>
        </motion.button>
      </div>
    </nav>
  );
}
