"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { PHONE } from "@/lib/constants";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 0.35, 1], [1.12, 1.03, 1.06]);
  // Only apply blur on md+ (768px+); on mobile the blur looks broken at initial load.
  // Use state to avoid SSR/client hydration mismatch (window is not available during SSR).
  const [isMd, setIsMd] = useState(false);
  useEffect(() => {
    setIsMd(window.innerWidth >= 768);
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
          alt="Advantage Business Consulting office in Cambria Heights"
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
          We handle the business
          <br />
          of your business.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: EASE }}
          className="text-base sm:text-2xl text-white/80 font-light mt-3 sm:mt-4"
        >
          So you can handle everything else.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.6, ease: EASE }}
          className="flex flex-row items-center justify-center gap-4 mt-6 sm:mt-10"
        >
          {/* WhatsApp Us — primary green button with "Fastest" badge */}
          <div className="relative">
            <span className="absolute -top-2.5 -left-1 z-10 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-900 leading-none shadow-sm">
              Fastest
            </span>
            <a
              href={PHONE.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 sm:px-8 sm:py-4 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors duration-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.12 1.52 5.856L0 24l6.335-1.652A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.98 0-3.81-.588-5.348-1.588l-.384-.228-3.76.98.998-3.648-.25-.398A9.77 9.77 0 012.18 12C2.18 6.58 6.58 2.18 12 2.18S21.82 6.58 21.82 12 17.42 21.82 12 21.82z" />
              </svg>
              WhatsApp Us
            </a>
          </div>

          {/* Call Us — white outlined secondary button */}
          <a
            href={`tel:${PHONE.mainTel}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 text-sm hover:bg-white/10 transition-colors duration-300"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 12 19.79 19.79 0 0 1 1.07 3.4 2 2 0 0 1 3 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16z" />
            </svg>
            Call Us
          </a>
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
