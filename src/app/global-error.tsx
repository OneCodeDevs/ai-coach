"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body style={{ background: "#0A0612", color: "#EDE7F5", fontFamily: "sans-serif" }}>
        <main style={{ padding: "2rem", maxWidth: "40rem" }}>
          <h1>AI Coach ist abgestürzt</h1>
          <p>Bitte lade die Seite neu. Wenn der Fehler bleibt, prüfe die Logs des Containers.</p>
          <button type="button" onClick={() => reset()}>
            Erneut versuchen
          </button>
        </main>
      </body>
    </html>
  );
}
