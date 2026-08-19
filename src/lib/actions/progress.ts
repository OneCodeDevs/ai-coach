"use server";

import { revalidatePath } from "next/cache";
import { markLessonComplete } from "@/lib/db/queries";

export async function completeLesson(kapitelSlug: string, lessonSlug: string) {
  markLessonComplete(kapitelSlug, lessonSlug);
  revalidatePath("/");
  revalidatePath(`/kapitel/${kapitelSlug}`);
  revalidatePath(`/kapitel/${kapitelSlug}/${lessonSlug}`);
}
