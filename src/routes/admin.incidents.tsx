import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";

export const Route = createFileRoute("/admin/incidents")({
  component: AdminIncidents,
});

const incidents = [
  { id: "INC-2041", type: "Medical", loc: "Sec 118 · Row F", status: "In progress", time: "18:35", sev: "high" },
  { id: "INC-2040", type: "Overcrowding", loc: "Food Court", status: "Mitigating", time: "18:31", sev: "high" },
  { id: "INC-2039", type: "Lost child", loc: "Gate D", status: "Resolved", time: "18:12", sev: "medium" },
  { id: "INC-2038", type: "Spill", loc: "Concourse 2", status: "Resolved", time: "18:04", sev: "low" },
  { id: "INC-2037", type: "Ticket dispute", loc: "Gate B", status: "Resolved", time: "17:58", sev: "low" },
];

function AdminIncidents() {
  return (
    <div>
      <PageHeader title="Incident Reports" description="Every event logged and traced to resolution." />
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="hidden px-4 py-3 text-left sm:table-cell">Status</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Severity</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((i) => (
              <tr key={i.id} className="border-t border-border/60">
                <td className="px-4 py-3 font-mono text-xs">{i.id}</td>
                <td className="px-4 py-3 font-medium">{i.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.loc}</td>
                <td className="hidden px-4 py-3 sm:table-cell">{i.status}</td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{i.time}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                      i.sev === "high"
                        ? "bg-destructive/20 text-destructive"
                        : i.sev === "medium"
                          ? "bg-chart-3/20 text-chart-3"
                          : "bg-accent/20 text-accent"
                    }`}
                  >
                    {i.sev}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}