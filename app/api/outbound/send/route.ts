import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/services/sms";
import { checkRevivalEligibility } from "@/services/revivalGate";
import { acquireSendLock, releaseSendLock } from "@/services/sendLock";
import { checkSuppression } from "@/services/suppression";

const QUIET_START = 9;
const QUIET_END = 18;
const MAX_RETRIES = 3;

function isQuietHours() {
  const hour = new Date().getHours();
  return hour < QUIET_START || hour >= QUIET_END;
}

export async function POST() {
  try {
    if (isQuietHours()) {
      return NextResponse.json({ status: "quiet_hours" });
    }

    const lead = await prisma.lead.findFirst({
      where: {
        state: { in: ["NEW", "READY"] },
        retryCount: { lt: MAX_RETRIES },
      },
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { outboundMessages: true } },
      },
    });

    if (!lead) {
      return NextResponse.json({ status: "no_leads" });
    }

    const latestInbound = await prisma.inboundMessage.findFirst({
      where: { leadId: lead.id },
      orderBy: { createdAt: "desc" },
    });

    const suppression = checkSuppression({
      leadState: lead.state,
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
        state: lead.state,
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
      "Hey — just following up. Let me know if you’d like help buying or selling.";

    try {
      await sendSms({ to: lead.phone, body });

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          state: "CONTACTED",
          hasBeenMessaged: true,
          lastAttemptAt: new Date(),
          retryCount: 0,
          lastErrorCode: null,
          lastErrorAt: null,
          sendLockAt: null,
        },
      });

      await prisma.outboundMessage.create({
        data: {
          leadId: lead.id,
          body,
          reason: "initial_outbound",
        },
      });

      return NextResponse.json({
        status: "ok",
        result: { leadId: lead.id, status: "sent" },
      });
    } catch (err) {
      await releaseSendLock(lead.id);
      throw err;
    }
  } catch (err) {
    console.error("Outbound route error:", err);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
