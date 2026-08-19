"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PraxisAufgabe } from "@/lib/content/schemas";
import { startPraxis } from "@/lib/actions/praxis";

type PraxisSession = {
  id: number;
  status: string;
  feedback: string;
  versuche: number;
  abgabe: string;
};

type PraxisCardProps = {
  aufgabe: PraxisAufgabe;
  kapitelSlug: string;
  session: PraxisSession | null;
  hasCredentials: boolean;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  bestanden: { label: "Bestanden", className: "text-neon-lime" },
  teilweise: { label: "Teilweise", className: "text-amber-400" },
  nicht_bestanden: { label: "Nicht bestanden", className: "text-danger" },
  in_progress: { label: "In Arbeit", className: "text-neon-cyan" },
};

const TYP_LABELS: Record<string, string> = {
  code: "Code",
  "repo-audit": "Repo-Audit",
  config: "Config",
  freestyle: "Freestyle",
};

const SCHWIERIGKEIT_LABELS = ["", "Einstieg", "Fortgeschritten", "Anspruchsvoll"];

export function PraxisCard({
  aufgabe,
  kapitelSlug,
  session,
  hasCredentials,
}: PraxisCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState(session?.abgabe ?? "");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(session?.feedback ?? "");
  const [result, setResult] = useState(session?.status ?? "");
  const [activeSession, setActiveSession] = useState<number | null>(
    session?.id ?? null,
  );
  const [openCriteria, setOpenCriteria] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const status = STATUS_LABELS[result] ?? null;

  async function handleStart() {
    setError(null);
    startTransition(async () => {
      try {
        const s = await startPraxis(kapitelSlug, aufgabe.id);
        setActiveSession(s.id);
        setExpanded(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Start fehlgeschlagen.");
      }
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!activeSession || !answer.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/praxis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSession, abgabe: answer }),
      });
      const payload = (await response.json()) as {
        error?: string;
        feedback?: string;
        ergebnis?: string;
        offeneKriterien?: string[];
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Bewertung fehlgeschlagen.");
      }
      setFeedback(payload.feedback ?? "");
      setResult(payload.ergebnis ?? "");
      setOpenCriteria(payload.offeneKriterien ?? []);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bewertung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface overflow-hidden">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 p-4 text-left hover:bg-bg-elevated/50"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-fg-muted">
              {TYP_LABELS[aufgabe.typ] ?? aufgabe.typ}
            </span>
            <span className="font-mono text-xs text-fg-muted">·</span>
            <span className="font-mono text-xs text-fg-muted">
              {SCHWIERIGKEIT_LABELS[aufgabe.schwierigkeit]}
            </span>
            <span className="font-mono text-xs text-fg-muted">·</span>
            <span className="font-mono text-xs text-fg-muted">
              {aufgabe.zeitMinuten} min
            </span>
            {status ? (
              <>
                <span className="font-mono text-xs text-fg-muted">·</span>
                <span className={`font-mono text-xs ${status.className}`}>
                  {status.label}
                </span>
              </>
            ) : null}
          </div>
          <p className="mt-1 font-display text-lg">{aufgabe.titel}</p>
        </div>
        <span className="shrink-0 pt-1 text-fg-muted" aria-hidden>
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded ? (
        <div className="border-t border-border-subtle p-4">
          <div className="max-w-[68ch] whitespace-pre-wrap text-sm text-fg-muted">
            {aufgabe.beschreibung}
          </div>

          {aufgabe.hinweis ? (
            <p className="mt-3 text-sm text-neon-cyan">{aufgabe.hinweis}</p>
          ) : null}

          <div className="mt-4">
            <p className="font-display text-sm">Akzeptanzkriterien</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-muted">
              {aufgabe.akzeptanzkriterien.map((k) => (
                <li
                  key={k}
                  className={
                    openCriteria.includes(k) ? "text-amber-400" : ""
                  }
                >
                  {k}
                </li>
              ))}
            </ul>
          </div>

          {!hasCredentials ? (
            <div className="mt-4 rounded-md border border-border-subtle bg-bg-elevated p-3">
              <p className="text-sm text-fg-muted">
                Kein Modell konfiguriert. Trage einen API-Key in <code>.env</code> ein.
              </p>
            </div>
          ) : !activeSession ? (
            <button
              type="button"
              className="btn btn-primary mt-4"
              onClick={() => void handleStart()}
              disabled={pending}
            >
              {pending ? "Startet…" : "Aufgabe starten"}
            </button>
          ) : (
            <form className="mt-4" onSubmit={(event) => void handleSubmit(event)}>
              <label
                htmlFor={`praxis-${aufgabe.id}`}
                className="font-display text-sm"
              >
                Deine Abgabe
              </label>
              <textarea
                id={`praxis-${aufgabe.id}`}
                name="abgabe"
                required
                rows={8}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                className="mt-2 w-full rounded-md border border-border-subtle bg-bg-base p-3 text-sm text-fg"
                disabled={busy || result === "bestanden"}
                autoComplete="off"
                placeholder="Ergebnisse, Code, Dokumentation…"
              />
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={busy || result === "bestanden"}
                  aria-busy={busy}
                >
                  {busy ? "Prüft…" : "Abgabe einreichen"}
                </button>
              </div>
            </form>
          )}

          {feedback ? (
            <div className="mt-4 rounded-md border border-neon-cyan/25 bg-bg-panel p-4">
              <p className="font-display text-xs uppercase tracking-[0.16em] text-fg-muted">
                Feedback
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{feedback}</p>
            </div>
          ) : null}

          {error ? (
            <p className="mt-3 text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
