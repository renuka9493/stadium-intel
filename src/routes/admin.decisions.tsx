import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  DoorOpen,
  HeartPulse,
  ParkingSquare,
  UtensilsCrossed,
  ShieldAlert,
  Radio,
  Users,
  CloudRain,
  Sparkles,
  Filter,
  TrendingDown,
  Timer,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { OpsToolbar, ToolbarDot, LiveTag, Panel, StatMini, Chip, type Tone } from "@/components/ops";

export const Route = createFileRoute("/admin/decisions")({
  head: () => ({
    meta: [
      { title: "AI Decision Timeline — Stadium Brain" },
      { name: "description", content: "Chronological log of every autonomous AI decision, action taken and measured outcome across stadium operations." },
      { property: "og:title", content: "AI Decision Timeline — Stadium Brain" },
      { property: "og:description", content: "Every AI decision, action and result, in chronological order." },
    ],
  }),
  component: DecisionTimeline,
});

type Category = "Crowd" | "Medical" | "Parking" | "Food" | "Security" | "Comms" | "Weather";
type Outcome = "Resolved" | "In Progress" | "Monitoring";

type Decision = {
  id: string;
  time: string; // HH:MM
  category: Category;
  icon: LucideIcon;
  tone: Tone;
  title: string;
  prediction: string;
  action: string;
  result: string;
  metricLabel: string;
  metricValue: string;
  confidence: number;
  outcome: Outcome;
  responseTime?: string;
};

const CATEGORY_META: Record<Category, { icon: LucideIcon; tone: Tone }> = {
  Crowd: { icon: Users, tone: "primary" },
  Medical: { icon: HeartPulse, tone: "critical" },
  Parking: { icon: ParkingSquare, tone: "warning" },
  Food: { icon: UtensilsCrossed, tone: "success" },
  Security: { icon: ShieldAlert, tone: "warning" },
  Comms: { icon: Radio, tone: "primary" },
  Weather: { icon: CloudRain, tone: "neutral" },
};

const SEED_DECISIONS: Omit<Decision, "icon" | "tone">[] = [
  {
    id: "D-2041",
    time: "17:52",
    category: "Parking",
    title: "Parking Lot P1 approaching capacity",
    prediction: "P1 occupancy trending toward 96% within 8 minutes based on inbound license-plate scans.",
    action: "Closed P1 inbound lane and updated dynamic signboards to route arrivals to P2.",
    result: "Inbound congestion at P1 reduced by 31%; P2 absorbed 240 vehicles.",
    metricLabel: "traffic",
    metricValue: "−31%",
    confidence: 94,
    outcome: "Resolved",
  },
  {
    id: "D-2042",
    time: "18:24",
    category: "Crowd",
    title: "Gate C congestion predicted",
    prediction: "Density at Gate C forecast to exceed 92% within 6 minutes; historical halftime patterns match.",
    action: "Opened Gate D and redirected East entrance flow via digital wayfinding.",
    result: "Average wait time reduced by 22% across east ingress.",
    metricLabel: "wait time",
    metricValue: "−22%",
    confidence: 96,
    outcome: "Resolved",
  },
  {
    id: "D-2043",
    time: "18:41",
    category: "Food",
    title: "Food Court East demand surge",
    prediction: "Queue depth rising 2.1x faster than baseline pre-halftime window.",
    action: "Opened overflow kiosk K-3 and reassigned 4 staff from West concourse.",
    result: "Queue length reduced by 14 minutes; throughput +38%.",
    metricLabel: "queue",
    metricValue: "−14 min",
    confidence: 89,
    outcome: "Resolved",
  },
  {
    id: "D-2044",
    time: "19:04",
    category: "Crowd",
    title: "Gate C congestion recurrence",
    prediction: "Post-halftime egress simulation flagged renewed pressure at Gate C.",
    action: "Kept Gate D open through egress window; staged 2 additional stewards.",
    result: "Queue reduced by 17% versus previous match at same phase.",
    metricLabel: "queue",
    metricValue: "−17%",
    confidence: 92,
    outcome: "Resolved",
  },
  {
    id: "D-2045",
    time: "19:18",
    category: "Medical",
    title: "Medical emergency detected · Sec 118",
    prediction: "CCTV pose model + fan report classified suspected collapse; density around subject 84%.",
    action: "Dispatched Medical Team 3 with clear-lane protocol via vomitory V-6.",
    result: "Fan stabilized on-scene, transported to medical center.",
    metricLabel: "response",
    metricValue: "2m 11s",
    confidence: 98,
    outcome: "Resolved",
    responseTime: "2m 11s",
  },
  {
    id: "D-2046",
    time: "19:27",
    category: "Security",
    title: "Unauthorised access at Tunnel T-3",
    prediction: "Access-control anomaly: 2 credentials swiped at restricted door within 4 seconds.",
    action: "Auto-locked T-3, notified Security Lead, pushed CCTV feed to command wall.",
    result: "False alarm — contractor credentials revalidated.",
    metricLabel: "resolution",
    metricValue: "48s",
    confidence: 82,
    outcome: "Resolved",
  },
  {
    id: "D-2047",
    time: "19:34",
    category: "Weather",
    title: "Wind gust advisory",
    prediction: "Meteo feed shows gusts up to 46 km/h in next 15 minutes, affecting upper tiers.",
    action: "Notified stand marshals; secured loose signage at North Upper.",
    result: "No incidents reported; advisory closed after window.",
    metricLabel: "incidents",
    metricValue: "0",
    confidence: 88,
    outcome: "Monitoring",
  },
  {
    id: "D-2048",
    time: "19:42",
    category: "Parking",
    title: "Parking Lot P2 nearly full",
    prediction: "P2 projected to hit 97% in ~7 min; inbound vehicles +18% vs plan.",
    action: "Redirected incoming vehicles to P3 and updated approach signage.",
    result: "Traffic queueing outside P2 reduced by 26%.",
    metricLabel: "traffic",
    metricValue: "−26%",
    confidence: 95,
    outcome: "Resolved",
  },
  {
    id: "D-2049",
    time: "19:58",
    category: "Comms",
    title: "PA announcement scheduled",
    prediction: "Full-time egress in 4 min; north concourse likely to bottleneck without pre-brief.",
    action: "Auto-scheduled multilingual PA at T-2 min directing East seating to Gate D.",
    result: "Egress dispersion improved 12% vs baseline.",
    metricLabel: "egress",
    metricValue: "+12%",
    confidence: 90,
    outcome: "In Progress",
  },
];

const CATEGORIES: (Category | "All")[] = ["All", "Crowd", "Medical", "Parking", "Food", "Security", "Comms", "Weather"];

function DecisionTimeline() {
  const [filter, setFilter] = useState<Category | "All">("All");
  const [pulseId, setPulseId] = useState<string | null>(null);

  const all: Decision[] = useMemo(
    () =>
      SEED_DECISIONS.map((d) => ({
        ...d,
        icon: CATEGORY_META[d.category].icon,
        tone: CATEGORY_META[d.category].tone,
      })).sort((a, b) => (a.time < b.time ? 1 : -1)),
    [],
  );

  useEffect(() => {
    const t = setInterval(() => {
      const pick = all[Math.floor(Math.random() * Math.min(3, all.length))]!.id;
      setPulseId(pick);
      setTimeout(() => setPulseId(null), 1200);
    }, 4000);
    return () => clearInterval(t);
  }, [all]);

  const shown = filter === "All" ? all : all.filter((d) => d.category === filter);

  const stats = useMemo(() => {
    const total = all.length;
    const resolved = all.filter((d) => d.outcome === "Resolved").length;
    const active = all.filter((d) => d.outcome !== "Resolved").length;
    const avgConf = Math.round(all.reduce((a, d) => a + d.confidence, 0) / total);
    const medical = all.find((d) => d.category === "Medical")?.responseTime ?? "—";
    return { total, resolved, active, avgConf, medical };
  }, [all]);

  return (
    <div>
      <OpsToolbar
        title="AI Decision Timeline"
        meta={
          <>
            <ToolbarDot tone="success" label="Autonomous engine online" />
            <span className="tabular-nums">{stats.total} decisions · last 2h</span>
          </>
        }
        right={<LiveTag />}
      />

      <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatMini label="Decisions" value={stats.total} hint="2h window" tone="primary" />
        <StatMini label="Resolved" value={stats.resolved} hint={`${stats.active} active`} tone="success" />
        <StatMini label="Avg confidence" value={`${stats.avgConf}%`} tone="primary" />
        <StatMini label="Medical resp." value={stats.medical} hint="best in window" tone="critical" />
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 inline-flex items-center gap-1 text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
          <Filter className="h-3 w-3" /> Filter
        </span>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ring-1 transition ${
              filter === c
                ? "bg-primary/15 text-primary ring-primary/40"
                : "bg-background text-muted-foreground ring-border hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <Panel title="Chronological Feed" subtitle="Newest first · autonomous + AI-assisted operator decisions">
        <ol className="relative">
          <span aria-hidden className="absolute left-[9px] top-1 bottom-1 w-px bg-border" />
          {shown.map((d, i) => (
            <DecisionRow key={d.id} d={d} pulsing={pulseId === d.id} last={i === shown.length - 1} />
          ))}
          {shown.length === 0 && (
            <li className="rounded-md border border-border bg-background/60 p-3 text-[11.5px] text-muted-foreground">
              No decisions in this category yet.
            </li>
          )}
        </ol>
      </Panel>
    </div>
  );
}

function toneStyles(t: Tone) {
  return {
    primary: { bg: "bg-primary/12", text: "text-primary", dot: "bg-primary", ring: "ring-primary/30" },
    success: { bg: "bg-success/12", text: "text-success", dot: "bg-success", ring: "ring-success/30" },
    warning: { bg: "bg-warning/12", text: "text-warning", dot: "bg-warning", ring: "ring-warning/30" },
    critical: { bg: "bg-critical/12", text: "text-critical", dot: "bg-critical", ring: "ring-critical/30" },
    neutral: { bg: "bg-background", text: "text-muted-foreground", dot: "bg-muted-foreground", ring: "ring-border" },
  }[t];
}

function DecisionRow({ d, pulsing, last }: { d: Decision; pulsing: boolean; last: boolean }) {
  const s = toneStyles(d.tone);
  const Icon = d.icon;
  const outcomeTone: Tone =
    d.outcome === "Resolved" ? "success" : d.outcome === "In Progress" ? "primary" : "warning";
  return (
    <li className={`relative pl-7 ${last ? "" : "pb-2.5"}`}>
      <span
        className={`absolute left-[3px] top-[10px] grid h-4 w-4 place-items-center rounded-full ring-1 ${s.bg} ${s.ring} ${pulsing ? "pulse-dot" : ""}`}
        aria-hidden
      >
        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      </span>

      <div className="rounded-md border border-border bg-card p-2 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="tabular-nums text-[10.5px] font-semibold text-muted-foreground">{d.time}</span>
            <span className={`grid h-4 w-4 place-items-center rounded ring-1 ${s.bg} ${s.ring} ${s.text}`}>
              <Icon className="h-2.5 w-2.5" strokeWidth={2.4} />
            </span>
            <Chip tone={d.tone}>{d.category}</Chip>
            <h3 className="truncate text-[12px] font-semibold tracking-tight">{d.title}</h3>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Chip tone={outcomeTone}>{d.outcome}</Chip>
            <span className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[9.5px] font-semibold tabular-nums ring-1 ${s.bg} ${s.text} ${s.ring}`}>
              <TrendingDown className="h-3 w-3" /> {d.metricValue}
              <span className="text-muted-foreground">{d.metricLabel}</span>
            </span>
          </div>
        </div>

        <div className="mt-1.5 grid gap-1.5 md:grid-cols-3">
          <Cell label="Prediction" icon={Sparkles} text={d.prediction} />
          <Cell label="Action" icon={CheckCircle2} text={d.action} />
          <Cell label={d.responseTime ? "Response · Result" : "Result"} icon={d.responseTime ? Timer : DoorOpen} text={d.result} accent={s.text} />
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>ID · {d.id}</span>
          <span className="inline-flex items-center gap-1">
            <span>AI confidence</span>
            <span className="tabular-nums text-foreground/80">{d.confidence}%</span>
            <span className="ml-1 inline-block h-1 w-16 overflow-hidden rounded-full bg-secondary">
              <span
                className="block h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${d.confidence}%` }}
              />
            </span>
          </span>
        </div>
      </div>
    </li>
  );
}

function Cell({ label, icon: Icon, text, accent }: { label: string; icon: LucideIcon; text: string; accent?: string }) {
  return (
    <div className="rounded-md border border-border bg-background/60 p-1.5">
      <div className={`flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] ${accent ?? "text-muted-foreground"}`}>
        <Icon className="h-3 w-3" strokeWidth={2.2} />
        {label}
      </div>
      <p className="mt-0.5 text-[11.5px] leading-snug text-foreground/90">{text}</p>
    </div>
  );
}