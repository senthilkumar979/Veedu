-- Veedu foundation schema + RLS
-- Apply via Supabase SQL editor or `supabase db push`

create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  timezone text not null default 'Europe/Brussels',
  currency text not null default 'EUR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Households
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  home_location text,
  parents_location text,
  timezone text not null default 'Europe/Brussels',
  currency text not null default 'EUR',
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  status text not null check (status in ('active', 'invited', 'removed')) default 'active',
  display_name text not null default '',
  created_at timestamptz not null default now(),
  unique (household_id, user_id)
);

-- Helper: is household member
create or replace function public.is_household_member(hid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = hid
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.can_access_record(
  hid uuid,
  visibility text,
  owner_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_household_member(hid)
    and (
      visibility = 'shared'
      or owner_id = auth.uid()
      or owner_id is null
    );
$$;

-- Feature tables
create table if not exists public.task_categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  description text,
  category_id uuid references public.task_categories (id) on delete set null,
  category text,
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'todo' check (status in ('todo','in_progress','done','cancelled')),
  owner_id uuid references public.profiles (id),
  due_date date,
  visibility text not null default 'shared' check (visibility in ('shared','private')),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  location text,
  notes text,
  participants text[] not null default '{}',
  visibility text not null default 'shared' check (visibility in ('shared','private')),
  owner_id uuid references public.profiles (id),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  provider text,
  amount numeric(12,2) not null,
  currency text not null default 'EUR',
  due_date date not null,
  frequency text not null default 'monthly',
  category text,
  status text not null default 'upcoming',
  owner_id uuid references public.profiles (id),
  visibility text not null default 'shared' check (visibility in ('shared','private')),
  notes text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  provider text,
  amount numeric(12,2) not null,
  currency text not null default 'EUR',
  billing_frequency text not null default 'monthly',
  next_renewal date not null,
  category text,
  status text not null default 'active',
  owner_id uuid references public.profiles (id),
  visibility text not null default 'shared' check (visibility in ('shared','private')),
  payment_reference text,
  notes text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.document_categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  category_id uuid references public.document_categories (id) on delete set null,
  category text,
  status text not null default 'valid',
  issued_at date,
  expires_at date,
  file_path text,
  file_name text,
  mime_type text,
  owner_id uuid references public.profiles (id),
  visibility text not null default 'shared' check (visibility in ('shared','private')),
  notes text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

-- Accounts: reference only — NEVER store passwords/PINs/CVVs/OTPs
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  institution text not null,
  nickname text not null,
  account_type text not null,
  reference text,
  last_four text check (last_four is null or last_four ~ '^\d{4}$'),
  owner_id uuid references public.profiles (id),
  visibility text not null default 'shared' check (visibility in ('shared','private')),
  notes text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  category text not null,
  notes text,
  owner_id uuid references public.profiles (id),
  visibility text not null default 'shared' check (visibility in ('shared','private')),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  address text,
  website text,
  rating numeric(2,1),
  category text not null,
  tags text[] not null default '{}',
  notes text,
  visited boolean not null default false,
  owner_id uuid references public.profiles (id),
  visibility text not null default 'shared' check (visibility in ('shared','private')),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.important_dates (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  date date not null,
  category text not null,
  notes text,
  reminder_days int,
  owner_id uuid references public.profiles (id),
  visibility text not null default 'shared' check (visibility in ('shared','private')),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.home_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  category text not null,
  purchased_at date,
  warranty_until date,
  notes text,
  owner_id uuid references public.profiles (id),
  visibility text not null default 'shared' check (visibility in ('shared','private')),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.home_services (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  provider text,
  last_serviced_at date,
  next_due_at date,
  notes text,
  owner_id uuid references public.profiles (id),
  visibility text not null default 'shared' check (visibility in ('shared','private')),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  priority text not null default 'normal' check (priority in ('critical','high','normal','low')),
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Profile bootstrap on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.task_categories enable row level security;
alter table public.tasks enable row level security;
alter table public.calendar_events enable row level security;
alter table public.bills enable row level security;
alter table public.subscriptions enable row level security;
alter table public.document_categories enable row level security;
alter table public.documents enable row level security;
alter table public.accounts enable row level security;
alter table public.contacts enable row level security;
alter table public.places enable row level security;
alter table public.important_dates enable row level security;
alter table public.home_items enable row level security;
alter table public.home_services enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());
create policy "profiles_select_household_peers" on public.profiles for select using (
  exists (
    select 1 from public.household_members me
    join public.household_members peer on peer.household_id = me.household_id
    where me.user_id = auth.uid() and peer.user_id = profiles.id and me.status = 'active' and peer.status = 'active'
  )
);

-- Households
create policy "households_select_member" on public.households for select using (public.is_household_member(id));
create policy "households_insert_authenticated" on public.households for insert with check (created_by = auth.uid());
create policy "households_update_member" on public.households for update using (public.is_household_member(id));

-- Members
create policy "members_select" on public.household_members for select using (public.is_household_member(household_id) or user_id = auth.uid());
create policy "members_insert" on public.household_members for insert with check (
  user_id = auth.uid() or public.is_household_member(household_id)
);
create policy "members_update" on public.household_members for update using (public.is_household_member(household_id));

-- Generic visibility policies for feature tables
do $$
declare
  t text;
begin
  foreach t in array array[
    'task_categories','tasks','calendar_events','bills','subscriptions',
    'document_categories','documents','accounts','contacts','places',
    'important_dates','home_items','home_services'
  ]
  loop
    execute format('create policy %I on public.%I for select using (
      case when %L in (''task_categories'',''document_categories'') then public.is_household_member(household_id)
      else public.can_access_record(household_id, visibility, owner_id) end
    )', t || '_select', t, t);
    execute format('create policy %I on public.%I for insert with check (public.is_household_member(household_id) and created_by = auth.uid())', t || '_insert', t);
    execute format('create policy %I on public.%I for update using (
      case when %L in (''task_categories'',''document_categories'') then public.is_household_member(household_id)
      else public.can_access_record(household_id, visibility, owner_id) end
    )', t || '_update', t, t);
    execute format('create policy %I on public.%I for delete using (
      case when %L in (''task_categories'',''document_categories'') then public.is_household_member(household_id)
      else public.can_access_record(household_id, visibility, owner_id) end
    )', t || '_delete', t, t);
  end loop;
end $$;

-- Fix policies for tables without visibility/owner/created_by
drop policy if exists task_categories_select on public.task_categories;
drop policy if exists task_categories_insert on public.task_categories;
drop policy if exists task_categories_update on public.task_categories;
drop policy if exists task_categories_delete on public.task_categories;
create policy task_categories_select on public.task_categories for select using (public.is_household_member(household_id));
create policy task_categories_insert on public.task_categories for insert with check (public.is_household_member(household_id));
create policy task_categories_update on public.task_categories for update using (public.is_household_member(household_id));
create policy task_categories_delete on public.task_categories for delete using (public.is_household_member(household_id));

drop policy if exists document_categories_select on public.document_categories;
drop policy if exists document_categories_insert on public.document_categories;
drop policy if exists document_categories_update on public.document_categories;
drop policy if exists document_categories_delete on public.document_categories;
create policy document_categories_select on public.document_categories for select using (public.is_household_member(household_id));
create policy document_categories_insert on public.document_categories for insert with check (public.is_household_member(household_id));
create policy document_categories_update on public.document_categories for update using (public.is_household_member(household_id));
create policy document_categories_delete on public.document_categories for delete using (public.is_household_member(household_id));

create policy notifications_select on public.notifications for select using (user_id = auth.uid());
create policy notifications_update on public.notifications for update using (user_id = auth.uid());
create policy notifications_insert on public.notifications for insert with check (public.is_household_member(household_id));

-- Storage bucket for documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "documents_storage_select" on storage.objects
  for select using (
    bucket_id = 'documents'
    and public.is_household_member(((storage.foldername(name))[1])::uuid)
  );

create policy "documents_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and public.is_household_member(((storage.foldername(name))[1])::uuid)
  );

create policy "documents_storage_update" on storage.objects
  for update using (
    bucket_id = 'documents'
    and public.is_household_member(((storage.foldername(name))[1])::uuid)
  );

create policy "documents_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'documents'
    and public.is_household_member(((storage.foldername(name))[1])::uuid)
  );

-- Path convention: households/{household_id}/documents/{document_id}/filename
-- Note: foldername[1] assumes path starts with household_id; adjust when wiring uploads
-- Prefer: split_part(name, '/', 2) when using households/{id}/...
