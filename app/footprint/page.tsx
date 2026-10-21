"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Map as MapIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { StatCard } from "@/components/StatCard";
import { FootprintMap } from "@/components/FootprintMap";
import { FOOTPRINT_CENTER, FOOTPRINT_ROUTES } from "@/lib/footprint-data";

export default function FootprintPage() {
  const { me, workouts } = useStore();

  const lifetimeMiles = useMemo(() => {
    const base = 3840;
    const seasonMiles = workouts
      .filter((w) => w.userId === me.id)
      .reduce((s, w) => s + w.distanceMi, 0);
    return base + seasonMiles;
  }, [workouts, me.id]);

  const visibility = me.footprintVisibility;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Your Footprint
          </h1>
          <p className="text-sm text-muted mt-1 max-w-prose">
            A visual history of everywhere you&apos;ve run. Your home area is
            masked so GPS can&apos;t reveal where you live.
          </p>
        </div>
        <Link href="/profile" className="btn btn-ghost">
          {visibility === "only_me" ? (
            <EyeOff size={14} />
          ) : (
            <Eye size={14} />
          )}
          {visLabel(visibility)}
        </Link>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <StatCard
          label="Lifetime miles"
          value={Math.round(lifetimeMiles).toLocaleString()}
          accent
        />
        <StatCard label="Cities explored" value={12} />
        <StatCard label="Routes" value={426} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
            Where you&apos;ve run
          </h2>
          <span className="pill">
            <MapIcon size={11} />
            Home area masked
          </span>
        </div>
        <div className="card overflow-hidden">
          <FootprintMap
            routes={FOOTPRINT_ROUTES}
            center={FOOTPRINT_CENTER}
            masked
          />
          <div className="px-4 py-3 flex items-center gap-2 border-t border-border text-xs text-muted">
            <Lock size={12} />
            Visible to: {visLabel(visibility)}. Change in{" "}
            <Link href="/profile" className="text-primary hover:underline">
              Profile
            </Link>
            .
          </div>
        </div>
      </section>

      <section className="card p-5 bg-surface-muted/50">
        <h3 className="text-sm font-semibold">Why we mask your home area</h3>
        <p className="text-xs text-muted mt-2 leading-relaxed max-w-prose">
          A detailed GPS history can reveal where someone lives or works. Pacers
          always applies a privacy radius around your home area and the first
          and last few hundred meters of each run — regardless of your profile
          visibility.
        </p>
      </section>
    </div>
  );
}

function visLabel(v: "only_me" | "friends" | "public"): string {
  if (v === "only_me") return "Only me";
  if (v === "friends") return "Groups I’m in";
  return "Public";
}
