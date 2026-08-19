import { z } from "zod";
import { submitAnswer } from "@/lib/tutor/session";

export const maxDuration = 60;

const bodySchema = z.object({
  sessionId: z.number().int().positive(),
  answer: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const body = bodySchema.parse(json);
    const result = await submitAnswer(body.sessionId, body.answer);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    const status = message.includes("nicht gefunden") ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}
