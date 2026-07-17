import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Bell,
  CloudSun,
  Radio,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useLiveStadium } from "@/lib/live-stadium";

export type PortalNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

type Props = {
  label: string;
  accent?: "blue" | "green";
  items: PortalNavItem[];
  children?: ReactNode;
};

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function PortalShell({ label, items, children }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const now = useNow();
  const live = useLiveStadium();

  const stadiumStatus =
    live.crowdDensity > 88 || live.medicalAlerts >= 3
      ? { label: "Critical", tone: "text-critical", dot: "bg-critical" }
      : live.crowdDensity > 75 || live.medicalAlerts >= 2
        ? { label: "Warning", tone: "text-warning", dot: "bg-warning" }
        : { label: "Nominal", tone: "text-success", dot: "bg-success" };

  const clock = now
    ? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
    : "--:--:--";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
          <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/15 ring-1 ring-primary/40">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-[13px] font-semibold tracking-tight">
                  Stadium Brain
                </span>
                <span className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-1.5 py-2">
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
                Operations
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item, i) => {
                    const isFirst = i === 0;
                    const active =
                      pathname === item.url ||
                      (!isFirst && pathname.startsWith(item.url + "/"));
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          className="h-8 rounded-md px-2 text-[13px] font-medium data-[active=true]:bg-primary/12 data-[active=true]:text-foreground data-[active=true]:ring-1 data-[active=true]:ring-primary/40"
                        >
                          <Link to={item.url} className="flex items-center gap-2.5">
                            <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border bg-surface px-3">
            <SidebarTrigger className="h-7 w-7" />
            <div className="hidden h-4 w-px bg-border sm:block" />

            <StatusPill dot={stadiumStatus.dot} tone={stadiumStatus.tone} label={`Stadium ${stadiumStatus.label}`} />

            <div className="hidden items-center gap-2 md:flex">
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Match</span>
              <span className="text-[12px] font-medium">ARG vs FRA</span>
              <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                2H · 68'
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground md:flex">
                <CloudSun className="h-3.5 w-3.5" />
                <span className="tabular-nums">24°C · Clear</span>
              </div>
              <div className="hidden items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] tabular-nums text-foreground md:flex">
                <Radio className="h-3 w-3 text-success" />
                {clock}
              </div>
              <button
                aria-label="Notifications"
                className="relative grid h-8 w-8 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-warning" />
              </button>
              <div className="flex items-center gap-2 rounded-md border border-border bg-background pl-2 pr-2 py-1">
                <div className="grid h-6 w-6 place-items-center rounded-sm bg-primary/15 text-primary ring-1 ring-primary/30">
                  <UserRound className="h-3.5 w-3.5" />
                </div>
                <div className="hidden leading-tight sm:block">
                  <div className="text-[11px] font-medium">M. Rossi</div>
                  <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    Ops Supervisor
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 bg-background">
            <div className="mx-auto w-full max-w-[1720px] p-2 sm:p-2.5 lg:p-3 fade-in">
              {children ?? <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function StatusPill({ dot, tone, label }: { dot: string; tone: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1">
      <span className={`h-1.5 w-1.5 rounded-full ${dot} pulse-dot`} />
      <span className={`text-[11px] font-medium tracking-tight ${tone}`}>{label}</span>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
      <div className="flex min-w-0 items-baseline gap-2.5">
        <h1 className="truncate text-[13px] font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="hidden truncate text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground sm:block">
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="flex shrink-0 flex-wrap items-center gap-1.5">{children}</div> : null}
    </div>
  );
}