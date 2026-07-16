import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal-shell";
import {
  Accessibility,
  Bot,
  CalendarClock,
  Map as MapIcon,
  Route as RouteIcon,
  ShieldAlert,
  Users,
  Utensils,
} from "lucide-react";

const items = [
  { title: "AI Assistant", url: "/fan", icon: Bot },
  { title: "Fan Journey", url: "/fan/journey", icon: RouteIcon },
  { title: "Stadium Map", url: "/fan/map", icon: MapIcon },
  { title: "Live Crowd", url: "/fan/crowd", icon: Users },
  { title: "Food Finder", url: "/fan/food", icon: Utensils },
  { title: "Emergency", url: "/fan/emergency", icon: ShieldAlert },
  { title: "Accessibility", url: "/fan/accessibility", icon: Accessibility },
  { title: "Match Info", url: "/fan/match", icon: CalendarClock },
];

export const Route = createFileRoute("/fan")({
  component: () => <PortalShell label="Fan Portal" accent="blue" items={items} />,
});