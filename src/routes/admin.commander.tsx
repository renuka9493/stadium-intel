import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Database,
  Loader2,
  Pause,
  Play,
  Radio,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Panel, PriorityChip, MiniBar, StatMini, OpsToolbar, ToolbarDot } from "@/components/ops";
import { LiveBadge } from "@/components/live-badge";
import { useLiveStadium } from "@/lib/live-stadium";
import { generateOpsRecommendations, type OpsRecommendation } from "@/lib/stadium-ai.functions";

export const Route = createFileRoute("/admin/commander")({
  component: MissionCommander,
});

type Insight = OpsRecommendation & { id: string; timestamp: number };

const REFRESH_MS = 15000;
const MAX_INSIGHTS = 14;

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
}

function hashKey(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h.toString(36);
}

function MissionCommander() {
  const call = useServerFn(generateOpsRecommendations);
  const live = useLiveStadium();
  const liveRef = useRef(live);
  liveRef.current = live;

  const [insights, setInsights] = useState<Insight[]>([]);
  const [running, setRunning] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastRun, setLastRun] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cycles, setCycles] = useState(0);
  const [, force] = useState(0);

  // ticking clock for "Xs ago" timestamps
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const analyze = useCallback(async () => {
    setAnalyzing(true);
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
      const now = Date.now();
      setInsights((prev) => {
        const existingKeys = new Set(prev.map((p) => hashKey(p.problem)));
        const fresh: Insight[] = recommendations
          .filter((r) => !existingKeys.has(hashKey(r.problem)))
          .map((r, i) => ({
            ...r,
            id: `${now}-${i}-${hashKey(r.problem)}`,
            timestamp: now,
          }));
        return [...fresh, ...prev].slice(0, MAX_INSIGHTS);
      });
      setLastRun(now);
      setCycles((c) => c + 1);
    } catch (err) {
      console.error(err);
      setError("AI Commander could not reach the model. Retrying…");
    } finally {
      setAnalyzing(false);
    }
  }, [call]);

  // initial + interval
  useEffect(() => {
    if (!running) return;
    void analyze();
    const id = setInterval(() => void analyze(), REFRESH_MS);
    return () => clearInterval(id);
  }, [running, analyze]);

  const high = insights.filter((i) => i.priority === "high").length;
  const med = insights.filter((i) => i.priority === "medium").length;
  const low = insights.filter((i) => i.priority === "low").length;
  const avgConfidence = insights.length
    ? Math.round(insights.reduce((a, b) => a + b.confidence, 0) / insights.length)
    : 0;

  return (
    <div>
      <OpsToolbar
        title="AI Mission Commander"
        meta={
          <>
            <ToolbarDot tone={running ? "success" : "warning"} label={running ? "Autonomous" : "Paused"} />
            <span>Gemini · 15s cycle</span>
            <span>Cycle #{cycles}</span>
          </>
        }
        right={
          <>
            <LiveBadge />
            <span className="text-[10.5px] tabular-nums text-muted-foreground">
              {lastRun ? `Last analysis · ${timeAgo(lastRun)}` : "Awaiting first sweep…"}
            </span>
            <button
              onClick={() => setRunning((r) => !r)}
              className="inline-flex items-center gap-1 rounded-[6px] border border-border bg-background px-2 py-1 text-[10.5px] font-medium hover:bg-secondary"
            >
              {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {running ? "Pause" : "Resume"}
            </button>
            <button
              onClick={() => void analyze()}
              disabled={analyzing}
              className="inline-flex items-center gap-1 rounded-[6px] bg-primary px-2.5 py-1 text-[10.5px] font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60"
            >
              {analyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              Analyze now
            </button>
          </>
        }
      />

      <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-5">
        <StatMini label="Insights" value={insights.length} hint={`max ${MAX_INSIGHTS}`} tone="primary" />
        <StatMini label="High" value={high} tone={high > 0 ? "critical" : "neutral"} />
        <StatMini label="Medium" value={med} tone={med > 0 ? "warning" : "neutral"} />
        <StatMini label="Low" value={low} tone={low > 0 ? "success" : "neutral"} />
        <StatMini label="Avg Confidence" value={`${avgConfidence}%`} tone="primary" />
      </div>

      {error && (
        <div className="mb-2 flex items-center gap-2 rounded-[8px] border border-warning/40 bg-warning/10 px-3 py-1.5 text-[11.5px] text-warning">
          <AlertTriangle className="h-3.5 w-3.5" /> {error}
        </div>
      )}

      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-2">
          {insights.length === 0 && analyzing && (
            <div className="flex items-center gap-2 rounded-[10px] border border-border bg-card p-4 text-[12px] text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              Commander is analyzing live telemetry…
            </div>
          )}
          {insights.map((it, idx) => (
            <InsightCard key={it.id} insight={it} isNew={idx === 0 && Date.now() - it.timestamp < 4000} />
          ))}
          {!analyzing && insights.length === 0 && !error && (
            <div className="rounded-[10px] border border-border bg-card p-6 text-center text-[12px] text-muted-foreground">
              No operational insights — all systems within safe thresholds.
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Panel
            title="Commander Status"
            subtitle="Autonomous loop"
            right={<Radio className={`h-3 w-3 ${running ? "text-success" : "text-muted-foreground"}`} />}
          >
            <div className="space-y-2 text-[11.5px]">
              <Row label="Model" value="google/gemini-3-flash" />
              <Row label="Cycle" value={`${REFRESH_MS / 1000}s`} />
              <Row label="Cycles run" value={cycles} />
              <Row
                label="State"
                value={
                  analyzing ? (
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Loader2 className="h-3 w-3 animate-spin" /> analyzing
                    </span>
                  ) : running ? (
                    <span className="text-success">idle · armed</span>
                  ) : (
                    <span className="text-warning">paused</span>
                  )
                }
              />
              <Row label="Last sweep" value={lastRun ? timeAgo(lastRun) : "—"} />
            </div>
          </Panel>

          <Panel title="Live Snapshot" subtitle="Fed to Commander">
            <div className="grid grid-cols-2 gap-1.5">
              <StatMini label="Crowd" value={`${Math.round(live.crowdDensity)}%`} tone={live.crowdDensity > 85 ? "critical" : live.crowdDensity > 70 ? "warning" : "success"} />
              <StatMini label="Gates" value={`${Math.round(live.gateOccupancy)}%`} tone={live.gateOccupancy > 90 ? "critical" : live.gateOccupancy > 75 ? "warning" : "success"} />
              <StatMini label="Food Q" value={`${live.foodQueue.toFixed(1)}m`} tone={live.foodQueue > 18 ? "warning" : "success"} />
              <StatMini label="Parking" value={`${Math.round(live.parkingOccupancy)}%`} tone={live.parkingOccupancy > 92 ? "critical" : live.parkingOccupancy > 80 ? "warning" : "success"} />
              <StatMini label="Medical" value={live.medicalAlerts} tone={live.medicalAlerts > 0 ? "warning" : "success"} />
              <StatMini label="Tick" value={`#${live.tick}`} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-1 last:border-0 last:pb-0">
      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <span className="tabular-nums text-foreground/90">{value}</span>
    </div>
  );
}

function InsightCard({ insight, isNew }: { insight: Insight; isNew: boolean }) {
  const ts = new Date(insight.timestamp);
  const time = `${String(ts.getHours()).padStart(2, "0")}:${String(ts.getMinutes()).padStart(2, "0")}:${String(ts.getSeconds()).padStart(2, "0")}`;
  const tone =
    insight.priority === "high" ? "critical" : insight.priority === "medium" ? "warning" : "success";
  const border =
    tone === "critical"
      ? "border-l-critical"
      : tone === "warning"
        ? "border-l-warning"
        : "border-l-success";
  return (
    <article
      className={`rounded-[10px] border border-border border-l-2 bg-card shadow-card ${border} ${isNew ? "animate-in fade-in slide-in-from-top-2 duration-500" : ""}`}
    >
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <PriorityChip p={insight.priority as "high" | "medium" | "low"} />
          <span className="text-[10px] font-mono tabular-nums text-muted-foreground">{time}</span>
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            · {timeAgo(insight.timestamp)}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold tabular-nums text-primary">
          <Target className="h-3 w-3" />
          {Math.round(insight.confidence)}%
        </span>
      </header>
      <div className="grid gap-2.5 p-3 sm:grid-cols-2">
        <Section
          icon={<AlertTriangle className="h-3 w-3 text-critical" />}
          label="Problem Detected"
          text={insight.problem}
          emphasize
        />
        <Section
          icon={<Brain className="h-3 w-3 text-primary" />}
          label="AI Analysis"
          text={insight.reasoning}
        />
        <DataSources sources={insight.dataSources ?? []} />
        <Section
          icon={<CheckCircle2 className="h-3 w-3 text-success" />}
          label="Recommended Action"
          text={insight.recommendation}
          emphasize
        />
        <Section
          icon={<TrendingUp className="h-3 w-3 text-success" />}
          label="Expected Impact"
          text={insight.expectedImpact}
        />
      </div>
      <div className="flex items-center gap-2 border-t border-border px-3 py-1.5">
        <span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Confidence</span>
        <div className="flex-1">
          <MiniBar value={insight.confidence} tone={tone} />
        </div>
        <span className="w-9 text-right text-[10px] tabular-nums text-muted-foreground">
          {Math.round(insight.confidence)}%
        </span>
      </div>
    </article>
  );
}

function Section({
  icon,
  label,
  text,
  emphasize,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
  emphasize?: boolean;
}) {
  return (
    <div>
      <div className="mb-0.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={`text-[11.5px] leading-snug ${emphasize ? "text-foreground" : "text-foreground/80"}`}>
        {text}
      </p>
    </div>
  );
}

function DataSources({ sources }: { sources: string[] }) {
  if (!sources.length) return null;
  return (
    <div>
      <div className="mb-0.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Database className="h-3 w-3 text-primary" />
        Data Sources Used
      </div>
      <div className="flex flex-wrap gap-1">
        {sources.map((s, i) => (
          <span
            key={i}
            className="inline-flex items-center rounded-[4px] border border-border bg-secondary/50 px-1.5 py-0.5 text-[10px] text-foreground/80"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}