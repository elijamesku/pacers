import type { ReactNode } from "react";

// Auth pages are the one place in the app where the main sidebar nav is
// hidden; they're pre-sign-in or sign-out moments. The root layout still
// provides the body shell.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10">
      <div className="w-full">{children}</div>
    </div>
  );
}
