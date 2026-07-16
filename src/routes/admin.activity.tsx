import { createFileRoute } from "@tanstack/react-router";
import { Brain, DoorOpen, UtensilsCrossed, HeartPulse, CheckCircle2, Clock, TrendingDown, Ambulance } from "lucide-react";

type Entry = {
  time: string;
  icon: any;
  tone: "blue" | "green" | "red";
  title: string;
  detection: string;
  action: string;
  result: string;
  metric: string;
};

const entries: Entry[] = [
  {
    time: "18:42",
    icon: DoorOpen,
    tone: "blue",
    title: "Gate C Congestion Predicted",
    detection: "AI predicted Gate C congestion 6 minutes before threshold breach.",
    action: "Opened Gate D and redirected East entrance flow.",
    result: "Average wait reduced by 22%.",
    metric: "-22% wait",
  },
  {
    time: "18:51",
    icon: UtensilsCrossed,
    tone: "green",
    title: "Food Court East Demand Surge",
    detection: "AI predicted increased demand at Food Court East during half-time approach.",
    action: "Opened temporary kiosk and reassigned 4 staff members.",
    result: "Queue reduced by 14 minutes.",
    metric: "-14 min queue",
  },
  {
    time: "19:08",
    icon: HeartPulse,
    tone: "red",
    title: "Medical Incident Detected",
    detection: "Section B-14 sensors and CCTV flagged a spectator collapse.",
    action: "Nearest response team automatically dispatched.",
    result: "Estimated arrival: 1 minute 47 seconds.",
    metric: "1:47 ETA",
  },
];

const toneMap = {
  blue: {
    ring: "ring-sky-400/40",
    glow: "shadow-[0_0_40px_-10px_rgba(56,189,248,0.6)]",
    bg: "bg-sky-500/10",
    text: "text-sky-300",
    dot: "bg-sky-400",
  },
  green: {
    ring: "ring-emerald-400/40",
    glow: "shadow-[0_0_40px_-10px_rgba(52,211,153,0.6)]",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
  },
  red: {
    ring: "ring-rose-400/40",
    glow: "shadow-[0_0_40px_-10px_rgba(244,63,94,0.6)]",
    bg: "bg-rose-500/10",
    text: "text-rose-300",
    dot: "bg-rose-400",
  },
} as const;

function ActivityPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          <Brain className="h-3.5 w-3.5 text-sky-300" />
          AI Activity Log · Live
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Autonomous Decisions Timeline
        </h1>
        <p className="max-w-2xl text-sm text-white/60">
          Every prediction, action, and measured outcome captured by Stadium Brain in real time.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Brain} label="AI Interventions" value="3" hint="Last hour" />
        <StatCard icon={TrendingDown} label="Avg. Wait Reduction" value="18%" hint="Across gates & food" />
        <StatCard icon={Ambulance} label="Response Time" value="1m 47s" hint="Medical dispatch" />
      </section>

      <section className="relative pl-6 sm:pl-8">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-sky-400/60 via-emerald-400/40 to-rose-400/60 sm:left-3" />
        <div className="space-y-6">
          {entries.map((e, i) => (
            <TimelineCard key={i} entry={e} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-white/50">{label}</span>
        <Icon className="h-4 w-4 text-white/60" />
      </div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-white/50">{hint}</div>
    </div>
  );
}

function TimelineCard({ entry }: { entry: Entry }) {
  const tone = toneMap[entry.tone];
  const Icon = entry.icon;
  return (
    <div className="relative">
      <span
        className={`absolute -left-[22px] top-6 h-3 w-3 rounded-full ${tone.dot} ring-4 ring-slate-950 sm:-left-[26px]`}
      />
      <div
        className={`group rounded-2xl border border-white/10 bg-white/[0.04] p-5 ring-1 ${tone.ring} ${tone.glow} backdrop-blur-xl transition hover:bg-white/[0.06] sm:p-6`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone.bg} ${tone.text}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Clock className="h-3 w-3" />
                {entry.time}
              </div>
              <h3 className="text-lg font-semibold text-white">{entry.title}</h3>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${tone.bg} ${tone.text}`}>
            {entry.metric}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Detection" value={entry.detection} />
          <Field label="Action" value={entry.action} />
          <Field label="Result" value={entry.result} accent={tone.text} icon={CheckCircle2} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, accent, icon: Icon }: { label: string; value: string; accent?: string; icon?: any }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/40">
        {Icon && <Icon className={`h-3 w-3 ${accent ?? ""}`} />}
        {label}
      </div>
      <p className={`mt-2 text-sm leading-relaxed ${accent ?? "text-white/80"}`}>{value}</p>
    </div>
  );
}

export const Route = createFileRoute("/admin/activity")({
  component: ActivityPage,
});