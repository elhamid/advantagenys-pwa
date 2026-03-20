"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChatPanel } from "./ChatPanel";

const NUDGE_MAP: Record<string, string> = {
  "/": "How can we help your business?",
  "/services/tax-services": "Questions about tax services?",
  "/services/tax-services/itin-tax-id": "Need help with ITIN?",
  "/services/business-formation": "Starting a business?",
  "/services/licensing": "Need a license?",
  "/services/insurance": "Looking for insurance?",
  "/services/audit-defense": "Facing an audit?",
  "/services/financial-services": "Need bookkeeping help?",
  "/services/legal": "Immigration questions?",
  "/industries/restaurants": "Opening a restaurant?",
  "/industries/contractors": "Contractor licensing help?",
  "/industries/immigrant-entrepreneurs": "New to business in the US?",
  "/tools/tax-savings-estimator": "Want to know your potential savings?",
  "/tools/business-readiness-checker": "Need help getting started?",
  "/tools/itin-eligibility-checker": "Checking ITIN eligibility?",
};

const NUDGE_SESSION_KEY = "ava-nudge-shown";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);
  const pathname = usePathname();
  const isContactPage = pathname === "/contact";

  useEffect(() => {
    setNudge(null);
    if (isContactPage) return;

    const message = NUDGE_MAP[pathname] ?? "Need help?";
    if (
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(NUDGE_SESSION_KEY)
    )
      return;

    const timer = setTimeout(() => {
      if (!open) {
        setNudge(message);
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(NUDGE_SESSION_KEY, "1");
        }
        // Auto-dismiss after 5s
        setTimeout(() => setNudge(null), 5000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname, open, isContactPage]);

  // Hide entirely on contact page
  if (isContactPage) return null;

  return (
    <div
      className="fixed z-40"
      style={{
        right: "calc(1.5rem + env(safe-area-inset-right))",
        bottom: "calc(1.5rem + env(safe-area-inset-bottom))",
      }}
    >
      {open && (
        <ChatPanel pageContext={pathname} onClose={() => setOpen(false)} />
      )}

      {/* Page-aware nudge pill */}
      {!open && nudge && (
        <div
          className="mb-3 flex items-center justify-end"
          role="status"
          aria-live="polite"
        >
          <span className="rounded-full bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-lg">
            {nudge}
          </span>
        </div>
      )}

      <button
        onClick={() => {
          setOpen(!open);
          setNudge(null);
        }}
        className="w-14 h-14 rounded-full shadow-[var(--shadow-lg)] flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
        style={{ background: "var(--blue-accent)" }}
        aria-label={open ? "Close chat" : "Chat with Ava"}
      >
        {open ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
