-- Multiple parent places (label + city), up to two parents in the app UI.
alter table public.households
  add column if not exists parents_locations jsonb not null default '[]'::jsonb;

comment on column public.households.parents_locations is
  'JSON array of { "label": "Amma", "place": "Dindigul" }. parents_location kept for legacy.';

-- Backfill from legacy single parents_location when array is empty.
update public.households
set parents_locations = jsonb_build_array(
  jsonb_build_object('label', 'Parents', 'place', parents_location)
)
where coalesce(parents_location, '') <> ''
  and (
    parents_locations is null
    or parents_locations = '[]'::jsonb
  );
