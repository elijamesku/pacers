"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import type { FootprintVisibility } from "@/lib/types";
import clsx from "clsx";

const VIS_OPTIONS: Array<{
  v: FootprintVisibility;
  label: string;
  desc: string;
}> = [
  {
    v: "only_me",
    label: "Only me",
    desc: "Private. Only you can see your Footprint.",
  },
  {
    v: "friends",
    label: "Groups I’m in",
    desc: "Visible to anyone in your groups. Still masked around home.",
  },
  {
    v: "public",
    label: "Public",
    desc: "Visible on your profile. Home area and start/end are still masked.",
  },
];

export default function ProfilePage() {
  const { me } = useStore();
  const [visibility, setVisibility] = useState(me.footprintVisibility);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Profile
        </h1>
      </header>

      <section className="card p-5 flex items-center gap-4">
        <Avatar user={me} size={56} />
        <div className="min-w-0 flex-1">
          <div className="text-xl font-semibold tracking-tight">{me.name}</div>
          <div className="text-sm text-muted">@{me.handle}</div>
          <div className="text-xs text-muted mt-1">
            {me.homeArea} · usual pace {me.typicalPace}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
          Footprint visibility
        </h2>
        <p className="text-xs text-muted -mt-1 max-w-prose">
          Pick who sees your lifetime map. Home-area masking and start/end
          masking always apply — regardless of this setting.
        </p>
        <div className="card divide-y divide-border">
          {VIS_OPTIONS.map(({ v, label, desc }) => {
            const active = visibility === v;
            return (
              <button
                key={v}
                onClick={() => setVisibility(v)}
                className={clsx(
                  "w-full flex items-start gap-3 px-4 py-4 text-left transition-colors focus-ring",
                  active && "bg-primary-soft/40",
                )}
              >
                <span
                  className={clsx(
                    "mt-0.5 w-4 h-4 rounded-full flex items-center justify-center border transition-colors",
                    active ? "border-primary bg-primary" : "border-border-strong",
                  )}
                >
                  {active && <Check size={11} className="text-white" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-muted mt-0.5">{desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight uppercase text-muted">
          Connected
        </h2>
        <div className="card divide-y divide-border">
          <ConnectRow name="Strava" status="Not connected" />
          <ConnectRow name="Garmin" status="Not connected" />
          <ConnectRow name="Apple Health" status="Not connected" />
        </div>
        <p className="text-xs text-muted">
          For MVP, add workouts manually or upload GPX files. Platform imports
          come later.
        </p>
      </section>
    </div>
  );
}

function ConnectRow({ name, status }: { name: string; status: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs text-muted">{status}</div>
      </div>
      <button className="btn btn-ghost text-xs" disabled>
        Connect
      </button>
    </div>
  );
}
