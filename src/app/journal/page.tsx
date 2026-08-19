import type { Metadata } from "next";
import { listKapitel } from "@/lib/content/loader";
import { getJournalEntries } from "@/lib/db/queries";
import { JournalView } from "@/components/journal/journal-view";
import type { JournalInsight, NextStep } from "@/lib/tutor/types";

export const metadata: Metadata = {
  title: "Lerntagebuch",
};

export default async function JournalPage() {
  const [kapitel, entries] = await Promise.all([
    listKapitel(),
    Promise.resolve(getJournalEntries()),
  ]);
  const titelBySlug = new Map(kapitel.map((item) => [item.slug, item.titel]));

  const gapCount = new Map<string, number>();
  for (const entry of entries) {
    const luecken = JSON.parse(entry.luecken) as JournalInsight[];
    for (const gap of luecken) {
      gapCount.set(gap.thema, (gapCount.get(gap.thema) ?? 0) + 1);
    }
  }
  const recurring = [...gapCount.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl">Lerntagebuch</h1>
      <p className="mt-2 max-w-[62ch] text-fg-muted">
        Keine Noten. Stärken und Lücken pro Kapitel, plus Themen die mehrfach
        auftauchen.
      </p>

      {recurring.length > 0 ? (
        <section className="surface mt-8 p-5">
          <h2 className="font-display text-xl">Wiederkehrende Lücken</h2>
          <ul className="mt-3 space-y-2">
            {recurring.map(([thema, count]) => (
              <li key={thema} className="font-mono text-sm">
                <span className="text-neon-magenta">{thema}</span>
                <span className="text-fg-muted"> · {count} Kapitel</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {entries.length === 0 ? (
        <p className="surface mt-8 p-5 text-fg-muted">
          Noch keine Einträge. Schließ einen Kapiteltest ab, dann erscheint hier die
          Auswertung.
        </p>
      ) : (
        <div className="mt-8 grid gap-6">
          {entries.map((entry) => (
            <JournalView
              key={entry.id}
              titel={titelBySlug.get(entry.kapitelSlug) ?? entry.kapitelSlug}
              zusammenfassung={entry.zusammenfassung}
              staerken={JSON.parse(entry.staerken) as JournalInsight[]}
              luecken={JSON.parse(entry.luecken) as JournalInsight[]}
              naechsteSchritte={JSON.parse(entry.naechsteSchritte) as NextStep[]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
