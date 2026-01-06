// app/api/twilio/inbound/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Graceful degradation if AI key is not set
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ status: "ignored" });
    }

    const form = await req.formData();
    const inboundText = String(form.get("Body") ?? "").trim();
    const from = String(form.get("From") ?? "").trim();

    // Ignore malformed inbound requests
    if (!inboundText || !from) {
      return NextResponse.json({ status: "ignored" });
    }

    // Look up the lead by phone number
    const lead = await prisma.lead.findFirst({
      where: { phone: from },
      include: {
        inboundMessages: {
          orderBy: { id: "asc" }
        },
        outboundMessages: {
          orderBy: { id: "asc" }
        }
      }
    });

    if (!lead) {
      return NextResponse.json({ status: "unknown_lead" });
    }

    // Lazy import AI services at runtime
    const { classifyIntentAI } = await import("@/services/aiIntentClassifier");
    const { generateAIReply } = await import("@/services/aiResponder");

    // Classify the intent of the inbound message
    const intentResult = await classifyIntentAI(inboundText);

    // Build the REAL conversation context using the shared builder
    const ctx = await import("@/services/conversationContext").then(mod => {
      return mod.buildConversationContext({
        leadId: lead.id
      });
    });

    // Generate AI reply using the actual context
    const reply = await generateAIReply({
      inboundText,
      intent: intentResult,
      ctx
    });

    if (!reply) {
      return NextResponse.json({ status: "no_reply" });
    }

    // Respond cleanly
    return NextResponse.json({ status: "processed", reply });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
