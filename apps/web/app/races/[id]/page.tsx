"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  MapPin,
  Mountain,
  Users as UsersIcon,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { SetGoalForm } from "@/components/SetGoalForm";
import { StatCard } from "@/components/StatCard";
import {
  DISTANCE_LABEL,
  DISTANCE_ORDER,
  daysUntil,
  difficultyLabel,
  formatRaceDate,
  formatGoalTime,
} from "@/lib/race-utils";

export default function RaceDetailPage() {
  const params = useParams<{ id: string }>();
  const { races, raceGoals, removeRaceGoal } = useStore();
  const race = races.find((r) => r.id === params.id);
  if (!race) return notFound();

  const myGoal = raceGoals.find((g) => g.raceId === race.id);
  const days = daysUntil(race.date);
  const diff = difficultyLabel(race.difficultyScore);
  const sortedDistances = [...race.distances].sort(
    (a, b) => DISTANCE_ORDER.indexOf(a) - DISTANCE_ORDER.indexOf(b),
  );

  // Mock cohort stats
  const cohortSize = 42;
  const cohortAtYourPace = 7;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        href="/races"
        className="text-sm text-muted hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft size={14} />
        All races
      </Link>

      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {race.name}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={13} />
                {formatRaceDate(race.date)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} />
                {race.city}, {race.state}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-4xl font-semibold tracking-tight tabular-nums leading-none">
              {days >= 0 ? days : 0}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-muted mt-1">
              days away
            </div>
          </div>
        </div>

        {race.description && (
          <p className="text-sm text-muted leading-relaxed max-w-prose">
            {race.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {sortedDistances.map((d) => (
            <span key={d} className="pill">
              {DISTANCE_LABEL[d]}
            </span>
          ))}
          <span className="pill" style={{ color: diff.color }}>
            <Mountain size={11} />
            {diff.label}
            {race.elevationGainFt != null && (
              <span className="text-muted ml-1">
                · {race.elevationGainFt}ft gain
              </span>
            )}
          </span>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <StatCard
          label="In cohort"
          value={cohortSize}
          sub={<>training for this</>}
        />
        <StatCard
          label="At your pace"
          value={cohortAtYourPace}
          sub={
            <Link
              href={`/races/${race.id}/cohort`}
              className="hover:text-foreground inline-flex items-center gap-1"
            >
              <UsersIcon size={11} />
              See cohort
            </Link>
          }
        />
        <StatCard
          label="Elevation"
          value={race.elevationGainFt != null ? `${race.elevationGainFt}` : "—"}
          sub={<>feet gain</>}
        />
      </section>

      {myGoal ? (
        <section className="card p-5 space-y-3" style={{ background: "var(--primary-soft)", borderColor: "transparent" }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted font-medium">
                Your goal
              </div>
              <div className="text-lg font-semibold mt-1">
                {DISTANCE_LABEL[myGoal.distance]}
                {myGoal.goalTimeSec != null && (
                  <> · {formatGoalTime(myGoal.goalTimeSec)}</>
                )}
              </div>
              <div className="text-xs text-muted mt-1">
                Visibility: {visLabel(myGoal.cohortVisibility)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeRaceGoal(myGoal.id)}
              className="btn btn-ghost"
            >
              Remove goal
            </button>
          </div>
        </section>
      ) : (
        <SetGoalForm race={race} />
      )}

      {race.registrationUrl && (
        <a
          href={race.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost w-full justify-center"
        >
          <ExternalLink size={14} />
          Official race site
        </a>
      )}
    </div>
  );
}

function visLabel(v: "none" | "cohort_only" | "public"): string {
  if (v === "none") return "Private";
  if (v === "cohort_only") return "Cohort only";
  return "Public";
}
