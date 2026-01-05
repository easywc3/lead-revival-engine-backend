import { getOpenAI } from "@/services/openaiClient";
import type { IntentResult } from "@/services/intentClassifier";
import type { ConversationContext } from "@/services/conversationContext";

export async function generateAIReply(params: {
  inboundText: string;
  intent: IntentResult;
  ctx: ConversationContext;
}): Promise<string | null> {
  const inboundText = (params.inboundText || "").trim();
  const { intent, ctx } = params;

  // ⛔ Hard stop if no API key at runtime
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const openai = getOpenAI();

  const isIdentityRequest = intent.signals?.includes("IDENTITY_REQUEST");

  const systemPrompt = `
You are a real human texting on behalf of a real estate agent.

Rules:
- ONE short SMS only
- Sound human and specific
- NEVER say "checking in"
- NEVER say "hope you're doing well"
- NEVER use placeholders like [Your Name] or [Your Brokerage]
- NEVER be salesy
- If the lead asks who this is, explain WHY you're texting (past context), not your title
- Offer an easy out if timing is bad
- No emojis
`;

  const userPrompt = `
Inbound message:
"${inboundText}"

Recent context:
${ctx.recentTranscript || "(no prior messages)"}

Intent: ${intent.intent}
Signals: ${intent.signals.join(", ") || "none"}

Write the best possible reply.
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

    let text = resp.choices[0]?.message?.content?.trim();

    // HARD SAFETY
    if (!text || text.length < 3) {
      return null;
    }

    // Extra guard against placeholders sneaking in
    if (text.includes("[Your") || text.includes("Your Name")) {
      return isIdentityRequest
        ? "Totally fair — you reached out a while back about real estate info, and I’m following up. If now’s not a good time, no worries at all."
        : null;
    }

    return text.slice(0, 500);
  } catch (err) {
    console.error("[AI responder failed]", err);
    return null;
  }
}
