"use client";

import { useStore } from "@/lib/store";
import { ScheduledRunCard } from "@/components/ScheduledRunCard";
import type { Rsvp, ScheduledRun, User } from "@pacers/core";

interface Props {
  runs: ScheduledRun[];
  rsvps: Rsvp[];
  users: User[];
}

export function UpcomingRunsSection({ runs, rsvps, users }: Props) {
  const { me } = useStore();

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
        Upcoming together
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {runs.slice(0, 2).map((r) => {
          const attendees = rsvps
            .filter((x) => x.runId === r.id && x.status === "going")
            .map((x) => users.find((u) => u.id === x.userId))
            .filter((u): u is User => Boolean(u));
          const my = rsvps.find((x) => x.runId === r.id && x.userId === me.id);
          return (
            <ScheduledRunCard
              key={r.id}
              run={r}
              attendees={attendees}
              youRsvp={my?.status}
            />
          );
        })}
      </div>
    </section>
  );
}
