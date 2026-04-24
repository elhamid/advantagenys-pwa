"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { TEAM } from "@/lib/constants";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

const TEAM_PHOTOS: Record<string, string> = {
  Jay: "/images/team/jay-v2.jpg",
  Kedar: "/images/team/kedar.jpg",
  Zia: "/images/team/zia.jpg",
  Akram: "/images/team/akram.jpg",
  Riaz: "/images/team/riaz-v7.jpg",
  Hamid: "/images/team/hamid-v11.png",
};

const PHOTO_POSITIONS: Record<string, string> = {
  Jay: "object-[50%_10%]",
  Kedar: "object-[50%_10%]",
  Zia: "object-[50%_10%]",
  Akram: "object-[50%_10%]",
  Riaz: "object-[50%_10%]",
  Hamid: "object-[50%_10%]",
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
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? false : { opacity: 0, y: 32 };
  const animate = reduceMotion ? {} : isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 };
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ type: "spring", stiffness: 260, damping: 25, delay }}
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
          src="/images/team/advantage_team.jpg"
          alt="The Advantage Services team — Jay, Kedar, Zia, Akram, Riaz, and Hamid"
          fill
          quality={95}
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 1400px"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABgX/xAAiEAABBAIBBQEAAAAAAAAAAAABAAIDBAUREiExQWH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AqVe1bXW1bDPHG90UTnNa8tBIBIHBPyqREBk5LKbklvUopJGN5tDWuIHHsPCIiAf/2Q=="
        />
      </motion.div>
    </div>
  );
}

export function TeamSection() {
  return (
    <section className="bg-white py-14 md:py-20">
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

        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-12">
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
