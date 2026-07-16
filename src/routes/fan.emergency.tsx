import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { AlertTriangle, HeartPulse, PhoneCall, Shield, Siren } from "lucide-react";

export const Route = createFileRoute("/fan/emergency")({
  component: FanEmergency,
});

const options = [
  { icon: HeartPulse, title: "Medical", desc: "Request a medic to your seat", tone: "destructive" },
  { icon: Shield, title: "Security", desc: "Report a safety concern", tone: "primary" },
  { icon: Siren, title: "Evacuation Info", desc: "Nearest safe exit & instructions", tone: "accent" },
  { icon: AlertTriangle, title: "Lost Person", desc: "Report a lost child or friend", tone: "destructive" },
];

function FanEmergency() {
  return (
    <div>
      <PageHeader title="Emergency Help" description="One tap connects you to on-site response teams." />
      <div className="mb-6 grid gap-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <div className="text-xs uppercase tracking-widest text-destructive">Priority hotline</div>
          <div className="mt-1 text-2xl font-bold">Stadium Emergency · 24/7</div>
          <div className="text-sm text-muted-foreground">Avg. response time in your zone: 38 seconds</div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-destructive px-5 py-3 text-sm font-semibold text-destructive-foreground shadow-glow">
          <PhoneCall className="h-4 w-4" /> Call now
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((o) => (
          <button key={o.title} className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-primary/40">
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                o.tone === "destructive"
                  ? "bg-destructive/20 text-destructive"
                  : o.tone === "primary"
                    ? "bg-primary/20 text-primary"
                    : "bg-accent/20 text-accent"
              }`}
            >
              <o.icon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold">{o.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{o.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}