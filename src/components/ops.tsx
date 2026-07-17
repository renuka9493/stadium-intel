import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

// ─────────────────────────────────────────────────────────────
// Shared Ops-console primitives — dense, professional, subtle.
// Every screen composes from these to guarantee visual parity.
// ─────────────────────────────────────────────────────────────

export type Tone = "neutral" | "success" | "warning" | "critical" | "primary";

const toneRing: Record<Tone, string> = {
  neutral: "ring-border text-muted-foreground",
  success: "ring-success/40 text-success",
  warning: "ring-warning/40 text-warning",
  critical: "ring-critical/40 text-critical",
  primary: "ring-primary/40 text-primary",
};

const toneBg: Record<Tone, string> = {
  neutral: "bg-background",
  success: "bg-success/10",
  warning: "bg-warning/10",
  critical: "bg-critical/10",
  primary: "bg-primary/10",
};

const toneText: Record<Tone, string> = {
  neutral: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  critical: "text-critical",
  primary: "text-primary",
};

const toneDot: Record<Tone, string> = {
  neutral: "bg-muted-foreground",
  success: "bg-success",
  warning: "bg-warning",
  critical: "bg-critical",
  primary: "bg-primary",
};

export function tonePalette(t: Tone) {
  return { ring: toneRing[t], bg: toneBg[t], text: toneText[t], dot: toneDot[t] };
}

// Panel: standard bordered surface with a compact header
export function Panel({
  title,
  subtitle,
  right,
  children,
  className = "",
  pad = true,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <section className={`rounded-[10px] border border-border bg-card shadow-card ${className}`}>
      {(title || right) && (
        <header className="flex min-h-7 items-center justify-between gap-2 border-b border-border px-2.5 py-1">
          <div className="min-w-0">
            {title && (
              <h2 className="truncate text-[11.5px] font-semibold tracking-tight">{title}</h2>
            )}
            {subtitle && (
              <p className="truncate text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {right ? <div className="flex shrink-0 items-center gap-1.5">{right}</div> : null}
        </header>
      )}
      <div className={pad ? "p-2.5" : ""}>{children}</div>
    </section>
  );
}

// Animated counter (subtle 400ms ease)
function useAnimatedNumber(value: number) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    let raf = 0;
    const start = display;
    const delta = value - start;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 400);
      setDisplay(start + delta * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return display;
}

export function Kpi({
  icon: Icon,
  label,
  value,
  suffix,
  delta,
  tone = "neutral",
  format = "number",
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  delta?: number;
  tone?: Tone;
  format?: "number" | "decimal";
}) {
  const animated = useAnimatedNumber(value);
  const trendUp = (delta ?? 0) > 0;
  const trendTone = delta == null ? "" : trendUp ? "text-warning" : "text-success";
  return (
    <div className="rounded-[10px] border border-border bg-card p-2 shadow-card sm:p-2.5">
      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className={`grid h-5 w-5 shrink-0 place-items-center rounded-md ring-1 ${toneBg[tone]} ${toneRing[tone]}`}>
            <Icon className="h-3 w-3" strokeWidth={2} />
          </div>
          <span className="truncate text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </span>
        </div>
        {delta != null && (
          <span className={`inline-flex shrink-0 items-center gap-0.5 text-[9.5px] font-medium tabular-nums ${trendTone}`}>
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-[17px] font-semibold tabular-nums tracking-tight leading-none sm:text-[19px]">
          {format === "decimal"
            ? animated.toFixed(1)
            : Math.round(animated).toLocaleString()}
        </span>
        {suffix && <span className="truncate text-[10.5px] text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

export function LiveTag({ label = "Live" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-background px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-success ring-1 ring-success/30">
      <span className="h-1 w-1 rounded-full bg-success pulse-dot" />
      {label}
    </span>
  );
}

export function Chip({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ring-1 ${toneBg[tone]} ${toneText[tone]} ${toneRing[tone].replace("text-muted-foreground", "").replace(/text-[a-z-]+/g, "")}`}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: "muted" | "accent" | "success" | "warning" | "critical";
}) {
  const toneCls =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "critical"
          ? "text-critical"
          : tone === "accent"
            ? "text-primary"
            : "text-foreground/90";
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className={`text-[11.5px] leading-snug ${toneCls}`}>{value}</div>
    </div>
  );
}

export function StatMini({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className={`rounded-[8px] border border-border bg-background px-2.5 py-2 ${toneBg[tone]}`}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>{label}</span>
        {hint && <span className="tabular-nums">{hint}</span>}
      </div>
      <div className={`mt-0.5 text-[16px] font-semibold tabular-nums leading-tight ${toneText[tone]}`}>
        {value}
      </div>
    </div>
  );
}

export function MiniBar({
  value,
  tone = "primary",
}: {
  value: number;
  tone?: Tone;
}) {
  const color =
    tone === "critical"
      ? "#EF4444"
      : tone === "warning"
        ? "#F59E0B"
        : tone === "success"
          ? "#22C55E"
          : "#2563EB";
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
      />
    </div>
  );
}

// Chart theme tokens for recharts (keeps all charts identical)
export const chartTheme = {
  grid: "#24324A",
  axis: "#94A3B8",
  primary: "#2563EB",
  success: "#22C55E",
  warning: "#F59E0B",
  critical: "#EF4444",
  info: "#38BDF8",
  tooltipStyle: {
    background: "#131C2E",
    border: "1px solid #24324A",
    borderRadius: 6,
    fontSize: 11,
    padding: "4px 8px",
  } as const,
  tooltipLabelStyle: { color: "#94A3B8" } as const,
};

// Priority chip used across recommendation surfaces
export function PriorityChip({ p }: { p: "High" | "Medium" | "Low" | "high" | "medium" | "low" }) {
  const norm = p.toString().toLowerCase() as "high" | "medium" | "low";
  const tone: Tone = norm === "high" ? "critical" : norm === "medium" ? "warning" : "success";
  const styles = {
    critical: "bg-critical/12 text-critical ring-critical/30",
    warning: "bg-warning/12 text-warning ring-warning/30",
    success: "bg-success/12 text-success ring-success/30",
    neutral: "",
    primary: "",
  }[tone];
  return (
    <span className={`rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ring-1 ${styles}`}>
      {norm}
    </span>
  );
}

// Screen-level toolbar: replaces the marketing PageHeader.
// Very compact — title, subtle description, right-aligned meta/actions.
export function OpsToolbar({
  title,
  meta,
  right,
}: {
  title: string;
  meta?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <h1 className="truncate text-[13px] font-semibold tracking-tight">{title}</h1>
        {meta ? (
          <div className="hidden items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground sm:flex">
            {meta}
          </div>
        ) : null}
      </div>
      {right ? <div className="flex shrink-0 flex-wrap items-center gap-1.5">{right}</div> : null}
    </div>
  );
}

export function ToolbarDot({ tone = "success", label }: { tone?: Tone; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-1 w-1 rounded-full ${toneDot[tone]}`} />
      {label}
    </span>
  );
}