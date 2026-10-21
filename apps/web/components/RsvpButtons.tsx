"use client";

import clsx from "clsx";
import { Check, HelpCircle, X } from "lucide-react";
import type { RsvpStatus } from "@pacers/core";

interface Props {
  value?: RsvpStatus;
  onChange: (s: RsvpStatus) => void;
}

const options: { v: RsvpStatus; label: string; Icon: typeof Check }[] = [
  { v: "going", label: "Going", Icon: Check },
  { v: "maybe", label: "Maybe", Icon: HelpCircle },
  { v: "declined", label: "Can't", Icon: X },
];

export function RsvpButtons({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map(({ v, label, Icon }) => {
        const active = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={clsx(
              "flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border transition-colors focus-ring",
              active
                ? v === "going"
                  ? "bg-primary text-white border-primary"
                  : v === "maybe"
                    ? "bg-accent text-white border-accent"
                    : "bg-surface-muted text-foreground border-border-strong"
                : "bg-surface text-muted border-border hover:bg-surface-muted hover:text-foreground",
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
