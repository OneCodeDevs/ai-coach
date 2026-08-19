import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/provider";
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

function systemPrompt(content: string): string {
  // Important: The AI SDK rejects `role: "system"` inside the `messages` array.
  // We therefore pass system instructions via the top-level `system` option.
  return content;
}

export async function evaluatePraxis(input: {
  kapitel: Kapitel;
  aufgabe: PraxisAufgabe;
  abgabe: string;
  versuch: number;
}): Promise<PraxisEvaluation> {
  const system = systemPrompt(
    [PRAXIS_REVIEWER_SYSTEM_PROMPT, praxisContext(input.kapitel)].join("\n\n"),
  );

  const result = await generateText({
    model: getModel("default"),
    output: Output.object({ schema: praxisResultSchema }),
    system,
    messages: [{ role: "user", content: praxisAufgabePrompt(input) }],
  });

  if (!result.output) {
    throw new Error("Praxis-Bewertung ohne Ergebnis.");
  }
  return result.output;
}
