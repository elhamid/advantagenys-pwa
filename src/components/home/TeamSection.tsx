"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import { TEAM } from "@/lib/constants";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

const TEAM_PHOTOS: Record<string, string> = {
  Jay: "/images/team/jay-v2.jpg",
  Kedar: "/images/team/kedar.jpg",
  Zia: "/images/team/zia.jpg",
  Akram: "/images/team/akram.jpg",
  Riaz: "/images/team/riaz-v7.jpg",
  Hamid: "/images/team/hamid-v13.jpg",
};

const PHOTO_POSITIONS: Record<string, string> = {
  Jay: "object-[50%_25%]",
  Kedar: "object-[50%_25%]",
  Zia: "object-[50%_25%]",
  Akram: "object-[50%_25%]",
  Riaz: "object-[50%_25%]",
  Hamid: "object-center",
};

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
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function TeamPhotoParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <div ref={ref} className="relative rounded-2xl overflow-hidden mb-16" style={{ aspectRatio: "987 / 550" }}>
      <motion.div className="absolute inset-[-10%]" style={{ y }}>
        <Image
          src="/images/team/advantage_team.png"
          alt="The Advantage Services team — Jay, Kedar, Zia, Akram, Riaz, and Hamid"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 1200px"
        />
      </motion.div>
    </div>
  );
}

export function TeamSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-4">
            The people behind the promise.
          </h2>
          <p className="text-center text-gray-500 max-w-2xl mx-auto mb-14 text-lg">
            20+ years of combined expertise. One team that knows your full picture.
          </p>
        </ScrollReveal>

        {/* Team group photo */}
        <ScrollReveal>
          <TeamPhotoParallax />
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
          {TEAM.map((member, i) => (
            <ScrollReveal key={member.name} delay={i * 0.08}>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden mb-5 ring-2 ring-gray-100 shadow-lg">
                  <Image
                    src={TEAM_PHOTOS[member.name] || ""}
                    alt={member.fullName}
                    fill
                    className={`object-cover ${PHOTO_POSITIONS[member.name] || "object-[50%_25%]"}`}
                    sizes="320px"
                    quality={90}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {member.fullName}
                </h3>
                <p className="text-sm text-blue-600 font-medium mt-1">
                  {member.role}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                  {member.specialties.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Consultation scene */}
        <ScrollReveal delay={0.2}>
          <div className="mt-16 relative rounded-2xl overflow-hidden h-[300px] lg:h-[400px]">
            <Image
              src="/images/team/consultation-option-2.jpg"
              alt="Kedar and Zia helping a client with licensing while Jay and Akram help a couple with taxes"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-white text-lg lg:text-xl font-light">
                Every client gets our full attention. Every business gets our full team.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
