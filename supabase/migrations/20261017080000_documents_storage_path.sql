-- Align documents Storage RLS with path convention:
-- households/{household_id}/documents/{document_id}/{filename}

create or replace function public.storage_document_household_id(object_name text)
returns uuid
language sql
immutable
as $$
  select case
    when split_part(object_name, '/', 1) = 'households'
      and split_part(object_name, '/', 2) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then split_part(object_name, '/', 2)::uuid
    else null
  end;
$$;

drop policy if exists "documents_storage_select" on storage.objects;
drop policy if exists "documents_storage_insert" on storage.objects;
drop policy if exists "documents_storage_update" on storage.objects;
drop policy if exists "documents_storage_delete" on storage.objects;

create policy "documents_storage_select" on storage.objects
  for select using (
    bucket_id = 'documents'
    and public.storage_document_household_id(name) is not null
    and public.is_household_member(public.storage_document_household_id(name))
  );

create policy "documents_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and public.storage_document_household_id(name) is not null
    and public.is_household_member(public.storage_document_household_id(name))
  );

create policy "documents_storage_update" on storage.objects
  for update using (
    bucket_id = 'documents'
    and public.storage_document_household_id(name) is not null
    and public.is_household_member(public.storage_document_household_id(name))
  );

create policy "documents_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'documents'
    and public.storage_document_household_id(name) is not null
    and public.is_household_member(public.storage_document_household_id(name))
  );
