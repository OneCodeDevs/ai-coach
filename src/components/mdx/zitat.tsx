import { TranslateButton } from "./translate-button";

type ZitatProps = {
  lang?: "de" | "en";
  quelle?: string;
  text: string;
};

export function Zitat({ lang = "en", quelle, text }: ZitatProps) {
  return (
    <blockquote className="surface my-6 border-l-2 border-neon-violet p-4">
      {quelle ? (
        <cite className="font-display text-xs uppercase tracking-[0.16em] text-fg-muted not-italic">
          {quelle}
        </cite>
      ) : null}
      {lang === "en" ? (
        <TranslateButton text={text} sourceLang="en" />
      ) : (
        <p className="mt-2 whitespace-pre-wrap">{text}</p>
      )}
    </blockquote>
  );
}
