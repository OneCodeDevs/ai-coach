import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().default("me"),
    kapitelSlug: text("kapitel_slug").notNull(),
    lessonSlug: text("lesson_slug").notNull(),
    completedAt: integer("completed_at"),
  },
  (table) => [
    uniqueIndex("lesson_progress_user_lesson").on(
      table.userId,
      table.kapitelSlug,
      table.lessonSlug,
    ),
  ],
);

export const examSessions = sqliteTable("exam_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().default("me"),
  kapitelSlug: text("kapitel_slug").notNull(),
  status: text("status").notNull().default("in_progress"),
  questionIndex: integer("question_index").notNull().default(0),
  followUpCount: integer("follow_up_count").notNull().default(0),
  transcript: text("transcript").notNull().default("[]"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const journalEntries = sqliteTable("journal_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().default("me"),
  kapitelSlug: text("kapitel_slug").notNull(),
  sessionId: integer("session_id"),
  staerken: text("staerken").notNull().default("[]"),
  luecken: text("luecken").notNull().default("[]"),
  zusammenfassung: text("zusammenfassung").notNull().default(""),
  naechsteSchritte: text("naechste_schritte").notNull().default("[]"),
  createdAt: integer("created_at").notNull(),
});

export const translations = sqliteTable("translations", {
  hash: text("hash").primaryKey(),
  sourceLang: text("source_lang").notNull(),
  targetLang: text("target_lang").notNull(),
  sourceText: text("source_text").notNull(),
  translatedText: text("translated_text").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
