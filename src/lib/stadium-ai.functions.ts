import { createServerFn } from "@tanstack/react-start";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const StadiumSnapshot = z.object({
  gateOccupancy: z.number(),
  foodQueue: z.number(),
  parkingOccupancy: z.number(),
  crowdDensity: z.number(),
  medicalAlerts: z.number(),
});

export type StadiumSnapshotInput = z.infer<typeof StadiumSnapshot>;

function formatStadium(s: StadiumSnapshotInput) {
  // Deterministic per-gate/zone breakdown derived from the live aggregate so
  // the model can reason about specific gates, zones, and vendors.
  const gates = [
    { id: "A", load: Math.round(s.gateOccupancy * 0.85) },
    { id: "B", load: Math.round(Math.min(99, s.gateOccupancy * 1.05)) },
    { id: "C", load: Math.round(Math.min(99, s.gateOccupancy * 1.15)) },
    { id: "D", load: Math.round(s.gateOccupancy * 0.7) },
    { id: "E", load: Math.round(s.gateOccupancy * 0.9) },
  ];
  const zones = [
    { id: "North Stand (Sect. A)", density: Math.round(s.crowdDensity * 0.95) },
    { id: "East Stand (Sect. B)", density: Math.round(Math.min(99, s.crowdDensity * 1.1)) },
    { id: "South Stand (Sect. C)", density: Math.round(s.crowdDensity * 0.9) },
    { id: "West Stand (Sect. D)", density: Math.round(s.crowdDensity * 1.0) },
  ];
  const foodCourts = [
    { id: "Food Court East", waitMin: Math.round(s.foodQueue * 1.2) },
    { id: "Food Court West", waitMin: Math.round(s.foodQueue * 0.9) },
    { id: "Halal Kiosk (Concourse 2)", waitMin: Math.max(1, Math.round(s.foodQueue * 0.7)) },
  ];
  return [
    `Overall crowd density: ${Math.round(s.crowdDensity)}%`,
    `Parking occupancy: ${Math.round(s.parkingOccupancy)}%`,
    `Active medical alerts: ${s.medicalAlerts}`,
    `Average food queue: ${Math.round(s.foodQueue)} min`,
    "",
    "Gates:",
    ...gates.map((g) => `  - Gate ${g.id}: ${g.load}% occupancy`),
    "Zones:",
    ...zones.map((z) => `  - ${z.id}: ${z.density}% density`),
    "Food:",
    ...foodCourts.map((f) => `  - ${f.id}: ${f.waitMin} min wait`),
  ].join("\n");
}

export const askFanAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ question: z.string().min(1).max(500), stadium: StadiumSnapshot })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const system = `You are the Stadium Brain concierge for a FIFA World Cup match.
Answer the fan's question in a short, friendly, and specific way (2-4 sentences max).
Always ground your answer in the CURRENT LIVE STADIUM DATA below. If a gate, zone,
or vendor is crowded, suggest a calmer alternative and reference the actual numbers.
If the question is unrelated (weather, small talk), still be helpful and brief.
Do not invent data that is not derivable from the snapshot.`;

    const prompt = `CURRENT LIVE STADIUM DATA:\n${formatStadium(data.stadium)}\n\nFan question: "${data.question}"`;

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system,
      prompt,
    });
    return { text: text.trim() };
  });

const RecSchema = z.object({
  recommendations: z.array(
    z.object({
      priority: z.enum(["high", "medium", "low"]),
      problem: z.string(),
      recommendation: z.string(),
      reasoning: z.string(),
      dataSources: z.array(z.string()).min(1).max(6),
      expectedImpact: z.string(),
      confidence: z.number(),
    }),
  ),
});

export type OpsRecommendation = z.infer<typeof RecSchema>["recommendations"][number];

export const generateOpsRecommendations = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ stadium: StadiumSnapshot }).parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const system = `You are the Operations AI for Stadium Brain, an AI command center
for a FIFA World Cup stadium. Analyze the LIVE dashboard metrics and produce 3 to 5
actionable recommendations for the operations team.

For each recommendation:
- priority: "high" | "medium" | "low" — high only when a metric is near or above safe thresholds.
- problem: one sentence, reference the specific gate / zone / vendor and its exact metric.
- recommendation: the concrete action to take now.
- reasoning: why the AI reached this conclusion, referencing the data.
- dataSources: 2-4 short labels naming the signals used (e.g. "Live crowd density",
  "Historical halftime patterns", "Gate sensor telemetry", "Parking intake rate",
  "Medical dispatch feed", "Food vendor queue sensors", "CCTV computer vision").
  Only use sources actually reflected in the snapshot or plausible historical data.
- expectedImpact: quantified expected improvement (e.g. "reduce wait by ~18%").
- confidence: integer 0-100 reflecting how strong the signal is.

Ground everything in the snapshot. Do not invent gates, zones, or vendors that are not listed.`;

    const prompt = `LIVE STADIUM METRICS:\n${formatStadium(data.stadium)}`;

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system,
        prompt,
        output: Output.object({ schema: RecSchema }),
      });
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return { recommendations: [] };
      }
      throw error;
    }
  });