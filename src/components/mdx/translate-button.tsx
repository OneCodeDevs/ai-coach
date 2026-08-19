"use client";

import { useState } from "react";
import { Languages } from "lucide-react";

type TranslateButtonProps = {
  text: string;
  sourceLang?: string;
};

export function TranslateButton({ text, sourceLang = "en" }: TranslateButtonProps) {
  const [translated, setTranslated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const shown = translated ?? text;
  const isTranslated = Boolean(translated);

  async function toggle() {
    if (translated) {
      setTranslated(null);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sourceLang }),
      });
      const payload = (await response.json()) as { translated?: string; error?: string };
      if (!response.ok || !payload.translated) {
        throw new Error(payload.error ?? "Übersetzung fehlgeschlagen.");
      }
      setTranslated(payload.translated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Übersetzung fehlgeschlagen.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-3">
      <p className="whitespace-pre-wrap">{shown}</p>
      <button
        type="button"
        className="btn btn-ghost mt-2"
        onClick={() => void toggle()}
        disabled={pending}
        aria-pressed={isTranslated}
      >
        <Languages aria-hidden={true} size={18} />
        {pending ? "Übersetze…" : isTranslated ? "Original" : "Übersetzen"}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
