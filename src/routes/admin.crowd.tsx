import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

export const Route = createFileRoute("/admin/crowd")({
  component: AdminCrowd,
});

const data = Array.from({ length: 24 }).map((_, i) => ({
  t: `${i}m`,
  north: 30 + Math.round(30 * Math.abs(Math.sin(i / 3))),
  south: 40 + Math.round(35 * Math.abs(Math.cos(i / 4))),
  east: 20 + Math.round(50 * Math.abs(Math.sin(i / 2))),
  west: 25 + Math.round(40 * Math.abs(Math.cos(i / 3))),
}));

const cams = [
  { id: "CAM-01", zone: "Gate B", state: "OK" },
  { id: "CAM-02", zone: "Concourse 2", state: "OK" },
  { id: "CAM-03", zone: "Food Court", state: "ALERT" },
  { id: "CAM-04", zone: "Sec 118", state: "OK" },
  { id: "CAM-05", zone: "Exit E", state: "WARN" },
  { id: "CAM-06", zone: "VIP Lounge", state: "OK" },
];

function AdminCrowd() {
  return (
    <div>
      <PageHeader title="Crowd Monitoring" description="Multi-zone density stream, refreshed every 3 seconds." />
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
            <XAxis dataKey="t" stroke="oklch(0.72 0.02 250)" fontSize={11} />
            <YAxis stroke="oklch(0.72 0.02 250)" fontSize={11} />
            <Tooltip contentStyle={{ background: "oklch(0.21 0.035 250)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="north" stroke="oklch(0.68 0.19 245)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="south" stroke="oklch(0.72 0.19 155)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="east" stroke="oklch(0.82 0.14 90)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="west" stroke="oklch(0.65 0.24 25)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cams.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
            <div
              className="relative aspect-video"
              style={{
                background:
                  "repeating-linear-gradient(45deg, oklch(0.24 0.04 250) 0 8px, oklch(0.2 0.03 250) 8px 16px)",
              }}
            >
              <span className="absolute left-2 top-2 rounded bg-background/70 px-1.5 py-0.5 text-[10px] font-semibold tracking-widest">
                {c.id}
              </span>
              <span
                className={`absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                  c.state === "ALERT"
                    ? "bg-destructive/80 text-destructive-foreground"
                    : c.state === "WARN"
                      ? "bg-chart-3/80 text-primary-foreground"
                      : "bg-accent/80 text-primary-foreground"
                }`}
              >
                {c.state}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 text-sm">
              <span className="font-medium">{c.zone}</span>
              <button className="text-xs text-primary hover:underline">Focus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}