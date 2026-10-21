"use client";

import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { fmtDay, fmtDistance, fmtPace, fmtTime } from "@/lib/date";
import { parseISO } from "date-fns";
import type { Rsvp, ScheduledRun, User } from "@/lib/types";
import { AvatarStack } from "./Avatar";

interface Props {
  run: ScheduledRun;
  attendees: User[];
  youRsvp?: Rsvp["status"];
}

export function ScheduledRunCard({ run, attendees, youRsvp }: Props) {
  const start = parseISO(run.startAt);
  return (
    <Link
      href={`/runs/${run.id}`}
      className="card p-4 md:p-5 flex flex-col gap-3 hover:border-border-strong transition-colors focus-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base md:text-lg font-semibold tracking-tight">
            {run.routeName ?? "Scheduled run"}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
            <Calendar size={13} />
            {fmtDay(start)} · {fmtTime(start)}
          </div>
        </div>
        {youRsvp && (
          <span className="pill" style={rsvpPill(youRsvp)}>
            {rsvpLabel(youRsvp)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Distance" value={fmtDistance(run.distanceMi)} />
        <Field label="Pace" value={fmtPace(run.paceSecPerMi)} />
        <Field
          label="Location"
          value={
            <span className="inline-flex items-center gap-1 truncate">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{run.location.name}</span>
            </span>
          }
        />
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div className="text-xs text-muted">
          {attendees.length} going
        </div>
        <AvatarStack users={attendees} size={24} />
      </div>
    </Link>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="text-sm font-medium truncate">{value}</div>
    </div>
  );
}

function rsvpLabel(status: Rsvp["status"]): string {
  return status === "going" ? "Going" : status === "maybe" ? "Maybe" : "Declined";
}

function rsvpPill(status: Rsvp["status"]) {
  if (status === "going") {
    return { background: "var(--primary-soft)", color: "var(--primary)", borderColor: "transparent" };
  }
  if (status === "maybe") {
    return { background: "var(--accent-soft)", color: "var(--accent)", borderColor: "transparent" };
  }
  return {};
}
