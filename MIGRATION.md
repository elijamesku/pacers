# Monorepo migration

Target structure:

```
pacers/
├── package.json              (new, root; dev scripts fan out)
├── pnpm-workspace.yaml       (updated: adds `packages:` list)
├── tsconfig.base.json        (new, shared compiler options)
├── apps/
│   ├── web/                  (existing Next.js app moves here)
│   └── mobile/               (placeholder; scaffold later)
├── packages/
│   ├── core/                 (platform-agnostic business logic)
│   ├── api/                  (Supabase client factory, shared queries)
│   └── ui-tokens/            (design tokens: colors, spacing, type, workout styles)
└── README.md
```

## Why

The web and mobile apps will share:

- Types (`User`, `Workout`, `Race`, `TrainingPlan`, `OverlapSuggestion`)
- Business logic (`generatePlan`, `findOverlaps`)
- Data (race seeds, mock data)
- Design tokens (colors, spacing, typography, workout styles)

Everything in `packages/*` is pure TypeScript. No React, no DOM, no React Native imports. Both apps consume these packages via workspace linking.

## Step 1 — root files

Copy from `pacers-updates/` to the repo root:

- `package.json`
- `pnpm-workspace.yaml` (replaces existing)
- `tsconfig.base.json`
- `README.md` (replaces default)

## Step 2 — move the Next.js app

Move everything that is currently at the repo root into `apps/web/`:

```
app/        -> apps/web/app/
components/ -> apps/web/components/
lib/        -> apps/web/lib/      (except files moved to packages, see Step 3)
public/     -> apps/web/public/
next.config.ts     -> apps/web/next.config.ts
eslint.config.mjs  -> apps/web/eslint.config.mjs
.env.example       -> apps/web/.env.example
```

Replace the root `package.json` with the new one in `pacers-updates/apps/web/package.json` placed at `apps/web/package.json`. Replace `tsconfig.json` with `pacers-updates/apps/web/tsconfig.json` at `apps/web/tsconfig.json`.

## Step 3 — split lib/ between app and packages

| Current path | New path | Why |
|---|---|---|
| `lib/types.ts` | `packages/core/src/types.ts` | Pure types. Use the EXPANDED version from `pacers-updates/`. |
| `lib/plan.ts` (new) | `packages/core/src/plan.ts` | New file. Platform-agnostic plan generator. |
| `lib/race-seed-kc.ts` (new) | `packages/core/src/race-seed-kc.ts` | New file. Seed data. |
| `lib/overlap.ts` | `packages/core/src/overlap.ts` | Takes `scope: "group" \| "cohort"` arg now (default `"group"`). |
| `lib/date.ts` | `packages/core/src/date.ts` | Pure date helpers. |
| `lib/mock-data.ts` | `packages/core/src/mock-data.ts` | Used by both apps during dev. |
| `lib/workout-style.ts` | `packages/ui-tokens/src/workout-style.ts` | Design tokens for workout types. |
| `lib/store.tsx` | `apps/web/lib/store.tsx` | React Context (web-specific). Mobile gets its own. |
| `lib/footprint-data.ts` | `apps/web/lib/footprint-data.ts` | OK to move to core later; web-only for now. |
| `lib/supabase/client.ts` | `apps/web/lib/supabase/client.ts` | Keeps the `@supabase/ssr` browser client (web-specific). Wrap `@pacers/api`'s `createSupabase` later for cross-platform. |

## Step 4 — install `packages/*`

Create the three packages from `pacers-updates/packages/`:

- `packages/core/` → copy entire folder (package.json, tsconfig.json, src/*)
- `packages/api/` → copy entire folder
- `packages/ui-tokens/` → copy entire folder

## Step 5 — rewrite imports in `apps/web/`

Imports that used to look like `@/lib/foo` now split by destination:

```
Before                        After
--------------------------    ------------------------
import ... from "@/lib/types"           -> "@pacers/core"
import ... from "@/lib/overlap"         -> "@pacers/core"
import ... from "@/lib/date"            -> "@pacers/core"
import ... from "@/lib/mock-data"       -> "@pacers/core"
import ... from "@/lib/workout-style"   -> "@pacers/ui-tokens"
import ... from "@/lib/store"           -> "@/lib/store"       (unchanged)
import ... from "@/lib/footprint-data"  -> "@/lib/footprint-data"  (unchanged)
import ... from "@/lib/supabase/client" -> "@/lib/supabase/client"  (unchanged)
```

Files that will need updates (based on the current repo):

- `app/page.tsx` — imports `@/lib/store`, `@/lib/date`, `@/lib/overlap`
- `app/calendar/page.tsx`, `app/footprint/page.tsx`, `app/groups/page.tsx`, `app/groups/[id]/page.tsx`, `app/profile/page.tsx`, `app/runs/[id]/page.tsx`
- `app/providers.tsx`, `app/layout.tsx`
- `components/*.tsx` — most import `@/lib/types` and `@/lib/date` and `@/lib/workout-style`

A regex sweep handles 90% of this:

```
# @/lib/types|overlap|date|mock-data  ->  @pacers/core
# @/lib/workout-style                 ->  @pacers/ui-tokens
```

## Step 6 — install and verify

From the repo root:

```bash
pnpm install
pnpm --filter @pacers/web dev
pnpm -r typecheck
```

## Step 7 — things to clean up as you go

- `packages/core/src/overlap.ts` has a dev shortcut: `AREAS_SAME` currently returns `true` for any two areas. Fix before enforcing home-area matching with real users (there's a `TODO` comment).
- `apps/web/lib/supabase/client.ts` is browser-only. When wiring real data, call `@pacers/api`'s `createSupabase` for shared queries and keep the SSR-cookie wrapper here only for Next.js auth.
- `AGENTS.md` at the repo root — add a product section below the Next.js auto-generated block so agents working here know the three-contexts model.
- Default README is being replaced by the one in `pacers-updates/README.md`.

## When to add the mobile app

After the web MVP's product shape is settled (adaptive plan, onboarding, race cohort view, overlap). At that point:

```bash
cd apps
pnpm create expo-app mobile --template default
```

Add workspace deps (`@pacers/core`, `@pacers/api`, `@pacers/ui-tokens`), start wiring screens. See `apps/mobile/README.md` for the target package list.
