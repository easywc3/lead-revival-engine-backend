import { Lead } from "@prisma/client";

type SequenceDecision =
  | { action: "none"; reason: string }
  | { action: "send"; body: string; reason: string }
  | { action: "stop"; reason: string };

const DAY_MS = 24 * 60 * 60 * 1000;

export function decideNextSequenceStep(params: {
  lead: Lead;
  outboundCount: number;
  lastOutboundAt: Date | null;
  now?: Date;
}): SequenceDecision {
  const { lead, outboundCount, lastOutboundAt } = params;
  const now = params.now ?? new Date();

  if (lead.state === "RESPONDED") {
    return { action: "none", reason: "Lead responded" };
  }

  if (lead.state === "STOPPED") {
    return { action: "none", reason: "Lead stopped" };
  }

  if (!lastOutboundAt) {
    return { action: "none", reason: "No outbound history" };
  }

  const elapsed = now.getTime() - lastOutboundAt.getTime();

  // Step 1 already handled elsewhere (followup route)
  if (outboundCount === 2 && elapsed >= 5 * DAY_MS) {
    return {
      action: "send",
      reason: "final_nudge",
      body:
        "Last check-in — happy to help if now’s a better time. Just reply if you’d like to chat.",
    };
  }

  if (outboundCount >= 3) {
    return { action: "stop", reason: "Sequence complete" };
  }

  return { action: "none", reason: "Not time yet" };
}
