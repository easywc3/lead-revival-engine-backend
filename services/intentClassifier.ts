import OpenAI from "openai";

export type IntentLabel =
  | "OPT_OUT"
  | "INTERESTED"
  | "NOT_INTERESTED"
  | "WRONG_PERSON"
  | "DEFER"
  | "UNKNOWN";

export type IntentSignal =
  | "IDENTITY_REQUEST" // "who is this?"
  | "TIMING" // later, next month, etc
  | "PRICE" // budget, price range
  | "SELLING" // selling vs buying
  | "BUYING" // buying intent
  | "LOCATION" // city/neighborhood mentioned
  | "FINANCING" // preapproved, loan, etc
  | "URGENCY" // asap, this week
  | "ANGER"; // hostile tone

export type IntentResult = {
  intent: IntentLabel;
  confidence: number; // 0..1
  signals: IntentSignal[];
  summary?: string; // short internal note
};

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const allowedIntents = new Set<IntentLabel>([
  "OPT_OUT",
  "INTERESTED",
  "NOT_INTERESTED",
  "WRONG_PERSON",
  "DEFER",
  "UNKNOWN",
]);

const allowedSignals = new Set<IntentSignal>([
  "IDENTITY_REQUEST",
  "TIMING",
  "PRICE",
  "SELLING",
  "BUYING",
  "LOCATION",
  "FINANCING",
  "URGENCY",
  "ANGER",
]);

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

function cheapRules(text: string): IntentResult | null {
  const t = (text || "").trim().toLowerCase();
  if (!t) return { intent: "UNKNOWN", confidence: 0.5, signals: [] };

  // HARD opt-out variants
  if (
    /\b(stop|unsubscribe|do not text|dont text|remove me|opt out|quit|cancel)\b/.test(t)
  ) {
    return { intent: "OPT_OUT", confidence: 0.98, signals: [] };
  }

  // Wrong person / wrong number
  if (
    /\bwrong number\b/.test(t) ||
    /\bnot (me|mine)\b/.test(t) ||
    /\bwho are you\b/.test(t) ||
    /\bwho is this\b/.test(t)
  ) {
    // "who is this" is identity request; could still be the right person.
    const signals: IntentSignal[] = [];
    if (/\bwho (is this|are you)\b/.test(t)) signals.push("IDENTITY_REQUEST");
    // If they explicitly say wrong number, classify wrong person.
    if (/\bwrong number\b/.test(t) || /\bnot (me|mine)\b/.test(t)) {
      return { intent: "WRONG_PERSON", confidence: 0.95, signals };
    }
    return { intent: "UNKNOWN", confidence: 0.7, signals };
  }

  // Not interested
  if (/\b(not interested|no thanks|no thank you|nope|not looking|leave me alone)\b/.test(t)) {
    return { intent: "NOT_INTERESTED", confidence: 0.9, signals: [] };
  }

  // Defer / timing
  if (/\b(later|not now|busy|next week|next month|in a few|reach out|text me)\b/.test(t)) {
    return { intent: "DEFER", confidence: 0.75, signals: ["TIMING"] };
  }

  return null;
}

export async function classifyInboundIntent(text: string): Promise<IntentResult> {
  const trimmed = (text || "").trim();
  const ruled = cheapRules(trimmed);
  if (ruled) return ruled;

  // If key missing, fail safely
  if (!process.env.OPENAI_API_KEY) {
    return { intent: "UNKNOWN", confidence: 0.5, signals: [] };
  }

  try {
    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        intent: {
          type: "string",
          enum: ["OPT_OUT", "INTERESTED", "NOT_INTERESTED", "WRONG_PERSON", "DEFER", "UNKNOWN"],
        },
        confidence: { type: "number" },
        signals: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "IDENTITY_REQUEST",
              "TIMING",
              "PRICE",
              "SELLING",
              "BUYING",
              "LOCATION",
              "FINANCING",
              "URGENCY",
              "ANGER",
            ],
          },
        },
        summary: { type: "string" },
      },
      required: ["intent", "confidence", "signals"],
    } as const;

    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "inbound_intent",
          schema,
          strict: true,
        },
      },
      messages: [
        {
          role: "system",
          content:
            "Classify an inbound SMS reply to a real-estate follow-up. Output JSON only per schema. Be conservative: use UNKNOWN when unclear.",
        },
        {
          role: "user",
          content: `Inbound SMS:\n"""${trimmed}"""`,
        },
      ],
    });

    const raw = resp.choices[0]?.message?.content?.trim() || "";
    const parsed = JSON.parse(raw) as IntentResult;

    const intent = parsed.intent as IntentLabel;
    const confidence = clamp01(Number(parsed.confidence));
    const signals = Array.isArray(parsed.signals)
      ? parsed.signals.filter((s) => allowedSignals.has(s as IntentSignal))
      : [];

    if (!allowedIntents.has(intent)) {
      return { intent: "UNKNOWN", confidence: 0.5, signals: [] };
    }

    return {
      intent,
      confidence,
      signals,
      summary: typeof parsed.summary === "string" ? parsed.summary.slice(0, 120) : undefined,
    };
  } catch (e) {
    // Safe fallback
    return { intent: "UNKNOWN", confidence: 0.5, signals: [] };
  }
}
