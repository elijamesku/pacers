"use client";

import Link from "next/link";
import { ArrowRight, Map as MapIcon } from "lucide-react";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { StatCard } from "@/components/StatCard";
import { toISODate, weekFromDate, fmtPace } from "@pacers/core";

interface Props {
  today: Date;
}

export function SoloInsightsSection({ today }: Props) {
  const { me, workouts } = useStore();

  const stats = useMemo(() => {
    const week = weekFromDate(today);
    const start = toISODate(week[0]);
    const end = toISODate(week[6]);
    const mine = workouts.filter(
      (w) => w.userId === me.id && w.date >= start && w.date <= end,
    );
    const miles = mine.reduce((s, w) => s + w.distanceMi, 0);
    const runDays = mine.filter((w) => w.distanceMi > 0).length;
    const paces = mine
      .map((w) => w.paceSecPerMi)
      .filter((p): p is number => p != null && p > 0);
    const avgPace = paces.length
      ? paces.reduce((a, b) => a + b, 0) / paces.length
      : undefined;
    return { miles, runDays, avgPace };
  }, [workouts, me.id, today]);

  const insight = useMemo(() => {
    if (stats.runDays === 0) return "Nothing logged this week yet.";
    if (stats.runDays >= 5)
      return "Five run days this week — strong consistency streak.";
    if (stats.miles >= 30)
      return `${Math.round(stats.miles)} miles so far — your highest-volume stretch in the last month.`;
    return `${stats.runDays} runs, ${Math.round(stats.miles)} miles. Steady.`;
  }, [stats]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
          This week
        </h2>
        <Link
          href="/footprint"
          className="text-xs text-muted hover:text-foreground inline-flex items-center gap-1"
        >
          <MapIcon size={11} />
          Footprint
          <ArrowRight size={11} />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Miles"
          value={Math.round(stats.miles * 10) / 10}
          sub={<>this week</>}
          accent
        />
        <StatCard
          label="Run days"
          value={stats.runDays}
          sub={<>of 7</>}
        />
        <StatCard
          label="Avg pace"
          value={fmtPace(stats.avgPace)}
          sub={<>easy days</>}
        />
      </div>

      <div className="card p-4 bg-surface-muted/40 text-sm text-mutedStrong">
        {insight}
      </div>
    </section>
  );
}
