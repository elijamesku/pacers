"use client";

import { usePathname } from "next/navigation";
import { StoreProvider, useStore } from "@/lib/store";
import { Nav } from "@/components/Nav";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <Gate>{children}</Gate>
    </StoreProvider>
  );
}

// Decides what to render based on auth state + route.
// - /auth/* : no nav, no store gate — the sign-in / sign-up screens.
// - loading : loading splash while the client-side auth check is in flight.
// - signed out on a protected route : nothing. Middleware will redirect.
// - signed in : Nav + main content with the usual layout chrome.
function Gate({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { loading, signedIn } = useStore();

  if (path?.startsWith("/auth")) {
    return (
      <main className="min-h-screen">
        <div className="max-w-md mx-auto px-4 py-10">{children}</div>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  if (!signedIn) {
    // Middleware redirects to /auth/signin, but we may hit this mid-redirect.
    return null;
  }

  return (
    <>
      <Nav />
      <main className="md:pl-60 pb-20 md:pb-10 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
          {children}
        </div>
      </main>
    </>
  );
}
