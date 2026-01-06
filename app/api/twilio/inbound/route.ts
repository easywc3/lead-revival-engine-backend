// app/api/twilio/inbound/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // If AI key is missing, gracefully degrade
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
          orderBy: { id: "asc" }   // createdAt not in model
        },
        outboundMessages: {
          orderBy: { id: "asc" }
        }
      }
    });

    // If we can’t find the lead, return cleanly
    if (!lead) {
      return NextResponse.json({ status: "unknown_lead" });
    }

    // Import AI services lazily
    const { classifyIntentAI } = await import("@/services/aiIntentClassifier");
    const { generateAIReply } = await import("@/services/aiResponder");

    // Classify the intent of the inbound message
    const intentResult = await classifyIntentAI(inboundText);

    // Build a FULL ConversationContext object that matches the shared type
    const ctx = await import("@/services/conversationContext").then(mod => {
      return mod.buildConversationContext({
        leadId: lead.id
      });
    });

    // Generate AI reply using the REAL context
    const reply = await generateAIReply({
      inboundText,
      intent: intentResult,
      ctx: {
        leadId: lead.id,
        leadFirstName: lead.firstName ?? "",
        leadPhone: lead.phone,
        leadState: lead.state,
        hasBeenMessaged: lead.hasBeenMessaged,
        stats: {
          inboundCount: ctx.stats.inboundCount,
          outboundCount: ctx.stats.outboundCount
        },
        inboundCount: ctx.stats.inboundCount,
        recentTranscript: ctx.recentTranscript
      }
    });

    // If no reply could be generated, return cleanly
    if (!reply) {
      return NextResponse.json({ status: "no_reply" });
    }

    // Everything succeeded
    return NextResponse.json({ status: "processed", reply });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
