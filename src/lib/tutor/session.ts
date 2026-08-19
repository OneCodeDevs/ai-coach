import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { examSessions, journalEntries } from "@/lib/db/schema";
import { getExamById } from "@/lib/db/queries";
import { getKapitel } from "@/lib/content/loader";
import { USER_ID } from "@/lib/constants";
import { evaluateAnswer, writeJournal } from "./evaluate";
import { currentQuestion, shouldAdvance } from "./types";
import type { TranscriptTurn } from "./types";

function now() {
  return Math.floor(Date.now() / 1000);
}

function parseTranscript(raw: string): TranscriptTurn[] {
  try {
    return JSON.parse(raw) as TranscriptTurn[];
  } catch {
    return [];
  }
}

export async function startExam(kapitelSlug: string, userId = USER_ID) {
  const kapitel = await getKapitel(kapitelSlug);
  if (!kapitel || kapitel.error) {
    throw new Error("Kapitel nicht gefunden.");
  }

  const existing = db
    .select()
    .from(examSessions)
    .where(eq(examSessions.kapitelSlug, kapitelSlug))
    .all()
    .find((row) => row.userId === userId && row.status === "in_progress");

  if (existing) {
    return existing;
  }

  const timestamp = now();
  const first = kapitel.exam[0];
  const transcript: TranscriptTurn[] = [
    {
      role: "tutor",
      questionId: first.id,
      text: first.frage,
    },
  ];

  const result = db
    .insert(examSessions)
    .values({
      userId,
      kapitelSlug,
      status: "in_progress",
      questionIndex: 0,
      followUpCount: 0,
      transcript: JSON.stringify(transcript),
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning()
    .get();

  return result;
}

export async function submitAnswer(sessionId: number, answer: string, userId = USER_ID) {
  const session = getExamById(sessionId, userId);
  if (!session) {
    throw new Error("Sitzung nicht gefunden.");
  }
  if (session.status !== "in_progress") {
    throw new Error("Diese Prüfung ist bereits abgeschlossen.");
  }

  const kapitel = await getKapitel(session.kapitelSlug);
  if (!kapitel) {
    throw new Error("Kapitel nicht gefunden.");
  }

  const question = currentQuestion(kapitel.exam, session.questionIndex);
  if (!question) {
    throw new Error("Keine offene Frage mehr.");
  }

  const transcript = parseTranscript(session.transcript);
  const evaluation = await evaluateAnswer({
    kapitel,
    frage: question.frage,
    topic: question.topic,
    erwartet: question.erwartet,
    followUpCount: session.followUpCount,
    answer,
    transcript,
  });

  const userTurn: TranscriptTurn = {
    role: "user",
    questionId: question.id,
    text: answer,
    coverage: evaluation.abdeckung,
    followUp: session.followUpCount > 0,
  };
  const tutorTurn: TranscriptTurn = {
    role: "tutor",
    questionId: question.id,
    text: evaluation.feedback,
    coverage: evaluation.abdeckung,
    followUp: evaluation.nachfrage,
  };

  const nextTranscript = [...transcript, userTurn, tutorTurn];
  let questionIndex = session.questionIndex;
  let followUpCount = session.followUpCount;
  let status = session.status;
  let done = false;
  let followUpQuestion: string | null = null;
  let nextQuestionText: string | null = null;

  if (shouldAdvance(evaluation, followUpCount)) {
    questionIndex += 1;
    followUpCount = 0;
    const upcoming = currentQuestion(kapitel.exam, questionIndex);
    if (!upcoming) {
      status = "completed";
      done = true;
    } else {
      nextQuestionText = upcoming.frage;
      nextTranscript.push({
        role: "tutor",
        questionId: upcoming.id,
        text: upcoming.frage,
      });
    }
  } else {
    followUpCount += 1;
    followUpQuestion = evaluation.feedback;
  }

  db.update(examSessions)
    .set({
      questionIndex,
      followUpCount,
      status,
      transcript: JSON.stringify(nextTranscript),
      updatedAt: now(),
    })
    .where(eq(examSessions.id, session.id))
    .run();

  let journalId: number | null = null;
  if (done) {
    const payload = await writeJournal({
      kapitel,
      transcript: nextTranscript,
    });
    const inserted = db
      .insert(journalEntries)
      .values({
        userId,
        kapitelSlug: kapitel.slug,
        sessionId: session.id,
        staerken: JSON.stringify(payload.staerken),
        luecken: JSON.stringify(payload.luecken),
        zusammenfassung: payload.zusammenfassung,
        naechsteSchritte: JSON.stringify(payload.naechsteSchritte),
        createdAt: now(),
      })
      .returning()
      .get();
    journalId = inserted.id;
  }

  return {
    feedback: evaluation.feedback,
    abdeckung: evaluation.abdeckung,
    questionIndex,
    total: kapitel.exam.length,
    done,
    followUpQuestion,
    nextQuestionText,
    journalId,
  };
}
