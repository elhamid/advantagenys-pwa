"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { ChatWidget } from "@/components/chat/ChatWidget";

const CHROMELESS_PREFIXES = ["/resources/kiosk", "/itin"];

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
      <main className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      {!hideChrome && <Footer />}
      {!hideChrome && (
        <>
          {/* ChatWidget: fixed z-40 — globals.css pushes it above BottomNav on mobile */}
          <ChatWidget />
          {/* BottomNav: fixed bottom-0, mobile only */}
          <BottomNav onOpenMore={() => setMobileNavOpen(true)} />
        </>
      )}
    </>
  );
}
