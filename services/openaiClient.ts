// services/openaiClient.ts
import OpenAI from "openai";

let _client: OpenAI | null = null;

/**
 * Lazily get OpenAI client.
 * Returns null if OPENAI_API_KEY is missing.
 * SAFE during next build.
 */
export function getOpenAI(): OpenAI | null {
  if (_client) return _client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  _client = new OpenAI({ apiKey });
  return _client;
}
