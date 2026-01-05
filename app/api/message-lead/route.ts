import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInitialMessage } from "@/services/messageEngine";

export async function POST(req: Request) {
  try {
    const { leadId } = await req.json();

    if (!leadId || typeof leadId !== "number") {
      return NextResponse.json(
        { error: "Invalid leadId" },
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

    // ✅ Lead has no intent; initial message always starts UNKNOWN
    const message = await generateInitialMessage({
      leadId: lead.id,
      firstName: lead.firstName,
      intent: "UNKNOWN",
    });

    return NextResponse.json({
      leadId: lead.id,
      message,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to generate message" },
      { status: 500 }
    );
  }
}
