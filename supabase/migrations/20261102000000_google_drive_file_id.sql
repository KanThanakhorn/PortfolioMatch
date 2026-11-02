-- The PDF lives in a private Google Drive account. Only its opaque file ID is stored here.
alter table public.applications
  add column drive_file_id text unique
  check (drive_file_id is null or drive_file_id ~ '^[A-Za-z0-9_-]{10,200}$');
