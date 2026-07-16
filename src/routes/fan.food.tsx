import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { LiveBadge } from "@/components/live-badge";
import { useLiveStadium } from "@/lib/live-stadium";
import { Clock, MapPin, Star, Utensils } from "lucide-react";

export const Route = createFileRoute("/fan/food")({
  component: FanFood,
});

const baseStands = [
  { name: "Al Baik Express", cuisine: "Broasted Chicken", waitBias: 0.4, rating: 4.8, zone: "Concourse 2" },
  { name: "Machboos Corner", cuisine: "Qatari Rice", waitBias: 0.9, rating: 4.6, zone: "Concourse 3" },
  { name: "Pitch Perfect Burgers", cuisine: "American", waitBias: 1.2, rating: 4.4, zone: "North" },
  { name: "Green Falcon Vegan", cuisine: "Plant-based", waitBias: 0.3, rating: 4.9, zone: "South" },
  { name: "Tea & Karak", cuisine: "Beverages", waitBias: 0.2, rating: 4.7, zone: "Everywhere" },
  { name: "Pizza 90'", cuisine: "Italian", waitBias: 1.5, rating: 4.3, zone: "East" },
];

function FanFood() {
  const { foodQueue } = useLiveStadium();
  const stands = baseStands.map((s) => ({
    ...s,
    wait: Math.max(1, Math.round(foodQueue * s.waitBias)),
  }));
  return (
    <div>
      <PageHeader title="Food Finder" description="Live wait times, ratings and distance to every stand.">
        <LiveBadge />
        <button className="rounded-lg border border-border/60 bg-secondary px-3 py-1.5 text-xs">Filter</button>
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stands.map((s) => (
          <div key={s.name} className="rounded-2xl border border-border/60 bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-accent/40">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-gradient-accent">
              <Utensils className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold">{s.name}</h3>
                <p className="text-xs text-muted-foreground">{s.cuisine}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                <Star className="h-3 w-3 fill-current" /> {s.rating}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 tabular-nums transition-all duration-500"><Clock className="h-3.5 w-3.5" /> {s.wait} min wait</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {s.zone}</span>
            </div>
            <button className="mt-4 w-full rounded-lg bg-gradient-primary py-2 text-sm font-semibold text-primary-foreground shadow-glow">
              Order & pick up
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}