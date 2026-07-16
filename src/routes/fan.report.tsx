import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/portal-shell";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, Send, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { analyzeIncident } from "@/lib/incident-ai.functions";
import {
  attachAiAnalysis,
  createIncident,
  INCIDENT_TYPES,
  markAiAnalysisFailed,
  type Incident,
} from "@/lib/incidents-store";

export const Route = createFileRoute("/fan/report")({
  head: () => ({
    meta: [
      { title: "Report Incident - Stadium Brain" },
      { name: "description", content: "Report a stadium incident. Stadium Brain AI triages it instantly to the right team." },
    ],
  }),
  component: FanReport,
});

function FanReport() {
  const analyze = useServerFn(analyzeIncident);
  const [type, setType] = useState<string>(INCIDENT_TYPES[0]);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Incident | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!location.trim() || !description.trim()) {
      setError("Please fill in location and description.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const incident = createIncident({
      type: type.trim(),
      location: location.trim(),
      description: description.trim(),
    });
    setSubmitted(incident);

    try {
      const analysis = await analyze({
        data: {
          type: incident.type,
          location: incident.location,
          description: incident.description,
        },
      });
      attachAiAnalysis(incident.id, analysis);
      setSubmitted({ ...incident, ai: { ...analysis, analyzing: false } });
    } catch (err) {
      console.error(err);
      markAiAnalysisFailed(incident.id);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(null);
    setLocation("");
    setDescription("");
    setType(INCIDENT_TYPES[0]);
    setError(null);
  };

  return (
    <div>
      <PageHeader
        title="Report Incident"
        description="Tell us what you see. Stadium Brain AI triages it to the right team in seconds."
      />

      {!submitted ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <form
            onSubmit={submit}
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-card"
          >
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                <ShieldAlert className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold">Anonymous incident report</div>
                <div className="text-xs text-muted-foreground">Routed to on-duty operations · &lt; 30s</div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Incident type
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {INCIDENT_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setType(t)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        type === t
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border/60 bg-secondary/60 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="loc"
                  className="text-[11px] uppercase tracking-widest text-muted-foreground"
                >
                  Location
                </label>
                <input
                  id="loc"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={120}
                  placeholder="e.g. Gate C · Concourse 2 · Section 214 Row F"
                  className="mt-2 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
                />
              </div>

              <div>
                <label
                  htmlFor="desc"
                  className="text-[11px] uppercase tracking-widest text-muted-foreground"
                >
                  Description
                </label>
                <textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  rows={5}
                  placeholder="What's happening? Include as much detail as you can."
                  className="mt-2 w-full resize-none rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
                />
                <div className="mt-1 text-right text-[10px] text-muted-foreground">
                  {description.length}/1000
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-destructive">
                <ShieldAlert className="h-4 w-4" /> Life-threatening emergency?
              </div>
              <p className="mt-2 text-sm text-foreground">
                Don't wait — use the red emergency button or dial the on-site hotline
                directly.
              </p>
              <Link
                to="/fan/emergency"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-destructive"
              >
                Open emergency page <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                What happens next
              </div>
              <ol className="mt-3 space-y-2 text-sm">
                <li>1. Report is sent to Stadium Brain.</li>
                <li>2. AI classifies severity, priority, and response.</li>
                <li>3. Operations dispatches the right team.</li>
                <li>4. You'll see a live incident number for follow-up.</li>
              </ol>
            </div>
          </aside>
        </div>
      ) : (
        <SubmittedPanel incident={submitted} onNew={reset} />
      )}
    </div>
  );
}

function SubmittedPanel({ incident, onNew }: { incident: Incident; onNew: () => void }) {
  const ai = incident.ai;
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/20 text-accent ring-1 ring-accent/40">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Report submitted
            </div>
            <div className="text-lg font-semibold">
              {incident.id} · {incident.type}
            </div>
          </div>
        </div>
        <button
          onClick={onNew}
          className="rounded-lg border border-border/60 bg-secondary px-3 py-1.5 text-xs"
        >
          Submit another
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-border/60 bg-secondary/40 p-4 text-sm">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Location</div>
        <div className="mt-0.5 font-medium">{incident.location}</div>
        <div className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">
          Description
        </div>
        <div className="mt-0.5 text-foreground/90">{incident.description}</div>
      </div>

      <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
          <ShieldAlert className="h-4 w-4" /> AI Triage
        </div>
        {!ai || ai.analyzing ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Analyzing your report with Gemini...
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Severity" value={ai.severity.toUpperCase()} />
            <Field label="Priority" value={ai.priority.toUpperCase()} />
            <Field
              label="Estimated resolution"
              value={`~${ai.estimatedResolutionMinutes} min`}
            />
            <Field label="Suggested response" value={ai.suggestedResponse} wide />
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Operations has been notified. You can track the incident number above with any staff
        member.
      </p>
    </div>
  );
}

function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
