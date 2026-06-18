-- Anti-spam dedupe support for the recruiting funnel.
-- Adds a stable per-applicant fingerprint (sha256 of normalized email+phone)
-- so exact-duplicate submissions can be detected deterministically.
-- Nullable + indexed; existing rows (there are none in prod yet) stay valid.

alter table public.recruiting_applications
  add column if not exists applicant_fingerprint text;

create index if not exists idx_recruiting_applications_fingerprint
  on public.recruiting_applications (applicant_fingerprint);
