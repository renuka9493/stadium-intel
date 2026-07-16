import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { Check, Sparkles, X } from "lucide-react";

export const Route = createFileRoute("/admin/ai")({
  component: AdminAi,
});

type Priority = "high" | "medium" | "low";
type Rec = {
  priority: Priority;
  problem: string;
  reasoning: string;
  action: string;
  improvement: string;
  conf: number;
};

const recs: Rec[] = [
  {
    priority: "high",
    problem: "Gate B ingress is running 42% above target throughput.",
    reasoning:
      "Turnstile scan rate vs. queue depth over the last 8 minutes projects a 15-minute wait within the next quarter hour.",
    action: "Open an additional express lane at Gate B and redeploy 3 stewards from Gate A.",
    improvement: "Reduce ingress wait time by approximately 42%.",
    conf: 96,
  },
  {
    priority: "high",
    problem: "Food Court West has reached 91% occupancy.",
    reasoning:
      "Historical halftime data combined with current crowd movement indicates congestion will continue increasing.",
    action: "Open two temporary kiosks and redirect spectators using digital signboards.",
    improvement: "Queue time reduced by approximately 30%.",
    conf: 94,
  },
  {
    priority: "medium",
    problem: "Post-match egress load is unbalanced toward Exit A.",
    reasoning:
      "Simulated flow using current section occupancy shows Exit A hitting 118% while Exit E stays under 40%.",
    action: "Reroute upper-tier exit flow via Exit E immediately after full time.",
    improvement: "Balance egress load within ±8% across all exits.",
    conf: 88,
  },
  {
    priority: "medium",
    problem: "Sections 214–220 report elevated temperature readings.",
    reasoning:
      "Ambient sensors show +4°C above target with direct sun exposure on the upper east concourse through halftime.",
    action: "Trigger enhanced cooling cycle in Sections 214–220 for 20 minutes.",
    improvement: "Improve comfort index by 12%.",
    conf: 82,
  },
  {
    priority: "low",
    problem: "Concourse 3 shows minor litter accumulation.",
    reasoning:
      "Computer vision on Camera CV-31 detects debris density trending 2.1× the pre-match baseline.",
    action: "Dispatch cleaning team to Concourse 3 during the next play stoppage.",
    improvement: "Fan sentiment score up 6%.",
    conf: 74,
  },
];

function AdminAi() {
  return (
    <div>
      <PageHeader title="AI Recommendations" description="Live decisions ranked by expected impact." />
      <div className="space-y-4">
        {recs.map((r) => (
          <div key={r.problem} className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                      r.priority === "high"
                        ? "bg-destructive/20 text-destructive ring-1 ring-destructive/40"
                        : r.priority === "medium"
                          ? "bg-chart-3/20 text-chart-3 ring-1 ring-chart-3/40"
                          : "bg-accent/20 text-accent ring-1 ring-accent/40"
                    }`}
                  >
                    {r.priority} priority
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    AI generated · updated live
                  </span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Problem detected
                    </div>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">{r.problem}</p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Reasoning
                    </div>
                    <p className="mt-0.5 text-sm text-foreground/80">{r.reasoning}</p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Recommended action
                    </div>
                    <p className="mt-0.5 text-sm text-foreground/90">{r.action}</p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Estimated improvement
                    </div>
                    <p className="mt-0.5 text-sm font-semibold text-accent">{r.improvement}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="uppercase tracking-widest">Confidence</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary sm:max-w-xs">
                    <div className="h-full rounded-full bg-gradient-accent" style={{ width: `${r.conf}%` }} />
                  </div>
                  <span className="tabular-nums text-foreground">{r.conf}%</span>
                </div>
              </div>
              <div className="hidden shrink-0 flex-col items-stretch gap-2 sm:flex">
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-secondary px-3 py-1.5 text-xs">
                  <X className="h-3.5 w-3.5" /> Dismiss
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">
                  <Check className="h-3.5 w-3.5" /> Apply
                </button>
              </div>
            </div>
            <div className="mt-4 flex gap-2 sm:hidden">
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-secondary px-3 py-1.5 text-xs">
                <X className="h-3.5 w-3.5" /> Dismiss
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">
                <Check className="h-3.5 w-3.5" /> Apply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}