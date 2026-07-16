import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal-shell";
import {
  Activity,
  BarChart3,
  FlaskConical,
  Flame,
  LayoutDashboard,
  Radar,
  Siren,
  Sparkles,
  History,
  FileText,
  Users,
} from "lucide-react";

const items = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Mission Control", url: "/admin/mission", icon: Radar },
  { title: "AI Scenario Simulator", url: "/admin/simulator", icon: FlaskConical },
  { title: "Crowd Monitoring", url: "/admin/crowd", icon: Users },
  { title: "AI Recommendations", url: "/admin/ai", icon: Sparkles },
  { title: "AI Activity Log", url: "/admin/activity", icon: History },
  { title: "Incident Reports", url: "/admin/incidents", icon: Activity },
  { title: "Queue Analytics", url: "/admin/queues", icon: BarChart3 },
  { title: "Stadium Heatmap", url: "/admin/heatmap", icon: Flame },
  { title: "Emergency Center", url: "/admin/emergency", icon: Siren },
  { title: "Executive Summary", url: "/admin/summary", icon: FileText },
];

export const Route = createFileRoute("/admin")({
  component: () => <PortalShell label="Admin Portal" accent="green" items={items} />,
});