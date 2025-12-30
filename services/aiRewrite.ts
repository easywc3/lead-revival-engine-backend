import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

type RewriteParams = {
  draft: string;
  intent: string;
};

export async function rewriteWithAI({ draft, intent }: RewriteParams) {
  if (!process.env.OPENAI_API_KEY) {
    // Safety fallback
    return draft;
  }

  const systemPrompt = `
You rewrite SMS messages for lead follow-up.

Rules:
- Keep it under 320 characters
- Sound human, calm, and professional
- No emojis
- No pressure tactics
- Match intent tone

Intent tones:
- INTERESTED: helpful, forward-moving
- UNKNOWN: clarifying, friendly
- SKEPTICAL: reassuring, factual
- DEFER: respectful, low-pressure
- STOP: NEVER rewrite (this function won't be called)
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Intent: ${intent}\nDraft SMS:\n"${draft}"`,
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() || draft;
}
