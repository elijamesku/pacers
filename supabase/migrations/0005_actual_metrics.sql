-- Actual (as-run) metrics on a workout, separate from planned.
-- Keep the existing distance_mi / pace_sec_per_mi as PLANNED values.
-- These new columns capture what actually happened.

alter table public.workouts
  add column if not exists actual_distance_mi numeric,
  add column if not exists actual_duration_sec integer,
  add column if not exists actual_pace_sec_per_mi integer,
  add column if not exists completed_at timestamptz;

-- Backfill: existing rows with completed=true get their planned numbers
-- copied to actuals so the UI's "Completed" column isn't blank.
update public.workouts
set
  actual_distance_mi = distance_mi,
  actual_pace_sec_per_mi = pace_sec_per_mi,
  actual_duration_sec = case
    when pace_sec_per_mi is not null then round(distance_mi * pace_sec_per_mi)::int
    else null
  end,
  completed_at = coalesce(completed_at, (date::timestamptz + interval '7 hours'))
where completed = true
  and actual_distance_mi is null;
