"use client";

import { useTransition } from "react";
import { completeLesson } from "@/lib/actions/progress";

type LessonCompleteButtonProps = {
  kapitelSlug: string;
  lessonSlug: string;
  completed: boolean;
};

export function LessonCompleteButton({
  kapitelSlug,
  lessonSlug,
  completed,
}: LessonCompleteButtonProps) {
  const [pending, startTransition] = useTransition();

  if (completed) {
    return (
      <p className="font-mono text-sm text-neon-lime" role="status">
        Als gelesen markiert
      </p>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-primary"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await completeLesson(kapitelSlug, lessonSlug);
        });
      }}
    >
      {pending ? "Speichere…" : "Als gelesen markieren"}
    </button>
  );
}
