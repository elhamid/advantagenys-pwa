# Advantage PWA (advantagenys-pwa)

Client-facing Progressive Web App for Advantage Business Consulting. Brand site with service pages, industry verticals, lead capture, and SEO. Domain: advantagenys.com

For cross-project alignment, see ../AdvantageOS/Projects/CRM_Hub/ADVANTAGEOS_UNIFYING_CONTEXT.md

## Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4 via @tailwindcss/postcss, design tokens in `src/styles/tokens.css`
- **Fonts:** Plus Jakarta Sans (headings), JetBrains Mono (mono) -- loaded via next/font
- **Animation:** Framer Motion + GSAP
- **Path alias:** `@/*` maps to `./src/*`

## Project Structure

```
src/
  app/              # Next.js App Router pages
    services/       # Business formation, tax, licensing, insurance, audit defense, financial
    industries/     # Restaurants, contractors, immigrant entrepreneurs
    contact/        # Contact/lead capture page
    about/          # About page
    resources/      # Resources page
    demo/           # Demo variants (1-5)
  components/
    ui/             # Reusable primitives (Button, Card, Container, Badge, ScrollReveal)
    home/           # Homepage sections (Hero, ServicePillars, Testimonials, etc.)
    layout/         # Header, Footer, MobileNav
    contact/        # ContactForm
    chat/           # ChatWidget
  hooks/            # Custom hooks (useCountUp)
  lib/              # Utilities, constants, reviews data
  styles/           # Design tokens
```

## Commands

```bash
npm run dev       # Local dev server
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # ESLint
npm test          # Vitest in watch mode
npm run test:run  # Vitest single run (CI)
npm run test:e2e  # Playwright E2E tests
```

## Conventions

- All pages use the App Router (`page.tsx` convention)
- Component files are PascalCase (e.g., `ServicePillars.tsx`)
- UI components live in `components/ui/`, feature components in named directories
- SEO metadata defined per-page via Next.js Metadata API; base URL is `https://advantagenys.com`
- PWA manifest at `/manifest.json`; theme color `#4F56E8`

## Gotchas

- `next.config.ts` is currently empty -- any image domains, redirects, or rewrites must be added there
- No `.env` file exists yet -- external API integrations (form submissions, chat backend) will need env vars
- Test framework: Vitest (unit/integration) + Playwright (E2E); see `vitest.config.ts` and `playwright.config.ts`
- Tailwind 4 uses `@tailwindcss/postcss` plugin (not the classic `tailwindcss` PostCSS plugin)
- Path alias `@/*` resolves to `src/*`, not project root
- `.env.local` required for: `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TASKBOARD_WEBHOOK_URL`

## Integration Points

- **Lead capture** flows into the advantage-taskboard CRM pipeline (form submissions from ContactForm and ChatWidget)
- **ChatWidget** is rendered globally via root layout
- **Lead pipeline** is LIVE: ContactForm/BookingForm → `/api/contact` → Turnstile verification → taskboard webhook (`/api/webhooks/pwa-lead`)

## AdvantageOS Portfolio

This is piece **5 of 6** in the AdvantageOS ecosystem:

1. AdvantageOS -- orchestration layer and unifying context
2. advantage-taskboard -- CRM/task management (receives leads from this PWA)
3. enclaude -- AI agent infrastructure
4. AdvantageNYS (legacy site)
5. **advantagenys-pwa** -- client-facing PWA (this project)
6. Additional portfolio pieces TBD

## Velocity
9 products shipped in 2 months. Estimate from actual baseline, not default human timelines.
