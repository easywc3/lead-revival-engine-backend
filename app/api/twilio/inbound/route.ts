// app/api/twilio/inbound/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ status: "ignored" });
    }

    const form = await req.formData();
    const inboundText = String(form.get("Body") ?? "").trim();
    const from = String(form.get("From") ?? "").trim();

    if (!inboundText || !from) {
      return NextResponse.json({ status: "ignored" });
    }

    const lead = await prisma.lead.findFirst({
      where: { phone: from },
      include: {
        inboundMessages: {
          orderBy: { id: "asc" }, // ✅ FIX (createdAt not in model)
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ status: "unknown_lead" });
    }

    const { classifyIntentAI } = await import("@/services/aiIntentClassifier");
    const { generateAIReply } = await import("@/services/aiResponder");

    const intentResult = await classifyIntentAI(inboundText);

    const ctx = {
      leadId: lead.id,
      leadFirstName: lead.firstName ?? "",
      leadPhone: lead.phone,
      leadState: lead.state,
      hasBeenMessaged: lead.hasBeenMessaged,
      inboundCount: lead.inboundMessages.length,
      stats: {},
      recentTranscript: lead.inboundMessages
        .map(m => m.body)
        .slice(-5)
        .join("\n"),
    };

    const reply = await generateAIReply({
      inboundText,
      intent: intentResult,
      ctx,
    });

    if (!reply) {
      return NextResponse.json({ status: "no_reply" });
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
