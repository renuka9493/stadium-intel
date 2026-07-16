import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { Accessibility, Ear, Eye, HandHelping } from "lucide-react";

export const Route = createFileRoute("/fan/accessibility")({
  component: FanAccessibility,
});

const services = [
  { icon: Accessibility, title: "Wheelchair assistance", desc: "Request a chair or attendant to any location.", cta: "Request now" },
  { icon: Ear, title: "Hearing loop", desc: "Broadcast commentary directly to your hearing aid.", cta: "Enable" },
  { icon: Eye, title: "Audio descriptive commentary", desc: "Live narration for visually impaired fans.", cta: "Turn on" },
  { icon: HandHelping, title: "Sensory quiet room", desc: "Book a low-stimulation space near your section.", cta: "Book slot" },
];

function FanAccessibility() {
  return (
    <div>
      <PageHeader title="Accessibility" description="Services available on-demand across the stadium." />
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <s.icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            <button className="mt-4 rounded-lg bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow">
              {s.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}