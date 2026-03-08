"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";

const fadeSlideUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.5,
    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    delay,
  },
});

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export function Hero() {
  return (
    <section
      className="relative overflow-hidden min-h-[70vh] lg:min-h-[85vh]"
      style={{
        background: "linear-gradient(135deg, #4F56E8 0%, #1E293B 100%)",
      }}
    >
      {/* Subtle light overlays for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)",
        }}
      />

      <Container className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 py-20 sm:py-24 lg:py-0 min-h-[70vh] lg:min-h-[85vh]">
        {/* Left side -- Text content (60%) */}
        <div className="flex-[3] flex flex-col justify-center max-w-2xl lg:max-w-none">
          <motion.div {...fadeSlideUp(0)}>
            <Badge className="!bg-white/10 !text-white/90 backdrop-blur-sm border border-white/20 mb-8">
              IRS Certified Acceptance Agent | 20+ Years
            </Badge>
          </motion.div>

          <motion.h1
            {...fadeSlideUp(0.15)}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight"
          >
            Your Business.
            <br />
            Our Expertise.
            <br />
            <span className="text-white/90">Real Relationships.</span>
          </motion.h1>

          <motion.p
            {...fadeSlideUp(0.3)}
            className="mt-6 text-base sm:text-lg lg:text-xl text-white/70 max-w-xl leading-relaxed"
          >
            The boutique alternative to LegalZoom. 20+ years helping NYC
            businesses succeed.
          </motion.p>

          <motion.div
            {...fadeSlideUp(0.45)}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              href="/contact"
              className="!bg-white !text-[#4F56E8] hover:!bg-white/90 font-bold shadow-lg shadow-black/10"
            >
              Talk to a Specialist
            </Button>
            <Button
              size="lg"
              href="/services"
              className="!bg-transparent !border-2 !border-white !text-white hover:!bg-white/10"
            >
              Browse Services
            </Button>
          </motion.div>

          <motion.div
            {...fadeSlideUp(0.6)}
            className="mt-10 flex items-center gap-3"
          >
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className="w-5 h-5 text-[var(--gold-bright)]"
                />
              ))}
            </div>
            <span className="text-sm text-white/70 font-medium">
              <span className="text-white font-semibold">4.8/5</span> from 150+
              clients
            </span>
          </motion.div>
        </div>

        {/* Right side -- Image placeholder (40%) */}
        <motion.div
          className="flex-[2] w-full max-w-md lg:max-w-none hidden sm:flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.7,
            ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
            delay: 0.3,
          }}
        >
          <div
            className="relative w-full aspect-[4/3] rounded-2xl border border-white/20 overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
              boxShadow:
                "0 0 60px rgba(79, 86, 232, 0.15), 0 0 120px rgba(79, 86, 232, 0.05)",
            }}
          >
            {/* Placeholder content -- replace with team photo */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-white/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <p className="text-white/50 text-sm font-medium">Team Photo</p>
              <p className="text-white/30 text-xs mt-1">Cambria Heights, NY</p>
            </div>

            {/* Decorative corner accents */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/15 rounded-tl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/15 rounded-br-lg" />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
