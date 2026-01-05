import OpenAI from "openai";

/**
 * Build-safe OpenAI client factory.
 *
 * CRITICAL:
 * - Do NOT create OpenAI at import time
 * - Next.js WILL import this during build
 * - API key may not exist during build
 */
export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  return new OpenAI({
    apiKey,
  });
}
