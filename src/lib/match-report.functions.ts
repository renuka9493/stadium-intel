import { createServerFn } from "@tanstack/react-start";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MatchReportSchema = z.object({
  matchInfo: z.object({
    title: z.string(),
    competition: z.string(),
    venue: z.string(),
    date: z.string(),
    kickoff: z.string(),
    weather: z.string(),
    finalScore: z.string(),
  }),
  headline: z.string(),
  attendance: z.object({
    total: z.string(),
    capacity: z.string(),
    capacityPct: z.number(),
    note: z.string(),
  }),
  peakCrowdDensity: z.object({
    value: z.string(),
    time: z.string(),
    zone: z.string(),
    note: z.string(),
  }),
  avgQueueTimes: z.object({
    gates: z.string(),
    food: z.string(),
    parking: z.string(),
    note: z.string(),
  }),
  emergencyIncidents: z.array(
    z.object({
      id: z.string(),
      time: z.string(),
      type: z.string(),
      location: z.string(),
      severity: z.string(),
      resolution: z.string(),
    }),
  ),
  medicalResponse: z.object({
    avgResponseSeconds: z.number(),
    incidentsHandled: z.number(),
    successRate: z.string(),
    grade: z.string(),
    note: z.string(),
  }),
  securityEvents: z.array(
    z.object({
      time: z.string(),
      type: z.string(),
      location: z.string(),
      action: z.string(),
    }),
  ),
  aiRecommendationsIssued: z.array(
    z.object({
      time: z.string(),
      recommendation: z.string(),
      accepted: z.boolean(),
      outcome: z.string(),
    }),
  ),
  operationalImprovements: z.array(
    z.object({
      area: z.string(),
      improvement: z.string(),
      metric: z.string(),
    }),
  ),
  lessonsLearned: z.array(z.string()),
  futureRecommendations: z.array(
    z.object({
      title: z.string(),
      detail: z.string(),
    }),
  ),
  overallGrade: z.string(),
  efficiencyScore: z.number(),
});

export type MatchReport = z.infer<typeof MatchReportSchema>;

export const generateMatchReport = createServerFn({ method: "POST" }).handler(
  async () => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const context = `
You are the senior operations analyst for "Stadium Brain", the AI command
center of a FIFA World Cup stadium. Produce a comprehensive, professional
post-match operations report suitable for delivery to stadium management,
FIFA operations, and public safety agencies.

Base the report on this simulated match telemetry:

- Match: Group Stage — Argentina vs. Germany, Lusail Stadium, capacity 88,966
- Kickoff: 21:00 local, sold-out, mild 22°C, no rain, wind 8 km/h
- Final score: Argentina 2 – 1 Germany
- Turnstile scans: 86,412 of 88,966 seats
- Peak crowd density: 4.1 people/m² at 20:47 in Section B (North Stand)
- Gate queue avg: 4.2 min (30d avg 6.8 min)
- Food court queue avg: 7.5 min (30d avg 11.2 min)
- Parking peaked at 92% at 20:15
- 3 medical incidents: fainting Sect. C-14 (resolved 3m), dehydration Sect. A-08 (resolved 4m), minor injury Sect. E-22 (resolved 5m)
- 2 security events: minor scuffle Gate E (resolved 2m), lost child reunited Concourse 2 (6m)
- AI opened Gate D at 20:32 (-22% wait); added kiosk Food Court East at 18:51 (-14 min); rerouted parking to P4 at 20:10 (-18% congestion)
- Emergency response avg 1m 47s across incidents
- Exit flow completed in 41 minutes post-match

Write as if delivered the morning after the match. Numbers should feel
realistic, specific, and consistent with the telemetry. Tone: confident,
professional, operational — not marketing. Include concrete lessons
learned and forward-looking recommendations for the next match.
`.trim();

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        output: Output.object({ schema: MatchReportSchema }),
        prompt: context,
      });
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("AI did not return a valid report. Please retry.");
      }
      throw error;
    }
  },
);