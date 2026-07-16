import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";

export const Route = createFileRoute("/admin/heatmap")({
  component: AdminHeatmap,
});

const COLS = 24;
const ROWS = 14;

function heat(x: number, y: number) {
  const cx = COLS / 2;
  const cy = ROWS / 2;
  const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const noise = Math.sin(x * 0.7) * Math.cos(y * 0.9) * 0.3;
  const v = Math.max(0, Math.min(1, 1 - d / 10 + noise));
  return v;
}

function AdminHeatmap() {
  const cells = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const v = heat(x, y);
      cells.push(
        <div
          key={`${x}-${y}`}
          className="rounded-sm"
          style={{
            aspectRatio: "1",
            background: `oklch(${0.3 + v * 0.4} ${0.05 + v * 0.2} ${v > 0.6 ? 25 : v > 0.35 ? 90 : 155} / ${0.3 + v * 0.7})`,
          }}
        />,
      );
    }
  }
  return (
    <div>
      <PageHeader title="Stadium Heatmap" description="Aggregated density over the last 15 minutes." />
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {cells}
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span>Low</span>
          <div className="h-2 flex-1 rounded-full" style={{ background: "linear-gradient(90deg, oklch(0.72 0.19 155), oklch(0.82 0.14 90), oklch(0.65 0.24 25))" }} />
          <span>Critical</span>
        </div>
      </div>
    </div>
  );
}