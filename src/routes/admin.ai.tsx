import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/portal-shell";
import { AlertTriangle, Check, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { Panel, Field, PriorityChip, MiniBar } from "@/components/ops";
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
        description="Gemini · ranked by expected operational impact"
      >
        <LiveBadge />
        <span className="text-[10.5px] tabular-nums text-muted-foreground">
          {lastRun ? `Updated ${new Date(lastRun).toLocaleTimeString()}` : "Awaiting…"}
        </span>
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-[6px] border border-border bg-background px-2 py-1 text-[10.5px] font-medium text-foreground hover:bg-secondary disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          {loading ? "Analyzing" : "Re-run"}
        </button>
      </PageHeader>

      {error && (
        <div className="mb-2 flex items-center gap-2 rounded-[8px] border border-critical/40 bg-critical/10 px-3 py-1.5 text-[11.5px] text-critical">
          <AlertTriangle className="h-3.5 w-3.5" /> {error}
        </div>
      )}

      {loading && recs.length === 0 && (
        <div className="grid gap-2 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-[10px] border border-border bg-card/60" />
          ))}
        </div>
      )}

      <div className="grid gap-2 md:grid-cols-2">
        {recs.map((r, i) => (
          <Panel
            key={i}
            title={r.problem}
            right={
              <>
                <PriorityChip p={r.priority as "high" | "medium" | "low"} />
                <span className="text-[10px] tabular-nums text-muted-foreground">Conf {Math.round(r.confidence)}%</span>
              </>
            }
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Reasoning" value={r.reasoning} />
              <Field label="Recommended action" value={r.recommendation} tone="accent" />
              <Field label="Expected impact" value={r.expectedImpact} tone="success" />
              <div>
                <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Confidence</div>
                <div className="mt-1"><MiniBar value={r.confidence} tone="primary" /></div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-end gap-1.5 border-t border-border pt-2">
              <button className="inline-flex items-center gap-1 rounded-[6px] border border-border bg-background px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" /> Dismiss
              </button>
              <button className="inline-flex items-center gap-1 rounded-[6px] bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground hover:brightness-110">
                <Check className="h-3 w-3" /> Apply
              </button>
            </div>
          </Panel>
        ))}
        {!loading && !error && recs.length === 0 && (
          <div className="col-span-full rounded-[10px] border border-border bg-card p-6 text-center text-[12px] text-muted-foreground">
            No recommendations — all metrics within safe ranges.
          </div>
        )}
      </div>

      <div className="mt-2">
        <Panel title="Analysis Debug" subtitle="Snapshot fed to Gemini">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <Field label="Gate occupancy" value={`${Math.round(live.gateOccupancy)}%`} />
            <Field label="Food queue" value={`${live.foodQueue.toFixed(1)} min`} />
            <Field label="Parking" value={`${Math.round(live.parkingOccupancy)}%`} />
            <Field label="Crowd density" value={`${Math.round(live.crowdDensity)}%`} />
            <Field label="Medical" value={`${live.medicalAlerts} active`} tone={live.medicalAlerts > 0 ? "warning" : undefined} />
          </div>
        </Panel>
      </div>
    </div>
  );
}