"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Route,
  Clock,
  Gauge,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { RsvpButtons } from "@/components/RsvpButtons";
import { MeetingPointMap } from "@/components/MeetingPointMap";
import { fmtDay, fmtDistance, fmtPace, fmtTime, parseISO } from "@/lib/date";
import type { RsvpStatus } from "@/lib/types";

export default function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { me, users, runs, groups, rsvps, setRsvp } = useStore();
  const run = runs.find((r) => r.id === id);
  if (!run) return notFound();

  const group = groups.find((g) => g.id === run.groupId)!;
  const start = parseISO(run.startAt);
  const myRsvp = rsvps.find((x) => x.runId === run.id && x.userId === me.id);
  const confirmed = useMemo(() => {
    const confirmedUserIds = rsvps
      .filter((x) => x.runId === run.id && x.status === "going")
      .map((x) => x.userId);
    return users.filter((u) => confirmedUserIds.includes(u.id));
  }, [rsvps, users, run.id]);

  const maybe = useMemo(() => {
    const ids = rsvps
      .filter((x) => x.runId === run.id && x.status === "maybe")
      .map((x) => x.userId);
    return users.filter((u) => ids.includes(u.id));
  }, [rsvps, users, run.id]);

  const canSeeMeetingPoint =
    myRsvp?.status === "going" || myRsvp?.status === "maybe";

  return (
    <div className="space-y-6">
      <Link
        href={`/groups/${group.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} />
        {group.name}
      </Link>

      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {run.routeName ?? "Scheduled run"}
        </h1>
        <div className="flex items-center gap-1.5 text-sm text-muted mt-1">
          <Calendar size={14} />
          {fmtDay(start)} · {fmtTime(start)}
        </div>
      </header>

      <div className="card p-4 md:p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <DetailStat
          Icon={Route}
          label="Distance"
          value={fmtDistance(run.distanceMi)}
        />
        <DetailStat
          Icon={Gauge}
          label="Pace"
          value={fmtPace(run.paceSecPerMi)}
        />
        <DetailStat
          Icon={Clock}
          label="Start"
          value={fmtTime(start)}
        />
        <DetailStat
          Icon={MapPin}
          label="Meeting point"
          value={canSeeMeetingPoint ? run.location.name : "Hidden"}
          sub={!canSeeMeetingPoint ? "RSVP to see" : undefined}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
          Will you be there?
        </h2>
        <RsvpButtons
          value={myRsvp?.status}
          onChange={(s: RsvpStatus) => setRsvp(run.id, s)}
        />
        {myRsvp && (
          <p className="text-xs text-muted">
            {myRsvp.status === "going" &&
              "You’re in. Meeting point and chat are open."}
            {myRsvp.status === "maybe" &&
              "You’ll see the meeting point. Confirm when you can."}
            {myRsvp.status === "declined" &&
              "No worries. The group will still see your week on the shared calendar."}
          </p>
        )}
      </section>

      {canSeeMeetingPoint && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
            Meeting point
          </h2>
          <div className="card overflow-hidden">
            <MeetingPointMap
              lat={run.location.lat}
              lng={run.location.lng}
              name={run.location.name}
            />
            <div className="px-4 py-3 flex items-start gap-2 border-t border-border">
              <MapPin size={14} className="mt-0.5 text-primary shrink-0" />
              <div>
                <div className="text-sm font-medium">{run.location.name}</div>
                {run.routeName && (
                  <div className="text-xs text-muted">{run.routeName}</div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {run.notes && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
            Notes
          </h2>
          <div className="card p-4 text-sm leading-relaxed">{run.notes}</div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
          Going · {confirmed.length}
        </h2>
        <div className="card divide-y divide-border">
          {confirmed.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar user={u} size={32} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-muted">
                  @{u.handle} · usual pace {u.typicalPace}
                </div>
              </div>
            </div>
          ))}
          {confirmed.length === 0 && (
            <div className="px-4 py-6 text-sm text-muted text-center">
              Nobody confirmed yet.
            </div>
          )}
        </div>
      </section>

      {maybe.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
            Maybe · {maybe.length}
          </h2>
          <div className="card divide-y divide-border">
            {maybe.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar user={u} size={32} />
                <div className="text-sm font-medium">{u.name}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DetailStat({
  Icon,
  label,
  value,
  sub,
}: {
  Icon: typeof Calendar;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted">
        <Icon size={11} />
        {label}
      </div>
      <div className="text-base font-semibold mt-0.5">{value}</div>
      {sub && <div className="text-[11px] text-muted">{sub}</div>}
    </div>
  );
}
