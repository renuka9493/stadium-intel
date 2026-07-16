import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { Ambulance, PhoneCall, Radio, Shield, Siren } from "lucide-react";

export const Route = createFileRoute("/admin/emergency")({
  component: AdminEmergency,
});

const teams = [
  { name: "Medical Alpha", status: "En route · Sec 118", tone: "destructive", icon: Ambulance },
  { name: "Security Bravo", status: "Standby · Gate C", tone: "primary", icon: Shield },
  { name: "Fire Charlie", status: "Ready · Bay 2", tone: "accent", icon: Siren },
  { name: "Comms Delta", status: "Broadcasting", tone: "accent", icon: Radio },
];

function AdminEmergency() {
  return (
    <div>
      <PageHeader title="Emergency Center" description="Coordinate all response teams from one console." />
      <div className="mb-6 grid gap-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <div className="text-xs uppercase tracking-widest text-destructive">Stadium-wide broadcast</div>
          <div className="mt-1 text-2xl font-bold">Announce to 82,340 fans</div>
          <div className="text-sm text-muted-foreground">Multi-language · PA · Mobile push · Screens</div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-destructive px-5 py-3 text-sm font-semibold text-destructive-foreground shadow-glow">
          <PhoneCall className="h-4 w-4" /> Trigger broadcast
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {teams.map((t) => (
          <div key={t.name} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                t.tone === "destructive"
                  ? "bg-destructive/20 text-destructive"
                  : t.tone === "primary"
                    ? "bg-primary/20 text-primary"
                    : "bg-accent/20 text-accent"
              }`}
            >
              <t.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{t.name}</div>
              <div className="truncate text-xs text-muted-foreground">{t.status}</div>
            </div>
            <button className="rounded-lg border border-border/60 bg-secondary px-3 py-1.5 text-xs">Dispatch</button>
          </div>
        ))}
      </div>
    </div>
  );
}