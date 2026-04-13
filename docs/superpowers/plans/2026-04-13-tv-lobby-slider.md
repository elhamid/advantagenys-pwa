# TV Lobby Slider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an auto-looping 8-slide presentation at `/tv` for the office lobby Samsung TV.

**Architecture:** Next.js App Router page at `src/app/tv/page.tsx` with a client-component slider (`TVSlider.tsx`) that renders 8 typed slide components. Each slide is its own file for isolation. Auto-advances every 12s with crossfade. Chromeless via existing `LayoutShell` pattern. Wake Lock API keeps screen alive.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Framer Motion (already in project), next/font (Plus Jakarta Sans already loaded).

**Spec:** `docs/superpowers/specs/2026-04-13-tv-lobby-slider-design.md`

---

## File Structure

```
src/app/tv/
  page.tsx              — Server component: metadata (noindex), renders TVSlider
  TVSlider.tsx           — Client component: slide orchestrator, auto-advance, transitions, Wake Lock
  slides/
    HeroSlide.tsx        — Slide 1: welcome, office photo, tagline
    StatsSlide.tsx       — Slide 2: 4 stats with count-up animation
    ServicesSlideA.tsx   — Slide 3: Formation, Licensing, Tax
    ReviewSlide.tsx      — Slide 4: rotating Google review quote
    ServicesSlideB.tsx   — Slide 5: Insurance, Audit Defense, Financial
    ITINSlide.tsx        — Slide 6: ITIN/Immigration highlight with Kedar photo
    TeamSlide.tsx        — Slide 7: 6-member team grid
    ContactSlide.tsx     — Slide 8: address, phone, hours, QR code
```

**Modified files:**
- `src/components/layout/LayoutShell.tsx` — add `/tv` to `CHROMELESS_PREFIXES`

---

### Task 1: Chromeless Route + Page Shell

**Files:**
- Modify: `src/components/layout/LayoutShell.tsx:11` (add `/tv` to CHROMELESS_PREFIXES)
- Create: `src/app/tv/page.tsx`

- [ ] **Step 1: Add `/tv` to chromeless prefixes**

In `src/components/layout/LayoutShell.tsx`, line 11, change:
```typescript
const CHROMELESS_PREFIXES = ["/resources/kiosk", "/itin"];
```
to:
```typescript
const CHROMELESS_PREFIXES = ["/resources/kiosk", "/itin", "/tv"];
```

- [ ] **Step 2: Create the page shell**

Create `src/app/tv/page.tsx`:
```tsx
import type { Metadata } from "next";
import TVSlider from "./TVSlider";

export const metadata: Metadata = {
  title: "Advantage Services",
  robots: { index: false, follow: false },
};

export default function TVPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0A0F1A]">
      <TVSlider />
    </main>
  );
}
```

- [ ] **Step 3: Create placeholder TVSlider**

Create `src/app/tv/TVSlider.tsx`:
```tsx
"use client";

export default function TVSlider() {
  return (
    <div className="h-full w-full flex items-center justify-center text-white text-4xl">
      TV Slider Loading...
    </div>
  );
}
```

- [ ] **Step 4: Verify route works**

Run: `npm run dev`
Visit: `http://localhost:3000/tv`
Expected: Full-screen dark page with "TV Slider Loading..." centered. No header, no footer, no chat widget.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/LayoutShell.tsx src/app/tv/page.tsx src/app/tv/TVSlider.tsx
git commit -m "feat(tv): chromeless page shell at /tv route"
```

---

### Task 2: TVSlider Orchestrator

**Files:**
- Modify: `src/app/tv/TVSlider.tsx`

This is the core engine: renders slides, auto-advances, handles transitions, Wake Lock.

- [ ] **Step 1: Implement TVSlider with auto-advance and crossfade**

Replace `src/app/tv/TVSlider.tsx` with:
```tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeroSlide from "./slides/HeroSlide";
import StatsSlide from "./slides/StatsSlide";
import ServicesSlideA from "./slides/ServicesSlideA";
import ReviewSlide from "./slides/ReviewSlide";
import ServicesSlideB from "./slides/ServicesSlideB";
import ITINSlide from "./slides/ITINSlide";
import TeamSlide from "./slides/TeamSlide";
import ContactSlide from "./slides/ContactSlide";

const SLIDES = [
  HeroSlide,
  StatsSlide,
  ServicesSlideA,
  ReviewSlide,
  ServicesSlideB,
  ITINSlide,
  TeamSlide,
  ContactSlide,
];

const SLIDE_DURATION = 12_000; // 12 seconds per slide
const TRANSITION_DURATION = 1; // 1 second crossfade

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

  // Auto-advance timer
  useEffect(() => {
    const timer = setInterval(advance, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [advance]);

  // Wake Lock to prevent screen sleep
  useEffect(() => {
    async function requestWakeLock() {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch {
        // Wake Lock not supported or denied — TV will use its own sleep settings
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

  // Auto-recovery: reload page if idle too long (fallback for browser hiccups)
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

  // Prevent touch/scroll interactions
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
    <div className="relative h-full w-full select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: TRANSITION_DURATION, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <SlideComponent cycleCount={cycleCount} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Create placeholder slides so imports resolve**

Create each of these 8 files with placeholder content. Each follows the same pattern:

Create `src/app/tv/slides/HeroSlide.tsx`:
```tsx
export default function HeroSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[#0A0F1A] text-white text-5xl font-bold">
      Slide 1: Hero
    </div>
  );
}
```

Create `src/app/tv/slides/StatsSlide.tsx`:
```tsx
export default function StatsSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[#0A0F1A] text-white text-5xl font-bold">
      Slide 2: Stats
    </div>
  );
}
```

Create `src/app/tv/slides/ServicesSlideA.tsx`:
```tsx
export default function ServicesSlideA({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-white text-[#1E293B] text-5xl font-bold">
      Slide 3: Services A
    </div>
  );
}
```

Create `src/app/tv/slides/ReviewSlide.tsx`:
```tsx
export default function ReviewSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[#0A0F1A] text-white text-5xl font-bold">
      Slide 4: Review
    </div>
  );
}
```

Create `src/app/tv/slides/ServicesSlideB.tsx`:
```tsx
export default function ServicesSlideB({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-white text-[#1E293B] text-5xl font-bold">
      Slide 5: Services B
    </div>
  );
}
```

Create `src/app/tv/slides/ITINSlide.tsx`:
```tsx
export default function ITINSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[#0A0F1A] text-white text-5xl font-bold">
      Slide 6: ITIN
    </div>
  );
}
```

Create `src/app/tv/slides/TeamSlide.tsx`:
```tsx
export default function TeamSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-white text-[#1E293B] text-5xl font-bold">
      Slide 7: Team
    </div>
  );
}
```

Create `src/app/tv/slides/ContactSlide.tsx`:
```tsx
export default function ContactSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[#0A0F1A] text-white text-5xl font-bold">
      Slide 8: Contact
    </div>
  );
}
```

- [ ] **Step 3: Verify auto-advance works**

Run: `npm run dev`
Visit: `http://localhost:3000/tv`
Expected: Slides cycle every 12s with crossfade. "Slide 1: Hero" → "Slide 2: Stats" → etc. Alternating dark/light backgrounds.

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/tv/
git commit -m "feat(tv): slider orchestrator with auto-advance, Wake Lock, and placeholder slides"
```

---

### Task 3: Hero Slide (Dark)

**Files:**
- Modify: `src/app/tv/slides/HeroSlide.tsx`

- [ ] **Step 1: Implement HeroSlide**

Replace `src/app/tv/slides/HeroSlide.tsx` with:
```tsx
import Image from "next/image";
import { ADDRESS } from "@/lib/constants";

export default function HeroSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="relative h-full w-full">
      {/* Background image with dark overlay */}
      <Image
        src="/images/office-exterior-hd.jpg"
        alt="Advantage Services Office"
        fill
        className="object-cover"
        sizes="1920px"
        quality={90}
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1A]/80 via-[#0A0F1A]/60 to-[#0A0F1A]/90" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-16">
        <p className="text-[18px] uppercase tracking-[4px] text-[#F9A825] mb-6">
          Welcome To
        </p>
        <h1 className="text-[72px] font-extrabold text-white leading-tight mb-6">
          Advantage Services
        </h1>
        <div className="w-[80px] h-[3px] bg-[#F9A825] rounded-full mb-8" />
        <p className="text-[32px] text-white/90 font-medium max-w-[900px] leading-snug">
          One Stop Shop For All Business Solutions
        </p>

        {/* Badge */}
        <div className="mt-12 border border-[#F9A825]/40 rounded-2xl px-10 py-4">
          <p className="text-[22px] text-white/80">
            20+ Years Serving NYC Small Businesses
          </p>
        </div>

        {/* Address at bottom */}
        <p className="absolute bottom-12 text-[18px] text-white/50">
          {ADDRESS.full}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the slide renders**

Run: `npm run dev`, visit `http://localhost:3000/tv`
Expected: First slide shows office exterior with dark overlay, "Advantage Services" title, tagline, gold accents, address at bottom.

- [ ] **Step 3: Commit**

```bash
git add src/app/tv/slides/HeroSlide.tsx
git commit -m "feat(tv): hero slide with office photo and brand intro"
```

---

### Task 4: Stats Slide (Dark)

**Files:**
- Modify: `src/app/tv/slides/StatsSlide.tsx`

- [ ] **Step 1: Implement StatsSlide with count-up animation**

Replace `src/app/tv/slides/StatsSlide.tsx` with:
```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { STATS } from "@/lib/constants";
import { GOOGLE_RATING } from "@/lib/reviews";

const DISPLAY_STATS = [
  { count: STATS.businessSetups.count, label: "Businesses Formed", suffix: "+" },
  { count: STATS.taxClients.count, label: "Tax Clients Served", suffix: "+" },
  { count: STATS.businessLicenses.count, label: "Business Licenses", suffix: "+" },
  { count: GOOGLE_RATING.rating, label: "Google Rating", suffix: "", isRating: true },
];

function CountUp({ target, duration = 2000, isRating = false }: { target: number; duration?: number; isRating?: boolean }) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    setValue(0);

    function animate(timestamp: number) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      if (isRating) {
        setValue(parseFloat((eased * target).toFixed(1)));
      } else {
        setValue(Math.floor(eased * target));
      }

      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [target, duration, isRating]);

  if (isRating) return <>{value.toFixed(1)}</>;
  return <>{value.toLocaleString()}</>;
}

export default function StatsSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full bg-gradient-to-br from-[#4F56E8] to-[#1E293B] flex flex-col items-center justify-center px-16">
      <p className="text-[18px] uppercase tracking-[4px] text-[#F9A825] mb-16">
        Trusted By NYC Small Businesses
      </p>

      <div className="grid grid-cols-4 gap-12 max-w-[1400px] w-full">
        {DISPLAY_STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-[80px] font-extrabold text-white leading-none mb-4">
              <CountUp target={stat.count} isRating={stat.isRating} />
              <span className="text-[#F9A825]">{stat.suffix}</span>
            </div>
            {stat.isRating && (
              <div className="text-[28px] text-[#F9A825] mb-2">
                {"★".repeat(5)}
              </div>
            )}
            <p className="text-[22px] text-white/70">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 w-[80px] h-[3px] bg-[#F9A825] rounded-full" />
      <p className="mt-6 text-[20px] text-white/50">
        Since 2004
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify count-up animation works**

Run: `npm run dev`, visit `http://localhost:3000/tv`, wait for slide 2.
Expected: Four stat columns with numbers animating from 0 to final value. Gold stars under 4.9 rating.

- [ ] **Step 3: Commit**

```bash
git add src/app/tv/slides/StatsSlide.tsx
git commit -m "feat(tv): stats slide with count-up animations"
```

---

### Task 5: Services Slide A (Light)

**Files:**
- Modify: `src/app/tv/slides/ServicesSlideA.tsx`

- [ ] **Step 1: Implement ServicesSlideA**

Replace `src/app/tv/slides/ServicesSlideA.tsx` with:
```tsx
import { SERVICES } from "@/lib/constants";

const FEATURED = [
  { key: "Business Formation", bullets: ["LLC, Corporation, Non-Profit", "State & federal filing", "EIN registration"] },
  { key: "Licensing", bullets: ["Contractor licensing", "Restaurant permits", "Retail & vendor licenses"] },
  { key: "Tax Services", bullets: ["Business & personal tax", "Payroll tax filing", "IRS representation"] },
];

export default function ServicesSlideA({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full bg-[#F8FAFC] flex flex-col items-center justify-center px-16">
      <p className="text-[16px] uppercase tracking-[4px] text-[#4F56E8] mb-4">
        Our Services
      </p>
      <h2 className="text-[44px] font-bold text-[#1E293B] mb-16">
        Start & Grow Your Business
      </h2>

      <div className="grid grid-cols-3 gap-10 max-w-[1400px] w-full">
        {FEATURED.map((service) => {
          const full = SERVICES.find((s) => s.name === service.key);
          return (
            <div key={service.key} className="bg-white rounded-2xl p-10 shadow-sm border border-[#E2E8F0]">
              <div className="text-[40px] mb-4">{full?.icon}</div>
              <h3 className="text-[28px] font-bold text-[#1E293B] mb-4">{service.key}</h3>
              <ul className="space-y-3">
                {service.bullets.map((b) => (
                  <li key={b} className="text-[20px] text-[#475569] flex items-start gap-3">
                    <span className="text-[#4F56E8] mt-1 shrink-0">●</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Visit `http://localhost:3000/tv`, wait for slide 3.
Expected: Light background, 3 white cards with service name, icon, and bullet points.

- [ ] **Step 3: Commit**

```bash
git add src/app/tv/slides/ServicesSlideA.tsx
git commit -m "feat(tv): services slide A — formation, licensing, tax"
```

---

### Task 6: Review Slide (Dark)

**Files:**
- Modify: `src/app/tv/slides/ReviewSlide.tsx`

- [ ] **Step 1: Implement ReviewSlide with rotation**

Replace `src/app/tv/slides/ReviewSlide.tsx` with:
```tsx
import { REVIEWS, GOOGLE_RATING } from "@/lib/reviews";

export default function ReviewSlide({ cycleCount }: { cycleCount: number }) {
  const review = REVIEWS[cycleCount % REVIEWS.length];

  return (
    <div className="h-full w-full bg-[#0A0F1A] flex flex-col items-center justify-center px-20">
      {/* Large decorative quote mark */}
      <div className="text-[120px] leading-none text-[#F9A825]/30 font-serif mb-[-20px]">
        &ldquo;
      </div>

      {/* Review text */}
      <blockquote className="text-[32px] text-white text-center leading-relaxed max-w-[1000px] mb-10">
        {review.text}
      </blockquote>

      {/* Reviewer info */}
      <div className="flex items-center gap-3 mb-8">
        <p className="text-[24px] font-semibold text-white">{review.name}</p>
        <span className="text-white/30">|</span>
        <p className="text-[20px] text-white/50">{review.date}</p>
      </div>

      {/* Stars */}
      <div className="text-[32px] text-[#F9A825] mb-8">
        {"★".repeat(review.rating)}
      </div>

      {/* Google rating badge */}
      <div className="border border-white/10 rounded-xl px-8 py-3 flex items-center gap-4">
        <span className="text-[20px] font-bold text-white">{GOOGLE_RATING.rating}</span>
        <span className="text-[18px] text-[#F9A825]">★</span>
        <span className="text-[18px] text-white/50">Google Reviews</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify rotation across cycles**

Wait for full loop to cycle back to slide 4. Second time should show a different review.
Expected: Different reviewer name and quote text on each cycle.

- [ ] **Step 3: Commit**

```bash
git add src/app/tv/slides/ReviewSlide.tsx
git commit -m "feat(tv): review slide with per-cycle rotation"
```

---

### Task 7: Services Slide B (Light)

**Files:**
- Modify: `src/app/tv/slides/ServicesSlideB.tsx`

- [ ] **Step 1: Implement ServicesSlideB**

Replace `src/app/tv/slides/ServicesSlideB.tsx` with:
```tsx
import { SERVICES } from "@/lib/constants";

const FEATURED = [
  { key: "Insurance", bullets: ["General liability", "Workers compensation", "Disability insurance"] },
  { key: "Audit Defense", bullets: ["Workers comp audits", "Sales tax audits", "Fine reduction services"] },
  { key: "Financial Services", bullets: ["Bookkeeping", "Financial statements", "Business analysis"] },
];

export default function ServicesSlideB({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full bg-[#F8FAFC] flex flex-col items-center justify-center px-16">
      <p className="text-[16px] uppercase tracking-[4px] text-[#4F56E8] mb-4">
        Our Services
      </p>
      <h2 className="text-[44px] font-bold text-[#1E293B] mb-16">
        Protect & Manage Your Business
      </h2>

      <div className="grid grid-cols-3 gap-10 max-w-[1400px] w-full">
        {FEATURED.map((service) => {
          const full = SERVICES.find((s) => s.name === service.key);
          return (
            <div key={service.key} className="bg-white rounded-2xl p-10 shadow-sm border border-[#E2E8F0]">
              <div className="text-[40px] mb-4">{full?.icon}</div>
              <h3 className="text-[28px] font-bold text-[#1E293B] mb-4">{service.key}</h3>
              <ul className="space-y-3">
                {service.bullets.map((b) => (
                  <li key={b} className="text-[20px] text-[#475569] flex items-start gap-3">
                    <span className="text-[#4F56E8] mt-1 shrink-0">●</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Visit `http://localhost:3000/tv`, wait for slide 5.
Expected: Same card layout as Slide 3 but with Insurance, Audit Defense, Financial Services.

- [ ] **Step 3: Commit**

```bash
git add src/app/tv/slides/ServicesSlideB.tsx
git commit -m "feat(tv): services slide B — insurance, audit defense, financial"
```

---

### Task 8: ITIN / Immigration Slide (Dark)

**Files:**
- Modify: `src/app/tv/slides/ITINSlide.tsx`

- [ ] **Step 1: Implement ITINSlide**

Replace `src/app/tv/slides/ITINSlide.tsx` with:
```tsx
import Image from "next/image";

export default function ITINSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full bg-gradient-to-br from-[#4F56E8] to-[#1E293B] flex items-center justify-center px-20">
      <div className="flex items-center gap-20 max-w-[1400px] w-full">
        {/* Left content */}
        <div className="flex-1">
          <p className="text-[16px] uppercase tracking-[4px] text-[#F9A825] mb-4">
            Featured Service
          </p>
          <h2 className="text-[52px] font-extrabold text-white leading-tight mb-6">
            ITIN Registration
          </h2>
          <div className="w-[60px] h-[3px] bg-[#F9A825] rounded-full mb-8" />

          {/* Credential badge */}
          <div className="inline-block bg-white/10 border border-[#F9A825]/40 rounded-xl px-6 py-3 mb-8">
            <p className="text-[20px] text-[#F9A825] font-semibold">
              IRS Certified Acceptance Agent
            </p>
          </div>

          <ul className="space-y-5 mb-10">
            {[
              "No need to mail your passport",
              "Certify & file on-site",
              "2,250+ ITINs processed",
            ].map((item) => (
              <li key={item} className="text-[24px] text-white/90 flex items-center gap-4">
                <span className="text-[#F9A825] text-[20px]">✓</span>
                {item}
              </li>
            ))}
          </ul>

          {/* Additional services */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-[16px] uppercase tracking-[3px] text-white/40 mb-3">Also Available</p>
            <p className="text-[20px] text-white/60">
              Immigration · Citizenship · Legal Services
            </p>
          </div>
        </div>

        {/* Right: Kedar photo */}
        <div className="shrink-0">
          <div className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden border-2 border-white/10">
            <Image
              src="/images/team/kedar.jpg"
              alt="Kedar Gupta — IRS Certified Tax Preparer & Acceptance Agent"
              fill
              className="object-cover object-[50%_10%]"
              sizes="300px"
              quality={90}
            />
          </div>
          <p className="text-center mt-4 text-[18px] text-white font-semibold">Kedar Gupta</p>
          <p className="text-center text-[14px] text-white/50">IRS Certified Tax Preparer</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Visit `http://localhost:3000/tv`, wait for slide 6.
Expected: Split layout — ITIN info on left with gold accents, Kedar's photo on right.

- [ ] **Step 3: Commit**

```bash
git add src/app/tv/slides/ITINSlide.tsx
git commit -m "feat(tv): ITIN/immigration highlight slide with Kedar photo"
```

---

### Task 9: Team Slide (Light)

**Files:**
- Modify: `src/app/tv/slides/TeamSlide.tsx`

- [ ] **Step 1: Implement TeamSlide**

Replace `src/app/tv/slides/TeamSlide.tsx` with:
```tsx
import Image from "next/image";
import { TEAM } from "@/lib/constants";

const TEAM_PHOTOS: Record<string, string> = {
  Jay: "/images/team/jay-v2.jpg",
  Kedar: "/images/team/kedar.jpg",
  Zia: "/images/team/zia.jpg",
  Akram: "/images/team/akram.jpg",
  Riaz: "/images/team/riaz-v7.jpg",
  Hamid: "/images/team/hamid-v11.jpg",
};

const PHOTO_POSITIONS: Record<string, string> = {
  Jay: "object-[50%_10%]",
  Kedar: "object-[50%_10%]",
  Zia: "object-[50%_10%]",
  Akram: "object-[50%_10%]",
  Riaz: "object-[50%_10%]",
  Hamid: "object-[50%_10%]",
};

export default function TeamSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full bg-[#F8FAFC] flex flex-col items-center justify-center px-16">
      <p className="text-[16px] uppercase tracking-[4px] text-[#4F56E8] mb-4">
        Our Team
      </p>
      <h2 className="text-[44px] font-bold text-[#1E293B] mb-14">
        Meet the Experts
      </h2>

      <div className="grid grid-cols-3 gap-x-16 gap-y-10 max-w-[1200px]">
        {TEAM.map((member) => (
          <div key={member.name} className="flex items-center gap-5">
            <div className="relative w-[100px] h-[100px] rounded-full overflow-hidden shrink-0 border-2 border-[#E2E8F0]">
              <Image
                src={TEAM_PHOTOS[member.name]}
                alt={member.fullName}
                fill
                className={`object-cover ${PHOTO_POSITIONS[member.name]}`}
                sizes="200px"
                quality={90}
              />
            </div>
            <div>
              <h3 className="text-[22px] font-bold text-[#1E293B]">{member.fullName}</h3>
              <p className="text-[16px] text-[#4F56E8] mb-2">{member.role}</p>
              <div className="flex flex-wrap gap-1.5">
                {member.specialties.slice(0, 3).map((s) => (
                  <span key={s} className="text-[13px] bg-[#EEF2FF] text-[#4F56E8] px-2.5 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Visit `http://localhost:3000/tv`, wait for slide 7.
Expected: 2-row, 3-column grid. Each member has circular photo, name, role, and specialty tags.

- [ ] **Step 3: Commit**

```bash
git add src/app/tv/slides/TeamSlide.tsx
git commit -m "feat(tv): team slide with photos and specialty tags"
```

---

### Task 10: Contact Slide (Dark)

**Files:**
- Modify: `src/app/tv/slides/ContactSlide.tsx`

- [ ] **Step 1: Implement ContactSlide**

Replace `src/app/tv/slides/ContactSlide.tsx` with:
```tsx
import { ADDRESS, PHONE, HOURS } from "@/lib/constants";

export default function ContactSlide({ cycleCount }: { cycleCount: number }) {
  return (
    <div className="h-full w-full bg-[#0A0F1A] flex flex-col items-center justify-center px-16">
      <p className="text-[16px] uppercase tracking-[4px] text-[#F9A825] mb-6">
        Advantage Services
      </p>
      <h2 className="text-[48px] font-bold text-white mb-14">
        We&apos;re Here For You
      </h2>

      <div className="border border-white/10 rounded-2xl px-16 py-12 max-w-[800px] w-full">
        <div className="space-y-8 text-center">
          {/* Address */}
          <div>
            <p className="text-[16px] uppercase tracking-[3px] text-white/40 mb-2">Visit Us</p>
            <p className="text-[26px] text-white">{ADDRESS.full}</p>
          </div>

          <div className="w-[60px] h-[2px] bg-[#F9A825]/30 mx-auto" />

          {/* Phone */}
          <div>
            <p className="text-[16px] uppercase tracking-[3px] text-white/40 mb-2">Call Us</p>
            <p className="text-[30px] text-white font-semibold">{PHONE.main}</p>
          </div>

          <div className="w-[60px] h-[2px] bg-[#F9A825]/30 mx-auto" />

          {/* Hours */}
          <div>
            <p className="text-[16px] uppercase tracking-[3px] text-white/40 mb-2">Office Hours</p>
            <p className="text-[26px] text-white">
              {HOURS.days}
            </p>
            <p className="text-[24px] text-white/70 mt-1">
              {HOURS.time} {HOURS.timezone}
            </p>
          </div>
        </div>
      </div>

      {/* QR code placeholder — generate via API or static image */}
      <div className="mt-10 flex items-center gap-4">
        <div className="w-[80px] h-[80px] bg-white rounded-lg flex items-center justify-center">
          {/* Replace with actual QR code image: /images/qr-advantagenys.png */}
          <div className="w-[70px] h-[70px] bg-[#E2E8F0] rounded flex items-center justify-center text-[10px] text-[#475569]">
            QR
          </div>
        </div>
        <p className="text-[16px] text-white/40">advantagenys.com</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Visit `http://localhost:3000/tv`, wait for slide 8.
Expected: Dark slide with bordered card containing address, phone, hours. QR placeholder at bottom.

- [ ] **Step 3: Commit**

```bash
git add src/app/tv/slides/ContactSlide.tsx
git commit -m "feat(tv): contact slide with address, phone, hours"
```

---

### Task 11: QR Code Generation

**Files:**
- Create: `public/images/qr-advantagenys.png`
- Modify: `src/app/tv/slides/ContactSlide.tsx`

- [ ] **Step 1: Generate QR code**

Run:
```bash
npx qrcode -o public/images/qr-advantagenys.png "https://advantagenys.com" --width 200 --margin 1
```

If `qrcode` CLI not available, use: `npx qr-image-cli "https://advantagenys.com" > public/images/qr-advantagenys.png`

Or generate via any online QR code generator and save to `public/images/qr-advantagenys.png` at 200x200px.

- [ ] **Step 2: Update ContactSlide to use real QR**

In `src/app/tv/slides/ContactSlide.tsx`, replace the QR placeholder div:
```tsx
        <div className="w-[80px] h-[80px] bg-white rounded-lg flex items-center justify-center">
          {/* Replace with actual QR code image: /images/qr-advantagenys.png */}
          <div className="w-[70px] h-[70px] bg-[#E2E8F0] rounded flex items-center justify-center text-[10px] text-[#475569]">
            QR
          </div>
        </div>
```

With:
```tsx
        <div className="w-[80px] h-[80px] bg-white rounded-lg p-1">
          <img
            src="/images/qr-advantagenys.png"
            alt="Scan to visit advantagenys.com"
            className="w-full h-full"
          />
        </div>
```

- [ ] **Step 3: Verify QR renders on slide**

Visit slide 8 in dev mode. Expected: Real QR code image in white rounded box.

- [ ] **Step 4: Commit**

```bash
git add public/images/qr-advantagenys.png src/app/tv/slides/ContactSlide.tsx
git commit -m "feat(tv): add QR code for advantagenys.com to contact slide"
```

---

### Task 12: Image Preloading + Final Polish

**Files:**
- Modify: `src/app/tv/page.tsx`
- Modify: `src/app/tv/TVSlider.tsx`

- [ ] **Step 1: Add image preload hints to page.tsx**

Replace `src/app/tv/page.tsx` with:
```tsx
import type { Metadata } from "next";
import TVSlider from "./TVSlider";

export const metadata: Metadata = {
  title: "Advantage Services",
  robots: { index: false, follow: false },
};

const PRELOAD_IMAGES = [
  "/images/office-exterior-hd.jpg",
  "/images/team/kedar.jpg",
  "/images/team/jay-v2.jpg",
  "/images/team/zia.jpg",
  "/images/team/akram.jpg",
  "/images/team/riaz-v7.jpg",
  "/images/team/hamid-v11.jpg",
  "/images/qr-advantagenys.png",
];

export default function TVPage() {
  return (
    <>
      {/* Preload critical images to prevent flash during transitions */}
      {PRELOAD_IMAGES.map((src) => (
        <link key={src} rel="preload" as="image" href={src} />
      ))}
      <main className="h-screen w-screen overflow-hidden bg-[#0A0F1A]">
        <TVSlider />
      </main>
    </>
  );
}
```

- [ ] **Step 2: Build and verify full loop**

Run: `npm run build`
Expected: Clean build.

Run: `npm run start`, visit `http://localhost:3000/tv`
Expected: All 8 slides render, auto-advance works, transitions smooth, no missing images.

- [ ] **Step 3: Final commit**

```bash
git add src/app/tv/page.tsx
git commit -m "feat(tv): image preloading for smooth transitions"
```

---

### Task 13: Production Deploy + Verification

- [ ] **Step 1: Push to deploy**

```bash
git push origin main
```

- [ ] **Step 2: Verify production**

Visit: `https://advantagenys.com/tv`
Expected: Full-screen presentation, auto-looping, all slides rendering correctly.

- [ ] **Step 3: Samsung TV test checklist**

Open Samsung TV browser, navigate to `advantagenys.com/tv`:
- [ ] Full-screen, no browser chrome visible
- [ ] Slides auto-advance every ~12 seconds
- [ ] Crossfade transitions smooth
- [ ] Text readable from 10+ feet
- [ ] No scroll bars or overflow
- [ ] Runs for 10+ minutes without freezing
- [ ] Screen doesn't sleep (Wake Lock)
