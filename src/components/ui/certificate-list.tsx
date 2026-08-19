import { ExternalLink } from "lucide-react";
import type { Certificate } from "@/lib/content/schemas";

type CertificateListProps = {
  zertifikate: Certificate[];
  artefakt?: string;
};

export function CertificateList({ zertifikate, artefakt }: CertificateListProps) {
  if (zertifikate.length === 0 && !artefakt) return null;

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl">Optionale Nachweise</h2>
      <p className="mt-2 max-w-[68ch] text-sm text-fg-muted">
        Diese Schritte blockieren den Lernpfad nicht. Sie sind für Kundengespräche
        gedacht, nicht als Pflicht.
      </p>
      <ul className="mt-4 grid gap-3">
        {zertifikate.map((item) => (
          <li key={item.url} className="surface p-4">
            <a
              href={item.url}
              className="inline-flex min-h-11 items-center gap-2 font-medium"
              rel="noreferrer"
              target="_blank"
            >
              {item.title}
              <ExternalLink aria-hidden={true} size={16} />
              <span className="sr-only">(öffnet in neuem Tab)</span>
            </a>
            <p className="mt-1 font-mono text-xs text-fg-muted">{item.anbieter}</p>
            {item.hinweis ? (
              <p className="mt-2 text-sm text-fg-muted">{item.hinweis}</p>
            ) : null}
          </li>
        ))}
      </ul>
      {artefakt ? (
        <p className="surface mt-3 p-4 text-sm text-fg-muted">{artefakt}</p>
      ) : null}
    </section>
  );
}
