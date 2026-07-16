import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { Activity, ArrowUpRight, ShieldCheck, Ticket, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const kpis = [
  { label: "Attendance", value: "82,340", delta: "+2.4%", icon: Users, tone: "primary" },
  { label: "Density Index", value: "0.62", delta: "-0.08", icon: Activity, tone: "accent" },
  { label: "Open Incidents", value: "3", delta: "-1", icon: ShieldCheck, tone: "accent" },
  { label: "Ticket Scans / min", value: "412", delta: "+18", icon: Ticket, tone: "primary" },
];

const attendance = Array.from({ length: 12 }).map((_, i) => ({
  t: `${16 + Math.floor(i / 2)}:${i % 2 ? "30" : "00"}`,
  in: 2000 + i * 900 + (i > 6 ? 1200 : 0),
  out: 200 + i * 60,
}));

const gates = [
  { name: "A", scans: 3200 },
  { name: "B", scans: 4800 },
  { name: "C", scans: 5900 },
  { name: "D", scans: 2100 },
  { name: "E", scans: 3400 },
  { name: "F", scans: 2600 },
];

const donut = [
  { name: "Seated", value: 68, fill: "oklch(0.68 0.19 245)" },
  { name: "Concourse", value: 22, fill: "oklch(0.72 0.19 155)" },
  { name: "Food/Bev", value: 10, fill: "oklch(0.82 0.14 90)" },
];

function AdminDashboard() {
  return (
    <div>
      <PageHeader title="Command Dashboard" description="Live operational picture for Lusail Stadium — Match 32.">
        <span className="hidden rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent sm:inline">All systems nominal</span>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className={`grid h-9 w-9 place-items-center rounded-lg ${k.tone === "primary" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"}`}>
                <k.icon className="h-4 w-4" />
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-accent">
                <ArrowUpRight className="h-3 w-3" /> {k.delta}
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tabular-nums">{k.value}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold">Attendance flow</div>
            <div className="text-xs text-muted-foreground">Ingress vs egress · today</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={attendance}>
              <defs>
                <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.68 0.19 245)" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="oklch(0.68 0.19 245)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="go" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.19 155)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.72 0.19 155)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis dataKey="t" stroke="oklch(0.72 0.02 250)" fontSize={11} />
              <YAxis stroke="oklch(0.72 0.02 250)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.21 0.035 250)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="in" stroke="oklch(0.68 0.19 245)" fill="url(#gi)" strokeWidth={2} />
              <Area type="monotone" dataKey="out" stroke="oklch(0.72 0.19 155)" fill="url(#go)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <div className="mb-2 text-sm font-semibold">Fan distribution</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={donut} innerRadius={55} outerRadius={90} dataKey="value" stroke="none">
                {donut.map((d) => (
                  <Cell key={d.name} fill={d.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "oklch(0.21 0.035 250)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-3 space-y-1 text-xs">
            {donut.map((d) => (
              <li key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: d.fill }} />
                  {d.name}
                </span>
                <span className="font-semibold">{d.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card lg:col-span-2">
          <div className="mb-2 text-sm font-semibold">Scans by gate</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gates}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis dataKey="name" stroke="oklch(0.72 0.02 250)" fontSize={11} />
              <YAxis stroke="oklch(0.72 0.02 250)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.21 0.035 250)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
              <Bar dataKey="scans" fill="oklch(0.68 0.19 245)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <div className="mb-3 text-sm font-semibold">Live feed</div>
          <ul className="space-y-3 text-sm">
            {[
              ["18:42", "AI opened Gate B lane 3", "accent"],
              ["18:39", "Food Court density above 90%", "destructive"],
              ["18:35", "Medical dispatched · Sec 118", "primary"],
              ["18:30", "Half-time flow ready", "accent"],
            ].map(([t, msg, tone]) => (
              <li key={String(t) + String(msg)} className="flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${tone === "destructive" ? "bg-destructive" : tone === "accent" ? "bg-accent" : "bg-primary"}`} />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground tabular-nums">{t}</div>
                  <div className="truncate">{msg}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}