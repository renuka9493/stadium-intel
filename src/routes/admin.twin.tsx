import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Users, Timer, HeartPulse, ShieldAlert, Sparkles } from "lucide-react";
import { OpsToolbar, ToolbarDot, LiveTag, Panel, Kpi, Field, chartTheme } from "@/components/ops";
import { useLiveStadium } from "@/lib/live-stadium";

export const Route = createFileRoute("/admin/twin")({
  head: () => ({
    meta: [
      { title: "Digital Twin — Stadium Brain" },
      { name: "description", content: "Live 3D-style digital twin of the stadium with per-section density, queues and alerts." },
      { property: "og:title", content: "Digital Twin — Stadium Brain" },
      { property: "og:description", content: "Live per-section density, queues and alerts for stadium operations." },
    ],
  }),
  component: DigitalTwin,
});

type SectionKind = "stand" | "gate" | "food" | "parking";

type Section = {
  id: string;
  label: string;
  kind: SectionKind;
  // polygon points in a 1000x640 viewBox
  points: string;
  // baseline offset so sections drift independently
  seed: number;
};

// Stadium bowl: 4 tiered rings around the pitch, gates on the corners,
// food courts on the concourses, parking lots outside.
const SECTIONS: Section[] = [
  // ── North stand tiers ──
  { id: "N1", label: "North Lower", kind: "stand", points: "300,90 700,90 660,150 340,150", seed: 0.12 },
  { id: "N2", label: "North Upper", kind: "stand", points: "260,50 740,50 700,90 300,90", seed: 0.34 },
  // ── South stand tiers ──
  { id: "S1", label: "South Lower", kind: "stand", points: "340,490 660,490 700,550 300,550", seed: 0.21 },
  { id: "S2", label: "South Upper", kind: "stand", points: "300,550 700,550 740,590 260,590", seed: 0.55 },
  // ── East stand ──
  { id: "E1", label: "East Lower", kind: "stand", points: "820,180 820,460 760,420 760,220", seed: 0.44 },
  { id: "E2", label: "East Upper", kind: "stand", points: "880,140 880,500 820,460 820,180", seed: 0.66 },
  // ── West stand ──
  { id: "W1", label: "West Lower", kind: "stand", points: "180,180 240,220 240,420 180,460", seed: 0.28 },
  { id: "W2", label: "West Upper", kind: "stand", points: "120,140 180,180 180,460 120,500", seed: 0.72 },
  // ── Gates (corners) ──
  { id: "GA", label: "Gate A", kind: "gate", points: "60,60 180,60 160,120 60,120", seed: 0.05 },
  { id: "GB", label: "Gate B", kind: "gate", points: "820,60 940,60 940,120 840,120", seed: 0.18 },
  { id: "GC", label: "Gate C", kind: "gate", points: "60,520 160,520 180,580 60,580", seed: 0.61 },
  { id: "GD", label: "Gate D", kind: "gate", points: "840,520 940,520 940,580 820,580", seed: 0.39 },
  // ── Food courts (mid concourses) ──
  { id: "FN", label: "North Food Court", kind: "food", points: "420,10 580,10 580,40 420,40", seed: 0.5 },
  { id: "FS", label: "South Food Court", kind: "food", points: "420,600 580,600 580,630 420,630", seed: 0.7 },
  // ── Parking ──
  { id: "P1", label: "Parking P1", kind: "parking", points: "20,180 90,180 90,300 20,300", seed: 0.15 },
  { id: "P2", label: "Parking P2", kind: "parking", points: "20,340 90,340 90,460 20,460", seed: 0.83 },
  { id: "P3", label: "Parking P3", kind: "parking", points: "910,180 980,180 980,300 910,300", seed: 0.9 },
  { id: "P4", label: "Parking P4", kind: "parking", points: "910,340 980,340 980,460 910,460", seed: 0.25 },
];

type Density = "green" | "yellow" | "orange" | "red";

function bandFor(v: number): Density {
  if (v >= 85) return "red";
  if (v >= 70) return "orange";
  if (v >= 50) return "yellow";
  return "green";
}

const bandFill: Record<Density, string> = {
  green: "#22C55E",
  yellow: "#EAB308",
  orange: "#F59E0B",
  red: "#EF4444",
};

const bandLabel: Record<Density, string> = {
  green: "Safe",
  yellow: "Elevated",
  orange: "Congested",
  red: "Critical",
};

type SectionState = {
  occupancy: number;
  queue: number;
  medical: number;
  security: number;
  history: number[];
};

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

function initialState(s: Section, base: { crowd: number; gate: number; food: number; parking: number }): SectionState {
  const anchor =
    s.kind === "gate"
      ? base.gate
      : s.kind === "food"
        ? Math.min(99, base.crowd + base.food * 2)
        : s.kind === "parking"
          ? base.parking
          : base.crowd;
  const jitter = (s.seed - 0.5) * 20;
  const occ = clamp(anchor + jitter, 20, 99);
  const hist = Array.from({ length: 20 }, (_, i) =>
    clamp(occ + Math.sin(i / 2 + s.seed * 6) * 8 + (Math.random() - 0.5) * 4, 15, 99),
  );
  return {
    occupancy: occ,
    queue: Math.round(clamp(occ / 8 + (s.kind === "gate" ? 4 : 0) + (s.kind === "food" ? 6 : 0), 0, 25)),
    medical: s.seed > 0.7 ? 1 : 0,
    security: s.seed > 0.85 ? 1 : 0,
    history: hist,
  };
}

function drift(prev: SectionState, s: Section): SectionState {
  const step = (Math.random() - 0.5) * 6;
  const occ = clamp(prev.occupancy + step, 15, 99);
  const queue = Math.max(0, Math.round(prev.queue + (Math.random() - 0.45) * 2));
  const medBump = Math.random();
  const medical = clamp(
    medBump > 0.97 ? prev.medical + 1 : medBump < 0.05 ? prev.medical - 1 : prev.medical,
    0,
    4,
  );
  const secBump = Math.random();
  const security = clamp(
    secBump > 0.98 ? prev.security + 1 : secBump < 0.05 ? prev.security - 1 : prev.security,
    0,
    3,
  );
  const history = [...prev.history.slice(1), occ];
  return { occupancy: occ, queue, medical, security, history };
}

function recommendation(s: Section, st: SectionState): string {
  const b = bandFor(st.occupancy);
  if (b === "red") {
    if (s.kind === "gate") return `Open the adjacent overflow gate and redirect arrivals; stage 2 stewards at ${s.label}.`;
    if (s.kind === "food") return `Deploy queue combers and open the express lane at ${s.label}; push +10% staff.`;
    if (s.kind === "parking") return `Close ${s.label} to inbound traffic and route new arrivals to next lot.`;
    return `Throttle inflow to ${s.label}, deploy 3 additional stewards, and pre-position medical near vomitory.`;
  }
  if (b === "orange") {
    if (s.kind === "gate") return `Increase throughput at ${s.label} — add 1 lane and monitor next 5 minutes.`;
    if (s.kind === "food") return `Pre-stage runners at ${s.label}; expected wait rising.`;
    if (s.kind === "parking") return `Update dynamic signage to steer 20% of incoming vehicles away from ${s.label}.`;
    return `Increase steward density at ${s.label} concourse and prep contingency routing.`;
  }
  if (b === "yellow") return `${s.label} within normal operating range — continue passive monitoring.`;
  return `${s.label} nominal — no action required.`;
}

function DigitalTwin() {
  const live = useLiveStadium();
  const [states, setStates] = useState<Record<string, SectionState>>(() => {
    const base = {
      crowd: live.crowdDensity,
      gate: live.gateOccupancy,
      food: live.foodQueue,
      parking: live.parkingOccupancy,
    };
    return Object.fromEntries(SECTIONS.map((s) => [s.id, initialState(s, base)]));
  });
  const [selectedId, setSelectedId] = useState<string>("N1");
  const [pulseId, setPulseId] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setStates((prev) => {
        const next: Record<string, SectionState> = {};
        for (const s of SECTIONS) next[s.id] = drift(prev[s.id]!, s);
        return next;
      });
      // Random subtle pulse to signal update
      const pick = SECTIONS[Math.floor(Math.random() * SECTIONS.length)]!.id;
      setPulseId(pick);
      setTimeout(() => setPulseId(null), 900);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const selected = SECTIONS.find((s) => s.id === selectedId)!;
  const selState = states[selectedId]!;
  const selBand = bandFor(selState.occupancy);

  const counts = useMemo(() => {
    const c: Record<Density, number> = { green: 0, yellow: 0, orange: 0, red: 0 };
    for (const s of SECTIONS) c[bandFor(states[s.id]!.occupancy)]++;
    return c;
  }, [states]);

  const trend = selState.history.map((v, i) => ({ t: `t-${selState.history.length - i}`, v: Math.round(v) }));

  return (
    <div>
      <OpsToolbar
        title="Digital Twin"
        meta={
          <>
            <ToolbarDot tone="success" label="Twin synced" />
            <span className="tabular-nums">18 sections · updates every 3s</span>
          </>
        }
        right={<LiveTag />}
      />

      <div className="grid gap-2 lg:grid-cols-3">
        {/* Twin canvas */}
        <div className="lg:col-span-2">
          <Panel
            title="Live Stadium Twin"
            subtitle="Click any section for full telemetry"
            right={
              <div className="flex items-center gap-2 text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
                <LegendSwatch color={bandFill.green} label={`Safe ${counts.green}`} />
                <LegendSwatch color={bandFill.yellow} label={`Elev ${counts.yellow}`} />
                <LegendSwatch color={bandFill.orange} label={`Cong ${counts.orange}`} />
                <LegendSwatch color={bandFill.red} label={`Crit ${counts.red}`} />
              </div>
            }
          >
            <div className="rounded-md border border-border bg-background/60 p-1.5">
              <svg viewBox="0 0 1000 640" className="w-full" style={{ height: "auto" }}>
                {/* Concourse ring */}
                <rect x="60" y="30" width="880" height="580" rx="34" fill="none" stroke={chartTheme.grid} strokeWidth={1} />
                <rect x="110" y="70" width="780" height="500" rx="24" fill="none" stroke={chartTheme.grid} strokeDasharray="3 4" strokeWidth={1} />
                {/* Pitch */}
                <g>
                  <rect x="290" y="180" width="420" height="280" rx="8" fill="#0F2A1B" stroke="#1E3A2A" strokeWidth={1} />
                  <line x1="500" y1="180" x2="500" y2="460" stroke="#1E3A2A" strokeWidth={1} />
                  <circle cx="500" cy="320" r="36" fill="none" stroke="#1E3A2A" strokeWidth={1} />
                  <rect x="290" y="260" width="40" height="120" fill="none" stroke="#1E3A2A" strokeWidth={1} />
                  <rect x="670" y="260" width="40" height="120" fill="none" stroke="#1E3A2A" strokeWidth={1} />
                  <text x="500" y="325" textAnchor="middle" fontSize="11" fill="#1E3A2A" fontWeight={600} letterSpacing="0.2em">PITCH</text>
                </g>
                {/* Sections */}
                {SECTIONS.map((s) => {
                  const st = states[s.id]!;
                  const band = bandFor(st.occupancy);
                  const fill = bandFill[band];
                  const isSel = s.id === selectedId;
                  const pulsing = pulseId === s.id;
                  return (
                    <g key={s.id} onClick={() => setSelectedId(s.id)} style={{ cursor: "pointer" }}>
                      <polygon
                        points={s.points}
                        fill={fill}
                        fillOpacity={isSel ? 0.85 : 0.55}
                        stroke={isSel ? "#F8FAFC" : fill}
                        strokeOpacity={isSel ? 1 : 0.7}
                        strokeWidth={isSel ? 2 : 1}
                        style={{ transition: "fill-opacity 500ms ease, stroke-width 200ms ease" }}
                      />
                      {pulsing && (
                        <polygon
                          points={s.points}
                          fill="none"
                          stroke={fill}
                          strokeWidth={2}
                          className="pulse-dot"
                          style={{ opacity: 0.9 }}
                        />
                      )}
                      <SectionLabel points={s.points} text={s.id} sub={`${Math.round(st.occupancy)}%`} />
                      {st.medical > 0 && <SectionBadge points={s.points} dx={-14} color="#EF4444" glyph="+" />}
                      {st.security > 0 && <SectionBadge points={s.points} dx={14} color="#F59E0B" glyph="!" />}
                    </g>
                  );
                })}
              </svg>
            </div>
          </Panel>
        </div>

        {/* Right column: selected section detail */}
        <div className="space-y-2">
          <Panel
            title={`${selected.label} · ${selected.id}`}
            subtitle={`${selected.kind.toUpperCase()} · ${bandLabel[selBand]}`}
            right={
              <span
                className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] ring-1"
                style={{ color: bandFill[selBand], background: `${bandFill[selBand]}20`, borderColor: bandFill[selBand] }}
              >
                <span className="h-1 w-1 rounded-full" style={{ background: bandFill[selBand] }} />
                {bandLabel[selBand]}
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-2">
              <Kpi icon={Users} label="Occupancy" value={Math.round(selState.occupancy)} suffix="%" tone={selBand === "red" ? "critical" : selBand === "orange" ? "warning" : selBand === "yellow" ? "warning" : "success"} />
              <Kpi icon={Timer} label="Queue" value={selState.queue} suffix="min" tone={selState.queue > 15 ? "critical" : selState.queue > 8 ? "warning" : "success"} />
              <Kpi icon={HeartPulse} label="Medical" value={selState.medical} suffix="active" tone={selState.medical > 0 ? "critical" : "neutral"} />
              <Kpi icon={ShieldAlert} label="Security" value={selState.security} suffix="alerts" tone={selState.security > 0 ? "warning" : "neutral"} />
            </div>

            <div className="mt-2 rounded-md border border-border bg-background/60 p-2">
              <div className="mb-1 flex items-center justify-between">
                <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">Historical trend · 1m</div>
                <div className="text-[10px] tabular-nums text-muted-foreground">
                  {Math.round(Math.min(...selState.history))}% – {Math.round(Math.max(...selState.history))}%
                </div>
              </div>
              <div style={{ height: 96 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="twin-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={bandFill[selBand]} stopOpacity={0.55} />
                        <stop offset="100%" stopColor={bandFill[selBand]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" hide />
                    <YAxis domain={[0, 100]} tick={{ fill: chartTheme.axis, fontSize: 9 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip contentStyle={chartTheme.tooltipStyle} labelStyle={chartTheme.tooltipLabelStyle} />
                    <Area type="monotone" dataKey="v" stroke={bandFill[selBand]} strokeWidth={1.5} fill="url(#twin-grad)" isAnimationActive animationDuration={600} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-2 rounded-md border border-border bg-background/60 p-2">
              <div className="mb-1 flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.14em] text-primary">
                <Sparkles className="h-3 w-3" /> AI Recommendation
              </div>
              <p className="text-[11.5px] leading-snug text-foreground/90">{recommendation(selected, selState)}</p>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <Field label="Confidence" value={`${80 + Math.round(selState.occupancy / 10)}%`} tone="accent" />
                <Field label="ETA impact" value={selBand === "red" ? "≤ 5 min" : selBand === "orange" ? "≤ 10 min" : "monitor"} />
              </div>
            </div>
          </Panel>

          <Panel title="Twin Alerts" subtitle="Cross-section anomalies">
            <ul className="space-y-1.5">
              {SECTIONS.filter((s) => bandFor(states[s.id]!.occupancy) === "red" || states[s.id]!.medical > 0)
                .slice(0, 4)
                .map((s) => {
                  const st = states[s.id]!;
                  return (
                    <li key={s.id} className="flex items-start gap-2 rounded-md border border-border bg-background/60 p-1.5">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-critical" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <button onClick={() => setSelectedId(s.id)} className="truncate font-semibold hover:text-primary">
                            {s.label}
                          </button>
                          <span className="tabular-nums text-muted-foreground">{Math.round(st.occupancy)}%</span>
                        </div>
                        <div className="truncate text-[10px] text-muted-foreground">
                          {st.medical > 0 ? `${st.medical} medical` : ""}
                          {st.medical > 0 && st.security > 0 ? " · " : ""}
                          {st.security > 0 ? `${st.security} security` : ""}
                          {st.medical === 0 && st.security === 0 ? "Density above safe threshold" : ""}
                        </div>
                      </div>
                    </li>
                  );
                })}
              {SECTIONS.every((s) => bandFor(states[s.id]!.occupancy) !== "red" && states[s.id]!.medical === 0) && (
                <li className="rounded-md border border-border bg-background/60 p-2 text-[11px] text-muted-foreground">
                  All sections nominal.
                </li>
              )}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
      <span className="tabular-nums">{label}</span>
    </span>
  );
}

function centroid(points: string): { x: number; y: number } {
  const pts = points.trim().split(/\s+/).map((p) => p.split(",").map(Number) as [number, number]);
  const sum = pts.reduce((a, [x, y]) => ({ x: a.x + x, y: a.y + y }), { x: 0, y: 0 });
  return { x: sum.x / pts.length, y: sum.y / pts.length };
}

function SectionLabel({ points, text, sub }: { points: string; text: string; sub: string }) {
  const c = centroid(points);
  return (
    <g style={{ pointerEvents: "none" }}>
      <text x={c.x} y={c.y - 2} textAnchor="middle" fontSize="10" fontWeight={700} fill="#0B1220" style={{ letterSpacing: "0.05em" }}>
        {text}
      </text>
      <text x={c.x} y={c.y + 10} textAnchor="middle" fontSize="9" fill="#0B1220" fillOpacity={0.75} fontWeight={600}>
        {sub}
      </text>
    </g>
  );
}

function SectionBadge({ points, dx, color, glyph }: { points: string; dx: number; color: string; glyph: string }) {
  const c = centroid(points);
  return (
    <g style={{ pointerEvents: "none" }}>
      <circle cx={c.x + dx} cy={c.y - 16} r={5.5} fill={color} stroke="#0B1220" strokeWidth={1} />
      <text x={c.x + dx} y={c.y - 13} textAnchor="middle" fontSize="9" fontWeight={800} fill="#0B1220">
        {glyph}
      </text>
    </g>
  );
}