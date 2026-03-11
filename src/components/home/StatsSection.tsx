"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { STATS } from "@/lib/constants";
import { GOOGLE_RATING } from "@/lib/reviews";

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

function useCountUp(target: number, suffix = "", decimals = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 1800;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(parseFloat((eased * target).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, decimals]);

  return { ref, display: `${value}${suffix}` };
}

export function StatsSection() {
  const setups = useCountUp(STATS.businessSetups.count, "+");
  const taxClients = useCountUp(STATS.taxClients.count, "+");
  const licenses = useCountUp(STATS.businessLicenses.count, "+");
  const rating = useCountUp(GOOGLE_RATING.rating, "", 1);

  const stats = [
    { ref: setups.ref, display: setups.display, label: "Businesses Formed" },
    {
      ref: taxClients.ref,
      display: taxClients.display,
      label: "Tax Clients Served",
    },
    {
      ref: licenses.ref,
      display: licenses.display,
      label: "Licenses Obtained",
    },
    {
      ref: rating.ref,
      display: rating.display,
      label: `Google (${GOOGLE_RATING.totalReviews} reviews)`,
      suffix: "\u2605",
      link: GOOGLE_RATING.mapsUrl,
    },
  ];

  return (
    <section className="bg-white py-10 md:py-16">
      <ScrollReveal>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-0">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`rounded-3xl border border-slate-200 bg-slate-50 px-4 py-5 text-center md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0 ${
                  i < 3 ? "md:border-r md:border-gray-200" : ""
                }`}
              >
                <span
                  ref={stat.ref}
                  className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl"
                >
                  {stat.display}
                  {stat.suffix && (
                    <span className="text-yellow-500 ml-1">
                      {stat.suffix}
                    </span>
                  )}
                </span>
                <span className="mt-2 block text-xs font-medium uppercase tracking-[0.14em] text-gray-500 md:text-sm md:normal-case md:tracking-normal">
                  {stat.link ? (
                    <a
                      href={stat.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >
                      {stat.label}
                    </a>
                  ) : (
                    stat.label
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
