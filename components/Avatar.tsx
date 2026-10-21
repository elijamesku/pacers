import type { User } from "@/lib/types";

interface Props {
  user: Pick<User, "name" | "avatarColor">;
  size?: number;
  ring?: boolean;
}

export function Avatar({ user, size = 32, ring = false }: Props) {
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        background: user.avatarColor,
        boxShadow: ring ? "0 0 0 2px var(--surface)" : undefined,
      }}
    >
      {initials}
    </span>
  );
}

interface StackProps {
  users: Pick<User, "name" | "avatarColor">[];
  size?: number;
  max?: number;
}

export function AvatarStack({ users, size = 28, max = 4 }: StackProps) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((u, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar user={u} size={size} ring />
        </div>
      ))}
      {extra > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full bg-surface-muted text-muted font-medium"
          style={{
            width: size,
            height: size,
            fontSize: Math.round(size * 0.38),
            marginLeft: -8,
            boxShadow: "0 0 0 2px var(--surface)",
          }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
