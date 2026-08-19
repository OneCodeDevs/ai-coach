import { and, eq } from "drizzle-orm";
import { USER_ID } from "@/lib/constants";
import { db } from "@/lib/db";
import {
  examSessions,
  journalEntries,
  lessonProgress,
  praxisSessions,
  settings,
  translations,
} from "@/lib/db/schema";

export function getCompletedLessons(userId = USER_ID) {
  return db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId))
    .all()
    .filter((row) => row.completedAt != null);
}

export function isLessonComplete(
  kapitelSlug: string,
  lessonSlug: string,
  userId = USER_ID,
): boolean {
  const row = db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.kapitelSlug, kapitelSlug),
        eq(lessonProgress.lessonSlug, lessonSlug),
      ),
    )
    .get();
  return Boolean(row?.completedAt);
}

export function markLessonComplete(
  kapitelSlug: string,
  lessonSlug: string,
  userId = USER_ID,
) {
  const now = Math.floor(Date.now() / 1000);
  db.insert(lessonProgress)
    .values({
      userId,
      kapitelSlug,
      lessonSlug,
      completedAt: now,
    })
    .onConflictDoUpdate({
      target: [
        lessonProgress.userId,
        lessonProgress.kapitelSlug,
        lessonProgress.lessonSlug,
      ],
      set: { completedAt: now },
    })
    .run();
}

export function getActiveExam(kapitelSlug: string, userId = USER_ID) {
  return db
    .select()
    .from(examSessions)
    .where(
      and(
        eq(examSessions.userId, userId),
        eq(examSessions.kapitelSlug, kapitelSlug),
        eq(examSessions.status, "in_progress"),
      ),
    )
    .get();
}

export function getExamById(id: number, userId = USER_ID) {
  return db
    .select()
    .from(examSessions)
    .where(and(eq(examSessions.id, id), eq(examSessions.userId, userId)))
    .get();
}

export function getJournalEntries(userId = USER_ID) {
  return db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .all()
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getJournalForKapitel(kapitelSlug: string, userId = USER_ID) {
  return db
    .select()
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.userId, userId),
        eq(journalEntries.kapitelSlug, kapitelSlug),
      ),
    )
    .all()
    .sort((a, b) => b.createdAt - a.createdAt)[0];
}

export function getPraxisForKapitel(kapitelSlug: string, userId = USER_ID) {
  return db
    .select()
    .from(praxisSessions)
    .where(
      and(
        eq(praxisSessions.userId, userId),
        eq(praxisSessions.kapitelSlug, kapitelSlug),
      ),
    )
    .all();
}

export function getPraxisSession(id: number, userId = USER_ID) {
  return db
    .select()
    .from(praxisSessions)
    .where(and(eq(praxisSessions.id, id), eq(praxisSessions.userId, userId)))
    .get();
}

export function getActivePraxis(
  kapitelSlug: string,
  aufgabeId: string,
  userId = USER_ID,
) {
  return db
    .select()
    .from(praxisSessions)
    .where(
      and(
        eq(praxisSessions.userId, userId),
        eq(praxisSessions.kapitelSlug, kapitelSlug),
        eq(praxisSessions.aufgabeId, aufgabeId),
      ),
    )
    .get();
}

export function getSetting(key: string): string | undefined {
  return db.select().from(settings).where(eq(settings.key, key)).get()?.value;
}

export function setSetting(key: string, value: string) {
  db.insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value },
    })
    .run();
}

export function getTranslation(hash: string) {
  return db.select().from(translations).where(eq(translations.hash, hash)).get();
}

export function saveTranslation(row: {
  hash: string;
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
}) {
  db.insert(translations)
    .values({
      ...row,
      createdAt: Math.floor(Date.now() / 1000),
    })
    .onConflictDoNothing()
    .run();
}
