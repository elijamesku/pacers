"use client";

import Link from "next/link";
import { Lock, Users as UsersIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { AvatarStack } from "@/components/Avatar";

export default function GroupsPage() {
  const { groups, users } = useStore();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Groups
        </h1>
        <p className="text-sm text-muted mt-1">
          The people you train with. Private by default.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {groups.map((g) => {
          const members = users.filter((u) => g.memberIds.includes(u.id));
          return (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="card p-5 flex flex-col gap-3 hover:border-border-strong transition-colors focus-ring"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {g.name}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
                    {g.isPrivate && <Lock size={11} />}
                    {g.isPrivate ? "Private" : "Open"}
                    <span>·</span>
                    <UsersIcon size={11} />
                    {g.memberIds.length} members
                  </div>
                </div>
                <AvatarStack users={members} size={28} max={3} />
              </div>
              {g.description && (
                <p className="text-sm text-muted leading-relaxed">
                  {g.description}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
