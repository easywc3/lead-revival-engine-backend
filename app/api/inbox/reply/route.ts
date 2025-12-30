import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/services/sms";
import { logOutboundMessage } from "@/services/outboundLogger";

export async function POST(req: Request) {
  const { leadId, message } = await req.json();

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead || !lead.phone) {
    return NextResponse.json(
      { error: "Lead not found or missing phone" },
      { status: 404 }
    );
  }

  //1️⃣ Send SMS
  await sendSms({
    to: lead.phone,
    body: message,
  });

  // 2️⃣ Log outbound message (DB schema–safe)
  await logOutboundMessage({
    leadId: lead.id,
    body: message,
    reason: "manual_reply",
  });

  return NextResponse.json({ status: "sent" });
}
