"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { praxisSessions } from "@/lib/db/schema";
import { getKapitel } from "@/lib/content/loader";
import { getActivePraxis } from "@/lib/db/queries";
import { evaluatePraxis } from "@/lib/praxis/evaluate";
import { USER_ID } from "@/lib/constants";

function now() {
  return Math.floor(Date.now() / 1000);
}

export async function startPraxis(kapitelSlug: string, aufgabeId: string) {
  const kapitel = await getKapitel(kapitelSlug);
  if (!kapitel || kapitel.error) {
    throw new Error("Kapitel nicht gefunden.");
  }

  const aufgabe = kapitel.praxis.find((a) => a.id === aufgabeId);
  if (!aufgabe) {
    throw new Error("Aufgabe nicht gefunden.");
  }

  const existing = getActivePraxis(kapitelSlug, aufgabeId);
  if (existing) {
    return existing;
  }

  const timestamp = now();
  const result = db
    .insert(praxisSessions)
    .values({
      userId: USER_ID,
      kapitelSlug,
      aufgabeId,
      status: "in_progress",
      abgabeTyp: aufgabe.abgabe === "file-upload" || aufgabe.abgabe === "screenshot" ? "file" : aufgabe.abgabe === "url" ? "url" : "text",
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning()
    .get();

  revalidatePath(`/kapitel/${kapitelSlug}/praxis`);
  return result;
}

export async function submitPraxis(sessionId: number, abgabe: string) {
  const session = db
    .select()
    .from(praxisSessions)
    .where(eq(praxisSessions.id, sessionId))
    .get();

  if (!session) {
    throw new Error("Sitzung nicht gefunden.");
  }
  if (session.status === "bestanden") {
    throw new Error("Diese Aufgabe ist bereits bestanden.");
  }

  const kapitel = await getKapitel(session.kapitelSlug);
  if (!kapitel) {
    throw new Error("Kapitel nicht gefunden.");
  }

  const aufgabe = kapitel.praxis.find((a) => a.id === session.aufgabeId);
  if (!aufgabe) {
    throw new Error("Aufgabe nicht gefunden.");
  }

  const versuch = session.versuche + 1;
  const evaluation = await evaluatePraxis({
    kapitel,
    aufgabe,
    abgabe,
    versuch,
  });

  db.update(praxisSessions)
    .set({
      status: evaluation.ergebnis,
      abgabe,
      feedback: evaluation.feedback,
      versuche: versuch,
      updatedAt: now(),
    })
    .where(eq(praxisSessions.id, session.id))
    .run();

  revalidatePath(`/kapitel/${session.kapitelSlug}/praxis`);

  return {
    feedback: evaluation.feedback,
    ergebnis: evaluation.ergebnis,
    offeneKriterien: evaluation.offeneKriterien,
    versuch,
  };
}

export async function resetPraxis(sessionId: number) {
  const session = db
    .select()
    .from(praxisSessions)
    .where(eq(praxisSessions.id, sessionId))
    .get();

  if (!session) {
    throw new Error("Sitzung nicht gefunden.");
  }

  db.update(praxisSessions)
    .set({
      status: "in_progress",
      abgabe: "",
      feedback: "",
      updatedAt: now(),
    })
    .where(eq(praxisSessions.id, session.id))
    .run();

  revalidatePath(`/kapitel/${session.kapitelSlug}/praxis`);
}
