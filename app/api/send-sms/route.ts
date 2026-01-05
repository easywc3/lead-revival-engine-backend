import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInitialMessage } from "@/services/messageEngine";
import { sendSms } from "@/services/smsService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const leadId = Number(body.leadId);

    if (!leadId) {
      return NextResponse.json(
        { error: "Missing leadId" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // ✅ FIX: intent comes from latest inbound message, not Lead
    const latestInbound = await prisma.inboundMessage.findFirst({
      where: { leadId: lead.id },
      orderBy: { createdAt: "desc" },
    });

    const intent = latestInbound?.intent ?? "UNKNOWN";

    const message = await generateInitialMessage({
      leadId: lead.id,
      firstName: lead.firstName ?? "there",
      intent,
    });

    if (!message) {
      return NextResponse.json(
        { error: "Failed to generate message" },
        { status: 500 }
      );
    }

    await sendSms(lead.phone, message);

    return NextResponse.json({
      status: "sent",
      leadId: lead.id,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
