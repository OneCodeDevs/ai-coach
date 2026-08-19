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
  currentQuestionId: string;
  initialTranscript: TranscriptTurn[];
  initialPassed: boolean;
  isLastQuestion: boolean;
  hasCredentials: boolean;
};

function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-6 shrink-0 text-neon-lime"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function TutorChat({
  kapitelSlug,
  sessionId,
  total,
  questionIndex,
  currentQuestionId,
  initialTranscript,
  initialPassed,
  isLastQuestion,
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
  const [advancing, setAdvancing] = useState(false);
  const [questionPassed, setQuestionPassed] = useState(initialPassed);
  const [lastQuestion, setLastQuestion] = useState(isLastQuestion);

  useEffect(() => {
    if (!answer.trim() || questionPassed) return;
    function onLeave(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [answer, questionPassed]);

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
    if (!activeSession || !answer.trim() || questionPassed) return;
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
        passed?: boolean;
        isLast?: boolean;
        questionIndex?: number;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Auswertung fehlgeschlagen.");
      }
      setTranscript((current) => [
        ...current,
        { role: "user" as const, questionId: currentQuestionId, text: answer },
        {
          role: "tutor" as const,
          questionId: currentQuestionId,
          text: payload.feedback ?? "",
          passed: payload.passed,
        },
      ]);
      setAnswer("");
      if (payload.passed) {
        setQuestionPassed(true);
        if (payload.isLast) {
          setLastQuestion(true);
        }
      }
      if (typeof payload.questionIndex === "number") {
        setIndex(payload.questionIndex);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auswertung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function advance() {
    if (!activeSession) return;
    setAdvancing(true);
    setError(null);
    try {
      const response = await fetch("/api/tutor/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSession }),
      });
      const payload = (await response.json()) as {
        error?: string;
        done?: boolean;
        questionIndex?: number;
        initialTranscript?: TranscriptTurn[];
        total?: number;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Weiterleitung fehlgeschlagen.");
      }
      if (payload.done) {
        router.push(`/kapitel/${kapitelSlug}/tagebuch`);
        router.refresh();
        return;
      }
      setTranscript(payload.initialTranscript ?? []);
      setQuestionPassed(false);
      setAnswer("");
      if (typeof payload.questionIndex === "number") {
        setIndex(payload.questionIndex);
        setLastQuestion(payload.questionIndex >= (payload.total ?? total) - 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Weiterleitung fehlgeschlagen.");
    } finally {
      setAdvancing(false);
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
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-xs uppercase tracking-[0.16em] text-fg-muted">
                  {turn.role === "user" ? "Du" : "Tutor"}
                </p>
                {turn.passed ? (
                  <span
                    className="inline-flex items-center gap-1 font-display text-xs uppercase tracking-[0.12em] text-neon-lime"
                    title="Frage bestanden"
                  >
                    <CheckIcon />
                    Bestanden
                  </span>
                ) : null}
              </div>
              <p className="mt-2 whitespace-pre-wrap">{turn.text}</p>
            </li>
          ))}
        </ol>

        {questionPassed ? (
          <div
            className="mt-6 flex items-start gap-3 rounded-md border border-neon-lime/30 bg-neon-lime/10 p-4"
            role="status"
          >
            <CheckIcon />
            <div>
              <p className="font-display text-neon-lime">Frage bestanden</p>
              <p className="mt-1 text-sm text-fg-muted">
                Deine Antwort war zufriedenstellend. Du kannst{" "}
                {lastQuestion ? "zum Lerntagebuch wechseln" : "zur nächsten Frage gehen"}.
              </p>
              <button
                type="button"
                className="btn btn-primary mt-4 min-h-11"
                onClick={() => void advance()}
                disabled={advancing}
                aria-busy={advancing}
              >
                {advancing
                  ? "Lädt…"
                  : lastQuestion
                    ? "Zum Lerntagebuch"
                    : "Nächste Frage"}
              </button>
            </div>
          </div>
        ) : (
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
              <button
                type="submit"
                className="btn btn-primary min-h-11"
                disabled={busy}
                aria-busy={busy}
              >
                {busy ? "Prüft…" : "Antwort senden"}
              </button>
            </div>
          </form>
        )}

        {error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
