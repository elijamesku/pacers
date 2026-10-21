"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CURRENT_USER_ID,
  GROUPS,
  RSVPS,
  SCHEDULED_RUNS,
  USERS,
  WORKOUTS,
} from "./mock-data";
import type {
  Group,
  Rsvp,
  RsvpStatus,
  ScheduledRun,
  User,
  Workout,
} from "./types";

interface Store {
  me: User;
  users: User[];
  workouts: Workout[];
  groups: Group[];
  runs: ScheduledRun[];
  rsvps: Rsvp[];
  setRsvp: (runId: string, status: RsvpStatus) => void;
  addWorkout: (w: Omit<Workout, "id">) => void;
  addScheduledRun: (r: Omit<ScheduledRun, "id" | "createdBy">) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>(WORKOUTS);
  const [rsvps, setRsvps] = useState<Rsvp[]>(RSVPS);
  const [runs, setRuns] = useState<ScheduledRun[]>(SCHEDULED_RUNS);

  const setRsvp = useCallback((runId: string, status: RsvpStatus) => {
    setRsvps((prev) => {
      const idx = prev.findIndex(
        (r) => r.runId === runId && r.userId === CURRENT_USER_ID,
      );
      if (idx === -1) {
        return [...prev, { runId, userId: CURRENT_USER_ID, status }];
      }
      const next = [...prev];
      next[idx] = { ...next[idx], status };
      return next;
    });
  }, []);

  const addWorkout = useCallback((w: Omit<Workout, "id">) => {
    setWorkouts((prev) => [
      ...prev,
      { ...w, id: `w_${Date.now().toString(36)}` },
    ]);
  }, []);

  const addScheduledRun = useCallback(
    (r: Omit<ScheduledRun, "id" | "createdBy">) => {
      setRuns((prev) => [
        ...prev,
        { ...r, id: `sr_${Date.now().toString(36)}`, createdBy: CURRENT_USER_ID },
      ]);
    },
    [],
  );

  const value = useMemo<Store>(
    () => ({
      me: USERS.find((u) => u.id === CURRENT_USER_ID)!,
      users: USERS,
      workouts,
      groups: GROUPS,
      runs,
      rsvps,
      setRsvp,
      addWorkout,
      addScheduledRun,
    }),
    [workouts, runs, rsvps, setRsvp, addWorkout, addScheduledRun],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside StoreProvider");
  return v;
}
