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
import { Brain, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PortalNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

type Props = {
  label: string;
  accent: "blue" | "green";
  items: PortalNavItem[];
};

export function PortalShell({ label, accent, items }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const dot = accent === "blue" ? "bg-primary" : "bg-accent";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2 px-2 py-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-primary shadow-glow">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold tracking-tight">Stadium Brain</span>
                <span className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
                  {label}
                </span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const active =
                      pathname === item.url ||
                      (item.url !== items[0]?.url && pathname.startsWith(item.url + "/"));
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild isActive={active}>
                          <Link to={item.url} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
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
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 glass px-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${dot} pulse-dot`} />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Live · Lusail Stadium
              </span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Match Day · 2nd Half
              </span>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary/70"
              >
                <LogOut className="h-3.5 w-3.5" /> Exit
              </Link>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
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
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children ? <div className="flex shrink-0 items-center gap-2">{children}</div> : null}
    </div>
  );
}