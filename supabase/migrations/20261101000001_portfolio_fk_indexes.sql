-- Cover foreign keys used by Postgres when related auth rows change.
create index if not exists campaigns_created_by_idx on public.campaigns (created_by);
create index if not exists applications_decided_by_idx on public.applications (decided_by);
