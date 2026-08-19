import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";
import { getModel, isAnthropicProvider } from "@/lib/ai/provider";
import type { Kapitel } from "@/lib/content/schemas";
import {
  chapterContext,
  JOURNAL_SYSTEM_PROMPT,
  questionPrompt,
  TUTOR_SYSTEM_PROMPT,
} from "./prompts";
import type { Evaluation, JournalPayload, TranscriptTurn } from "./types";

const evaluationSchema = z.object({
  feedback: z.string(),
  abdeckung: z.number().min(0).max(1),
  nachfrage: z.boolean(),
});

const journalSchema = z.object({
  staerken: z.array(
    z.object({
      thema: z.string(),
      text: z.string(),
      zitat: z.string().optional(),
    }),
  ),
  luecken: z.array(
    z.object({
      thema: z.string(),
      text: z.string(),
      zitat: z.string().optional(),
    }),
  ),
  zusammenfassung: z.string(),
  naechsteSchritte: z.array(
    z.object({
      titel: z.string(),
      grund: z.string(),
      href: z.string(),
    }),
  ),
});

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

export async function evaluateAnswer(input: {
  kapitel: Kapitel;
  frage: string;
  topic: string;
  erwartet: string[];
  followUpCount: number;
  answer: string;
  transcript: TranscriptTurn[];
}): Promise<Evaluation> {
  const result = await generateText({
    model: getModel("default"),
    output: Output.object({ schema: evaluationSchema }),
    messages: [
      cachedSystem(TUTOR_SYSTEM_PROMPT),
      cachedSystem(chapterContext(input.kapitel)),
      {
        role: "user",
        content: questionPrompt(input),
      },
    ],
  });

  if (!result.output) {
    throw new Error("Tutor-Auswertung ohne Ergebnis.");
  }
  return result.output;
}

export async function writeJournal(input: {
  kapitel: Kapitel;
  transcript: TranscriptTurn[];
}): Promise<JournalPayload> {
  const lessonLinks = input.kapitel.lessons
    .map(
      (lesson) =>
        `- ${lesson.titel} → /kapitel/${input.kapitel.slug}/${lesson.slug}`,
    )
    .join("\n");

  const transcriptText = input.transcript
    .map((turn) => {
      const tag = turn.role === "tutor" ? "Tutor" : "Teilnehmer";
      return `[${tag} | ${turn.questionId}${turn.followUp ? " | Nachfrage" : ""}]\n${turn.text}`;
    })
    .join("\n\n");

  const result = await generateText({
    model: getModel("eval"),
    output: Output.object({ schema: journalSchema }),
    messages: [
      cachedSystem(JOURNAL_SYSTEM_PROMPT),
      cachedSystem(chapterContext(input.kapitel)),
      {
        role: "user",
        content: [
          "Verfügbare Lerneinheiten für nächste Schritte:",
          lessonLinks,
          "",
          "Vollständiges Transkript:",
          transcriptText,
        ].join("\n"),
      },
    ],
  });

  if (!result.output) {
    throw new Error("Lerntagebuch ohne Ergebnis.");
  }
  return result.output;
}
