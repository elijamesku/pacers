-- Pacers initial schema (fresh project).
-- Resets public, then creates everything in dependency order:
-- tables -> rls enable -> policies -> indexes -> views -> functions/triggers.

drop schema if exists public cascade;
create schema public;
grant all on schema public to postgres, anon, authenticated, service_role;

create extension if not exists "uuid-ossp";

-- ========================================================================
-- Tables
-- ========================================================================

create table public.profiles (
  id                      uuid primary key references auth.users on delete cascade,
  handle                  text unique not null,
  name                    text not null,
  avatar_color            text default '#0062CC',
  home_area               text,
  typical_pace            text,
  bio                     text,
  running_since_year      int,
  prefers_metric          boolean default false,
  footprint_visibility    text default 'only_me'
                          check (footprint_visibility in ('only_me','friends','public')),
  shoe_rotation           text[],
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create table public.workouts (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  date              date not null,
  type              text not null
                    check (type in ('easy','long','tempo','intervals','race','recovery','cross','rest')),
  distance_mi       numeric not null default 0,
  pace_sec_per_mi   int,
  notes             text,
  completed         boolean default false,
  rpe               int check (rpe between 1 and 10),
  felt              text check (felt in ('great','ok','flat','bad')),
  plan_workout_id   uuid,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table public.groups (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  description   text,
  city          text,
  is_private    boolean default true,
  created_by    uuid not null references public.profiles(id),
  created_at    timestamptz default now()
);

create table public.group_members (
  group_id    uuid references public.groups(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  role        text default 'member' check (role in ('member','admin')),
  joined_at   timestamptz default now(),
  primary key (group_id, user_id)
);

create table public.scheduled_runs (
  id                uuid primary key default uuid_generate_v4(),
  group_id          uuid not null references public.groups(id) on delete cascade,
  start_at          timestamptz not null,
  distance_mi       numeric not null,
  pace_sec_per_mi   int not null,
  location_name     text not null,
  lat               double precision,
  lng               double precision,
  route_name        text,
  notes             text,
  created_by        uuid not null references public.profiles(id),
  created_at        timestamptz default now()
);

create table public.rsvps (
  run_id      uuid references public.scheduled_runs(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  status      text not null check (status in ('going','maybe','declined')),
  updated_at  timestamptz default now(),
  primary key (run_id, user_id)
);

create table public.races (
  id                 text primary key,
  name               text not null,
  date               date not null,
  city               text not null,
  state              text not null,
  lat                double precision,
  lng                double precision,
  distances          text[] not null,
  course_gpx_url     text,
  elevation_gain_ft  int,
  difficulty_score   int,
  registration_url   text,
  affiliate_url      text,
  description        text,
  website            text,
  created_at         timestamptz default now()
);

create table public.race_goals (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  race_id              text not null references public.races(id),
  distance             text not null,
  goal_time_sec        int,
  plan_id              uuid,
  cohort_visibility    text default 'cohort_only'
                       check (cohort_visibility in ('none','cohort_only','public')),
  joined_at            timestamptz default now(),
  status               text default 'training'
                       check (status in ('training','tapering','completed','dnf','withdrawn'))
);

create table public.training_plans (
  id                        uuid primary key default uuid_generate_v4(),
  user_id                   uuid not null references public.profiles(id) on delete cascade,
  goal_kind                 text not null
                            check (goal_kind in ('race','base_building','consistency','maintenance','fitness')),
  goal_race_id              text references public.races(id),
  goal_distance             text,
  goal_time_sec             int,
  goal_target_weekly_mi     numeric,
  goal_target_days_per_week int,
  start_date                date not null,
  end_date                  date not null,
  rationale                 text,
  revision                  int default 1,
  active                    boolean default true,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

create table public.planned_workouts (
  id                uuid primary key default uuid_generate_v4(),
  plan_id           uuid not null references public.training_plans(id) on delete cascade,
  user_id           uuid not null references public.profiles(id) on delete cascade,
  date              date not null,
  type              text not null
                    check (type in ('easy','long','tempo','intervals','race','recovery','cross','rest')),
  distance_mi       numeric,
  pace_sec_per_mi   int,
  notes             text,
  is_keystone       boolean default false
);

create table public.follows (
  follower_id   uuid references public.profiles(id) on delete cascade,
  followee_id   uuid references public.profiles(id) on delete cascade,
  created_at    timestamptz default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

-- ========================================================================
-- RLS enable
-- ========================================================================

alter table public.profiles          enable row level security;
alter table public.workouts          enable row level security;
alter table public.groups            enable row level security;
alter table public.group_members     enable row level security;
alter table public.scheduled_runs    enable row level security;
alter table public.rsvps             enable row level security;
alter table public.races             enable row level security;
alter table public.race_goals        enable row level security;
alter table public.training_plans    enable row level security;
alter table public.planned_workouts  enable row level security;
alter table public.follows           enable row level security;

-- ========================================================================
-- Policies
-- ========================================================================

-- profiles: public read, self-write
create policy profiles_select_public on public.profiles
  for select using (true);
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id);
create policy profiles_insert_self on public.profiles
  for insert with check (auth.uid() = id);

-- workouts: owner-only
create policy workouts_select_own on public.workouts
  for select using (auth.uid() = user_id);
create policy workouts_cud_own on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- groups: members read; creator writes
create policy groups_select_members on public.groups
  for select using (
    exists (
      select 1 from public.group_members
      where group_id = groups.id and user_id = auth.uid()
    )
  );
create policy groups_insert_authed on public.groups
  for insert with check (auth.uid() = created_by);
create policy groups_update_creator on public.groups
  for update using (auth.uid() = created_by);
create policy groups_delete_creator on public.groups
  for delete using (auth.uid() = created_by);

-- group_members: a user can read memberships of groups they belong to
create policy group_members_select_members on public.group_members
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id and gm.user_id = auth.uid()
    )
  );
create policy group_members_insert_self on public.group_members
  for insert with check (user_id = auth.uid());
create policy group_members_delete_self on public.group_members
  for delete using (user_id = auth.uid());

-- scheduled_runs: group members read; members create; creator updates/deletes
create policy scheduled_runs_select_members on public.scheduled_runs
  for select using (
    exists (
      select 1 from public.group_members
      where group_id = scheduled_runs.group_id and user_id = auth.uid()
    )
  );
create policy scheduled_runs_insert_members on public.scheduled_runs
  for insert with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.group_members
      where group_id = scheduled_runs.group_id and user_id = auth.uid()
    )
  );
create policy scheduled_runs_update_creator on public.scheduled_runs
  for update using (created_by = auth.uid());
create policy scheduled_runs_delete_creator on public.scheduled_runs
  for delete using (created_by = auth.uid());

-- rsvps: group members read; self upsert
create policy rsvps_select_group_members on public.rsvps
  for select using (
    exists (
      select 1
      from public.scheduled_runs sr
      join public.group_members gm on gm.group_id = sr.group_id
      where sr.id = rsvps.run_id and gm.user_id = auth.uid()
    )
  );
create policy rsvps_insert_self on public.rsvps
  for insert with check (user_id = auth.uid());
create policy rsvps_update_self on public.rsvps
  for update using (user_id = auth.uid());
create policy rsvps_delete_self on public.rsvps
  for delete using (user_id = auth.uid());

-- races: public read (write via service role only)
create policy races_select_public on public.races
  for select using (true);

-- race_goals: owner-only (cohort aggregates go through the view below)
create policy race_goals_select_own on public.race_goals
  for select using (user_id = auth.uid());
create policy race_goals_cud_own on public.race_goals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- training_plans: owner-only
create policy training_plans_select_own on public.training_plans
  for select using (user_id = auth.uid());
create policy training_plans_cud_own on public.training_plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- planned_workouts: owner-only
create policy planned_workouts_select_own on public.planned_workouts
  for select using (user_id = auth.uid());
create policy planned_workouts_cud_own on public.planned_workouts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- follows: only the follower sees their own rows (hidden graph)
create policy follows_select_own on public.follows
  for select using (follower_id = auth.uid());
create policy follows_insert_self on public.follows
  for insert with check (follower_id = auth.uid());
create policy follows_delete_self on public.follows
  for delete using (follower_id = auth.uid());

-- ========================================================================
-- Indexes
-- ========================================================================

create index workouts_user_date_idx          on public.workouts(user_id, date);
create index scheduled_runs_group_start_idx  on public.scheduled_runs(group_id, start_at);
create index races_date_idx                  on public.races(date);
create index race_goals_race_idx             on public.race_goals(race_id);
create index race_goals_user_idx             on public.race_goals(user_id);
create index planned_workouts_user_date_idx  on public.planned_workouts(user_id, date);
create index planned_workouts_plan_date_idx  on public.planned_workouts(plan_id, date);

-- ========================================================================
-- Cohort pace-band view (aggregates only — no row-level exposure)
-- ========================================================================

create or replace view public.race_cohort_pace_bands as
select
  rg.race_id,
  width_bucket(coalesce(rg.goal_time_sec, 0), 0, 36000, 10) as time_bucket,
  count(*)::int as runner_count
from public.race_goals rg
where rg.cohort_visibility in ('cohort_only','public')
  and rg.status in ('training','tapering')
group by rg.race_id, time_bucket;

grant select on public.race_cohort_pace_bands to authenticated, anon;

-- ========================================================================
-- Auth user -> profile trigger
-- ========================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_handle text;
  candidate   text;
  i           int := 0;
begin
  base_handle := coalesce(
    new.raw_user_meta_data->>'handle',
    regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')
  );
  if base_handle = '' or base_handle is null then
    base_handle := 'runner';
  end if;
  candidate := base_handle;
  while exists (select 1 from public.profiles where handle = candidate) loop
    i := i + 1;
    candidate := base_handle || i::text;
  end loop;
  insert into public.profiles (id, handle, name)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data->>'name', candidate)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========================================================================
-- updated_at touch trigger
-- ========================================================================

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger touch_workouts_updated_at
  before update on public.workouts
  for each row execute function public.touch_updated_at();

create trigger touch_training_plans_updated_at
  before update on public.training_plans
  for each row execute function public.touch_updated_at();
