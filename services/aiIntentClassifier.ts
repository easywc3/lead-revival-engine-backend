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

  // ✅ BUILD + RUNTIME SAFE GUARD
  if (!openai) {
    return {
      intent: "UNKNOWN",
      confidence: 0,
      reasoning: "OpenAI unavailable",
    };
  }

  const systemPrompt = `
You classify inbound SMS replies from cold real-estate leads.

Return ONLY valid JSON.
Do NOT include markdown.
Do NOT include commentary.

Valid intents:
- OPT_OUT
- NOT_INTERESTED
- CONFUSED
- SELLER_INTEREST
- BUYER_INTEREST
- DEFER
- INTERESTED
- UNKNOWN

Rules:
- OPT_OUT overrides everything
- CONFUSED means they don't know who is texting
- DEFER means timing-based hesitation
- INTERESTED means clear positive intent
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
            intent: {
              type: "string",
              enum: [
                "OPT_OUT",
                "NOT_INTERESTED",
                "CONFUSED",
                "SELLER_INTEREST",
                "BUYER_INTEREST",
                "DEFER",
                "INTERESTED",
                "UNKNOWN",
              ],
            },
            confidence: {
              type: "number",
              minimum: 0,
              maximum: 1,
            },
            reasoning: {
              type: "string",
            },
          },
          required: ["intent", "confidence", "reasoning"],
        },
      },
    },
  });

  let parsed: any = {};

  try {
    parsed = JSON.parse(
      response.choices[0]?.message?.content ?? "{}"
    );
  } catch {
    parsed = {};
  }

  return {
    intent: parsed.intent ?? "UNKNOWN",
    confidence:
      typeof parsed.confidence === "number"
        ? parsed.confidence
        : 0,
    reasoning: parsed.reasoning ?? "",
  };
}
