import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Sparkles,
  FileText,
  Users,
  Clock,
  AlertTriangle,
  Timer,
  Ambulance,
  Brain,
  Gauge,
  Lightbulb,
  Loader2,
  Printer,
  Trophy,
} from "lucide-react";
import {
  generateExecutiveSummary,
  type ExecutiveReport,
} from "@/lib/executive-summary.functions";

function SummaryPage() {
  const generate = useServerFn(generateExecutiveSummary);
  const [report, setReport] = useState<ExecutiveReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const result = await generate();
      setReport(result as ExecutiveReport);
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <FileText className="h-3.5 w-3.5 text-emerald-300" />
            Executive Summary
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Match-Day Operational Report
          </h1>
          <p className="max-w-2xl text-sm text-white/60">
            A polished, AI-generated briefing for stadium management.
          </p>
        </div>

        <div className="flex gap-2">
          {report && (
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
          )}
          <button
            onClick={run}
            disabled={loading}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 via-emerald-500 to-sky-500 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_40px_-10px_rgba(56,189,248,0.7)] transition hover:bg-[position:100%_0] disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Analyzing match data…" : "Generate AI Match Summary"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {!report && !loading && !error && <EmptyState />}
      {loading && <LoadingState />}
      {report && <Report report={report} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/30 to-emerald-500/30 text-white">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">
        Ready when you are
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
        Click <span className="text-white">Generate AI Match Summary</span> and Stadium Brain will
        compile a full post-match executive report.
      </p>
    </div>
  );
}

function LoadingState() {
  const rows = ["Attendance & flow", "Incidents & response", "AI decisions", "Recommendations"];
  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
      <div className="flex items-center gap-3 text-white/80">
        <Loader2 className="h-4 w-4 animate-spin text-sky-300" />
        <span className="text-sm">Aggregating match telemetry…</span>
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r} className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-sky-500 to-emerald-400" />
            </div>
            <span className="w-40 text-xs text-white/50">{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Report({ report }: { report: ExecutiveReport }) {
  return (
    <article className="space-y-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-8 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-300">
            <Trophy className="h-3.5 w-3.5" /> Post-Match Report
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-white">{report.matchTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">{report.headline}</p>
        </div>
        <div className="hidden shrink-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-right sm:block">
          <div className="text-[10px] uppercase tracking-widest text-white/50">Efficiency</div>
          <div className="text-3xl font-semibold text-white">{report.operationalEfficiency.score}<span className="text-base text-white/50">/100</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MetricCard icon={Users} tint="sky" label="Attendance">
          <div className="text-2xl font-semibold text-white">{report.attendance.total}</div>
          <div className="text-xs text-white/50">{report.attendance.capacityPct}% of capacity</div>
          <p className="mt-2 text-sm text-white/70">{report.attendance.note}</p>
        </MetricCard>

        <MetricCard icon={Clock} tint="emerald" label="Peak Crowd Time">
          <div className="text-2xl font-semibold text-white">{report.peakCrowdTime.time}</div>
          <div className="text-xs text-white/50">{report.peakCrowdTime.zone}</div>
          <p className="mt-2 text-sm text-white/70">{report.peakCrowdTime.note}</p>
        </MetricCard>

        <MetricCard icon={Timer} tint="sky" label="Average Queue Time">
          <div className="text-2xl font-semibold text-white">{report.avgQueueTime.minutes} min</div>
          <div className="text-xs text-emerald-300">{report.avgQueueTime.change}</div>
          <p className="mt-2 text-sm text-white/70">{report.avgQueueTime.note}</p>
        </MetricCard>

        <MetricCard icon={Ambulance} tint="rose" label="Emergency Response">
          <div className="text-2xl font-semibold text-white">
            {formatSeconds(report.emergencyResponse.avgResponseSeconds)}
          </div>
          <div className="text-xs text-white/50">
            {report.emergencyResponse.incidentsHandled} incidents · Grade {report.emergencyResponse.grade}
          </div>
          <p className="mt-2 text-sm text-white/70">{report.emergencyResponse.note}</p>
        </MetricCard>
      </div>

      {/* Incidents */}
      <Section icon={AlertTriangle} title="Major Incidents">
        {report.majorIncidents.length === 0 ? (
          <p className="text-sm text-white/60">No major incidents recorded.</p>
        ) : (
          <ul className="divide-y divide-white/5 rounded-xl border border-white/10 bg-black/20">
            {report.majorIncidents.map((i, idx) => (
              <li key={idx} className="flex flex-wrap items-center gap-3 p-4">
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/70">{i.time}</span>
                <span className="font-medium text-white">{i.type}</span>
                <span className="ml-auto text-sm text-white/60">{i.resolution}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* AI Decisions */}
      <Section icon={Brain} title="AI Decisions Taken">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {report.aiDecisions.map((d, idx) => (
            <div key={idx} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-medium text-white">{d.decision}</div>
              <div className="mt-1 text-xs text-emerald-300">{d.impact}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Efficiency */}
      <Section icon={Gauge} title="Operational Efficiency">
        <div className="rounded-xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Overall score</span>
            <span className="text-lg font-semibold text-white">{report.operationalEfficiency.score}/100</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-[width] duration-1000"
              style={{ width: `${report.operationalEfficiency.score}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-white/70">{report.operationalEfficiency.summary}</p>
        </div>
      </Section>

      {/* Suggestions */}
      <Section icon={Lightbulb} title="Suggestions for Future Matches">
        <ol className="space-y-2">
          {report.suggestions.map((s, idx) => (
            <li key={idx} className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-xs font-semibold text-slate-950">
                {idx + 1}
              </span>
              <span className="text-sm text-white/80">{s}</span>
            </li>
          ))}
        </ol>
      </Section>

      <footer className="border-t border-white/10 pt-4 text-xs text-white/40">
        Generated by Stadium Brain · Confidential — for internal management use only.
      </footer>
    </article>
  );
}

function MetricCard({
  icon: Icon,
  label,
  tint,
  children,
}: {
  icon: any;
  label: string;
  tint: "sky" | "emerald" | "rose";
  children: React.ReactNode;
}) {
  const tints = {
    sky: "text-sky-300 bg-sky-500/10",
    emerald: "text-emerald-300 bg-emerald-500/10",
    rose: "text-rose-300 bg-rose-500/10",
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-white/50">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tints[tint]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/80">
        <Icon className="h-4 w-4 text-sky-300" /> {title}
      </h3>
      {children}
    </section>
  );
}

function formatSeconds(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

export const Route = createFileRoute("/admin/summary")({
  component: SummaryPage,
});