import { getOpenAI } from "@/services/openaiClient";
import type { IntentResult } from "@/services/intentClassifier";
import type { ConversationContext } from "@/services/conversationContext";

export async function generateAIReply(params: {
  inboundText: string;
  intent: IntentResult;
  ctx: ConversationContext;
}): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null; // 🚨 build-safe
  }

  const openai = getOpenAI();

  const systemPrompt = `
You are a real human texting on behalf of a real estate agent.
ONE short SMS only.
No emojis. No sales tone.
`;

  const userPrompt = `
Inbound:
"${params.inboundText}"

Context:
${params.ctx.recentTranscript ?? "(none)"}

Intent: ${params.intent.intent}
`;

  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    return resp.choices[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}
