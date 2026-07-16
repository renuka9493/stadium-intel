import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal-shell";
import { useLiveStadium } from "@/lib/live-stadium";
import { useIncidents } from "@/lib/incidents-store";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  Car,
  CheckCircle2,
  Cpu,
  DoorOpen,
  FileText,
  FlaskConical,
  Gauge,
  Heart,
  History,
  Map as MapIcon,
  Settings,
  ShieldCheck,
  Siren,
  Sparkles,
  Timer,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useEffect, useState } from "react";

const items = [
  { title: "Mission Control", url: "/", icon: Gauge },
  { title: "Fan Assistant", url: "/fan", icon: Bot },
  { title: "AI Scenario Simulator", url: "/admin/simulator", icon: FlaskConical },
  { title: "Stadium Map", url: "/admin/heatmap", icon: MapIcon },
  { title: "Incidents", url: "/admin/incidents", icon: Activity },
  { title: "Crowd Analytics", url: "/admin/crowd", icon: BarChart3 },
  { title: "Emergency Center", url: "/admin/emergency", icon: Siren },
  { title: "Reports", url: "/admin/summary", icon: FileText },
  { title: "AI Recommendations", url: "/admin/ai", icon: Sparkles },
  { title: "Activity Log", url: "/admin/activity", icon: History },
  { title: "Settings", url: "/admin", icon: Settings },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mission Control — Stadium Brain" },
      {
        name: "description",
        content:
          "Operations command center for FIFA World Cup stadium teams. Live crowd, incidents, gate status, and AI recommendations.",
      },
      { property: "og:title", content: "Stadium Brain — Mission Control" },
      {
        property: "og:description",
        content: "Enterprise-grade stadium operations. Real-time monitoring and AI decision support.",
      },
    ],
  }),
  component: MissionControlPage,
});

function MissionControlPage() {
  return (
    <PortalShell label="Operations" items={items}>
      <MissionControl />
    </PortalShell>
  );
}

// ─────────────────────────────────────────────────────────────
// KPI card
// ─────────────────────────────────────────────────────────────

function useAnimatedNumber(value: number) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    let raf = 0;
    const start = display;
    const delta = value - start;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 400);
      setDisplay(start + delta * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
     
  }, [value]);
  return display;
}

function Kpi({
  icon: Icon,
  label,
  value,
  suffix,
  delta,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  delta?: number;
  tone?: "neutral" | "success" | "warning" | "critical";
}) {
  const animated = useAnimatedNumber(value);
  const toneRing = {
    neutral: "ring-border text-muted-foreground",
    success: "ring-success/40 text-success",
    warning: "ring-warning/40 text-warning",
    critical: "ring-critical/40 text-critical",
  }[tone];

  const trendUp = (delta ?? 0) > 0;
  const trendTone =
    delta == null
      ? ""
      : trendUp
        ? "text-warning"
        : "text-success";

  return (
    <div className="rounded-[10px] border border-border bg-card p-3 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`grid h-6 w-6 place-items-center rounded-md bg-background ring-1 ${toneRing}`}>
            <Icon className="h-3 w-3" strokeWidth={2} />
          </div>
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </span>
        </div>
        {delta != null && (
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium tabular-nums ${trendTone}`}>
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-[22px] font-semibold tabular-nums tracking-tight">
          {Math.round(animated).toLocaleString()}
        </span>
        {suffix && <span className="text-[12px] text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section card
// ─────────────────────────────────────────────────────────────

function Panel({
  title,
  subtitle,
  right,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[10px] border border-border bg-card shadow-card ${className}`}>
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="min-w-0">
          <h2 className="truncate text-[12px] font-semibold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

function LiveTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-background px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-success ring-1 ring-success/30">
      <span className="h-1 w-1 rounded-full bg-success pulse-dot" />
      Live
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

function MissionControl() {
  const live = useLiveStadium();
  const incidents = useIncidents();
  const activeIncidents = incidents.filter((i) => i.status !== "resolved").length;

  const attendance = 82_413;
  const avgQueue = live.foodQueue;
  const density = live.crowdDensity;
  const parking = live.parkingOccupancy;

  return (
    <div className="space-y-4">
      {/* KPI ROW */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={Users} label="Attendance" value={attendance} suffix="/ 88,000" delta={0.4} tone="neutral" />
        <Kpi
          icon={Activity}
          label="Crowd Density"
          value={density}
          suffix="%"
          delta={live.history.at(-1)!.density - live.history[0].density}
          tone={density > 85 ? "critical" : density > 70 ? "warning" : "success"}
        />
        <Kpi
          icon={AlertTriangle}
          label="Active Incidents"
          value={activeIncidents}
          delta={0}
          tone={activeIncidents === 0 ? "success" : activeIncidents > 3 ? "critical" : "warning"}
        />
        <Kpi icon={Timer} label="Avg Queue" value={avgQueue} suffix="min" delta={-1.2} tone={avgQueue > 15 ? "warning" : "success"} />
        <Kpi icon={Car} label="Parking" value={parking} suffix="%" delta={0.8} tone={parking > 90 ? "critical" : parking > 80 ? "warning" : "success"} />
        <Kpi icon={Cpu} label="AI Health" value={99.6} suffix="%" tone="success" />
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* LEFT — MAP + GATES */}
        <div className="space-y-3">
          <Panel title="Stadium Map" subtitle="Crowd heatmap · Sector view" right={<LiveTag />}>
            <StadiumMap density={density} />
          </Panel>
          <Panel title="Gate Status" subtitle="8 gates · live occupancy">
            <GateGrid base={live.gateOccupancy} />
          </Panel>
        </div>

        {/* CENTER — ANALYTICS */}
        <div className="space-y-3">
          <Panel title="Crowd Analytics" subtitle="Density trend · last 80s" right={<LiveTag />}>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={live.history} margin={{ top: 5, right: 6, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="density" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#24324A" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="t" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "#131C2E",
                      border: "1px solid #24324A",
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                    labelStyle={{ color: "#94A3B8" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="density"
                    stroke="#2563EB"
                    strokeWidth={1.5}
                    fill="url(#density)"
                    isAnimationActive
                    animationDuration={400}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="grid gap-3 sm:grid-cols-2">
            <Panel title="Queue Trends" subtitle="Avg wait · minutes">
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={live.history} margin={{ top: 5, right: 6, left: -25, bottom: 0 }}>
                    <CartesianGrid stroke="#24324A" strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="t" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} hide />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#131C2E",
                        border: "1px solid #24324A",
                        borderRadius: 6,
                        fontSize: 11,
                      }}
                    />
                    <Line type="monotone" dataKey="food" stroke="#F59E0B" strokeWidth={1.5} dot={false} animationDuration={400} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Parking Occupancy" subtitle="North · South · VIP lots">
              <ParkingBars base={live.parkingOccupancy} />
            </Panel>
          </div>

          <Panel title="Medical Requests" subtitle="Active dispatches" right={<span className="text-[10px] tabular-nums text-muted-foreground">{live.medicalAlerts} active</span>}>
            <MedicalList count={live.medicalAlerts} />
          </Panel>
        </div>

        {/* RIGHT — AI COMMANDER */}
        <div className="space-y-3">
          <AiCommander live={live} incidents={activeIncidents} />
        </div>
      </div>

      {/* BOTTOM — TIMELINES */}
      <div className="grid gap-3 lg:grid-cols-4">
        <Panel title="Live Incident Timeline" subtitle="Last hour" className="lg:col-span-2">
          <IncidentTimeline />
        </Panel>
        <Panel title="Recent AI Decisions" subtitle="Autonomous actions">
          <AiDecisions />
        </Panel>
        <Panel title="Operator Actions" subtitle="Audit trail">
          <OperatorActions />
        </Panel>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stadium map (schematic heatmap)
// ─────────────────────────────────────────────────────────────

function StadiumMap({ density }: { density: number }) {
  const sectors = useMemo(() => {
    const base = density;
    return [
      { id: "N", d: 6 + Math.round(base * 0.95) },
      { id: "NE", d: 8 + Math.round(base * 1.05) },
      { id: "E", d: 4 + Math.round(base * 1.12) },
      { id: "SE", d: 2 + Math.round(base * 0.9) },
      { id: "S", d: 5 + Math.round(base * 0.85) },
      { id: "SW", d: 7 + Math.round(base * 0.78) },
      { id: "W", d: 3 + Math.round(base * 0.9) },
      { id: "NW", d: 6 + Math.round(base * 1.0) },
    ].map((s) => ({ ...s, d: Math.min(99, s.d) }));
  }, [density]);

  const heat = (v: number) =>
    v > 85 ? "#EF4444" : v > 70 ? "#F59E0B" : v > 45 ? "#2563EB" : "#22C55E";

  return (
    <div className="relative h-56 w-full overflow-hidden rounded-[8px] border border-border bg-background grid-lines">
      <svg viewBox="0 0 400 220" className="h-full w-full">
        {/* Outer bowl */}
        <ellipse cx="200" cy="110" rx="170" ry="90" fill="none" stroke="#24324A" strokeWidth="1" />
        <ellipse cx="200" cy="110" rx="130" ry="65" fill="none" stroke="#24324A" strokeWidth="1" strokeDasharray="2 3" />
        {/* Pitch */}
        <rect x="140" y="80" width="120" height="60" rx="4" fill="#0d2e1a" stroke="#22C55E" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="200" y1="80" x2="200" y2="140" stroke="#22C55E" strokeOpacity="0.35" />
        <circle cx="200" cy="110" r="8" fill="none" stroke="#22C55E" strokeOpacity="0.35" />

        {/* Sector arcs */}
        {sectors.map((s, i) => {
          const angle = (i / sectors.length) * Math.PI * 2 - Math.PI / 2;
          const x = 200 + Math.cos(angle) * 150;
          const y = 110 + Math.sin(angle) * 78;
          return (
            <g key={s.id}>
              <circle
                cx={x}
                cy={y}
                r={12}
                fill={heat(s.d)}
                fillOpacity={0.22 + (s.d / 100) * 0.55}
                stroke={heat(s.d)}
                strokeOpacity={0.9}
                strokeWidth={1}
              />
              <text
                x={x}
                y={y + 3}
                textAnchor="middle"
                fontSize="9"
                fill="#F8FAFC"
                fontFamily="Inter, sans-serif"
                fontWeight={600}
              >
                {s.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-[6px] border border-border bg-surface/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
        <span className="uppercase tracking-[0.14em]">Density heatmap</span>
        <div className="flex items-center gap-2">
          {[
            ["<45%", "#22C55E"],
            ["45-70%", "#2563EB"],
            ["70-85%", "#F59E0B"],
            [">85%", "#EF4444"],
          ].map(([l, c]) => (
            <span key={l} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: c as string }} />
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Gate grid
// ─────────────────────────────────────────────────────────────

function GateGrid({ base }: { base: number }) {
  const gates = ["A", "B", "C", "D", "E", "F", "G", "H"];
  return (
    <div className="grid grid-cols-4 gap-2">
      {gates.map((g, i) => {
        const v = Math.min(99, Math.max(10, Math.round(base + Math.sin(i * 1.3) * 22)));
        const tone = v > 88 ? "critical" : v > 72 ? "warning" : "success";
        const barColor = tone === "critical" ? "#EF4444" : tone === "warning" ? "#F59E0B" : "#22C55E";
        return (
          <div key={g} className="rounded-[6px] border border-border bg-background px-2 py-1.5">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <DoorOpen className="h-3 w-3" /> Gate {g}
              </span>
              <span className="tabular-nums text-foreground">{v}%</span>
            </div>
            <div className="mt-1 h-1 w-full rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${v}%`, background: barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Parking
// ─────────────────────────────────────────────────────────────

function ParkingBars({ base }: { base: number }) {
  const lots = [
    { id: "North Lot", v: Math.min(99, base * 1.05) },
    { id: "South Lot", v: Math.min(99, base * 0.85) },
    { id: "VIP Deck", v: Math.min(99, base * 0.7) },
  ];
  return (
    <div className="space-y-2.5">
      {lots.map((l) => {
        const tone = l.v > 90 ? "#EF4444" : l.v > 75 ? "#F59E0B" : "#22C55E";
        return (
          <div key={l.id}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{l.id}</span>
              <span className="tabular-nums font-medium">{Math.round(l.v)}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${l.v}%`, background: tone }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Medical
// ─────────────────────────────────────────────────────────────

function MedicalList({ count }: { count: number }) {
  const items = Array.from({ length: Math.max(1, count) }).map((_, i) => ({
    id: `MED-${420 + i}`,
    zone: ["Sect. 118", "Sect. 204", "Concourse 3", "West Ramp"][i % 4],
    status: count === 0 ? "cleared" : i === 0 ? "en-route" : "on-scene",
    eta: count === 0 ? "—" : `${1 + i}m ${20 + i * 7}s`,
  }));
  return (
    <div className="space-y-1.5">
      {items.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between rounded-[6px] border border-border bg-background px-2 py-1.5 text-[11px]"
        >
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-md bg-critical/12 text-critical ring-1 ring-critical/30">
              <Heart className="h-3 w-3" />
            </div>
            <div>
              <div className="font-medium">{m.id}</div>
              <div className="text-[10px] text-muted-foreground">{m.zone}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-[10px] font-medium uppercase tracking-[0.12em] ${
              m.status === "cleared" ? "text-success" : m.status === "en-route" ? "text-warning" : "text-primary"
            }`}>
              {m.status}
            </div>
            <div className="text-[10px] tabular-nums text-muted-foreground">ETA {m.eta}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AI Commander (rule-based recommendations from live snapshot)
// ─────────────────────────────────────────────────────────────

type Rec = {
  id: string;
  priority: "High" | "Medium" | "Low";
  reason: string;
  action: string;
  impact: string;
  confidence: number;
};

function computeRecs(live: ReturnType<typeof useLiveStadium>, incidents: number): Rec[] {
  const recs: Rec[] = [];
  if (live.gateOccupancy > 88) {
    recs.push({
      id: "gate-c-open-d",
      priority: "High",
      reason: `Gate C operating at ${Math.round(live.gateOccupancy * 1.05)}% capacity.`,
      action: "Open Gate D and redirect fans from the East entrance.",
      impact: "Reduce waiting time by ~18%.",
      confidence: 92,
    });
  }
  if (live.foodQueue > 14) {
    recs.push({
      id: "food-east",
      priority: "Medium",
      reason: `Food Court East average wait is ${Math.round(live.foodQueue * 1.2)} min.`,
      action: "Deploy temporary kiosk at Concourse 2 within 5 min.",
      impact: "Cut queue by ~11 minutes.",
      confidence: 84,
    });
  }
  if (live.crowdDensity > 80) {
    recs.push({
      id: "density-east",
      priority: "High",
      reason: `East Stand density at ${Math.round(live.crowdDensity * 1.1)}%.`,
      action: "Throttle inbound flow at Turnstile B4 for 3 minutes.",
      impact: "Prevent overflow. −24% risk score.",
      confidence: 88,
    });
  }
  if (live.parkingOccupancy > 92) {
    recs.push({
      id: "parking-vip",
      priority: "Medium",
      reason: `Parking occupancy at ${Math.round(live.parkingOccupancy)}%.`,
      action: "Route arrivals to overflow Lot P4. Notify VMS boards.",
      impact: "Recover ~340 spaces.",
      confidence: 79,
    });
  }
  if (incidents >= 2) {
    recs.push({
      id: "med-halftime",
      priority: "Medium",
      reason: `${incidents} active incidents concentrated near halftime.`,
      action: "Pre-position medical team 4 to Sect. 118 concourse.",
      impact: "−32% expected response time.",
      confidence: 90,
    });
  }
  // Always include at least one baseline recommendation
  recs.push({
    id: "baseline",
    priority: "Low",
    reason: "Second-half kickoff imminent — stadium load stable.",
    action: "Rotate stewards on Ring 3 for fatigue mitigation.",
    impact: "Sustains 99.6% AI health signal.",
    confidence: 71,
  });
  return recs.slice(0, 5);
}

function AiCommander({ live, incidents }: { live: ReturnType<typeof useLiveStadium>; incidents: number }) {
  const recs = computeRecs(live, incidents);
  return (
    <Panel
      title="AI Commander"
      subtitle="Continuous decision support"
      right={
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {recs.length} active
          </span>
          <LiveTag />
        </div>
      }
    >
      <div className="space-y-2">
        {recs.map((r) => (
          <RecCard key={r.id} r={r} />
        ))}
      </div>
    </Panel>
  );
}

function RecCard({ r }: { r: Rec }) {
  const priorityStyles = {
    High: "bg-critical/12 text-critical ring-critical/30",
    Medium: "bg-warning/12 text-warning ring-warning/30",
    Low: "bg-success/12 text-success ring-success/30",
  }[r.priority];

  return (
    <article className="rounded-[8px] border border-border bg-background p-2.5">
      <div className="flex items-center justify-between">
        <span className={`rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ring-1 ${priorityStyles}`}>
          {r.priority}
        </span>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          Conf {r.confidence}%
        </span>
      </div>

      <div className="mt-2 space-y-1.5 text-[11.5px] leading-relaxed">
        <Field label="Reason" value={r.reason} />
        <Field label="Action" value={r.action} accent />
        <Field label="Impact" value={r.impact} />
      </div>

      <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${r.confidence}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5">
        <button className="rounded-[6px] border border-border bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground">
          Dismiss
        </button>
        <button className="rounded-[6px] bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground hover:brightness-110">
          Apply
        </button>
      </div>
    </article>
  );
}

function Field({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className={accent ? "text-foreground" : "text-foreground/90"}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom timelines
// ─────────────────────────────────────────────────────────────

function IncidentTimeline() {
  const rows = [
    { t: "18:42", tone: "critical", label: "Medical alert — Sect. 118", detail: "Medical Team 3 dispatched · ETA 2m 14s" },
    { t: "18:51", tone: "warning", label: "Food Court East demand spike", detail: "Kiosk C2 opened · queue −14min" },
    { t: "19:08", tone: "success", label: "Gate C rebalanced", detail: "AI redirect · wait −22%" },
    { t: "19:14", tone: "warning", label: "Parking VIP 94%", detail: "Overflow Lot P4 activated" },
    { t: "19:22", tone: "success", label: "Incident INC-2031 resolved", detail: "Fan stabilized · transported" },
  ];
  const toneMap: Record<string, string> = {
    critical: "bg-critical",
    warning: "bg-warning",
    success: "bg-success",
    primary: "bg-primary",
  };
  return (
    <ol className="space-y-2">
      {rows.map((r, i) => (
        <li key={i} className="flex items-start gap-2 rounded-[6px] border border-border bg-background px-2 py-1.5">
          <span className="mt-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">{r.t}</span>
          <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${toneMap[r.tone]}`} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium">{r.label}</div>
            <div className="truncate text-[10.5px] text-muted-foreground">{r.detail}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function AiDecisions() {
  const rows = [
    { t: "19:22", label: "Auto-throttled Turnstile B4", conf: 92 },
    { t: "19:18", label: "Kiosk C2 launched", conf: 84 },
    { t: "19:10", label: "Gate D opened", conf: 92 },
    { t: "18:59", label: "Halftime staff rebalance", conf: 78 },
  ];
  return (
    <ul className="space-y-1.5">
      {rows.map((r, i) => (
        <li key={i} className="flex items-center justify-between rounded-[6px] border border-border bg-background px-2 py-1.5 text-[11.5px]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>{r.label}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="tabular-nums">{r.conf}%</span>
            <span className="font-mono">{r.t}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function OperatorActions() {
  const rows = [
    { t: "19:21", who: "M. Rossi", label: "Approved Gate D override" },
    { t: "19:15", who: "K. Osei", label: "Ack medical alert MED-421" },
    { t: "19:04", who: "L. Silva", label: "Broadcast · Concourse 3" },
    { t: "18:57", who: "M. Rossi", label: "Escalated INC-2039" },
  ];
  return (
    <ul className="space-y-1.5">
      {rows.map((r, i) => (
        <li key={i} className="flex items-center justify-between rounded-[6px] border border-border bg-background px-2 py-1.5 text-[11.5px]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-success" />
            <span>{r.label}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{r.who}</span>
            <span className="font-mono">{r.t}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

// Silence unused-import warnings for icons only used by nav items
void ShieldCheck;