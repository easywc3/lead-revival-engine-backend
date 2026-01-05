// services/aiResponder.ts
import { getOpenAI } from "@/services/openaiClient";
import type { IntentResult } from "@/services/aiIntentClassifier";
import type { ConversationContext } from "@/services/conversationContext";

export async function generateAIReply(params: {
  inboundText: string;
  intent: IntentResult;
  ctx: ConversationContext;
}): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const openai = getOpenAI();
  if (!openai) {
    return null;
  }

  const { inboundText, intent, ctx } = params;

  const systemPrompt = `
You are a real human texting on behalf of a real estate agent.

Rules:
- ONE short SMS
- Sound human
- No emojis
- No sales language
- If identity is unclear, explain context
`;

  const userPrompt = `
Inbound:
"${inboundText}"

Recent:
${ctx.recentTranscript || "(none)"}

Intent: ${intent.intent}

Write reply.
`;

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const text = resp.choices[0]?.message?.content?.trim();
  if (!text || text.length < 3) {
    return null;
  }

  return text.slice(0, 500);
}
