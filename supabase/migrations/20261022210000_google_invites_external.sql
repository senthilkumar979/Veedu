-- Google sync identity + household email invites

alter table public.calendar_events
  add column if not exists external_source text,
  add column if not exists external_id text;

alter table public.contacts
  add column if not exists external_source text,
  add column if not exists external_id text;

create unique index if not exists calendar_events_external_uidx
  on public.calendar_events (household_id, external_source, external_id)
  where external_source is not null and external_id is not null;

create unique index if not exists contacts_external_uidx
  on public.contacts (household_id, external_source, external_id)
  where external_source is not null and external_id is not null;

create table if not exists public.google_connections (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  google_email text,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scopes text[] not null default '{}',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.google_connections enable row level security;

create policy "google_connections_select_own"
  on public.google_connections for select
  using (user_id = auth.uid());

create policy "google_connections_insert_own"
  on public.google_connections for insert
  with check (user_id = auth.uid());

create policy "google_connections_update_own"
  on public.google_connections for update
  using (user_id = auth.uid());

create policy "google_connections_delete_own"
  on public.google_connections for delete
  using (user_id = auth.uid());

create table if not exists public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  email text not null,
  token text not null unique,
  invited_by uuid not null references public.profiles (id),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  accepted_by uuid references public.profiles (id)
);

create index if not exists household_invites_household_idx
  on public.household_invites (household_id);

alter table public.household_invites enable row level security;

create policy "invites_select_member"
  on public.household_invites for select
  using (
    public.is_household_member(household_id)
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy "invites_insert_member"
  on public.household_invites for insert
  with check (public.is_household_member(household_id) and invited_by = auth.uid());

create policy "invites_update_member_or_invitee"
  on public.household_invites for update
  using (
    public.is_household_member(household_id)
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

grant select, insert, update, delete on public.google_connections to authenticated;
grant select, insert, update on public.household_invites to authenticated;
grant all on public.google_connections to service_role;
grant all on public.household_invites to service_role;
