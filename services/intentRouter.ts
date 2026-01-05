// services/intentRouter.ts

import type {
  IntentResult,
  InboundIntent,
} from "@/services/aiIntentClassifier";

/**
 * Normalizes any legacy intent result into the canonical AI shape.
 * This prevents cross-file type explosions.
 */
function normalizeIntent(intent: any): IntentResult {
  return {
    intent: (intent?.intent ?? "UNKNOWN") as InboundIntent,
    confidence:
      typeof intent?.confidence === "number"
        ? intent.confidence
        : 0,
    reasoning:
      typeof intent?.reasoning === "string"
        ? intent.reasoning
        : "normalized",
  };
}

export function routeIntent(rawIntent: IntentResult | any) {
  const intent = normalizeIntent(rawIntent);

  switch (intent.intent) {
    case "OPT_OUT":
      return {
        action: "stop",
        reason: "opt_out",
      };

    case "NOT_INTERESTED":
      return {
        action: "stop",
        reason: "not_interested",
      };

    case "CONFUSED":
      return {
        action: "clarify",
        reason: "confused_identity",
      };

    case "DEFER":
      return {
        action: "wait",
        reason: "asked_to_defer",
      };

    case "INTERESTED":
    case "BUYER_INTEREST":
    case "SELLER_INTEREST":
      return {
        action: "respond",
        reason: "positive_intent",
      };

    default:
      return {
        action: "ignore",
        reason: "unknown_intent",
      };
  }
}
