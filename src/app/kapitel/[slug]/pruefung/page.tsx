import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getKapitel } from "@/lib/content/loader";
import { getActiveExam } from "@/lib/db/queries";
import { hasAiCredentials } from "@/lib/ai/provider";
import { TutorChat } from "@/components/tutor/tutor-chat";
import { isQuestionPassed, turnsForQuestion } from "@/lib/tutor/types";
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
  const questionIndex = session?.questionIndex ?? 0;
  const currentQuestion = kapitel.exam[questionIndex];
  if (session) {
    try {
      transcript = JSON.parse(session.transcript) as TranscriptTurn[];
    } catch {
      transcript = [];
    }
  }
  const displayTranscript = currentQuestion
    ? turnsForQuestion(transcript, currentQuestion.id)
    : [];
  const initialPassed = currentQuestion
    ? isQuestionPassed(transcript, currentQuestion.id)
    : false;
  const isLastQuestion = questionIndex >= kapitel.exam.length - 1;

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
          questionIndex={questionIndex}
          currentQuestionId={currentQuestion?.id ?? ""}
          initialTranscript={displayTranscript}
          initialPassed={initialPassed}
          isLastQuestion={isLastQuestion}
          hasCredentials={hasAiCredentials()}
        />
      </div>
    </div>
  );
}
