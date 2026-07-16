import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/portal-shell";
import { AlertTriangle, Check, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { generateOpsRecommendations, type OpsRecommendation } from "@/lib/stadium-ai.functions";
import { useLiveStadium } from "@/lib/live-stadium";
import { LiveBadge } from "@/components/live-badge";

export const Route = createFileRoute("/admin/ai")({
  component: AdminAi,
});

function AdminAi() {
  const call = useServerFn(generateOpsRecommendations);
  const live = useLiveStadium();
  const liveRef = useRef(live);
  liveRef.current = live;
  const [recs, setRecs] = useState<OpsRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<number | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = liveRef.current;
      const { recommendations } = await call({
        data: {
          stadium: {
            gateOccupancy: s.gateOccupancy,
            foodQueue: s.foodQueue,
            parkingOccupancy: s.parkingOccupancy,
            crowdDensity: s.crowdDensity,
            medicalAlerts: s.medicalAlerts,
          },
        },
      });
      setRecs(recommendations);
      setLastRun(Date.now());
    } catch (err) {
      console.error(err);
      setError("Could not generate recommendations. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => {
    void run();
  }, [run]);

  return (
    <div>
      <PageHeader
        title="AI Recommendations"
        description="Gemini analyzes live stadium metrics and ranks actions by expected impact."
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-card">
        <div className="flex items-center gap-3">
          <LiveBadge />
          <div className="text-xs text-muted-foreground">
            {lastRun
              ? `Last analysis ${new Date(lastRun).toLocaleTimeString()}`
              : "Waiting for first analysis…"}
          </div>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {loading ? "Analyzing…" : "Re-run analysis"}
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading && recs.length === 0 && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-border/60 bg-card/60"
            />
          ))}
        </div>
      )}

      <div className="space-y-4">
        {recs.map((r, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
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
                    Gemini · grounded in live data
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
                      Recommendation
                    </div>
                    <p className="mt-0.5 text-sm text-foreground/90">{r.recommendation}</p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Expected impact
                    </div>
                    <p className="mt-0.5 text-sm font-semibold text-accent">{r.expectedImpact}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="uppercase tracking-widest">Confidence score</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary sm:max-w-xs">
                    <div
                      className="h-full rounded-full bg-gradient-accent transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, r.confidence))}%` }}
                    />
                  </div>
                  <span className="tabular-nums text-foreground">
                    {Math.round(r.confidence)}%
                  </span>
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
        {!loading && !error && recs.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
            No recommendations at this moment — all metrics are within safe ranges.
          </div>
        )}
      </div>
    </div>
  );
}