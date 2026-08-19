import { z } from "zod";

export const examQuestionSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(1),
  frage: z.string().min(1),
  erwartet: z.array(z.string().min(1)).min(1),
});

export const praxisAufgabeSchema = z.object({
  id: z.string().min(1),
  titel: z.string().min(1),
  typ: z.enum(["code", "repo-audit", "config", "freestyle"]),
  schwierigkeit: z.number().int().min(1).max(3),
  zeitMinuten: z.number().int().positive(),
  beschreibung: z.string().min(1),
  akzeptanzkriterien: z.array(z.string().min(1)).min(1),
  abgabe: z.enum(["text", "file-upload", "screenshot", "url"]),
  hinweis: z.string().optional(),
});

export const certificateSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  anbieter: z.string().min(1),
  hinweis: z.string().optional(),
});

export const kapitelMetaSchema = z.object({
  slug: z.string().min(1),
  nummer: z.number().int().positive(),
  titel: z.string().min(1),
  untertitel: z.string().min(1),
  dauerMinuten: z.number().int().positive(),
  lernziele: z.array(z.string().min(1)).min(1),
  exam: z.array(examQuestionSchema).min(1),
  praxis: z.array(praxisAufgabeSchema).min(1),
  zertifikate: z.array(certificateSchema).optional().default([]),
  artefakt: z.string().optional(),
});

export const lessonFrontmatterSchema = z.object({
  titel: z.string().min(1),
  dauerMinuten: z.number().int().positive(),
  zusammenfassung: z.string().min(1),
  reihenfolge: z.number().int().positive(),
});

export type ExamQuestion = z.infer<typeof examQuestionSchema>;
export type PraxisAufgabe = z.infer<typeof praxisAufgabeSchema>;
export type Certificate = z.infer<typeof certificateSchema>;
export type KapitelMeta = z.infer<typeof kapitelMetaSchema>;
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;

export type Lesson = LessonFrontmatter & {
  slug: string;
  body: string;
  filePath: string;
};

export type Kapitel = KapitelMeta & {
  dir: string;
  lessons: Lesson[];
  error?: string;
};
