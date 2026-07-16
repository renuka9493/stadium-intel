import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import {
  Ambulance,
  Armchair,
  Car,
  CheckCircle2,
  ChevronDown,
  DoorOpen,
  LogOut,
  Radio,
  Sparkles,
  Ticket,
  Train,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/fan/journey")({
  component: FanJourney,
});

type Status = "done" | "active" | "upcoming";

type Stage = {
  title: string;
  icon: LucideIcon;
  status: Status;
  time: string;
  detail: string;
  aiTip: string;
};

const stages: Stage[] = [
  {
    title: "Match Ticket",
    icon: Ticket,
    status: "done",
    time: "Verified · 14:02",
    detail: "Digital ticket loaded to wallet · Sec 214 · Row F · Seat 12",
    aiTip: "Ticket QR pre-cached for offline scan.",
  },
  {
    title: "Travel",
    icon: Train,
    status: "done",
    time: "Arrived · 15:48",
    detail: "Metro Line 3 → Al Bayt Station · 22 min from downtown",
    aiTip: "Return trains scheduled every 4 min post full-time.",
  },
  {
    title: "Parking",
    icon: Car,
    status: "active",
    time: "In progress",
    detail: "Lot B is 91% full — reroute suggested to Lot F (4 min walk)",
    aiTip: "Reserve a Lot F spot to save ~11 minutes of circling.",
  },
  {
    title: "Gate Entry",
    icon: DoorOpen,
    status: "upcoming",
    time: "ETA 16:22",
    detail: "Gate C at 94% capacity · Gate D is 3 min away with 2 min wait",
    aiTip: "Head to Gate D — AI opened extra lanes 4 minutes ago.",
  },
  {
    title: "Seat Navigation",
    icon: Armchair,
    status: "upcoming",
    time: "ETA 16:29",
    detail: "Upper concourse · Escalator B · turn right at Sec 210",
    aiTip: "Accessibility lift available if needed (Elevator 2).",
  },
  {
    title: "Food Recommendations",
    icon: Utensils,
    status: "upcoming",
    time: "Best window · 16:35",
    detail: "Falafel Point (3 min wait) vs. Food Court West (12 min)",
    aiTip: "Order ahead now to skip the halftime rush.",
  },
  {
    title: "Emergency Assistance",
    icon: Ambulance,
    status: "upcoming",
    time: "Standing by",
    detail: "Nearest medical post: Sec 212 · One-tap SOS enabled",
    aiTip: "Your location is shared automatically if you trigger SOS.",
  },
  {
    title: "Match Updates",
    icon: Radio,
    status: "upcoming",
    time: "Kickoff · 18:00",
    detail: "Live score, VAR alerts, and lineup delivered on your lock screen",
    aiTip: "Instant replays pushed 8s after each key event.",
  },
  {
    title: "Exit Guidance",
    icon: LogOut,
    status: "upcoming",
    time: "After full-time",
    detail: "AI will pick the least-congested exit and route to Lot F",
    aiTip: "Stay 6 min after the whistle to bypass 70% of the crowd.",
  },
];

const statusStyles: Record<Status, { ring: string; bg: string; text: string; label: string }> = {
  done: {
    ring: "ring-accent/40",
    bg: "bg-accent/15",
    text: "text-accent",
    label: "Completed",
  },
  active: {
    ring: "ring-primary/50",
    bg: "bg-primary/15",
    text: "text-primary",
    label: "In progress",
  },
  upcoming: {
    ring: "ring-border/60",
    bg: "bg-secondary",
    text: "text-muted-foreground",
    label: "Upcoming",
  },
};

function FanJourney() {
  const completed = stages.filter((s) => s.status === "done").length;
  const progress = Math.round((completed / stages.length) * 100);

  return (
    <div>
      <PageHeader
        title="Your Fan Journey"
        description="A guided, AI-orchestrated path from ticket to exit — every step optimized in real time."
      />

      <div className="mb-8 rounded-2xl border border-primary/30 bg-card p-5 shadow-card ring-1 ring-primary/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-bold">Journey Progress</div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {completed} of {stages.length} stages complete
              </div>
            </div>
          </div>
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
            Live
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-primary shadow-glow"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent sm:left-8" />

        <ol className="space-y-4">
          {stages.map((stage, i) => {
            const styles = statusStyles[stage.status];
            const Icon = stage.icon;
            const isLast = i === stages.length - 1;
            return (
              <li key={stage.title} className="relative">
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="relative z-10 flex flex-col items-center">
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-xl ${styles.bg} ${styles.text} ring-1 ${styles.ring} sm:h-16 sm:w-16`}
                    >
                      {stage.status === "done" ? (
                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : (
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                      {stage.status === "active" && (
                        <span className="absolute -inset-1 -z-10 rounded-2xl bg-primary/30 blur-md" />
                      )}
                    </span>
                    {!isLast && (
                      <ChevronDown
                        className={`mt-2 h-4 w-4 ${
                          stage.status === "done" ? "text-accent" : "text-muted-foreground/50"
                        }`}
                      />
                    )}
                  </div>

                  <div
                    className={`flex-1 rounded-2xl border p-4 shadow-card sm:p-5 ${
                      stage.status === "active"
                        ? "border-primary/40 bg-card ring-1 ring-primary/20"
                        : "border-border/60 bg-card"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Step {i + 1}
                        </span>
                        <h3 className="text-base font-bold text-foreground sm:text-lg">
                          {stage.title}
                        </h3>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${styles.bg} ${styles.text}`}
                      >
                        {styles.label}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{stage.time}</div>
                    <p className="mt-3 text-sm text-foreground/90">{stage.detail}</p>
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="text-foreground/80">{stage.aiTip}</span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}