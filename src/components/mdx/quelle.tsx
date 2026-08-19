import { ExternalLink } from "lucide-react";
import { TranslateButton } from "./translate-button";

type QuelleProps = {
  url: string;
  lang: "de" | "en";
  typ: string;
  dauer: string;
  account?: boolean;
  excerpt?: string;
  children?: React.ReactNode;
};

export function Quelle({
  url,
  lang,
  typ,
  dauer,
  account = false,
  excerpt,
  children,
}: QuelleProps) {

  return (
    <aside className="surface my-6 p-4">
      <p className="font-display text-xs uppercase tracking-[0.18em] text-neon-cyan">
        Quelle
      </p>
      <a
        href={url}
        className="mt-2 inline-flex min-h-11 items-center gap-2 font-medium"
        rel="noreferrer"
        target="_blank"
      >
        {typ}
        <ExternalLink aria-hidden={true} size={16} />
        <span className="sr-only">(öffnet in neuem Tab)</span>
      </a>
      <p className="mt-1 font-mono text-xs text-fg-muted">
        {lang.toUpperCase()} · {dauer}
        {account ? " · Account nötig" : " · ohne Account"}
      </p>
      {excerpt && lang === "en" ? (
        <TranslateButton text={excerpt} sourceLang="en" />
      ) : excerpt ? (
        <p className="mt-3 text-sm text-fg-muted">{excerpt}</p>
      ) : children && lang === "en" ? (
        <div className="mt-3 text-sm text-fg-muted">{children}</div>
      ) : children ? (
        <div className="mt-3 text-sm text-fg-muted">{children}</div>
      ) : null}
    </aside>
  );
}
