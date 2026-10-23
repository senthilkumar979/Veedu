-- Allow creators to read a household they just inserted (before membership exists).
-- PostgREST INSERT ... RETURNING evaluates SELECT policies; without this,
-- onboarding's `.insert().select().single()` fails with RLS 42501.

create policy "households_select_creator"
  on public.households
  for select
  using (created_by = auth.uid());
