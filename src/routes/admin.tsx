import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal-shell";
import {
  Activity,
  BarChart3,
  Bot,
  FlaskConical,
  Gauge,
  Map as MapIcon,
  Settings,
  Siren,
  FileText,
  FileSearch,
  Sparkles,
  History,
} from "lucide-react";

const items = [
  { title: "Mission Control", url: "/", icon: Gauge },
  { title: "Fan Assistant", url: "/fan", icon: Bot },
  { title: "AI Scenario Simulator", url: "/admin/simulator", icon: FlaskConical },
  { title: "Stadium Map", url: "/admin/heatmap", icon: MapIcon },
  { title: "Incidents", url: "/admin/incidents", icon: Activity },
  { title: "Crowd Analytics", url: "/admin/crowd", icon: BarChart3 },
  { title: "Emergency Center", url: "/admin/emergency", icon: Siren },
  { title: "Reports", url: "/admin/summary", icon: FileText },
  { title: "AI Recommendations", url: "/admin/ai", icon: Sparkles },
  { title: "Activity Log", url: "/admin/activity", icon: History },
  { title: "Case Report", url: "/admin/case", icon: FileSearch },
  { title: "Settings", url: "/admin", icon: Settings },
];

export const Route = createFileRoute("/admin")({
  component: () => <PortalShell label="Operations" items={items} />,
});