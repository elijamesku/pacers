"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Flag, Users as UsersIcon, Footprints } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Let&apos;s start simple.
        </h1>
        <p className="text-muted leading-relaxed max-w-prose">
          Pacers works three ways at once — as much or as little as you want.
          Pick what you&apos;re doing right now. You can change the mix any time.
        </p>
      </header>

      <section className="space-y-3">
        <OnboardCard
          icon={<Flag size={22} />}
          title="I'm training for a race"
          body="Pick a race, set a goal, get an adaptive plan. You'll also see other runners in your area training for it."
          cta="Pick a race"
          href="/races"
        />
        <OnboardCard
          icon={<UsersIcon size={22} />}
          title="I run with my friends"
          body="Join or create a private group. Share your training calendar, see where your schedules overlap, meet up when it fits."
          cta="Groups"
          href="/groups"
        />
        <OnboardCard
          icon={<Footprints size={22} />}
          title="I just want to run"
          body="Log workouts, get a plan that keeps you consistent, watch your footprint grow. No friends required."
          cta="Go to today"
          href="/"
        />
      </section>

      <section className="card p-4 bg-surface-muted/50 border-dashed">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            <div className="font-medium">Not ready to pick?</div>
            <div className="text-muted">
              Everything is accessible from the home screen — this just sets your starting view.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost shrink-0"
            onClick={() => router.push("/")}
          >
            Skip
            <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}

function OnboardCard({
  icon,
  title,
  body,
  cta,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="card p-5 flex items-start gap-4 hover:border-border-strong transition-colors focus-ring"
    >
      <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-foreground shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted leading-relaxed">{body}</p>
      </div>
      <div className="flex items-center gap-1 text-sm text-muted shrink-0 self-center">
        {cta}
        <ArrowRight size={14} />
      </div>
    </Link>
  );
}
