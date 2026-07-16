import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const ReportSchema = z.object({
  matchTitle: z.string(),
  headline: z.string(),
  attendance: z.object({
    total: z.string(),
    capacityPct: z.number(),
    note: z.string(),
  }),
  peakCrowdTime: z.object({
    time: z.string(),
    zone: z.string(),
    note: z.string(),
  }),
  majorIncidents: z.array(
    z.object({ time: z.string(), type: z.string(), resolution: z.string() })
  ),
  avgQueueTime: z.object({
    minutes: z.number(),
    change: z.string(),
    note: z.string(),
  }),
  emergencyResponse: z.object({
    avgResponseSeconds: z.number(),
    incidentsHandled: z.number(),
    grade: z.string(),
    note: z.string(),
  }),
  aiDecisions: z.array(
    z.object({ decision: z.string(), impact: z.string() })
  ),
  operationalEfficiency: z.object({
    score: z.number(),
    summary: z.string(),
  }),
  suggestions: z.array(z.string()),
});

export type ExecutiveReport = z.infer<typeof ReportSchema>;

export const generateExecutiveSummary = createServerFn({ method: "POST" })
  .handler(async () => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const context = `
You are an operations analyst producing an executive match-day report for
"Stadium Brain", the AI command center for a FIFA World Cup stadium.
Base the report on this simulated match telemetry:

- Match: Group Stage — Argentina vs. Germany at Lusail Stadium
- Kickoff: 21:00, sold-out crowd, mild weather, no rain
- Turnstile scans: 86,412 of 88,966 seats
- Peak density in Section B (North Stand) at 20:47, 4.1 people/m²
- Incidents: 1 medical (fainting, Sect. C-14, resolved in 3m), 1 minor scuffle at Gate E (resolved 2m), 1 lost child reunited in 6m
- Avg gate queue: 4.2 min (30-day avg 6.8 min)
- AI opened Gate D at 20:32 based on Gate C congestion prediction (-22% wait)
- AI added kiosk at Food Court East at 18:51 (-14 min queue)
- Emergency response avg 1m 47s across 3 incidents
- Parking peaked at 92% at 20:15
- Exit flow completed in 41 minutes post-match

Write it as if delivered to stadium management the morning after the match.
Be specific, confident, and professional. Numbers should feel realistic.
`.trim();

    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({ schema: ReportSchema }),
      prompt: context,
    });

    return output;
  });