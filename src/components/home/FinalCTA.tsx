"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { PHONE, ADDRESS, HOURS } from "@/lib/constants";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ type: "spring", stiffness: 260, damping: 25, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-36">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/office-hero-v3.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUH/8QAIhAAAQMEAgMBAAAAAAAAAAAAAQIDBAAFESEGEhMxQf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmkrVZqtpqK2WW6SxW+dBVnLDjSFApJGCP3xrXKSLgW2M6hqxvJVvKlJlBKSofAPGB+a2rTs9PuGC3LiOhbLgylQ9j7GiJSlYSvdUFJBBIB5FFFAf/2Q=="
        />
      </div>
      <div className="absolute inset-0 bg-black/75" />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <ScrollReveal>
          <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
            One conversation could
            <br />
            change everything.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="text-white/70 text-lg mt-5">
            Free consultation. No obligation. We pick up the phone.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="flex flex-col items-center gap-3 mt-10">
            <span className="text-white/70 text-sm font-medium tracking-wide">{PHONE.main}</span>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${PHONE.mainTel}`}
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold rounded-full px-8 py-4 text-sm hover:bg-gray-100 transition-colors duration-300"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
                Call
              </a>
              <a
                href={PHONE.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-green-500 text-green-400 font-semibold rounded-full px-8 py-4 text-sm hover:bg-green-500/10 transition-colors duration-300"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.478 2 2 6.478 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.522 0 10-4.478 10-10S17.522 2 12 2zm0 18a7.96 7.96 0 01-4.11-1.14l-.29-.174-3.01.79.81-2.95-.19-.3A7.96 7.96 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.35}>
          <div className="mt-10 text-white/50 text-sm space-y-1">
            <p>
              {HOURS.days} &middot; {HOURS.time} {HOURS.timezone}
            </p>
            <p>{ADDRESS.full}</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
