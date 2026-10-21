"use client";

import { useStore } from "@/lib/store";
import { OverlapCard } from "@/components/OverlapCard";
import type { OverlapSuggestion } from "@pacers/core";

interface Props {
  overlaps: OverlapSuggestion[];
}

export function OverlapSection({ overlaps }: Props) {
  const { users, workouts } = useStore();

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
        Training overlap
      </h2>
      <p className="text-xs text-muted -mt-1">
        Same day, same pace, nearby — meet up if it fits.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {overlaps.map((s) => {
          const partner = users.find((u) => u.id === s.partnerId);
          const mine = workouts.find((w) => w.id === s.youWorkoutId);
          const theirs = workouts.find((w) => w.id === s.theirWorkoutId);
          if (!partner || !mine || !theirs) return null;
          return (
            <OverlapCard
              key={s.youWorkoutId + s.theirWorkoutId}
              suggestion={s}
              partner={partner}
              mine={mine}
              theirs={theirs}
            />
          );
        })}
      </div>
    </section>
  );
}
