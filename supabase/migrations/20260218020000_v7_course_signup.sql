-- V7: course signup (applications) + multi-format courses (online/offline selectable)

-- 1) Allow a course to be available in multiple formats.
-- We keep the legacy `format` column for backwards compatibility (filters/UI),
-- but drive signup + filtering from `formats`.

alter table if exists public.courses
  add column if not exists formats text[] not null default array['online']::text[];

-- Backfill existing rows from legacy `format`
update public.courses
set formats = array[format]::text[]
where formats is null or array_length(formats, 1) is null;

-- Constrain formats array
alter table public.courses
  drop constraint if exists courses_formats_valid;

alter table public.courses
  add constraint courses_formats_valid
  check (
    array_length(formats, 1) is not null
    and formats <@ array['online','offline']::text[]
  );

-- 2) Applications for course signup
create table if not exists public.course_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  course_id uuid not null references public.courses(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text null,
  city text null,
  selected_format text not null check (selected_format in ('online','offline')),
  comment text null,
  status text not null default 'new' check (status in ('new','in_progress','done'))
);

alter table public.course_applications enable row level security;

-- Public can create an application only for published courses
drop policy if exists "Public can apply to courses" on public.course_applications;
create policy "Public can apply to courses"
on public.course_applications
for insert
with check (
  exists (
    select 1 from public.courses c
    where c.id = course_applications.course_id
      and c.status = 'published'
  )
);

-- Admin full access to applications
drop policy if exists "Admin can manage course applications" on public.course_applications;
create policy "Admin can manage course applications"
on public.course_applications
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);
