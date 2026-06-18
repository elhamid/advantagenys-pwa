-- Anti-spam dedupe support for the recruiting funnel.
-- Adds a stable per-applicant fingerprint (sha256 of normalized email+phone)
-- so duplicate / resubmit submissions can be detected deterministically.
-- Nullable + indexed; existing rows stay valid.
--
-- Timestamp 20260618123000 chosen to sit AFTER the taskboard
-- 20260618120000_recruiting_apply_notification migration (avoids a shared-ledger
-- prefix collision). Fully idempotent (if not exists) — the column + index were
-- already applied directly to staging + prod, so re-running this is a no-op.

alter table public.recruiting_applications
  add column if not exists applicant_fingerprint text;

create index if not exists idx_recruiting_applications_fingerprint
  on public.recruiting_applications (applicant_fingerprint);
