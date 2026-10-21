// Platform-agnostic spacing scale, in pixels.
// Web uses with Tailwind utility classes or arbitrary values.
// Mobile passes directly to React Native style props.

export const SPACE = {
  "0": 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
} as const;

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export type SpaceToken = keyof typeof SPACE;
export type RadiusToken = keyof typeof RADIUS;
