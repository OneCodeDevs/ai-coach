import Link from "next/link";
import type { Kapitel } from "@/lib/content/schemas";
import { Equalizer } from "./equalizer";

type CassetteTileProps = {
  kapitel: Kapitel;
  done: number;
  examDone: boolean;
  praxisDone?: number;
};

export function CassetteTile({ kapitel, done, examDone, praxisDone = 0 }: CassetteTileProps) {
  const total = kapitel.lessons.length;
  const locked = Boolean(kapitel.error);

  const inner = (
    <>
      <div className="cassette-window">
        <span className="spool" aria-hidden />
        <span className="spool" aria-hidden />
        <span className="font-mono text-xs tracking-widest text-neon-cyan">
          CH-{String(kapitel.nummer).padStart(2, "0")}
        </span>
        <span className="ml-auto flex gap-2">
          {examDone ? (
            <span className="font-mono text-xs text-neon-lime">TEST OK</span>
          ) : null}
          {praxisDone > 0 && kapitel.praxis?.length ? (
            <span className="font-mono text-xs text-neon-lime">
              PRAXIS {praxisDone}/{kapitel.praxis.length}
            </span>
          ) : null}
        </span>
      </div>
      <h3 className="font-display text-xl text-fg">{kapitel.titel}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-fg-muted">{kapitel.untertitel}</p>
      <div className="mt-auto flex items-end justify-between pt-4">
        <Equalizer total={total || 4} done={done} />
        <span className="font-mono text-xs text-fg-muted">
          {kapitel.dauerMinuten} min
        </span>
      </div>
      {kapitel.error ? (
        <p className="mt-3 text-sm text-danger">Kapitel fehlerhaft: {kapitel.error}</p>
      ) : null}
    </>
  );

  if (locked) {
    return (
      <div className="cassette cassette-glow opacity-70" aria-disabled="true">
        {inner}
      </div>
    );
  }

  return (
    <Link href={`/kapitel/${kapitel.slug}`} className="cassette cassette-glow">
      {inner}
    </Link>
  );
}
