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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a
              href={`tel:${PHONE.mainTel}`}
              className="inline-flex items-center justify-center bg-white text-gray-900 font-semibold rounded-full px-8 py-4 text-sm hover:bg-gray-100 transition-colors duration-300 min-w-[220px]"
            >
              Call {PHONE.main}
            </a>
            <a
              href={PHONE.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-green-500 text-green-400 font-semibold rounded-full px-8 py-4 text-sm hover:bg-green-500/10 transition-colors duration-300 min-w-[220px]"
            >
              WhatsApp Us
            </a>
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
