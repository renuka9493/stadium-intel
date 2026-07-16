import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import {
  AlertTriangle,
  Ambulance,
  Cloud,
  DoorOpen,
  Gauge,
  ParkingCircle,
  ShieldAlert,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/admin/mission")({
  component: MissionControl,
});

type Tone = "safe" | "warning" | "critical";

const toneClasses: Record<Tone, { bg: string; text: string; ring: string; dot: string }> = {
  safe: {
    bg: "bg-accent/15",
    text: "text-accent",
    ring: "ring-accent/30",
    dot: "bg-accent",
  },
  warning: {
    bg: "bg-chart-3/15",
    text: "text-chart-3",
    ring: "ring-chart-3/30",
    dot: "bg-chart-3",
  },
  critical: {
    bg: "bg-destructive/15",
    text: "text-destructive",
    ring: "ring-destructive/40",
    dot: "bg-destructive",
  },
};

type Metric = {
  label: string;
  value: string;
  detail: string;
  progress: number;
  tone: Tone;
  icon: LucideIcon;
};

const metrics: Metric[] = [
  {
    label: "Live Crowd Density",
    value: "78%",
    detail: "64,120 / 82,340 fans present",
    progress: 78,
    tone: "warning",
    icon: Users,
  },
  {
    label: "Gate Occupancy",
    value: "94%",
    detail: "Gate C approaching threshold",
    progress: 94,
    tone: "critical",
    icon: DoorOpen,
  },
  {
    label: "Queue Lengths",
    value: "11 min",
    detail: "Avg wait across 12 zones",
    progress: 62,
    tone: "warning",
    icon: Timer,
  },
  {
    label: "Weather Status",
    value: "24°C",
    detail: "Clear · Wind 8 km/h SW",
    progress: 30,
    tone: "safe",
    icon: Cloud,
  },
  {
    label: "Parking Occupancy",
    value: "82%",
    detail: "Lots A–D nearing capacity",
    progress: 82,
    tone: "warning",
    icon: ParkingCircle,
  },
  {
    label: "Medical Alerts",
    value: "2 active",
    detail: "Sec 118 · Sec 204",
    progress: 25,
    tone: "warning",
    icon: Ambulance,
  },
  {
    label: "Security Alerts",
    value: "0 active",
    detail: "All perimeters normal",
    progress: 10,
    tone: "safe",
    icon: ShieldAlert,
  },
];

type Priority = "low" | "medium" | "high";

const priorityStyles: Record<Priority, string> = {
  high: "bg-destructive/20 text-destructive ring-1 ring-destructive/40",
  medium: "bg-chart-3/20 text-chart-3 ring-1 ring-chart-3/40",
  low: "bg-accent/20 text-accent ring-1 ring-accent/40",
};

type Recommendation = {
  priority: Priority;
  problem: string;
  reasoning: string;
  action: string;
  improvement: string;
  confidence: number;
};

const recommendations: Recommendation[] = [
  {
    priority: "high",
    problem: "Gate C is operating at 94% capacity.",
    reasoning:
      "Ingress rate over the last 10 minutes combined with pre-match ticket scan data projects Gate C will hit 100% within 6 minutes.",
    action: "Open Gate D and redirect spectators arriving from the East entrance.",
    improvement: "Reduce waiting time by approximately 18%.",
    confidence: 96,
  },
  {
    priority: "high",
    problem: "Food Court West has reached 91% occupancy.",
    reasoning:
      "Historical halftime data combined with current crowd movement indicates congestion will continue increasing.",
    action: "Deploy 2 additional attendants and open express lanes 4–5.",
    improvement: "Queue time reduced by approximately 30%.",
    confidence: 94,
  },
  {
    priority: "medium",
    problem: "Parking Lot B is at 91% occupancy.",
    reasoning:
      "Inbound vehicle flow from Highway 4 exceeds Lot B intake rate; Lot F is currently underutilized at 38%.",
    action: "Route inbound vehicles to Lot F and update wayfinding signage.",
    improvement: "Balance parking load by 22%.",
    confidence: 88,
  },
  {
    priority: "medium",
    problem: "Sections 214–220 report elevated temperature readings.",
    reasoning:
      "Ambient sensors show +4°C above target with direct sun exposure on upper east concourse through halftime.",
    action: "Increase cooling output by 15% in the upper east concourse.",
    improvement: "Improve comfort index by 12%.",
    confidence: 82,
  },
  {
    priority: "low",
    problem: "Concourse 3 shows minor litter accumulation.",
    reasoning:
      "Computer vision on Camera CV-31 detects debris density trending 2.1× the pre-match baseline.",
    action: "Dispatch cleaning crew during the next play stoppage.",
    improvement: "Fan sentiment score up 6%.",
    confidence: 74,
  },
];

function StatusBanner() {
  const tone: Tone = "warning";
  const styles = toneClasses[tone];
  return (
    <div
      className={`mb-6 grid gap-4 rounded-2xl border border-border/60 p-5 shadow-card sm:grid-cols-[auto_1fr_auto] sm:items-center ${styles.bg} ring-1 ${styles.ring}`}
    >
      <span className={`grid h-14 w-14 place-items-center rounded-xl ${styles.bg} ${styles.text}`}>
        <Gauge className="h-7 w-7" />
      </span>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Overall Stadium Status</div>
        <div className={`mt-1 flex items-center gap-2 text-2xl font-bold ${styles.text}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${styles.dot} pulse-dot`} />
          Warning · Elevated pressure
        </div>
        <p className="text-sm text-muted-foreground">
          Ingress load and Gate C occupancy require attention. AI Commander is generating live actions.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
          Safe
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${styles.bg} ${styles.text}`}>
          Warning
        </span>
        <span className="rounded-full bg-destructive/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-destructive">
          Critical
        </span>
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const styles = toneClasses[metric.tone];
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-lg ${styles.bg} ${styles.text} ring-1 ${styles.ring}`}>
          <metric.icon className="h-5 w-5" />
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${styles.bg} ${styles.text}`}>
          {metric.tone}
        </span>
      </div>
      <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{metric.label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{metric.value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{metric.detail}</div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${styles.dot}`}
          style={{ width: `${metric.progress}%` }}
        />
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${priorityStyles[rec.priority]}`}>
          {rec.priority}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3 w-3" /> AI
        </span>
      </div>
      <div className="mt-3 space-y-3 text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Problem detected</div>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{rec.problem}</p>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Reasoning</div>
          <p className="mt-0.5 text-foreground/80">{rec.reasoning}</p>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Recommended action</div>
          <p className="mt-0.5 text-foreground/90">{rec.action}</p>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Estimated improvement</div>
          <p className="mt-0.5 text-accent">{rec.improvement}</p>
        </div>
        <div>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Confidence</span>
            <span className="tabular-nums text-foreground">{rec.confidence}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-accent"
              style={{ width: `${rec.confidence}%` }}
            />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button className="flex-1 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">
          Apply
        </button>
        <button className="rounded-lg border border-border/60 bg-secondary px-3 py-1.5 text-xs">
          Dismiss
        </button>
      </div>
    </div>
  );
}

function MissionControl() {
  return (
    <div>
      <PageHeader
        title="Mission Control"
        description="Central AI command center — live telemetry across every stadium system."
      />
      <StatusBanner />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((m) => (
            <MetricCard key={m.label} metric={m} />
          ))}
        </div>
        <aside className="rounded-2xl border border-primary/30 bg-card p-5 shadow-card ring-1 ring-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-bold">AI Commander</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Continuously analyzing
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" /> Live
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/60 p-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-chart-3" />
            {recommendations.length} recommendations · updated 4s ago
          </div>
          <div className="mt-4 space-y-3">
            {recommendations.map((r, i) => (
              <RecommendationCard key={i} rec={r} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}