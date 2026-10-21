"use client";

import { use, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { Lock, Plus, Users as UsersIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { AvatarStack, Avatar } from "@/components/Avatar";
import { ScheduledRunCard } from "@/components/ScheduledRunCard";
import { WORKOUT_STYLES } from "@pacers/ui-tokens";
import { ScheduleRunDialog } from "@/components/ScheduleRunDialog";
import {
  WEEKDAY_LABELS,
  addWeeks,
  format,
  subWeeks,
  toISODate,
  weekFromDate,
  parseISO,
} from "@pacers/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isSameDay } from "date-fns";

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { groups, users, workouts, runs, rsvps } = useStore();
  const group = groups.find((g) => g.id === id);
  const [weekAnchor, setWeekAnchor] = useState<Date>(() => new Date());
  const [showSchedule, setShowSchedule] = useState(false);

  if (!group) return notFound();

  const members = users.filter((u) => group.memberIds.includes(u.id));
  const groupRuns = useMemo(
    () =>
      runs
        .filter((r) => r.groupId === group.id)
        .filter((r) => r.startAt >= new Date().toISOString())
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [runs, group.id],
  );

  const days = weekFromDate(weekAnchor);
  const weekStart = toISODate(days[0]);
  const weekEnd = toISODate(days[6]);
  const groupWorkouts = useMemo(
    () =>
      workouts.filter(
        (w) =>
          group.memberIds.includes(w.userId) &&
          w.date >= weekStart &&
          w.date <= weekEnd,
      ),
    [workouts, group.memberIds, weekStart, weekEnd],
  );

  return (
    <div className="space-y-7">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {group.name}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
            {group.isPrivate && <Lock size={11} />}
            {group.isPrivate ? "Private" : "Open"}
            <span>·</span>
            <UsersIcon size={11} />
            {members.length} members
          </div>
          {group.description && (
            <p className="text-sm text-muted mt-2 max-w-prose leading-relaxed">
              {group.description}
            </p>
          )}
        </div>
        <button onClick={() => setShowSchedule(true)} className="btn btn-primary">
          <Plus size={16} />
          <span className="hidden md:inline">Schedule run</span>
        </button>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
            Shared calendar
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekAnchor((d) => subWeeks(d, 1))}
              className="btn btn-ghost p-1.5"
              aria-label="Previous week"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-muted w-32 text-center">
              {format(days[0], "MMM d")} – {format(days[6], "MMM d")}
            </span>
            <button
              onClick={() => setWeekAnchor((d) => addWeeks(d, 1))}
              className="btn btn-ghost p-1.5"
              aria-label="Next week"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="grid grid-cols-[6rem_1fr]">
            <div className="border-r border-border bg-surface-muted/50" />
            <div className="grid grid-cols-7 border-b border-border">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={clsx(
                    "px-2 py-2 text-center border-l border-border first:border-l-0",
                    isSameDay(d, new Date()) && "bg-primary-soft/40",
                  )}
                >
                  <div className="text-[10px] uppercase tracking-wider text-muted">
                    {WEEKDAY_LABELS[i]}
                  </div>
                  <div className="text-sm font-semibold">{format(d, "d")}</div>
                </div>
              ))}
            </div>
          </div>

          {members.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-[6rem_1fr] border-t border-border"
            >
              <div className="px-3 py-2 border-r border-border flex items-center gap-2 bg-surface-muted/30">
                <Avatar user={m} size={24} />
                <span className="text-xs font-medium truncate">
                  {m.name.split(" ")[0]}
                </span>
              </div>
              <div className="grid grid-cols-7">
                {days.map((d, i) => {
                  const iso = toISODate(d);
                  const w = groupWorkouts.find(
                    (x) => x.userId === m.id && x.date === iso,
                  );
                  const isToday = isSameDay(d, new Date());
                  return (
                    <div
                      key={i}
                      className={clsx(
                        "px-1.5 py-2 border-l border-border first:border-l-0 min-h-14",
                        isToday && "bg-primary-soft/20",
                      )}
                    >
                      {w && w.type !== "rest" ? (
                        <span
                          className="block w-full text-[10px] md:text-xs font-medium px-1.5 py-1 rounded truncate"
                          style={{
                            background: WORKOUT_STYLES[w.type].bg,
                            color: WORKOUT_STYLES[w.type].text,
                          }}
                          title={`${WORKOUT_STYLES[w.type].label} · ${w.distanceMi} mi`}
                        >
                          {Math.round(w.distanceMi)}
                          <span className="opacity-70">
                            {" "}
                            {WORKOUT_STYLES[w.type].label.slice(0, 3).toLowerCase()}
                          </span>
                        </span>
                      ) : w?.type === "rest" ? (
                        <span className="block text-center text-[10px] text-muted">
                          rest
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
          Upcoming together
        </h2>
        {groupRuns.length === 0 ? (
          <div className="card p-6 text-sm text-muted text-center">
            Nothing scheduled yet.{" "}
            <button
              onClick={() => setShowSchedule(true)}
              className="text-primary hover:underline"
            >
              Schedule the next run
            </button>
            .
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {groupRuns.map((r) => {
              const attendees = rsvps
                .filter((x) => x.runId === r.id && x.status === "going")
                .map((x) => users.find((u) => u.id === x.userId))
                .filter(Boolean) as typeof users;
              return (
                <ScheduledRunCard key={r.id} run={r} attendees={attendees} />
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
          Members
        </h2>
        <div className="card divide-y divide-border">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar user={m} size={36} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{m.name}</div>
                <div className="text-xs text-muted">
                  @{m.handle} · {m.homeArea} · {m.typicalPace}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showSchedule && (
        <ScheduleRunDialog
          groupId={group.id}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </div>
  );
}
