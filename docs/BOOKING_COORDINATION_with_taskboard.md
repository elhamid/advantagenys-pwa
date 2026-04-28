# Booking Coordination — PWA ↔ Taskboard

**Date**: 2026-04-28
**CEO directive**: "core of the system is taskboard repo. coordinate with claude in pwa repo."

This document is left in the PWA repo so the Claude session here knows what's already built in `advantage-taskboard` and how to consume it cleanly.

---

## Architecture rule

**advantage-taskboard owns the booking domain.** That includes:
- Database schema (`bookings`, `appointments`, `staff_availability`, `config_services.{default_assignee, secondary_assignee_id}`, `tasks`)
- Business logic (slot generation, conflict checks, multi-candidate routing, double-booking prevention)
- Public API endpoints (`/api/book/slots`, `/api/book/confirm`)
- Confirmation email + .ics generation

**advantagenys-pwa owns the public-facing surface.** That means:
- The `/book` page UX (hero, copy, brand voice — PWA's call)
- CTA repointing across the existing 33 PWA routes
- Floating contact widget integration
- Anything else that's marketing/SEO/brand

PWA should NOT duplicate booking business logic. Call taskboard's API.

---

## What's already built in taskboard (read this before designing /book in PWA)

Source of truth: `advantage-taskboard` `staging` branch (commit ~`900e492` and forward).

### Page (UX reference only — don't copy verbatim, PWA has different brand surface)
- `src/app/book/page.tsx` — minimal Next.js page
- `src/app/book/BookingContent.tsx` — 3-step flow orchestrator (service → slot → contact)
- `src/components/book/ServicePicker.tsx`, `SlotGrid.tsx`, `ContactForm.tsx`
- `src/app/book/confirmed/{page,ConfirmedContent}.tsx` — confirmation surface
- Mobile auto-detects 7-day window; desktop 14-day grid

### API endpoints (PUBLIC — already whitelisted in taskboard middleware)
Base: `https://app.advantagenys.com` (prod), `https://staging.advantagenys.com` (staging)

#### `GET /api/book/slots`
Query params:
- `service` — service slug, lowercase (e.g. `itin`, `tax`, `consulting`)
- `from` — ISO date `YYYY-MM-DD`
- `to` — ISO date `YYYY-MM-DD`

Response 200:
```json
{
  "slots": [
    { "start": "2026-04-29T14:00:00Z", "end": "2026-04-29T14:30:00Z", "assignee_user_id": "uuid" }
  ],
  "assignee_initials": "HA"
}
```
- Times in UTC; client renders in `America/New_York`
- No PII (no name, email, phone)
- Rate limited 60/min/IP
- Cache-Control: private, max-age=60

#### `POST /api/book/confirm`
Body:
```json
{
  "service": "itin",
  "slot": "2026-04-29T14:00:00Z",
  "name": "...",
  "email": "...",
  "phone": "...",
  "notes": "..."
}
```
Response 200:
```json
{ "ok": true, "appointment_id": "uuid", "assignee_initials": "HA" }
```
Errors:
- 400 — validation (missing fields, invalid email, etc.)
- 409 — slot no longer available (double-book prevention via unique index + pre-flight check)
- 500 — server error

Side effects (atomic — all-or-nothing):
- Inserts row in `bookings` (`source='public-link'`)
- Inserts row in `appointments` (`source='pwa-booking'`, `booking_id` FK)
- Inserts row in `tasks` (`source='public-booking'`, PII-redacted description)
- Fires Brevo confirmation email with `.ics` attachment (best-effort, won't fail the response)

Rate limited 5/min/IP.

---

## Two integration options for PWA `/book`

### Option A — Call taskboard API directly (recommended)
PWA's `/book` page → fetch `https://app.advantagenys.com/api/book/slots` and `/confirm` from a thin PWA server-side proxy or directly from the client.

Pros:
- Single source of truth for business logic
- Bug fixes in taskboard automatically propagate
- No env-var sprawl on PWA (no SUPABASE_SERVICE_ROLE_KEY needed on PWA for booking)

Cons:
- Cross-origin (CORS) — taskboard middleware needs `Access-Control-Allow-Origin: https://www.advantagenys.com` for these specific routes. Currently NOT configured. ASK if you need this — it's a one-line change in taskboard.
- Public booking traffic flows through `app.advantagenys.com` (slightly tighter coupling between domains)

### Option B — PWA hits Supabase directly with service-role key
Re-implement the slot generator + confirm logic in PWA. Talk to the same Supabase project.

Pros:
- No CORS
- No taskboard dependency for runtime

Cons:
- Duplicates 600+ LOC of business logic. Defects must be fixed in two places.
- Service-role key on PWA = expanded blast radius.
- This was REJECTED in the cross-repo port attempt (2026-04-28) — CEO said "core of the system is taskboard repo."

**Use Option A unless there's a compelling reason not to.**

---

## Open defects in taskboard /book (being fixed in `fix/book-defects-r1`)

Self-verify run on 2026-04-28 found 4 defects. PWA should NOT consume the taskboard API until these are merged to staging:

1. **Case-sensitive service slug** — `service=ITIN` returns empty; only `itin` works. Fix: normalize to lowercase in slots+confirm.
2. **Timezone bug** — slot times treated as UTC wall-clock, not ET. Slots show 6am for 10am ET windows. Fix: interpret `staff_availability.time_windows` in `America/New_York`.
3. **Task source FK** — `public-booking` not seeded in `config_sources`; task INSERT silently fails. Fix: seed migration + (probably) change source to `pwa-booking`.
4. **Double-booking via secondary candidate** — when primary has a conflict, fall-through to secondary creates two bookings at the same time. Fix: pre-flight check + unique index.

Track via taskboard branch `fix/book-defects-r1`. After merge to staging, taskboard `/book` is production-ready (modulo `BREVO_API_KEY` on Vercel staging env — CEO action).

---

## Service routing map (CEO-confirmed)

Primary defaults already in `config_services.default_assignee` (don't override).
Secondary (optional fallback) seeded by migration `20260428000001`:
- Consulting: secondary = Jay
- Insurance: secondary = Akram
- Audit: secondary = Akram
- Bookkeeping: secondary = Riaz
- ITIN: secondary = Akram
- Tax: secondary = Jay

When primary has no availability AND/OR conflict at the requested slot, secondary is offered/selected.

---

## Staff default availability (CEO-confirmed, off tax season)

Seeded via migration `20260428000002` for window `2026-04-15 → 2026-12-31`, Mon-Sat:
- Zia, Akram, Riaz: 11:00-18:00 ET
- Jay, Kedar: 12:00-19:00 ET
- Hamid: 10:00-19:00 ET

All staff can edit their own via `app.advantagenys.com/me/availability`. Sundays closed.

---

## CEO's brainstorm questions to PWA Claude (still pending)

From your earlier exchange in PWA repo:
1. `/book` scope — option (a) thin form, (b) richer landing, (c) full Phase 1 with calendar?
2. Floating contact — merge into ChatWidget or separate FAB stack?
3. Want a `/frontend-design` audit pass?

These are PWA-side decisions. Taskboard side already shipped option (c) (full calendar at `/book` on app subdomain) — but that's the API/internal artifact. The public PWA `/book` UX is your call. Recommend: option (b) richer landing that calls taskboard's API for slots — keeps PWA brand-rich while reusing taskboard logic.

---

## Coordination protocol going forward

- This doc is the contract. If it changes, both Claudes update it.
- Bug fixes in taskboard `/book` → notify PWA via this doc (add a CHANGELOG section if it grows).
- API contract changes in taskboard → bump a version param or add a deprecation notice here.
- PWA discoveries about real-world usage → log to taskboard backlog so logic gets fixed at the core.

— taskboard Claude, 2026-04-28
