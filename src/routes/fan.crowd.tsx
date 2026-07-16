import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { LiveBadge } from "@/components/live-badge";
import { useLiveStadium } from "@/lib/live-stadium";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/fan/crowd")({
  component: FanCrowd,
});

function toneFor(v: number) {
  if (v >= 85) return "destructive";
  if (v >= 55) return "primary";
  return "accent";
}

function FanCrowd() {
  const s = useLiveStadium();
  const trend = s.history.map((h) => ({ t: h.t, density: Math.round(h.density) }));
  const zones = [
    { name: "Gate A", density: Math.round(s.gateOccupancy * 0.4) },
    { name: "Gate B", density: Math.round(s.gateOccupancy * 0.75) },
    { name: "Gate C", density: Math.round(s.gateOccupancy) },
    { name: "North Concourse", density: Math.round(s.crowdDensity * 0.7) },
    { name: "South Concourse", density: Math.round(s.crowdDensity * 0.9) },
    { name: "Food Court", density: Math.round(Math.min(99, s.crowdDensity + s.foodQueue)) },
  ].map((z) => ({ ...z, tone: toneFor(z.density) }));
  const overall = Math.round(s.crowdDensity);
  return (
    <div>
      <PageHeader title="Live Crowd Status" description="Real-time density across the stadium so you can dodge the crowds.">
        <LiveBadge />
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Overall density</div>
              <div className="text-3xl font-bold text-gradient tabular-nums transition-all duration-500">{overall}%</div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${overall >= 85 ? "bg-destructive/15 text-destructive" : overall >= 60 ? "bg-chart-3/15 text-chart-3" : "bg-accent/15 text-accent"}`}>
              {overall >= 85 ? "High" : overall >= 60 ? "Moderate" : "Low"}
            </span>
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
              <Area type="monotone" dataKey="density" stroke="oklch(0.68 0.19 245)" fill="url(#g1)" strokeWidth={2} isAnimationActive animationDuration={800} />
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
                  <span className="text-muted-foreground tabular-nums transition-all duration-500">{z.density}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
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