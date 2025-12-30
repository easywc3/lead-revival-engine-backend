import OpenAI from "openai";
import { InboundIntent } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type IntentResult = {
  intent: InboundIntent;
  confidence: number;
  reasoning: string;
};

export async function classifyIntentAI(
  inboundText: string
): Promise<IntentResult> {
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

  const parsed = JSON.parse(
    response.choices[0].message.content || "{}"
  );

  return {
    intent: parsed.intent ?? "UNKNOWN",
    confidence: parsed.confidence ?? 0,
    reasoning: parsed.reasoning ?? "",
  };
}
