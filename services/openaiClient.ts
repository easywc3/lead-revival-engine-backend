import OpenAI from "openai";

let client: OpenAI | undefined;

export function getOpenAI(): OpenAI {
  if (client) return client;

  const apiKey = process.env.OPENAI_API_KEY;

  // ⛔ Never throw at import time — ONLY when called
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY missing at runtime");
  }

  client = new OpenAI({ apiKey });
  return client;
}
