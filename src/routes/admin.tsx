import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal-shell";
import {
  Activity,
  BarChart3,
  Flame,
  LayoutDashboard,
  Siren,
  Sparkles,
  Users,
} from "lucide-react";

const items = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Crowd Monitoring", url: "/admin/crowd", icon: Users },
  { title: "AI Recommendations", url: "/admin/ai", icon: Sparkles },
  { title: "Incident Reports", url: "/admin/incidents", icon: Activity },
  { title: "Queue Analytics", url: "/admin/queues", icon: BarChart3 },
  { title: "Stadium Heatmap", url: "/admin/heatmap", icon: Flame },
  { title: "Emergency Center", url: "/admin/emergency", icon: Siren },
];

export const Route = createFileRoute("/admin")({
  component: () => <PortalShell label="Admin Portal" accent="green" items={items} />,
});