// services/aiIntentClassifier.ts
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

export type IntentResult = {
  intent: InboundIntent;
  confidence: number;
  reasoning: string;
};

export async function classifyIntentAI(
  inboundText: string
): Promise<IntentResult> {
  const openai = getOpenAI();

  // ⛔ Build & runtime safe
  if (!openai) {
    return {
      intent: "UNKNOWN",
      confidence: 0,
      reasoning: "OpenAI disabled",
    };
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
You classify inbound SMS replies from cold real-estate leads.

Return ONLY valid JSON.
Valid intents:
OPT_OUT, NOT_INTERESTED, CONFUSED,
SELLER_INTEREST, BUYER_INTEREST,
DEFER, INTERESTED, UNKNOWN
        `,
      },
      {
        role: "user",
        content: `Inbound message:\n"${inboundText}"`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "intent",
        schema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            confidence: { type: "number" },
            reasoning: { type: "string" },
          },
          required: ["intent", "confidence", "reasoning"],
        },
      },
    },
  });

  const parsed = JSON.parse(response.choices[0].message.content ?? "{}");

  return {
    intent: parsed.intent ?? "UNKNOWN",
    confidence: parsed.confidence ?? 0,
    reasoning: parsed.reasoning ?? "",
  };
}
