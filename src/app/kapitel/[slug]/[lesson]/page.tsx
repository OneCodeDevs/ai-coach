import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLesson } from "@/lib/content/loader";
import { isLessonComplete } from "@/lib/db/queries";
import { MdxContent } from "@/components/mdx/mdx-content";
import { LessonCompleteButton } from "@/components/lesson/complete-button";

type PageProps = {
  params: Promise<{ slug: string; lesson: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, lesson } = await params;
  const data = await getLesson(slug, lesson);
  return { title: data?.lesson.titel ?? "Lerneinheit" };
}

export default async function LessonPage({ params }: PageProps) {
  const { slug, lesson: lessonSlug } = await params;
  const data = await getLesson(slug, lessonSlug);
  if (!data) notFound();

  const { kapitel, lesson } = data;
  const completed = isLessonComplete(kapitel.slug, lesson.slug);
  const index = kapitel.lessons.findIndex((item) => item.slug === lesson.slug);
  const previous = kapitel.lessons[index - 1];
  const next = kapitel.lessons[index + 1];

  return (
    <div>
      <nav aria-label="Brotkrumen" className="font-mono text-xs text-fg-muted">
        <Link href={`/kapitel/${kapitel.slug}`} className="text-fg-muted">
          Kapitel {String(kapitel.nummer).padStart(2, "0")}
        </Link>
        <span aria-hidden> / </span>
        <span>Einheit {index + 1}</span>
      </nav>
      <h1 className="mt-3 font-display text-3xl md:text-4xl">{lesson.titel}</h1>
      <p className="mt-2 font-mono text-sm text-fg-muted">
        {lesson.dauerMinuten} Minuten · {lesson.zusammenfassung}
      </p>
      <div className="mt-8">
        <MdxContent source={lesson.body} />
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <LessonCompleteButton
          kapitelSlug={kapitel.slug}
          lessonSlug={lesson.slug}
          completed={completed}
        />
        {previous ? (
          <Link
            href={`/kapitel/${kapitel.slug}/${previous.slug}`}
            className="btn btn-ghost"
          >
            Zurück
          </Link>
        ) : null}
        {next ? (
          <Link href={`/kapitel/${kapitel.slug}/${next.slug}`} className="btn btn-ghost">
            Nächste Einheit
          </Link>
        ) : (
          <Link href={`/kapitel/${kapitel.slug}/pruefung`} className="btn btn-ghost">
            Zum Kapiteltest
          </Link>
        )}
      </div>
    </div>
  );
}
