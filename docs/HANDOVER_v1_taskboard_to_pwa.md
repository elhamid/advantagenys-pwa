# Handover v1 — Taskboard → PWA Claude

**From**: taskboard Claude (`advantage-taskboard` repo)
**To**: PWA Claude (`advantagenys-pwa` repo)
**Date**: 2026-04-28
**Purpose**: hand off the booking domain so PWA can finalize `/book` consumer build, then we go to Codex for one combined cross-repo review, then merge to prod.

Pair-read with `BOOKING_COORDINATION_with_taskboard.md` (architecture rules, API contract spec). This file is the *current state* and *what's still open* — that file is the *contract*.

---

## What's live on `staging.advantagenys.com` right now

Commit: `0792d45` (taskboard `staging`) — **ALL DEFECTS CLOSED, fully verified live 2026-04-28**
Vercel: deployed and serving.

### Pages
- `/book` — Calendly-replacement (full implementation, PUBLIC)
- `/checkin` — trilingual walk-in iPad kiosk (PUBLIC, recovered from `830b481`)

### Public APIs (CORS-enabled, **public — no auth**)

**`GET /api/book/slots?service=<slug>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>`**
- Service slug case-insensitive (e.g. `ITIN`, `itin`, `Itin` all work)
- Returns `{ slots: [{ start: ISO_UTC, end: ISO_UTC, assignee_user_id: uuid }], assignee_initials: string }`
- Slot times are UTC; `start`/`end` represent NY-local wall clock 10:00–19:00 ET correctly converted (verified — `2026-04-29T14:00:00Z` = 10:00 ET)
- Rate limit 60/min/IP (real client IP via `x-forwarded-for[0]` per `src/lib/rate-limit.ts:83`)
- No PII in response

**`POST /api/book/confirm`**
- Body shape: `{ service, slot_start, slot_end, name, email, phone?, notes? }` — note `slot_start`+`slot_end`, NOT `slot`
- Returns 201: `{ confirmation_id: <appointment_uuid> }`
- 409 on slot conflict (race-safe via unique partial index `uniq_bookings_scheduled_at_active`)
- 400 on invalid input
- Rate limit 5/min/IP
- Side effects: bookings + appointments rows always created. **Task row creation currently has a known bug — see "Open issues" below.**

**`OPTIONS` on both routes** — preflight returns 204 with full CORS headers when Origin is allowed.

### CORS — verified live

Allowed origins (echoed back to `Access-Control-Allow-Origin`):
- `https://advantagenys.com`
- `https://www.advantagenys.com`
- `https://advantagenys-pwa.vercel.app`
- Regex: `/^https:\/\/advantagenys-pwa-[a-z0-9-]+-hamids-projects-59f8b77f\.vercel\.app$/` (Vercel preview URLs)

Headers set on every response (success + error):
- `Access-Control-Allow-Origin: <echoed-origin>`
- `Access-Control-Allow-Methods: GET, OPTIONS` (slots) | `POST, OPTIONS` (confirm)
- `Access-Control-Allow-Headers: content-type`
- `Access-Control-Max-Age: 600`
- `Vary: Origin`

Other origins (e.g. `https://evil.com`): no CORS headers returned. Browser will reject.

Live preflight test (verified 2026-04-28):
```bash
curl -i -X OPTIONS "https://staging.advantagenys.com/api/book/slots" \
  -H "Origin: https://advantagenys.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: content-type"
# → HTTP/2 204 + access-control-allow-origin: https://advantagenys.com
```

### Confirmation email + .ics
- Best-effort fire-and-forget after confirm DB writes
- Brevo via `process.env.BREVO_API_KEY`
- iCal attachment + Google Calendar URL on `/book/confirmed?id=<appointment_id>`
- **Staging blocker**: `BREVO_API_KEY` is NOT set in Vercel staging env. Email won't send on staging. Production (`app.advantagenys.com`) HAS the key. CEO action item.

### Routing and availability (verified live)
- 6 services have CEO-specified secondary assignees seeded (Consulting+Jay, Insurance+Akram, Audit+Akram, Bookkeeping+Riaz, ITIN+Akram, Tax+Jay)
- 6 staff have default Mon-Sat off-season hours seeded for `2026-04-15 → 2026-12-31`:
  - Zia/Akram/Riaz 11-18 ET
  - Jay/Kedar 12-19 ET
  - Hamid 10-19 ET
- All staff can self-edit via `app.advantagenys.com/me/availability` (auth-gated)

---

## Open issues

### ✅ Defect 3 — task row not created on confirm — **CLOSED**
Root cause: `config_channels` had no `web` slug → tasks INSERT was hitting FK violation `fk_tasks_channel` and being silently swallowed by `console.warn`. Fix: migration `20260428000004_book_channel_web_seed.sql` seeded `slug='web'`. Verified live: confirm now creates task with `source=public-booking`, `channel=web`, and links via `appointments.task_id`.

### 🟡 BREVO_API_KEY missing on staging Vercel env
Email send is no-op on staging until CEO sets it. Production already has it. Don't depend on email rendering on staging during PWA `/book` testing — test against production after merge.

---

## What you (PWA Claude) need to deliver before Codex review

Per your earlier confirmation:
1. **`/book` rich landing** — hero + service tiles + slot grid + form, calling taskboard's API as a thin client. Inert mode behind `NEXT_PUBLIC_BOOK_LIVE=false` until taskboard goes all-green; fallback POSTs to existing `/api/contact` Phase 0 lead capture.
2. **Floating contact** — merge WhatsApp + Email + Phone quick-actions into ChatWidget. Hide on `/itin`, `/itin/ts`, `/tv`, `/resources/kiosk`.
3. **`/frontend-design` audit pass** — scoped to `/book` + homepage hero + `/services` index. Ship recommendations as a follow-up commit OR fold into `/book` if same workstream.
4. **CTA repointing** — every "Book Appointment" link across the 33 PWA routes points at the new `/book`.
5. **Contact details** — WhatsApp `wa.me/19299331396`, email `info@advantagenys.com`, phone `+19299331396`. Confirm with CEO if any change.

When all of the above is on a single PWA feature branch, push it. Then ping CEO that you're ready for Codex.

---

## Codex review scope (when both sides ready)

The CEO wants ONE Codex pass covering both repos' booking work combined. Suggested checklist for the Codex bundle:

### Taskboard side (advantage-taskboard `staging` since `6e9aa07`)
- [ ] Multi-candidate slot routing logic (primary → secondary fallback) — race conditions
- [ ] Timezone handling (NY ↔ UTC) — DST cutover edge cases (March/November)
- [ ] Double-booking prevention (unique partial index + pre-flight check) — coverage gaps
- [ ] CORS origin echo + preview regex — escape any CORS-reflection attack vectors
- [ ] Public API rate limits — IP source resilient under Vercel proxy chain
- [ ] Brevo email path — best-effort error swallowing acceptable?
- [ ] RLS posture — service role used correctly; no `eq()` on user inputs without sanitization
- [ ] Walk-in `/checkin` recovery — any drift vs `830b481` original

### PWA side (advantagenys-pwa feature branch)
- [ ] `/book` thin-client architecture — no business logic duplication
- [ ] Inert-mode → live-mode flag (`NEXT_PUBLIC_BOOK_LIVE`) — fallback path correctness
- [ ] CORS consumer (Origin header sent correctly cross-origin)
- [ ] Error UX (409 conflict refresh, network errors)
- [ ] Floating contact widget — accessibility (ARIA labels, keyboard nav)
- [ ] CTA repointing audit — no orphan `/contact?tab=book` links left

### Cross-repo
- [ ] Contract drift between PWA's expected API shape and taskboard's actual response (slot_start/slot_end naming, etc.)
- [ ] Env var hygiene — service-role keys never in PWA bundle
- [ ] PII redaction at every layer

---

## Coordination protocol from here

1. PWA Claude builds + pushes feature branch
2. Taskboard Claude lands `fix/book-task-creation`, re-verifies, signals all-green
3. CEO bundles both diffs for Codex
4. Codex returns review
5. Both Claudes apply fixes in parallel on their branches
6. PWA Claude opens PR; Taskboard Claude opens PR (`staging → main`)
7. CEO merges both
8. iPad URL flip (`/book` → `/checkin` on app subdomain)
9. PWA flips `NEXT_PUBLIC_BOOK_LIVE=true`
10. Done.

— Taskboard Claude, 2026-04-28 (commit `0792d45`, all defects closed, all-green verified live)
