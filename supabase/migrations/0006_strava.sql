-- Strava OAuth connection + activity ID on workouts.

create table if not exists public.strava_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  athlete_id bigint not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  scope text not null,
  created_at timestamptz not null default now(),
  last_synced_at timestamptz
);

alter table public.workouts
  add column if not exists strava_activity_id bigint;

create unique index if not exists workouts_user_strava_activity_idx
  on public.workouts (user_id, strava_activity_id)
  where strava_activity_id is not null;

-- RLS
alter table public.strava_connections enable row level security;

drop policy if exists strava_connections_own_select on public.strava_connections;
create policy strava_connections_own_select on public.strava_connections
  for select using (user_id = auth.uid());

drop policy if exists strava_connections_own_insert on public.strava_connections;
create policy strava_connections_own_insert on public.strava_connections
  for insert with check (user_id = auth.uid());

drop policy if exists strava_connections_own_update on public.strava_connections;
create policy strava_connections_own_update on public.strava_connections
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists strava_connections_own_delete on public.strava_connections;
create policy strava_connections_own_delete on public.strava_connections
  for delete using (user_id = auth.uid());

-- Grants (0003_grants.sql pattern)
grant select, insert, update, delete on public.strava_connections to authenticated;
