import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ⛔ DO NOT import OpenAI or getOpenAI here
// ⛔ DO NOT import ai services at top-level

export async function POST(req: Request) {
  try {
    // ✅ Runtime guard (build-safe)
    if (!process.env.OPENAI_API_KEY) {
      console.warn("[twilio inbound] OPENAI_API_KEY missing at runtime");
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
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ status: "unknown_lead" });
    }

    // 🔐 LAZY imports (runtime only)
    const { classifyIntentAI } = await import(
      "@/services/aiIntentClassifier"
    );
    const { generateAIReply } = await import(
      "@/services/aiResponder"
    );

    const intentResult = await classifyIntentAI(inboundText);

    // ✅ Build a FULL ConversationContext (this fixes the error)
    const ctx = {
      leadId: lead.id,
      leadFirstName: lead.firstName,
      leadPhone: lead.phone,
      leadState: lead.state,
      inboundCount: lead.inboundMessages.length + 1,
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

    // OPTIONAL: sendSms here if desired
    // await sendSms({ to: from, body: reply });

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[twilio inbound] error", err);
    return NextResponse.json(
      { status: "error" },
      { status: 500 }
    );
  }
}
