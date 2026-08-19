import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getKapitel } from "@/lib/content/loader";
import { getActiveExam } from "@/lib/db/queries";
import { hasAiCredentials } from "@/lib/ai/provider";
import { TutorChat } from "@/components/tutor/tutor-chat";
import type { TranscriptTurn } from "@/lib/tutor/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const kapitel = await getKapitel(slug);
  return { title: kapitel ? `Test · ${kapitel.titel}` : "Kapiteltest" };
}

export default async function ExamPage({ params }: PageProps) {
  const { slug } = await params;
  const kapitel = await getKapitel(slug);
  if (!kapitel) notFound();

  const session = getActiveExam(slug);
  let transcript: TranscriptTurn[] = [];
  if (session) {
    try {
      transcript = JSON.parse(session.transcript) as TranscriptTurn[];
    } catch {
      transcript = [];
    }
  }

  return (
    <div>
      <p className="font-mono text-sm text-neon-cyan">
        Kapitel {String(kapitel.nummer).padStart(2, "0")}
      </p>
      <h1 className="mt-2 font-display text-3xl">Kapiteltest</h1>
      <p className="mt-2 max-w-[62ch] text-fg-muted">
        {kapitel.exam.length} Fragen, Freitext, der Tutor bleibt bei seiner Agenda.
      </p>
      <div className="mt-8">
        <TutorChat
          kapitelSlug={kapitel.slug}
          sessionId={session?.id ?? null}
          total={kapitel.exam.length}
          questionIndex={session?.questionIndex ?? 0}
          initialTranscript={transcript}
          hasCredentials={hasAiCredentials()}
        />
      </div>
    </div>
  );
}
