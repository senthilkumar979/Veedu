-- Link bills to documents; track document activity

alter table public.bills
  add column if not exists document_id uuid references public.documents (id) on delete set null;

create table if not exists public.document_activities (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  action text not null check (action in (
    'uploaded', 'opened', 'downloaded', 'replaced', 'archived'
  )),
  created_at timestamptz not null default now()
);

create index if not exists document_activities_household_idx
  on public.document_activities (household_id, created_at desc);

create index if not exists document_activities_document_idx
  on public.document_activities (document_id, created_at desc);

alter table public.document_activities enable row level security;

create policy document_activities_select
  on public.document_activities for select
  using (public.is_household_member(household_id));

create policy document_activities_insert
  on public.document_activities for insert
  with check (
    public.is_household_member(household_id)
    and user_id = auth.uid()
  );

grant select, insert on public.document_activities to authenticated;
grant all on public.document_activities to service_role;
