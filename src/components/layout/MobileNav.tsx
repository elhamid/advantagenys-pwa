"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";

interface NavItem {
  label: string;
  href: string;
}

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
}

/* ── animation configs ── */
const backdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const panel: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", damping: 30, stiffness: 300, mass: 0.8 },
  },
  exit: {
    x: "100%",
    transition: { type: "spring", damping: 35, stiffness: 400, mass: 0.6 },
  },
};

const navItem: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.15 } },
};

const staggerContainer: Variants = {
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
  exit: {
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

const footerReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.4, duration: 0.5 },
  },
  exit: {
    opacity: 0,
    y: 16,
    transition: { duration: 0.2 },
  },
};

export function MobileNav({ open, onClose, items }: MobileNavProps) {
  const pathname = usePathname();

  /* lock body scroll when open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* ── Backdrop with blur ── */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* ── Glass panel ── */}
          <motion.div
            className="fixed inset-y-0 right-0 h-dvh w-[85vw] max-w-[360px] flex flex-col overflow-hidden"
            style={{
              background:
                "linear-gradient(165deg, #FFFFFF 0%, #F8FAFC 50%, #FFFFFF 100%)",
              boxShadow:
                "-8px 0 60px rgba(0,0,0,0.15), -2px 0 20px rgba(0,0,0,0.08)",
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* ── Close button ── */}
            <div className="flex justify-end px-5 pt-5">
              <motion.button
                onClick={onClose}
                aria-label="Close menu"
                className="group relative p-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 active:scale-90 transition-all duration-200"
                whileTap={{ scale: 0.85 }}
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="text-slate-500 group-hover:text-slate-700 transition-colors"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* ── Brand mark ── */}
            <div className="px-6 pt-2 pb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <span
                  className="text-xl font-bold tracking-tight"
                  style={{ color: "var(--blue-accent)" }}
                >
                  Advantage
                </span>
                <span
                  className="text-xl font-bold tracking-tight"
                  style={{ color: "var(--navy)" }}
                >
                  {" "}Services
                </span>
              </motion.div>
              <motion.div
                className="mt-2 h-[2px] rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, var(--blue-accent) 0%, var(--blue-soft) 60%, transparent 100%)",
                }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            {/* ── Navigation links ── */}
            <motion.nav
              className="flex-1 px-4 overflow-y-auto"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <motion.div key={item.label} variants={navItem}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`
                        group relative flex items-center gap-3 px-4 py-3.5 my-0.5 rounded-2xl
                        transition-all duration-200
                        ${
                          isActive
                            ? "bg-[var(--blue-accent)]/[0.08] text-[var(--blue-accent)]"
                            : "text-[var(--text)] hover:bg-slate-50 active:bg-slate-100"
                        }
                      `}
                    >
                      {/* Active indicator pill */}
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-7 rounded-full bg-[var(--blue-accent)]"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}

                      <span className="text-[17px] font-semibold tracking-[-0.01em]">
                        {item.label}
                      </span>

                      {/* Hover chevron */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className={`
                          ml-auto opacity-0 -translate-x-2
                          group-hover:opacity-50 group-hover:translate-x-0
                          transition-all duration-200
                          ${isActive ? "opacity-40 translate-x-0" : ""}
                        `}
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            {/* ── Footer CTA area ── */}
            <motion.div
              className="px-5 pb-8 pt-4 space-y-3"
              style={{
                borderTop: "1px solid rgba(226, 232, 240, 0.6)",
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(248,250,252,0.5) 100%)",
              }}
              variants={footerReveal}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Phone + WhatsApp row */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${PHONE.mainTel}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                    bg-slate-50 hover:bg-slate-100 active:scale-[0.97]
                    transition-all duration-200 text-sm font-medium text-slate-700"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  Call
                </a>
                <a
                  href={PHONE.whatsappLink}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                    bg-emerald-50 hover:bg-emerald-100 active:scale-[0.97]
                    transition-all duration-200 text-sm font-medium text-emerald-700"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.12 1.52 5.856L0 24l6.335-1.652A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.98 0-3.81-.588-5.348-1.588l-.384-.228-3.76.98.998-3.648-.25-.398A9.77 9.77 0 012.18 12C2.18 6.58 6.58 2.18 12 2.18S21.82 6.58 21.82 12 17.42 21.82 12 21.82z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
              <p className="text-center text-xs text-slate-500 mt-1">{PHONE.main}</p>

              {/* Get Started button */}
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  href="/contact"
                  className="w-full text-center py-3.5 text-[15px] font-semibold rounded-xl"
                  onClick={onClose}
                >
                  Get Started
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    ,
    document.body
  );
}
