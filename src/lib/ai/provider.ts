import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export type ModelKind = "default" | "eval";

function anthropicModel(kind: ModelKind): LanguageModel {
  const name =
    kind === "eval"
      ? (process.env.ANTHROPIC_EVAL_MODEL ??
        process.env.ANTHROPIC_MODEL ??
        "claude-haiku-4-5")
      : (process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5");
  return anthropic(name);
}

function googleModel(): LanguageModel {
  return google(process.env.GOOGLE_MODEL ?? "gemini-2.5-flash");
}

function compatibleModel(name: string, baseURL: string, apiKey?: string, modelId?: string) {
  const client = createOpenAICompatible({
    name,
    baseURL,
    apiKey,
  });
  return client(modelId ?? "gpt-4.1-mini");
}

export function getModel(kind: ModelKind = "default"): LanguageModel {
  const provider = (process.env.AI_PROVIDER ?? "anthropic").toLowerCase();

  switch (provider) {
    case "google":
    case "gemini":
      return googleModel();
    case "ollama":
      return compatibleModel(
        "ollama",
        process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434/v1",
        "ollama",
        process.env.OLLAMA_MODEL ?? "qwen3:14b",
      );
    case "openai-compatible":
    case "openrouter":
      if (!process.env.OPENAI_COMPATIBLE_BASE_URL) {
        throw new Error("OPENAI_COMPATIBLE_BASE_URL fehlt.");
      }
      return compatibleModel(
        "openai-compatible",
        process.env.OPENAI_COMPATIBLE_BASE_URL,
        process.env.OPENAI_COMPATIBLE_API_KEY,
        process.env.OPENAI_COMPATIBLE_MODEL,
      );
    case "anthropic":
    default:
      return anthropicModel(kind);
  }
}

export function isAnthropicProvider(): boolean {
  const provider = (process.env.AI_PROVIDER ?? "anthropic").toLowerCase();
  return provider === "anthropic";
}

export function hasAiCredentials(): boolean {
  const provider = (process.env.AI_PROVIDER ?? "anthropic").toLowerCase();
  if (provider === "anthropic") return Boolean(process.env.ANTHROPIC_API_KEY);
  if (provider === "google" || provider === "gemini") {
    return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  }
  if (provider === "ollama") return true;
  return Boolean(process.env.OPENAI_COMPATIBLE_BASE_URL);
}
