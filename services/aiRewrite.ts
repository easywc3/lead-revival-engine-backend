import { getOpenAI } from "@/services/openaiClient";

export async function rewriteWithAI(params: {
  draft: string;
  intent: string;
}): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return params.draft; // ✅ safe fallback
  }

  const openai = getOpenAI();

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6,
    messages: [
      {
        role: "system",
        content: "Rewrite SMS to sound natural and human.",
      },
      {
        role: "user",
        content: `Intent: ${params.intent}\nText: ${params.draft}`,
      },
    ],
  });

  return resp.choices[0]?.message?.content?.trim() || params.draft;
}
