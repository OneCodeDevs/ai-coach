"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { beginExam } from "@/lib/actions/exam";
import type { TranscriptTurn } from "@/lib/tutor/types";

type TutorChatProps = {
  kapitelSlug: string;
  sessionId: number | null;
  total: number;
  questionIndex: number;
  initialTranscript: TranscriptTurn[];
  hasCredentials: boolean;
};

export function TutorChat({
  kapitelSlug,
  sessionId,
  total,
  questionIndex,
  initialTranscript,
  hasCredentials,
}: TutorChatProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [index, setIndex] = useState(questionIndex);
  const [activeSession, setActiveSession] = useState(sessionId);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!answer.trim()) return;
    function onLeave(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [answer]);

  if (!hasCredentials) {
    return (
      <div className="surface p-5" role="alert">
        <h2 className="font-display text-xl">Kein Modell konfiguriert</h2>
        <p className="mt-2 text-fg-muted">
          Der Tutor braucht einen API-Key. Trage in der Datei <code>.env</code> zum
          Beispiel <code>ANTHROPIC_API_KEY</code> ein und starte den Container neu.
        </p>
      </div>
    );
  }

  async function start() {
    setError(null);
    startTransition(async () => {
      try {
        const id = await beginExam(kapitelSlug);
        setActiveSession(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Start fehlgeschlagen.");
      }
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!activeSession || !answer.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSession, answer }),
      });
      const payload = (await response.json()) as {
        error?: string;
        feedback?: string;
        nextQuestionText?: string | null;
        done?: boolean;
        questionIndex?: number;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Auswertung fehlgeschlagen.");
      }
      setTranscript((current) => {
        const next = [
          ...current,
          { role: "user" as const, questionId: "current", text: answer },
          {
            role: "tutor" as const,
            questionId: "current",
            text: payload.feedback ?? "",
          },
        ];
        if (payload.nextQuestionText) {
          next.push({
            role: "tutor",
            questionId: "next",
            text: payload.nextQuestionText,
          });
        }
        return next;
      });
      setAnswer("");
      if (typeof payload.questionIndex === "number") {
        setIndex(payload.questionIndex);
      }
      if (payload.done) {
        router.push(`/kapitel/${kapitelSlug}/tagebuch`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auswertung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  if (!activeSession) {
    return (
      <div className="surface p-5">
        <h2 className="font-display text-xl">Kapiteltest</h2>
        <p className="mt-2 max-w-[62ch] text-fg-muted">
          Der Tutor stellt die Fragen nacheinander. Du antwortest in eigenen Worten.
          Es gibt keine Note, nur Feedback und am Ende ein Lerntagebuch.
        </p>
        <button
          type="button"
          className="btn btn-primary mt-5"
          onClick={() => void start()}
          disabled={pending}
        >
          {pending ? "Startet…" : "Test starten"}
        </button>
        {error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="crt-panel">
      <div className="crt-scan" aria-hidden />
      <div className="relative z-10 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-neon-cyan">
            Tutor-Kanal
          </p>
          <p className="font-mono text-sm text-fg-muted" aria-live="polite">
            Frage {Math.min(index + 1, total)} von {total}
          </p>
        </div>
        <div
          className="mt-4 h-1 overflow-hidden rounded-full bg-bg-elevated"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={Math.min(index + 1, total)}
        >
          <span
            className="block h-full bg-neon-cyan"
            style={{ width: `${(Math.min(index + 1, total) / total) * 100}%` }}
          />
        </div>
        <ol className="mt-6 space-y-4">
          {transcript.map((turn, turnIndex) => (
            <li
              key={`${turn.role}-${turnIndex}`}
              className={
                turn.role === "user"
                  ? "ml-4 rounded-md border border-border-subtle bg-bg-elevated p-3"
                  : "mr-4 rounded-md border border-neon-cyan/25 bg-bg-panel p-3"
              }
            >
              <p className="font-display text-xs uppercase tracking-[0.16em] text-fg-muted">
                {turn.role === "user" ? "Du" : "Tutor"}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{turn.text}</p>
            </li>
          ))}
        </ol>
        <form className="mt-6" onSubmit={(event) => void submit(event)}>
          <label htmlFor="tutor-answer" className="font-display text-sm">
            Deine Antwort
          </label>
          <textarea
            id="tutor-answer"
            name="answer"
            required
            rows={5}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className="mt-2 w-full rounded-md border border-border-subtle bg-bg-base p-3 text-fg"
            disabled={busy}
            autoComplete="off"
            placeholder="In eigenen Worten, Fachbegriffe erlaubt…"
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>
              {busy ? "Prüft…" : "Antwort senden"}
            </button>
          </div>
          {error ? (
            <p className="mt-3 text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
