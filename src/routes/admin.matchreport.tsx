import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Printer,
  Trophy,
  Users,
  Gauge,
  Timer,
  Siren,
  HeartPulse,
  Shield,
  Brain,
  TrendingUp,
  BookOpen,
  Target,
  ClipboardList,
  FileText,
} from "lucide-react";
import {
  generateMatchReport,
  type MatchReport,
} from "@/lib/match-report.functions";

function MatchReportPage() {
  const generate = useServerFn(generateMatchReport);
  const [report, setReport] = useState<MatchReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const result = await generate();
      setReport(result as MatchReport);
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate match report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-3 print:max-w-none print:p-0">
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-page { background: white !important; color: #0b1220 !important; border: none !important; box-shadow: none !important; }
          .print-page * { color: #0b1220 !important; border-color: #d5dbe6 !important; background: transparent !important; }
          .print-page h1, .print-page h2, .print-page h3 { color: #0b1220 !important; }
          .print-page .print-accent { color: #0f766e !important; }
          .print-page .print-break { page-break-inside: avoid; }
        }
      `}</style>

      <header className="no-print flex flex-wrap items-end justify-between gap-3 rounded-xl border border-border/60 bg-card/60 p-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-secondary/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            <ClipboardList className="h-3 w-3 text-accent" />
            AI Match Summary
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Post-Match Operations Report
          </h1>
          <p className="text-xs text-muted-foreground">
            Comprehensive AI-compiled brief for stadium management and FIFA operations.
          </p>
        </div>

        <div className="flex gap-2">
          {report && (
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs font-medium hover:bg-secondary/60"
            >
              <Printer className="h-3.5 w-3.5" /> Export PDF
            </button>
          )}
          <button
            onClick={run}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {loading ? "Compiling report…" : "Generate Match Report"}
          </button>
        </div>
      </header>

      {error && (
        <div className="no-print rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
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
    <div className="no-print rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-secondary/40">
        <FileText className="h-4 w-4 text-accent" />
      </div>
      <h3 className="mt-3 text-sm font-semibold">No report generated yet</h3>
      <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
        Click <span className="text-foreground">Generate Match Report</span> to compile a full
        post-match operations brief from live telemetry.
      </p>
    </div>
  );
}

function LoadingState() {
  const rows = [
    "Aggregating turnstile & CCTV telemetry",
    "Analyzing incident & medical logs",
    "Reviewing AI intervention outcomes",
    "Compiling recommendations",
  ];
  return (
    <div className="no-print space-y-3 rounded-xl border border-border/60 bg-card/40 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
        Compiling match report…
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r} className="flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary/40">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-primary/60" />
            </div>
            <span className="w-56 text-[11px] text-muted-foreground">{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Report({ report }: { report: MatchReport }) {
  return (
    <article className="print-page space-y-5 rounded-xl border border-border/60 bg-card/60 p-6">
      {/* Report header */}
      <div className="print-break border-b border-border/60 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="print-accent flex items-center gap-2 text-[10px] uppercase tracking-widest text-accent">
              <Trophy className="h-3 w-3" /> Post-Match Operations Report
            </div>
            <h2 className="mt-1 text-2xl font-semibold">{report.matchInfo.title}</h2>
            <div className="mt-1 text-xs text-muted-foreground">
              {report.matchInfo.competition} · {report.matchInfo.venue} · {report.matchInfo.date} · Kickoff {report.matchInfo.kickoff}
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/80">
              {report.headline}
            </p>
          </div>
          <div className="shrink-0 rounded-md border border-border/60 bg-secondary/40 px-3 py-2 text-right">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Overall grade</div>
            <div className="text-2xl font-semibold">{report.overallGrade}</div>
            <div className="text-[10px] text-muted-foreground">Efficiency {report.efficiencyScore}/100</div>
          </div>
        </div>
      </div>

      {/* Match info + attendance grid */}
      <div className="print-break grid grid-cols-1 gap-3 md:grid-cols-4">
        <InfoTile label="Final Score" value={report.matchInfo.finalScore} />
        <InfoTile label="Weather" value={report.matchInfo.weather} />
        <InfoTile label="Venue" value={report.matchInfo.venue} />
        <InfoTile label="Date" value={report.matchInfo.date} />
      </div>

      <div className="print-break grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard icon={Users} label="Attendance">
          <div className="text-xl font-semibold">{report.attendance.total}</div>
          <div className="text-[11px] text-muted-foreground">
            {report.attendance.capacityPct}% of {report.attendance.capacity}
          </div>
          <p className="mt-1.5 text-xs text-foreground/70">{report.attendance.note}</p>
        </MetricCard>

        <MetricCard icon={Gauge} label="Peak Crowd Density">
          <div className="text-xl font-semibold">{report.peakCrowdDensity.value}</div>
          <div className="text-[11px] text-muted-foreground">
            {report.peakCrowdDensity.time} · {report.peakCrowdDensity.zone}
          </div>
          <p className="mt-1.5 text-xs text-foreground/70">{report.peakCrowdDensity.note}</p>
        </MetricCard>

        <MetricCard icon={Timer} label="Average Queue Times">
          <div className="grid grid-cols-3 gap-2 text-center">
            <QueueStat label="Gates" value={report.avgQueueTimes.gates} />
            <QueueStat label="Food" value={report.avgQueueTimes.food} />
            <QueueStat label="Parking" value={report.avgQueueTimes.parking} />
          </div>
          <p className="mt-1.5 text-xs text-foreground/70">{report.avgQueueTimes.note}</p>
        </MetricCard>
      </div>

      {/* Emergency incidents */}
      <Section icon={Siren} title="Emergency Incidents">
        {report.emergencyIncidents.length === 0 ? (
          <p className="text-xs text-muted-foreground">No emergency incidents recorded.</p>
        ) : (
          <div className="overflow-hidden rounded-md border border-border/60">
            <table className="w-full text-xs">
              <thead className="bg-secondary/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Location</th>
                  <th className="px-3 py-2 text-left">Severity</th>
                  <th className="px-3 py-2 text-left">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {report.emergencyIncidents.map((i) => (
                  <tr key={i.id}>
                    <td className="px-3 py-2 font-mono text-[11px]">{i.id}</td>
                    <td className="px-3 py-2">{i.time}</td>
                    <td className="px-3 py-2">{i.type}</td>
                    <td className="px-3 py-2">{i.location}</td>
                    <td className="px-3 py-2">{i.severity}</td>
                    <td className="px-3 py-2 text-muted-foreground">{i.resolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Medical response */}
      <Section icon={HeartPulse} title="Medical Response Performance">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatBox label="Avg response" value={formatSeconds(report.medicalResponse.avgResponseSeconds)} />
          <StatBox label="Incidents handled" value={String(report.medicalResponse.incidentsHandled)} />
          <StatBox label="Success rate" value={report.medicalResponse.successRate} />
          <StatBox label="Grade" value={report.medicalResponse.grade} />
        </div>
        <p className="mt-2 text-xs text-foreground/70">{report.medicalResponse.note}</p>
      </Section>

      {/* Security events */}
      <Section icon={Shield} title="Security Events">
        {report.securityEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground">No security events recorded.</p>
        ) : (
          <ul className="divide-y divide-border/50 rounded-md border border-border/60">
            {report.securityEvents.map((s, idx) => (
              <li key={idx} className="flex flex-wrap items-center gap-3 px-3 py-2 text-xs">
                <span className="rounded bg-secondary/40 px-1.5 py-0.5 font-mono text-[10px]">{s.time}</span>
                <span className="font-medium">{s.type}</span>
                <span className="text-muted-foreground">{s.location}</span>
                <span className="ml-auto text-muted-foreground">{s.action}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* AI recommendations issued */}
      <Section icon={Brain} title="AI Recommendations Issued">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {report.aiRecommendationsIssued.map((r, idx) => (
            <div key={idx} className="rounded-md border border-border/60 bg-secondary/20 p-3">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>{r.time}</span>
                <span className={r.accepted ? "text-accent print-accent" : "text-destructive"}>
                  {r.accepted ? "Accepted" : "Declined"}
                </span>
              </div>
              <div className="mt-1 text-sm font-medium">{r.recommendation}</div>
              <div className="mt-1 text-xs text-muted-foreground">{r.outcome}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Operational improvements */}
      <Section icon={TrendingUp} title="Operational Improvements">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {report.operationalImprovements.map((o, idx) => (
            <div key={idx} className="rounded-md border border-border/60 bg-secondary/20 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{o.area}</div>
              <div className="mt-1 text-sm font-medium">{o.improvement}</div>
              <div className="print-accent mt-1 text-xs text-accent">{o.metric}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Lessons learned */}
      <Section icon={BookOpen} title="Lessons Learned">
        <ul className="space-y-1.5">
          {report.lessonsLearned.map((l, idx) => (
            <li key={idx} className="flex gap-2 rounded-md border border-border/60 bg-secondary/20 px-3 py-2 text-xs">
              <span className="text-accent print-accent">•</span>
              <span className="text-foreground/80">{l}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Future recommendations */}
      <Section icon={Target} title="Recommendations for Future Matches">
        <ol className="space-y-2">
          {report.futureRecommendations.map((r, idx) => (
            <li key={idx} className="rounded-md border border-border/60 bg-secondary/20 p-3">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary text-[10px] font-semibold text-primary-foreground">
                  {idx + 1}
                </span>
                <div>
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="mt-0.5 text-xs text-foreground/70">{r.detail}</div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <footer className="border-t border-border/60 pt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        Generated by Stadium Brain · Confidential — Internal Operations
      </footer>
    </article>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-secondary/20 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-secondary/20 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="h-3.5 w-3.5 text-accent print-accent" />
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function QueueStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border/40 bg-card/40 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-secondary/20 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="print-break space-y-2">
      <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-foreground/80">
        <Icon className="h-3.5 w-3.5 text-accent print-accent" /> {title}
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

export const Route = createFileRoute("/admin/matchreport")({
  component: MatchReportPage,
});