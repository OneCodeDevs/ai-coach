import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getKapitel } from "@/lib/content/loader";
import { getCompletedLessons, getJournalForKapitel, getPraxisForKapitel } from "@/lib/db/queries";
import { HorizonScene } from "@/components/ui/horizon-scene";
import { Equalizer } from "@/components/ui/equalizer";
import { CertificateList } from "@/components/ui/certificate-list";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const kapitel = await getKapitel(slug);
  return { title: kapitel?.titel ?? "Kapitel" };
}

export default async function KapitelPage({ params }: PageProps) {
  const { slug } = await params;
  const kapitel = await getKapitel(slug);
  if (!kapitel) notFound();

  const completed = getCompletedLessons();
  const doneSet = new Set(
    completed
      .filter((row) => row.kapitelSlug === slug)
      .map((row) => row.lessonSlug),
  );
  const journal = getJournalForKapitel(slug);
  const praxisSessions = getPraxisForKapitel(slug);
  const praxisBestanden = kapitel.praxis.filter((a) =>
    praxisSessions.find((s) => s.aufgabeId === a.id && s.status === "bestanden"),
  ).length;
  const done = kapitel.lessons.filter((lesson) => doneSet.has(lesson.slug)).length;

  return (
    <div>
      <header className="relative isolate overflow-hidden rounded-2xl border border-border-subtle">
        <HorizonScene />
        <div className="relative z-10 px-5 py-10 md:px-8">
          <p className="font-mono text-sm text-neon-cyan">
            Kapitel {String(kapitel.nummer).padStart(2, "0")}
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-5xl">{kapitel.titel}</h1>
          <p className="mt-3 max-w-[62ch] text-fg-muted">{kapitel.untertitel}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Equalizer total={kapitel.lessons.length || 1} done={done} />
            <span className="font-mono text-sm text-fg-muted">
              {kapitel.dauerMinuten} Minuten
            </span>
          </div>
        </div>
      </header>

      {kapitel.error ? (
        <p className="surface mt-6 p-4 text-danger" role="alert">
          Dieses Kapitel ist fehlerhaft und kann nicht gelesen werden: {kapitel.error}
        </p>
      ) : null}

      <section className="mt-8">
        <h2 className="font-display text-2xl">Lernziele</h2>
        <ul className="mt-3 max-w-[68ch] list-disc space-y-2 pl-5 text-fg-muted">
          {kapitel.lernziele.map((ziel) => (
            <li key={ziel}>{ziel}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Lerneinheiten</h2>
        <ol className="mt-4 grid gap-3">
          {kapitel.lessons.map((lesson) => {
            const complete = doneSet.has(lesson.slug);
            return (
              <li key={lesson.slug}>
                <Link
                  href={`/kapitel/${kapitel.slug}/${lesson.slug}`}
                  className="surface flex min-h-16 items-start justify-between gap-4 p-4 no-underline text-fg hover:border-neon-cyan"
                >
                  <div>
                    <p className="font-display text-lg">{lesson.titel}</p>
                    <p className="mt-1 text-sm text-fg-muted">{lesson.zusammenfassung}</p>
                  </div>
                  <p className="shrink-0 font-mono text-xs text-fg-muted">
                    {lesson.dauerMinuten} min
                    {complete ? " · gelesen" : ""}
                  </p>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-10 flex flex-wrap gap-3">
        <Link href={`/kapitel/${kapitel.slug}/pruefung`} className="btn btn-primary">
          Kapiteltest starten
        </Link>
        <Link href={`/kapitel/${kapitel.slug}/praxis`} className="btn btn-ghost">
          Praxis-Aufgaben
          {praxisBestanden > 0 ? (
            <span className="ml-2 font-mono text-xs text-neon-lime">
              {praxisBestanden}/{kapitel.praxis.length}
            </span>
          ) : null}
        </Link>
        {journal ? (
          <Link href={`/kapitel/${kapitel.slug}/tagebuch`} className="btn btn-ghost">
            Lerntagebuch öffnen
          </Link>
        ) : null}
      </section>

      <CertificateList
        zertifikate={kapitel.zertifikate}
        artefakt={kapitel.artefakt}
      />
    </div>
  );
}
