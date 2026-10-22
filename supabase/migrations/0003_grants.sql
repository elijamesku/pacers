-- Grant table/sequence access to Supabase's anon and authenticated roles.
-- RLS policies filter rows; these GRANTs are the coarser layer underneath
-- that lets the roles see tables at all. Dropped when 0001_initial.sql ran
-- `drop schema public cascade`, which also drops default grants.

grant usage on schema public to anon, authenticated;

grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;

-- Default privileges so future tables added later get the same treatment.
alter default privileges in schema public
  grant select on tables to anon, authenticated;
alter default privileges in schema public
  grant insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;
