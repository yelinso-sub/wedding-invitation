-- Run in Supabase Dashboard > SQL Editor.
-- RSVP submissions are public INSERT only. Reading/deleting requires an explicitly allow-listed auth user.
create extension if not exists pgcrypto;

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  attendance text not null check (attendance in ('yes', 'no')),
  companions integer not null default 0 check (companions between 0 and 5),
  message text check (message is null or char_length(message) <= 500),
  privacy_consent boolean not null default false check (privacy_consent = true),
  privacy_notice_version text not null default '2026-10-26-v1',
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.is_wedding_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_wedding_admin() from public;
grant execute on function public.is_wedding_admin() to authenticated;

-- Anonymous guests may submit only; no public SELECT, UPDATE, or DELETE policy exists.
drop policy if exists "Anyone can submit RSVP with consent" on public.rsvps;
create policy "Anyone can submit RSVP with consent"
on public.rsvps for insert to anon, authenticated
with check (
  privacy_consent = true
  and char_length(trim(name)) between 1 and 80
  and attendance in ('yes', 'no')
  and companions between 0 and 5
  and (message is null or char_length(message) <= 500)
  and (attendance = 'yes' or companions = 0)
);

drop policy if exists "Wedding admins can read RSVPs" on public.rsvps;
create policy "Wedding admins can read RSVPs"
on public.rsvps for select to authenticated
using (public.is_wedding_admin());

drop policy if exists "Wedding admins can delete RSVPs" on public.rsvps;
create policy "Wedding admins can delete RSVPs"
on public.rsvps for delete to authenticated
using (public.is_wedding_admin());

drop policy if exists "Admins can read their own allow-list entry" on public.admin_users;
create policy "Admins can read their own allow-list entry"
on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));

-- Restrict table privileges as well as RLS. Guests do not receive SELECT/UPDATE/DELETE grants.
revoke all on public.rsvps from anon, authenticated;
grant insert (name, attendance, companions, message, privacy_consent, privacy_notice_version) on public.rsvps to anon, authenticated;
grant select, delete on public.rsvps to authenticated;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

-- ADMIN SETUP (after creating the host account in Supabase Authentication > Users):
-- Replace the UUID below with that user's ID from Authentication > Users, then run:
-- insert into public.admin_users (user_id) values ('YOUR_AUTH_USER_UUID');
-- Never place a service-role key in the browser or in this repository.
