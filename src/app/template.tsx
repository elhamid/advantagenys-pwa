"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

// Routes that target restricted browsers (Samsung TV, kiosks). These cannot
// render Tailwind v4 modern CSS or rely on framer-motion hydration to clear
// opacity-0 wrappers. Skip the page-transition wrapper for them.
const CHROMELESS_PREFIXES = ["/resources/kiosk", "/itin", "/tv"];

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChromeless = CHROMELESS_PREFIXES.some((p) => pathname.startsWith(p));

  if (isChromeless) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}
