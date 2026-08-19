import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getKapitel } from "@/lib/content/loader";
import { getJournalForKapitel } from "@/lib/db/queries";
import { JournalView } from "@/components/journal/journal-view";
import type { JournalInsight, NextStep } from "@/lib/tutor/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const kapitel = await getKapitel(slug);
  return { title: kapitel ? `Tagebuch · ${kapitel.titel}` : "Lerntagebuch" };
}

export default async function ChapterJournalPage({ params }: PageProps) {
  const { slug } = await params;
  const kapitel = await getKapitel(slug);
  if (!kapitel) notFound();
  const entry = getJournalForKapitel(slug);

  if (!entry) {
    return (
      <div>
        <h1 className="font-display text-3xl">Lerntagebuch</h1>
        <p className="mt-3 max-w-[62ch] text-fg-muted">
          Für dieses Kapitel gibt es noch keinen Eintrag. Schließ zuerst den Kapiteltest
          ab.
        </p>
        <Link href={`/kapitel/${slug}/pruefung`} className="btn btn-primary mt-5">
          Zum Test
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Lerntagebuch</h1>
      <p className="mt-2 font-mono text-sm text-fg-muted">{kapitel.titel}</p>
      <div className="mt-8">
        <JournalView
          titel={kapitel.titel}
          zusammenfassung={entry.zusammenfassung}
          staerken={JSON.parse(entry.staerken) as JournalInsight[]}
          luecken={JSON.parse(entry.luecken) as JournalInsight[]}
          naechsteSchritte={JSON.parse(entry.naechsteSchritte) as NextStep[]}
        />
      </div>
    </div>
  );
}
