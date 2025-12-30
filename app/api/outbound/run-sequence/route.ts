import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/services/sms";
import { acquireSendLock, releaseSendLock } from "@/services/sendLock";
import { decideNextSequenceStep } from "@/services/sequenceEngine";
import { checkSuppression } from "@/services/suppression";

const QUIET_START = 9;
const QUIET_END = 18;

function isQuietHours() {
  const hour = new Date().getHours();
  return hour < QUIET_START || hour >= QUIET_END;
}

export async function POST() {
  if (isQuietHours()) {
    return NextResponse.json({ status: "quiet_hours" });
  }

  const lead = await prisma.lead.findFirst({
    where: {
      state: "CONTACTED",
    },
    orderBy: { createdAt: "asc" },
    include: {
      outboundMessages: {
        orderBy: { sentAt: "desc" },
        take: 1,
      },
      _count: {
        select: { outboundMessages: true },
      },
    },
  });

  if (!lead) {
    return NextResponse.json({ status: "ok", result: "no_leads" });
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

  const lastOutbound = lead.outboundMessages[0]?.sentAt ?? null;

  const decision = decideNextSequenceStep({
    lead,
    outboundCount: lead._count.outboundMessages,
    lastOutboundAt: lastOutbound,
  });

  if (decision.action === "none") {
    return NextResponse.json({
      status: "ok",
      result: decision.reason,
      leadId: lead.id,
    });
  }

  if (decision.action === "stop") {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { state: "STOPPED" },
    });

    return NextResponse.json({
      status: "ok",
      result: "stopped",
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

  try {
    await sendSms({
      to: lead.phone,
      body: decision.body,
    });

    await prisma.outboundMessage.create({
      data: {
        leadId: lead.id,
        body: decision.body,
        reason: decision.reason,
      },
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        lastAttemptAt: new Date(),
        sendLockAt: null,
      },
    });

    return NextResponse.json({
      status: "ok",
      result: "sent",
      step: decision.reason,
      leadId: lead.id,
    });
  } catch (err: any) {
    await releaseSendLock(lead.id);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
