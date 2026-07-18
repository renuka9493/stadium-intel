import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Bot,
  Clock,
  Cpu,
  Gauge as GaugeIcon,
  HeartPulse,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users2,
  Zap,
} from "lucide-react";
import { Chip, Kpi, OpsToolbar, Panel, ToolbarDot, tonePalette, type Tone } from "@/components/ops";
import { LiveBadge } from "@/components/live-badge";
import { useLiveStadium } from "@/lib/live-stadium";
import {
  generateExecutiveInsights,
  type ExecutiveInsight,
} from "@/lib/executive-insights.functions";

export const Route = createFileRoute("/admin/executive")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — Stadium Brain" },
      {
        name: "description",
        content:
          "Board-level operational KPIs, AI performance, and readiness scores for stadium leadership.",
      },
    ],
  }),
  component: ExecutivePage,
});

function scoreTone(v: number): Tone {
  if (v >= 85) return "success";
  if (v >= 70) return "primary";
  if (v >= 55) return "warning";
  return "critical";
}

function CircularGauge({
  value,
  label,
  suffix = "",
  size = 128,
  tone,
}: {
  value: number;
  label: string;
  suffix?: string;
  size?: number;
  tone?: Tone;
}) {
  const t = tone ?? scoreTone(value);
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;
  const palette = tonePalette(t);
  const color =
    t === "critical"
      ? "#EF4444"
      : t === "warning"
        ? "#F59E0B"
        : t === "success"
          ? "#22C55E"
          : "#2563EB";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="var(--border)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 700ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className={`text-[22px] font-semibold tabular-nums leading-none ${palette.text}`}>
              {value.toFixed(suffix === "s" ? 1 : 0)}
              <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">
                {suffix || "%"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
    </div>
  );
}

function InsightRow({ ins }: { ins: ExecutiveInsight }) {
  const tone: Tone = ins.tone === "positive" ? "success" : ins.tone === "critical" ? "critical" : "warning";
  const Icon = ins.tone === "positive" ? BadgeCheck : ins.tone === "critical" ? AlertTriangle : Activity;
  const palette = tonePalette(tone);
  return (
    <div className="flex items-start gap-2 border-b border-border/60 py-2 last:border-b-0 last:pb-0 first:pt-0">
      <div className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md ring-1 ${palette.bg} ${palette.ring}`}>
        <Icon className="h-3 w-3" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[11.5px] font-semibold tracking-tight">{ins.headline}</span>
          <Chip tone={tone}>{ins.tone}</Chip>
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{ins.detail}</p>
      </div>
    </div>
  );
}

function ExecutivePage() {
  const live = useLiveStadium();

  // Derive board-level scores from live stadium telemetry (deterministic).
  const scores = useMemo(() => {
    const crowdSafety = Math.max(20, 100 - (live.crowdDensity - 55) * 1.2 - live.medicalAlerts * 4);
    const queuePerformance = Math.max(20, 100 - live.foodQueue * 3.2);
    const resourceUtilization = Math.min(99, live.gateOccupancy * 0.55 + live.parkingOccupancy * 0.45);
    const operationalEfficiency = (crowdSafety * 0.35 + queuePerformance * 0.35 + resourceUtilization * 0.3);
    const emergencyReadiness = Math.max(30, 100 - live.medicalAlerts * 9 - Math.max(0, live.crowdDensity - 80));
    const aiPerformance = 92 + Math.sin(live.tick / 4) * 3;
    const avgResponseSec = 95 + Math.cos(live.tick / 3) * 12 + live.medicalAlerts * 8;
    const healthScore = (crowdSafety * 0.3 + operationalEfficiency * 0.3 + emergencyReadiness * 0.25 + aiPerformance * 0.15);
    return {
      healthScore,
      aiPerformance,
      avgResponseSec,
      crowdSafety,
      operationalEfficiency,
      resourceUtilization,
      emergencyReadiness,
      queuePerformance,
    };
  }, [live]);

  const runInsights = useServerFn(generateExecutiveInsights);
  const [insights, setInsights] = useState<ExecutiveInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const out = await runInsights({ data: { snapshot: scores } });
      setInsights(out.insights);
      setLastRun(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastRunLabel = lastRun
    ? new Date(lastRun).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";

  return (
    <div>
      <OpsToolbar
        title="Executive Dashboard"
        meta={
          <>
            <ToolbarDot tone="success" label="Board view" />
            <span className="text-muted-foreground/70">·</span>
            <span>Insights {lastRunLabel}</span>
          </>
        }
        right={
          <>
            <LiveBadge />
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10.5px] font-medium tracking-tight text-foreground/90 transition hover:bg-secondary disabled:opacity-60"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Analyzing" : "Refresh Insights"}
            </button>
          </>
        }
      />

      {/* Executive AI Insights */}
      <Panel
        title="AI Executive Insights"
        subtitle="Gemini · board briefing"
        right={<Chip tone="primary">Auto</Chip>}
        className="mb-3"
      >
        {error ? (
          <div className="rounded-md border border-critical/30 bg-critical/10 p-2 text-[11px] text-critical">
            {error}
          </div>
        ) : insights.length === 0 && loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded-md bg-secondary/60" />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="text-[11px] text-muted-foreground">No insights yet — click Refresh.</div>
        ) : (
          <div>
            {insights.map((ins, i) => (
              <InsightRow key={i} ins={ins} />
            ))}
          </div>
        )}
      </Panel>

      {/* KPI cards */}
      <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        <Kpi
          icon={HeartPulse}
          label="Stadium Health"
          value={scores.healthScore}
          suffix="/100"
          tone={scoreTone(scores.healthScore)}
          delta={1.4}
          format="decimal"
        />
        <Kpi
          icon={Cpu}
          label="AI Performance"
          value={scores.aiPerformance}
          suffix="/100"
          tone={scoreTone(scores.aiPerformance)}
          delta={0.6}
          format="decimal"
        />
        <Kpi
          icon={Clock}
          label="Avg Response"
          value={scores.avgResponseSec}
          suffix="sec"
          tone={scores.avgResponseSec < 120 ? "success" : scores.avgResponseSec < 180 ? "warning" : "critical"}
          delta={-3.1}
          format="decimal"
        />
        <Kpi
          icon={ShieldCheck}
          label="Crowd Safety"
          value={scores.crowdSafety}
          suffix="/100"
          tone={scoreTone(scores.crowdSafety)}
          delta={0.9}
          format="decimal"
        />
        <Kpi
          icon={TrendingUp}
          label="Op. Efficiency"
          value={scores.operationalEfficiency}
          suffix="/100"
          tone={scoreTone(scores.operationalEfficiency)}
          delta={2.2}
          format="decimal"
        />
        <Kpi
          icon={Users2}
          label="Resource Util."
          value={scores.resourceUtilization}
          suffix="%"
          tone={scores.resourceUtilization > 90 ? "warning" : "primary"}
          delta={1.1}
          format="decimal"
        />
        <Kpi
          icon={Zap}
          label="Emergency Readiness"
          value={scores.emergencyReadiness}
          suffix="/100"
          tone={scoreTone(scores.emergencyReadiness)}
          delta={0.4}
          format="decimal"
        />
        <Kpi
          icon={GaugeIcon}
          label="Queue Performance"
          value={scores.queuePerformance}
          suffix="/100"
          tone={scoreTone(scores.queuePerformance)}
          delta={-1.6}
          format="decimal"
        />
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Panel
          title="Composite Health"
          subtitle="Board-level score"
          right={<Chip tone={scoreTone(scores.healthScore)}>Live</Chip>}
          className="lg:col-span-1"
        >
          <div className="flex flex-col items-center gap-3 py-2">
            <CircularGauge
              value={scores.healthScore}
              label="Overall Stadium Health"
              size={168}
            />
            <div className="grid w-full grid-cols-2 gap-2 pt-1">
              <div className="rounded-md border border-border bg-background/60 px-2 py-1.5">
                <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                  Directive
                </div>
                <div className="text-[11px] font-medium">
                  {scores.healthScore >= 85
                    ? "Maintain posture"
                    : scores.healthScore >= 70
                      ? "Monitor closely"
                      : "Escalate now"}
                </div>
              </div>
              <div className="rounded-md border border-border bg-background/60 px-2 py-1.5">
                <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                  Trend 1h
                </div>
                <div className="text-[11px] font-medium tabular-nums text-success">
                  ▲ 1.4 pts
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          title="Operational Gauges"
          subtitle="Live readiness scores"
          right={<Chip tone="primary">4 domains</Chip>}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-2 gap-4 py-2 sm:grid-cols-4">
            <CircularGauge value={scores.crowdSafety} label="Crowd Safety" />
            <CircularGauge value={scores.operationalEfficiency} label="Efficiency" />
            <CircularGauge value={scores.emergencyReadiness} label="Emergency" />
            <CircularGauge value={scores.queuePerformance} label="Queues" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MiniStat icon={Cpu} label="AI Performance" value={`${scores.aiPerformance.toFixed(1)}%`} tone={scoreTone(scores.aiPerformance)} />
            <MiniStat icon={Clock} label="Avg Response" value={`${scores.avgResponseSec.toFixed(0)}s`} tone={scores.avgResponseSec < 120 ? "success" : "warning"} />
            <MiniStat icon={Users2} label="Resource Util." value={`${scores.resourceUtilization.toFixed(0)}%`} tone={scores.resourceUtilization > 90 ? "warning" : "primary"} />
            <MiniStat icon={Sparkles} label="AI Actions / hr" value={`${18 + (live.tick % 6)}`} tone="primary" />
          </div>
        </Panel>

        <Panel title="AI Analyst" subtitle="Model · gemini-3-flash" className="lg:col-span-3">
          <div className="flex items-start gap-2">
            <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/30">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <p className="text-[11.5px] leading-relaxed text-foreground/90">
              Overall health at{" "}
              <span className="font-semibold text-foreground">{scores.healthScore.toFixed(1)}</span>{" "}
              with emergency readiness{" "}
              <span className="font-semibold text-foreground">
                {scores.emergencyReadiness.toFixed(0)}
              </span>{" "}
              and queue performance{" "}
              <span className="font-semibold text-foreground">
                {scores.queuePerformance.toFixed(0)}
              </span>
              . AI throughput steady; recommend maintaining current posture and refreshing
              executive insights every 10 minutes during peak flow.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
  tone?: Tone;
}) {
  const palette = tonePalette(tone);
  return (
    <div className="rounded-md border border-border bg-background/60 px-2 py-1.5">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className={`h-3 w-3 ${palette.text}`} />
        <span className="truncate">{label}</span>
      </div>
      <div className={`mt-0.5 text-[13px] font-semibold tabular-nums ${palette.text}`}>{value}</div>
    </div>
  );
}