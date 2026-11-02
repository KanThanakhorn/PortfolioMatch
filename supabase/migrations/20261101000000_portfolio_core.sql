-- PortfolioMatch demo database. Apply through Supabase MCP before enabling database mode.
create table if not exists public.teacher_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{8,80}$'),
  title text not null check (char_length(trim(title)) between 1 and 200),
  faculty text not null check (char_length(trim(faculty)) between 1 and 200),
  year text not null check (char_length(trim(year)) between 1 and 20),
  deadline text not null check (char_length(trim(deadline)) between 1 and 100),
  requirement text not null check (char_length(trim(requirement)) between 1 and 5000),
  open_date date,
  question text not null default '' check (char_length(question) <= 500),
  is_open boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id),
  full_name text not null check (char_length(trim(full_name)) between 1 and 200),
  school text not null check (char_length(trim(school)) between 1 and 200),
  email text not null check (char_length(trim(email)) between 3 and 320),
  phone text not null check (phone ~ '^0[0-9]{9}$'),
  gpax numeric(3,2) not null check (gpax between 0 and 4),
  file_name text not null check (char_length(trim(file_name)) between 1 and 255),
  intro text not null default '' check (char_length(intro) <= 5000),
  status text not null default 'Review' check (status in ('Review', 'Approved', 'Rejected')),
  privacy_consented_at timestamptz not null,
  ai_consent boolean not null default false,
  ai_consented_at timestamptz,
  consent_version text not null default 'demo-2026-11-01',
  analysis_status text not null default 'not_requested' check (analysis_status in ('not_requested', 'pending', 'complete', 'error')),
  analysis jsonb,
  analysis_error text,
  score integer check (score between 0 and 100),
  submission_token_hash text not null unique,
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint analysis_requires_consent check (ai_consent or (analysis_status = 'not_requested' and analysis is null and score is null)),
  constraint ai_consent_timestamp_check check (ai_consent = (ai_consented_at is not null)),
  constraint complete_has_result check (analysis_status <> 'complete' or (analysis is not null and score is not null))
);

create index if not exists applications_campaign_created_idx on public.applications (campaign_id, created_at desc);
create index if not exists applications_created_idx on public.applications (created_at desc);

create or replace function public.touch_portfolio_row()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_application_decision()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    new.decided_by = auth.uid();
    new.decided_at = case when new.status = 'Review' then null else now() end;
  end if;
  return new;
end;
$$;

create trigger campaigns_touch_updated_at before update on public.campaigns
for each row execute function public.touch_portfolio_row();
create trigger applications_touch_updated_at before update on public.applications
for each row execute function public.touch_portfolio_row();
create trigger applications_set_decision before update on public.applications
for each row execute function public.set_application_decision();

alter table public.teacher_members enable row level security;
alter table public.campaigns enable row level security;
alter table public.applications enable row level security;

revoke all on public.teacher_members, public.campaigns, public.applications from anon, authenticated;
grant select on public.teacher_members to authenticated;
grant select, insert, update on public.campaigns to authenticated;
grant select on public.applications to authenticated;
grant update (status) on public.applications to authenticated;

create policy teacher_can_read_own_membership on public.teacher_members
for select to authenticated using (user_id = (select auth.uid()));

create policy teacher_can_read_campaigns on public.campaigns
for select to authenticated using (
  exists (select 1 from public.teacher_members m where m.user_id = (select auth.uid()))
);
create policy teacher_can_create_campaigns on public.campaigns
for insert to authenticated with check (
  created_by = (select auth.uid()) and
  exists (select 1 from public.teacher_members m where m.user_id = (select auth.uid()))
);
create policy teacher_can_update_campaigns on public.campaigns
for update to authenticated using (
  exists (select 1 from public.teacher_members m where m.user_id = (select auth.uid()))
) with check (
  exists (select 1 from public.teacher_members m where m.user_id = (select auth.uid()))
);

create policy teacher_can_read_applications on public.applications
for select to authenticated using (
  exists (select 1 from public.teacher_members m where m.user_id = (select auth.uid()))
);
create policy teacher_can_decide_applications on public.applications
for update to authenticated using (
  exists (select 1 from public.teacher_members m where m.user_id = (select auth.uid()))
) with check (
  exists (select 1 from public.teacher_members m where m.user_id = (select auth.uid()))
);
