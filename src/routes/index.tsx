import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Brain,
  MapPin,
  ShieldAlert,
  Sparkles,
  Users,
  Utensils,
  BarChart3,
  Radio,
  ArrowRight,
  Trophy,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  {
    icon: Brain,
    title: "AI Command Layer",
    body: "A unified brain that fuses sensors, cameras and ticketing into real-time decisions.",
  },
  {
    icon: Users,
    title: "Crowd Intelligence",
    body: "Predict density spikes before they happen and reroute fans through the calmest paths.",
  },
  {
    icon: ShieldAlert,
    title: "Safety First",
    body: "Detect incidents in seconds and dispatch response teams with one tap.",
  },
  {
    icon: MapPin,
    title: "Interactive Wayfinding",
    body: "Every fan gets a personal guide — seat, food, restroom, exit — right in their pocket.",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    body: "Executive dashboards that turn stadium noise into signal for every operator.",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    body: "Continuous suggestions to open gates, staff kiosks, and optimize the fan journey.",
  },
];

const stats = [
  { label: "Fans served", value: "82,340" },
  { label: "Avg. queue time", value: "2m 14s" },
  { label: "Incident response", value: "38s" },
  { label: "Uptime", value: "99.99%" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-hero text-foreground">
      {/* Nav */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary shadow-glow">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-base font-bold tracking-tight">Stadium Brain</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#portals" className="hover:text-foreground">Portals</a>
          <a href="#stats" className="hover:text-foreground">Impact</a>
        </nav>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Radio className="h-3.5 w-3.5 text-accent pulse-dot rounded-full" />
          <span className="hidden sm:inline">Match live</span>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 glass px-3 py-1 text-xs">
            <Trophy className="h-3.5 w-3.5 text-accent" />
            <span className="text-muted-foreground">Built for FIFA World Cup 2026 venues</span>
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            The <span className="text-gradient">AI Command Center</span> for World Cup stadiums
          </h1>
          <p className="mt-6 text-base text-muted-foreground sm:text-lg">
            Stadium Brain unifies crowd flow, safety, and fan experience into one intelligent surface —
            so 80,000 people move like one.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/fan"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 sm:w-auto"
            >
              Enter as Fan
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/admin"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary sm:w-auto"
            >
              Enter as Admin
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Preview card */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="glass rounded-2xl p-4 shadow-card sm:p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Users, label: "Live attendance", value: "82,340 / 88,000", tone: "text-primary" },
                { icon: Activity, label: "Density index", value: "0.62 · calm", tone: "text-accent" },
                { icon: ShieldAlert, label: "Open incidents", value: "0 critical · 2 minor", tone: "text-foreground" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/60 bg-card/60 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    <s.icon className={`h-4 w-4 ${s.tone}`} />
                    {s.label}
                  </div>
                  <div className="mt-2 text-2xl font-bold">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-1 grid-cols-[repeat(24,minmax(0,1fr))] sm:grid-cols-[repeat(48,minmax(0,1fr))]">
              {Array.from({ length: 48 }).map((_, i) => {
                const h = 20 + Math.round(60 * Math.abs(Math.sin(i * 0.7)));
                const green = i % 7 !== 3 && i % 11 !== 5;
                return (
                  <div
                    key={i}
                    className="rounded-sm"
                    style={{
                      height: `${h}px`,
                      background: green
                        ? "linear-gradient(180deg, oklch(0.72 0.19 155 / 0.9), oklch(0.68 0.19 245 / 0.5))"
                        : "linear-gradient(180deg, oklch(0.65 0.24 25 / 0.9), oklch(0.65 0.24 25 / 0.3))",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Platform</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">One brain, every touchpoint.</h2>
          <p className="mt-3 text-muted-foreground">
            From the turnstile to the trophy, Stadium Brain choreographs the operation in real time.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/40"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portals */}
      <section id="portals" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <PortalCard
            tone="blue"
            eyebrow="Fan Portal"
            title="Your seat, your guide, your safety net."
            bullets={["AI assistant in every language", "Interactive stadium map", "Live crowd & food finder", "Emergency & accessibility"]}
            to="/fan"
            cta="Enter as Fan"
            icon={Users}
          />
          <PortalCard
            tone="green"
            eyebrow="Admin Portal"
            title="Run the stadium like a mission control."
            bullets={["Live crowd monitoring", "AI recommendations", "Incident & queue analytics", "Heatmaps & emergency center"]}
            to="/admin"
            cta="Enter as Admin"
            icon={BarChart3}
          />
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/60 bg-card p-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-gradient sm:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <span>© 2026 Stadium Brain · Operational intelligence for live venues</span>
          <span>Not affiliated with FIFA</span>
        </div>
      </footer>
    </div>
  );
}

function PortalCard({
  tone,
  eyebrow,
  title,
  bullets,
  to,
  cta,
  icon: Icon,
}: {
  tone: "blue" | "green";
  eyebrow: string;
  title: string;
  bullets: string[];
  to: string;
  cta: string;
  icon: typeof Users;
}) {
  const gradient = tone === "blue" ? "bg-gradient-primary" : "bg-gradient-accent";
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-card transition hover:-translate-y-1">
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl ${gradient}`}
      />
      <div className={`grid h-12 w-12 place-items-center rounded-xl ${gradient} shadow-glow`}>
        <Icon className="h-6 w-6 text-primary-foreground" />
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
      <h3 className="mt-1 text-2xl font-bold tracking-tight">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className={`mt-1.5 inline-block h-1.5 w-1.5 rounded-full ${tone === "blue" ? "bg-primary" : "bg-accent"}`} />
            {b}
          </li>
        ))}
      </ul>
      <Link
        to={to}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition group-hover:text-primary"
      >
        {cta}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
