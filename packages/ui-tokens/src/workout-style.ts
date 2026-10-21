import type { WorkoutType } from "@pacers/core";

interface Style {
  label: string;
  color: string;
  bg: string;
  text: string;
}

export const WORKOUT_STYLES: Record<WorkoutType, Style> = {
  easy:      { label: "Easy",      color: "#059669", bg: "#d1fae5", text: "#065f46" },
  long:      { label: "Long",      color: "#7c3aed", bg: "#ede9fe", text: "#5b21b6" },
  tempo:     { label: "Tempo",     color: "#d97706", bg: "#fef3c7", text: "#92400e" },
  intervals: { label: "Intervals", color: "#dc2626", bg: "#fee2e2", text: "#991b1b" },
  race:      { label: "Race",      color: "#be123c", bg: "#ffe4e6", text: "#881337" },
  recovery:  { label: "Recovery",  color: "#0284c7", bg: "#e0f2fe", text: "#075985" },
  cross:     { label: "Cross",     color: "#6b7280", bg: "#f3f4f6", text: "#374151" },
  rest:      { label: "Rest",      color: "#9ca3af", bg: "#f9fafb", text: "#4b5563" },
};
