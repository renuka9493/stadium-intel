import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { MapPin, Navigation, Utensils, DoorOpen, Bath } from "lucide-react";

export const Route = createFileRoute("/fan/map")({
  component: FanMap,
});

const pois = [
  { x: 20, y: 30, icon: DoorOpen, label: "Gate B", tone: "primary" },
  { x: 74, y: 22, icon: Utensils, label: "Food Court", tone: "accent" },
  { x: 55, y: 55, icon: MapPin, label: "Your seat 214-B", tone: "primary" },
  { x: 30, y: 72, icon: Bath, label: "Restrooms", tone: "muted" },
  { x: 82, y: 68, icon: DoorOpen, label: "Exit E", tone: "accent" },
];

function FanMap() {
  return (
    <div>
      <PageHeader title="Interactive Stadium Map" description="Tap a point to see live wait times and directions.">
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">
          <Navigation className="h-3.5 w-3.5" /> Guide me
        </button>
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, oklch(0.72 0.19 155 / 0.25), transparent 60%), oklch(0.18 0.03 250)",
            }}
          />
          <div className="absolute left-1/2 top-1/2 h-[45%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-accent/60 bg-accent/10">
            <div className="absolute left-1/2 top-0 h-full w-px bg-accent/40" />
            <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent/40" />
          </div>
          {[0.6, 0.75, 0.9].map((s, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-primary/20"
              style={{ width: `${s * 100}%`, height: `${s * 75}%` }}
            />
          ))}
          {pois.map((p) => (
            <button
              key={p.label}
              className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-full shadow-glow ${
                  p.tone === "accent"
                    ? "bg-gradient-accent"
                    : p.tone === "primary"
                      ? "bg-gradient-primary"
                      : "bg-secondary"
                }`}
              >
                <p.icon className="h-4 w-4 text-primary-foreground" />
              </span>
              <span className="mt-1 rounded-md bg-background/80 px-1.5 py-0.5 text-[10px] font-medium">{p.label}</span>
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {pois.map((p, i) => (
            <div key={p.label} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary">
                <p.icon className="h-4 w-4 text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{p.label}</div>
                <div className="text-xs text-muted-foreground">~{(i + 2)} min walk</div>
              </div>
              <button className="rounded-md border border-border/60 px-2 py-1 text-xs">Go</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}