# Pacers

> Your training. Your people. One place.

A shared training workspace for runners.

This README is written for agents (and humans picking the project up cold).
Read it fully before changing anything — several design decisions below are
deliberate, were already relitigated once, and look wrong at first glance.

---

## 1. Vision — what we're building

**Running tools organize training around the athlete.** TrainingPeaks is
athlete-and-coach. Strava is athlete-and-feed. Garmin is athlete-and-device.

**Pacers organizes training around the people who train together.**

The core insight: most committed runners already train with a small group of
real friends. Those groups coordinate over group chats and screenshots of
Garmin calendars. That's the hole we fill.

The product is a shared workspace with three layers:

1. **The calendar is the core.** Everyone keeps their own training plan.
   Joining a group doesn't put anyone on a shared plan.
2. **Groups make it collaborative.** You see your crew's week next to yours,
   schedule runs together, RSVP, meet at the trailhead.
3. **Footprint makes it personal.** A visual history of every mile you've
   ever run, with privacy taken seriously (home-area masking, start/end
   masking, visibility controls).

The thing that could make it defensible is **training overlap**: when your
easy 8 matches a friend's easy 10 at a similar pace tomorrow morning,
Pacers notices and suggests the shared miles. Not just "see each other's
workouts" (Strava already does that) — actively coordinate the overlap.

### Positioning line
*Your training. Your people. One place.*

### Growth loop
A runner invites two friends they already run with. Those three get value
immediately — shared calendar, RSVP, overlap — without needing anyone
outside the trio to join. No marketplace cold-start problem.

### Pricing hypothesis (not implemented yet)
- **Free:** personal calendar, group membership, scheduling, basic Footprint.
- **Pro ($5.99/mo):** unlimited groups, advanced scheduling, overlap
  suggestions, expanded Footprint customization, training insights.

Group chat and shared calendars are already free (iMessage, Google Calendar).
Pacers only earns a sub if coordinating training is *noticeably easier* than
cobbling tools together. That bar — "noticeably easier" — is the product bar
for every decision.

### Explicitly out of scope (for now)
- A public feed / social graph with strangers. The point is private groups.
- Training plan generation / AI coaching. Later, maybe.
- Being a Strava replacement. We *import* from Strava/Garmin eventually, not
  compete with them.
- A matching marketplace to find new running partners. The pivoted-from
  "running Tinder" idea — abandoned on purpose.

---

## 2. Design principles

1. **The calendar is the product.** Every feature either lives on the
   calendar or feeds into it. If it doesn't, question it.
2. **Groups are small and private by default.** 2–8 people. Group chat
   dynamics, not community dynamics.
3. **Overlap > visibility.** Showing a friend's workout is table stakes.
   Suggesting the shared miles is the differentiator.
4. **Privacy is non-negotiable.** Home-area and start/end masking apply
   regardless of visibility setting. Default visibility is "only me".
5. **Mobile-first.** Runners check training on their phone before a run.
   The bottom nav exists for a reason.
6. **Boring tech, surprising product.** Next.js, Postgres, a map library.
   No novel infra. The surprise is in the coordination, not the stack.

---

## 3. What's built (as of this commit)

Working, verified in a browser, mobile layout confirmed.

### Pages

| Route | File | What it does |
|-------|------|--------------|
| `/` | [app/page.tsx](app/page.tsx) | Dashboard: week strip, group mileage, upcoming-together, overlap suggestions, this week's plan |
| `/calendar` | [app/calendar/page.tsx](app/calendar/page.tsx) | Personal training calendar, month grid, click a day → see/add workouts |
| `/groups` | [app/groups/page.tsx](app/groups/page.tsx) | List of your groups |
| `/groups/[id]` | [app/groups/[id]/page.tsx](app/groups/[id]/page.tsx) | Group detail: shared calendar (members × days), upcoming scheduled runs, member list |
| `/runs/[id]` | [app/runs/[id]/page.tsx](app/runs/[id]/page.tsx) | Scheduled run detail: Leaflet map, 3-state RSVP, going/maybe lists, meeting point gated behind RSVP |
| `/footprint` | [app/footprint/page.tsx](app/footprint/page.tsx) | Lifetime running map with home-area masking |
| `/profile` | [app/profile/page.tsx](app/profile/page.tsx) | Profile + Footprint visibility settings |

### Components

- [components/Nav.tsx](components/Nav.tsx) — desktop sidebar + mobile top bar + mobile bottom nav
- [components/StatCard.tsx](components/StatCard.tsx) — number-forward stat tile with optional primary-color accent
- [components/WeekStrip.tsx](components/WeekStrip.tsx) — M/T/W/T/F/S/S strip with workout dots
- [components/WorkoutRow.tsx](components/WorkoutRow.tsx) — one row in a workout list (type pill, distance, pace, notes, completion)
- [components/ScheduledRunCard.tsx](components/ScheduledRunCard.tsx) — clickable card for an upcoming group run
- [components/OverlapCard.tsx](components/OverlapCard.tsx) — training-overlap suggestion UI (the thing that makes this different)
- [components/RsvpButtons.tsx](components/RsvpButtons.tsx) — three-way Going/Maybe/Can't
- [components/MeetingPointMap.tsx](components/MeetingPointMap.tsx) — Leaflet map for a single meeting point
- [components/FootprintMap.tsx](components/FootprintMap.tsx) — Leaflet map rendering lifetime routes with masked home-area circle
- [components/Avatar.tsx](components/Avatar.tsx) — initials avatar + stacked variant
- [components/AddWorkoutDialog.tsx](components/AddWorkoutDialog.tsx) — bottom-sheet on mobile, modal on desktop
- [components/ScheduleRunDialog.tsx](components/ScheduleRunDialog.tsx) — same pattern for group runs

### Libraries

- [lib/types.ts](lib/types.ts) — all domain types (User, Workout, Group, ScheduledRun, Rsvp, OverlapSuggestion). Read this first when touching the data layer.
- [lib/mock-data.ts](lib/mock-data.ts) — seeded 4-member Morning Crew with a full training week around 2026-10-20. Note the hardcoded date — this will stop looking right if you run the app a year from now. The seed anchors on the week of Oct 19–25 2026.
- [lib/store.tsx](lib/store.tsx) — client-side React context store. Mutations (RSVP, add workout, schedule run) work but don't persist across page reload.
- [lib/overlap.ts](lib/overlap.ts) — the overlap algorithm. Current rules: same date, pace within 25s/mi, both workouts are easy/long/recovery, ≥2 shared miles. Area-matching is stubbed (`AREAS_SAME` always true). Refine as the real data model matures.
- [lib/date.ts](lib/date.ts) — date formatting + week/month grid helpers. Re-exports date-fns pieces so pages don't need to know we're using date-fns.
- [lib/workout-style.ts](lib/workout-style.ts) — color + label for each workout type. Single source of truth for workout coloring; don't inline these in pages.
- [lib/footprint-data.ts](lib/footprint-data.ts) — hand-made mock polylines for the Footprint map (demo-grade; replace with real GPX ingestion).
- [lib/supabase/client.ts](lib/supabase/client.ts) — browser Supabase client. Returns `null` if env vars aren't set, so the app runs without a DB.

---

## 4. Data model (TypeScript today, Postgres eventually)

See [lib/types.ts](lib/types.ts) for the authoritative definitions.

- **User** — id, name, handle, avatarColor, homeArea, typicalPace, footprintVisibility
- **Workout** — id, userId, date (YYYY-MM-DD), type (easy|long|tempo|intervals|race|recovery|cross|rest), distanceMi, paceSecPerMi, notes, completed
- **Group** — id, name, isPrivate, memberIds, description
- **ScheduledRun** — id, groupId, startAt (ISO datetime), distanceMi, paceSecPerMi, location (name/lat/lng), routeName, notes, createdBy
- **Rsvp** — runId, userId, status (going|maybe|declined)
- **OverlapSuggestion** — youWorkoutId, theirWorkoutId, partnerId, sharedMiles

When this moves to Supabase, these map almost one-to-one to tables, with
`memberships(group_id, user_id, role)` replacing the embedded `memberIds`
array and RLS keyed on membership.

---

## 5. Deliberate decisions worth knowing

### Leaflet, not MapLibre
MapLibre GL JS is the modern pick, but its web worker is broken under
Next.js 16's Turbopack dev server (worker URL fails to resolve). We
tried v6 (no default export), v5 (default export OK but worker still
broke), inline raster style spec (no tiles rendered). Leaflet works
instantly, has no worker, and is more than enough for pin-on-a-map and
polylines. **Don't swap this back to MapLibre** without checking that
Turbopack worker loading is fixed.

### `cacheComponents` and `partialPrefetching` are off
See [next.config.ts](next.config.ts). They're on by default in Next 16 and
blow up when a client component reads `new Date()` during prerender. The
dashboard legitimately needs "today". The clean fix is to defer every
`new Date()` into `useEffect`, but doing that everywhere is churn for a
feature we don't need yet. Revisit when auth/SSR actually matters.

### All state is client-side React context
See [lib/store.tsx](lib/store.tsx) and [app/providers.tsx](app/providers.tsx).
Pages are mostly `"use client"`. Mutations work but don't survive a reload.
This is intentional for the pre-DB phase — it keeps the whole app runnable
without any infra. When Supabase wires up, replace `useStore` with hooks
that call Supabase and keep the same interface — most page code shouldn't
have to change.

### Supabase is a stub
[lib/supabase/client.ts](lib/supabase/client.ts) checks env vars and
returns `null` if they're not set. [.env.example](.env.example) lists what
you need. The schema isn't migrated anywhere yet; writing the migration
is the next real step.

### Mock data is anchored to Oct 19–25 2026
See [lib/mock-data.ts](lib/mock-data.ts). Workouts and the Saturday long
run are on specific dates. If you demo this in Nov 2026, the dashboard
will show "this week" as empty. Either shift the seed, or make the seed
generate workouts relative to today.

### Attribution footers
Commits in this repo do **not** carry Claude Code co-author / generated-with
lines. This is Eli's standing preference across all his projects; respect it.

---

## 6. What's NOT built yet (ranked by what matters)

1. **Supabase wiring + migration.** Nothing persists across reloads. Needs:
   - SQL migration for the 6 entities above
   - RLS policies keyed on `memberships`
   - Auth (email + OAuth; Strava/Garmin come later)
   - Replace `useStore` with Supabase-backed hooks
   - Keep the API surface the same so pages don't need rewriting

2. **Real training-overlap scoring.** The current algo in
   [lib/overlap.ts](lib/overlap.ts) is a stub. Needs real pace tolerance
   tuning, area/geo overlap (not just string equality on `homeArea`),
   consideration of preferred time of day, and ranking by shared-miles-ratio.

3. **Invite flow for groups.** `/groups/new` and `/groups/[id]/invite`
   don't exist. Right now you can only see the two seeded groups.

4. **GPX import** for the Footprint map (currently hand-drawn polylines in
   [lib/footprint-data.ts](lib/footprint-data.ts)). Needs an upload
   endpoint, GPX parser, polyline simplification, and the privacy mask
   applied *at ingest* so raw GPS never hits the client.

5. **Strava / Garmin import.** Lives behind an OAuth flow. The Profile
   page already has placeholder "Connect" buttons; wiring them is a
   late-MVP job.

6. **Workout completion flow.** Currently workouts have a `completed`
   boolean but no UI to mark one done. Add a checkmark on the week strip
   and in the workout row.

7. **Group chat on scheduled runs.** Mentioned in the "You're in. Meeting
   point and chat are open" copy but not built. Even a dumb per-run
   message list would make RSVP more useful.

8. **AI coaching.** Later. Explicitly in the "Later" column of the MVP
   plan; don't build this before 1–6.

---

## 7. Running the app

```bash
pnpm install
pnpm dev --port 3030
```

Open http://localhost:3030. There's a `.claude/launch.json` so Claude
Code's `preview_start` can start the server by name (`pacers`).

No env vars are required for the mock-data demo. Supabase + map tile
URLs are optional — see [.env.example](.env.example).

### Known gotchas when running
- Next.js 16 + Turbopack is finicky with `new Date()` in client components.
  See the `cacheComponents` note above.
- Tile requests go to the public OpenStreetMap tile servers. Don't ship to
  real users on OSM's shared infrastructure — swap to a tile provider with
  an API key before any real traffic.

---

## 8. For an agent landing cold

If you're a Claude instance picking this up from a fresh session:

1. Read this README fully. Don't skip the "Deliberate decisions" section.
2. Read [lib/types.ts](lib/types.ts) and [lib/mock-data.ts](lib/mock-data.ts)
   to orient on the data model.
3. Read [app/page.tsx](app/page.tsx) to see how a page consumes `useStore`.
4. Check `git log --oneline` for recent intent.
5. **Do not commit without asking Eli first.** He runs multiple GitHub
   accounts (`elijamesku`, `eli_enter`) and needs to switch the active one
   before anything is pushed. This repo lives under `elijamesku`.
6. Match the existing voice in commit messages: concrete, no fluff, no
   co-author lines, no "Generated with" footers.
7. If a task is non-trivial, prefer updating [lib/types.ts](lib/types.ts)
   first, then the mock data, then the UI. The types are the contract.
