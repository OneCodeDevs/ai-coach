"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="surface p-6">
      <h1 className="font-display text-2xl">Etwas ist schiefgelaufen</h1>
      <p className="mt-3 max-w-[62ch] text-fg-muted">
        {error.message || "Die Seite konnte nicht geladen werden."}
      </p>
      <button type="button" className="btn btn-primary mt-5" onClick={() => reset()}>
        Erneut versuchen
      </button>
    </div>
  );
}
