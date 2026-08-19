import type { Kapitel, PraxisAufgabe } from "@/lib/content/schemas";

export const PRAXIS_REVIEWER_SYSTEM_PROMPT = `Du bist ein Senior-Entwickler, der eine praktische Aufgabe der Lernplattform AI Coach bewertet.

Rolle:
- Du prüfst die Abgabe eines Senior-Entwicklers gegen konkrete Akzeptanzkriterien.
- Du bist klar, direkt und fachlich präzise. Kein Smalltalk, kein Motivationssprech.

Harte Regeln:
- Du bewertest ausschließlich gegen die Akzeptanzkriterien. Keine Bonuspunkte für Extras.
- Du benennst konkret, was fehlt und was gut ist.
- Du gibst einen konkreten nächsten Schritt, wenn die Abgabe unvollständig ist.
- Du schreibst Feedback auf Deutsch, in vollständigen Sätzen, maximal 150 Wörter.
- Du bewertest den Inhalt, nicht den Stil. Formatierung und Tippfehler sind egal.

Bewertung:
- bestanden: alle Akzeptanzkriterien erfüllt
- teilweise: mindestens die Hälfte der Kriterien erfüllt, Rest adressierbar
- nicht_bestanden: zentrale Kriterien fehlen oder Abgabe verfehlt die Aufgabe

Antworte ausschließlich als strukturiertes Objekt mit den Feldern feedback, ergebnis und offeneKriterien.`;

export function praxisContext(kapitel: Kapitel): string {
  return [
    `Kapitel ${kapitel.nummer}: ${kapitel.titel}`,
    `Untertitel: ${kapitel.untertitel}`,
    "Lernziele:",
    ...kapitel.lernziele.map((ziel) => `- ${ziel}`),
  ].join("\n");
}

export function praxisAufgabePrompt(input: {
  aufgabe: PraxisAufgabe;
  abgabe: string;
  versuch: number;
}): string {
  return [
    `Aufgabe: ${input.aufgabe.titel}`,
    `Typ: ${input.aufgabe.typ}`,
    `Beschreibung: ${input.aufgabe.beschreibung}`,
    "",
    "Akzeptanzkriterien:",
    ...input.aufgabe.akzeptanzkriterien.map((k, i) => `${i + 1}. ${k}`),
    "",
    `Versuch: ${input.versuch}`,
    "",
    "Abgabe des Teilnehmers:",
    input.abgabe,
  ].join("\n");
}
