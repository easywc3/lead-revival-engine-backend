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
  // ✅ BUILD SAFE: no OpenAI usage without key
  if (!process.env.OPENAI_API_KEY) {
    return {
      intent: "UNKNOWN",
      confidence: 0,
      reasoning: "AI disabled",
    };
  }

  const openai = getOpenAI(); // ✅ now NON-nullable

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "Classify inbound SMS intent. Respond ONLY with JSON.",
      },
      {
        role: "user",
        content: inboundText,
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

  const parsed = JSON.parse(
    response.choices[0].message.content || "{}"
  );

  return {
    intent: parsed.intent ?? "UNKNOWN",
    confidence: parsed.confidence ?? 0,
    reasoning: parsed.reasoning ?? "",
  };
}
