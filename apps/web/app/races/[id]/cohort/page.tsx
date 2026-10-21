"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, Lock, Users as UsersIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { StatCard } from "@/components/StatCard";
import { formatRaceDate } from "@/lib/race-utils";

export default function RaceCohortPage() {
  const params = useParams<{ id: string }>();
  const { races, raceGoals } = useStore();
  const race = races.find((r) => r.id === params.id);
  if (!race) return notFound();

  const myGoal = raceGoals.find((g) => g.raceId === race.id);

  // Mock cohort: real data comes from Supabase later. Shows pace bands only,
  // not names or exact workouts, in keeping with privacy-first stance.
  const paceBands = [
    { band: "7:00–7:30", count: 3 },
    { band: "7:30–8:00", count: 5 },
    { band: "8:00–8:30", count: 11 },
    { band: "8:30–9:00", count: 14 },
    { band: "9:00–9:30", count: 6 },
    { band: "9:30+", count: 3 },
  ];
  const total = paceBands.reduce((s, b) => s + b.count, 0);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        href={`/races/${race.id}`}
        className="text-sm text-muted hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft size={14} />
        {race.name}
      </Link>

      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Cohort
        </h1>
        <p className="text-sm text-muted">
          Runners on Pacers training for {race.name} on {formatRaceDate(race.date)}.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <StatCard label="Training" value={total} accent />
        <StatCard
          label="Visibility"
          value={myGoal ? "You're in" : "Join to see"}
          sub={<>pace bands only — no names or exact workouts</>}
        />
      </section>

      <section className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <UsersIcon size={14} />
            Pace distribution
          </div>
          <span className="pill">
            <Lock size={11} />
            Anonymized
          </span>
        </div>
        <div className="divide-y divide-border">
          {paceBands.map((b) => {
            const pct = (b.count / total) * 100;
            return (
              <div key={b.band} className="px-5 py-3 flex items-center gap-4">
                <div className="w-24 text-sm tabular-nums">{b.band}/mi</div>
                <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-10 text-right text-sm text-muted tabular-nums">
                  {b.count}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card p-4 bg-surface-muted/50">
        <h3 className="text-sm font-semibold">Why no names here?</h3>
        <p className="text-xs text-muted mt-2 leading-relaxed max-w-prose">
          Pacers shows pace bands and counts, not profiles. When you message
          someone or RSVP to a shared workout, both sides opt in and only then
          share pace and area. Follower / following lists are never public.
        </p>
      </section>
    </div>
  );
}
