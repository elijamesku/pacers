"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Users as UsersIcon } from "lucide-react";
import type { Race, RaceCohortVisibility, RaceDistance } from "@pacers/core";
import { useStore } from "@/lib/store";
import { DISTANCE_LABEL, parseGoalTime } from "@/lib/race-utils";

interface Props {
  race: Race;
}

export function SetGoalForm({ race }: Props) {
  const router = useRouter();
  const { addRaceGoal } = useStore();
  const defaultDistance = race.distances[0] as RaceDistance;

  const [distance, setDistance] = useState<RaceDistance>(defaultDistance);
  const [h, setH] = useState<string>("");
  const [m, setM] = useState<string>("");
  const [s, setS] = useState<string>("");
  const [visibility, setVisibility] =
    useState<RaceCohortVisibility>("cohort_only");
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const hasTime = h !== "" || m !== "" || s !== "";
    const goalTimeSec = hasTime
      ? parseGoalTime(
          Number(h || 0),
          Number(m || 0),
          Number(s || 0),
        )
      : undefined;
    addRaceGoal({
      raceId: race.id,
      distance,
      goalTimeSec,
      cohortVisibility: visibility,
    });
    router.push("/");
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 space-y-5">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Set as my goal</h3>
        <p className="text-xs text-muted mt-1">
          Pacers will build you a plan and show you other runners training for this race.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-[11px] uppercase tracking-wider text-muted font-medium">
          Distance
        </legend>
        <div className="flex gap-2 flex-wrap">
          {race.distances.map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => setDistance(d)}
              className={
                "pill cursor-pointer " +
                (d === distance
                  ? "bg-primary text-white border-transparent"
                  : "hover:border-border-strong")
              }
              aria-pressed={d === distance}
            >
              {DISTANCE_LABEL[d]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-[11px] uppercase tracking-wider text-muted font-medium">
          Goal time <span className="text-muted lowercase">(optional)</span>
        </legend>
        <div className="flex items-center gap-2">
          <TimeInput value={h} setValue={setH} max={10} placeholder="h" />
          <span className="text-muted">:</span>
          <TimeInput value={m} setValue={setM} max={59} placeholder="m" />
          <span className="text-muted">:</span>
          <TimeInput value={s} setValue={setS} max={59} placeholder="s" />
          <span className="text-xs text-muted ml-2">
            Leave blank to just finish.
          </span>
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-[11px] uppercase tracking-wider text-muted font-medium">
          Cohort visibility
        </legend>
        <div className="space-y-1.5">
          <VisibilityOption
            selected={visibility === "none"}
            onSelect={() => setVisibility("none")}
            icon={<EyeOff size={14} />}
            title="Private"
            body="Nobody else sees you're training for this."
          />
          <VisibilityOption
            selected={visibility === "cohort_only"}
            onSelect={() => setVisibility("cohort_only")}
            icon={<UsersIcon size={14} />}
            title="Cohort only"
            body="Other people training for this race see your pace band — no exact workouts."
          />
          <VisibilityOption
            selected={visibility === "public"}
            onSelect={() => setVisibility("public")}
            icon={<Eye size={14} />}
            title="Public"
            body="Anyone on Pacers can see you're training for this."
          />
        </div>
      </fieldset>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          Set this as my goal
        </button>
        <button
          type="button"
          onClick={() => router.push("/races")}
          className="btn btn-ghost"
        >
          Back
        </button>
      </div>
    </form>
  );
}

function TimeInput({
  value,
  setValue,
  max,
  placeholder,
}: {
  value: string;
  setValue: (v: string) => void;
  max: number;
  placeholder: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={max}
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-16 px-2 py-1.5 rounded-lg border border-border bg-surface tabular-nums text-center focus-ring"
    />
  );
}

function VisibilityOption({
  selected,
  onSelect,
  icon,
  title,
  body,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={
        "w-full text-left rounded-lg border p-3 flex items-start gap-3 transition-colors focus-ring " +
        (selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-border-strong")
      }
    >
      <div
        className={
          "w-7 h-7 rounded-md flex items-center justify-center shrink-0 " +
          (selected
            ? "bg-primary text-white"
            : "bg-surface-muted text-foreground")
        }
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted">{body}</div>
      </div>
    </button>
  );
}
