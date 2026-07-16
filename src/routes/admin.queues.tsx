import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/admin/queues")({
  component: AdminQueues,
});

const queues = [
  { name: "Gate A", now: 3, avg: 5 },
  { name: "Gate B", now: 8, avg: 6 },
  { name: "Gate C", now: 14, avg: 9 },
  { name: "Food Ct", now: 11, avg: 7 },
  { name: "Merch", now: 4, avg: 4 },
  { name: "Exit E", now: 2, avg: 3 },
];

function AdminQueues() {
  return (
    <div>
      <PageHeader title="Queue Analytics" description="Current vs 30-day average wait times, per zone." />
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={queues}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
            <XAxis dataKey="name" stroke="oklch(0.72 0.02 250)" fontSize={11} />
            <YAxis stroke="oklch(0.72 0.02 250)" fontSize={11} />
            <Tooltip contentStyle={{ background: "oklch(0.21 0.035 250)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
            <Bar dataKey="avg" fill="oklch(0.27 0.04 250)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="now" fill="oklch(0.68 0.19 245)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {queues.map((q) => (
          <div key={q.name} className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{q.name}</div>
            <div className="mt-2 flex items-end gap-2">
              <div className="text-3xl font-bold tabular-nums">{q.now}m</div>
              <div className={`text-xs ${q.now > q.avg ? "text-destructive" : "text-accent"}`}>
                {q.now > q.avg ? "+" : ""}{q.now - q.avg}m vs avg
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}