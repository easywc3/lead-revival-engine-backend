// services/aiResponder.ts
import { getOpenAI } from "@/services/openaiClient";
import type { IntentResult } from "@/services/intentClassifier";
import type { ConversationContext } from "@/services/conversationContext";

export async function generateAIReply(params: {
  inboundText: string;
  intent: IntentResult;
  ctx: ConversationContext;
}): Promise<string | null> {
  const openai = getOpenAI();
  if (!openai) return null;

  const inboundText = params.inboundText.trim();
  const { intent, ctx } = params;

  const systemPrompt = `
You are a real human texting on behalf of a real estate agent.

Rules:
- ONE short SMS only
- Sound human and specific
- NEVER say "checking in"
- NEVER say "hope you're doing well"
- NEVER be salesy
- Offer an easy out if timing is bad
`;

  const userPrompt = `
Inbound message:
"${inboundText}"

Recent context:
${ctx.recentTranscript || "(none)"}

Intent: ${intent.intent}
`;

  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const text = resp.choices[0]?.message?.content?.trim();
    if (!text || text.length < 3) return null;

    return text.slice(0, 500);
  } catch (err) {
    console.error("[AI responder failed]", err);
    return null;
  }
}
