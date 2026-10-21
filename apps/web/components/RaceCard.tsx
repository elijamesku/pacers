"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Mountain, ArrowRight } from "lucide-react";
import type { Race } from "@pacers/core";
import {
  DISTANCE_LABEL,
  DISTANCE_ORDER,
  daysUntil,
  difficultyLabel,
  formatRaceDate,
} from "@/lib/race-utils";

interface Props {
  race: Race;
  isGoal?: boolean;
}

export function RaceCard({ race, isGoal }: Props) {
  const days = daysUntil(race.date);
  const diff = difficultyLabel(race.difficultyScore);
  const sortedDistances = [...race.distances].sort(
    (a, b) => DISTANCE_ORDER.indexOf(a) - DISTANCE_ORDER.indexOf(b),
  );

  return (
    <Link
      href={`/races/${race.id}`}
      className="card p-5 flex flex-col gap-4 hover:border-border-strong transition-colors focus-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold tracking-tight leading-tight">
            {race.name}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={12} />
              {formatRaceDate(race.date)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} />
              {race.city}, {race.state}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-semibold tracking-tight tabular-nums leading-none">
            {days >= 0 ? days : 0}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted mt-1">
            days away
          </div>
        </div>
      </div>

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
            <span className="text-muted ml-1">· {race.elevationGainFt}ft</span>
          )}
        </span>
      </div>

      {race.description && (
        <p className="text-sm text-muted leading-relaxed line-clamp-2">
          {race.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        {isGoal ? (
          <span className="font-semibold text-primary">You're training for this</span>
        ) : (
          <span className="text-muted">Open race</span>
        )}
        <ArrowRight size={14} className="text-muted" />
      </div>
    </Link>
  );
}
