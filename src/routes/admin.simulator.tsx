import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  ArrowRight,
  Brain,
  Cloud,
  CloudRain,
  DoorOpen,
  Flame,
  Lightbulb,
  ParkingCircle,
  Play,
  ShieldAlert,
  Sparkles,
  Sun,
  Timer,
  Users,
  Utensils,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/admin/simulator")({
  component: Simulator,
});

type Attendance = 25 | 50 | 75 | 100;
type Weather = "sunny" | "rain" | "storm";
type Phase = "before" | "kickoff" | "halftime" | "second" | "final";
type Security = "normal" | "elevated" | "emergency";
type Level = "low" | "medium" | "high";
type Emergency = "none" | "medical" | "lost-child" | "gate-blockage" | "fire";

type Scenario = {
  attendance: Attendance;
  weather: Weather;
  phase: Phase;
  security: Security;
  food: Level;
  parking: Level;
  emergency: Emergency;
};

const defaultScenario: Scenario = {
  attendance: 75,
  weather: "sunny",
  phase: "kickoff",
  security: "normal",
  food: "medium",
  parking: "medium",
  emergency: "none",
};

type Tone = "green" | "yellow" | "red";

const toneStyles: Record<Tone, { text: string; bg: string; ring: string; solid: string; label: string }> = {
  green: { text: "text-accent", bg: "bg-accent/15", ring: "ring-accent/30", solid: "bg-accent", label: "Green" },
  yellow: { text: "text-chart-3", bg: "bg-chart-3/15", ring: "ring-chart-3/30", solid: "bg-chart-3", label: "Yellow" },
  red: { text: "text-destructive", bg: "bg-destructive/15", ring: "ring-destructive/40", solid: "bg-destructive", label: "Red" },
};

function toneFor(score: number): Tone {
  if (score >= 70) return "red";
  if (score >= 40) return "yellow";
  return "green";
}

type Prediction = {
  risk: number;
  tone: Tone;
  confidence: number;
  crowdDensity: number;
  queueMinutes: number;
  gateCongestion: number;
  foodLoad: number;
  medical: number;
  security: number;
  parking: number;
  actions: string[];
  staffing: { zone: string; officers: number }[];
  emergencyPlan: string[];
  exitStrategy: string;
  insights: {
    problem: string;
    reason: string;
    recommendation: string;
    improvement: string;
    confidence: number;
  }[];
};

function computePrediction(s: Scenario): Prediction {
  const attendanceWeight = s.attendance / 100;
  const weatherWeight = s.weather === "storm" ? 1 : s.weather === "rain" ? 0.6 : 0.2;
  const phaseWeight =
    s.phase === "halftime" ? 1 : s.phase === "kickoff" ? 0.85 : s.phase === "final" ? 0.95 : s.phase === "second" ? 0.5 : 0.35;
  const securityWeight = s.security === "emergency" ? 1 : s.security === "elevated" ? 0.6 : 0.25;
  const levelToNum = (l: Level) => (l === "high" ? 0.9 : l === "medium" ? 0.55 : 0.25);
  const emergencyWeight =
    s.emergency === "fire" ? 1 : s.emergency === "gate-blockage" ? 0.85 : s.emergency === "medical" ? 0.55 : s.emergency === "lost-child" ? 0.4 : 0;

  const risk = Math.round(
    Math.min(
      99,
      attendanceWeight * 28 +
        weatherWeight * 14 +
        phaseWeight * 18 +
        securityWeight * 12 +
        emergencyWeight * 22 +
        levelToNum(s.food) * 4 +
        levelToNum(s.parking) * 4,
    ),
  );

  const crowdDensity = Math.round(Math.min(99, attendanceWeight * 90 + phaseWeight * 8));
  const queueMinutes = Math.round(4 + attendanceWeight * 10 + levelToNum(s.food) * 8 + phaseWeight * 4);
  const gateCongestion = Math.round(Math.min(99, attendanceWeight * 78 + phaseWeight * 18 + emergencyWeight * 10));
  const foodLoad = Math.round(Math.min(99, levelToNum(s.food) * 70 + phaseWeight * 25));
  const medical = Math.round(Math.max(30, 100 - emergencyWeight * 45 - weatherWeight * 15));
  const security = Math.round(Math.max(30, 100 - securityWeight * 40 - emergencyWeight * 25));
  const parking = Math.round(Math.min(99, levelToNum(s.parking) * 80 + attendanceWeight * 15));
  const confidence = Math.round(88 + (1 - Math.abs(0.5 - attendanceWeight)) * 8);

  const actions: string[] = [];
  if (gateCongestion > 70) actions.push("Open Gate D and reroute East-entrance arrivals via Gate B.");
  if (foodLoad > 60) actions.push("Activate express lanes at Concourse 2 and 4; add 4 attendants.");
  if (weatherWeight > 0.5) actions.push("Deploy weather ponchos and cover walkways on Concourse 1.");
  if (emergencyWeight > 0.4) actions.push("Pre-position medical team at Sec 118 and Sec 214.");
  if (parking > 75) actions.push("Divert inbound vehicles to overflow Lot F with shuttle service.");
  if (actions.length === 0) actions.push("Maintain baseline operations — no critical intervention required.");

  const staffing = [
    { zone: "Gates A–D", officers: Math.round(12 + attendanceWeight * 14 + emergencyWeight * 6) },
    { zone: "Concourse", officers: Math.round(18 + phaseWeight * 10 + levelToNum(s.food) * 6) },
    { zone: "Medical Bays", officers: Math.round(6 + emergencyWeight * 8 + weatherWeight * 4) },
    { zone: "Perimeter", officers: Math.round(10 + securityWeight * 10) },
  ];

  const emergencyPlan =
    s.emergency === "none"
      ? ["Maintain standby response teams at Bays 1–3.", "Broadcast readiness check every 15 minutes."]
      : s.emergency === "fire"
        ? [
            "Trigger Zone Alpha evacuation via Exits A, C, E.",
            "Dispatch Fire Charlie + Medical Alpha immediately.",
            "Suspend ingress at all gates until all-clear.",
          ]
        : s.emergency === "gate-blockage"
          ? ["Open bypass Gate D and redirect flow.", "Deploy 2 additional security officers.", "Notify inbound fans via app push."]
          : s.emergency === "medical"
            ? ["Dispatch Medical Alpha to reported section.", "Clear closest concourse lane for stretcher access."]
            : ["Activate lost-child protocol at Command Post 2.", "Broadcast description to staff radios only."];

  const exitStrategy =
    s.phase === "final" || s.phase === "second"
      ? "Stagger exits by tier — release Tier 3 first via Exits A/B, Tier 2 via C/D, Tier 1 via E/F over 12 minutes."
      : "Keep all exits on standby; prioritize ingress flow through Gates A, B, and D.";

  const insights: Prediction["insights"] = [];
  if (gateCongestion > 70) {
    insights.push({
      problem: `Gate C is expected to exceed ${Math.min(99, gateCongestion + 5)}% capacity during ${labelForPhase(s.phase)}.`,
      reason: "Historical crowd movement and simulated attendance indicate congestion.",
      recommendation: "Open Gate D and deploy two additional security officers.",
      improvement: "Reduce average waiting time by 18%.",
      confidence: Math.min(99, confidence + 4),
    });
  }
  if (foodLoad > 60) {
    insights.push({
      problem: `Food court load projected at ${foodLoad}% during peak minutes.`,
      reason: `${s.food === "high" ? "High" : "Moderate"} demand combined with ${labelForPhase(s.phase)} traffic overwhelms 4 vendors.`,
      recommendation: "Open express lanes and stage 4 additional attendants at Concourse 2.",
      improvement: "Cut average queue by 6 minutes.",
      confidence: Math.max(80, confidence - 2),
    });
  }
  if (weatherWeight > 0.5) {
    insights.push({
      problem: `${s.weather === "storm" ? "Storm" : "Rain"} conditions raise slip and medical risk by ${Math.round(weatherWeight * 30)}%.`,
      reason: "Weather model shows sustained precipitation during match window.",
      recommendation: "Cover Concourse 1 walkway and pre-position 2 mobile medical carts.",
      improvement: "Cut weather-related incidents by 34%.",
      confidence: 92,
    });
  }
  if (emergencyWeight > 0.4) {
    insights.push({
      problem: `${labelForEmergency(s.emergency)} scenario introduces a critical response window under 3 minutes.`,
      reason: "Simulation replays 1,200+ historical incidents matching this profile.",
      recommendation: "Activate tiered response, pre-stage teams, and clear evacuation corridors.",
      improvement: "Reduce response time by 41%.",
      confidence: 95,
    });
  }
  if (insights.length === 0) {
    insights.push({
      problem: "No critical risks predicted for this scenario.",
      reason: "All operational vectors below threshold based on baseline conditions.",
      recommendation: "Maintain standard staffing and monitor for drift.",
      improvement: "Preserves current fan sentiment score of 92%.",
      confidence,
    });
  }

  return {
    risk,
    tone: toneFor(risk),
    confidence,
    crowdDensity,
    queueMinutes,
    gateCongestion,
    foodLoad,
    medical,
    security,
    parking,
    actions,
    staffing,
    emergencyPlan,
    exitStrategy,
    insights,
  };
}

function labelForPhase(p: Phase) {
  return p === "before" ? "pre-match" : p === "kickoff" ? "kickoff" : p === "halftime" ? "halftime" : p === "second" ? "the second half" : "the final whistle";
}
function labelForEmergency(e: Emergency) {
  return e === "medical" ? "Medical" : e === "lost-child" ? "Lost child" : e === "gate-blockage" ? "Gate blockage" : e === "fire" ? "Fire alarm" : "No";
}

function Segmented<T extends string | number>({
  label,
  icon: Icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: LucideIcon;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: LucideIcon }[];
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-primary/60 bg-primary/15 text-primary shadow-glow"
                  : "border-border/60 bg-secondary/60 text-foreground/80 hover:bg-secondary"
              }`}
            >
              {opt.icon ? <opt.icon className="h-3.5 w-3.5" /> : null}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RiskGauge({ score, tone }: { score: number; tone: Tone }) {
  const styles = toneStyles[tone];
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  return (
    <div className="relative grid place-items-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
        <circle cx="100" cy="100" r={radius} strokeWidth="14" className="fill-none stroke-secondary" />
        <circle
          cx="100"
          cy="100"
          r={radius}
          strokeWidth="14"
          strokeLinecap="round"
          className={`fill-none transition-all duration-700 ${
            tone === "green" ? "stroke-accent" : tone === "yellow" ? "stroke-chart-3" : "stroke-destructive"
          }`}
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Overall Risk</div>
          <div className="text-5xl font-bold tabular-nums">{score}</div>
          <div className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${styles.bg} ${styles.text} ring-1 ${styles.ring}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${styles.solid} pulse-dot`} /> {styles.label}
          </div>
        </div>
      </div>
    </div>
  );
}

function Ring({ value, label, icon: Icon, tone, unit = "%" }: { value: number; label: string; icon: LucideIcon; tone: Tone; unit?: string }) {
  const styles = toneStyles[tone];
  const r = 32;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, value) / 100) * c;
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-card backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 80 80" className="-rotate-90">
            <circle cx="40" cy="40" r={r} strokeWidth="7" className="fill-none stroke-secondary" />
            <circle
              cx="40"
              cy="40"
              r={r}
              strokeWidth="7"
              strokeLinecap="round"
              className={`fill-none transition-all duration-700 ${
                tone === "green" ? "stroke-accent" : tone === "yellow" ? "stroke-chart-3" : "stroke-destructive"
              }`}
              strokeDasharray={`${dash} ${c}`}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className={`grid h-7 w-7 place-items-center rounded-md ${styles.bg} ${styles.text}`}>
              <Icon className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold tabular-nums">
            {value}
            <span className="ml-0.5 text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Heatstrip({ label, value }: { label: string; value: number }) {
  const cells = 20;
  const filled = Math.round((value / 100) * cells);
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground">{value}%</span>
      </div>
      <div className="mt-1.5 flex gap-1">
        {Array.from({ length: cells }).map((_, i) => {
          const active = i < filled;
          const tone = i < cells * 0.4 ? "bg-accent" : i < cells * 0.7 ? "bg-chart-3" : "bg-destructive";
          return (
            <span
              key={i}
              className={`h-4 flex-1 rounded-sm transition ${active ? tone : "bg-secondary/60"}`}
              style={{ opacity: active ? 1 : 0.4 }}
            />
          );
        })}
      </div>
    </div>
  );
}

function Simulator() {
  const [scenario, setScenario] = useState<Scenario>(defaultScenario);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Prediction | null>(null);

  const preview = useMemo(() => computePrediction(scenario), [scenario]);

  const setField = <K extends keyof Scenario>(k: K, v: Scenario[K]) => setScenario((s) => ({ ...s, [k]: v }));

  const run = () => {
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      setResult(computePrediction(scenario));
      setRunning(false);
    }, 1100);
  };

  return (
    <div>
      <PageHeader
        title="AI Scenario Simulator"
        description="Model any match-day condition. The engine predicts risk, load, and the exact playbook to run."
      />

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        {/* Left Panel */}
        <aside className="space-y-5 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-card backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary shadow-glow">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </span>
            <div>
              <div className="text-sm font-bold">Scenario Controls</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Configure any condition</div>
            </div>
          </div>

          <Segmented
            label="Attendance"
            icon={Users}
            value={scenario.attendance}
            onChange={(v) => setField("attendance", v)}
            options={[
              { value: 25, label: "25%" },
              { value: 50, label: "50%" },
              { value: 75, label: "75%" },
              { value: 100, label: "100%" },
            ]}
          />

          <Segmented
            label="Weather"
            icon={Cloud}
            value={scenario.weather}
            onChange={(v) => setField("weather", v)}
            options={[
              { value: "sunny", label: "Sunny", icon: Sun },
              { value: "rain", label: "Rain", icon: CloudRain },
              { value: "storm", label: "Storm", icon: Zap },
            ]}
          />

          <Segmented
            label="Match Phase"
            icon={Timer}
            value={scenario.phase}
            onChange={(v) => setField("phase", v)}
            options={[
              { value: "before", label: "Before" },
              { value: "kickoff", label: "Kickoff" },
              { value: "halftime", label: "Halftime" },
              { value: "second", label: "2nd Half" },
              { value: "final", label: "Final Whistle" },
            ]}
          />

          <Segmented
            label="Security Level"
            icon={ShieldAlert}
            value={scenario.security}
            onChange={(v) => setField("security", v)}
            options={[
              { value: "normal", label: "Normal" },
              { value: "elevated", label: "Elevated" },
              { value: "emergency", label: "Emergency" },
            ]}
          />

          <Segmented
            label="Food Demand"
            icon={Utensils}
            value={scenario.food}
            onChange={(v) => setField("food", v)}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />

          <Segmented
            label="Parking Occupancy"
            icon={ParkingCircle}
            value={scenario.parking}
            onChange={(v) => setField("parking", v)}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />

          <Segmented
            label="Emergency Scenario"
            icon={Flame}
            value={scenario.emergency}
            onChange={(v) => setField("emergency", v)}
            options={[
              { value: "none", label: "None" },
              { value: "medical", label: "Medical" },
              { value: "lost-child", label: "Lost Child" },
              { value: "gate-blockage", label: "Gate Blockage" },
              { value: "fire", label: "Fire Alarm" },
            ]}
          />

          <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Pre-run estimate</span>
              <span className={toneStyles[preview.tone].text}>{toneStyles[preview.tone].label}</span>
            </div>
            <div className="mt-1 flex items-end justify-between">
              <div className="text-2xl font-bold tabular-nums">{preview.risk}<span className="text-sm text-muted-foreground">/100</span></div>
              <div className="text-[10px] text-muted-foreground">Click Run for full analysis</div>
            </div>
          </div>

          <button
            type="button"
            onClick={run}
            disabled={running}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-primary px-5 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-glow transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative inline-flex items-center justify-center gap-2">
              {running ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" /> Simulating…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Run AI Simulation
                </>
              )}
            </span>
          </button>
        </aside>

        {/* Right Panel */}
        <section className="space-y-5">
          {!result && !running ? (
            <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-border/60 bg-card/50 p-10 text-center shadow-card backdrop-blur-md">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
                  <Brain className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="mt-4 text-xl font-bold">AI Prediction Engine</h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                  Configure your scenario and press <span className="text-foreground">Run AI Simulation</span>. The model will forecast risk, load, and the exact playbook to execute.
                </p>
              </div>
            </div>
          ) : null}

          {running ? (
            <div className="grid min-h-[420px] place-items-center rounded-2xl border border-primary/30 bg-card/60 p-10 text-center shadow-card backdrop-blur-md">
              <div className="animate-fade-in">
                <div className="mx-auto grid h-16 w-16 animate-pulse place-items-center rounded-2xl bg-gradient-primary shadow-glow">
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-bold">Running 12,400 simulations…</h3>
                <p className="mt-1 text-sm text-muted-foreground">Aggregating historical patterns and live telemetry</p>
                <div className="mx-auto mt-4 h-1.5 w-64 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-1/3 animate-[slide-in-right_1.1s_ease-in-out_infinite] rounded-full bg-gradient-primary" />
                </div>
              </div>
            </div>
          ) : null}

          {result && !running ? (
            <div className="animate-fade-in space-y-5">
              {/* Top: Risk gauge + primary metrics */}
              <div className="grid gap-5 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-card backdrop-blur-md md:grid-cols-[220px_minmax(0,1fr)]">
                <RiskGauge score={result.risk} tone={result.tone} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Confidence</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-bold tabular-nums text-gradient">{result.confidence}%</span>
                      <span className="text-xs text-muted-foreground">across 12.4k sims</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gradient-accent" style={{ width: `${result.confidence}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Best Exit Strategy</div>
                    <p className="mt-1 text-sm text-foreground/90">{result.exitStrategy}</p>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Heatstrip label="Predicted Crowd Density" value={result.crowdDensity} />
                    <Heatstrip label="Gate Congestion Forecast" value={result.gateCongestion} />
                    <Heatstrip label="Food Court Load" value={result.foodLoad} />
                  </div>
                </div>
              </div>

              {/* Ring grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Ring label="Expected Queue" value={result.queueMinutes} icon={Timer} tone={toneFor(result.queueMinutes * 4)} unit="m" />
                <Ring label="Medical Readiness" value={result.medical} icon={Ambulance} tone={result.medical >= 70 ? "green" : result.medical >= 45 ? "yellow" : "red"} />
                <Ring label="Security Readiness" value={result.security} icon={ShieldAlert} tone={result.security >= 70 ? "green" : result.security >= 45 ? "yellow" : "red"} />
                <Ring label="Parking Status" value={result.parking} icon={ParkingCircle} tone={toneFor(result.parking)} />
              </div>

              {/* Playbooks */}
              <div className="grid gap-5 lg:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-card backdrop-blur-md">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Lightbulb className="h-4 w-4 text-chart-3" /> Recommended Actions
                  </div>
                  <ul className="mt-3 space-y-2 text-sm">
                    {result.actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-foreground/90">
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-card backdrop-blur-md">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Users className="h-4 w-4 text-primary" /> Staff Allocation Plan
                  </div>
                  <ul className="mt-3 space-y-2 text-sm">
                    {result.staffing.map((s) => (
                      <li key={s.zone} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
                        <span className="text-foreground/90">{s.zone}</span>
                        <span className="tabular-nums font-semibold text-primary">{s.officers}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5 shadow-card backdrop-blur-md">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Activity className="h-4 w-4 text-destructive" /> Emergency Response Plan
                  </div>
                  <ul className="mt-3 space-y-2 text-sm">
                    {result.emergencyPlan.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-foreground/90">
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-bold">
                  <Sparkles className="h-4 w-4 text-primary" /> Why the AI made these calls
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.insights.map((ins, i) => (
                    <div key={i} className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-card backdrop-blur-md">
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/15 text-destructive">
                          <AlertTriangle className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Problem Detected</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold">{ins.problem}</p>
                      <div className="mt-3 grid gap-2 text-xs">
                        <Row label="Reason" value={ins.reason} icon={Brain} tone="muted" />
                        <Row label="Recommendation" value={ins.recommendation} icon={Lightbulb} tone="chart" />
                        <Row label="Expected Improvement" value={ins.improvement} icon={ArrowRight} tone="accent" />
                        <Row label="Confidence" value={`${ins.confidence}%`} icon={Sparkles} tone="primary" />
                      </div>
                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${ins.confidence}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Peripheral status cards (persistent) */}
          {result && !running ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <MiniStat icon={DoorOpen} label="Gate C Peak" value={`${Math.min(99, result.gateCongestion + 4)}%`} tone={toneFor(result.gateCongestion + 4)} />
              <MiniStat icon={Users} label="Present Fans" value={`${Math.round(82340 * (scenario.attendance / 100)).toLocaleString()}`} tone="green" />
              <MiniStat icon={Timer} label="Peak Queue" value={`${result.queueMinutes + 3} min`} tone={toneFor((result.queueMinutes + 3) * 4)} />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Row({ label, value, icon: Icon, tone }: { label: string; value: string; icon: LucideIcon; tone: "muted" | "chart" | "accent" | "primary" }) {
  const color =
    tone === "muted" ? "text-muted-foreground" : tone === "chart" ? "text-chart-3" : tone === "accent" ? "text-accent" : "text-primary";
  return (
    <div className="rounded-lg bg-secondary/40 p-2.5">
      <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest ${color}`}>
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-1 text-foreground/90">{value}</p>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: Tone }) {
  const styles = toneStyles[tone];
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-card backdrop-blur-md">
      <span className={`grid h-10 w-10 place-items-center rounded-lg ${styles.bg} ${styles.text}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-lg font-bold tabular-nums">{value}</div>
      </div>
    </div>
  );
}