"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";

const CHROMELESS_PREFIXES = ["/resources/kiosk"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = CHROMELESS_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      {!hideChrome && <Header />}
      <main>{children}</main>
      {!hideChrome && <Footer />}
      {!hideChrome && <ChatWidget />}
    </>
  );
}
