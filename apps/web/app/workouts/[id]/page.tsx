"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  FileText,
  BarChart3,
  Heart,
  Zap as ZapIcon,
  Clock,
  X,
  Upload,
  Settings,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { WORKOUT_STYLES } from "@pacers/ui-tokens";
import { WorkoutTypeIcon } from "@/components/WorkoutTypeIcon";
import { fmtDistance, parseISO, format } from "@pacers/core";
import type { Workout, WorkoutType } from "@pacers/core";

const TYPE_LABEL: Record<WorkoutType, string> = {
  easy: "Easy Run",
  long: "Long Run",
  tempo: "Tempo",
  intervals: "Intervals",
  race: "Race",
  recovery: "Recovery",
  cross: "Cross Train",
  rest: "Rest",
};

export default function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { workouts, updateWorkout, deleteWorkout } = useStore();
  const workout = workouts.find((w) => w.id === id);

  const [form, setForm] = useState<Workout | null>(workout ?? null);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(0);

  useEffect(() => {
    if (workout) setForm(workout);
  }, [workout]);

  const plannedPaceSec = form?.paceSecPerMi ?? 600;
  const plannedDurationMin = useMemo(() => {
    if (!form) return 0;
    return Math.round((form.distanceMi * plannedPaceSec) / 60);
  }, [form, plannedPaceSec]);

  if (!workout || !form) {
    return (
      <div className="max-w-md mx-auto card p-6 text-center space-y-3">
        <h1 className="text-lg font-semibold">Workout not found</h1>
        <p className="text-sm text-muted">
          It may have been removed. Head back to the calendar to pick another.
        </p>
        <Link href="/calendar" className="btn btn-primary inline-flex">
          Back to calendar
        </Link>
      </div>
    );
  }

  const date = parseISO(form.date);
  const style = WORKOUT_STYLES[form.type];
  const title = `${TYPE_LABEL[form.type]}${form.distanceMi > 0 ? ` ${plannedDurationMin / 60 >= 1 ? `${(plannedDurationMin / 60).toFixed(1)}hr` : `${plannedDurationMin}min`}` : ""}`;

  async function save(close: boolean) {
    if (!form) return;
    setSaving(true);
    try {
      await updateWorkout(form.id, {
        type: form.type,
        distanceMi: form.distanceMi,
        paceSecPerMi: form.paceSecPerMi,
        notes: form.notes,
        completed: form.completed,
        date: form.date,
      });
      setSavedTick((t) => t + 1);
      if (close) router.push("/calendar");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!form) return;
    if (!confirm("Delete this workout?")) return;
    await deleteWorkout(form.id);
    router.push("/calendar");
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Modal header strip */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-surface">
          <div className="text-primary font-semibold text-sm uppercase tracking-wider">
            {format(date, "EEEE")}
          </div>
          <div className="text-sm text-muted-strong">
            {format(date, "MMMM d, yyyy")}
          </div>
          <button className="btn btn-ghost text-xs px-3 py-1.5">
            Enter Time
            <ChevronDown size={14} />
          </button>
          <div className="flex-1" />
          <MetricPill label="Fitness" color="var(--primary)" />
          <MetricPill label="Fatigue" color="#DC2626" />
          <MetricPill label="Form" color="#D97706" />
          <button className="btn btn-ghost p-1.5" aria-label="Settings">
            <Settings size={16} />
          </button>
          <Link
            href="/calendar"
            className="btn btn-ghost p-1.5"
            aria-label="Close"
          >
            <X size={16} />
          </Link>
        </div>

        {/* Title + big stat row */}
        <div className="flex items-start gap-5 px-5 py-4 border-b border-border">
          <div className="flex-1 min-w-0 space-y-2">
            <input
              type="text"
              value={title}
              readOnly
              className="w-full text-xl font-semibold tracking-tight bg-transparent focus:outline-none"
            />
            <div className="flex items-center gap-5">
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-full"
                style={{ background: `${style.color}22`, color: style.color }}
              >
                <WorkoutTypeIcon type={form.type} size={18} />
              </span>
              <div className="stat-med num">
                {fmtH(plannedDurationMin)}
              </div>
              <div className="text-sm text-muted-strong num">
                {form.distanceMi > 0 ? fmtDistance(form.distanceMi) : "-- mi"}
              </div>
              <div className="text-sm text-muted-strong">
                -- TSS
              </div>
            </div>
            <div className="text-xs text-muted">{TYPE_LABEL[form.type]}</div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button className="btn btn-ghost text-xs justify-start">
              <Upload size={14} />
              Upload
            </button>
            <button className="btn btn-ghost text-xs justify-start opacity-50" disabled>
              <BarChart3 size={14} />
              Analyze
            </button>
          </div>
        </div>

        {/* Workout structure strip */}
        <div className="px-5 py-3 border-b border-border">
          <div className="flex items-center h-9 rounded-md overflow-hidden bg-surface-muted text-[11px] font-medium">
            <StructureSeg label="Warm up" width="18%" tone="muted" />
            <StructureSeg label="Main Set" width="64%" tone="strong" />
            <StructureSeg label="Cool down" width="18%" tone="muted" />
          </div>
        </div>

        {/* Body: icon rail + planned/completed grid + right panel */}
        <div className="flex items-stretch">
          {/* Icon rail */}
          <nav className="flex flex-col items-center gap-5 px-3 py-5 border-r border-border text-muted">
            <RailIcon Icon={FileText} active />
            <RailIcon Icon={BarChart3} />
            <RailIcon Icon={Heart} />
            <RailIcon Icon={ZapIcon} />
            <RailIcon Icon={Clock} />
          </nav>

          {/* Left: metrics table */}
          <div className="flex-1 p-5 border-r border-border">
            <div className="grid grid-cols-[1fr_1.1fr_1.1fr_auto] gap-x-3 items-center text-sm">
              <div />
              <div className="text-xs font-semibold text-muted-strong text-center uppercase tracking-wider">
                Planned
              </div>
              <div className="text-xs font-semibold text-muted-strong text-center uppercase tracking-wider">
                Completed
              </div>
              <div />

              <MetricRow
                label="Duration"
                planned={fmtH(plannedDurationMin)}
                completed=""
                unit="h:m:s"
                primary
              />
              <MetricRow
                label="Distance"
                planned={form.distanceMi > 0 ? form.distanceMi.toFixed(2) : ""}
                completed=""
                unit="mi"
                primary
                onPlannedChange={(v) =>
                  setForm({ ...form, distanceMi: Number(v) || 0 })
                }
              />
              <MetricRow
                label="Average Pace"
                planned={form.paceSecPerMi ? fmtPaceShort(form.paceSecPerMi) : ""}
                completed=""
                unit="min/mi"
                onPlannedChange={(v) => {
                  const sec = parsePace(v);
                  if (sec != null) setForm({ ...form, paceSecPerMi: sec });
                }}
              />
              <MetricRow label="Calories" planned="" completed="" unit="kcal" />
              <MetricRow label="Elevation Gain" planned="" completed="" unit="ft" />
              <MetricRow label="TSS" planned="" completed="" unit="TSS" primary />
              <MetricRow label="IF" planned="" completed="" unit="IF" />
              <MetricRow label="Elevation Loss" planned="" completed="" unit="ft" muted />
              <MetricRow label="Work" planned="" completed="" unit="kJ" />
            </div>

            <div className="mt-6 grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-x-3 text-sm items-center">
              <div />
              <div className="text-xs font-semibold text-muted-strong text-center uppercase tracking-wider">
                Min
              </div>
              <div className="text-xs font-semibold text-muted-strong text-center uppercase tracking-wider">
                Avg
              </div>
              <div className="text-xs font-semibold text-muted-strong text-center uppercase tracking-wider">
                Max
              </div>
              <div />

              <MinAvgMaxRow label="Pace" unit="min/mi" />
              <MinAvgMaxRow label="Heart Rate" unit="bpm" />
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold text-muted-strong text-center uppercase tracking-wider mb-2">
                Equipment
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-3 items-center text-sm max-w-sm mx-auto">
                <div className="text-muted-strong">Shoes</div>
                <select className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus-ring">
                  <option>Select Shoe</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right: description + notes */}
          <div className="w-80 shrink-0 p-5 space-y-5 bg-surface-muted/40">
            <div className="space-y-2">
              <div className="eyebrow">Description</div>
              <textarea
                value={form.notes ?? ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={8}
                placeholder={placeholderFor(form.type)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs leading-relaxed focus-ring resize-y"
              />
            </div>

            <div className="space-y-2">
              <div className="eyebrow">Post-activity Comments</div>
              <input
                type="text"
                placeholder="Enter a new comment"
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs focus-ring"
              />
            </div>

            <div className="space-y-2">
              <div className="eyebrow">Private Notes</div>
              <textarea
                rows={4}
                placeholder="Use this space for personal thoughts and observations — these notes won't be shared with anyone."
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs leading-relaxed focus-ring resize-y"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface">
          <label className="flex items-center gap-2 text-xs text-muted-strong">
            <input type="checkbox" defaultChecked className="rounded border-border" />
            Automatically calculate planned values
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={remove}
              className="text-xs text-danger hover:underline inline-flex items-center gap-1"
            >
              <Trash2 size={12} />
              Delete
            </button>
            <Link href="/calendar" className="btn btn-ghost text-xs">
              Cancel
            </Link>
            <button
              onClick={() => save(false)}
              disabled={saving}
              className="btn btn-ghost text-xs text-primary"
            >
              {savedTick > 0 && !saving ? "Saved" : "Save"}
            </button>
            <button
              onClick={() => save(true)}
              disabled={saving}
              className="btn btn-primary text-xs"
            >
              {saving ? "Saving…" : "Save & Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function fmtH(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, "0")}:00`;
}

function fmtPaceShort(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function parsePace(v: string): number | null {
  const m = v.match(/^(\d+):(\d{1,2})$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function placeholderFor(type: WorkoutType): string {
  if (type === "easy") {
    return "Easy Running for 1hr @Z0-Z1\nMake sure you are:\n-not trying to cover a certain distance\n-conversational\n-running as slow as you feel to recover";
  }
  if (type === "long") {
    return "Long run @Z2.\nPick a scenic loop, carry water. Finish with 4x20s strides.";
  }
  if (type === "tempo") {
    return "Tempo @Z3.\nWarmup 15min, 20-30min tempo, 10min cool.";
  }
  if (type === "intervals") {
    return "Intervals.\nWarmup, 6x800m @5k pace w/ 2min jog recovery, cool.";
  }
  return "What's the plan?";
}

function MetricPill({ label, color }: { label: string; color: string }) {
  return (
    <div
      className="px-2.5 py-1 rounded-md flex items-center gap-1.5 text-xs font-semibold text-white"
      style={{ background: color }}
    >
      {label}
      <div className="w-6 h-1 rounded-full bg-white/30" />
    </div>
  );
}

function StructureSeg({
  label,
  width,
  tone,
}: {
  label: string;
  width: string;
  tone: "muted" | "strong";
}) {
  return (
    <div
      className={clsx(
        "h-full flex items-center justify-center",
        tone === "strong"
          ? "bg-primary text-primary-ink"
          : "bg-primary-soft text-primary",
      )}
      style={{ width }}
    >
      {label}
    </div>
  );
}

function RailIcon({
  Icon,
  active,
}: {
  Icon: typeof FileText;
  active?: boolean;
}) {
  return (
    <button
      className={clsx(
        "p-1.5 rounded-md transition-colors",
        active
          ? "bg-primary-soft text-primary"
          : "text-muted hover:text-foreground hover:bg-surface-muted",
      )}
    >
      <Icon size={16} />
    </button>
  );
}

function MetricRow({
  label,
  planned,
  completed,
  unit,
  primary,
  muted,
  onPlannedChange,
}: {
  label: string;
  planned: string;
  completed: string;
  unit: string;
  primary?: boolean;
  muted?: boolean;
  onPlannedChange?: (v: string) => void;
}) {
  return (
    <>
      <div
        className={clsx(
          "text-sm text-right pr-2",
          primary ? "text-primary font-medium" : "text-muted-strong",
        )}
      >
        {label}
      </div>
      <input
        type="text"
        value={planned}
        onChange={(e) => onPlannedChange?.(e.target.value)}
        readOnly={!onPlannedChange}
        className={clsx(
          "px-2 py-1.5 rounded-md border border-border bg-surface text-sm text-center num focus-ring",
          muted && "bg-surface-muted",
        )}
      />
      <input
        type="text"
        value={completed}
        readOnly
        className="px-2 py-1.5 rounded-md border border-border bg-surface text-sm text-center num"
      />
      <div className="text-xs text-muted whitespace-nowrap">{unit}</div>
    </>
  );
}

function MinAvgMaxRow({ label, unit }: { label: string; unit: string }) {
  return (
    <>
      <div className="text-sm text-right pr-2 text-muted-strong">{label}</div>
      <input
        readOnly
        className="px-2 py-1.5 rounded-md border border-border bg-surface-muted text-sm text-center num"
      />
      <input
        readOnly
        className="px-2 py-1.5 rounded-md border border-border bg-surface text-sm text-center num"
      />
      <input
        readOnly
        className="px-2 py-1.5 rounded-md border border-border bg-surface text-sm text-center num"
      />
      <div className="text-xs text-muted whitespace-nowrap">{unit}</div>
    </>
  );
}
