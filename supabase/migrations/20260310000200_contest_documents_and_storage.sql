alter table public.contests add column if not exists submission_email text;
alter table public.contests add column if not exists results_published boolean not null default false;
alter table public.contests add column if not exists results_date timestamptz;
alter table public.contests add column if not exists phase text default 'draft';
alter table public.contests add column if not exists results_text text;

alter table public.contest_photos add column if not exists work_title text;
alter table public.contest_photos add column if not exists place integer;
alter table public.contest_photos add column if not exists nomination text;

drop policy if exists "Admins can view all works" on public.contest_photos;
create policy "Admins can view all works"
on public.contest_photos
for select
using (public.is_admin(auth.uid()));

create table if not exists public.contest_documents (
  work_id uuid primary key references public.contest_photos(id) on delete cascade,
  access_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  certificate_number text unique,
  certificate_path text,
  issued_at timestamptz,
  award text check (award in ('participant', 'prize', 'winner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_contest_documents_updated_at on public.contest_documents;
create trigger set_contest_documents_updated_at
before update on public.contest_documents
for each row execute function public.set_updated_at();

alter table public.contest_documents enable row level security;

drop policy if exists "Admins manage contest documents" on public.contest_documents;
create policy "Admins manage contest documents"
on public.contest_documents
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

insert into storage.buckets (id, name, public)
values ('contest-photos', 'contest-photos', false), ('certificates', 'certificates', false)
on conflict (id) do update set public = excluded.public;

alter table storage.objects enable row level security;

drop policy if exists "Admin read contest photos objects" on storage.objects;
create policy "Admin read contest photos objects"
on storage.objects for select to authenticated
using (bucket_id = 'contest-photos' and public.is_admin(auth.uid()));

drop policy if exists "Admin insert contest photos objects" on storage.objects;
create policy "Admin insert contest photos objects"
on storage.objects for insert to authenticated
with check (bucket_id = 'contest-photos' and public.is_admin(auth.uid()));

drop policy if exists "Admin update contest photos objects" on storage.objects;
create policy "Admin update contest photos objects"
on storage.objects for update to authenticated
using (bucket_id = 'contest-photos' and public.is_admin(auth.uid()))
with check (bucket_id = 'contest-photos' and public.is_admin(auth.uid()));

drop policy if exists "Admin delete contest photos objects" on storage.objects;
create policy "Admin delete contest photos objects"
on storage.objects for delete to authenticated
using (bucket_id = 'contest-photos' and public.is_admin(auth.uid()));

drop policy if exists "Admin read certificates objects" on storage.objects;
create policy "Admin read certificates objects"
on storage.objects for select to authenticated
using (bucket_id = 'certificates' and public.is_admin(auth.uid()));

drop policy if exists "Admin insert certificates objects" on storage.objects;
create policy "Admin insert certificates objects"
on storage.objects for insert to authenticated
with check (bucket_id = 'certificates' and public.is_admin(auth.uid()));

drop policy if exists "Admin update certificates objects" on storage.objects;
create policy "Admin update certificates objects"
on storage.objects for update to authenticated
using (bucket_id = 'certificates' and public.is_admin(auth.uid()))
with check (bucket_id = 'certificates' and public.is_admin(auth.uid()));

drop policy if exists "Admin delete certificates objects" on storage.objects;
create policy "Admin delete certificates objects"
on storage.objects for delete to authenticated
using (bucket_id = 'certificates' and public.is_admin(auth.uid()));
