// Platform-agnostic type scale.
// Web applies via Tailwind text-* classes mapped to these sizes.
// Mobile uses the pixel values directly in Text styles.

export const TYPE = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: "600" as const, letterSpacing: -0.5 },
  h1:      { fontSize: 24, lineHeight: 32, fontWeight: "600" as const, letterSpacing: -0.3 },
  h2:      { fontSize: 20, lineHeight: 28, fontWeight: "600" as const, letterSpacing: -0.2 },
  h3:      { fontSize: 16, lineHeight: 22, fontWeight: "600" as const, letterSpacing: 0 },
  body:    { fontSize: 15, lineHeight: 22, fontWeight: "400" as const, letterSpacing: 0 },
  small:   { fontSize: 13, lineHeight: 18, fontWeight: "400" as const, letterSpacing: 0 },
  caption: { fontSize: 11, lineHeight: 14, fontWeight: "500" as const, letterSpacing: 0.4, textTransform: "uppercase" as const },
} as const;

export type TypeToken = keyof typeof TYPE;
