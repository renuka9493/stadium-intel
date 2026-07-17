import { createFileRoute } from "@tanstack/react-router";
import { LiveBadge } from "@/components/live-badge";
import { useLiveStadium } from "@/lib/live-stadium";
import { Panel, LiveTag, PriorityChip, Field, MiniBar, StatMini } from "@/components/ops";
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
  safe: { bg: "bg-success/12", text: "text-success", ring: "ring-success/30", dot: "bg-success" },
  warning: { bg: "bg-warning/12", text: "text-warning", ring: "ring-warning/30", dot: "bg-warning" },
  critical: { bg: "bg-critical/12", text: "text-critical", ring: "ring-critical/30", dot: "bg-critical" },
};

type Metric = {
  label: string;
  value: string;
  detail: string;
  progress: number;
  tone: Tone;
  icon: LucideIcon;
};

function toneFor(pct: number, warn = 70, crit = 90): Tone {
  if (pct >= crit) return "critical";
  if (pct >= warn) return "warning";
  return "safe";
}

function useLiveMetrics(): Metric[] {
  const s = useLiveStadium();
  return [
    {
      label: "Live Crowd Density",
      value: `${Math.round(s.crowdDensity)}%`,
      detail: `${Math.round(823 * s.crowdDensity).toLocaleString()} / 82,340 fans present`,
      progress: s.crowdDensity,
      tone: toneFor(s.crowdDensity, 65, 88),
      icon: Users,
    },
    {
      label: "Gate Occupancy",
      value: `${Math.round(s.gateOccupancy)}%`,
      detail: s.gateOccupancy > 90 ? "Gate C approaching threshold" : "All gates within limits",
      progress: s.gateOccupancy,
      tone: toneFor(s.gateOccupancy, 75, 92),
      icon: DoorOpen,
    },
    {
      label: "Queue Lengths",
      value: `${s.foodQueue.toFixed(1)} min`,
      detail: "Avg wait across 12 zones",
      progress: Math.min(100, (s.foodQueue / 25) * 100),
      tone: toneFor((s.foodQueue / 25) * 100, 50, 80),
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
      value: `${Math.round(s.parkingOccupancy)}%`,
      detail: s.parkingOccupancy > 90 ? "Lots A–D nearing capacity" : "Steady inbound flow",
      progress: s.parkingOccupancy,
      tone: toneFor(s.parkingOccupancy, 75, 92),
      icon: ParkingCircle,
    },
    {
      label: "Medical Alerts",
      value: `${s.medicalAlerts} active`,
      detail: s.medicalAlerts > 0 ? "Response teams engaged" : "No active dispatches",
      progress: Math.min(100, s.medicalAlerts * 25),
      tone: s.medicalAlerts >= 3 ? "critical" : s.medicalAlerts > 0 ? "warning" : "safe",
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
}

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
  dataSources: string[];
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
    dataSources: ["Gate sensor telemetry", "Ticket scan feed", "Historical ingress curves"],
    action: "Open Gate D and redirect spectators arriving from the East entrance.",
    improvement: "Reduce waiting time by approximately 18%.",
    confidence: 96,
  },
  {
    priority: "high",
    problem: "Food Court West has reached 91% occupancy.",
    reasoning:
      "Historical halftime data combined with current crowd movement indicates congestion will continue increasing.",
    dataSources: ["Vendor queue sensors", "Historical halftime patterns", "Live crowd density"],
    action: "Deploy 2 additional attendants and open express lanes 4–5.",
    improvement: "Queue time reduced by approximately 30%.",
    confidence: 94,
  },
  {
    priority: "medium",
    problem: "Parking Lot B is at 91% occupancy.",
    reasoning:
      "Inbound vehicle flow from Highway 4 exceeds Lot B intake rate; Lot F is currently underutilized at 38%.",
    dataSources: ["Parking occupancy sensors", "Highway inbound counters", "Wayfinding signage state"],
    action: "Route inbound vehicles to Lot F and update wayfinding signage.",
    improvement: "Balance parking load by 22%.",
    confidence: 88,
  },
  {
    priority: "medium",
    problem: "Sections 214–220 report elevated temperature readings.",
    reasoning:
      "Ambient sensors show +4°C above target with direct sun exposure on upper east concourse through halftime.",
    dataSources: ["Ambient temperature sensors", "Weather feed", "HVAC telemetry"],
    action: "Increase cooling output by 15% in the upper east concourse.",
    improvement: "Improve comfort index by 12%.",
    confidence: 82,
  },
  {
    priority: "low",
    problem: "Concourse 3 shows minor litter accumulation.",
    reasoning:
      "Computer vision on Camera CV-31 detects debris density trending 2.1× the pre-match baseline.",
    dataSources: ["CCTV computer vision (CV-31)", "Cleaning crew schedule"],
    action: "Dispatch cleaning crew during the next play stoppage.",
    improvement: "Fan sentiment score up 6%.",
    confidence: 74,
  },
];

function StatusBanner({ metrics }: { metrics: Metric[] }) {
  const worst: Tone = metrics.some((m) => m.tone === "critical")
    ? "critical"
    : metrics.some((m) => m.tone === "warning")
      ? "warning"
      : "safe";
  const tone: Tone = worst;
  const label = tone === "critical" ? "Critical" : tone === "warning" ? "Warning" : "Nominal";
  const styles = toneClasses[tone];
  const counts = {
    safe: metrics.filter((m) => m.tone === "safe").length,
    warning: metrics.filter((m) => m.tone === "warning").length,
    critical: metrics.filter((m) => m.tone === "critical").length,
  };
  return (
    <div className={`mb-3 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[10px] border border-border bg-card px-3 py-2 shadow-card ring-1 ${styles.ring}`}>
      <span className={`grid h-8 w-8 place-items-center rounded-md ${styles.bg} ${styles.text} ring-1 ${styles.ring}`}>
        <Gauge className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Stadium Status</span>
          <span className={`inline-flex items-center gap-1 text-[12px] font-semibold ${styles.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot} pulse-dot`} />
            {label}
          </span>
        </div>
        <div className="mt-0.5 text-[10.5px] text-muted-foreground truncate">
          {metrics.length} channels monitored · AI Commander active
        </div>
      </div>
      <div className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.14em] sm:flex">
        <span className="rounded-sm bg-success/10 px-1.5 py-0.5 text-success ring-1 ring-success/30 tabular-nums">{counts.safe} safe</span>
        <span className="rounded-sm bg-warning/10 px-1.5 py-0.5 text-warning ring-1 ring-warning/30 tabular-nums">{counts.warning} warn</span>
        <span className="rounded-sm bg-critical/10 px-1.5 py-0.5 text-critical ring-1 ring-critical/30 tabular-nums">{counts.critical} crit</span>
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const styles = toneClasses[metric.tone];
  return (
    <div className="rounded-[10px] border border-border bg-card p-3 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`grid h-6 w-6 place-items-center rounded-md ${styles.bg} ${styles.text} ring-1 ${styles.ring}`}>
            <metric.icon className="h-3 w-3" />
          </span>
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{metric.label}</span>
        </div>
        <span className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${styles.text}`}>{metric.tone}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-[20px] font-semibold tabular-nums leading-none">{metric.value}</span>
      </div>
      <div className="mt-1 truncate text-[10.5px] text-muted-foreground">{metric.detail}</div>
      <div className="mt-2">
        <MiniBar value={metric.progress} tone={metric.tone === "safe" ? "success" : metric.tone === "warning" ? "warning" : "critical"} />
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <article className="rounded-[8px] border border-border bg-background p-2.5">
      <div className="flex items-center justify-between">
        <PriorityChip p={rec.priority} />
        <span className="text-[10px] tabular-nums text-muted-foreground">Conf {rec.confidence}%</span>
      </div>
      <div className="mt-2 space-y-1.5">
        <Field label="Problem" value={rec.problem} />
        <Field label="Reasoning" value={rec.reasoning} />
        <div>
          <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Data sources</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {rec.dataSources.map((d, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-[4px] border border-border bg-secondary/50 px-1.5 py-0.5 text-[10px] text-foreground/80"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
        <Field label="Action" value={rec.action} tone="accent" />
        <Field label="Impact" value={rec.improvement} tone="success" />
      </div>
      <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${rec.confidence}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5">
        <button className="rounded-[6px] border border-border bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground">Dismiss</button>
        <button className="rounded-[6px] bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground hover:brightness-110">Apply</button>
      </div>
    </article>
  );
}

function MissionControl() {
  const metrics = useLiveMetrics();
  const s = useLiveStadium();
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <h1 className="truncate text-[13px] font-semibold tracking-tight">Mission Control</h1>
          <p className="hidden text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground sm:block">
            Central AI command center · live telemetry
          </p>
        </div>
        <LiveBadge />
      </div>
      <StatusBanner metrics={metrics} />

      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {metrics.map((m) => (
              <MetricCard key={m.label} metric={m} />
            ))}
          </div>

          <Panel title="Zone Load" subtitle="Live percentage by zone" right={<LiveTag />}>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <StatMini label="North" value={`${Math.round(s.crowdDensity * 0.98)}%`} hint="+1.2%" />
              <StatMini label="South" value={`${Math.round(s.crowdDensity * 0.86)}%`} hint="-0.4%" />
              <StatMini label="East" value={`${Math.round(s.crowdDensity * 1.12)}%`} hint="+3.1%" tone="warning" />
              <StatMini label="West" value={`${Math.round(s.crowdDensity * 0.92)}%`} hint="+0.6%" />
            </div>
          </Panel>
        </div>

        <Panel
          title="AI Commander"
          subtitle="Continuous decision support"
          right={
            <>
              <span className="text-[10px] tabular-nums text-muted-foreground">{recommendations.length} active</span>
              <LiveTag />
            </>
          }
        >
          <div className="mb-2 flex items-center gap-1.5 rounded-[6px] border border-border bg-background px-2 py-1 text-[10.5px] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            Analysis cycle 4s · Gemini grounded in live snapshot
          </div>
          <div className="space-y-2">
            {recommendations.map((r, i) => (
              <RecommendationCard key={i} rec={r} />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}