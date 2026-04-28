"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { PHONE } from "@/lib/constants";
import { phoneClick, whatsappClick } from "@/lib/analytics/events";
import { useInAppBrowser, safeBlankTarget } from "@/hooks/useInAppBrowser";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const inAppBrowser = useInAppBrowser();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 0.35, 1], [1.12, 1.03, 1.06]);
  // Only apply blur on md+ (768px+); on mobile the blur looks broken at initial load.
  // Use state to avoid SSR/client hydration mismatch (window is not available during SSR).
  const [isMd, setIsMd] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 768;
  });
  useEffect(() => {
    const handleResize = () => {
      setIsMd(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const imageFilter = useTransform(
    scrollYProgress,
    [0, 0.35],
    isMd ? ["blur(4px)", "blur(0px)"] : ["blur(0px)", "blur(0px)"],
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-center justify-center overflow-hidden pt-14 pb-20 md:pt-16 md:pb-0"
    >
      {/* Background image with mobile-first blur that resolves on scroll */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={
          prefersReducedMotion
            ? undefined
            : {
                scale: imageScale,
                filter: imageFilter,
              }
        }
      >
        <Image
          src="/images/office-hero-v3.jpg"
          alt="Advantage Services office in Cambria Heights"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUH/8QAIhAAAQMEAgMBAAAAAAAAAAAAAQIDBAAFESEGEhMxQf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmkrVZqtpqK2WW6SxW+dBVnLDjSFApJGCP3xrXKSLgW2M6hqxvJVvKlJlBKSofAPGB+a2rTs9PuGC3LiOhbLgylQ9j7GiJSlYSvdUFJBBIB5FFFAf/2Q=="
        />
      </motion.div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

      {/* Content — true vertical centering between header and bottom nav */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          className="inline-flex items-center rounded-full border border-white/18 bg-black/28 px-4 py-2 sm:px-5 sm:py-2.5 text-base sm:text-lg tracking-[0.24em] text-white/88 mb-4 sm:mb-6 font-semibold shadow-lg shadow-black/20 backdrop-blur-sm"
        >
          ADVANTAGE SERVICES
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
          className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
        >
          NYC Business Experts.
          <br />
          Tax, ITIN, Licensing,
          <br />
          <span className="text-white/85">Formation & More.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: EASE }}
          className="text-base sm:text-xl text-white/78 font-light mt-3 sm:mt-4 max-w-lg mx-auto"
        >
          Cambria Heights, Queens · IRS Certified Acceptance Agent · Serving immigrant entrepreneurs &amp; contractors since 2004.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.6, ease: EASE }}
          className="flex flex-col items-center gap-4 mt-6 sm:mt-10"
        >
          {/* Primary CTA — /book */}
          <a
            href="/book"
            className="inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-base font-bold text-[#4F56E8] shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:bg-white/92 transition-all duration-200 active:scale-[0.97] min-h-[52px]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Book a Free Consultation
          </a>

          {/* Trust bar */}
          <div className="flex items-center gap-1.5 text-white/75 text-sm">
            <span className="text-[#F9A825]">★★★★★</span>
            <span className="font-semibold text-white">4.9</span>
            <span>· 27 Google reviews · 20+ years · Cambria Heights, NY</span>
          </div>

          {/* Secondary actions */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <a
              href={PHONE.whatsappLink}
              target={safeBlankTarget(inAppBrowser)}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500/30 transition-colors duration-200 active:scale-[0.97] min-h-[44px]"
              onClick={() => whatsappClick()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 2C6.478 2 2 6.478 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.522 0 10-4.478 10-10S17.522 2 12 2zm0 18a7.96 7.96 0 01-4.11-1.14l-.29-.174-3.01.79.81-2.95-.19-.3A7.96 7.96 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
              </svg>
              WhatsApp
            </a>
            <a
              href={`tel:${PHONE.mainTel}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors duration-200 active:scale-[0.97] min-h-[44px]"
              onClick={() => phoneClick()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
              Call
            </a>
            {/* ITIN application badge */}
            <a
              href="/itin"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.97] min-h-[44px]"
              style={{
                background: "linear-gradient(135deg, rgba(5,150,105,0.75) 0%, rgba(13,148,136,0.75) 100%)",
                border: "1px solid rgba(52,211,153,0.30)",
                backdropFilter: "blur(8px)",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-200">
                <path d="M12 2L4 6v5c0 5.25 3.5 10.15 8 11.5C16.5 21.15 20 16.25 20 11V6l-8-4z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              ITIN Apply
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          className="w-px h-8 bg-white/40"
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </section>
  );
}
