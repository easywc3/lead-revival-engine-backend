import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export type InboundIntent =
  | "INTERESTED"
  | "NOT_INTERESTED"
  | "DEFER"
  | "OPT_OUT"
  | "WRONG_PERSON"
  | "UNKNOWN";

export async function classifyInboundIntent(text: string): Promise<{
  intent: InboundIntent;
  confidence: number;
}> {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 20,
      messages: [
        {
          role: "system",
          content:
            "You are classifying SMS replies from real estate leads.\n" +
            "Return ONLY valid JSON.\n\n" +
            "Allowed intents:\n" +
            "- INTERESTED\n" +
            "- NOT_INTERESTED\n" +
            "- DEFER\n" +
            "- OPT_OUT\n" +
            "- WRONG_PERSON\n" +
            "- UNKNOWN\n\n" +
            "Respond with JSON: {\"intent\": \"...\", \"confidence\": 0-1}",
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error("Empty response");

    const parsed = JSON.parse(raw);

    return {
      intent: parsed.intent ?? "UNKNOWN",
      confidence:
        typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
    };
  } catch (err) {
    console.error("Intent classification failed:", err);
    return {
      intent: "UNKNOWN",
      confidence: 0.5,
    };
  }
}
