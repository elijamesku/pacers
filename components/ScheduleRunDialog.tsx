"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";

interface Props {
  groupId: string;
  onClose: () => void;
}

export function ScheduleRunDialog({ groupId, onClose }: Props) {
  const { addScheduledRun } = useStore();
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState("07:00");
  const [distance, setDistance] = useState("8");
  const [paceMin, setPaceMin] = useState("8");
  const [paceSec, setPaceSec] = useState("30");
  const [locationName, setLocationName] = useState("Riverfront Trailhead");
  const [routeName, setRouteName] = useState("");
  const [notes, setNotes] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const [h, m] = time.split(":").map(Number);
    const startDate = new Date(`${date}T00:00:00`);
    startDate.setHours(h, m, 0, 0);
    addScheduledRun({
      groupId,
      startAt: startDate.toISOString(),
      distanceMi: Number(distance),
      paceSecPerMi: Number(paceMin) * 60 + Number(paceSec),
      location: {
        name: locationName,
        lat: 40.7589,
        lng: -73.9851,
      },
      routeName: routeName.trim() || undefined,
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
          <h2 className="text-lg font-semibold tracking-tight">Schedule a run</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost p-1.5"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="Start time">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input"
              required
            />
          </Field>
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
          <Field label="Pace (per mile)">
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="4"
                max="15"
                value={paceMin}
                onChange={(e) => setPaceMin(e.target.value)}
                className="input w-full"
              />
              <span className="text-muted">:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={paceSec}
                onChange={(e) => setPaceSec(e.target.value)}
                className="input w-full"
              />
            </div>
          </Field>
        </div>

        <Field label="Meeting point">
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. Riverfront Trailhead"
            className="input"
            required
          />
        </Field>

        <Field label="Route name (optional)">
          <input
            type="text"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="e.g. River Loop → Bridge → Return"
            className="input"
          />
        </Field>

        <Field label="Notes">
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional. Coffee after? Who's doing what distance?"
            className="input resize-none"
          />
        </Field>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary flex-1">
            Schedule it
          </button>
        </div>
      </form>
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
