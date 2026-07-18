import { createServerFn } from "@tanstack/react-start";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const Snapshot = z.object({
  healthScore: z.number(),
  aiPerformance: z.number(),
  avgResponseSec: z.number(),
  crowdSafety: z.number(),
  operationalEfficiency: z.number(),
  resourceUtilization: z.number(),
  emergencyReadiness: z.number(),
  queuePerformance: z.number(),
});

const InsightsSchema = z.object({
  insights: z
    .array(
      z.object({
        tone: z.enum(["positive", "watch", "critical"]),
        headline: z.string(),
        detail: z.string(),
      }),
    )
    .min(3)
    .max(4),
});

export type ExecutiveInsight = z.infer<typeof InsightsSchema>["insights"][number];

export const generateExecutiveInsights = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ snapshot: Snapshot }).parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const system = `You are the executive analyst for Stadium Brain, briefing
the stadium director. Produce 3-4 concise executive insights derived from the
live operational scores. Each insight: tone ("positive" | "watch" | "critical"),
a short headline (<= 9 words), and a 1-2 sentence detail referencing the actual
numbers. Be precise, avoid hype, no emojis.`;

    const prompt = `LIVE OPERATIONAL SCORES (0-100 unless noted):
- Stadium Health: ${Math.round(data.snapshot.healthScore)}
- AI Performance: ${Math.round(data.snapshot.aiPerformance)}
- Avg Response: ${data.snapshot.avgResponseSec}s
- Crowd Safety: ${Math.round(data.snapshot.crowdSafety)}
- Operational Efficiency: ${Math.round(data.snapshot.operationalEfficiency)}
- Resource Utilization: ${Math.round(data.snapshot.resourceUtilization)}
- Emergency Readiness: ${Math.round(data.snapshot.emergencyReadiness)}
- Queue Performance: ${Math.round(data.snapshot.queuePerformance)}`;

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system,
        prompt,
        output: Output.object({ schema: InsightsSchema }),
      });
      return output;
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) return { insights: [] };
      throw err;
    }
  });