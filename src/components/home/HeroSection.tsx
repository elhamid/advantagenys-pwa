"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { PHONE } from "@/lib/constants";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with slow zoom */}
      <div className="absolute inset-0 animate-[heroZoom_15s_ease-out_forwards]">
        <Image
          src="/images/office-hero-v3.jpg"
          alt="Advantage Business Consulting office in Cambria Heights"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          className="text-sm tracking-[0.3em] text-white/60 mb-6 font-light"
        >
          ADVANTAGE SERVICES &middot; CAMBRIA HEIGHTS, NY
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
        >
          We handle the business
          <br />
          of your business.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: EASE }}
          className="text-xl sm:text-2xl text-white/80 font-light mt-4"
        >
          So you can handle everything else.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.6, ease: EASE }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <a
            href={`tel:${PHONE.mainTel}`}
            className="inline-flex items-center justify-center bg-white text-gray-900 font-semibold rounded-full px-8 py-4 text-sm hover:bg-gray-100 transition-colors duration-300 min-w-[220px]"
          >
            Talk to Someone Real
          </a>
          <a
            href="#personas"
            className="inline-flex items-center justify-center border border-white text-white font-semibold rounded-full px-8 py-4 text-sm hover:bg-white/10 transition-colors duration-300 min-w-[220px]"
          >
            See How We Help
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
