"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { ChatWidget } from "@/components/chat/ChatWidget";

const CHROMELESS_PREFIXES = ["/resources/kiosk", "/itin", "/tv"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = CHROMELESS_PREFIXES.some((p) => pathname.startsWith(p));

  // MobileNav open state lifted here so BottomNav "More" can trigger it
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      {!hideChrome && (
        <Header
          mobileNavOpen={mobileNavOpen}
          onMobileNavOpen={() => setMobileNavOpen(true)}
          onMobileNavClose={() => setMobileNavOpen(false)}
        />
      )}
      {/*
        On mobile: pad bottom to prevent content from sitting behind the fixed
        bottom nav bar (~4rem tall + device safe area inset).
        On desktop (md+): no extra padding needed.
      */}
      <main id="main" className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      {!hideChrome && <Footer />}
      {!hideChrome && (
        <>
          {/* ChatWidget: fixed z-40 — globals.css pushes it above BottomNav on mobile */}
          <ChatWidget />
          {/* BottomNav: fixed bottom-0, mobile only */}
          <BottomNav onOpenMore={() => setMobileNavOpen(true)} />
          {/* ITIN floating side badge — fixed right edge, desktop only */}
          <Link
            href="/itin"
            className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-1.5 px-2.5 py-5 rounded-l-2xl shadow-[0_4px_24px_rgba(5,150,105,0.35)] hover:shadow-[0_6px_32px_rgba(5,150,105,0.5)] transition-all duration-300 hover:pr-4 group"
            style={{
              background: "linear-gradient(160deg, #059669 0%, #0d9488 100%)",
            }}
            aria-label="ITIN Application — Apply Now"
          >
            {/* IRS shield icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 opacity-90"
            >
              <path d="M12 2L4 6v5c0 5.25 3.5 10.15 8 11.5C16.5 21.15 20 16.25 20 11V6l-8-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span
              className="text-white font-bold text-[11px] tracking-widest leading-none"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              ITIN
            </span>
            <span
              className="text-emerald-100 font-medium text-[9px] tracking-wider leading-none opacity-90"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              APPLY NOW
            </span>
            {/* Arrow hint on hover */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 opacity-0 group-hover:opacity-80 transition-opacity duration-200 -rotate-90"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </>
      )}
    </>
  );
}
