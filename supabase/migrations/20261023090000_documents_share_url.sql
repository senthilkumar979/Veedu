-- Allow documents to reference an external share link (e.g. Adobe Acrobat)
alter table public.documents
  add column if not exists share_url text;
