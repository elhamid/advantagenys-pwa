-- Recruiting intake quality upgrade: proof-of-inspection artifacts and per-candidate
-- verification code. Additive only — existing rows keep their defaults.

alter table public.recruiting_applications
  add column if not exists proof jsonb not null default '{}'::jsonb;

alter table public.recruiting_applications
  add column if not exists verification_code text;

-- Private bucket for candidate proof uploads (annotated mobile/desktop screenshots).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recruiting-proof',
  'recruiting-proof',
  false,
  10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
