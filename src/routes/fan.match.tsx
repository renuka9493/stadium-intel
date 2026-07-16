import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";

export const Route = createFileRoute("/fan/match")({
  component: FanMatch,
});

const events = [
  { min: 12, text: "Goal · Argentina" },
  { min: 34, text: "Yellow card · France" },
  { min: 45, text: "Half time" },
  { min: 61, text: "Substitution · Argentina" },
  { min: 78, text: "Goal · France" },
];

function FanMatch() {
  return (
    <div>
      <PageHeader title="Match Information" description="Everything happening on the pitch, in real time." />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Group Stage · Match 32</div>
          <div className="mt-4 grid grid-cols-3 items-center gap-4">
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-primary text-2xl font-black text-primary-foreground shadow-glow">AR</div>
              <div className="mt-2 text-sm font-semibold">Argentina</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black tabular-nums text-gradient">2 · 1</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-accent">78'</div>
            </div>
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-accent text-2xl font-black text-primary-foreground shadow-glow">FR</div>
              <div className="mt-2 text-sm font-semibold">France</div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
            {[["Possession", "58% / 42%"], ["Shots", "14 / 9"], ["Corners", "6 / 4"]].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border/60 bg-secondary/50 p-3">
                <div className="text-xs text-muted-foreground">{k}</div>
                <div className="mt-1 font-semibold">{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Timeline</div>
          <ol className="space-y-3">
            {events.map((e, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 grid h-8 w-10 shrink-0 place-items-center rounded-md bg-secondary text-xs font-semibold tabular-nums">
                  {e.min}'
                </span>
                <div className="text-sm">{e.text}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}