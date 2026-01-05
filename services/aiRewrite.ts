import { getOpenAI } from "@/services/openaiClient";

type RewriteParams = {
  draft: string;
  intent: string;
};

export async function rewriteWithAI({
  draft,
  intent,
}: RewriteParams): Promise<string> {
  // 🔒 Hard safety — NEVER crash build/runtime
  if (!process.env.OPENAI_API_KEY) {
    return draft;
  }

  const openai = getOpenAI();

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

  try {
    const response = await openai.chat.completions.create({
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

    const text = response.choices[0]?.message?.content?.trim();

    if (!text || text.length < 3) {
      return draft;
    }

    return text.slice(0, 320);
  } catch (err) {
    console.error("[AI rewrite failed]", err);
    return draft;
  }
}
