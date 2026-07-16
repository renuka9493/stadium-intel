import { useSyncExternalStore } from "react";

export type LiveSnapshot = {
  tick: number;
  updatedAt: number;
  gateOccupancy: number; // %
  foodQueue: number; // avg minutes
  parkingOccupancy: number; // %
  crowdDensity: number; // %
  medicalAlerts: number; // active count
  history: Array<{
    t: string;
    density: number;
    gate: number;
    food: number;
    parking: number;
  }>;
};

const HISTORY_LEN = 16;
const TICK_MS = 5000;

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

function drift(current: number, magnitude = 4, lo = 0, hi = 100) {
  return clamp(current + (Math.random() - 0.5) * 2 * magnitude, lo, hi);
}

function timeLabel(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function seed(): LiveSnapshot {
  const now = new Date();
  const base = {
    gate: 78,
    food: 11,
    parking: 82,
    density: 62,
  };
  const history = Array.from({ length: HISTORY_LEN }).map((_, i) => {
    const d = new Date(now.getTime() - (HISTORY_LEN - 1 - i) * TICK_MS);
    return {
      t: timeLabel(d),
      density: clamp(base.density + Math.sin(i / 2) * 8, 20, 95),
      gate: clamp(base.gate + Math.sin(i / 3) * 6, 30, 99),
      food: clamp(base.food + Math.sin(i / 4) * 3, 1, 30),
      parking: clamp(base.parking + Math.cos(i / 3) * 4, 30, 99),
    };
  });
  return {
    tick: 0,
    updatedAt: now.getTime(),
    gateOccupancy: base.gate,
    foodQueue: base.food,
    parkingOccupancy: base.parking,
    crowdDensity: base.density,
    medicalAlerts: 2,
    history,
  };
}

let snapshot: LiveSnapshot = seed();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function step() {
  const gateOccupancy = drift(snapshot.gateOccupancy, 4, 40, 99);
  const foodQueue = drift(snapshot.foodQueue, 1.5, 2, 28);
  const parkingOccupancy = drift(snapshot.parkingOccupancy, 2, 40, 99);
  const crowdDensity = drift(snapshot.crowdDensity, 3, 25, 96);
  // Medical alerts change rarely
  const bump = Math.random();
  const medicalAlerts = clamp(
    bump > 0.9 ? snapshot.medicalAlerts + 1 : bump < 0.1 ? snapshot.medicalAlerts - 1 : snapshot.medicalAlerts,
    0,
    5,
  );

  const now = new Date();
  const nextPoint = {
    t: timeLabel(now),
    density: crowdDensity,
    gate: gateOccupancy,
    food: foodQueue,
    parking: parkingOccupancy,
  };
  const history = [...snapshot.history.slice(1), nextPoint];

  snapshot = {
    tick: snapshot.tick + 1,
    updatedAt: now.getTime(),
    gateOccupancy,
    foodQueue,
    parkingOccupancy,
    crowdDensity,
    medicalAlerts,
    history,
  };
  listeners.forEach((l) => l());
}

function ensureRunning() {
  if (timer == null && typeof window !== "undefined") {
    timer = setInterval(step, TICK_MS);
  }
}

function stopIfIdle() {
  if (listeners.size === 0 && timer != null) {
    clearInterval(timer);
    timer = null;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  ensureRunning();
  return () => {
    listeners.delete(cb);
    stopIfIdle();
  };
}

function getSnapshot(): LiveSnapshot {
  return snapshot;
}

// Stable server snapshot avoids hydration mismatches
const serverSnapshot: LiveSnapshot = snapshot;
function getServerSnapshot(): LiveSnapshot {
  return serverSnapshot;
}

export function useLiveStadium(): LiveSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}