-- V6: courses module (admin CRUD + public listing)

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft','published')),
  format text not null default 'online' check (format in ('online','offline')),
  price_type text not null default 'free' check (price_type in ('free','paid')),
  price numeric null,
  location text null,
  starts_at date null,
  ends_at date null
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_courses on public.courses;
create trigger set_updated_at_courses
before update on public.courses
for each row execute function public.set_updated_at();

alter table public.courses enable row level security;

-- Public can view only published courses
drop policy if exists "Public can view published courses" on public.courses;
create policy "Public can view published courses"
on public.courses
for select
using (status = 'published');

-- Admin full access
drop policy if exists "Admin can manage courses" on public.courses;
create policy "Admin can manage courses"
on public.courses
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
