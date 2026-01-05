import { getOpenAI } from "@/services/openaiClient";
import type { IntentResult } from "@/services/aiIntentClassifier";
import type { ConversationContext } from "@/services/conversationContext";

export async function generateAIReply(params: {
  inboundText: string;
  intent: IntentResult;
  ctx: ConversationContext;
}): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const openai = getOpenAI();
  const { inboundText, intent, ctx } = params;

  const isIdentityRequest = intent.signals.includes("IDENTITY_REQUEST");

  const systemPrompt = `
You are a real human texting on behalf of a real estate agent.
ONE short SMS only.
No emojis. No fluff.
`;

  const userPrompt = `
Inbound message:
"${inboundText}"

Recent context:
${ctx.recentTranscript || "(none)"}

Intent: ${intent.intent}
Signals: ${intent.signals.join(", ") || "none"}
`;

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.8,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const text = resp.choices[0]?.message?.content?.trim();
  if (!text) return null;

  return text.slice(0, 500);
}
