// ❌ DO NOT import from Prisma — this is NOT a Prisma enum
type InboundIntent =
  | "OPT_OUT"
  | "NOT_INTERESTED"
  | "CONFUSED"
  | "SELLER_INTEREST"
  | "BUYER_INTEREST"
  | "DEFER"
  | "INTERESTED"
  | "UNKNOWN";

export type IntentRoute =
  | "SUPPRESS"
  | "CONFUSE_CLARIFY"
  | "SELLER_FLOW"
  | "BUYER_FLOW"
  | "DEFER_FLOW"
  | "UNKNOWN_FLOW";

export function routeIntent(intent: InboundIntent): IntentRoute {
  switch (intent) {
    case "OPT_OUT":
    case "NOT_INTERESTED":
      return "SUPPRESS";

    case "CONFUSED":
      return "CONFUSE_CLARIFY";

    case "SELLER_INTEREST":
      return "SELLER_FLOW";

    case "BUYER_INTEREST":
      return "BUYER_FLOW";

    case "DEFER":
      return "DEFER_FLOW";

    default:
      return "UNKNOWN_FLOW";
  }
}
