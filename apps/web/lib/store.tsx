"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Group,
  Race,
  RaceGoal,
  Rsvp,
  RsvpStatus,
  ScheduledRun,
  User,
  Workout,
} from "@pacers/core";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  createRaceGoal,
  createScheduledRun,
  createWorkout,
  deleteRaceGoal,
  fetchGroupRunsAndRsvps,
  fetchMe,
  fetchMyGroups,
  fetchMyRaceGoals,
  fetchMyWorkouts,
  fetchRaces,
  joinGroup as joinGroupQuery,
  upsertRsvp,
} from "@/lib/queries";

interface Store {
  loading: boolean;
  signedIn: boolean;
  // Me is always a User object. During `loading` or when `!signedIn`, it is a
  // placeholder; the <Gate> in app/providers.tsx guarantees consumers only
  // ever see a real signed-in user, so pages can access `me.id` directly.
  me: User;
  users: User[];
  workouts: Workout[];
  groups: Group[];
  runs: ScheduledRun[];
  rsvps: Rsvp[];
  races: Race[];
  raceGoals: RaceGoal[];
  dismissedNudges: Set<string>;
  setRsvp: (runId: string, status: RsvpStatus) => Promise<void>;
  addWorkout: (w: Omit<Workout, "id" | "userId">) => Promise<void>;
  addScheduledRun: (
    r: Omit<ScheduledRun, "id" | "createdBy">,
  ) => Promise<void>;
  addRaceGoal: (
    goal: Omit<RaceGoal, "id" | "userId" | "joinedAt" | "status">,
  ) => Promise<RaceGoal>;
  removeRaceGoal: (id: string) => Promise<void>;
  joinGroup: (id: string) => Promise<void>;
  dismissNudge: (key: string) => void;
  reload: () => Promise<void>;
}

const PLACEHOLDER_USER: User = {
  id: "",
  name: "",
  handle: "",
  avatarColor: "#0062CC",
  homeArea: "",
  typicalPace: "",
  footprintVisibility: "only_me",
};

const Ctx = createContext<Store | null>(null);

interface State {
  loading: boolean;
  signedIn: boolean;
  me: User;
  users: User[];
  workouts: Workout[];
  groups: Group[];
  runs: ScheduledRun[];
  rsvps: Rsvp[];
  races: Race[];
  raceGoals: RaceGoal[];
}

const EMPTY: State = {
  loading: true,
  signedIn: false,
  me: PLACEHOLDER_USER,
  users: [],
  workouts: [],
  groups: [],
  runs: [],
  rsvps: [],
  races: [],
  raceGoals: [],
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(EMPTY);
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(
    () => new Set(),
  );

  const load = useCallback(async () => {
    const sb = supabaseBrowser();
    const me = await fetchMe(sb);
    if (!me) {
      setState({ ...EMPTY, loading: false, signedIn: false, me: PLACEHOLDER_USER });
      return;
    }
    const [races, workouts, raceGoals, groupsRes] = await Promise.all([
      fetchRaces(sb),
      fetchMyWorkouts(sb, me.id),
      fetchMyRaceGoals(sb, me.id),
      fetchMyGroups(sb, me.id),
    ]);
    const groupIds = groupsRes.groups.map((g) => g.id);
    const { runs, rsvps } = await fetchGroupRunsAndRsvps(sb, groupIds);

    const users = groupsRes.members.some((u) => u.id === me.id)
      ? groupsRes.members
      : [me, ...groupsRes.members];

    setState({
      loading: false,
      signedIn: true,
      me,
      users,
      workouts,
      groups: groupsRes.groups,
      runs,
      rsvps,
      races,
      raceGoals,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
    })();
    const sb = supabaseBrowser();
    const { data: sub } = sb.auth.onAuthStateChange(async (event) => {
      if (cancelled) return;
      if (event === "SIGNED_OUT") {
        setState({ ...EMPTY, loading: false, signedIn: false, me: PLACEHOLDER_USER });
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await load();
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [load]);

  const setRsvp = useCallback(
    async (runId: string, status: RsvpStatus) => {
      if (!state.signedIn) return;
      const row = await upsertRsvp(supabaseBrowser(), state.me.id, runId, status);
      setState((s) => {
        const idx = s.rsvps.findIndex(
          (r) => r.runId === runId && r.userId === state.me.id,
        );
        const next = [...s.rsvps];
        if (idx === -1) next.push(row);
        else next[idx] = row;
        return { ...s, rsvps: next };
      });
    },
    [state.me, state.signedIn],
  );

  const addWorkout = useCallback(
    async (w: Omit<Workout, "id" | "userId">) => {
      if (!state.signedIn) return;
      const row = await createWorkout(supabaseBrowser(), state.me.id, w);
      setState((s) => ({ ...s, workouts: [...s.workouts, row] }));
    },
    [state.me, state.signedIn],
  );

  const addScheduledRun = useCallback(
    async (r: Omit<ScheduledRun, "id" | "createdBy">) => {
      if (!state.signedIn) return;
      const row = await createScheduledRun(supabaseBrowser(), state.me.id, r);
      setState((s) => ({ ...s, runs: [...s.runs, row] }));
    },
    [state.me, state.signedIn],
  );

  const addRaceGoal = useCallback(
    async (goal: Omit<RaceGoal, "id" | "userId" | "joinedAt" | "status">) => {
      if (!state.signedIn) throw new Error("not signed in");
      const row = await createRaceGoal(supabaseBrowser(), state.me.id, goal);
      setState((s) => ({ ...s, raceGoals: [...s.raceGoals, row] }));
      return row;
    },
    [state.me, state.signedIn],
  );

  const removeRaceGoal = useCallback(async (id: string) => {
    await deleteRaceGoal(supabaseBrowser(), id);
    setState((s) => ({ ...s, raceGoals: s.raceGoals.filter((g) => g.id !== id) }));
  }, []);

  const joinGroup = useCallback(
    async (id: string) => {
      if (!state.signedIn) return;
      await joinGroupQuery(supabaseBrowser(), state.me.id, id);
      await load();
    },
    [state.me, state.signedIn, load],
  );

  const dismissNudge = useCallback((key: string) => {
    setDismissedNudges((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const value = useMemo<Store>(
    () => ({
      loading: state.loading,
      signedIn: state.signedIn,
      me: state.me,
      users: state.users,
      workouts: state.workouts,
      groups: state.groups,
      runs: state.runs,
      rsvps: state.rsvps,
      races: state.races,
      raceGoals: state.raceGoals,
      dismissedNudges,
      setRsvp,
      addWorkout,
      addScheduledRun,
      addRaceGoal,
      removeRaceGoal,
      joinGroup,
      dismissNudge,
      reload: load,
    }),
    [
      state,
      dismissedNudges,
      setRsvp,
      addWorkout,
      addScheduledRun,
      addRaceGoal,
      removeRaceGoal,
      joinGroup,
      dismissNudge,
      load,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside StoreProvider");
  return v;
}

// Returns the store only when the user is signed in and loaded; otherwise
// null. Pages that render after the <Gate> can usually just call useStore()
// directly and trust me.id — this is for places that want a stricter guard.
export function useStoreSignedIn() {
  const s = useStore();
  if (s.loading || !s.signedIn) return null;
  return s;
}
