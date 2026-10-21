"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Home,
  Map,
  Users,
  UserCircle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Avatar } from "./Avatar";
import clsx from "clsx";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/footprint", label: "Footprint", icon: Map },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export function Nav() {
  const pathname = usePathname();
  const { me } = useStore();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:left-0 border-r border-border bg-surface px-4 py-5"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-2 px-2 mb-6">
          <div
            aria-hidden
            className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold"
          >
            p
          </div>
          <span className="font-semibold tracking-tight">pacers</span>
        </div>
        <nav className="flex flex-col gap-1">
          {items.map((it) => {
            const Icon = it.icon;
            const active = isActive(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-surface-muted text-foreground"
                    : "text-muted hover:text-foreground hover:bg-surface-muted",
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.3 : 1.9} />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center gap-3 px-2 py-3 border-t border-border">
          <Avatar user={me} size={32} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{me.name}</div>
            <div className="text-xs text-muted truncate">@{me.handle}</div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-20 bg-surface/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div
            aria-hidden
            className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold"
          >
            p
          </div>
          <span className="font-semibold tracking-tight">pacers</span>
        </Link>
        <Avatar user={me} size={30} />
      </header>

      {/* Mobile bottom bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-surface/95 backdrop-blur border-t border-border grid grid-cols-5"
        aria-label="Bottom navigation"
      >
        {items.map((it) => {
          const Icon = it.icon;
          const active = isActive(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px]",
                active ? "text-primary" : "text-muted",
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.3 : 1.9} />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
