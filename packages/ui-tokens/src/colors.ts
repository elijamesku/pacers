// Design tokens. Platform-agnostic hex values.
// Web consumes via CSS vars (map in globals.css). Mobile consumes directly.
// Placeholder brand; swap `brand` for Heartbreak's final palette.

export const COLORS_LIGHT = {
  // Brand
  brand: "#B91C1C",
  brandHover: "#991B1B",
  brandMuted: "#FEE2E2",

  // Surfaces
  background: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceMuted: "#F9FAFB",
  surfaceInverse: "#111827",

  // Text
  foreground: "#0F172A",
  muted: "#6B7280",
  mutedStrong: "#374151",
  onBrand: "#FFFFFF",

  // Borders
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",

  // Status
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  info: "#2563EB",
} as const;

export const COLORS_DARK = {
  brand: "#EF4444",
  brandHover: "#F87171",
  brandMuted: "#7F1D1D",

  background: "#0B0F17",
  surface: "#111827",
  surfaceMuted: "#1F2937",
  surfaceInverse: "#F9FAFB",

  foreground: "#F9FAFB",
  muted: "#9CA3AF",
  mutedStrong: "#D1D5DB",
  onBrand: "#FFFFFF",

  border: "#1F2937",
  borderStrong: "#374151",

  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
} as const;

export type ColorToken = keyof typeof COLORS_LIGHT;
