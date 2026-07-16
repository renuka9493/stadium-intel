import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { Check, Sparkles, X } from "lucide-react";

export const Route = createFileRoute("/admin/ai")({
  component: AdminAi,
});

const recs = [
  { title: "Open Gate B extra lane", impact: "Reduce ingress wait by 42%", conf: 96, priority: "high" },
  { title: "Staff 2 more attendants at Food Court", impact: "Cut queue by 6 min", conf: 91, priority: "high" },
  { title: "Reroute exit flow via Exit E after full time", impact: "Balance egress load ±8%", conf: 88, priority: "medium" },
  { title: "Trigger cooling in Sec 214-220", impact: "Comfort index +12%", conf: 82, priority: "medium" },
  { title: "Dispatch cleaning team to Concourse 3", impact: "Fan sentiment +6%", conf: 74, priority: "low" },
];

function AdminAi() {
  return (
    <div>
      <PageHeader title="AI Recommendations" description="Live decisions ranked by expected impact." />
      <div className="space-y-3">
        {recs.map((r) => (
          <div key={r.title} className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
              <div className="min-w-0 flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold">{r.title}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                        r.priority === "high"
                          ? "bg-destructive/20 text-destructive"
                          : r.priority === "medium"
                            ? "bg-chart-3/20 text-chart-3"
                            : "bg-accent/20 text-accent"
                      }`}
                    >
                      {r.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.impact}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Confidence</span>
                    <div className="h-1.5 w-40 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gradient-accent" style={{ width: `${r.conf}%` }} />
                    </div>
                    <span className="tabular-nums">{r.conf}%</span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-secondary px-3 py-1.5 text-xs">
                  <X className="h-3.5 w-3.5" /> Dismiss
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">
                  <Check className="h-3.5 w-3.5" /> Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}