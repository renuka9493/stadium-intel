import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Panel, LiveTag, StatMini, chartTheme } from "@/components/ops";
import { useLiveStadium } from "@/lib/live-stadium";
import { Camera, Focus } from "lucide-react";

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
  { id: "CAM-01", zone: "Gate B", state: "OK", people: 142 },
  { id: "CAM-02", zone: "Concourse 2", state: "OK", people: 88 },
  { id: "CAM-03", zone: "Food Court", state: "ALERT", people: 312 },
  { id: "CAM-04", zone: "Sec 118", state: "OK", people: 204 },
  { id: "CAM-05", zone: "Exit E", state: "WARN", people: 176 },
  { id: "CAM-06", zone: "VIP Lounge", state: "OK", people: 34 },
  { id: "CAM-07", zone: "Gate A", state: "OK", people: 96 },
  { id: "CAM-08", zone: "Turnstile B4", state: "WARN", people: 158 },
];

function AdminCrowd() {
  const live = useLiveStadium();
  return (
    <div>
      <PageHeader title="Crowd Analytics" description={`4 zones · 8 cameras · refresh 3s`}>
        <LiveTag />
      </PageHeader>

      <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatMini label="Overall density" value={`${Math.round(live.crowdDensity)}%`} hint="target <75%" tone={live.crowdDensity > 85 ? "critical" : live.crowdDensity > 70 ? "warning" : "success"} />
        <StatMini label="Peak zone" value="East" hint={`${Math.round(live.crowdDensity * 1.12)}%`} tone="warning" />
        <StatMini label="Cameras online" value="8 / 8" tone="success" />
        <StatMini label="Alerts" value={cams.filter((c) => c.state !== "OK").length} tone="warning" />
      </div>

      <div className="grid gap-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="Zone density" subtitle="Last 24 minutes · 4 quadrants" right={<LiveTag />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 6, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="t" stroke={chartTheme.axis} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={chartTheme.axis} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={chartTheme.tooltipStyle} labelStyle={chartTheme.tooltipLabelStyle} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
                <Line type="monotone" dataKey="north" stroke={chartTheme.primary} strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="south" stroke={chartTheme.success} strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="east" stroke={chartTheme.warning} strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="west" stroke={chartTheme.info} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Density by zone" subtitle="Instantaneous">
          <ul className="space-y-1.5">
            {[
              { name: "North", v: Math.round(live.crowdDensity * 0.98) },
              { name: "South", v: Math.round(live.crowdDensity * 0.86) },
              { name: "East", v: Math.round(live.crowdDensity * 1.12) },
              { name: "West", v: Math.round(live.crowdDensity * 0.92) },
            ].map((z) => {
              const tone = z.v > 85 ? "#EF4444" : z.v > 70 ? "#F59E0B" : "#22C55E";
              return (
                <li key={z.name} className="rounded-[6px] border border-border bg-background px-2 py-1.5">
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="text-muted-foreground">{z.name}</span>
                    <span className="tabular-nums font-medium">{z.v}%</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${z.v}%`, background: tone }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="mt-2">
        <Panel title="CCTV wall" subtitle="8 zones · computer vision" right={<LiveTag />}>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {cams.map((c) => {
              const state =
                c.state === "ALERT"
                  ? "bg-critical/20 text-critical ring-critical/40"
                  : c.state === "WARN"
                    ? "bg-warning/20 text-warning ring-warning/40"
                    : "bg-success/20 text-success ring-success/40";
              return (
                <div key={c.id} className="overflow-hidden rounded-[8px] border border-border bg-background">
                  <div className="relative aspect-video grid-lines">
                    <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-sm bg-card/80 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground ring-1 ring-border backdrop-blur">
                      <Camera className="h-2.5 w-2.5" /> {c.id}
                    </span>
                    <span className={`absolute right-1.5 top-1.5 rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ring-1 ${state}`}>
                      {c.state}
                    </span>
                    <span className="absolute bottom-1.5 left-1.5 rounded-sm bg-card/80 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-foreground ring-1 ring-border backdrop-blur">
                      {c.people}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border px-2 py-1 text-[11px]">
                    <span className="truncate">{c.zone}</span>
                    <button className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                      <Focus className="h-2.5 w-2.5" /> Focus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}