import { useSyncExternalStore } from "react";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentPriority = "low" | "medium" | "high" | "urgent";
export type IncidentStatus = "new" | "assigned" | "in_progress" | "resolved";

export type IncidentTimelineEntry = {
  at: number;
  label: string;
  detail?: string;
};

export type Incident = {
  id: string;
  type: string;
  location: string;
  description: string;
  reportedAt: number;
  source: "fan" | "seed";
  status: IncidentStatus;
  assignedTeam?: string;
  ai?: {
    severity: IncidentSeverity;
    priority: IncidentPriority;
    suggestedResponse: string;
    estimatedResolutionMinutes: number;
    analyzing?: boolean;
  };
  timeline: IncidentTimelineEntry[];
};

const STORAGE_KEY = "stadium-brain:incidents:v1";

function now() {
  return Date.now();
}

function seedIncidents(): Incident[] {
  const t = now();
  return [
    {
      id: "INC-2039",
      type: "Lost person",
      location: "Gate D",
      description: "8-year-old separated from parents near turnstile 4.",
      reportedAt: t - 42 * 60_000,
      source: "seed",
      status: "resolved",
      assignedTeam: "Guest Services",
      ai: {
        severity: "medium",
        priority: "high",
        suggestedResponse:
          "Dispatch guest services and lock down Gate D exits until reunification.",
        estimatedResolutionMinutes: 8,
      },
      timeline: [
        { at: t - 42 * 60_000, label: "Reported by fan" },
        { at: t - 41 * 60_000, label: "AI analysis complete", detail: "Severity Medium, Priority High" },
        { at: t - 40 * 60_000, label: "Assigned to Guest Services" },
        { at: t - 38 * 60_000, label: "Marked in progress" },
        { at: t - 34 * 60_000, label: "Resolved", detail: "Child reunited with family" },
      ],
    },
    {
      id: "INC-2040",
      type: "Overcrowding",
      location: "Food Court East",
      description: "Queue overflowing into main concourse, blocking flow.",
      reportedAt: t - 18 * 60_000,
      source: "seed",
      status: "in_progress",
      assignedTeam: "Ops Team A",
      ai: {
        severity: "high",
        priority: "high",
        suggestedResponse:
          "Open the reserve kiosk on Concourse 2 and redirect fans via digital signage.",
        estimatedResolutionMinutes: 12,
      },
      timeline: [
        { at: t - 18 * 60_000, label: "Reported by fan" },
        { at: t - 17 * 60_000, label: "AI analysis complete", detail: "Severity High, Priority High" },
        { at: t - 15 * 60_000, label: "Assigned to Ops Team A" },
        { at: t - 12 * 60_000, label: "Marked in progress" },
      ],
    },
  ];
}

function loadInitial(): Incident[] {
  if (typeof window === "undefined") return seedIncidents();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedIncidents();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Incident[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seedIncidents();
    return parsed;
  } catch {
    return seedIncidents();
  }
}

let incidents: Incident[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
  } catch {
    // ignore
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  incidents = loadInitial();
  hydrated = true;
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY || !e.newValue) return;
    try {
      incidents = JSON.parse(e.newValue) as Incident[];
      emit();
    } catch {
      // ignore
    }
  });
}

function update(next: Incident[]) {
  incidents = next;
  persist();
  emit();
}

function subscribe(cb: () => void) {
  ensureHydrated();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): Incident[] {
  ensureHydrated();
  return incidents;
}

const serverSnapshot: Incident[] = [];
function getServerSnapshot(): Incident[] {
  return serverSnapshot;
}

export function useIncidents(): Incident[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function nextId(): string {
  ensureHydrated();
  const nums = incidents
    .map((i) => Number.parseInt(i.id.replace(/[^0-9]/g, ""), 10))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 2040) + 1;
  return `INC-${next}`;
}

export function createIncident(input: {
  type: string;
  location: string;
  description: string;
}): Incident {
  ensureHydrated();
  const t = now();
  const incident: Incident = {
    id: nextId(),
    type: input.type,
    location: input.location,
    description: input.description,
    reportedAt: t,
    source: "fan",
    status: "new",
    timeline: [{ at: t, label: "Reported by fan" }],
    ai: {
      severity: "medium",
      priority: "medium",
      suggestedResponse: "Analyzing report...",
      estimatedResolutionMinutes: 0,
      analyzing: true,
    },
  };
  update([incident, ...incidents]);
  return incident;
}

function patch(id: string, updater: (incident: Incident) => Incident) {
  ensureHydrated();
  update(incidents.map((i) => (i.id === id ? updater(i) : i)));
}

export function attachAiAnalysis(
  id: string,
  ai: {
    severity: IncidentSeverity;
    priority: IncidentPriority;
    suggestedResponse: string;
    estimatedResolutionMinutes: number;
  },
) {
  patch(id, (i) => ({
    ...i,
    ai: { ...ai, analyzing: false },
    timeline: [
      ...i.timeline,
      {
        at: now(),
        label: "AI analysis complete",
        detail: `Severity ${ai.severity}, Priority ${ai.priority}, ETA ~${ai.estimatedResolutionMinutes} min`,
      },
    ],
  }));
}

export function markAiAnalysisFailed(id: string) {
  patch(id, (i) =>
    i.ai
      ? {
          ...i,
          ai: {
            ...i.ai,
            analyzing: false,
            suggestedResponse: "AI analysis unavailable - awaiting operator review.",
          },
          timeline: [
            ...i.timeline,
            { at: now(), label: "AI analysis failed", detail: "Awaiting operator review" },
          ],
        }
      : i,
  );
}

export function assignTeam(id: string, team: string) {
  patch(id, (i) => ({
    ...i,
    assignedTeam: team,
    status: i.status === "new" ? "assigned" : i.status,
    timeline: [
      ...i.timeline,
      { at: now(), label: "Team assigned", detail: team },
    ],
  }));
}

export function setStatus(id: string, status: IncidentStatus, note?: string) {
  patch(id, (i) => ({
    ...i,
    status,
    timeline: [
      ...i.timeline,
      {
        at: now(),
        label:
          status === "in_progress"
            ? "Marked in progress"
            : status === "resolved"
              ? "Resolved"
              : status === "assigned"
                ? "Assigned"
                : "Status updated",
        detail: note,
      },
    ],
  }));
}

export const INCIDENT_TYPES = [
  "Medical",
  "Security",
  "Overcrowding",
  "Lost person",
  "Fire / smoke",
  "Spill / hazard",
  "Suspicious item",
  "Facility issue",
  "Other",
] as const;

export const TEAMS = [
  "Medical Response",
  "Security Team A",
  "Security Team B",
  "Ops Team A",
  "Guest Services",
  "Facilities",
] as const;

export function severityTone(sev: IncidentSeverity): string {
  switch (sev) {
    case "critical":
      return "bg-destructive/25 text-destructive ring-1 ring-destructive/50";
    case "high":
      return "bg-destructive/20 text-destructive ring-1 ring-destructive/40";
    case "medium":
      return "bg-chart-3/20 text-chart-3 ring-1 ring-chart-3/40";
    default:
      return "bg-accent/20 text-accent ring-1 ring-accent/40";
  }
}

export function priorityTone(p: IncidentPriority): string {
  switch (p) {
    case "urgent":
      return "bg-destructive/25 text-destructive ring-1 ring-destructive/50";
    case "high":
      return "bg-destructive/15 text-destructive ring-1 ring-destructive/30";
    case "medium":
      return "bg-chart-3/20 text-chart-3 ring-1 ring-chart-3/40";
    default:
      return "bg-secondary text-muted-foreground ring-1 ring-border";
  }
}

export function statusLabel(s: IncidentStatus): string {
  switch (s) {
    case "new":
      return "New";
    case "assigned":
      return "Assigned";
    case "in_progress":
      return "In progress";
    case "resolved":
      return "Resolved";
  }
}

export function statusTone(s: IncidentStatus): string {
  switch (s) {
    case "new":
      return "bg-destructive/20 text-destructive ring-1 ring-destructive/40";
    case "assigned":
      return "bg-primary/15 text-primary ring-1 ring-primary/30";
    case "in_progress":
      return "bg-chart-3/20 text-chart-3 ring-1 ring-chart-3/40";
    case "resolved":
      return "bg-accent/20 text-accent ring-1 ring-accent/40";
  }
}

export function formatTime(t: number): string {
  const d = new Date(t);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
