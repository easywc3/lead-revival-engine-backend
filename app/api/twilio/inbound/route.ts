import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classifyInboundIntent } from "@/services/intentClassifier";
import { applyIntentToLead } from "@/services/intentRouter";

/**
 * Twilio inbound SMS webhook
 * MUST NEVER 500
 */
export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const params = new URLSearchParams(raw);

    const from = params.get("From")?.trim();
    const inboundText = params.get("Body")?.trim();

    if (!from || !inboundText) {
      return NextResponse.json({ ok: true });
    }

    const phone = from.startsWith("+") ? from : `+${from}`;

    // Find or create lead
    let lead = await prisma.lead.findUnique({
      where: { phone },
    });

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          phone,
          firstName: "Unknown",
          state: "CONTACTED",
          hasBeenMessaged: false,
          source: "twilio_inbound",
        },
      });
    }

    // Classify intent (AI)
    const intentResult = await classifyInboundIntent(inboundText);

    // Store inbound message
    await prisma.inboundMessage.create({
      data: {
        leadId: lead.id,
        fromPhone: phone,
        body: inboundText,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
      },
    });

    // ✅ PASS intentResult (not intent)
    await applyIntentToLead({
      leadId: lead.id,
      intentResult,
      inboundText,
    });

    return NextResponse.json({
      status: "ok",
      leadId: lead.id,
    });
  } catch (err) {
    console.error("❌ INBOUND HARD FAIL:", err);
    return NextResponse.json({ ok: true });
  }
}
