import { getOpenAI } from "@/services/openaiClient";

export type InboundIntent =
  | "OPT_OUT"
  | "NOT_INTERESTED"
  | "CONFUSED"
  | "SELLER_INTEREST"
  | "BUYER_INTEREST"
  | "DEFER"
  | "INTERESTED"
  | "UNKNOWN";

export type IntentSignal =
  | "CALL_REQUEST"
  | "READY_TO_MOVE"
  | "PRICE_SPECIFIC"
  | "TIMELINE_SOON"
  | "IDENTITY_REQUEST"
  | "FORCE_REPLY";

export type IntentResult = {
  intent: InboundIntent;
  confidence: number;
  reasoning: string;
  signals: IntentSignal[]; // ✅ ALWAYS PRESENT
};

export async function classifyIntentAI(
  inboundText: string
): Promise<IntentResult> {
  const openai = getOpenAI();

  const systemPrompt = `
You classify inbound SMS replies from cold real-estate leads.

Return ONLY valid JSON.
Do NOT include markdown.
Do NOT include commentary.
`;

  const userPrompt = `
Inbound message:
"${inboundText}"

Classify the intent.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "intent_classification",
        schema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            confidence: { type: "number" },
            reasoning: { type: "string" },
            signals: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["intent", "confidence", "reasoning"],
        },
      },
    },
  });

  const parsed = JSON.parse(response.choices[0].message.content || "{}");

  return {
    intent: parsed.intent ?? "UNKNOWN",
    confidence: parsed.confidence ?? 0,
    reasoning: parsed.reasoning ?? "",
    signals: parsed.signals ?? [], // ✅ SAFE DEFAULT
  };
}
