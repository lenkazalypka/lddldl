create extension if not exists pgcrypto;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1 from public.profiles p where p.id = user_id and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'app_role' and n.nspname = 'public'
  ) then
    create type public.app_role as enum ('user', 'admin');
  end if;
end $$;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  updated_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;
revoke all on public.user_roles from anon, authenticated, public;
grant usage on schema public to supabase_auth_admin;
grant select on public.user_roles to supabase_auth_admin;

drop policy if exists "Allow auth admin to read user roles" on public.user_roles;
create policy "Allow auth admin to read user roles"
on public.user_roles
for select
to supabase_auth_admin
using (true);

insert into public.user_roles (user_id, role)
select id, case when role = 'admin' then 'admin'::public.app_role else 'user'::public.app_role end
from public.profiles
on conflict (user_id) do update set role = excluded.role, updated_at = now();

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  r public.app_role;
begin
  select role into r from public.user_roles where user_id = (event->>'user_id')::uuid;
  claims := coalesce(event->'claims', '{}'::jsonb);
  claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(r, 'user'::public.app_role)));
  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from anon, authenticated, public;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user')
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.set_user_role(target_user uuid, new_role public.app_role)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'forbidden';
  end if;

  update public.user_roles set role = new_role, updated_at = now() where user_id = target_user;
  if not found then
    insert into public.user_roles (user_id, role) values (target_user, new_role);
  end if;

  update public.profiles set role = new_role::text, updated_at = now() where id = target_user;
end;
$$;

grant execute on function public.set_user_role(uuid, public.app_role) to authenticated;
revoke execute on function public.set_user_role(uuid, public.app_role) from anon;
