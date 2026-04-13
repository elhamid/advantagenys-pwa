# TV Lobby Presentation Slider — Design Spec

## Overview

Full-screen auto-looping presentation for the Advantage Services office lobby TV (Samsung, via built-in browser at `advantagenys.com/tv`). Runs all day, no interaction required.

## Audience & Context

- **Already warm** — referred clients or walk-ins curious enough to enter
- **Three attention states:** glancing from outside (2-3s), walking in (5-10s), sitting in waiting area (minutes)
- **Goal:** Reinforce trust ("these people are legit") and expand service awareness ("they do THAT too?")
- **Not a sales pitch** — calm, confident, informative. Premium waiting room feel.

## Technical Specs

- **Resolution:** 1920x1080 landscape (Samsung TV browser)
- **Route:** `/tv` — Next.js App Router page
- **Chromeless:** No header/footer — uses existing `LayoutShell` `CHROMELESS_PREFIXES` pattern (add `/tv`)
- **Auto-loop:** 12-second hold per slide, 1-second crossfade transition, infinite loop
- **Language:** English only

### TV Browser Hardening

- **Wake Lock API** — prevents screen sleep / screensaver
- **No scroll bars** — `overflow: hidden` on body
- **No text selection** — `user-select: none`
- **Touch prevention** — disable accidental swipe/tap navigation
- **Auto-recovery** — if JS errors or network hiccup, page reloads after 30s of inactivity
- **Preload all images** — no flash of missing content during transitions
- **No video, no sound** — pure CSS/JS slides

## Visual Design

### Tone: Mixed Dark/Light

- **Dark slides** (stats, reviews, hero, ITIN, contact) — `background: linear-gradient(135deg, #4F56E8 0%, #1E293B 100%)` or solid `#0A0F1A`. White text, gold accents (#F9A825).
- **Light slides** (services, team) — `background: #FFFFFF` or `#F8FAFC`. Dark text (#1E293B), blue accents (#4F56E8).
- Alternating dark/light prevents visual fatigue over a full day.

### Typography

- **Font:** Plus Jakarta Sans (loaded via next/font, already in project)
- **Stat numbers:** 72-96px, font-weight 800
- **Slide titles:** 36-48px, font-weight 700
- **Body/bullets:** 24-28px, font-weight 400-500
- **Labels/captions:** 16-18px, uppercase, letter-spacing 2-3px
- **Minimum readable size:** 24px body (viewed from 5-15 feet)

### Accents & Dividers

- Gold (#F9A825) for key stat numbers, star ratings, divider lines on dark slides
- Blue (#4F56E8) for labels, highlights, dividers on light slides
- 3px horizontal divider bars between sections

### Transitions

- Crossfade (opacity 0 to 1) over 1 second
- Optional: stat numbers use count-up animation on entry (e.g., 0 -> 1,700+ over 2 seconds)
- No slide/swipe animations — crossfade only for TV dignity

## Slide Deck (8 Slides, ~96s Full Cycle)

### Slide 1: Hero / Welcome (DARK)

- **Layout:** Full-bleed office exterior photo (`office-exterior-hd.jpg`) with dark gradient overlay
- **Content:**
  - "Advantage Services" logo text — white, top-center
  - Tagline: "One Stop Shop For All Business Solutions" — 36px, centered
  - Badge: "20+ Years Serving NYC Small Businesses" — gold accent border
  - Address: "229-14 Linden Blvd, Cambria Heights, NY" — bottom, subtle

### Slide 2: Stats Dashboard (DARK)

- **Layout:** 4-column grid, centered
- **Content:**
  - 1,700+ Businesses Formed
  - 5,700+ Tax Clients Served
  - 2,500+ Business Licenses Obtained
  - 4.9 Google Rating (with gold stars)
- **Animation:** Numbers count up from 0 on slide entry
- **Bottom line:** "Trusted by NYC small businesses since 2004"

### Slide 3: Services Cluster A (LIGHT)

- **Layout:** 3-column card layout
- **Services:**
  - **Business Formation** — LLC, Corporation, Non-Profit setup and filing
  - **Licensing** — Contractor, restaurant, and retail licensing
  - **Tax Services** — Business & personal tax, payroll, IRS representation
- **Each card:** Blue icon/emoji at top, service name (24px bold), 2-3 bullet points (20px)
- **Right accent:** Subtle vertical blue line or related persona image

### Slide 4: Google Review Spotlight (DARK)

- **Layout:** Centered quote block
- **Content:**
  - Large quotation mark (decorative, gold)
  - Review text — 28-32px, white, max 3 lines
  - Reviewer name + gold star row (5 stars)
  - "Google Reviews" label at bottom
- **Rotation:** Cycles through 5 Google reviews across loops (different review each full cycle)
- **Implementation:** Track current review index in state, increment on each cycle

### Slide 5: Services Cluster B (LIGHT)

- **Layout:** Same 3-column card layout as Slide 3
- **Services:**
  - **Insurance** — General liability, workers comp, disability
  - **Audit Defense** — Workers comp, sales tax, UI audit + fine reduction
  - **Financial Services** — Bookkeeping, financial statements, analysis
- **Same styling as Slide 3** for visual consistency

### Slide 6: ITIN / Immigration Highlight (DARK)

- **Layout:** Split — left content, right team photo (Kedar — IRS Certified Agent)
- **Content:**
  - "ITIN Registration" — large title with gold accent
  - "IRS Certified Acceptance Agent" — credential badge
  - Key points:
    - No need to mail your passport
    - Certify & file on-site
    - 2,250+ ITINs processed
  - Also: Immigration, Citizenship, Divorce services listed below
- **Photo:** `kedar.jpg` with circular or rounded-rect frame

### Slide 7: Meet the Team (LIGHT)

- **Layout:** 2-row, 3-column grid of team members
- **Each member:**
  - Circular photo (120-140px diameter)
  - Full name (20px bold)
  - Role (16px, blue accent)
  - Top 2-3 specialty tags (pill badges)
- **Team order:** Jay, Kedar, Zia, Akram, Riaz, Hamid
- **Photos:** Use existing team photos with `object-[50%_10%]` positioning
- **Quality:** `sizes="280px"`, `quality={90}` — must be crisp on 1080p TV

### Slide 8: Contact / Hours (DARK)

- **Layout:** Centered content block with subtle gold borders
- **Content:**
  - "Visit Us" or "We're Here For You" — title
  - Address: 229-14 Linden Blvd, Cambria Heights, NY 11411
  - Phone: (929) 933-1396
  - Hours: Monday - Saturday, 10:00 AM - 8:00 PM ET
  - QR code → `advantagenys.com` (small, bottom-right — not dominant)
- **Tone:** Informational, not pushy. "Here when you need us."

## Data Sources (Reuse Existing)

| Data | Source File |
|------|------------|
| Team members | `src/lib/constants.ts` → `TEAM` |
| Team photos | `src/app/about/page.tsx` → `TEAM_PHOTOS` (extract to shared constant) |
| Photo positions | `src/app/about/page.tsx` → `PHOTO_POSITIONS` (extract to shared constant) |
| Services | `src/lib/constants.ts` → `SERVICES` |
| Google reviews | `src/lib/reviews.ts` → `GOOGLE_REVIEWS` |
| Stats | `src/lib/constants.ts` → `STATS` |
| Contact/hours | `src/lib/constants.ts` → `ADDRESS`, `PHONE`, `HOURS` |

## File Structure

```
src/app/tv/
  page.tsx          — Main TV presentation page (server component with client island)
  TVSlider.tsx      — Client component: slide renderer, transitions, auto-advance, Wake Lock
  slides/
    HeroSlide.tsx
    StatsSlide.tsx
    ServicesSlideA.tsx
    ReviewSlide.tsx
    ServicesSlideB.tsx
    ITINSlide.tsx
    TeamSlide.tsx
    ContactSlide.tsx
```

## Chromeless Integration

Add `/tv` to `CHROMELESS_PREFIXES` in `src/components/layout/LayoutShell.tsx` — same pattern as `/resources/kiosk`.

## Edge Cases

- **Browser crash/reload:** Page auto-recovers. Slide index resets to 0 (acceptable).
- **Network loss:** All images preloaded on initial page load. Presentation continues from cache.
- **Review rotation:** Uses `Date.now()` modulo to pick starting review — ensures variety even after reload.
- **TV sleep:** Wake Lock API. Fallback: hidden video element trick for older Samsung browsers.
- **Samsung browser quirks:** Test with `-webkit-` prefixes for animations. Samsung Internet is Chromium-based, generally well-supported.

## Out of Scope

- Remote management / CMS (slides are code, update via deploy)
- Video content
- Interactive touch features
- Multi-language
- Analytics / tracking
