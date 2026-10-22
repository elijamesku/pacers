"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpInner />
    </Suspense>
  );
}

function SignUpInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/onboarding";

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || undefined,
            handle: handle || undefined,
          },
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        router.replace(next);
        router.refresh();
      } else {
        // Email confirmation required.
        setInfo(
          "Check your email to confirm your account, then sign in.",
        );
      }
    });
  }

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your Pacers account.</h1>
        <p className="text-sm text-muted">Private by default. We never show your follower list.</p>
      </header>

      <form onSubmit={onSubmit} className="card p-5 space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs uppercase tracking-wider text-muted font-medium">
            Name
          </span>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus-ring"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs uppercase tracking-wider text-muted font-medium">
            Handle <span className="normal-case text-muted">(optional)</span>
          </span>
          <input
            type="text"
            pattern="[a-zA-Z0-9_]+"
            autoComplete="username"
            placeholder="auto-generated if blank"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus-ring"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs uppercase tracking-wider text-muted font-medium">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus-ring"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs uppercase tracking-wider text-muted font-medium">
            Password
          </span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus-ring"
          />
        </label>
        {error && (
          <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {info && (
          <div className="text-xs text-info bg-info/10 border border-info/30 rounded-lg px-3 py-2">
            {info}
          </div>
        )}
        <button type="submit" className="btn btn-primary w-full justify-center" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-center text-muted">
        Already have one?{" "}
        <Link
          href={`/auth/signin${next !== "/onboarding" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-primary font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
