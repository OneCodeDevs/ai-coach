import Link from "next/link";
import type { JournalInsight, NextStep } from "@/lib/tutor/types";

type JournalViewProps = {
  titel: string;
  zusammenfassung: string;
  staerken: JournalInsight[];
  luecken: JournalInsight[];
  naechsteSchritte: NextStep[];
};

export function JournalView({
  titel,
  zusammenfassung,
  staerken,
  luecken,
  naechsteSchritte,
}: JournalViewProps) {
  return (
    <article className="surface p-5 md:p-6">
      <h2 className="font-display text-2xl">{titel}</h2>
      <p className="mt-3 max-w-[68ch]">{zusammenfassung}</p>

      <section className="mt-8">
        <h3 className="font-display text-lg text-neon-lime">Stärken</h3>
        {staerken.length === 0 ? (
          <p className="mt-2 text-fg-muted">Noch keine Stärken notiert.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {staerken.map((item) => (
              <li key={`${item.thema}-${item.text}`} className="border-l-2 border-neon-lime pl-3">
                <p className="font-display text-sm text-neon-lime">{item.thema}</p>
                <p className="mt-1">{item.text}</p>
                {item.zitat ? (
                  <p className="mt-2 font-mono text-sm text-fg-muted">„{item.zitat}“</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h3 className="font-display text-lg text-neon-magenta">Mögliche Lücken</h3>
        {luecken.length === 0 ? (
          <p className="mt-2 text-fg-muted">Keine offenen Lücken in diesem Durchgang.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {luecken.map((item) => (
              <li
                key={`${item.thema}-${item.text}`}
                className="border-l-2 border-neon-magenta pl-3"
              >
                <p className="font-display text-sm text-neon-magenta">{item.thema}</p>
                <p className="mt-1">{item.text}</p>
                {item.zitat ? (
                  <p className="mt-2 font-mono text-sm text-fg-muted">„{item.zitat}“</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h3 className="font-display text-lg">Nächste Schritte</h3>
        <ul className="mt-3 grid gap-2">
          {naechsteSchritte.map((step) => (
            <li key={step.href}>
              <Link href={step.href} className="inline-flex min-h-11 items-center">
                {step.titel}
              </Link>
              <p className="text-sm text-fg-muted">{step.grund}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
