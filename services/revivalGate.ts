// ❌ DO NOT import LeadState from Prisma
// import { LeadState } from "@prisma/client";

// ✅ Local mirror of LeadState enum
type LeadState =
  | "NEW"
  | "CONTACTED"
  | "RESPONDED"
  | "STOPPED";

const QUIET_START = 9;
const QUIET_END = 18;
const MAX_RETRIES = 3;
const MAX_OUTBOUND_MESSAGES = 3;

export type RevivalDecision =
  | { allowed: true }
  | { allowed: false; reason: string };

function isQuietHours(date: Date = new Date()) {
  const hour = date.getHours();
  return hour < QUIET_START || hour >= QUIET_END;
}

type RevivalGateInput = {
  lead: {
    id: number;
    state: LeadState;
    retryCount: number;
    hasBeenMessaged: boolean;
    outboundMessageCount?: number | null;
  };
  now?: Date;
};

export function checkRevivalEligibility(
  input: RevivalGateInput
): RevivalDecision {
  const { lead, now = new Date() } = input;

  if (lead.state === "RESPONDED") {
    return { allowed: false, reason: "Lead already responded" };
  }

  if (lead.retryCount >= MAX_RETRIES) {
    return { allowed: false, reason: "Retry limit reached" };
  }

  const sentCount = lead.outboundMessageCount ?? 0;
  if (sentCount >= MAX_OUTBOUND_MESSAGES) {
    return { allowed: false, reason: "Max outbound messages reached" };
  }

  if (isQuietHours(now)) {
    return { allowed: false, reason: "Quiet hours" };
  }

  return { allowed: true };
}
