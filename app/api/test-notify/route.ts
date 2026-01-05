import { NextResponse } from "next/server";
import { notifyHuman } from "@/services/notifyHuman";
import { prisma } from "@/lib/prisma";

export async function POST() {
  // Ensure a test lead exists
  let lead = await prisma.lead.findFirst({
    where: { phone: "+18324747380" },
  });

  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        firstName: "Test Lead",
        phone: "+18324747380",
        state: "RESPONDED",
      },
    });
  }

  await notifyHuman({
    leadId: lead.id,
    reason: "TEST_HANDOFF",
    inboundText: "Yes, I'm interested. Can you explain?",
  });

  return NextResponse.json({
    status: "sent",
    leadId: lead.id,
  });
}
