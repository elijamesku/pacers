"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCw, Link2, Link2Off, CheckCircle2, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";

interface Status {
  connected: boolean;
  athleteId?: number;
  lastSyncedAt?: string | null;
}

function fmtAgo(iso: string | null | undefined): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function StravaConnectCard() {
  const [status, setStatus] = useState<Status | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const params = useSearchParams();
  const flash = params.get("strava");
  const imported = params.get("imported");
  const { reload } = useStore();

  useEffect(() => {
    void fetch("/api/strava/status").then((r) =>
      r.ok ? r.json().then(setStatus) : setStatus({ connected: false }),
    );
  }, []);

  // Show the connect flash once, then strip it from the URL.
  useEffect(() => {
    if (flash) {
      const t = setTimeout(() => {
        router.replace("/profile");
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [flash, router]);

  function sync() {
    startTransition(async () => {
      const r = await fetch("/api/strava/sync", { method: "POST" });
      const data = (await r.json()) as { imported?: number; error?: string };
      if (data.error) {
        setSyncResult(`Sync failed: ${data.error}`);
      } else {
        setSyncResult(`Imported ${data.imported ?? 0} activities.`);
        void reload();
        void fetch("/api/strava/status").then((r) => r.json()).then(setStatus);
      }
    });
  }

  function disconnect() {
    if (!confirm("Disconnect Strava? Your imported runs stay in Pacers.")) return;
    startTransition(async () => {
      await fetch("/api/strava/disconnect", { method: "POST" });
      setStatus({ connected: false });
      setSyncResult(null);
    });
  }

  const connected = status?.connected === true;

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-lg"
          style={{ background: "#FC4C02" }}
          aria-hidden
        >
          S
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Strava</div>
          {status === null ? (
            <div className="text-xs text-muted">Checking…</div>
          ) : connected ? (
            <div className="text-xs text-muted">
              Athlete <span className="num">{status.athleteId}</span> · last synced{" "}
              {fmtAgo(status.lastSyncedAt)}
            </div>
          ) : (
            <div className="text-xs text-muted">
              Not connected. We&apos;ll import your runs with pace, distance, and name.
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {connected ? (
            <>
              <button
                onClick={sync}
                disabled={pending}
                className="btn btn-ghost text-xs"
                aria-label="Sync now"
              >
                <RefreshCw size={12} className={pending ? "animate-spin" : ""} />
                {pending ? "Syncing…" : "Sync"}
              </button>
              <button
                onClick={disconnect}
                disabled={pending}
                className="btn btn-ghost text-xs text-danger"
              >
                <Link2Off size={12} />
                Disconnect
              </button>
            </>
          ) : (
            <a
              href="/api/strava/connect"
              className="btn btn-primary text-xs"
              style={{ background: "#FC4C02" }}
            >
              <Link2 size={12} />
              Connect
            </a>
          )}
        </div>
      </div>

      {flash === "connected" && (
        <Flash
          kind="ok"
          text={`Connected — imported ${imported ?? "0"} activities from the last 30 days.`}
        />
      )}
      {flash === "denied" && (
        <Flash kind="err" text="You declined Strava access." />
      )}
      {flash === "notconfigured" && (
        <Flash
          kind="err"
          text="Strava app isn't configured on the server yet. Add STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET."
        />
      )}
      {flash === "state" && (
        <Flash kind="err" text="OAuth state mismatch. Try again." />
      )}
      {flash === "error" && (
        <Flash kind="err" text="Couldn't finish the connect flow. Try again." />
      )}
      {syncResult && <Flash kind="ok" text={syncResult} />}
    </div>
  );
}

function Flash({ kind, text }: { kind: "ok" | "err"; text: string }) {
  const Icon = kind === "ok" ? CheckCircle2 : AlertCircle;
  return (
    <div
      className={
        kind === "ok"
          ? "text-xs text-success bg-success/10 border border-success/30 rounded-md px-3 py-2 flex items-center gap-2"
          : "text-xs text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2 flex items-center gap-2"
      }
    >
      <Icon size={13} />
      {text}
    </div>
  );
}
