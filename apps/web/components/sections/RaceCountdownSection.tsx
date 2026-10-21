"use client";

import Link from "next/link";
import { ArrowRight, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { useStore } from "@/lib/store";
import { StatCard } from "@/components/StatCard";

interface Props {
  raceGoalId: string;
  today: Date;
}

export function RaceCountdownSection({ raceGoalId, today }: Props) {
  const { races, raceGoals, users } = useStore();
  const goal = raceGoals.find((g) => g.id === raceGoalId);
  if (!goal) return null;
  const race = races.find((r) => r.id === goal.raceId);
  if (!race) return null;

  const raceDate = new Date(race.date + "T07:00:00");
  const daysLeft = Math.max(
    0,
    Math.ceil((raceDate.getTime() - today.getTime()) / 86_400_000),
  );

  // Mock cohort stats until there's real data.
  const cohortSize = 42;
  const cohortAtYourPace = 7;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
          Your race
        </h2>
        <Link
          href={`/races/${race.id}`}
          className="text-xs text-muted hover:text-foreground flex items-center gap-1"
        >
          Open race
          <ArrowRight size={12} />
        </Link>
      </div>

      <div
        className="card p-5 space-y-4"
        style={{ background: "var(--primary-soft)", borderColor: "transparent" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
              {race.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted mt-1">
              <span className="inline-flex items-center gap-1">
                <CalendarIcon size={13} />
                {new Date(race.date + "T00:00:00").toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} />
                {race.city}, {race.state}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl md:text-4xl font-semibold tracking-tight tabular-nums">
              {daysLeft}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-muted">
              days
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Goal distance"
            value={goal.distance.toUpperCase()}
          />
          <StatCard
            label="In your cohort"
            value={cohortSize}
            sub={<>training for this race</>}
          />
          <StatCard
            label="At your pace"
            value={cohortAtYourPace}
            sub={
              <Link
                href={`/races/${race.id}/cohort`}
                className="hover:text-foreground inline-flex items-center gap-1"
              >
                See runners <ArrowRight size={11} />
              </Link>
            }
          />
        </div>
      </div>
    </section>
  );
}
