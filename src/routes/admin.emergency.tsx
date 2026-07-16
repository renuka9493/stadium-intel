import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { Ambulance, PhoneCall, Radio, Shield, Siren, Megaphone, Zap } from "lucide-react";
import { Panel, LiveTag, StatMini } from "@/components/ops";
import { useLiveStadium } from "@/lib/live-stadium";

export const Route = createFileRoute("/admin/emergency")({
  component: AdminEmergency,
});

type Tone = "critical" | "primary" | "success" | "warning";
const teams: { name: string; role: string; status: string; loc: string; eta: string; tone: Tone; icon: typeof Ambulance }[] = [
  { name: "Medical Alpha", role: "Medical", status: "En route", loc: "Sec 118", eta: "1m 47s", tone: "critical", icon: Ambulance },
  { name: "Medical Bravo", role: "Medical", status: "Ready", loc: "Bay 1", eta: "—", tone: "success", icon: Ambulance },
  { name: "Security Charlie", role: "Security", status: "Standby", loc: "Gate C", eta: "—", tone: "primary", icon: Shield },
  { name: "Security Delta", role: "Security", status: "Patrol", loc: "Concourse 3", eta: "—", tone: "primary", icon: Shield },
  { name: "Fire Echo", role: "Fire", status: "Ready", loc: "Bay 2", eta: "—", tone: "success", icon: Siren },
  { name: "Comms Foxtrot", role: "Comms", status: "Broadcasting", loc: "Control", eta: "live", tone: "warning", icon: Radio },
];

const channels = [
  { id: "PA", label: "Public Address", state: "Ready", reach: "82,340 fans" },
  { id: "APP", label: "Mobile Push", state: "Ready", reach: "68,912 devices" },
  { id: "SCR", label: "Video Boards", state: "Ready", reach: "6 boards" },
  { id: "SMS", label: "Staff SMS", state: "Ready", reach: "1,240 staff" },
];

function AdminEmergency() {
  const live = useLiveStadium();
  return (
    <div>
      <PageHeader title="Emergency Center" description="Response coordination · 6 teams · 4 channels">
        <LiveTag />
      </PageHeader>

      <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatMini label="Active dispatches" value={live.medicalAlerts} tone={live.medicalAlerts > 0 ? "warning" : "success"} hint="last 5m" />
        <StatMini label="Avg response" value="1m 47s" hint="target 3m" tone="success" />
        <StatMini label="Teams available" value="4 / 6" hint="66%" />
        <StatMini label="Channels ready" value="4 / 4" tone="success" />
      </div>

      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <Panel title="Response Teams" subtitle="Status · location · ETA" right={<LiveTag />}>
          <div className="divide-y divide-border">
            {teams.map((t) => {
              const tclr =
                t.tone === "critical"
                  ? "text-critical bg-critical/12 ring-critical/30"
                  : t.tone === "warning"
                    ? "text-warning bg-warning/12 ring-warning/30"
                    : t.tone === "primary"
                      ? "text-primary bg-primary/12 ring-primary/30"
                      : "text-success bg-success/12 ring-success/30";
              return (
                <div key={t.name} className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-2 py-1.5 text-[11.5px]">
                  <span className={`grid h-6 w-6 place-items-center rounded-md ring-1 ${tclr}`}>
                    <t.icon className="h-3 w-3" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{t.name}</div>
                    <div className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{t.role}</div>
                  </div>
                  <span className={`hidden rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ring-1 sm:inline ${tclr}`}>
                    {t.status}
                  </span>
                  <div className="hidden text-right text-[10.5px] text-muted-foreground md:block">
                    <div>{t.loc}</div>
                    <div className="tabular-nums">ETA {t.eta}</div>
                  </div>
                  <button className="rounded-[6px] border border-border bg-background px-2 py-1 text-[10px] font-semibold hover:text-primary">
                    Dispatch
                  </button>
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-2">
          <Panel title="Stadium Broadcast" subtitle="Multi-channel emergency PA">
            <div className="grid grid-cols-2 gap-1.5">
              {channels.map((c) => (
                <div key={c.id} className="rounded-[6px] border border-border bg-background px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium">{c.label}</span>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-success">{c.state}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground tabular-nums">{c.reach}</div>
                </div>
              ))}
            </div>
            <button className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-[6px] bg-critical px-3 py-2 text-[11px] font-semibold text-white hover:brightness-110">
              <Megaphone className="h-3.5 w-3.5" /> Trigger broadcast
            </button>
          </Panel>

          <Panel title="Quick Actions">
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { l: "Lockdown Gate C", i: Shield, t: "critical" },
                { l: "Evacuate Sec 118", i: Zap, t: "critical" },
                { l: "Dial 112 Ops", i: PhoneCall, t: "warning" },
                { l: "Alert Fire Bay", i: Siren, t: "warning" },
              ].map((a) => (
                <button key={a.l} className="inline-flex items-center gap-1.5 rounded-[6px] border border-border bg-background px-2 py-1.5 text-[10.5px] font-medium hover:text-foreground">
                  <a.i className={`h-3 w-3 ${a.t === "critical" ? "text-critical" : "text-warning"}`} />
                  <span className="truncate">{a.l}</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}