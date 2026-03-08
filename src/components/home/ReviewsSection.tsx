"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { GOOGLE_RATING, REVIEWS } from "@/lib/reviews";

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
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ReviewsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-14">
            Don&apos;t take our word for it.
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {[REVIEWS[0], REVIEWS[1], REVIEWS[3]].map((review, i) => (
            <ScrollReveal key={review.name} delay={i * 0.12}>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full flex flex-col">
                <span
                  className="text-5xl font-serif leading-none mb-4 block"
                  style={{ color: "rgba(59, 130, 246, 0.15)" }}
                >
                  &ldquo;
                </span>
                <p className="text-gray-700 leading-relaxed flex-1 text-[15px]">
                  {review.text}
                </p>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="font-semibold text-gray-900 text-sm">
                    {review.name}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {review.date}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <p className="text-center mt-10 text-gray-500 text-sm">
            <a
              href={GOOGLE_RATING.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              {GOOGLE_RATING.rating} out of 5 &middot;{" "}
              {GOOGLE_RATING.totalReviews} reviews on Google
            </a>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
