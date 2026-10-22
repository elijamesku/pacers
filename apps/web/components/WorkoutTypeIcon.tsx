import {
  Footprints,
  Route,
  Flame,
  Zap,
  Trophy,
  Bike,
  Dumbbell,
  Moon,
} from "lucide-react";
import type { WorkoutType } from "@pacers/core";

const MAP: Record<WorkoutType, typeof Footprints> = {
  easy: Footprints,
  long: Route,
  tempo: Flame,
  intervals: Zap,
  race: Trophy,
  recovery: Bike,
  cross: Dumbbell,
  rest: Moon,
};

export function WorkoutTypeIcon({
  type,
  size = 16,
}: {
  type: WorkoutType;
  size?: number;
}) {
  const Icon = MAP[type];
  return <Icon size={size} strokeWidth={2} />;
}
