create extension if not exists pgcrypto with schema extensions;

create table if not exists public.recruiting_applications (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique,
  role text not null,
  hiring_lane text not null,
  referral_code text,
  partner_tag text not null,
  status text not null default 'new',
  score numeric,
  score_label text,
  score_explanation text,
  score_breakdown jsonb not null default '{}'::jsonb,
  candidate jsonb not null default '{}'::jsonb,
  resume jsonb not null default '{}'::jsonb,
  compensation jsonb not null default '{}'::jsonb,
  work_sample jsonb not null default '{}'::jsonb,
  ai_use jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recruiting_applications enable row level security;

revoke all on public.recruiting_applications from anon, authenticated;

create index if not exists idx_recruiting_applications_submitted_at
  on public.recruiting_applications (submitted_at desc);

create index if not exists idx_recruiting_applications_partner_tag
  on public.recruiting_applications (partner_tag);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recruiting-resumes',
  'recruiting-resumes',
  false,
  5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
