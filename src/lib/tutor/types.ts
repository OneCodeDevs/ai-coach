import type { ExamQuestion } from "@/lib/content/schemas";

export type TranscriptTurn = {
  role: "tutor" | "user";
  questionId: string;
  text: string;
  coverage?: number;
  followUp?: boolean;
};

export type Evaluation = {
  feedback: string;
  abdeckung: number;
  nachfrage: boolean;
};

export type JournalInsight = {
  thema: string;
  text: string;
  zitat?: string;
};

export type NextStep = {
  titel: string;
  grund: string;
  href: string;
};

export type JournalPayload = {
  staerken: JournalInsight[];
  luecken: JournalInsight[];
  zusammenfassung: string;
  naechsteSchritte: NextStep[];
};

export function currentQuestion(
  exam: ExamQuestion[],
  questionIndex: number,
): ExamQuestion | undefined {
  return exam[questionIndex];
}

export function shouldAdvance(evaluation: Evaluation, followUpCount: number): boolean {
  if (evaluation.abdeckung >= 0.7) return true;
  if (!evaluation.nachfrage) return true;
  return followUpCount >= 2;
}
