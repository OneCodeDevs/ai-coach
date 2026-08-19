import { listKapitel } from "@/lib/content/loader";
import { getCompletedLessons, getJournalEntries } from "@/lib/db/queries";
import { CassetteTile } from "@/components/ui/cassette-tile";
import { HorizonScene } from "@/components/ui/horizon-scene";
import { Equalizer } from "@/components/ui/equalizer";

export default async function HomePage() {
  const [kapitel, completed, journals] = await Promise.all([
    listKapitel(),
    Promise.resolve(getCompletedLessons()),
    Promise.resolve(getJournalEntries()),
  ]);

  const doneSet = new Set(
    completed.map((row) => `${row.kapitelSlug}:${row.lessonSlug}`),
  );
  const examDone = new Set(journals.map((row) => row.kapitelSlug));
  const lessonTotal = kapitel.reduce((sum, item) => sum + item.lessons.length, 0);
  const lessonDone = completed.length;

  return (
    <div className="relative">
      <div className="relative isolate overflow-hidden rounded-2xl border border-border-subtle">
        <HorizonScene />
        <div className="relative z-10 px-5 py-12 md:px-10 md:py-16">
          <p className="font-display text-xs uppercase tracking-[0.28em] text-neon-cyan">
            OneCode · Night Drive Terminal
          </p>
          <h1 className="mt-3 max-w-[18ch] font-display text-4xl text-fg md:text-6xl">
            AI Coach
          </h1>
          <p className="mt-4 max-w-[62ch] text-fg-muted">
            Zehn Kapitel von Sprachmodellen bis zum Kundengespräch. Kurze Lerneinheiten,
            ein KI-Tutor statt Multiple Choice, danach ein Lerntagebuch ohne Noten.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Equalizer total={Math.max(lessonTotal, 1)} done={lessonDone} />
            <p className="font-mono text-sm text-fg-muted">
              {lessonDone}/{lessonTotal || "–"} Einheiten · {examDone.size}/
              {kapitel.length} Tests
            </p>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Lernpfad</h2>
        <p className="mt-2 max-w-[68ch] text-fg-muted">
          Jede Kassette ist ein Kapitel. Der Equalizer zeigt, wie weit du in den
          Lerneinheiten bist.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kapitel.map((item) => (
            <CassetteTile
              key={item.slug}
              kapitel={item}
              done={item.lessons.filter((lesson) =>
                doneSet.has(`${item.slug}:${lesson.slug}`),
              ).length}
              examDone={examDone.has(item.slug)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
