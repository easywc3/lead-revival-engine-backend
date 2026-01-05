import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  // ✅ Runtime-only safety guard
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.OPENAI_API_KEY
  ) {
    throw new Error("OPENAI_API_KEY missing in production");
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set");
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return client;
}
