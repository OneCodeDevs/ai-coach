import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";
import { getModel, isAnthropicProvider } from "@/lib/ai/provider";
import type { Kapitel, PraxisAufgabe } from "@/lib/content/schemas";
import {
  praxisContext,
  praxisAufgabePrompt,
  PRAXIS_REVIEWER_SYSTEM_PROMPT,
} from "./prompts";

const praxisResultSchema = z.object({
  feedback: z.string(),
  ergebnis: z.enum(["bestanden", "teilweise", "nicht_bestanden"]),
  offeneKriterien: z.array(z.string()),
});

export type PraxisEvaluation = z.infer<typeof praxisResultSchema>;

function cachedSystem(content: string) {
  if (!isAnthropicProvider()) {
    return { role: "system" as const, content };
  }
  return {
    role: "system" as const,
    content,
    providerOptions: {
      anthropic: { cacheControl: { type: "ephemeral" as const } },
    },
  };
}

export async function evaluatePraxis(input: {
  kapitel: Kapitel;
  aufgabe: PraxisAufgabe;
  abgabe: string;
  versuch: number;
}): Promise<PraxisEvaluation> {
  const result = await generateText({
    model: getModel("default"),
    output: Output.object({ schema: praxisResultSchema }),
    messages: [
      cachedSystem(PRAXIS_REVIEWER_SYSTEM_PROMPT),
      cachedSystem(praxisContext(input.kapitel)),
      {
        role: "user",
        content: praxisAufgabePrompt(input),
      },
    ],
  });

  if (!result.output) {
    throw new Error("Praxis-Bewertung ohne Ergebnis.");
  }
  return result.output;
}
