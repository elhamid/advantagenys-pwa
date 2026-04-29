"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeroSlide from "./slides/HeroSlide";
import StatsSlide from "./slides/StatsSlide";
import ServicesSlideA from "./slides/ServicesSlideA";
import JaySpotlightSlide from "./slides/JaySpotlightSlide";
import ReviewSlide from "./slides/ReviewSlide";
import ServicesSlideB from "./slides/ServicesSlideB";
import ZiaSpotlightSlide from "./slides/ZiaSpotlightSlide";
import ITINSlide from "./slides/ITINSlide";
import TeamSlide from "./slides/TeamSlide";
import HamidSpotlightSlide from "./slides/HamidSpotlightSlide";
import ContactSlide from "./slides/ContactSlide";

const SLIDES = [
  HeroSlide,
  StatsSlide,
  ServicesSlideA,
  JaySpotlightSlide,
  ReviewSlide,
  ServicesSlideB,
  ZiaSpotlightSlide,
  ITINSlide,
  TeamSlide,
  HamidSpotlightSlide,
  ContactSlide,
];

const SLIDE_DURATION = 12_000;
const TRANSITION_DURATION = 1;

export default function TVSlider() {
  const [current, setCurrent] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const advance = useCallback(() => {
    setCurrent((prev) => {
      const next = (prev + 1) % SLIDES.length;
      if (next === 0) setCycleCount((c) => c + 1);
      return next;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(advance, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [advance]);

  useEffect(() => {
    async function requestWakeLock() {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch {
        // Wake Lock not supported or denied
      }
    }
    requestWakeLock();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") requestWakeLock();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      wakeLockRef.current?.release();
    };
  }, []);

  useEffect(() => {
    let lastAdvance = Date.now();
    const checker = setInterval(() => {
      if (Date.now() - lastAdvance > SLIDE_DURATION * 3) {
        window.location.reload();
      }
      lastAdvance = Date.now();
    }, SLIDE_DURATION);
    return () => clearInterval(checker);
  }, [current]);

  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("touchmove", prevent, { passive: false });
    document.addEventListener("wheel", prevent, { passive: false });
    return () => {
      document.removeEventListener("touchmove", prevent);
      document.removeEventListener("wheel", prevent);
    };
  }, []);

  const SlideComponent = SLIDES[current];

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        pointerEvents: 'none',
        touchAction: 'none',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: TRANSITION_DURATION, ease: "easeInOut" }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          <SlideComponent cycleCount={cycleCount} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
