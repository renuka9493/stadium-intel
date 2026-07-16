import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { LiveBadge } from "@/components/live-badge";
import {
  assignTeam,
  formatTime,
  priorityTone,
  setStatus,
  severityTone,
  statusLabel,
  statusTone,
  TEAMS,
  useIncidents,
  type Incident,
} from "@/lib/incidents-store";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  PlayCircle,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/incidents")({
  component: AdminIncidents,
});

function AdminIncidents() {
  const incidents = useIncidents();
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { active: 0, new: 0, resolved: 0 };
    for (const i of incidents) {
      if (i.status === "resolved") c.resolved++;
      else c.active++;
      if (i.status === "new") c.new++;
    }
    return c;
  }, [incidents]);

  return (
    <div>
      <PageHeader
        title="Incident Reports"
        description="Fan-submitted reports triaged by Stadium Brain AI in real time."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatChip label="Active" value={counts.active} tone="bg-chart-3/20 text-chart-3 ring-chart-3/40" />
        <StatChip label="Awaiting triage" value={counts.new} tone="bg-destructive/20 text-destructive ring-destructive/40" />
        <StatChip label="Resolved today" value={counts.resolved} tone="bg-accent/20 text-accent ring-accent/40" />
        <div className="ml-auto">
          <LiveBadge />
        </div>
      </div>

      {incidents.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
          No incidents reported. All clear.
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((i) => (
            <IncidentCard
              key={i.id}
              incident={i}
              open={openId === i.id}
              onToggle={() => setOpenId(openId === i.id ? null : i.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatChip({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`rounded-xl px-3 py-2 ring-1 ${tone}`}>
      <div className="text-[10px] uppercase tracking-widest opacity-80">{label}</div>
      <div className="text-lg font-bold tabular-nums leading-none mt-0.5">{value}</div>
    </div>
  );
}

function IncidentCard({
  incident,
  open,
  onToggle,
}: {
  incident: Incident;
  open: boolean;
  onToggle: () => void;
}) {
  const ai = incident.ai;
  const [teamPickerOpen, setTeamPickerOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-card">
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">{incident.id}</span>
            <span className="font-semibold">{incident.type}</span>
            {ai && !ai.analyzing && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${severityTone(ai.severity)}`}>
                {ai.severity}
              </span>
            )}
            {ai && !ai.analyzing && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${priorityTone(ai.priority)}`}>
                {ai.priority}
              </span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusTone(incident.status)}`}>
              {statusLabel(incident.status)}
            </span>
            {ai?.analyzing && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> AI triaging
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {incident.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatTime(incident.reportedAt)}
            </span>
            {incident.assignedTeam && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" /> {incident.assignedTeam}
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-border/60 p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-secondary/40 p-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Description
                </div>
                <p className="mt-1 text-sm">{incident.description}</p>
              </div>

              {ai && !ai.analyzing && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-primary">
                    Gemini AI triage
                  </div>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <MiniField label="Severity" value={ai.severity.toUpperCase()} />
                    <MiniField label="Priority" value={ai.priority.toUpperCase()} />
                    <MiniField
                      label="Estimated resolution"
                      value={`~${ai.estimatedResolutionMinutes} min`}
                    />
                    <MiniField
                      label="Suggested response"
                      value={ai.suggestedResponse}
                      wide
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Timeline
                </div>
                <ol className="mt-2 space-y-3 border-l border-border/60 pl-4">
                  {incident.timeline.map((entry, idx) => (
                    <li key={idx} className="relative">
                      <span className="absolute -left-[21px] top-1 grid h-3 w-3 place-items-center rounded-full bg-primary shadow-glow ring-2 ring-background" />
                      <div className="flex flex-wrap items-baseline gap-2 text-sm">
                        <span className="font-medium">{entry.label}</span>
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {formatTime(entry.at)}
                        </span>
                      </div>
                      {entry.detail && (
                        <div className="text-xs text-muted-foreground">{entry.detail}</div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-border/60 bg-secondary/40 p-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Assign team
                </div>
                <button
                  onClick={() => setTeamPickerOpen((v) => !v)}
                  className="mt-2 inline-flex w-full items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                >
                  <span>{incident.assignedTeam ?? "Select team"}</span>
                  <ChevronDown className={`h-4 w-4 transition ${teamPickerOpen ? "rotate-180" : ""}`} />
                </button>
                {teamPickerOpen && (
                  <div className="mt-2 space-y-1">
                    {TEAMS.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          assignTeam(incident.id, t);
                          setTeamPickerOpen(false);
                        }}
                        className={`block w-full rounded-md px-3 py-1.5 text-left text-xs transition ${
                          incident.assignedTeam === t
                            ? "bg-primary/20 text-primary"
                            : "bg-background hover:bg-secondary"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                disabled={incident.status === "in_progress" || incident.status === "resolved"}
                onClick={() => setStatus(incident.id, "in_progress")}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-chart-3/40 bg-chart-3/15 px-3 py-2 text-xs font-semibold text-chart-3 disabled:opacity-50"
              >
                <PlayCircle className="h-3.5 w-3.5" /> Mark in progress
              </button>
              <button
                disabled={incident.status === "resolved"}
                onClick={() => setStatus(incident.id, "resolved")}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniField({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm text-foreground">{value}</div>
    </div>
  );
}
