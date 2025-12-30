import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ✅ REQUIRED IN NEXT 16

  const leadId = Number(id);
  if (Number.isNaN(leadId)) {
    return NextResponse.json({ error: "Invalid lead id" }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      inboundMessages: {
        orderBy: { createdAt: "desc" },
      },
      outboundMessages: {
        orderBy: { sentAt: "desc" },
      },
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json(lead);
}
