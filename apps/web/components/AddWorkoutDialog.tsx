"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import type { WorkoutType } from "@pacers/core";
import { WORKOUT_STYLES } from "@pacers/ui-tokens";
import clsx from "clsx";

interface Props {
  initialDate: string;
  onClose: () => void;
}

const TYPES: WorkoutType[] = [
  "easy",
  "long",
  "tempo",
  "intervals",
  "recovery",
  "cross",
  "rest",
];

export function AddWorkoutDialog({ initialDate, onClose }: Props) {
  const { addWorkout } = useStore();
  const [date, setDate] = useState(initialDate);
  const [type, setType] = useState<WorkoutType>("easy");
  const [distance, setDistance] = useState("5");
  const [paceMin, setPaceMin] = useState("8");
  const [paceSec, setPaceSec] = useState("30");
  const [notes, setNotes] = useState("");

  const isRest = type === "rest" || type === "cross";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    addWorkout({
      date,
      type,
      distanceMi: isRest ? 0 : Number(distance),
      paceSecPerMi: isRest
        ? undefined
        : Number(paceMin) * 60 + Number(paceSec),
      notes: notes.trim() || undefined,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-30 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="bg-surface rounded-t-2xl md:rounded-2xl w-full md:max-w-md border border-border p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Add workout</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost p-1.5"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
            required
          />
        </Field>

        <Field label="Type">
          <div className="grid grid-cols-4 gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={clsx(
                  "px-2 py-1.5 rounded-md text-xs font-medium border transition-colors",
                  type === t
                    ? "border-primary"
                    : "border-border hover:bg-surface-muted",
                )}
                style={
                  type === t
                    ? {
                        background: WORKOUT_STYLES[t].bg,
                        color: WORKOUT_STYLES[t].text,
                      }
                    : undefined
                }
              >
                {WORKOUT_STYLES[t].label}
              </button>
            ))}
          </div>
        </Field>

        {!isRest && (
          <>
            <Field label="Distance (mi)">
              <input
                type="number"
                step="0.1"
                min="0"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="input"
                required
              />
            </Field>

            <Field label="Target pace (per mile)">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="4"
                  max="15"
                  value={paceMin}
                  onChange={(e) => setPaceMin(e.target.value)}
                  className="input w-20"
                />
                <span className="text-muted">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={paceSec}
                  onChange={(e) => setPaceSec(e.target.value)}
                  className="input w-20"
                />
                <span className="text-sm text-muted">/mi</span>
              </div>
            </Field>
          </>
        )}

        <Field label="Notes">
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional. Route, how it felt, anything."
            className="input resize-none"
          />
        </Field>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary flex-1">
            Save workout
          </button>
        </div>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--surface);
          color: var(--foreground);
          font-size: 14px;
        }
        .input:focus {
          outline: 2px solid var(--primary);
          outline-offset: 1px;
          border-color: transparent;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wider text-muted font-medium">
        {label}
      </span>
      {children}
    </label>
  );
}
