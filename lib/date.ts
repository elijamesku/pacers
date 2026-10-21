import {
  startOfWeek,
  addDays,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";

export const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
export const WEEKDAY_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function weekFromDate(d: Date): Date[] {
  const start = startOfWeek(d, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthGrid(d: Date): Date[] {
  const start = startOfWeek(startOfMonth(d), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(d), { weekStartsOn: 1 });
  const out: Date[] = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

export function toISODate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function fmtDay(d: Date): string {
  return format(d, "EEE, MMM d");
}

export function fmtTime(d: Date): string {
  return format(d, "h:mm a");
}

export function fmtPace(secPerMi: number | undefined): string {
  if (secPerMi == null) return "—";
  const m = Math.floor(secPerMi / 60);
  const s = Math.round(secPerMi % 60);
  return `${m}:${s.toString().padStart(2, "0")}/mi`;
}

export function fmtDistance(mi: number): string {
  const rounded = Math.round(mi * 10) / 10;
  return `${rounded} mi`;
}

export function sameDay(a: Date | string, b: Date | string): boolean {
  const da = typeof a === "string" ? parseISO(a) : a;
  const db = typeof b === "string" ? parseISO(b) : b;
  return isSameDay(da, db);
}

export {
  startOfWeek,
  addDays,
  format,
  parseISO,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  getDay,
  startOfMonth,
  endOfMonth,
};
