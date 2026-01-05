import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/services/sms";
import { checkRevivalEligibility } from "@/services/revivalGate";
import { acquireSendLock, releaseSendLock } from "@/services/sendLock";
import { checkSuppression } from "@/services/suppression";

/**
 * Domain-level LeadState understood by revival + suppression logic
 * IMPORTANT: does NOT include READY
 */
type DomainLeadState =
  | "NEW"
  | "CONTACTED"
  | "RESPONDED"
  | "STOPPED";

/**
 * Normalize Prisma lead.state → domain-safe state
 */
function normalizeLeadState(state: string): DomainLeadState {
  if (state === "READY") return "CONTACTED";
  return state as DomainLeadState;
}

export async function POST() {
  const leads = await prisma.lead.findMany({
    where: {
      state: "CONTACTED",
      hasBeenMessaged: true,
    },
    orderBy: { createdAt: "asc" },
    take: 1,
    include: {
      _count: { select: { outboundMessages: true } },
    },
  });

  if (leads.length === 0) {
    return NextResponse.json({ status: "ok", result: "no_leads" });
  }

  const lead = leads[0];

  const domainState = normalizeLeadState(lead.state);

  if (lead._count.outboundMessages !== 1) {
    return NextResponse.json({
      status: "blocked",
      reason: "Followup already sent",
      leadId: lead.id,
    });
  }

  const latestInbound = await prisma.inboundMessage.findFirst({
    where: { leadId: lead.id },
    orderBy: { createdAt: "desc" },
  });

  const suppression = checkSuppression({
    leadState: domainState,
    latestInboundIntent: latestInbound?.intent,
  });

  if (suppression.suppressed) {
    return NextResponse.json({
      status: "blocked",
      reason: `Suppressed: ${suppression.reason}`,
      leadId: lead.id,
    });
  }

  const decision = checkRevivalEligibility({
    lead: {
      id: lead.id,
      state: domainState,
      retryCount: lead.retryCount,
      hasBeenMessaged: lead.hasBeenMessaged,
      outboundMessageCount: lead._count.outboundMessages,
    },
  });

  if (!decision.allowed) {
    return NextResponse.json({
      status: "blocked",
      reason: decision.reason,
      leadId: lead.id,
    });
  }

  const locked = await acquireSendLock(lead.id);
  if (!locked) {
    return NextResponse.json({
      status: "blocked",
      reason: "Send already in progress",
      leadId: lead.id,
    });
  }

  const body =
    "Just checking back — want me to send you a couple options or should I circle back later?";

  try {
    await sendSms({ to: lead.phone, body });

    await prisma.outboundMessage.create({
      data: {
        leadId: lead.id,
        body,
        reason: "followup",
      },
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: { sendLockAt: null },
    });

    return NextResponse.json({
      status: "ok",
      result: { leadId: lead.id, status: "sent" },
    });
  } catch (err: any) {
    await releaseSendLock(lead.id);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
