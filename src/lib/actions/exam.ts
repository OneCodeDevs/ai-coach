"use server";

import { revalidatePath } from "next/cache";
import { startExam } from "@/lib/tutor/session";

export async function beginExam(kapitelSlug: string) {
  const session = await startExam(kapitelSlug);
  revalidatePath(`/kapitel/${kapitelSlug}/pruefung`);
  return session.id;
}
