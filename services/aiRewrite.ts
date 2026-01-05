// services/aiRewrite.ts
import { getOpenAI } from "@/services/openaiClient";

type RewriteParams = {
  draft: string;
  intent: string;
};

export async function rewriteWithAI({
  draft,
  intent,
}: RewriteParams): Promise<string> {
  const openai = getOpenAI();
  if (!openai) return draft;

  const systemPrompt = `
You rewrite SMS messages for lead follow-up.

Rules:
- Under 320 characters
- Calm, human, professional
- No emojis
- No pressure
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Intent: ${intent}\nDraft:\n"${draft}"`,
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() || draft;
}
