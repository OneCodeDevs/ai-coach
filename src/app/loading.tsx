export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" aria-live="polite" aria-busy="true">
      <div className="h-10 w-48 rounded bg-bg-elevated" />
      <div className="h-24 w-full max-w-[68ch] rounded bg-bg-elevated" />
      <span className="sr-only">Lade Inhalt…</span>
    </div>
  );
}
