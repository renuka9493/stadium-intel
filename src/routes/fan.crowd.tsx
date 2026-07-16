import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/fan/crowd")({
  component: FanCrowd,
});

const zones = [
  { name: "Gate A", density: 32, tone: "accent" },
  { name: "Gate B", density: 61, tone: "primary" },
  { name: "Gate C", density: 88, tone: "destructive" },
  { name: "North Concourse", density: 45, tone: "accent" },
  { name: "South Concourse", density: 72, tone: "primary" },
  { name: "Food Court", density: 91, tone: "destructive" },
];

const trend = Array.from({ length: 16 }).map((_, i) => ({
  t: `${i * 5}m`,
  density: 30 + Math.round(35 * Math.abs(Math.sin(i / 2))) + (i > 10 ? 15 : 0),
}));

function FanCrowd() {
  return (
    <div>
      <PageHeader title="Live Crowd Status" description="Real-time density across the stadium so you can dodge the crowds." />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Overall density</div>
              <div className="text-3xl font-bold text-gradient">62%</div>
            </div>
            <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">Moderate</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.68 0.19 245)" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="oklch(0.68 0.19 245)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis dataKey="t" stroke="oklch(0.72 0.02 250)" fontSize={11} />
              <YAxis stroke="oklch(0.72 0.02 250)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.21 0.035 250)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="density" stroke="oklch(0.68 0.19 245)" fill="url(#g1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">By zone</div>
          <div className="space-y-3">
            {zones.map((z) => (
              <div key={z.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{z.name}</span>
                  <span className="text-muted-foreground">{z.density}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${z.density}%`,
                      background:
                        z.tone === "destructive"
                          ? "linear-gradient(90deg, oklch(0.65 0.24 25), oklch(0.72 0.24 40))"
                          : z.tone === "primary"
                            ? "linear-gradient(90deg, oklch(0.68 0.19 245), oklch(0.75 0.16 200))"
                            : "linear-gradient(90deg, oklch(0.72 0.19 155), oklch(0.78 0.16 190))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}