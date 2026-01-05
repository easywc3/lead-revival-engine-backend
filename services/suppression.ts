type LeadState =
  | "NEW"
  | "CONTACTED"
  | "RESPONDED"
  | "STOPPED";

type InboundIntent =
  | "OPT_OUT"
  | "NOT_INTERESTED"
  | "CONFUSED"
  | "SELLER_INTEREST"
  | "BUYER_INTEREST"
  | "DEFER"
  | "INTERESTED"
  | "UNKNOWN"
  | "WRONG_PERSON";

export function checkSuppression(params: {
  leadState: LeadState;
  latestInboundIntent?: InboundIntent | null;
}) {
  if (params.leadState === "STOPPED") {
    return {
      suppressed: true,
      reason: "STOPPED",
    };
  }

  if (!params.latestInboundIntent) {
    return { suppressed: false };
  }

  if (
    params.latestInboundIntent === "OPT_OUT" ||
    params.latestInboundIntent === "WRONG_PERSON"
  ) {
    return {
      suppressed: true,
      reason: params.latestInboundIntent,
    };
  }

  return { suppressed: false };
}
