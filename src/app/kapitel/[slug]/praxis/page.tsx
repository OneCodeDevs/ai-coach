import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getKapitel } from "@/lib/content/loader";
import { getPraxisForKapitel } from "@/lib/db/queries";
import { hasAiCredentials } from "@/lib/ai/provider";
import { PraxisCard } from "@/components/praxis/praxis-card";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const kapitel = await getKapitel(slug);
  return { title: kapitel ? `Praxis · ${kapitel.titel}` : "Praxis-Aufgaben" };
}

export default async function PraxisPage({ params }: PageProps) {
  const { slug } = await params;
  const kapitel = await getKapitel(slug);
  if (!kapitel) notFound();

  const sessions = getPraxisForKapitel(slug);
  const sessionMap = new Map(sessions.map((s) => [s.aufgabeId, s]));
  const credentials = hasAiCredentials();

  const bestanden = kapitel.praxis.filter((a) =>
    sessionMap.get(a.id)?.status === "bestanden",
  ).length;

  return (
    <div>
      <p className="font-mono text-sm text-neon-cyan">
        Kapitel {String(kapitel.nummer).padStart(2, "0")}
      </p>
      <h1 className="mt-2 font-display text-3xl">Praxis-Aufgaben</h1>
      <p className="mt-2 max-w-[62ch] text-fg-muted">
        {kapitel.praxis.length} Aufgaben — arbeite lokal, reiche dein Ergebnis
        ein, der Reviewer gibt Feedback.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <div
          className="h-1 w-32 overflow-hidden rounded-full bg-bg-elevated"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={kapitel.praxis.length}
          aria-valuenow={bestanden}
        >
          <span
            className="block h-full bg-neon-lime"
            style={{
              width: `${(bestanden / kapitel.praxis.length) * 100}%`,
            }}
          />
        </div>
        <span className="font-mono text-sm text-fg-muted">
          {bestanden} / {kapitel.praxis.length} bestanden
        </span>
      </div>

      <div className="mt-8 grid gap-3">
        {kapitel.praxis.map((aufgabe) => (
          <PraxisCard
            key={aufgabe.id}
            aufgabe={aufgabe}
            kapitelSlug={slug}
            session={sessionMap.get(aufgabe.id) ?? null}
            hasCredentials={credentials}
          />
        ))}
      </div>
    </div>
  );
}
