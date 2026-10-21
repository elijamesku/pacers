"use client";

import { ArrowRight, Zap } from "lucide-react";
import { fmtDistance, fmtPace, parseISO, format } from "@/lib/date";
import type { OverlapSuggestion, User, Workout } from "@/lib/types";
import { Avatar } from "./Avatar";

interface Props {
  suggestion: OverlapSuggestion;
  partner: User;
  mine: Workout;
  theirs: Workout;
}

export function OverlapCard({ suggestion, partner, mine, theirs }: Props) {
  const dayLabel = format(parseISO(mine.date + "T00:00:00"), "EEE, MMM d");
  const extra = Math.abs(mine.distanceMi - theirs.distanceMi);
  const whoLonger = mine.distanceMi > theirs.distanceMi ? "you" : partner.name;
  return (
    <div
      className="card p-4 flex flex-col gap-3"
      style={{ borderColor: "var(--primary)", background: "var(--primary-soft)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Zap size={16} className="text-primary" />
          Training overlap · {dayLabel}
        </div>
        <span className="pill" style={{ background: "var(--surface)" }}>
          +{fmtDistance(suggestion.sharedMiles)} together
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-surface rounded-lg p-3 border border-border">
        <Side
          label="You"
          user={{ name: "You", avatarColor: "#047857" }}
          dist={mine.distanceMi}
          pace={mine.paceSecPerMi}
        />
        <ArrowRight size={14} className="text-muted" />
        <Side
          label={partner.name.split(" ")[0]}
          user={partner}
          dist={theirs.distanceMi}
          pace={theirs.paceSecPerMi}
          right
        />
      </div>

      <div className="text-xs text-muted-strong leading-relaxed">
        Run {fmtDistance(suggestion.sharedMiles)} together, then{" "}
        {whoLonger === "you" ? "you" : whoLonger} finishes {fmtDistance(extra)}{" "}
        solo.
      </div>
    </div>
  );
}

function Side({
  label,
  user,
  dist,
  pace,
  right,
}: {
  label: string;
  user: Pick<User, "name" | "avatarColor">;
  dist: number;
  pace?: number;
  right?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 min-w-0 ${right ? "justify-end flex-row-reverse" : ""}`}
    >
      <Avatar user={user} size={28} />
      <div className={`min-w-0 ${right ? "text-right" : ""}`}>
        <div className="text-xs text-muted">{label}</div>
        <div className="text-sm font-medium">{fmtDistance(dist)}</div>
        <div className="text-[11px] text-muted">{fmtPace(pace)}</div>
      </div>
    </div>
  );
}
