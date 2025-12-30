import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInitialMessage } from "@/services/messageEngine";

export async function GET() {
  // Create or fetch a test lead
  let lead = await prisma.lead.findFirst({
    where: { phone: "+15550000000" },
  });

  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        firstName: "John",
        phone: "+15550000000",
        state: "NEW",
      },
    });
  }

  const message = await generateInitialMessage({
    leadId: lead.id,
  });

  return NextResponse.json({
    leadId: lead.id,
    message,
  });
}
