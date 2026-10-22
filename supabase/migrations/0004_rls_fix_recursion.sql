-- Fix RLS infinite recursion caused by policies that query group_members
-- while group_members own policy also queries group_members. Postgres
-- re-evaluates the policy for every nested read, which recurses.
--
-- The fix: route every membership check through a SECURITY DEFINER helper
-- function. The function runs as its owner (postgres) and bypasses RLS,
-- so the inner read doesn't trigger the policy again.

create or replace function public.is_group_member(gid uuid, uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = uid
  );
$$;

grant execute on function public.is_group_member(uuid, uuid)
  to anon, authenticated;

-- group_members: self-check becomes helper call
drop policy if exists group_members_select_members on public.group_members;
create policy group_members_select_members on public.group_members
  for select using (
    user_id = auth.uid()
    or public.is_group_member(group_id, auth.uid())
  );

-- groups: members-only read
drop policy if exists groups_select_members on public.groups;
create policy groups_select_members on public.groups
  for select using (
    public.is_group_member(groups.id, auth.uid())
  );

-- scheduled_runs: members read, members create, creator mutates
drop policy if exists scheduled_runs_select_members on public.scheduled_runs;
create policy scheduled_runs_select_members on public.scheduled_runs
  for select using (
    public.is_group_member(scheduled_runs.group_id, auth.uid())
  );

drop policy if exists scheduled_runs_insert_members on public.scheduled_runs;
create policy scheduled_runs_insert_members on public.scheduled_runs
  for insert with check (
    created_by = auth.uid()
    and public.is_group_member(scheduled_runs.group_id, auth.uid())
  );

-- rsvps: group members read
drop policy if exists rsvps_select_group_members on public.rsvps;
create policy rsvps_select_group_members on public.rsvps
  for select using (
    exists (
      select 1 from public.scheduled_runs sr
      where sr.id = rsvps.run_id
        and public.is_group_member(sr.group_id, auth.uid())
    )
  );
