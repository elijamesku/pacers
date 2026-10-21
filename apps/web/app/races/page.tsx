"use client";

import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { useStore } from "@/lib/store";
import type { RaceDistance } from "@pacers/core";
import { RaceCard } from "@/components/RaceCard";
import {
  DISTANCE_LABEL,
  DISTANCE_ORDER,
  filterByDistance,
  filterByTimeframe,
  sortRacesByDate,
  type Timeframe,
} from "@/lib/race-utils";

const TIMEFRAMES: { key: Timeframe; label: string }[] = [
  { key: "all", label: "All" },
  { key: "soon", label: "≤ 30 days" },
  { key: "mid", label: "30–90 days" },
  { key: "far", label: "90+ days" },
];

export default function RacesPage() {
  const { races, raceGoals } = useStore();

  const [timeframe, setTimeframe] = useState<Timeframe>("all");
  const [distance, setDistance] = useState<RaceDistance | "any">("any");

  const availableDistances = useMemo<RaceDistance[]>(() => {
    const set = new Set<RaceDistance>();
    for (const r of races) r.distances.forEach((d) => set.add(d));
    return DISTANCE_ORDER.filter((d) => set.has(d));
  }, [races]);

  const filtered = useMemo(() => {
    let out = sortRacesByDate(races);
    out = filterByTimeframe(out, timeframe);
    out = filterByDistance(out, distance);
    return out;
  }, [races, timeframe, distance]);

  const goalRaceIds = useMemo(
    () => new Set(raceGoals.map((g) => g.raceId)),
    [raceGoals],
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Races near you
        </h1>
        <p className="text-sm text-muted mt-1">
          Kansas City metro. Pick one and get an adaptive plan.
        </p>
      </header>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Filter size={12} />
          <span className="font-medium uppercase tracking-wider">When</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TIMEFRAMES.map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => setTimeframe(t.key)}
              aria-pressed={timeframe === t.key}
              className={
                "pill cursor-pointer " +
                (timeframe === t.key
                  ? "bg-primary text-white border-transparent"
                  : "hover:border-border-strong")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Filter size={12} />
          <span className="font-medium uppercase tracking-wider">Distance</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setDistance("any")}
            aria-pressed={distance === "any"}
            className={
              "pill cursor-pointer " +
              (distance === "any"
                ? "bg-primary text-white border-transparent"
                : "hover:border-border-strong")
            }
          >
            Any
          </button>
          {availableDistances.map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => setDistance(d)}
              aria-pressed={distance === d}
              className={
                "pill cursor-pointer " +
                (distance === d
                  ? "bg-primary text-white border-transparent"
                  : "hover:border-border-strong")
              }
            >
              {DISTANCE_LABEL[d]}
            </button>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted">
          No races match these filters.
        </div>
      ) : (
        <section className="grid gap-3 md:grid-cols-2">
          {filtered.map((race) => (
            <RaceCard
              key={race.id}
              race={race}
              isGoal={goalRaceIds.has(race.id)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
