import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const leadId = Number(id);

  if (!id || Number.isNaN(leadId)) {
    return NextResponse.json(
      { status: "invalid_id", received: id },
      { status: 400 }
    );
  }

  // 1️⃣ Clear outbound message history
  await prisma.outboundMessage.deleteMany({
    where: { leadId },
  });

  // 2️⃣ Clear inbound message history
  await prisma.inboundMessage.deleteMany({
    where: { leadId },
  });

  // 3️⃣ Reset lead state
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      state: "NEW",
      hasBeenMessaged: false,
      retryCount: 0,
      lastAttemptAt: null,
      lastErrorCode: null,
      lastErrorAt: null,
      nextAttemptAt: null,
    },
  });

  return NextResponse.json(lead);
}
