"use client";

import Link from "next/link";
import { ArrowRight, Flag, Users as UsersIcon, X } from "lucide-react";
import { useStore } from "@/lib/store";

interface Props {
  hasRace: boolean;
  hasCrew: boolean;
}

export function ContextNudges({ hasRace, hasCrew }: Props) {
  const { dismissedNudges, dismissNudge } = useStore();

  const showRaceNudge = !hasRace && !dismissedNudges.has("race");
  const showCrewNudge = !hasCrew && !dismissedNudges.has("crew");

  if (!showRaceNudge && !showCrewNudge) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
        Add to your mix
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {showRaceNudge && (
          <Nudge
            icon={<Flag size={18} />}
            title="Training for something?"
            body="Pick a race and get an adaptive plan. See who else near you is training for it."
            cta="Browse races"
            href="/races"
            onDismiss={() => dismissNudge("race")}
          />
        )}
        {showCrewNudge && (
          <Nudge
            icon={<UsersIcon size={18} />}
            title="Who do you run with?"
            body="Start a private group or join one. Share training, find overlap, meet up when it works."
            cta="Groups"
            href="/groups"
            onDismiss={() => dismissNudge("crew")}
          />
        )}
      </div>
    </section>
  );
}

function Nudge({
  icon,
  title,
  body,
  cta,
  href,
  onDismiss,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  href: string;
  onDismiss: () => void;
}) {
  return (
    <div className="card p-4 relative">
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute top-2 right-2 text-muted hover:text-foreground p-1 rounded focus-ring"
      >
        <X size={14} />
      </button>
      <div className="flex items-start gap-3 pr-5">
        <div className="w-9 h-9 rounded-lg bg-surface-muted flex items-center justify-center text-foreground shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="font-semibold text-sm">{title}</div>
          <p className="text-xs text-muted leading-relaxed">{body}</p>
          <Link
            href={href}
            className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 mt-1"
          >
            {cta}
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
