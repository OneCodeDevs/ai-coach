import { createHash } from "node:crypto";
import { generateText } from "ai";
import { z } from "zod";
import { getModel, hasAiCredentials } from "@/lib/ai/provider";
import { getTranslation, saveTranslation } from "@/lib/db/queries";

const bodySchema = z.object({
  text: z.string().min(1).max(8000),
  sourceLang: z.string().default("en"),
});

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const body = bodySchema.parse(json);
    const targetLang = "de";
    const hash = createHash("sha256")
      .update(`${body.sourceLang}:${targetLang}:${body.text}`)
      .digest("hex");

    const cached = getTranslation(hash);
    if (cached) {
      return Response.json({ translated: cached.translatedText, cached: true });
    }

    if (!hasAiCredentials()) {
      return Response.json(
        { error: "Kein Modell konfiguriert. Übersetzung nicht möglich." },
        { status: 503 },
      );
    }

    const result = await generateText({
      model: getModel("default"),
      prompt: [
        "Übersetze den folgenden Text ins Deutsche.",
        "Behalte Fachbegriffe bei, wenn sie in der Entwicklerpraxis üblich sind (Token, Context Window, MCP, Agent).",
        "Keine Erklärungen, nur die Übersetzung.",
        "",
        body.text,
      ].join("\n"),
    });

    saveTranslation({
      hash,
      sourceLang: body.sourceLang,
      targetLang,
      sourceText: body.text,
      translatedText: result.text,
    });

    return Response.json({ translated: result.text, cached: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Übersetzung fehlgeschlagen.";
    return Response.json({ error: message }, { status: 400 });
  }
}
