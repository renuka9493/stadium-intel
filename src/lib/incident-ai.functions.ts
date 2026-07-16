import { createServerFn } from "@tanstack/react-start";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const IncidentInput = z.object({
  type: z.string().min(1).max(80),
  location: z.string().min(1).max(120),
  description: z.string().min(1).max(1000),
});

const AnalysisSchema = z.object({
  severity: z.enum(["low", "medium", "high", "critical"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  suggestedResponse: z.string(),
  estimatedResolutionMinutes: z.number(),
});

export type IncidentAnalysis = z.infer<typeof AnalysisSchema>;

export const analyzeIncident = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IncidentInput.parse(input))
  .handler(async ({ data }): Promise<IncidentAnalysis> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const system = `You are the Operations AI for Stadium Brain, an AI command
center for a FIFA World Cup stadium. A fan just submitted an incident report.
Classify it for the operations team.

Rules:
- severity: low | medium | high | critical. Critical = imminent risk to life or mass safety.
- priority: low | medium | high | urgent. Urgent means dispatch within 60 seconds.
- suggestedResponse: one clear operational sentence (which team to send, what to do first).
- estimatedResolutionMinutes: realistic integer number of minutes to full resolution.
Ground your answer in the fan's report. Be conservative on medical / fire / security reports.`;

    const prompt = `Incident Type: ${data.type}
Location: ${data.location}
Description: ${data.description}`;

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system,
        prompt,
        output: Output.object({ schema: AnalysisSchema }),
      });
      return {
        ...output,
        estimatedResolutionMinutes: Math.max(1, Math.round(output.estimatedResolutionMinutes)),
      };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return {
          severity: "medium",
          priority: "medium",
          suggestedResponse: "Dispatch nearest available team and assess on site.",
          estimatedResolutionMinutes: 10,
        };
      }
      throw error;
    }
  });
